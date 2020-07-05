const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');

const { JWT_SECRET_KEY } = require('./common/config');
const connectToDb = require('./db/db');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify( auth.substring(7), JWT_SECRET_KEY );
      // const currentUser = await User.findById(decodedToken.id).populate('friends');
      const currentUser = await User.findById(decodedToken.id).populate('favoriteGenre');
      return { currentUser };
    }
  }
});

connectToDb(() => {
  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
  });
});
