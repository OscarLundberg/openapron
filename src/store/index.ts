import { Issue } from "../contracts/scm";
import { Store } from "../contracts/store";
import { MemoryStore } from "./memory-store";
import { Sqlite3Store } from "./sqlite3";

export const StoreMap: Record<string, Store<Issue>> = {
  "MEMORY": new MemoryStore<Issue>(),
  "SQLITE3": new Sqlite3Store<Issue>("issues")
}