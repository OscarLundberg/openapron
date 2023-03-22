import fs from "fs";
import { join, relative } from "path";
import { Issue } from "./contracts/scm";
import { readDirRecursive } from "./helpers/generic";
import Git, { SimpleGit } from "simple-git";
import { Env } from "./env";
import { Completion } from "./contracts/ai";

interface Change {
  newContent: string,
  filename: string
}

/**
 * Class handling git, fs and parsing for a single issue
 */
export class IssueWorker {
  private git: SimpleGit;
  private srcPath: string;
  public featureBranch: string;

  constructor(private issue: Issue, private gitDir: string, private srcDir: string, private cloneUrl: string) {
    this.createGitDir()
    this.git = Git(Env.vars.GIT_BASEDIR);
    this.srcPath = join(gitDir, srcDir);
    this.featureBranch = `feature/${this.issue.id}`;
  }

  /**
   * 
   * @returns a text prompt for openai
   */
  public async getPrompt() {
    const code = await this.checkout();
    const relevantCode = this.filterRelevantFiles(code);
    const codeBlocks = await this.getCodeBlocks(relevantCode);
    return this.populatedTemplate(codeBlocks);
  };

  /**
   * Uses the templates in src/assets/ to create a prompt
   */
  private async populatedTemplate(codeBlocks: string[]) {
    let prompt = await fs.promises.readFile("src/assets/prompt-template.md", "utf-8")
    prompt = prompt.replace(/{{TITLE}}/gm, this.issue.title);
    prompt = prompt.replace(/{{BODY}}/gm, this.issue.body);
    let codePrompt = ""
    if (codeBlocks.length > 0) {
      let template = await fs.promises.readFile("src/assets/code-template.md", "utf-8")
      codePrompt = template.replace(/{{FILES}}/gm, codeBlocks.join("\n\n"));
    }
    prompt = prompt.replace(/{{CODE}}/gm, codePrompt);
    return prompt;
  }

  /**
   * Filters code files that were mentioned in the issue body
   */
  private filterRelevantFiles(code: string[]) {
    return code.filter(file => {
      const relPath = relative(this.srcPath, file)
      return this.issue.body.includes(`\`${relPath}\``);
    });
  }

  /**
   * Reads a list of files 
   */
  private getCodeBlocks(files: string[]) {
    return Promise.all(files.map(async e => await this.getReadableFileContents(e)));
  }

  /**
   * Reads the file and adds backticks and a filename comment in order to be used in an openai prompt
   */
  private async getReadableFileContents(path: string) {
    const contents = await fs.promises.readFile(path, "utf-8");
    const relPath = relative(this.srcPath, path)
    const block = '```\n' + `//${relPath}\n\n` + contents + '\n```';
    return block;
  }

  /**
   * Creates the directories which the repo will be cloned into
   */
  private createGitDir() {
    if (!fs.existsSync(this.gitDir)) {
      fs.mkdirSync(this.gitDir, { recursive: true });
    } else {
      fs.rmSync(this.gitDir, { recursive: true })
      fs.mkdirSync(this.gitDir);
    }
  }

  /**
   * Checks out the remote repository and returns an array of the **included** source code file names 
   */
  private async checkout() {
    await this.git.clone(this.cloneUrl, this.gitDir);
    return readDirRecursive(this.srcPath);
  }

  /**
   * Extracts changes from the openai text response 
   */
  private extractChanges(text: string) {
    const pat = new RegExp(/```.*?((\/\/|<!--|#)\s*([^\s]+)\s*[^```]*?)```/gms);
    const matches = text.matchAll(pat);
    let changes: Change[] = [];
    for (const match of matches) {
      const [, fulltext, lang, filename] = match;
      changes = [...changes, { newContent: fulltext, filename }]
    }
    console.log({changes})
    return changes;
  }

  /**
   * Commits & pushes changes to the remote repository
   */
  private async applyChanges(changes: Change[]) {
    this.git.checkoutLocalBranch(this.featureBranch);
    for (let { filename, newContent } of changes) {
      const relPath = join(this.srcPath, filename);
      await fs.promises.writeFile(relPath, newContent);
      await this.git.add(relPath);
    }
    await this.git.commit(`issue #${this.issue.id} - ${this.issue.title}`);
    await this.git.push("origin", this.featureBranch);
  }

  /**
   * Takes the response from openai, parses file changes and applies them to a new branch in the git repository 
   * @param data response from openai completion
   * @returns the full response from openai
   */
  public async handleResponse({ text }: Completion) {
    if (!text) { throw new Error("AI did not provide a response") };
    const changes = this.extractChanges(text);
    await this.applyChanges(changes);
    return text;
  }
}