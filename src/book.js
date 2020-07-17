export const typeDef = `
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

export const resolvers = {
  Book: {
    author: () => {
      
    },
  }
};