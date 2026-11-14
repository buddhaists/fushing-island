/**
 * 福星龍浮空島：拜訪人數與匿名統計（Google Apps Script，綁定一份 Google 試算表）
 *
 * 網站呼叫方式（都是 GET）：
 *   ?hit=1&dev=手機&src=LINE&slot=平日上課   這台裝置今天第一次來：今天人次加 1，並記一筆裝置／來源／時段
 *   ?hit=0                                   只讀人數，不加
 *   ?ev=島嶼&item=溫心守護島                  學習成效事件：該項目次數加 1
 * 回傳：{"today": 今天人次, "total": 累計人次, "date": "2026-11-14"}
 *
 * 工作表：
 *   「拜訪人數」A 日期、B 當天人次（每天一列）
 *   「統計明細」A 日期、B 類別、C 項目、D 次數（每天每個項目一列）
 *   「統計總表」用公式把明細依類別、項目加總，老師直接看這張
 *
 * 只接受下面清單裡的類別與項目，只記次數；不記 IP、裝置識別碼、姓名或暱稱。
 */
const TZ = 'Asia/Taipei';
const VISITS = '拜訪人數';
const DETAIL = '統計明細';
const SUMMARY = '統計總表';

const ISLANDS = ['初心啟航島', '寰宇交會島', '秘境踏查島', '溫心守護島', '璀璨桂冠島', '奇思妙想島', '萌芽歡樂島', '乘風蛻變島', '隱形推進島'];
const ALLOW = {
  裝置: ['手機', '平板', '電腦'],
  來源: ['學校網站', 'LINE', 'Facebook', 'Instagram', 'YouTube', 'Google', '直接開啟', '其他網站'],
  時段: ['平日上課', '平日課後', '假日'],
  島嶼: ISLANDS,
  答對: ISLANDS,
  闖關: ['集滿印章', '領取證書'],
};

function doGet(e) {
  const p = (e && e.parameter) || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(8000); // 同時很多人進來時排隊，數字才不會互相蓋掉
  try {
    const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
    if (p.ev) {
      add_(today, p.ev, p.item);
      return json_({ ok: true });
    }
    const hit = p.hit === '1';
    const counts = visits_(today, hit);
    if (hit) {
      add_(today, '裝置', p.dev);
      add_(today, '來源', p.src);
      add_(today, '時段', p.slot);
    }
    return json_(counts);
  } finally {
    lock.releaseLock();
  }
}

// 拜訪人數：今天那一列加 1（hit），回傳今天與累計
function visits_(today, hit) {
  const sh = sheet_(VISITS, ['日期', '人次']);
  let last = sh.getLastRow();
  let row = last >= 2 && String(sh.getRange(last, 1).getDisplayValue()) === today ? last : 0;
  if (!row) {
    sh.appendRow(["'" + today, 0]); // 前面加 ' 讓日期存成文字，比對才不會受格式影響
    row = last = sh.getLastRow();
  }
  const cell = sh.getRange(row, 2);
  if (hit) cell.setValue(Number(cell.getValue() || 0) + 1);
  const total = sh.getRange(2, 2, last - 1, 1).getValues().reduce((s, r) => s + Number(r[0] || 0), 0);
  return { today: Number(cell.getValue() || 0), total: total, date: today };
}

// 統計明細：只收清單裡的類別與項目；同一天同一項目累加在同一列
function add_(today, cat, item) {
  if (!ALLOW[cat] || ALLOW[cat].indexOf(item) < 0) return;
  const sh = sheet_(DETAIL, ['日期', '類別', '項目', '次數']);
  summary_();
  const last = sh.getLastRow();
  // 只往回找今天的列（明細依日期往下長，今天的都在最後面）
  const start = Math.max(2, last - 120);
  if (last >= 2) {
    const rows = sh.getRange(start, 1, last - start + 1, 3).getDisplayValues();
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i][0] !== today) break;
      if (rows[i][1] === cat && rows[i][2] === item) {
        const c = sh.getRange(start + i, 4);
        c.setValue(Number(c.getValue() || 0) + 1);
        return;
      }
    }
  }
  sh.appendRow(["'" + today, cat, item, 1]);
}

// 統計總表：第一次用到時建立，之後由公式自動加總
function summary_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(SUMMARY)) return;
  const sh = ss.insertSheet(SUMMARY);
  sh.getRange('A1').setFormula("=QUERY('" + DETAIL + "'!A:D, \"select B, C, sum(D) where B is not null group by B, C order by B label B '類別', C '項目', sum(D) '累計次數'\", 1)");
  sh.setColumnWidths(1, 3, 140);
}

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 在編輯器裡選這個函式按「執行」，可以先測試並授權（會加一筆測試資料，測完可在試算表刪掉）
function test() {
  Logger.log(doGet({ parameter: { hit: '0' } }).getContent());
  Logger.log(doGet({ parameter: { ev: '島嶼', item: '初心啟航島' } }).getContent());
}
