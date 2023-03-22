import { Env } from "../env";
import { OpenAI } from "./openai";

export const AIMap = {
  "OPENAI": new OpenAI(Env.vars.AI_API_KEY)
}