"""Render the README explainer GIFs and the hero still.

    python docs/src/render_gifs.py                 # all of them
    python docs/src/render_gifs.py hero            # one: hero | before-after | how-it-works | still

Each GIF is rendered frame by frame from an animated HTML page by record_html.py (deterministic).
docs/hero.png is hero-anim.html seeked to its end state, at 2x.
Needs: pip install playwright && playwright install chromium; ffmpeg on PATH.
The real app recording is a separate script: record_demo.py.
"""
import subprocess
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent
JOBS = {
    'hero': ('hero-anim.html', 'hero.gif', ['--w', '1400', '--h', '700', '--dur', '9', '--fps', '12', '--colors', '128']),
    'before-after': ('before-after.html', 'before-after.gif', ['--w', '1100', '--h', '620', '--dur', '9', '--fps', '12', '--colors', '128']),
    'how-it-works': ('how-it-works.html', 'how-it-works.gif', ['--w', '1200', '--h', '640', '--dur', '11', '--fps', '12', '--colors', '128']),
}


def still():
    from playwright.sync_api import sync_playwright
    out = SRC.parent / 'hero.png'
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1400, 'height': 700}, device_scale_factor=2)
        pg.goto((SRC / 'hero-anim.html').as_uri())
        pg.wait_for_load_state('networkidle')
        pg.evaluate('document.fonts.ready')
        pg.wait_for_timeout(300)
        pg.evaluate('(ms) => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; } }', 7600)
        pg.screenshot(path=str(out))
        b.close()
    print('wrote', out)


for name in sys.argv[1:] or [*JOBS, 'still']:
    if name == 'still':
        still()
        continue
    html, gif, args = JOBS[name]
    subprocess.run([sys.executable, str(SRC / 'record_html.py'), str(SRC / html), str(SRC.parent / gif), *args],
                   check=True)
