// https://en.bitcoin.it/wiki/List_of_address_prefixes
import * as v from 'valibot';
import { NetworkSchema } from './types';

export type Network = v.InferOutput<typeof NetworkSchema>;

export const bitcoin: Network = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};

export const testnet: Network = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

// QBitcoin uses a custom address format incompatible with Bitcoin.
// The pubKeyHash / scriptHash fields are not used for address encoding —
// the multi-byte `addrMagic` is used instead (consumer-side address logic).
// Forks of QBitcoin can construct their own Network object.

export const qbitcoin: Network = {
  messagePrefix: '\x19QBitcoin Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x139d,
  scriptHash: 0x139d,
  wif: 0x80,
  addrMagic: Uint8Array.from([0x13, 0x9d]),
};

export const qbitcoinTestnet: Network = {
  messagePrefix: '\x19QBitcoin Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x047389,
  scriptHash: 0x047389,
  wif: 0xef,
  addrMagic: Uint8Array.from([0x04, 0x73, 0x89]),
};
