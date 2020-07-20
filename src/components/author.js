const { UserInputError } = require('apollo-server');

const Author = require('../models/author');
const Book = require('../models/book');

const typeDefAuthor = `
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }
`;

const authorResolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: async () => {
      return (await Author.find({})).map(async el => {
        const { name, born, id } = el;
        const bookCount = (await Book.find({author: name})).length;
        return { name, born, id, bookCount };
      });
    },
    findAuthor: (root, args) => Author.findOne({ name: args.name }),
  },
  Mutation: {
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
  
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
  
      author.born = args.setBornTo;
      try {
        await author.save();
      } catch (error) {
        throw new UserInputError(error._message, {
          invalidArgs: args,
        });
      }
      return author;
    }
  }
};

module.exports = { typeDefAuthor, authorResolvers };