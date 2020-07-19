const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');

const { JWT_SECRET_KEY } = require('./common/config');
const connectToDb = require('./db/db');
const { schema } = require('./schema');
const User = require('./models/user');

const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = await jwt.verify( auth.substring(7), JWT_SECRET_KEY, async (err, decoded) => {
        if (err) return;
        const currentUser = await User.findById(decoded.id).populate('friends');
        // const currentUser = await User.findById(decoded.id);
        return { currentUser };
      });
      return decodedToken;
    }
  }
});

connectToDb(() => {
  server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`)
    console.log(`Subscriptions ready at ${subscriptionsUrl}`)
  });
});
