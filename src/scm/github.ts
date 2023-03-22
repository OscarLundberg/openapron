import { Issue, Repo, SCMApi } from "../contracts/scm";
import { Octokit } from "@octokit/rest";

/**
 * Implementation of the GitHub API
 */
export class GitHub implements SCMApi {
  private api: Octokit
  constructor(baseUrl: string, auth: string) {
    this.api = new Octokit({
      baseUrl,
      auth
    });
  }

  async listIssues(repo: Repo): Promise<Issue[]> {
    const issues = await this.api.issues.listForRepo({ owner: repo.owner.login, repo: repo.name })
    return issues.data.map(issue => {
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
    const { data: repo } = await this.api.repos.get({ owner, repo: name });
    if (!repo?.clone_url) { throw new Error("Missing clone url in repo"); }
    return {
      clone_url: repo.clone_url,
      name: repo?.name ?? name,
      owner: { login: owner },
      default_branch: repo?.default_branch ?? "develop"
    }
  }

  async submitPullRequest(repo: Repo, branch: string, issue: Issue, comment?: string | undefined): Promise<void> {
    await this.api.pulls.create({
      base:repo.default_branch,
      head: branch,
      title: `Pull request for issue ${issue.id}`,
      body: comment + `\n\nLinked Issue: #${issue.id}`,
      owner: repo.owner.login,
      repo: repo.name,
      issue: issue.id
    })
  }
}