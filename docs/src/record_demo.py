"""Record docs/demo.gif from a real build and a real run of ProductBro, on sample data.

    python docs/src/record_demo.py          # from the repo root, after `npm ci`

What it does, all on 127.0.0.1:
  1. Copies the app to a temp folder and swaps in docs/src/sample-builders.json (invented people:
     Dina, Sam, Maya and friends) with sampleData on, so no real person's profile is recorded.
     Your src/data is never touched.
  2. Runs the real `npm run build` there (vite build + scripts/prerender.mjs) and saves its output.
  3. Serves dist/ with `vite preview` and records a Playwright walkthrough with the family cursor:
     search the index, filter by discipline, open Dina's profile, press "Claim profile".
  4. Opens the same profile URL with JavaScript off, to show the prerendered HTML a crawler gets.
  5. Shows the build's own prerender output as a terminal still, and joins it all into docs/demo.gif.

Needs Node 18+, Playwright with Chromium, and ffmpeg.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

SRC = Path(__file__).resolve().parent
REPO = SRC.parent.parent
OUT = SRC.parent / 'demo.gif'
WORK = Path(tempfile.gettempdir()) / 'productbro-demo'
APP = WORK / 'app'
PORT = 4317
BASE = f'http://127.0.0.1:{PORT}'
W, H = 1200, 850         # browser viewport and GIF size (CSS px)
ZOOM = 1.25              # the page is zoomed (a 960x680 layout), so the app's small labels stay readable
VW, VH = W, H
FPS = 10
WIN = os.name == 'nt'

# Shared cursor for the family's GIFs: an ink dot with a lime ring.
CURSOR = """
window.addEventListener('DOMContentLoaded', () => {
  const c = document.createElement('div');
  c.style.cssText = 'position:fixed;left:0;top:0;width:20px;height:20px;border-radius:50%;background:#072B27;border:4px solid #C8F751;box-shadow:0 0 0 1.5px #072B27,0 2px 6px rgba(0,0,0,.25);z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);transition:transform .03s linear;box-sizing:border-box';
  document.documentElement.appendChild(c);
  window.addEventListener('mousemove', e => { c.style.transform = `translate(${e.clientX - 10}px,${e.clientY - 10}px)`; }, true);
});
"""

ZOOM_JS = "document.addEventListener('DOMContentLoaded', () => { document.body.style.zoom = '%s'; });" % ZOOM

CAPTION = """(t) => { let el = document.getElementById('__cap');
  if (!el) { el = document.createElement('div'); el.id = '__cap'; document.documentElement.appendChild(el); }
  el.innerHTML = t;
  el.style.cssText = 'position:fixed;left:50%;top:96px;transform:translateX(-50%);z-index:2147483646;background:#C8F751;color:#072B27;border:2px solid #072B27;border-radius:8px;padding:8px 14px;font:700 17px/1.35 "JetBrains Mono",Consolas,monospace;white-space:nowrap;text-align:center;box-shadow:4px 4px 0 #072B27'; }"""

TERMINAL = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0}
  html,body{width:%(w)dpx;height:%(h)dpx;background:#F1F3EE;display:grid;place-items:center;font-family:'JetBrains Mono',Consolas,monospace}
  .win{width:%(ww)dpx;background:#072B27;border:3px solid #072B27;border-radius:12px;box-shadow:7px 7px 0 #0D453E;overflow:hidden}
  .chrome{height:34px;background:#0A3833;display:flex;align-items:center;gap:8px;padding:0 14px}
  .chrome i{width:12px;height:12px;border-radius:50%%;background:#2C5C55;display:block}
  .chrome span{margin-left:10px;color:#9DB7AF;font-size:14px}
  .chrome b{margin-left:auto;font:800 14px Archivo,sans-serif;color:#072B27;background:#C8F751;padding:3px 9px;border-radius:5px}
  .s{padding:18px 20px 22px;color:#DDE7E2;font-size:17px;line-height:1.55;white-space:pre-wrap}
  .p{color:#C8F751}.c{color:#fff}.dim{color:#7FA39A}
  .hl{background:#C8F751;color:#072B27;padding:0 5px;border-radius:3px;font-weight:700}
</style></head><body>
<div class="win"><div class="chrome"><i></i><i></i><i></i><span>terminal</span><b>real output</b></div>
<div class="s">%(body)s</div></div></body></html>"""


