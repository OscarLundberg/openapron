/**
 * Basic store interface to simplify adding persistant storage
 */
export interface Store<T> {
  get(id: string | number): (T | null) | Promise<T | null>;
  set(id: string | number, value: T): void | Promise<void>;
}