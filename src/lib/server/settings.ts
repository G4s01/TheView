import fs from 'fs';
import path from 'path';

const settingsFile = path.resolve('data/settings.json');

export function getSettings() {
    try {
        if (fs.existsSync(settingsFile)) {
            const data = fs.readFileSync(settingsFile, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Failed to read settings', e);
    }
    return {};
}

export function saveSettings(newSettings: Record<string, any>) {
    try {
        const dir = path.dirname(settingsFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const current = getSettings();
        const merged = { ...current, ...newSettings };
        fs.writeFileSync(settingsFile, JSON.stringify(merged, null, 2));
        return merged;
    } catch (e) {
        console.error('Failed to save settings', e);
        return {};
    }
}
