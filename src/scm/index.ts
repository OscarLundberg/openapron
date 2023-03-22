import { SCMApi } from "../contracts/scm";
import { Env } from "../env";
import { Gitea } from "./gitea";
import { GitHub } from "./github";
import { Gitlab } from "./gitlab";

export const SCMMap:Record<string, SCMApi> = {
  "GITEA": new Gitea(Env.vars.SCM_BASE_URL, Env.vars.SCM_API_TOKEN),
  "GITHUB": new GitHub(Env.vars.SCM_BASE_URL, Env.vars.SCM_API_TOKEN),
  "GITLAB": new Gitlab(Env.vars.SCM_BASE_URL, Env.vars.SCM_API_TOKEN)
}