// La sfida del giorno è riproducibile: due partite giocate allo stesso modo finiscono identiche.
const test = require('node:test');
const assert = require('node:assert');
const { context, open, closeBrowser } = require('./helpers');

test.after(closeBrowser);

async function play() {
  const ctx = await context();
  const { pg, errors } = await open(ctx);
  await pg.click('#menu [data-act=daily]');
  for (let k = 0; k < 2500; k++) {
    await pg.clock.runFor(700);
    const ch = await pg.$('#sheet [data-choice]:not([disabled])');
    if (ch) {
      const alt = (await pg.$('#sheet [data-choice=pass]')) || (await pg.$('#sheet [data-choice=no]')) || (await pg.$('#sheet [data-choice=pay]:not([disabled])'));
      await (alt || ch).click();
      continue;
    }
    if (await pg.$('[data-act=tr-cancel]')) { await pg.click('[data-act=tr-cancel]'); continue; }
    for (const s of ['#actions [data-act=buy]:not([disabled])', '#actions [data-act=roll]:not([disabled])', '#actions [data-act=end]:not([disabled])']) {
      const e = await pg.$(s);
      if (e && (await pg.evaluate(() => document.querySelector('#backdrop').hidden))) { await e.click(); break; }
    }
    if (await pg.evaluate(() => S && S.over)) break;
  }
  await pg.clock.runFor(3000);
  const res = await pg.evaluate(() => ({ over: S.over, rng: S.rngN, cash: S.players.map(p => p.name + ':' + p.cash + (p.out ? '(out)' : '')), daily: !!S.daily }));
  await ctx.close();
  return { res, errors };
}

test('sfida del giorno deterministica', { timeout: 300000 }, async () => {
  const a = await play();
  const b = await play();
  assert.deepStrictEqual(a.errors, []);
  assert.deepStrictEqual(b.errors, []);
  assert.ok(a.res.over && a.res.daily, 'la sfida deve arrivare alla fine');
  assert.deepStrictEqual(a.res, b.res);
});
