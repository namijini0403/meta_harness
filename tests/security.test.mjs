import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const script = resolve('scripts/check-placeholders.mjs');
test('placeholder report never emits source text', () => {
  const dir = mkdtempSync(join(tmpdir(), 'harness-test-'));
  try {
    writeFileSync(join(dir, 'sample.md'), '{{TODO}} private-student-text');
    const r = spawnSync(process.execPath, [script, 'sample.md'], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 1); assert.ok(!r.stderr.includes('private-student-text'));
  } finally { rmSync(dir, {recursive:true, force:true}); }
});
test('missing target fails rather than claims success', () => {
  const r = spawnSync(process.execPath, [script, 'definitely-missing.md'], {encoding:'utf8'}); assert.equal(r.status, 1);
});
