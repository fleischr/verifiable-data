import { CompactSign } from 'jose/jws/compact/sign';
import { parseJwk } from 'jose/jwk/parse';
import { compactVerify } from 'jose/jws/compact/verify';

const encoder = new TextEncoder();

const crvToAlg: any = {
  secp256k1: 'ES256K',
};

export const sign = async (header: any, payload: any, privateKeyJwk: any) => {
  const alg = crvToAlg[privateKeyJwk.crv];
  const jws = await new CompactSign(
    encoder.encode(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    )
  )
    .setProtectedHeader({ ...header, alg })
    .sign(await parseJwk(privateKeyJwk, alg));
  return jws;
};

export const verify = async (jws: string, publicKeyJwk: any) => {
  let verified = false;
  const alg = crvToAlg[publicKeyJwk.crv];
  try {
    const { protectedHeader } = await compactVerify(
      jws,
      await parseJwk(publicKeyJwk, alg)
    );
    if (protectedHeader.alg !== alg) {
      throw new Error('Invalid alg.');
    }
    verified = true;
  } catch (e) {
    verified = false;
  }
  return verified;
};
