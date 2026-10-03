# @qbtc/ecpair
[![Github CI](https://github.com/qbitcoin-project/ecpair/actions/workflows/main_ci.yml/badge.svg)](https://github.com/qbitcoin-project/ecpair/actions/workflows/main_ci.yml) [![NPM](https://img.shields.io/npm/v/@qbtc/ecpair.svg)](https://www.npmjs.org/package/@qbtc/ecpair) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A fork of [bitcoinjs/ecpair](https://github.com/bitcoinjs/ecpair) with QBitcoin network definitions. Written in TypeScript with CommonJS and ES module builds committed to git.

**Note** `ECPair`.makeRandom() uses the `crypto.getRandomValues` if there is no custom `rng` function provided. This API currently is still an experimental feature as of Node.js 18.19.0. To work around this you can do one of the following:
1. Use a polyfill for crypto.getRandomValues()
2. Use the `--experimental-global-webcrypto` flag when running node.js.
3. Pass in a custom rng function to generate random values.

## Example

TypeScript

``` typescript
import { Signer, SignerAsync, ECPairInterface, ECPairFactory, ECPairAPI, TinySecp256k1Interface } from '@qbtc/ecpair';
import * as crypto from 'crypto';

// You need to provide the ECC library. The ECC library must implement 
// all the methods of the `TinySecp256k1Interface` interface.
const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
const ECPair: ECPairAPI = ECPairFactory(tinysecp);

// You don't need to explicitly write ECPairInterface, but just to show
// that the keyPair implements the interface this example includes it.

// From WIF
const keyPair1: ECPairInterface = ECPair.fromWIF('KynD8ZKdViVo5W82oyxvE18BbG6nZPVQ8Td8hYbwU94RmyUALUik');
// Random private key
const keyPair2 = ECPair.fromPrivateKey(crypto.randomBytes(32));
// OR (uses randombytes library, compatible with browser)
const keyPair3 = ECPair.makeRandom();
// OR use your own custom random buffer generator BE CAREFUL!!!!
const customRandomBufferFunc = (size: number): Buffer => crypto.randomBytes(size);
const keyPair4 = ECPair.makeRandom({ rng: customRandomBufferFunc });
// From pubkey (33 or 65 byte DER format public key)
const keyPair5 = ECPair.fromPublicKey(keyPair1.publicKey);

// Pass a custom network
const network = {}; // Your custom network object here
ECPair.makeRandom({ network });
ECPair.fromPrivateKey(crypto.randomBytes(32), { network });
ECPair.fromPublicKey(keyPair1.publicKey, { network });
// fromWIF will check the WIF version against the network you pass in
// pass in multiple networks if you are not sure
ECPair.fromWIF('wif key...', network);
const network2 = {}; // Your custom network object here
const network3 = {}; // Your custom network object here
ECPair.fromWIF('wif key...', [network, network2, network3]);
```

## Development

CI runs on pull requests, pushes to `main`, and `ecpair-v*` tags using Node.js 22.
Run the same checks locally:

```sh
npm ci
npm test
npm run lint:tests
npm run gitdiff:ci
npm run pack:check
```

Tests measure coverage of the TypeScript sources with a 90% minimum for lines,
branches, and functions. The package check loads both CJS and ESM exports from
an actual npm archive and checks public keys, WIF, and signature verification.
`npm pack` and `npm publish` rebuild the library through `prepack`.

## Releases

GitLab remains the primary `origin`. Push `main` and the selected release tag
separately to `qbitcoin-project/ecpair` on GitHub. Only GitHub Actions publishes
to npm; pushing to GitLab alone does not publish a package.

Configure the GitHub repository secret `NPM_TOKEN` with permission to publish
`@qbtc/ecpair`. Publication uses npm provenance and requires this repository to
be public. Keep `repository.url` in `package.json` aligned with the GitHub URL.

For each release, update `version` in `package.json` and both root version fields
in `package-lock.json`, run the checks, and commit the changes. Create an
`ecpair-vX.Y.Z` tag on that commit, with `X.Y.Z` matching the package version.
For example, when releasing version `4.0.0`:

```sh
git tag ecpair-v4.0.0
git push origin main refs/tags/ecpair-v4.0.0
git push git@github.com:qbitcoin-project/ecpair.git main refs/tags/ecpair-v4.0.0
```

The tag push to GitHub runs all checks and then publishes `@qbtc/ecpair` publicly
with provenance. A mismatched tag fails before publication. Branch pushes and
pull requests only run checks. Upstream `v*` tags do not trigger publication.

## LICENSE [MIT](LICENSE)
Written and tested by [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) contributors since 2014.
