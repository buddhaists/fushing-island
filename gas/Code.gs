/**
 * 福星龍浮空島：拜訪人數計數器（Google Apps Script，綁定一份 Google 試算表）
 *
 * 網站每次載入呼叫一次：
 *   GET <網址>?hit=1   這台裝置今天第一次來，今天人次加 1，回傳最新數字
 *   GET <網址>         只讀數字，不加
 * 回傳：{"today": 今天人次, "total": 累計人次, "date": "2026-11-14"}
 *
 * 試算表「拜訪人數」工作表：A 欄日期、B 欄當天人次，每天一列；累計人次 = B 欄加總。
 * 只記數字，不記任何個人資料（不記 IP、裝置或姓名）。
 */
const TZ = 'Asia/Taipei';
const SHEET = '拜訪人數';

function doGet(e) {
  const hit = e && e.parameter && e.parameter.hit === '1';
  const lock = LockService.getScriptLock();
  lock.waitLock(8000); // 同時很多人進來時排隊，數字才不會互相蓋掉
  try {
    const sh = sheet_();
    const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
    let last = sh.getLastRow();
    let row = last >= 2 && String(sh.getRange(last, 1).getDisplayValue()) === today ? last : 0;
    if (!row) {
      sh.appendRow(["'" + today, 0]); // 前面加 ' 讓日期存成文字，比對才不會受格式影響
      row = sh.getLastRow();
      last = row;
    }
    const cell = sh.getRange(row, 2);
    if (hit) cell.setValue(Number(cell.getValue() || 0) + 1);
    const todayCount = Number(cell.getValue() || 0);
    const total = sh.getRange(2, 2, last - 1, 1).getValues().reduce((s, r) => s + Number(r[0] || 0), 0);
    return json_({ today: todayCount, total: total, date: today });
  } finally {
    lock.releaseLock();
  }
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(['日期', '人次']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 在編輯器裡選這個函式按「執行」，可以先測試並授權
function test() {
  Logger.log(doGet({ parameter: { hit: '1' } }).getContent());
}
