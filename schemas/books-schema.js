const { gql } = require('apollo-server');
let books = require('../data/books');

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: Array!
  }

  type Query {
    bookCount: Int!
    allBooks: [Book!]!
    findBook(title: String!): Book
  } 
`;

const resolvers = {
  Query: {
    authorCount: () => books.length,
    allAuthors: () => books,
    findAuthor: (root, args) =>
      books.find(p => p.title === args.title)
  }
};

module.exports = { typeDefs, resolvers };