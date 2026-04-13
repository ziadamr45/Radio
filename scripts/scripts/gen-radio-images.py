"""
Generate professional radio station default images - NO TEXT, only visual elements
"""
import math
import os

try:
    from PIL import Image, ImageDraw
except ImportError:
    os.system("pip install Pillow --break-system-packages -q")
    from PIL import Image, ImageDraw

OUT = "/home/z/my-project/Radio/public/images"
SIZE = 512

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def make_gradient_fast(w, h, color1, color2, direction='diagonal'):
    img = Image.new('RGB', (w, h))
    r1, g1, b1 = hex_to_rgb(color1)
    r2, g2, b2 = hex_to_rgb(color2)
    pixels = []
    for y in range(h):
        for x in range(w):
            if direction == 'diagonal':
                t = (x / w * 0.6 + y / h * 0.4)
            elif direction == 'vertical':
                t = y / h
            elif direction == 'radial':
                cx, cy = w//2, h//2
                dist = math.sqrt((x-cx)**2 + (y-cy)**2)
                max_dist = math.sqrt(cx**2 + cy**2)
                t = min(dist / max_dist * 1.4, 1.0)
            else:
                t = x / w
            t = min(max(t, 0), 1)
            pixels.append((
                int(r1 + (r2-r1)*t),
                int(g1 + (g2-g1)*t),
                int(b1 + (b2-b1)*t)
            ))
    img.putdata(pixels)
    return img

