import { createVerifier } from '@authaction/node-sdk';
import { apolloContext } from '@authaction/node-sdk/apollo';

const verifier = createVerifier({
  domain: process.env.AUTHACTION_DOMAIN,
  audience: process.env.AUTHACTION_AUDIENCE,
});

export const buildContext = apolloContext(verifier);
