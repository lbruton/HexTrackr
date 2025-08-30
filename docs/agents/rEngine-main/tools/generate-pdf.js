#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [inHtml, outPdf] = process.argv.slice(2);
  if (!inHtml || !outPdf) {
    console.error('Usage: node tools/generate-pdf.js <input.html> <output.pdf>');
    process.exit(1);
  }
  const absIn = path.resolve(inHtml);
  const absOut = path.resolve(outPdf);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + absIn, { waitUntil: 'networkidle' });
  await fs.ensureDir(path.dirname(absOut));
  await page.pdf({ path: absOut, format: 'A4', printBackground: true });
  await browser.close();
  console.log('PDF written:', absOut);
}

main().catch(err => { console.error(err); process.exit(1); });
