import { Issue, Repo, SCMApi } from "../contracts/scm";
import { GiteaApi } from "../generated";

/**
 * Implementation of the Gitea API
 */
export class Gitea implements SCMApi {
  private api: GiteaApi
  constructor(BASE: string, TOKEN: string) {
    this.api = new GiteaApi({
      BASE,
      TOKEN
    });
  }

  async listIssues(repo: Repo): Promise<Issue[]> {
    const issues = await this.api.issue.issueListIssues(repo.owner.login, repo.name);
    return issues.map(issue => {
      if (!issue?.id || !issue?.body) { return null; }
      return {
        assignees: issue?.assignees ?? [],
        title: issue?.title ?? "",
        body: issue.body ?? "",
        id: issue.number ?? -1
      }
    }).filter(e => e) as Issue[];
  }

  async getRepo(name: string, owner: string): Promise<Repo> {
    const repo = await this.api.repository.repoGet(owner, name);
    if (!repo?.clone_url) { throw new Error("Missing clone url in repo"); }
    return {
      clone_url: repo.clone_url,
      name: repo?.name ?? name,
      owner: { login: owner },
      default_branch: repo?.default_branch ?? "develop"
    }
  }

  async startWork(repo: Repo, issue: Issue): Promise<void> {
    try {
      await this.api.issue.issueStartStopWatch(repo.owner.login, repo.name, issue.id);
    } catch (err) {
      console.log("Could not start stopwatch");
    }
  }

  async submitPullRequest(repo: Repo, branch: string, issue: Issue, comment?: string | undefined): Promise<void> {
    await this.api.repository.repoCreatePullRequest(repo.owner.login, repo.name, {
      base: repo.default_branch,
      head: branch,
      title: `Pull request for issue ${issue.id}`,
      body: comment + `\n\nLinked Issue: #${issue.id}`
    })
  }
}