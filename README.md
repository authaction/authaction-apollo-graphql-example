# authaction-apollo-graphql-example

An Apollo GraphQL server demonstrating API authorization using [AuthAction](https://app.authaction.com/) with JWKS-based JWT validation.

## Overview

This application shows how to configure and handle authorization using AuthAction's access tokens in an Apollo GraphQL API. It validates JSON Web Tokens (JWT) signed with RS256 by fetching public keys dynamically from AuthAction's JWKS endpoint. The decoded payload is injected into the Apollo context and protected resolvers enforce authentication via a `requireAuth` helper.

## Prerequisites

- **Node.js 18+**
- **AuthAction credentials**: `tenantDomain` and `apiIdentifier` from your AuthAction account.

## Installation

1. **Clone the repository**:

   ```bash
   git clone git@github.com:authaction/authaction-apollo-graphql-example.git
   cd authaction-apollo-graphql-example
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure your AuthAction credentials**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and replace the placeholders:

   ```env
   AUTHACTION_DOMAIN=your-authaction-tenant-domain
   AUTHACTION_AUDIENCE=your-authaction-api-identifier
   ```

## Usage

1. **Start the server**:

   ```bash
   npm start
   ```

   The GraphQL server will be available at `http://localhost:4000`.

2. **Obtain an access token** via client credentials:

   ```bash
   curl --request POST \
     --url https://your-authaction-tenant-domain/oauth2/m2m/token \
     --header 'content-type: application/json' \
     --data '{
       "client_id": "your-authaction-app-clientid",
       "client_secret": "your-authaction-app-client-secret",
       "audience": "your-authaction-api-identifier",
       "grant_type": "client_credentials"
     }'
   ```

3. **Query the public resolver** (no token required):

   ```bash
   curl --request POST \
     --url http://localhost:4000/ \
     --header 'content-type: application/json' \
     --data '{"query": "{ publicMessage { message } }"}'
   ```

   ```json
   { "data": { "publicMessage": { "message": "This is a public message!" } } }
   ```

4. **Query the protected resolver** with the access token:

   ```bash
   curl --request POST \
     --url http://localhost:4000/ \
     --header 'content-type: application/json' \
     --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
     --data '{"query": "{ protectedMessage { message sub } }"}'
   ```

   ```json
   { "data": { "protectedMessage": { "message": "This is a protected message!", "sub": "client-id@clients" } } }
   ```

## Project Structure

```
authaction-apollo-graphql-example/
├── src/
│   ├── auth.js        # JWKS client, verifyToken, buildContext
│   ├── schema.js      # GraphQL type definitions
│   ├── resolvers.js   # Resolvers with requireAuth helper
│   └── index.js       # Apollo Server setup
├── .env.example
├── package.json
└── README.md
```

## Code Explanation

### `src/auth.js` — JWT Validation

- **`jwksClient`** — Initialises a `jwks-rsa` client pointed at AuthAction's JWKS
  endpoint. Keys are cached in-process for 1 hour with automatic rotation
  handling — when a `kid` is not found the client re-fetches the JWKS.

- **`verifyToken(token)`** — Validates the JWT using `jsonwebtoken` with:
  - Algorithm: `RS256`
  - Issuer: `https://{AUTHACTION_DOMAIN}`
  - Audience: `{AUTHACTION_AUDIENCE}`

- **`buildContext({ req })`** — Apollo Server context function. Extracts the
  `Bearer` token from the `Authorization` header, calls `verifyToken`, and
  returns `{ user: payload }` on success or `{ user: null }` on failure.

### `src/resolvers.js` — Resolvers

- **`requireAuth(context)`** — Throws a `GraphQLError` with code
  `UNAUTHENTICATED` if `context.user` is null.
- **`publicMessage`** — No auth check, accessible without a token.
- **`protectedMessage`** — Calls `requireAuth(context)` before returning the
  payload's `sub`.

## Common Issues

**Invalid token errors** — Verify that `AUTHACTION_DOMAIN` and
`AUTHACTION_AUDIENCE` match the values in your AuthAction dashboard exactly.

**Public key fetching errors** — Check that your application can reach
`https://{AUTHACTION_DOMAIN}/.well-known/jwks.json`.

**Unauthorized access** — Ensure the `Authorization: Bearer <token>` header is
present and the token was issued for the correct audience.

## Contributing

Feel free to submit issues or pull requests if you encounter bugs or have suggestions for improvement!
