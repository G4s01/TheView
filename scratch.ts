import { saveSettings, getSettings } from "./src/lib/server/settings";
import { hashPassword } from "./src/lib/server/crypto";

async function run() {
  const newSettings = { adminPassword: hashPassword("newpassword") };
  console.log("Saving new settings", newSettings);
  await saveSettings(newSettings);
  
  const current = await getSettings();
  console.log("Current adminPassword in settings:", current.adminPassword);
}

run();
