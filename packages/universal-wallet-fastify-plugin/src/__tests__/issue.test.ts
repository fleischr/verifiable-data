import { fastify } from './utils';
const supertest = require('supertest');

let api: any;

beforeAll(async () => {
  await fastify.ready();
  api = supertest(fastify.server);
});

afterAll(() => {
  fastify.close();
});

test('POST `/accounts/123/credentials/issue`', async () => {
  const response = await api
    .post('/accounts/123/credentials/issue')
    .send({
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'http://example.gov/credentials/3732',
        type: ['VerifiableCredential'],
        issuer: {
          id: 'did:web:platform.example:accounts:123',
        },
        issuanceDate: '2010-03-10T04:24:12.164Z',
        credentialSubject: {
          id: 'did:web:platform.example:accounts:123',
        },
      },
      options: {
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:web:platform.example:accounts:123#key-0',
      },
    })
    .expect(201)
    .expect('Content-Type', 'application/json; charset=utf-8');
  expect(response.body.proof.type).toBe('Ed25519Signature2018');
});
