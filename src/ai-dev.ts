import { Issue, Repo, SCMApi } from "./contracts/scm";
import { Store } from "./contracts/store";
import { Env } from "./env";
import { IssueWorker } from "./issue-worker";
import { SCMMap } from "./scm";
import { StoreMap } from "./store";
import { AIApi } from "./contracts/ai";
import { resolveVar } from "./helpers/generic";
import { AIMap } from "./ai";
import { RateLimiter } from "./helpers/rate-limiter";

/**
 * Class interfacing with SCM and AI to find new issues, request completions and submit PRs 
 */
export class AIDev {
  static instance: AIDev;
  aiApi: AIApi;
  scm: SCMApi;
  issueStore!: Store<Issue>
  repo!: Repo;
  rateLimiter: RateLimiter;
  private blocked: boolean = false;
  private constructor() {
    AIDev.instance = this;
    this.scm = resolveVar(Env.vars.SCM, SCMMap);
    this.issueStore = resolveVar(Env.vars.STORE, StoreMap);
    this.aiApi = resolveVar(Env.vars.AI, AIMap);
    this.rateLimiter = new RateLimiter();
  }

  async loadRepo() {
    if (this.repo == null) {
      this.repo = await this.scm.getRepo(Env.vars.SCM_REPO_NAME, Env.vars.SCM_REPO_OWNER)
    }
  }

  async poll() {
    if (this.blocked) { return; }
    console.log("Polling...");
    await this.loadRepo();
    const issues = await this.scm.listIssues(this.repo);
    for (let issue of issues) {
      if (issue.assignees.some(e => e.login == Env.vars.SCM_USER_NAME)) {
        if (!await this.issueStore.get(issue.id)) {
          this.onNewIssueAssigned(issue);
        }
      }
    }
  }

  async onNewIssueAssigned(issue: Issue) {
    console.log("New issue found...")
    this.blocked = true;
    await this.scm.startWork?.(this.repo, issue)

    const worker = new IssueWorker(issue, Env.vars.GIT_BASEDIR, Env.vars.GIT_INCLUDE_DIR, this.repo.clone_url);

    const prompt = await worker.getPrompt();

    const response = await this.rateLimiter.request(() =>
      this.aiApi.createCompletion({ id: Env.vars.AI_MODEL_ID }, prompt)
    );

    const comment = await worker.handleResponse(response);

    await this.scm.submitPullRequest(this.repo, worker.featureBranch, issue, comment);
    await this.issueStore.set(issue.id, issue);
    this.blocked = false;
  }

  static async poll() {
    return AIDev.instance.poll()
  }

  static init() {
    return new AIDev();
  }
}


