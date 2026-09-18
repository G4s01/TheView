import { Agent, fetch } from "undici";
const agent = new Agent({ connect: { rejectUnauthorized: false } });
async function run() {
  const loginRes = await fetch("https://dock.g4ss.duckdns.org/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "g4s", password: "3420217171" }),
    dispatcher: agent,
  });
  const cookie = loginRes.headers.get("set-cookie").split(";")[0];
  
  const envRes = await fetch("https://dock.g4ss.duckdns.org/api/environments", { headers: { Cookie: cookie }, dispatcher: agent });
  const envId = (await envRes.json())[0].id;

  // Let's trigger a check-updates first
  const res = await fetch(`https://dock.g4ss.duckdns.org/api/containers/check-updates?env=${envId}`, { method: "POST", headers: { Cookie: cookie }, dispatcher: agent });
  const updates = await res.json();
  console.log(JSON.stringify(updates, null, 2));
}
run();
