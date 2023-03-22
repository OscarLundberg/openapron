export class Env {
  private static requiredVars = {
    AI_API_KEY: "",
    GIT_BASEDIR: "",
    SCM_API_TOKEN: "",
    SCM_REPO_NAME: "",
    SCM_REPO_OWNER: "",
    SCM_USER_NAME: "",
  }

  private static optionalVars = {
    AI_MODEL_ID: "",
    STORE: "MEMORY",
    SCM: "GITHUB",
    SCM_BASE_URL: "https://github.com",
    GIT_INCLUDE_DIR: "/src",
    AI: "OPENAI",
    MAX_REQUESTS_PER_MINUTE: "5"
  }

  static instance: Env;
  static env() {
    if (!this.assertEnv(process.env)) { process.exit(1) }
    return { ...this.optionalVars, ...process.env } as EnvVars;
  }

  static get vars() {
    return Env.env();
  }

  static assertEnv(env: Record<string, any>): env is EnvVars {
    Object.keys(this.requiredVars).forEach(e => {
      if (!env?.[e]) { throw new Error(`Missing environment variable ${e}`) }
    })
    return true;
  }
}

type EnvVars = typeof Env["requiredVars"] & typeof Env["optionalVars"];
