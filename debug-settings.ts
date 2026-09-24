import { getSettings } from "./src/lib/server/settings.ts";
async function run() {
  const settings = await getSettings();
  console.log("ALL SETTINGS: ", settings);
  const needsSetup = !settings.adminPassword || settings.adminPassword === "admin";
  console.log("needsSetup = ", needsSetup);
}
run();
