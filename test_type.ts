import { fetch as undiciFetch, Agent } from 'undici';
async function test() {
  const agent = new Agent();
  const res = await undiciFetch('http://example.com', { dispatcher: agent });
  const data = await res.json();
}
