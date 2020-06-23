const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schemas/persons-schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
});
