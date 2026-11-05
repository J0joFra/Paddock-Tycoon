# tools

`mktracks.py` converte il GeoJSON di [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits)
(licenza MIT, © Tomislav Bacinger) nei tracciati SVG normalizzati usati in `index.html` (costante `TRACKS`).

```bash
curl -sSLo f1-circuits.geojson https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson
python3 tools/mktracks.py f1-circuits.geojson tracks.js
```
