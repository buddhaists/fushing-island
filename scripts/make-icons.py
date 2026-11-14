# 由福星龍校徽產生網站圖示與社群分享圖（青綠漸層底）
# 用法：python scripts/make-icons.py [中文粗體字型檔]
# 字型預設用 Windows 的微軟正黑體粗體，其他系統請自行指定 .ttf/.ttc
import sys
from PIL import Image, ImageDraw, ImageFont

LOGO = 'public/mascot/logo-fushing.png'
FONT = sys.argv[1] if len(sys.argv) > 1 else 'C:/Windows/Fonts/msjhbd.ttc'
OUT = 'public/'
TOP, BOTTOM = (61, 143, 138), (243, 239, 226)  # 校刊青綠 → 米白


def gradient(w, h):
    im = Image.new('RGB', (w, h))
    px = im.load()
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(round(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3))
        for x in range(w):
            px[x, y] = c
    return im.convert('RGBA')


def badge(size):
    # 校徽是白底：放在圓角白牌上，青綠底才不會出現白色方塊
    logo = Image.open(LOGO).convert('RGBA')
    pad = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    card = Image.new('L', (size * 4, size * 4), 0)
    ImageDraw.Draw(card).rounded_rectangle((0, 0, size * 4, size * 4), radius=size, fill=255)
    white = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    pad.paste(white, (0, 0), card.resize((size, size), Image.LANCZOS))
    s = round(size * 0.9)
    lw = s
    lh = round(logo.height * s / logo.width)
    pad.alpha_composite(logo.resize((lw, lh), Image.LANCZOS), ((size - lw) // 2, (size - lh) // 2))
    return pad


def icon(size, scale, rounded):
    base = gradient(size, size)
    b = badge(round(size * scale))
    base.alpha_composite(b, ((size - b.width) // 2, (size - b.height) // 2))
    if rounded:
        mask = Image.new('L', (size * 4, size * 4), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, size * 4, size * 4), radius=size * 4 // 5, fill=255)
        base.putalpha(mask.resize((size, size), Image.LANCZOS))
    return base


icon(180, 0.82, False).convert('RGB').save(OUT + 'apple-touch-icon.png', optimize=True)
icon(192, 0.84, True).save(OUT + 'icon-192.png', optimize=True)
icon(512, 0.84, True).save(OUT + 'icon-512.png', optimize=True)
icon(192, 0.62, False).save(OUT + 'icon-192-maskable.png', optimize=True)
icon(512, 0.62, False).save(OUT + 'icon-512-maskable.png', optimize=True)
icon(64, 0.94, True).save(OUT + 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# 社群分享圖 1200×630
og = gradient(1200, 630)
b = badge(300)
og.alpha_composite(b, (110, 165))
d = ImageDraw.Draw(og)
title = ImageFont.truetype(FONT, 104)
sub = ImageFont.truetype(FONT, 40)
d.text((470, 190), '福星龍浮空島', font=title, fill=(255, 255, 255))
d.text((474, 330), '《文藝復興》第 18 期', font=sub, fill=(43, 111, 107))
d.text((474, 392), '九座島・九段復興故事・福星龍闖關', font=sub, fill=(43, 111, 107))
og.convert('RGB').save(OUT + 'og.jpg', quality=88)
print('icons ok')
