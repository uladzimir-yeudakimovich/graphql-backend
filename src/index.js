const { ApolloServer } = require('apollo-server');

const connectToDb = require('./db/db');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

connectToDb(() => {
  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
  });
});
