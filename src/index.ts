import dotenv from "dotenv";
dotenv.config();


async function main() {
  const { AIDev } = await import("./ai-dev");
  AIDev.init();

  function poll() {
    AIDev.poll()
  }

  poll();
  setInterval(poll, 3000);
}

(async () => await main())();