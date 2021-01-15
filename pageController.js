const pageScrapper = require('./pageScraper');
async function scrapeAll(browserInstance, email, password, links) {
  let browser;
  try {
    browser = await browserInstance;
    return await pageScrapper.scraper(browser, email, password, links);
  }
  catch (err) {
    console.log('Failed to resolver browser instance:', err);
  }
}

module.exports = (browserInstance, email, password, links) => scrapeAll(browserInstance, email, password, links)