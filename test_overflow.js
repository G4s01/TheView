const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  // Click edit button on the first card
  const editBtn = await page.$('.lucide-pencil');
  if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(1000);
      const form = await page.$('form');
      const box = await form.boundingBox();
      const parent = await form.evaluateHandle(el => el.closest('.overflow-hidden'));
      const parentBox = await parent.boundingBox();
      console.log('Form box:', box);
      console.log('Parent box (overflow-hidden):', parentBox);
  } else {
      console.log("No edit button found. Maybe Edit Mode is off?");
      // Try enabling edit mode if there's a button
      const unlock = await page.getByText(/Unlock|Modifica|Edit/i);
      // Wait, let's just evaluate the app state
      await page.evaluate(() => {
          // hacky way if we don't know the button
      });
  }
  await browser.close();
})();
