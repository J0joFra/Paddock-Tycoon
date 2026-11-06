// Utilità comuni ai test: carica dist/game.html (generato da tools/build.py) in un browser vero.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const GAME = path.join(__dirname, '..', 'dist', 'game.html');
const URL = 'http://paddock.test/';

function page() {
  const body = fs.readFileSync(GAME, 'utf8');
  return '<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"></head><body style="margin:0">' + body + '</body></html>';
}

let browser;
async function getBrowser() {
  if (!browser) browser = await chromium.launch();
  return browser;
}
async function closeBrowser() {
  if (browser) await browser.close();
  browser = null;
}

// Nuovo contesto con il gioco servito su URL e preferenze di base (niente tutorial né musica).
async function context({ lang = 'it', extra } = {}) {
  const b = await getBrowser();
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 } });
  const html = page();
  await ctx.route(URL + '**', r => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
  await ctx.addInitScript(([lang, extra]) => {
    try {
      localStorage.setItem('paddock-tycoon-tutorial', '1');
      localStorage.setItem('paddock-tycoon-music', '0');
      localStorage.setItem('paddock-tycoon-lang', lang);
      for (const k in extra || {}) localStorage.setItem(k, extra[k]);
    } catch (e) {}
  }, [lang, extra]);
  return ctx;
}

async function open(ctx, { clock = true } = {}) {
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', e => errors.push(e.message + (process.env.STACK ? '\n' + e.stack : '')));
  if (clock) await pg.clock.install();
  await pg.goto(URL);
  if (clock) await pg.clock.runFor(300); else await pg.waitForTimeout(300);
  return { pg, errors };
}

// Controlli di coerenza dello stato, eseguiti nella pagina a ogni intervallo.
async function installInvariants(pg) {
  await pg.evaluate(() => {
    window.__bad = [];
    setInterval(() => {
      if (!S) return;
      const bad = window.__bad;
      S.players.forEach(p => {
        if (!Number.isFinite(p.cash)) bad.push('soldi non numerici ' + p.name);
        if (p.cash < 0) bad.push('soldi negativi ' + p.name + ' ' + p.cash);
        if (p.pos < 0 || p.pos > 31) bad.push('posizione ' + p.pos);
        if (p.out && propsOf(p).length) bad.push('eliminato con proprietà');
      });
      for (const i in S.own) {
        const o = S.own[i];
        if (SQ[i].t !== 'c' && SQ[i].t !== 'u') bad.push('proprietà su casella non acquistabile ' + i);
        if (o.level < 0 || o.level > 4) bad.push('livello ' + o.level);
        if (o.level > 0 && !ownsGroup(P(o.owner), SQ[i].g)) bad.push('tribune senza gruppo ' + SQ[i].name);
        if (o.mort && o.level > 0) bad.push('ipoteca con tribune');
        if (P(o.owner).out) bad.push('proprietario eliminato');
      }
      if (S.pot < 0) bad.push('montepremi negativo');
    }, 50);
  });
}

module.exports = { getBrowser, closeBrowser, context, open, installInvariants };