def sh(cmd, **kw):
    return subprocess.run(cmd, shell=WIN, check=True, **kw)


def prepare():
    """Copy the app to WORK/app with the sample data, then run the real build there."""
    nm = APP / 'node_modules'
    if os.path.lexists(nm):
        os.rmdir(nm) if WIN else os.unlink(nm)   # drop the link only, never the repo's node_modules
    shutil.rmtree(WORK, ignore_errors=True)
    APP.mkdir(parents=True)
    for name in ('src', 'public', 'scripts'):
        shutil.copytree(REPO / name, APP / name)
    for f in REPO.iterdir():
        if f.is_file() and f.suffix in ('.json', '.ts', '.js', '.html'):
            shutil.copy2(f, APP / f.name)
    # Reuse the repo's node_modules (junction on Windows, symlink elsewhere).
    if WIN:
        subprocess.run(['cmd', '/c', 'mklink', '/J', str(APP / 'node_modules'), str(REPO / 'node_modules')],
                       check=True, stdout=subprocess.DEVNULL)
    else:
        os.symlink(REPO / 'node_modules', APP / 'node_modules')
    shutil.copy2(SRC / 'sample-builders.json', APP / 'src/data/builders.json')
    site = json.loads((APP / 'src/data/site.json').read_text(encoding='utf-8'))
    site['sampleData'] = True
    (APP / 'src/data/site.json').write_text(json.dumps(site, indent=2), encoding='utf-8')
    r = subprocess.run('npm run build', shell=True, cwd=APP, capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sys.exit(r.stdout + r.stderr)
    log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout)
    (WORK / 'build.txt').write_text(log, encoding='utf-8')
    print(log)
    return log


