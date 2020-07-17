
const User = require('./models/user');

export const typeDef = `
  type Person {
    name: String!
    phone: String
    address: Address!
    friendOf: [User!]!
    id: ID!
  }

  type Address {
    street: String!
    city: String! 
  }

  enum YesNo {
    YES
    NO
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }
`;

export const resolvers = {
  Person: {
    address: (root) => {
      return { 
        street: root.street,
        city: root.city
      }
    },
    friendOf: async (root) => {
      const friends = await User.find({
        friends: {
          $in: [root._id]
        } 
      })

      return friends
    }
  },
};