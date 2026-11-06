#!/usr/bin/env python3
"""Genera index.html a partire da src/game.html.

src/game.html è il gioco completo in un unico file (stili, markup e script), pensato anche
per l'anteprima come artifact: non ha <html>, <head> né <body>. Questo script aggiunge
l'intestazione della web app (manifest, icone, meta per Android/iOS) presa da tools/head.html.

Uso:  python3 tools/build.py
"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / 'src' / 'game.html').read_text(encoding='utf-8')
head_tpl = (root / 'tools' / 'head.html').read_text(encoding='utf-8')

split = src.index('</style>') + len('</style>')
head, body = src[:split], src[split:]
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')

out = head_tpl + head + '\n</head>\n<body>\n' + body.strip() + '\n</body>\n</html>\n'
(root / 'index.html').write_text(out, encoding='utf-8')
print(f'index.html generato ({len(out) // 1024} KB)')
