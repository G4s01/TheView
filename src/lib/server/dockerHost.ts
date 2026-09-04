import { execSync } from 'child_process';
import os from 'os';

let cachedHostIp: string | null = null;

export function getDockerHostIp(): string {
  if (cachedHostIp) return cachedHostIp;
  
  try {
    // In many Linux Docker setups, the default gateway is the host's IP on the bridge network
    const routeOutput = execSync('ip route show default', { encoding: 'utf-8' });
    const match = routeOutput.match(/default via ([\d\.]+)/);
    if (match && match[1]) {
      cachedHostIp = match[1];
      return cachedHostIp;
    }
  } catch (e) {
    // Ignore error if `ip` command is not available
  }
  
  // Fallback to a common Docker bridge IP if not found
  cachedHostIp = '172.17.0.1';
  return cachedHostIp;
}

export function rewriteUrlForDocker(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      // If we are likely inside a container (e.g. Linux and not MacOS/Windows native)
      // Check if we have the /.dockerenv file
      import fs from 'fs';
      if (fs.existsSync('/.dockerenv')) {
        url.hostname = getDockerHostIp();
        return url.toString();
      }
    }
  } catch (e) {
    // Invalid URL, just return it
  }
  return urlStr;
}
