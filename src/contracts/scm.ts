import { Repository } from "../generated";

/**
 * SCM user
 */
interface User {
  /**
   * login name / username
   */
  login: string;
}

/**
 * SCM Issue
 */
export interface Issue {
  title: string;
  body: string;
  id: number;
  assignees: Array<User>;
}

/**
 * SCM repository
 */
export interface Repo {
  name: string;
  owner: User;
  clone_url: string;
  default_branch: string;
}

/**
 * Interface for SCM apis, such as Gitea & Github
 */
export interface SCMApi {
  /**
   * get a list of issues for a given repo
   */
  listIssues(repo: Repo): Promise<Issue[]>;
  /**
   * get repository data 
   */
  getRepo(name: string, owner: string): Promise<Repo>
  /**
   * start time tracking / "work started" on an issue
   */
  startWork?(repo: Repo, issue: Issue): Promise<void>

  /**
   * Submits a new pull request
   */
  submitPullRequest(repo: Repo, branch: string, issue: Issue, comment?: string | undefined): Promise<void>;
}

