import { GraphQLError } from 'graphql';

function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
    });
  }
}

export const resolvers = {
  Query: {
    publicMessage: () => ({
      message: 'This is a public message!',
    }),

    protectedMessage: (_parent, _args, context) => {
      requireAuth(context);
      return {
        message: 'This is a protected message!',
        sub: context.user.sub,
      };
    },
  },
};
