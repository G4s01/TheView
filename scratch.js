async function testGHCR() {
  const repo = "linuxserver/radarr";
  const tag = "latest";
  
  const tokenRes = await fetch(`https://ghcr.io/token?scope=repository:${repo}:pull`);
  const tokenData = await tokenRes.json();
  console.log("GHCR Token ok");
  
  const manifestRes = await fetch(`https://ghcr.io/v2/${repo}/manifests/${tag}`, {
    headers: {
      Authorization: `Bearer ${tokenData.token}`,
      Accept: "application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.index.v1+json"
    }
  });
  console.log("GHCR Digest:", manifestRes.headers.get("docker-content-digest"));
}

async function testDH() {
  const repo = "linuxserver/radarr";
  const tag = "latest";
  
  const tokenRes = await fetch(`https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repo}:pull`);
  const tokenData = await tokenRes.json();
  console.log("DH Token ok");
  
  const manifestRes = await fetch(`https://registry-1.docker.io/v2/${repo}/manifests/${tag}`, {
    headers: {
      Authorization: `Bearer ${tokenData.token}`,
      Accept: "application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.index.v1+json"
    }
  });
  console.log("DH Digest:", manifestRes.headers.get("docker-content-digest"));
}

testDH();
testGHCR();
