// 拜訪人數與匿名統計：呼叫 Google 試算表的 Apps Script（gas/Code.gs）
// - 同一台裝置一天只算一次人次，並在那一次附上裝置類型、從哪裡來、造訪時段
// - 學習成效（打開哪座島、答對、集滿印章、領證書）只送「類別＋項目」讓試算表加 1
// 不傳任何個人資料：沒有 IP 以外的識別資訊（Apps Script 也不記 IP）、沒有暱稱或姓名
import { SCHOOL } from '../data/site.js';

const KEY = 'fs-visit-day';
const TZ = 'Asia/Taipei';
const taipeiDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
const withQuery = (url, q) => `${url}${url.includes('?') ? '&' : '?'}${new URLSearchParams(q)}`;

// 裝置類型：只分手機、平板、電腦三類
export function deviceType() {
  const ua = navigator.userAgent;
  const ipadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPad|Tablet/i.test(ua) || ipadOs || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return '平板';
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return '手機';
  return '電腦';
}

// 從哪裡來：只記分類，不記完整網址
export function sourceType() {
  const ua = navigator.userAgent;
  if (/\bLine\//i.test(ua)) return 'LINE';
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook';
  if (/Instagram/i.test(ua)) return 'Instagram';
  let host = '';
  try { host = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* 略過 */ }
  if (!host || host === location.hostname) return '直接開啟';
  if (/\.edu\.tw$/i.test(host)) return '學校網站';
  if (/line\.me$|line-apps\.com$/i.test(host)) return 'LINE';
  if (/facebook\.com$|fb\.com$|fb\.me$/i.test(host)) return 'Facebook';
  if (/instagram\.com$/i.test(host)) return 'Instagram';
  if (/youtube\.com$|youtu\.be$/i.test(host)) return 'YouTube';
  if (/google\./i.test(host)) return 'Google';
  return '其他網站';
}

// 造訪時段（台灣時間）：平日 8–16 點算上課時間
export function timeSlot(d = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, x.value]));
  if (parts.weekday === 'Sat' || parts.weekday === 'Sun') return '假日';
  const h = Number(parts.hour);
  return h >= 8 && h < 16 ? '平日上課' : '平日課後';
}

export async function countVisit() {
  const url = SCHOOL.counterUrl;
  if (!url) return null;
  let first = true;
  try { first = localStorage.getItem(KEY) !== taipeiDay(); } catch { /* 無痕模式：每次都算 */ }
  const q = first ? { hit: 1, dev: deviceType(), src: sourceType(), slot: timeSlot() } : { hit: 0 };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(withQuery(url, q), { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Number.isFinite(data.today) || !Number.isFinite(data.total)) return null;
    if (first) { try { localStorage.setItem(KEY, taipeiDay()); } catch { /* 略過 */ } }
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// 學習成效事件：同一次瀏覽同一個項目只送一次，送出後不等回應
const sent = new Set();
export function track(ev, item) {
  const url = SCHOOL.counterUrl;
  const key = `${ev}|${item}`;
  if (!url || sent.has(key)) return;
  sent.add(key);
  try { fetch(withQuery(url, { ev, item }), { mode: 'no-cors', keepalive: true }).catch(() => {}); } catch { /* 略過 */ }
}
