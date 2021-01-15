const browserObject = require('./browser');
const scraperController = require('./pageController');
const keys = require('./keys');
const fs = require('fs'); 
const path = require('path'); 

async function main() {
  const sets = [
    // ['https://class.mimir.io/assignments/d7fc6d5c-e280-45fd-a1b0-acfed8a7eeb2/edit', 'Set 1 - Variables y expresiones'],
    // ['https://class.mimir.io/assignments/30d4a571-b597-4dbe-b8d3-f838fdf82d53/edit', 'Set 2 - Condiciones y alternativas'],
    // ['https://class.mimir.io/assignments/2d90a855-864e-40c2-9bf5-e3ee25d81359/edit', 'Set 3 - Control de flujo: Iteraciones'],
    // ['https://class.mimir.io/assignments/cbc6f25b-041a-46ad-a3fa-5752d1bc01a1/edit', 'Set 4 - Funciones'],
    // ['https://class.mimir.io/assignments/ad48345d-83ca-45bc-94a5-bbfba521e81b/edit', 'Set 5 - Repaso I1'],
    // ['https://class.mimir.io/assignments/9ebeb6fb-2854-4a7d-b8ac-379e74e87004/edit', 'Set 6 - Strings'],
    // ['https://class.mimir.io/assignments/e7f9ec69-2e20-4e1d-a009-2da3ee39bac3/edit', 'Set 7 - Listas: Listas simples'],
    // ['https://class.mimir.io/assignments/0a9db307-16ab-4645-ac88-92b08aa4ec3a/edit', 'Set 8 - Listas: Listas de listas'],
    // ['https://class.mimir.io/assignments/2d064cd3-b57e-4da4-8d36-6ce649132335/edit', 'Set 9 - Archivos'],
    // ['https://class.mimir.io/assignments/0e3b6487-83c9-4882-9e42-e0516036af81/edit', 'Set 10 - Repaso I2'],
    // ['https://class.mimir.io/assignments/66387657-e1c7-481d-8d93-24d8b66b6389/edit', 'Set 11 - POO I'],
    // ['https://class.mimir.io/assignments/c594e2dd-3a5f-47a0-85a3-8b57a1f140bf/edit', 'Set 12 - POO II'],
    // ['https://class.mimir.io/assignments/e9336435-4df7-4758-921e-b53ee1b4dae0/edit', 'Set 13 - Ordenamiento'],
    ['https://class.mimir.io/assignments/a283e4dd-b880-4fb2-930a-fa46f2701dae/edit', 'Set 14 - Repaso examennn']
  ];
  let browserInstance = browserObject.startBrowser();
  const setsDic = await scraperController(browserInstance, keys.email, keys.password, sets);
  let n_set = 0;
  for (const set of setsDic) {
    const setName = sets[n_set][1];
    await createDir(`/${setName}`);
    for (const exercise of set) {
      const exerciseInfo = exercise.exerciseInfo
      const exerciseCodes = exercise.codes
      await createDir(`/${setName}/${exerciseInfo.title}`);
      // await new Promise(r => setTimeout(r, 2000));
      await writeTxt(`./${setName}/${exerciseInfo.title}/statement.txt`, exerciseInfo.statement);
      await writeTxt(`./${setName}/${exerciseInfo.title}/solutionCode.txt`, exerciseCodes.solutionCode);
      await writeTxt(`./${setName}/${exerciseInfo.title}/initialCode.txt`, exerciseCodes.initialCode);
      await createDir(`/${setName}/${exerciseInfo.title}/testCases`);
      // await new Promise(r => setTimeout(r, 2000));
      for (const testCase of exercise.testCases) {
        await createDir(`/${setName}/${exerciseInfo.title}/testCases/${testCase.testcaseName}`);
        // await new Promise(r => setTimeout(r, 2000));
        await writeTxt(`./${setName}/${exerciseInfo.title}/testCases/${testCase.testcaseName}/input.txt`, testCase.input);
        await writeTxt(`./${setName}/${exerciseInfo.title}/testCases/${testCase.testcaseName}/output.txt`, testCase.output);
      }
    }
    n_set++;
  }

}

async function createDir(pathStr) {
  fs.mkdirSync(path.join(__dirname, pathStr), (err) => { 
    if (err) { 
        return console.error(err); 
    } 
    console.log('Directory created successfully!');  
  })}; 

async function writeTxt(filePath, content) {
  fs.writeFile(filePath, content, err => {
    if (err) throw err;
    console.log('File successfully written');
  }) 
};


main();
