import { Agent } from 'undici';
async function run() {
  try {
    const agent = new Agent({ connect: { rejectUnauthorized: false } });
    const res = await fetch("https://example.com", {
      dispatcher: agent
    });
    console.log("Status:", res.status);
  } catch (e) {
    console.error("Error:", e.message, e.cause);
  }
}
run();
