import secp256k1 from 'secp256k1';

export const getPublicKeyFromPublicKeyJwk = (publicKeyJwk: any) => {
  const uncompressed = Buffer.concat([
    Buffer.from('04', 'hex'),
    Buffer.from(publicKeyJwk.x, 'base64'),
    Buffer.from(publicKeyJwk.y, 'base64'),
  ]);
  const compressedPublicKey = secp256k1.publicKeyConvert(
    uncompressed,
    true,
    new Uint8Array(33)
  );
  return compressedPublicKey;
};
