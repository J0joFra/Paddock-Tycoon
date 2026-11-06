// Partita online in rete locale (BroadcastChannel, senza Firebase): due schede, affare, disconnessione.
const test = require('node:test');
const assert = require('node:assert');
const { context, open, closeBrowser } = require('./helpers');

test.after(closeBrowser);

test('stanza online: ingresso, turni sincronizzati e subentro CPU', { timeout: 180000 }, async () => {
  const ctx = await context({ extra: { 'paddock-tycoon-localnet': '1' } });
  const { pg: A, errors: ea } = await open(ctx, { clock: false });
  const { pg: B, errors: eb } = await open(ctx, { clock: false });
  await A.click('#menu [data-act=online]');
  await A.fill('#oname', 'Anna');
  await A.click('[data-act=create]');
  await A.waitForTimeout(600);
  const code = (await A.textContent('.code')).trim();
  await B.click('#menu [data-act=online]');
  await B.fill('#oname', 'Bruno');
  await B.fill('#ocode', code);
  await B.click('[data-act=join]');
  await A.waitForTimeout(900);
  const seats = await A.$$eval('.seat b', e => e.map(x => x.textContent));
  assert.ok(seats.includes('Anna') && seats.includes('Bruno'), 'entrambi in sala: ' + seats);

  await A.evaluate(() => { setup.fast = true; });
  await A.click('[data-act=ostart]');
  const act = async pg => {
    const ch = await pg.$('#sheet:not(.ro) [data-choice]:not([disabled])');
    if (ch && (await ch.isVisible())) { await ch.click({ timeout: 1500 }).catch(() => {}); return; }
    if (await pg.$('[data-act=tr-send]')) { await pg.click('[data-act=tr-cancel]'); return; }
    for (const s of ['#actions [data-act=buy]:not([disabled])', '#actions [data-act=roll]:not([disabled])', '#actions [data-act=end]:not([disabled])']) {
      const e = await pg.$(s);
      if (e && (await pg.evaluate(() => document.querySelector('#backdrop').hidden))) { await e.click({ timeout: 1500 }).catch(() => {}); return; }
    }
  };
  let st;
  for (let k = 0; k < 200; k++) {
    await act(A);
    await act(B);
    await A.waitForTimeout(250);
    st = await A.evaluate(() => S && { round: S.round });
    if (st && st.round >= 3) break;
  }
  assert.ok(st && st.round >= 3, 'la partita avanza');
  await A.waitForTimeout(800);
  const host = await A.evaluate(() => S.players.map(p => p.name + ':' + p.cash));
  const guest = await B.evaluate(() => S.players.map(p => p.name + ':' + p.cash));
  assert.deepStrictEqual(guest, host, 'ospite sincronizzato con l\'host');

  await B.close();
  await A.waitForTimeout(1500);
  for (let k = 0; k < 40; k++) { await act(A); await A.waitForTimeout(250); }
  const bruno = await A.evaluate(() => S.players.find(p => p.name === 'Bruno'));
  assert.ok(bruno.cpu || bruno.out, 'dopo l\'uscita Bruno passa alla CPU');
  await ctx.close();
  assert.deepStrictEqual(ea, []);
  assert.deepStrictEqual(eb, []);
});
