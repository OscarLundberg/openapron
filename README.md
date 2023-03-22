## let ai open a pr on your repo


## Install
- Clone the repo
- Create a .env file with these settings
- Make sure you have a user on your SCM matching SCM_USER_NAME below
- `$ pnpm dev`

#### If using gitea
- Get you swagger.json file from https://{gitea-base-url}/swagger.v1.json and place it in the root of the repo
- `$ pnpm build` 




## Usage
Simply create an issue on your SCM and wait for a PR to open. 
Reference source code files with backticks and with relative paths to your GIT_INCLUDE_DIR, in order for them to be included in the prompt.
Example:

> In order to reference `src/index.js`
> write \`index.js\`
> In order to reference `src/tools/foo.js`
> write \`tools/foo.js\`


### Config

```conf
# required
AI_API_KEY=???                # openai API-key (paid account required)
GIT_BASEDIR=???               # full path to the (temp) directory the repo should be clone into
SCM_API_TOKEN=???             # api-token for your SCM
SCM_REPO_NAME=???             # repository name 
SCM_REPO_OWNER=???            # repository owner username 
SCM_USER_NAME=???             # assignee username to match issues when polling

# optional
AI_MODEL_ID=???               # Required. A list of available models is printed to the console if omitted
STORE=???                     # MEMORY | SQLITE3
SCM=???                       # GITEA | GITLAB | GITHUB (currently only tested with GITEA)
SCM_BASE_URL=???              # SCM base-URL (currently only tested with GITEA)
GIT_INCLUDE_DIR=???           # Path relative to your repository containing source code (Usually /src)
AI=???                        # Only OPENAI is supported for now
MAX_REQUESTS_PER_MINUTE=???   # Limit requests 
```