def serve():
    p = subprocess.Popen(f'npx vite preview --port {PORT} --strictPort --host 127.0.0.1', shell=True, cwd=APP,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        try:
            urllib.request.urlopen(BASE + '/', timeout=1)
            return p
        except Exception:
            time.sleep(0.5)
    p.kill()
    sys.exit('vite preview did not start')


async def glide(p, loc, steps=16, click=True):
    await loc.scroll_into_view_if_needed()
    await p.wait_for_timeout(300)
    box = await loc.bounding_box()
    x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    await p.mouse.move(x, y, steps=steps)
    await p.wait_for_timeout(250)
    if click:
        await p.mouse.click(x, y)


async def record():
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        vid = WORK / 'walk'
        ctx = await b.new_context(viewport={'width': W, 'height': H}, 
                                  record_video_dir=str(vid), record_video_size={'width': VW, 'height': VH})
        await ctx.add_init_script(CURSOR)
        await ctx.add_init_script(ZOOM_JS)
        await ctx.route('**/tally.so/**', lambda r: r.abort())   # the claim form itself is not recorded
        p = await ctx.new_page()
        await p.goto(BASE + '/')
        await p.wait_for_selector('article')
        await p.mouse.move(440, 120)
        await p.wait_for_timeout(700)
        # 1. Search the index.
        search = p.locator('input').first
        await glide(p, search)
        await search.press_sequentially('fintech', delay=100)
        await p.wait_for_timeout(600)
        # 2. Narrow to one discipline.
        await glide(p, p.get_by_role('button', name='Product', exact=True))
        await p.wait_for_timeout(600)
        # Scroll so the cards are in view, then open Dina's profile.
        card = p.locator('a[href="/s/dina-pratama"]')
        await card.scroll_into_view_if_needed()
        await p.wait_for_timeout(700)
        await glide(p, card, steps=18)
        await p.wait_for_selector('h1:has-text("Dina Pratama")')
        await p.evaluate('window.scrollTo(0, 0)')
        await p.mouse.move(640, 260, steps=10)
        await p.wait_for_timeout(1200)
        # 3. Claim the profile.
        claim = p.get_by_role('link', name='Claim profile')
        href = await claim.get_attribute('href')
        async with ctx.expect_page() as pop:
            await glide(p, claim, steps=18)
        popup = await pop.value
        await popup.close()
        await p.bring_to_front()
        q = href.split('?', 1)[1] if '?' in href else ''
        await p.evaluate(CAPTION, f'Claim profile opens the claim form (Tally) with <u>?{q}</u> prefilled')
        await p.wait_for_timeout(2300)
        await ctx.close()

        # 4. The same URL with JavaScript off: the prerendered page a crawler reads.
        vid2 = WORK / 'nojs'
        ctx = await b.new_context(viewport={'width': W, 'height': H}, java_script_enabled=False,
                                  record_video_dir=str(vid2), record_video_size={'width': VW, 'height': VH})
        # With JavaScript off, page.evaluate is unavailable, so the caption is put into the served HTML.
        cap = ('<style>body{zoom:1.25;font:17px/1.5 system-ui,sans-serif;padding:24px 32px;background:#fff;color:#111}h1{font-size:30px;font-weight:800;margin:0 0 10px}p{margin:8px 0}a{color:#0645ad;text-decoration:underline}</style>'
               '<div style="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#C8F751;'
               'color:#072B27;border:2px solid #072B27;border-radius:8px;padding:6px 12px;font:700 14px/1.35 '
               'Consolas,monospace;box-shadow:4px 4px 0 #072B27;white-space:nowrap">Same URL, JavaScript off: '
               'the prerendered HTML Google and link previews read</div>')

        async def inject(route):
            r = await route.fetch()
            await route.fulfill(response=r, body=(await r.text()).replace('</body>', cap + '</body>'))
        await ctx.route(BASE + '/s/**', inject)
        p = await ctx.new_page()
        await p.goto(BASE + '/s/dina-pratama/')
        await p.wait_for_timeout(2600)
        await ctx.close()
        await b.close()


async def terminal(log):
    from playwright.async_api import async_playwright
    keep = [l for l in log.splitlines() if l.startswith(('dist/', '[prerender]')) or 'built in' in l]
    body = '<span class="p">$ </span><span class="c">npm run build</span>\n<span class="dim">vite build &amp;&amp; node scripts/prerender.mjs</span>\n'
    for l in keep:
        l = l.replace('&', '&amp;').replace('<', '&lt;')
        body += (f'<span class="hl">{l}</span>' if l.startswith('[prerender]') else l) + '\n'
    sm = (APP / 'dist/sitemap.xml').read_text(encoding='utf-8')
    locs = re.findall(r'<loc>([^<]+)</loc>', sm)
    body += f'\n<span class="p">$ </span><span class="c">ls dist/s</span>\n' + '  '.join(
        sorted(d.name for d in (APP / 'dist/s').iterdir())[:6]) + '  ...\n'
    body += f'<span class="dim">sitemap.xml: {len(locs)} URLs</span>'
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        tp = await (await b.new_context(viewport={'width': VW, 'height': VH})).new_page()
        await tp.set_content(TERMINAL % {'w': VW, 'h': VH, 'ww': VW - 80, 'body': body})
        await tp.wait_for_timeout(800)
        await tp.screenshot(path=str(WORK / 'build.png'))
        await b.close()


def join():
    a = next((WORK / 'walk').glob('*.webm'))
    c = next((WORK / 'nojs').glob('*.webm'))
    still = WORK / 'build.png'
    # mpdecimate drops near-duplicate frames (at most 4 in a row, so still parts keep their length).
    fc = (f'[0:v]trim=start=0.6,setpts=PTS-STARTPTS,fps={FPS},scale={VW}:{VH},setsar=1,format=yuv420p[a];'
          f'[1:v]trim=start=0.4,setpts=PTS-STARTPTS,fps={FPS},scale={VW}:{VH},setsar=1,format=yuv420p[b];'
          f'[2:v]fps={FPS},scale={VW}:{VH},setsar=1,format=yuv420p,trim=duration=3.6[c];'
          '[a][b][c]concat=n=3:v=1:a=0,mpdecimate=max=4,split[x][y];'
          '[x]palettegen=max_colors=96:stats_mode=diff[p];[y][p]paletteuse=dither=none:diff_mode=rectangle')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(a), '-i', str(c), '-loop', '1',
                    '-framerate', str(FPS), '-i', str(still), '-filter_complex', fc, '-fps_mode', 'vfr', str(OUT)], check=True)
    print('wrote', OUT, round(OUT.stat().st_size / 1e6, 2), 'MB')


if __name__ == '__main__':
    import asyncio
    if sys.argv[1:] == ['join']:      # re-encode the last recording only
        join()
        sys.exit()
    log = prepare()
    srv = serve()
    try:
        asyncio.run(record())
    finally:
        if WIN:
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(srv.pid)], stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL)
        else:
            srv.kill()
    asyncio.run(terminal(log))
    join()
