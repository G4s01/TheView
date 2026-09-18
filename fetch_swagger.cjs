const { Agent, fetch } = require("undici");
const agent = new Agent({ connect: { rejectUnauthorized: false } });
async function run() {
  const loginRes = await fetch("https://dock.g4ss.duckdns.org/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "g4s", password: "3420217171" }),
    dispatcher: agent,
  });
  const cookie = loginRes.headers.get("set-cookie").split(";")[0];
  const res = await fetch("https://dock.g4ss.duckdns.org/api/docs-json", {
    headers: { Cookie: cookie },
    dispatcher: agent,
  });
  const data = await res.json();
  console.log(JSON.stringify(data.paths["/api/containers/{id}/update"], null, 2));
}
run();
