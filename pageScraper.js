const scraperObject = {
  async scraper(browser, email, password, links) {
    const sets = [];
    console.log('Entrando a la web');
    const page = await openWeb(browser, 'https://class.mimir.io/assignments/d7fc6d5c-e280-45fd-a1b0-acfed8a7eeb2/edit');
    await login(page, email, password);
    await page.waitForSelector('.ace_content');
    page.close();
    for (const link of links) {
      console.log(`Scraping new set`);
      const exercises = await scrapSet(browser, link[0]);
      sets.push(exercises);
    }
    return sets;
  }
};

async function scrapSet(browser, link) {
  const page = await openWeb(browser, link);
  const exercises = [];
  const exercisesDivs = await getExercises(page);
  // FOR TESTING
  // exercisesDivs = [exercisesDivs[0]];
  let n = 0;
  for (const exerciseDiv of exercisesDivs) {
    console.log(`Scraping exercise ${n}`);
    const exerciseInfo = await getExerciseInfo(exerciseDiv, n);
    const codes = await getCodes(page, exerciseDiv);
    const testCases = await getTestCases(browser, exerciseDiv);
    exercises.push({
      exerciseInfo,
      codes,
      testCases
    });
    n++;
  }
  page.close();
  return exercises;
}

async function openWeb(browser, url) {
  const page = await browser.newPage();
  await page.goto(url);
  return page
};

async function login(page, email, password) {
  await page.waitForSelector('#LoginForm--emailInput');
  // Insert client data
  await page.type('#LoginForm--emailInput', email);
  await page.type('#LoginForm--passwordInput', password);
  await page.click('#LoginForm--submitButton')
};

async function getExercises(page) {
  await page.waitForSelector('.edit-question');
  exercisesDivs = await page.$$('.edit-question');
  return exercisesDivs;
};

async function getExerciseInfo(exerciseDiv, n) {
  const titleDiv = await exerciseDiv.$(`.question-prompt-${n}`);
  let title = await titleDiv.getProperty('value');
  title = await title.jsonValue();
  const descriptionDiv = await exerciseDiv.$('.mimir-description');
  const descriptionProperty = await descriptionDiv.getProperty('innerHTML');
  const statement = await descriptionProperty.jsonValue();
  return {
    title,
    statement
  }
};

async function getCodes(page, exerciseDiv) {
  const buttons = await exerciseDiv.$$('button');
  console.log(buttons.length);
  await buttons[2].click();
  await buttons[11].click();
  await buttons[20].click();
  await page.waitForSelector('.ace_content');
  const contents = await exerciseDiv.$$('.ace_content');
  // console.log(contents.length);
  page.waitForTimeout(1000);
  const solutionCode = await extractCode(page, contents[0]);
  const initialCode = await extractCode(page, contents[1]);
  // console.log(solutionCode);
  // console.log(intialCode);
  return {
    solutionCode,
    initialCode
  };
};

async function extractCode(page, solutionDiv) {
  let solution = [];
  const linesDivs = await solutionDiv.$$('.ace_line');
  for (const lineDiv of linesDivs) {
    const spans= await lineDiv.$$('span');
    let line = [];
    await page.waitForTimeout(100);
    for (const span of spans) {
      let textElement = await span.getProperty('innerText');
      rawText = await textElement.jsonValue();
      line.push(rawText);
    }
    solution.push(line.join(' '));
  };
  return solution.join('\n');
};

async function getTestCases(browser, exerciseDiv) {
  const testCases = [];
  const table = await exerciseDiv.$('table');
  const anchors = await table.$$('a');
  const links = await getHrefs(anchors);

  links.shift();
  // links.pop(); when last TC is the last
  for (const link of links) {
    const newPage = await openWeb(browser, link);
    const testCase = await getTestCaseContent(newPage);
    newPage.close();
    testCases.push(testCase);
  }
  return testCases;
}

// Works with anchors from $$
async function getHrefs(anchors) {
  const propertyJsHandles = await Promise.all(
    anchors.map(handle => handle.getProperty('href'))
  );
  const hrefs2 = await Promise.all(
    propertyJsHandles.map(handle => handle.jsonValue())
  );
  return hrefs2
}

async function getTestCaseContent(page) {
  await page.waitForSelector('#TestCaseForm--testCasePanel');
  const mainDiv = await page.$('#TestCaseForm--testCasePanel');
  await page.waitForSelector('h2');
  const testcaseName = await getInnerText(await mainDiv.$('h2'));
  await page.waitForSelector('.ace_content');
  const divs = await page.$$('.ace_content');
  await page.waitForSelector('.ace_line');
  const inputLines = await readAceContent(divs[0]);
  const outputLines = await readAceContent(divs[1]);
  return {
    testcaseName,
    'input': inputLines,
    'output': outputLines
  };
}

async function readAceContent(div) {
  const lines = [];
  const inputLines = await div.$$('.ace_line');
  for (const inputLine of inputLines) {
    rawText = await getInnerText(inputLine);
    lines.push(rawText);
  }
  return lines.join('\n');
}

async function getInnerText(object) {
  let textElement = await object.getProperty('innerText');
  rawText = await textElement.jsonValue();
  return rawText;
}

module.exports = scraperObject;
