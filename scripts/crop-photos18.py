# 從《文藝復興》第 18 期 PDF 頁面裁切照片與插圖到 public/photos/18/
# 用法：python scripts/crop-photos18.py <PDF 路徑> [輸出資料夾] [只裁這些 id…]
# 座標是頁面寬高的比例 (左, 上, 右, 下)。只選團體照、遠景與插圖；學生畫作裁掉旁邊的姓名標籤
import sys
import fitz
from PIL import Image

PDF = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else 'public/photos/18'
ONLY = set(sys.argv[3:])

CROPS = {
    # 第一批（階段 2）
    'cover': (1, 0.0, 0.305, 1.0, 0.575),
    'intl-1': (5, 0.102, 0.778, 0.353, 0.922),
    'intl-2': (5, 0.368, 0.778, 0.648, 0.922),
    'mom-1': (15, 0.442, 0.357, 0.873, 0.503),
    'mom-2': (15, 0.132, 0.828, 0.403, 0.922),
    'honor-1': (13, 0.548, 0.768, 0.928, 0.897),
    'honor-2': (40, 0.658, 0.668, 0.952, 0.808),
    'kinder-1': (6, 0.412, 0.708, 0.958, 0.952),
    'kids-day': (40, 0.358, 0.452, 0.632, 0.590),
    'general-1': (39, 0.272, 0.378, 0.418, 0.512),
    'general-2': (39, 0.437, 0.378, 0.583, 0.512),
    # 第二批：活動照片
    'world-food': (2, 0.60, 0.17, 0.95, 0.36),
    'world-art': (2, 0.36, 0.66, 0.60, 0.775),
    'walk-trip': (2, 0.27, 0.37, 0.62, 0.52),
    'walk-tribe': (2, 0.62, 0.66, 0.95, 0.795),
    'honor-model': (14, 0.10, 0.15, 0.93, 0.27),
    'honor-reader': (12, 0.635, 0.458, 0.97, 0.53),
    'honor-song': (12, 0.62, 0.76, 0.97, 0.90),
    'kinder-paper': (7, 0.05, 0.76, 0.62, 0.95),
    'general-3': (39, 0.06, 0.21, 0.39, 0.355),
    # 第二批：學生畫作（避開姓名標籤）
    'art-season': (22, 0.096, 0.80, 0.378, 0.925),
    'art-season2': (22, 0.707, 0.80, 0.94, 0.925),
    'art-tear': (21, 0.055, 0.80, 0.97, 0.915),
    'art-charm': (17, 0.00, 0.60, 0.32, 0.725),
    'art-masks': (18, 0.52, 0.70, 0.92, 0.925),
    # 第二批：校刊插圖
    'clip-hero': (24, 0.62, 0.10, 0.97, 0.28),
    'clip-cookie': (23, 0.35, 0.05, 0.62, 0.14),
    'clip-kids': (36, 0.10, 0.862, 0.33, 0.95),
    'clip-girl': (30, 0.785, 0.84, 0.88, 0.955),
    'clip-mom': (30, 0.092, 0.82, 0.245, 0.955),
}

d = fitz.open(PDF)
cache = {}
for k, (pg, x0, y0, x1, y1) in CROPS.items():
    if ONLY and k not in ONLY:
        continue
    if pg not in cache:
        p = d[pg - 1].get_pixmap(dpi=170)
        cache[pg] = Image.frombytes('RGB', (p.width, p.height), p.samples)
    im = cache[pg]
    W, H = im.size
    c = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    if c.width > 1200:
        c = c.resize((1200, int(c.height * 1200 / c.width)), Image.LANCZOS)
    c.save(f'{OUT}/{k}.webp', quality=80)
    print(k, c.size)
