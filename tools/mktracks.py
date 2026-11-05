import json, math, sys
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
by = {f['properties']['id']: f for f in d['features']}
MAP = {'MIA':'us-2022','LVG':'us-2023','LUS':'qa-2004','BHR':'bh-2002','JED':'sa-2021','ABU':'ae-2009',
       'SIN':'sg-2008','SHA':'cn-2004','SUZ':'jp-1962','COA':'us-2012','MEX':'mx-1962','INT':'br-1940',
       'SPA':'be-1925','MTL':'ca-1978','HUN':'hu-1986','SIL':'gb-1948','MZA':'it-1922','MON':'mc-1929'}
res = {}
for code, fid in MAP.items():
    c = by[fid]['geometry']['coordinates']
    lat0 = sum(p[1] for p in c)/len(c)
    k = math.cos(math.radians(lat0))
    pts = [(p[0]*k, -p[1]) for p in c]
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    w=max(xs)-min(xs); h=max(ys)-min(ys); s=100/max(w,h)
    pts=[((x-min(xs))*s,(y-min(ys))*s) for x,y in pts]
    W=round(w*s,1); H=round(h*s,1)
    dpath='M'+' '.join(f'{x:.1f} {y:.1f}' for x,y in pts)+'Z'
    res[code]={'w':W,'h':H,'d':dpath}
js='const TRACKS='+json.dumps(res,separators=(',',':'))+';'
open(out,'w').write(js)
print(len(js))
