#!/usr/bin/env python3
"""Assembla il gioco dai moduli in src/ e genera le versioni pubblicabili.

Sorgenti:
  src/head.html   titolo, meta e caratteri (in cima al file)
  src/style.css   tutti gli stili
  src/body.html   struttura della pagina
  src/js/NN-*.js  script, in ordine numerico (un modulo per argomento)

Uscite:
  python3 tools/build.py            → dist/game.html (file unico, anche per l'anteprima) e index.html (web app)
  python3 tools/build.py --native   → in più www/ per l'app Android (Capacitor), con i caratteri inclusi
"""
import shutil
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / 'src'


def assemble() -> str:
    head = (src / 'head.html').read_text(encoding='utf-8')
    css = (src / 'style.css').read_text(encoding='utf-8')
    body = (src / 'body.html').read_text(encoding='utf-8')
    js = ''.join(p.read_text(encoding='utf-8') for p in sorted((src / 'js').glob('*.js')))
    return f'{head}<style>\n{css}</style>\n{body}<script>\n{js}</script>'


game = assemble()
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'game.html').write_text(game, encoding='utf-8')

split = game.index('</style>') + len('</style>')
head, body = game[:split], game[split:]
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')

head_tpl = (root / 'tools' / 'head.html').read_text(encoding='utf-8')
web = head_tpl + head + '\n</head>\n<body>\n' + body.strip() + '\n</body>\n</html>\n'
(root / 'index.html').write_text(web, encoding='utf-8')
print(f'dist/game.html e index.html generati ({len(web) // 1024} KB)')

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
    nhead = '\n'.join(l for l in head.split('\n') if 'fonts.googleapis.com' not in l and 'fonts.gstatic.com' not in l)
    out = ('<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
           '<meta name="theme-color" content="#e10a1e">\n'
           '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}</style>\n'
           + fonts + nhead + '\n</head>\n<body>\n' + body.strip() + '\n</body>\n</html>\n')
    www = root / 'www'
    if www.exists():
        shutil.rmtree(www)
    (www / 'fonts').mkdir(parents=True)
    (www / 'index.html').write_text(out, encoding='utf-8')
    for f in (root / 'fonts').glob('*.woff2'):
        shutil.copy(f, www / 'fonts' / f.name)
    shutil.copy(root / 'privacy.html', www / 'privacy.html')
    print(f'www/index.html generato ({len(out) // 1024} KB) per l\'app Android')
