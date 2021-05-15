import { getMultibaseFingerprintFromPublicKeyBytes } from './getMultibaseFingerprintFromPublicKeyBytes';

import { JsonWebKey2020, Bls12381G1Key2020, BlsCurveName } from './types';

import { importableTypes } from './importFrom';
import { exportableTypes } from './exportAs';

import { Bls12381G1KeyPair as MattrBls12381G1KeyPair } from '@mattrglobal/bls12381-key-pair';

import {
  MULTIBASE_ENCODED_BASE58_IDENTIFIER,
  VARIABLE_INTEGER_TRAILING_BYTE,
  BLS12381G1_MULTICODEC_IDENTIFIER,
} from './constants';
import { base58 } from './encoding';

export class Bls12381G1KeyPair {
  public id: string;
  public type: string = 'JsonWebKey2020';
  public controller: string;
  public publicKey: Uint8Array;
  public privateKey?: Uint8Array;

  static async fingerprintFromPublicKey(
    importableType: JsonWebKey2020 | Bls12381G1Key2020
  ) {
    const { publicKey } = await Bls12381G1KeyPair.from(importableType);
    return getMultibaseFingerprintFromPublicKeyBytes(
      BLS12381G1_MULTICODEC_IDENTIFIER,
      publicKey
    );
  }
  static generate = async ({
    secureRandom,
  }: {
    secureRandom: () => Uint8Array;
  }) => {
    const seed = secureRandom();
    const k = await MattrBls12381G1KeyPair.generate({
      seed,
    });
    const fingerprint = k.fingerprint();
    const controller = `did:key:${fingerprint}`;
    const id = `${controller}#${fingerprint}`;

    return new Bls12381G1KeyPair({
      id: id,
      type: 'JsonWebKey2020',
      controller: controller,
      publicKey: Uint8Array.from(k.publicKeyBuffer),
      privateKey: Uint8Array.from(k.privateKeyBuffer as Buffer),
    });
  };

  static from = async (k: JsonWebKey2020 | Bls12381G1Key2020) => {
    const { publicKey, privateKey } = importableTypes[k.type](k as any);
    return new Bls12381G1KeyPair({
      id: k.id,
      type: k.type,
      controller: k.controller,
      publicKey,
      privateKey,
    });
  };

  constructor(opts: {
    id: string;
    type: string;
    controller: string;
    publicKey: Uint8Array;
    privateKey?: Uint8Array;
  }) {
    this.id = opts.id;
    this.type = opts.type || 'JsonWebKey2020';
    this.controller = opts.controller;
    this.publicKey = opts.publicKey;
    this.privateKey = opts.privateKey;
  }

  async fingerprint() {
    const publicKey = this.publicKey;

    const buffer = new Uint8Array(2 + publicKey.length);
    buffer[0] = BLS12381G1_MULTICODEC_IDENTIFIER;
    buffer[1] = VARIABLE_INTEGER_TRAILING_BYTE;

    buffer.set(publicKey, 2);

    return `${MULTIBASE_ENCODED_BASE58_IDENTIFIER}${base58.encode(buffer)}`;
  }

  export(
    options: {
      privateKey?: boolean;
      type: 'JsonWebKey2020' | 'Bls12381G1Key2020';
    } = {
      privateKey: false,
      type: 'JsonWebKey2020',
    }
  ): JsonWebKey2020 | Bls12381G1Key2020 {
    if (exportableTypes[options.type]) {
      return exportableTypes[options.type](
        BlsCurveName.G1,
        this.id,
        this.controller,
        this.publicKey,
        options.privateKey ? this.privateKey : undefined
      );
    }
    throw new Error('Unsupported export options: ' + JSON.stringify(options));
  }

  signer(type: 'Bbs' = 'Bbs') {
    throw new Error('Not implemented for ' + type);
  }
  verifier(type: 'Bbs' = 'Bbs') {
    throw new Error('Not implemented for ' + type);
  }

  async toJsonWebKeyPair(exportPrivateKey = false) {
    console.warn(
      "DEPRECATION WARNING: .toJsonWebKeyPair should be replaced with .export({type:'JsonWebKey2020'})."
    );
    return exportableTypes['JsonWebKey2020'](
      BlsCurveName.G1,
      this.id,
      this.controller,
      this.publicKey,
      exportPrivateKey ? this.privateKey : undefined
    );
  }
}
