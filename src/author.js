export const typeDef = `
  extend type Query {
    author(id: Int!): Author
  }
  
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }
`;

export const resolvers = {
  Author: {
    books: () => {
      
    },
  }
};