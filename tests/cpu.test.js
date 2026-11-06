// Partite complete tra CPU con varie regole della casa: nessun errore e stato sempre coerente.
const test = require('node:test');
const assert = require('node:assert');
const { context, open, installInvariants, closeBrowser } = require('./helpers');

test.after(closeBrowser);

const N = +process.env.GAMES || 6;
for (let g = 0; g < N; g++) {
  const n = 2 + (g % 5);
  const champ = g % 3 === 2;
  test(`partita CPU ${g + 1}: ${n} piloti${champ ? ', campionato' : ''}, ${g % 2 ? 'EN' : 'IT'}`, { timeout: 180000 }, async () => {
    const ctx = await context({ lang: g % 2 ? 'en' : 'it' });
    const { pg, errors } = await open(ctx);
    await pg.click(champ ? '[data-act=newchamp]' : '[data-act=newsingle]');
    await pg.evaluate(n => {
      setup.players = setup.players.slice(0, 2);
      while (setup.players.length < n) setup.players.push({ name: 'CPU ' + setup.players.length, cpu: true, color: COLORS[setup.players.length] });
      setup.players.forEach(p => (p.cpu = true));
      setup.diff = ['easy', 'normal', 'shark'][n % 3];
      setup.limit = 30;
      setup.climit = 8;
      Object.assign(setup.rules, { cash: [1000, 1400, 2000][n % 3], auction: n % 2 === 0, under: n % 3 !== 1, pot: n % 2 === 1 });
      showSetup();
    }, n);
    await installInvariants(pg);
    await pg.click('[data-act=start]');
    let finished = false;
    for (let k = 0; k < 600 && !finished; k++) {
      await pg.clock.runFor(3000);
      const go = await pg.$('[data-choice=go]');
      if (go) { await go.click(); continue; }
      const nx = await pg.$('[data-act=nextrace]');
      if (nx) { await nx.click(); continue; }
      finished = await pg.evaluate(() => !!(S && S.over && (!S.champ || S.champ.idx >= S.champ.n - 1)));
    }
    const res = await pg.evaluate(() => ({ bad: [...new Set(window.__bad)].slice(0, 8), round: S.round }));
    await ctx.close();
    assert.deepStrictEqual(errors, [], 'errori JavaScript');
    assert.deepStrictEqual(res.bad, [], 'stato incoerente');
    assert.ok(finished, 'la partita non è finita (giro ' + res.round + ')');
  });
}
