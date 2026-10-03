const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
);
const lock = JSON.parse(
  fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'),
);
assert.equal(pkg.name, '@qbtc/ecpair');
assert.equal(lock.name, pkg.name);
assert.equal(lock.packages[''].name, pkg.name);
assert.equal(lock.version, pkg.version);
assert.equal(lock.packages[''].version, pkg.version);

const temp = fs.mkdtempSync(path.join(root, '.package-check-'));
try {
  // CI builds first. Skip lifecycle scripts so this checks that exact build.
  const [packed] = JSON.parse(
    execFileSync(
      'npm',
      ['pack', '--json', '--ignore-scripts', '--pack-destination', temp],
      { cwd: root, encoding: 'utf8' },
    ),
  );
  assert.equal(packed.name, pkg.name);
  assert.equal(packed.version, pkg.version);
  const files = packed.files.map((file) => file.path);
  for (const required of [
    'package.json',
    'README.md',
    'LICENSE',
    pkg.main,
    pkg.module,
    pkg.types,
  ]) {
    assert.ok(files.includes(required), `Missing package file: ${required}`);
  }
  for (const file of files) {
    assert.ok(
      ['package.json', 'README.md', 'LICENSE'].includes(file) ||
        file.startsWith('src/'),
      `Unexpected package file: ${file}`,
    );
  }
  execFileSync('tar', ['-xzf', path.join(temp, packed.filename), '-C', temp]);
  const unpacked = path.join(temp, 'package');
  const smoke = path.join(unpacked, 'smoke.cjs');
  fs.writeFileSync(
    smoke,
    `
const assert = require('node:assert/strict');
const ecc = require('tiny-secp256k1');
(async () => {
  const cjs = require('@qbtc/ecpair');
  const esm = await import('@qbtc/ecpair');
  const privateKey = new Uint8Array(32);
  privateKey[31] = 1;
  const hash = new Uint8Array(32).fill(7);
  const keys = [cjs, esm].map((api) => {
    assert.equal(typeof api.ECPairFactory, 'function');
    assert.ok(api.networks.qbitcoin);
    assert.ok(api.networks.qbitcoinTestnet);
    return api.ECPairFactory(ecc).fromPrivateKey(privateKey);
  });
  for (const key of keys) {
    assert.equal(Buffer.from(key.publicKey).toString('hex'),
      '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798');
    assert.equal(key.toWIF(), 'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
    for (const verifier of keys) assert.ok(verifier.verify(hash, key.sign(hash)));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
`,
  );
  execFileSync(process.execPath, [smoke], { cwd: unpacked, stdio: 'inherit' });
  console.log(
    `${pkg.name}@${pkg.version}: ${files.length} package files; CJS and ESM passed.`,
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
