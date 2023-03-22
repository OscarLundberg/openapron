import { Store } from "../contracts/store"

export class MemoryStore<T> implements Store<T> {
  state: Record<string | number, T>
  constructor(label?:string) {
    this.state = {};
  }
  set(id: string | number, value: T): void {
    this.state[id] = value;
  }
  get(id: string): T | null {
    return this.state?.[id] ?? null;
  }
}