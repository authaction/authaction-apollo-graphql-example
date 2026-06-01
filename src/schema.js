export const typeDefs = `#graphql
  type PublicMessage {
    message: String!
  }

  type ProtectedMessage {
    message: String!
    sub: String!
  }

  type Query {
    publicMessage: PublicMessage!
    protectedMessage: ProtectedMessage!
  }
`;
