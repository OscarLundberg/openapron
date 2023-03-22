import { Env } from "../env";

export class RateLimiter {
  requestHistory: number[];
  rate: number;
  constructor() {
    this.rate = parseInt(Env.vars.MAX_REQUESTS_PER_MINUTE ?? 5);
    this.requestHistory = [];
  }

  async request<T>(fn: () => Promise<T>) {
    this.requestHistory = this.requestHistory.slice(-this.rate);
    this.requestHistory = this.requestHistory.filter(e => e > (Date.now() - 60000));
    if (this.requestHistory?.length >= this.rate) {
      const oldest = this.requestHistory[0];
      const duration = 60000 - (Date.now() - oldest);
      await this.sleep(duration);
    }

    const res = await fn();

    this.requestHistory = [...this.requestHistory, Date.now()];
    return res;
  }

  async sleep(n: number) {
    console.info(`Request Rate Exceeded, waiting ${n / 1000} seconds`);
    return new Promise<void>(res => {
      setTimeout(res, n);
    });
  }
}