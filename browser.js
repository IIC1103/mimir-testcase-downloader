const puppeteer = require('puppeteer');

async function startBrowser() {
  let browser;
  try {
    console.log('Opening the browser');
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox']
    });
  } catch (err) {
    console.log('Cant create a browser instance:', err);
  }
  return browser;
}

module.exports = {
  startBrowser
};