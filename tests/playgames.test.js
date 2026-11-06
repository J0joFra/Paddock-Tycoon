// Ponte verso Google Play Games con un plugin finto: obiettivi e punteggi vengono inviati a fine partita.
const test = require('node:test');
const assert = require('node:assert');
const { context, open, closeBrowser } = require('./helpers');

test.after(closeBrowser);

test('Play Games: obiettivi e classifiche a fine partita', { timeout: 120000 }, async () => {
  const ctx = await context();
  await ctx.addInitScript(() => {
    window.__calls = [];
    const mk = n => a => { window.__calls.push(n + ' ' + JSON.stringify(a || {})); return Promise.resolve(n === 'status' ? { signedIn: false } : n === 'signIn' ? { signedIn: true } : {}); };
    window.Capacitor = {
      isNativePlatform: () => true,
      registerPlugin: n => n === 'App' ? { addListener: () => {}, exitApp: () => {} }
        : { status: mk('status'), signIn: mk('signIn'), unlock: mk('unlock'), submitScore: mk('submitScore'), showAchievements: mk('showAchievements'), showLeaderboard: mk('showLeaderboard') },
    };
  });
  const { pg, errors } = await open(ctx, { clock: false });
  await pg.evaluate(() => { for (const k in PGS_IDS.ach) PGS_IDS.ach[k] = 'ach_' + k; PGS_IDS.lb.networth = 'lb_nw'; PGS_IDS.lb.wins = 'lb_w'; });
  await pg.click('[data-act=pgsach]');
  await pg.waitForTimeout(300);
  await pg.click('[data-act=newsingle]');
  await pg.click('[data-act=start]');
  for (let k = 0; k < 20; k++) {
    const c = await pg.$('[data-choice=roll]'); if (c) await c.click();
    await pg.waitForTimeout(500);
    const g = await pg.$('[data-choice=go]'); if (g) { await g.click(); break; }
  }
  await pg.evaluate(() => {
    GEN++; cpuActive = false; busy = false; S.turn = 0;
    S.own[1] = { owner: 0, level: 0, mort: false }; S.own[3] = { owner: 0, level: 0, mort: false };
    S.phase = 'buy'; S.pending = 4; render(); buy();
    S.own[4].level = 3; S.players[0].cash = 5000; upgrade(4); S.players[0].cash = 12000;
    recordHist(); S.players.slice(1).forEach(p => { p.out = true; }); endGame();
  });
  await pg.waitForTimeout(500);
  const calls = await pg.evaluate(() => window.__calls);
  await ctx.close();
  assert.deepStrictEqual(errors, []);
  assert.ok(calls.some(c => c.startsWith('signIn')), 'accesso richiesto');
  assert.ok(calls.some(c => c.startsWith('unlock') && c.includes('ach_first_win')), 'obiettivo sbloccato');
  assert.ok(calls.some(c => c.startsWith('submitScore') && c.includes('lb_nw')), 'punteggio inviato');
});
