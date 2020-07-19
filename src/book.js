exports.typeDefBook = `
  extend type Query {
    book(id: Int!): Book
  }

  type Book {
    title: String!
    published: Int!
    author: String!
    genres: [String!]!
    id: ID!
  }
`;

exports.bookResolvers = {
  Book: {
    author: () => {
      
    },
  }
};