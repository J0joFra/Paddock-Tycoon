#!/usr/bin/env python3
"""Genera le versioni pubblicabili del gioco a partire da src/game.html.

  python3 tools/build.py            → index.html (web app su GitHub Pages: manifest, icone, service worker)
  python3 tools/build.py --native   → www/ per l'app Android (Capacitor): caratteri inclusi, niente service worker

src/game.html è il gioco completo in un unico file (stili, markup e script), pensato anche per l'anteprima
come artifact: non ha <html>, <head> né <body>.
"""
import shutil
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / 'src' / 'game.html').read_text(encoding='utf-8')
split = src.index('</style>') + len('</style>')
head, body = src[:split], src[split:]
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')

if '--native' in sys.argv:
    fonts = """<style>
@font-face{font-family:'Alfa Slab One';font-weight:400;src:url(fonts/alfa-slab-one-400.woff2) format('woff2')}
@font-face{font-family:'Titillium Web';font-weight:400;src:url(fonts/titillium-web-400.woff2) format('woff2')}
@font-face{font-family:'Titillium Web';font-weight:600;src:url(fonts/titillium-web-600.woff2) format('woff2')}
@font-face{font-family:'Titillium Web';font-weight:700;src:url(fonts/titillium-web-700.woff2) format('woff2')}
@font-face{font-family:'Titillium Web';font-weight:900;src:url(fonts/titillium-web-900.woff2) format('woff2')}
@font-face{font-family:'Titillium Web';font-weight:700;font-style:italic;src:url(fonts/titillium-web-700-italic.woff2) format('woff2')}
</style>
"""
    # senza Google Fonts: i caratteri sono dentro l'app
    lines = [l for l in head.split('\n') if 'fonts.googleapis.com' not in l and 'fonts.gstatic.com' not in l]
    head = '\n'.join(lines)
    out = ('<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
           '<meta name="theme-color" content="#e10a1e">\n'
           '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}</style>\n'
           + fonts + head + '\n</head>\n<body>\n' + body.strip() + '\n</body>\n</html>\n')
    www = root / 'www'
    if www.exists():
        shutil.rmtree(www)
    (www / 'fonts').mkdir(parents=True)
    (www / 'index.html').write_text(out, encoding='utf-8')
    for f in (root / 'fonts').glob('*.woff2'):
        shutil.copy(f, www / 'fonts' / f.name)
    shutil.copy(root / 'privacy.html', www / 'privacy.html')
    print(f'www/index.html generato ({len(out) // 1024} KB) per l\'app Android')
else:
    head_tpl = (root / 'tools' / 'head.html').read_text(encoding='utf-8')
    out = head_tpl + head + '\n</head>\n<body>\n' + body.strip() + '\n</body>\n</html>\n'
    (root / 'index.html').write_text(out, encoding='utf-8')
    print(f'index.html generato ({len(out) // 1024} KB)')
