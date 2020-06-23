const { gql } = require('apollo-server');
let authors = require('../data/authors');

const typeDefs = gql`
  type Author {
    name: String!
    born: Int!
    id: ID!
  }

  type Query {
    authorCount: Int!
    allAuthors: [Author!]!
    findAuthor(name: String!): Author
  } 
`;

const resolvers = {
  Query: {
    authorCount: () => authors.length,
    allAuthors: () => authors,
    findAuthor: (root, args) =>
      authors.find(p => p.name === args.name)
  }
};

module.exports = { typeDefs, resolvers };