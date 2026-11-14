# 把《文藝復興》第 18 期文字稿（Markdown）解析成去識別化的作品清單
# 用法：python scripts/build-issue18.py <文字稿.md> src/data/issues/18/pieces.json
# - 每篇作品只保留「年班」，作者姓名一律拿掉
# - 內文出現的學生姓名（全名或名字）改成「同學」
# - 原始文字稿含學生姓名，不放進 repo；只提交輸出的 pieces.json
import json
import re
import sys

src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding='utf-8').read().splitlines()

PAGE = re.compile(r'^#{5,6}\s*\*?【P\.(\d+)\s*([^】]*)】\*?\s*(.*)$')
ITEM = re.compile(r'^\*\s+\*\*(.+?)\*\*\s*[：:]?\s*(.*)$')
TITLED = re.compile(r'^〈(.+?)〉\s*(\S*)$')
NAME = re.compile(r'^[一-鿿]{2,4}$')
# 不是姓名的粗體標籤：SEL 心情分類（整段不收）、讀書報告的小節（併進上一篇）
SKIP = {'得意', '幸福', '驚喜', '開心', '快樂', '美勞作品'}
APPEND = {'內容摘要', '讀後感想'}

pieces, authors = [], set()
page = cls = theme = None
cur = None
group_title = None

def flush():
    global cur
    if cur:
        cur['text'] = '\n'.join(t for t in cur['text'] if t).strip()
        pieces.append(cur)
    cur = None

for raw in lines:
    line = raw.rstrip()
    m = PAGE.match(line.strip())
    if m:
        flush()
        page, label, rest = m.group(1), m.group(2).strip(), m.group(3).strip()
        group_title = None
        cls = label if re.search(r'[一二三四五六]年[一二三四]班', label) else None
        theme = re.sub(r'[〈〉*]', '', rest) or None
        continue
    if line.startswith('#'):
        flush()
        page = None
        continue
    if page is None or cls is None:
        continue
    s = line.strip()
    m = ITEM.match(s)
    if m:
        head, body = m.group(1).strip(), m.group(2).strip()
        if head in APPEND and cur:
            cur['text'].append(f'{head}：{body}')
            continue
        if head in SKIP:
            flush()
            continue
        global_empty = cur and not ''.join(cur['text']).strip()
        if global_empty:
            group_title = cur['title']
            cur = None  # 只有標題的分組（例如〈爸爸〉短詩創作），標題交給底下每一首
        flush()
        t = TITLED.match(head)
        if t:
            group_title = None
        group = group_title
        if t:
            title, author = t.group(1), t.group(2)
        elif NAME.match(head):
            title, author = group or theme or '作品', head
        else:
            # 美勞作品、SEL 分享心情等清單：不收（多半是姓名列表）
            continue
        if author:
            authors.add(author)
        cur = {'page': int(page), 'cls': cls, 'title': title, 'author': author, 'text': [body]}
        continue
    if cur and s.startswith('* '):
        cur['text'].append(s[2:].strip())
flush()

# 內文去識別化：全名與名字（三字姓名的後兩字）都換掉
names = sorted(authors | {'黃之薰'}, key=len, reverse=True)
given = sorted({n[1:] for n in names if len(n) == 3}, key=len, reverse=True)
hits = []
for p in pieces:
    t = p['text']
    for n in names:
        if n in t:
            hits.append((p['page'], p['cls'], n))
            t = t.replace(n, '同學')
    for g in given:
        if g in t:
            hits.append((p['page'], p['cls'], g))
            t = t.replace(g, '同學')
    p['text'] = t
    if p['title'] in names:
        p['title'] = '我'  # 用自己名字當題目的小詩
    del p['author']

for i, p in enumerate(pieces):
    p['id'] = f"p{p['page']}-{sum(1 for q in pieces[:i] if q['page'] == p['page']) + 1}"

# 刻意不收的作品：內容容易認出是哪位同學的家人（例如寫明爸爸的職業）
EXCLUDE = {'p18-2'}
pieces = [p for p in pieces if p['id'] not in EXCLUDE]

# 師長與處室的文章（P.1 校長、P.2 家長會長、P.3 國際交流、P.4 幼兒園、P.13 母親節）：
# 只取內文段落，作者行不收
for no in ('1', '2', '3', '4', '13'):
    start = next(i for i, l in enumerate(lines) if l.startswith(f'##### 【P.{no} '))
    body = []
    for l in lines[start + 1:]:
        if l.startswith('#'):
            break
        t = l.strip()
        if t.startswith('* '):
            t = t[2:].strip()
        if not t or t.startswith('**作者'):
            continue
        t = re.sub(r'\*\*(.+?)\*\*\s*[：:]?\s*', r'\1：', t)
        body.append(t.rstrip(' \\').strip())
    pieces.append({'page': int(no), 'cls': None, 'title': f'P.{no}', 'text': '\n'.join(body), 'id': f'page{no}'})

json.dump(pieces, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{len(pieces)} 篇作品，{len(authors)} 位作者姓名已移除')
print(f'內文替換 {len(hits)} 處')
for p in pieces:
    print(p['id'], p['cls'], p['title'], len(p['text']))
