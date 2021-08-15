import * as help from "../../__fixtures__/test-help";
import * as fixtures from "../../__fixtures__";
import transmute from "../../__fixtures__/test-transmute";

let suite1: any;
const document1 = { ...fixtures.credentials.credential1 };
let document2: any;

let proof1: any;
let proof2: any;

beforeAll(async () => {
  suite1 = await help.getSuite(
    fixtures.keys.key1,
    transmute.Bls12381G2KeyPair,
    transmute.BbsBlsSignature2020
  );
});

it("issue", async () => {
  proof1 = await suite1.createProof({
    document: { ...document1 },
    purpose: {
      update: (proof: any) => {
        proof.proofPurpose = "assertionMethod";
        return proof;
      },
    },
    documentLoader: fixtures.documentLoader,
    compactProof: true,
  });
  expect(proof1).toBeDefined();
});

it("derive", async () => {
  const suite = new transmute.BbsBlsSignatureProof2020();
  // console.log(document1);
  const result: any = await suite.deriveProof({
    document: { ...document1 },
    proof: {
      ...proof1,
      "@context": document1["@context"],
    },
    revealDocument: fixtures.frames.frame1,
    documentLoader: fixtures.documentLoader,
  });
  document2 = result.document;
  proof2 = result.proof;
  expect(document2).toBeDefined();
  expect(proof2).toBeDefined();
  // console.log(document2);
});

it("verify", async () => {
  const suite = new transmute.BbsBlsSignatureProof2020();
  const result = await suite.verifyProof({
    document: { ...document2 },
    proof: { ...proof2, "@context": document2["@context"] },
    purpose: {
      // ignore validation of dates and such...
      validate: () => {
        return { valid: true };
      },
      update: (proof: any) => {
        proof.proofPurpose = "assertionMethod";
        return proof;
      },
    },
    documentLoader: fixtures.documentLoader,
  });
  expect(result.verified).toBe(true);

  expect(document2.credentialSubject.alsoKnownAs).toBe(
    "did:example:ebfeb1f712ebc6f1c276e12ec21"
  );
});
