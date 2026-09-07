const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  // click "Unlock" or similar to enter edit mode
  await page.evaluate(() => {
    // try to find a lock icon or edit button
  });
  
  // Try to click edit on a service card
  const editBtns = await page.$$('.lucide-pencil');
  if (editBtns.length > 0) {
      await editBtns[0].click();
      await page.waitForTimeout(500);
      const box = await page.evaluate(() => {
          const form = document.querySelector('form');
          return form ? form.getBoundingClientRect() : null;
      });
      console.log('Form box:', box);
  } else {
      console.log("No pencil icons. Entering edit mode...");
      // find the unlock button in the header
      const headerBtns = await page.$$('button');
      for (const btn of headerBtns) {
          const title = await btn.getAttribute('title');
          if (title && title.toLowerCase().includes('sblocca')) {
              await btn.click();
              await page.waitForTimeout(500);
              break;
          }
      }
      const editBtns2 = await page.$$('.lucide-pencil');
      if (editBtns2.length > 0) {
          await editBtns2[0].click();
          await page.waitForTimeout(500);
          const formBox = await page.evaluate(() => {
              const form = document.querySelector('form');
              const parent = form.closest('.overflow-hidden');
              return { form: form.getBoundingClientRect(), parent: parent ? parent.getBoundingClientRect() : null };
          });
          console.log('Boxes:', formBox);
      }
  }
  
  await browser.close();
})();
