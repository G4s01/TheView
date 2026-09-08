import { Agent, fetch as undiciFetch } from 'undici';
async function run() {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 3000);
  try {
    const agent = new Agent({ connect: { rejectUnauthorized: false } });
    const res = await undiciFetch("https://example.com", {
      method: "HEAD",
      signal: controller.signal,
      dispatcher: agent
    });
    console.log("Status:", res.status);
  } catch (e) {
    console.error("Error:", e.message, e.cause);
  } finally {
    clearTimeout(id);
  }
}
run();
