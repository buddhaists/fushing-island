// 拜訪人數：呼叫 Google 試算表的 Apps Script（gas/Code.gs）
// 同一台裝置一天只加一次（在 localStorage 記下今天日期），其他時候只讀數字
// 不傳任何個人資料；網址沒設定或連不上時，畫面就不顯示人數
import { SCHOOL } from '../data/site.js';

const KEY = 'fs-visit-day';
const taipeiDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());

export async function countVisit() {
  const url = SCHOOL.counterUrl;
  if (!url) return null;
  let first = true;
  try { first = localStorage.getItem(KEY) !== taipeiDay(); } catch { /* 無痕模式：每次都算 */ }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}hit=${first ? 1 : 0}`, { signal: ctrl.signal });
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
