import puppeteer, { ElementHandle} from 'puppeteer';
import { map, pipe, filter, toArray, toAsync } from '@fxts/core';

type ValidHeaderTuple = [ElementHandle<HTMLTableElement>, string[]];
const filterValidHeader = ([, content]: ValidHeaderTuple): boolean => content.join('') === '필드타입필수값설명형식';

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto('https://partner-promotion-api.dev.kurly.services/docs/index.html');
  await page.waitForSelector('.sect2 > table');
  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });
  const tableElements = await page.$$('.sect2 > table');

  // [ '필드', '타입', '필수값', '설명', '형식' ] 규칙을 따르는 테이블만 추출 대상
  // 필드타입필수값설명형식
  const header = await pipe(
    tableElements,
    toAsync,
    map(async (tableElement) => {
      const headerRowElement = await tableElement.$('tbody > tr');
      if (!headerRowElement) {
        return null;
      }
      const tableCells = await headerRowElement.$$('td');
      const headerRow = await pipe(
          tableCells,
          toAsync,
          map(async (cell) => {
            return await cell.evaluate((el) => (el.textContent || '').trim());
          }),
          toArray,
      );
      return [tableElement, headerRow] as ValidHeaderTuple;
    }),
    filter(filterValidHeader),
    map(() => {

    })
    toArray,
  );

  console.log('debug header');
  console.log(header);

  /*
  tableElements.map((tableElement) => {
    // TODO: Extract Header Rows
    const headerRow = await tableElement.$$('tbody > tr');

    // TODO: Extract Body Rows

    // TODO: Generate JSON from table text
  });
   */

  // Print the full title

  await browser.close();
})();
