const { gql } = require('apollo-server');
let books = require('../data/books');

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    allBooks: [Book!]!
    findBook(title: String!): Book
  } 
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    allBooks: () => books,
    findBook: (root, args) =>
      books.find(p => p.title === args.title)
  }
};

module.exports = { typeDefs, resolvers };