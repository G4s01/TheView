import fs from "fs";
import { execSync } from "child_process";

let cachedHostIp: string | null = null;

export function getDockerHostIp(): string {
  if (cachedHostIp) return cachedHostIp;
  
  try {
    const routeOutput = execSync('ip route show default', { encoding: 'utf-8' });
    const match = routeOutput.match(/default via ([\d\.]+)/);
    if (match && match[1]) {
      cachedHostIp = match[1];
      return cachedHostIp;
    }
  } catch (e) {
    // Ignore error
  }
  
  cachedHostIp = '172.17.0.1';
  return cachedHostIp;
}

export function rewriteUrlForDocker(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      if (fs.existsSync('/.dockerenv')) {
        url.hostname = getDockerHostIp();
        return url.toString();
      }
    }
  } catch (e) {
    // Invalid URL
  }
  return urlStr;
}