def gen_radio_1():
    """Microphone with sound waves (Teal/Cyan)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
    bg = make_gradient_fast(SIZE, SIZE, '#0a1628', '#162544', 'radial')
    img.paste(bg, (0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SIZE//2, SIZE//2 - 20

    for r in range(120, 0, -2):
        a = int(35 * (1 - r/120))
        draw.ellipse([cx-r, cy-50-r, cx+r, cy-50+r], fill=(0, 200, 220, a))

    for r in range(35, 0, -1):
        t = r / 35
        a = int(200 + 55 * (1 - t))
        draw.ellipse([cx-r, cy-120+r*0.3, cx+r, cy-55-r*0.3], fill=(0, int(200+t*10), 220, a))
    draw.ellipse([cx-15, cy-105, cx+15, cy-70], fill=(0, 240, 255, 80))

    for i in range(70):
        y = cy - 55 + i
        w = int(20 + 8 * math.sin(i * 0.08))
        a = int(200 - i)
        draw.rectangle([cx-w, y, cx+w, y+1], fill=(80, 180, 200, max(a, 100)))

    draw.rectangle([cx-3, cy+15, cx+3, cy+80], fill=(100, 130, 160, 200))
    draw.rectangle([cx-25, cy+75, cx+25, cy+82], fill=(100, 130, 160, 200))
    draw.ellipse([cx-35, cy+78, cx+35, cy+88], fill=(80, 100, 120, 150))

    for i in range(5):
        r = 65 + i * 28
        a = max(180 - i * 35, 15)
        w = max(4 - i*0.6, 1)
        draw.arc([cx-r, cy-80-r, cx+r, cy-80+r], -55, 55, fill=(0, 255, 220, a), width=int(w))
        draw.arc([cx-r, cy-80-r, cx+r, cy-80+r], 125, 235, fill=(0, 255, 220, a), width=int(w))

    import random; random.seed(42)
    for _ in range(30):
        px, py = random.randint(50, SIZE-50), random.randint(50, SIZE-50)
        if math.sqrt((px-cx)**2 + (py-cy+20)**2) > 130:
            a = random.randint(20, 80)
            draw.ellipse([px-1, py-1, px+1, py+1], fill=(0, 220, 255, a))

    img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(f"{OUT}/default-radio-1.png")
    print("OK: default-radio-1.png")

def gen_radio_2():
    """Equalizer bars (Orange/Red)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
    bg = make_gradient_fast(SIZE, SIZE, '#1a0f0a', '#2d1810', 'vertical')
    img.paste(bg, (0,0))
    draw = ImageDraw.Draw(img, 'RGBA')

    num_bars = 15; bar_w = 22; gap = 8
    total_w = num_bars * (bar_w + gap) - gap
    x_start = (SIZE - total_w) // 2; y_base = SIZE - 80

    import random; random.seed(123)
    heights = [int(150 + 120 * math.sin(i * 0.5) + 60 * math.cos(i * 0.3 + 1)) for i in range(num_bars)]

    for i, h in enumerate(heights):
        x = x_start + i * (bar_w + gap)
        for y in range(int(h)):
            t = y / max(h, 1)
            r = int(255 * (0.9 + 0.1*t)); g = int(120 + 80 * t); b = int(30 + 40 * t)
            a = int(200 + 55 * (1-t))
            draw.rectangle([x, y_base-y, x+bar_w, y_base-y+1], fill=(r, g, b, a))
        draw.rectangle([x+1, y_base-h-4, x+bar_w-1, y_base-h], fill=(255, 200, 100, 255))
        for gr in range(10, 0, -1):
            a = int(50 * (1 - gr/10))
            draw.ellipse([x+bar_w//2-gr-2, y_base-h-gr-2, x+bar_w//2+gr+2, y_base-h+gr+2], fill=(255, 160, 50, a))
        ref_h = int(h * 0.15)
        for y in range(ref_h):
            a = int(25 * (1 - y/ref_h))
            draw.rectangle([x, y_base+10+y, x+bar_w, y_base+10+y+1], fill=(255, 140, 50, a))

    img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(f"{OUT}/default-radio-2.png")
    print("OK: default-radio-2.png")

def gen_radio_3():
    """Headphones (Purple/Pink)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
    bg = make_gradient_fast(SIZE, SIZE, '#150a20', '#1a0f2e', 'radial')
    img.paste(bg, (0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SIZE//2, SIZE//2 + 10

    for i in range(180):
        angle = math.radians(i)
        r = 130
        x = cx + r * math.cos(angle + math.pi)
        y = cy - 60 + r * math.sin(angle) * 0.6
        w = 8 + 3 * math.sin(math.radians(i))
        a = int(180 + 50 * math.sin(math.radians(i)))
        draw.ellipse([x-w, y-2, x+w, y+2], fill=(180, 100, 255, a))

    for r in range(65, 0, -1):
        t = r / 65; a = int(220 * (1 - t * 0.4))
        cr = int(150 + 60*t); cg = int(80 + 40*t); cb = int(220 + 35*t)
        draw.ellipse([cx-160-r, cy-r, cx-160+r, cy+r], fill=(cr, cg, cb, a))
    draw.ellipse([cx-170, cy-20, cx-120, cy+10], fill=(80, 40, 140, 200))

    for r in range(65, 0, -1):
        t = r / 65; a = int(220 * (1 - t * 0.4))
        cr = int(150 + 60*t); cg = int(80 + 40*t); cb = int(220 + 35*t)
        draw.ellipse([cx+160-r, cy-r, cx+160+r, cy+r], fill=(cr, cg, cb, a))
    draw.ellipse([cx+120, cy-20, cx+170, cy+10], fill=(80, 40, 140, 200))

    for i in range(4):
        r = 80 + i * 25; a = max(120 - i * 30, 15)
        draw.arc([cx-200-r, cy-r, cx-200+r, cy+r], -50, 50, fill=(200, 130, 255, a), width=3)
        draw.arc([cx+200-r, cy-r, cx+200+r, cy+r], 130, 230, fill=(255, 100, 200, a), width=3)

    import random; random.seed(77)
    for _ in range(20):
        px, py = random.randint(80, SIZE-80), random.randint(60, SIZE-100)
        if min(math.sqrt((px-cx+160)**2 + (py-cy)**2), math.sqrt((px-cx-160)**2 + (py-cy)**2)) > 80:
            sz = random.randint(1, 3); a = random.randint(30, 100)
            draw.ellipse([px-sz, py-sz, px+sz, py+sz], fill=(220, 150, 255, a))

    img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(f"{OUT}/default-radio-3.png")
    print("OK: default-radio-3.png")

def gen_radio_4():
    """Globe with broadcast waves (Green/Teal)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
    bg = make_gradient_fast(SIZE, SIZE, '#0a1a14', '#0d2818', 'radial')
    img.paste(bg, (0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SIZE//2, SIZE//2; r = 120

    for gr in range(r, 0, -1):
        t = gr / r; a = int(40 * (1 - t))
        draw.ellipse([cx-gr, cy-gr, cx+gr, cy+gr], fill=(0, 200, 150, a))
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(0, 220, 160, 200), width=2)

    for i in range(1, 4):
        ly = cy - r + i * (2*r // 4)
        w = int(r * math.cos(math.asin(max(-1, min(1, (ly - cy) / r)))))
        draw.arc([cx-w, ly-1, cx+w, ly+1], 0, 360, fill=(0, 180, 140, 50), width=1)

    for angle in range(0, 180, 30):
        x_off = int(r * math.cos(math.radians(angle)))
        draw.arc([cx+x_off-r, cy-r, cx+x_off+r, cy+r], 0, 360, fill=(0, 180, 140, 40), width=1)

    for i in range(5):
        sr = r + 20 + i * 30; a = max(160 - i * 30, 15)
        draw.arc([cx-sr, cy-sr, cx+sr, cy+sr], -45, 45, fill=(0, 255, 180, a), width=2)
        draw.arc([cx-sr, cy-sr, cx+sr, cy+sr], 135, 225, fill=(0, 255, 180, a), width=2)

    for gr in range(40, 0, -1):
        a = int(40 * (1 - gr/40))
        draw.ellipse([cx-gr, cy-gr, cx+gr, cy+gr], fill=(0, 255, 200, a))

    img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(f"{OUT}/default-radio-4.png")
    print("OK: default-radio-4.png")

def gen_radio_5():
    """Vintage radio dial (Blue/Gold)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
    bg = make_gradient_fast(SIZE, SIZE, '#0d1117', '#1a2332', 'radial')
    img.paste(bg, (0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SIZE//2, SIZE//2; m = 60; br = 30

    draw.rounded_rectangle([m, m, SIZE-m, SIZE-m], radius=br, fill=(20, 25, 40, 240), outline=(180, 140, 60, 180), width=2)
    draw.rounded_rectangle([m+8, m+8, SIZE-m-8, SIZE-m-8], radius=br-2, outline=(140, 110, 50, 60), width=1)

    for y in range(140, 300, 7):
        a = int(80 + 40 * math.sin((y - 140) * 0.12))
        draw.line([(100, y), (SIZE-100, y)], fill=(180, 140, 60, a), width=1)

    dc = 370; dr = 50
    draw.ellipse([cx-dr-5, dc-dr-5, cx+dr+5, dc+dr+5], fill=(12, 16, 28, 255))
    draw.ellipse([cx-dr, dc-dr, cx+dr, dc+dr], outline=(200, 160, 60, 200), width=2)

    for i in range(12):
        angle = math.radians(i * 30)
        x1 = cx + int((dr-12)*math.cos(angle)); y1 = dc + int((dr-12)*math.sin(angle))
        x2 = cx + int(dr*math.cos(angle)); y2 = dc + int(dr*math.sin(angle))
        draw.line([(x1,y1), (x2,y2)], fill=(200, 160, 60, 180), width=2)

    ia = math.radians(-30); ix = cx + int((dr-20)*math.cos(ia)); iy = dc + int((dr-20)*math.sin(ia))
    for r in range(15, 0, -1):
        a = int(200 * (1 - r/15))
        draw.ellipse([ix-r, iy-r, ix+r, iy+r], fill=(255, 200, 60, a))
    draw.ellipse([ix-4, iy-4, ix+4, iy+4], fill=(255, 220, 80, 255))

    for r in range(80, 0, -2):
        a = int(12 * (1 - r/80))
        draw.ellipse([cx-r, dc-r, cx+r, dc+r], fill=(200, 160, 60, a))

    img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(f"{OUT}/default-radio-5.png")
    print("OK: default-radio-5.png")

def gen_radio_6():
    """Sound waveform (Coral/Amber)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
    bg = make_gradient_fast(SIZE, SIZE, '#1a100a', '#201510', 'radial')
    img.paste(bg, (0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SIZE//2, SIZE//2
    colors = [(255,120,80),(255,160,60),(255,100,120),(255,180,100),(255,80,60)]

    for wi in range(5):
        points = []; color = colors[wi]
        amp = 40 + wi * 15; freq = 0.02 + wi * 0.005; phase = wi * 0.8; y_off = (wi - 2) * 30
        for x in range(40, SIZE-40, 2):
            y = cy + y_off + amp * math.sin(x * freq + phase) * math.cos(x * freq * 0.5 + phase * 0.3)
            points.append((x, y))
        if len(points) > 2:
            draw.line(points, fill=(*color, 220), width=3)
            draw.line(points, fill=(*color, 50), width=9)

    for r in range(100, 0, -2):
        a = int(20 * (1 - r/100))
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(255, 150, 80, a))

    import random; random.seed(99)
    for _ in range(25):
        px, py = random.randint(60, SIZE-60), random.randint(60, SIZE-60)
        if math.sqrt((px-cx)**2 + (py-cy)**2) > 100:
            sz = random.randint(1, 2); a = random.randint(30, 80)
            draw.ellipse([px-sz, py-sz, px+sz, py+sz], fill=(*random.choice(colors), a))

    img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(f"{OUT}/default-radio-6.png")
    print("OK: default-radio-6.png")

def gen_religious():
    """Islamic mosque dome with crescent (Green/Gold)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
    bg = make_gradient_fast(SIZE, SIZE, '#071a10', '#0a2818', 'radial')
    img.paste(bg, (0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SIZE//2, SIZE//2 + 20
    dome_h = 130; dome_w = 110

    points = []
    for x in range(cx - dome_w, cx + dome_w + 1):
        rel_x = x - cx
        y = cy - 10 - int(dome_h * math.cos(math.radians(max(-90, min(90, rel_x / dome_w * 90)))))
        points.append((x, y))
    points.append((cx + dome_w, cy + 70))
    points.append((cx - dome_w, cy + 70))
    draw.polygon(points, fill=(0, 100, 70, 120))
    draw.line(points[:len(points)-2], fill=(0, 180, 120, 150), width=2)

    for r in range(60, 0, -1):
        a = int(30 * (1 - r/60))
        draw.ellipse([cx-r, cy-dome_h+10-r, cx+r, cy-dome_h+10+r], fill=(0, 220, 160, a))

    cres_y = cy - dome_h - 25
    draw.ellipse([cx-18, cres_y-18, cx+18, cres_y+18], fill=(220, 190, 60, 230))
    draw.ellipse([cx-8, cres_y-22, cx+22, cres_y+14], fill=(7, 26, 16, 255))

    sx, sy = cx + 35, cres_y - 5
    for r in range(10, 0, -1):
        a = int(230 * (1 - r/10))
        draw.ellipse([sx-r, sy-r, sx+r, sy+r], fill=(220, 190, 60, a))

    for r in range(60, 0, -1):
        a = int(25 * (1 - r/60))
        draw.ellipse([cx-r, cres_y-r, cx+r, cres_y+r], fill=(200, 180, 60, a))

    pr = 195
    for ad in range(0, 360, 15):
        angle = math.radians(ad)
        x = cx + int(pr * math.cos(angle)); y = cy + int(pr * math.sin(angle))
        sz = 8
        diamond = [(x, y-sz), (x+sz, y), (x, y+sz), (x-sz, y)]
        draw.polygon(diamond, fill=(0, 180, 120, 35))
        draw.polygon(diamond, outline=(0, 200, 140, 70))

    for i in range(3):
        rr = 205 + i * 18; a = max(80 - i * 25, 25)
        draw.ellipse([cx-rr, cy-rr, cx+rr, cy+rr], outline=(0, 160, 100, a), width=1)

    for i in range(8):
        angle = math.radians(i * 45 + 22.5)
        length = 80 + 30 * math.sin(i * 1.5)
        x1 = cx + int(40 * math.cos(angle)); y1 = cres_y + int(40 * math.sin(angle))
        x2 = cx + int(length * math.cos(angle)); y2 = cres_y + int(length * math.sin(angle))
        draw.line([(x1,y1), (x2,y2)], fill=(220, 190, 60, 35), width=1)

    img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(f"{OUT}/default-religious.png")
    print("OK: default-religious.png")

def gen_quran_cairo():
    """Open Quran book with crescent (for Quran Cairo Radio)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
    bg = make_gradient_fast(SIZE, SIZE, '#071a10', '#0a2818', 'radial')
    img.paste(bg, (0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SIZE//2, SIZE//2 + 15
    bw = 155; bh = 120; bt = cy - 25

    lp = [(cx, bt), (cx - bw, bt + 30), (cx - bw, bt + bh), (cx, bt + bh)]
    draw.polygon(lp, fill=(20, 55, 38, 180)); draw.polygon(lp, outline=(0, 180, 120, 140))

    rp = [(cx, bt), (cx + bw, bt + 30), (cx + bw, bt + bh), (cx, bt + bh)]
    draw.polygon(rp, fill=(25, 65, 42, 180)); draw.polygon(rp, outline=(0, 180, 120, 140))

    for i in range(8):
        y = bt + 20 + i * 11
        a = 35 + int(20 * math.sin(i * 0.5))
        xl = cx - bw + 15
        lw = int((bw - 20) * (0.5 + 0.5 * math.sin(i * 0.7)))
        draw.line([(xl, y), (xl + lw, y)], fill=(0, 200, 140, a), width=1)
        xr = cx + 15
        lwr = int((bw - 20) * (0.5 + 0.5 * math.cos(i * 0.7)))
        draw.line([(xr, y), (xr + lwr, y)], fill=(0, 200, 140, a), width=1)

    for r in range(15, 0, -1):
        a = int(80 * (1 - r/15))
        draw.line([(cx, bt-r), (cx, bt+bh+r)], fill=(0, 220, 150, a), width=2)
    draw.line([(cx, bt), (cx, bt+bh)], fill=(200, 170, 60, 120), width=2)

    cres_y = bt - 55
    draw.ellipse([cx-20, cres_y-20, cx+20, cres_y+20], fill=(220, 190, 60, 230))
    draw.ellipse([cx-10, cres_y-24, cx+24, cres_y+16], fill=(7, 26, 16, 255))

    sx, sy = cx + 40, cres_y - 8
    for r in range(10, 0, -1):
        a = int(230 * (1 - r/10))
        draw.ellipse([sx-r, sy-r, sx+r, sy+r], fill=(220, 190, 60, a))

    for r in range(70, 0, -1):
        a = int(20 * (1 - r/70))
        draw.ellipse([cx-r, cres_y-r, cx+r, cres_y+r], fill=(200, 180, 60, a))

    for i in range(4):
        r = 175 + i * 30; a = max(70 - i * 18, 10)
        draw.arc([cx-r, cy-r+15, cx+r, cy+r+15], -30, 30, fill=(0, 200, 150, a), width=2)
        draw.arc([cx-r, cy-r+15, cx+r, cy+r+15], 150, 210, fill=(0, 200, 150, a), width=2)

    import random; random.seed(55)
    for _ in range(15):
        px, py = random.randint(50, SIZE-50), random.randint(50, SIZE-50)
        if math.sqrt((px-cx)**2 + (py-cy)**2) > 150:
            a = random.randint(20, 60)
            draw.ellipse([px-1, py-1, px+1, py+1], fill=(0, 200, 150, a))

    img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(f"{OUT}/quran-cairo-radio.png")
    print("OK: quran-cairo-radio.png")


gen_radio_1()
gen_radio_2()
gen_radio_3()
gen_radio_4()
gen_radio_5()
gen_radio_6()
gen_religious()
gen_quran_cairo()
print("\nAll 8 images generated successfully!")
