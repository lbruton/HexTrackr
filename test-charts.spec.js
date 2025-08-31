const { test, expect } = require("@playwright/test");

test("Chart.js loads properly on vulnerabilities page", async ({ page }) => {
  await page.goto("http://localhost:8080/vulnerabilities.html");
  
  // Wait for the page to fully load
  await page.waitForLoadState("networkidle");
  
  // Check if Chart.js is loaded
  const chartExists = await page.evaluate(() => {
    return typeof window.Chart !== "undefined";
  });
  
  console.log("Chart.js loaded:", chartExists);
  expect(chartExists).toBe(true);
  
  // Check if the script tag exists
  const scriptExists = await page.locator("script[src=\"scripts/chart.min.js\"]").count() > 0;
  console.log("Chart script tag exists:", scriptExists);
  expect(scriptExists).toBe(true);
});
