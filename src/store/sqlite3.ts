import { Store } from "../contracts/store"
import { Database } from "sqlite3";
export class Sqlite3Store<T> implements Store<T> {
  static db: Database;
  private label: string;
  private init: boolean;
  constructor(label: string) {
    if (!Sqlite3Store.db) {
      Sqlite3Store.db = new Database(`tmp/data.db`)
    }
    this.label = label;
    this.init = false
  }

  async set(id: string | number, value: T) {
    const query = `
      INSERT OR REPLACE INTO ${this.label} (id, json)
      VALUES (?, ?)
    `;

    const jsonData = JSON.stringify(value);
    await this.queryAsync(query, [`${id}`, jsonData])
  }

  async get(id: string | number) {
    const query = `
      SELECT json FROM ${this.label}
      WHERE id = ?
    `;

    try {
      const row = await this.queryAsync<{ json: string }>(query, [`${id}`])
      return JSON.parse(row.json) as T;
    } catch (err) {
      return null;
    }
  }

  async createTable(label: string) {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${label} (
        id INTEGER PRIMARY KEY,
        json TEXT
      )
    `;
    await this.execAsync(createTableQuery)
  }

  async assertInitialized() {
    if (!this.init) { await this.createTable(this.label); }
  }

  private execAsync(arg: string) {
    return new Promise<void>((resolve, reject) => {
      Sqlite3Store.db.exec(arg, (err) => {
        if (err) { reject(err); }
        else { resolve() }
      });
    })
  }

  private async queryAsync<T>(query: string, arg: string[]) {
    await this.assertInitialized();
    return new Promise<T>((resolve, reject) => {
      Sqlite3Store.db.get(query, arg, (err, row) => {
        if (err) { reject(err); }
        else { resolve(row as T) }
      });
    })
  }
}