import { Issue, Repo, SCMApi } from "../contracts/scm";
import { Gitlab as GitlabApi, Types } from "@gitbeaker/node";

/**
 * Implementation of the Gitlab API
 */
export class Gitlab implements SCMApi {
  private api: InstanceType<typeof GitlabApi>
  constructor(host: string, token: string) {
    this.api = new GitlabApi({
      host,
      token
    });
  }

  async listIssues(repo: Repo): Promise<Issue[]> {
    const issues = await this.api.Issues.all({ projectId: repo.name });
    return issues.map(_issue => {
      let issue: Types.IssueSchema = _issue as unknown as Types.IssueSchema;
      if (!issue.id || !issue?.description) { return null; }
      return {
        assignees: (issue?.assignees ?? []).map(e => ({ login: e.username })),
        title: issue?.title ?? "",
        body: issue.description ?? "",
        id: issue.id ?? -1
      }
    }).filter(e => e) as Issue[];
  }

  async getRepo(name: string, owner: string): Promise<Repo> {
    const repo = await this.api.Projects.show(name);

    return {
      clone_url: repo.http_url_to_repo,
      name: repo?.name ?? name,
      owner: { login: owner },
      default_branch: repo?.default_branch ?? "develop"
    }
  }

  async submitPullRequest(repo: Repo, branch: string, issue: Issue, comment?: string | undefined): Promise<void> {
    await this.api.MergeRequests.create(repo.name, branch, repo.default_branch, `Merge request for issue ${issue.id}`, {
      description: comment + `\n\nLinked Issue: #${issue.id}`,
    })
  }
}