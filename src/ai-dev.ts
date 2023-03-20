import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import inquirer from "inquirer";
dotenv.config();


export class AIDev {

  static instance: AIDev;
  config: Configuration;
  api: OpenAIApi;
  private constructor() {
    AIDev.instance = this;
    this.config = new Configuration({ accessToken: process.env.OPENAI_API_KEY });
    this.api = new OpenAIApi(this.config);
  }

  createIssue(text: string, ...filesToInclude: string[]) {

  }

  private createPrompt() { };

  public static async cli() {
    inquirer.prompt([
      { type: "input", message: "What is the issue?" },
      { type: "list", choices: [] }
    ]).then(data => {
      console.log({ data })
    })
  }


  static init(){
    return new AIDev();
  }
}


