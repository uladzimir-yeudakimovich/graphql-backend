exports.typeDefAuthor = `
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

exports.authorResolvers = {
  Author: {
    books: () => {
      
    },
  }
};