import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
const script = 'packs/e2e-deploy/scripts/wait-for-deploy.mjs';
const run = args => new Promise(resolve => {
  const child = spawn(process.execPath, [script, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  let output = ''; let killed = false;
  child.stdout.on('data', x => output += x); child.stderr.on('data', x => output += x);
  const timer = setTimeout(() => { killed = true; child.kill(); }, 2500);
  child.on('close', code => { clearTimeout(timer); resolve({code, output, killed}); });
});
test('deployment poller bounds requests, rejects redirects and hides markers', async () => {
  let destinationHits = 0;
  const server = createServer((req, res) => {
    if (req.url === '/hang') return;
    if (req.url === '/redirect') { res.writeHead(302, {Location:'/destination'}); res.end(); return; }
    if (req.url === '/destination') { destinationHits++; res.end('private-marker'); return; }
    if (req.url === '/big') { res.end('x'.repeat(1024 * 1024 + 1) + 'private-marker'); return; }
    res.end('private-marker');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const options = ['--marker','private-marker','--timeout','0.2','--interval','0.01'];
  try {
    const good = await run([base, ...options]); assert.equal(good.code, 0); assert.ok(!good.output.includes('private-marker'));
    for (const path of ['/hang','/redirect','/big']) {
      const result = await run([base + path, ...options]);
      assert.equal(result.killed, false, path); assert.equal(result.code, 1, path);
      assert.ok(!result.output.includes('private-marker')); assert.ok(!result.output.includes(base));
    }
    assert.equal(destinationHits, 0);
    for (const args of [['file:///private'], ['http://private-user:private-pass@127.0.0.1/'], [base,'--timeout','NaN'], [base,'--interval','0']]) {
      const result = await run(args); assert.equal(result.code, 1); assert.ok(!result.output.includes('private-pass'));
    }
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
