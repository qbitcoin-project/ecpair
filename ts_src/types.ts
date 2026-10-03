import * as v from 'valibot';

const Uint32Schema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(0xffffffff),
);

const Uint8Schema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(0xff),
);

export const NetworkSchema = v.object({
  messagePrefix: v.union([v.string(), v.instance(Uint8Array)]),
  bech32: v.string(),
  bip32: v.object({
    public: Uint32Schema,
    private: Uint32Schema,
  }),
  pubKeyHash: Uint32Schema,
  scriptHash: Uint32Schema,
  wif: Uint8Schema,
  addrMagic: v.optional(v.instance(Uint8Array)),
});

export const Buffer256Bit = v.pipe(v.instance(Uint8Array), v.length(32));
