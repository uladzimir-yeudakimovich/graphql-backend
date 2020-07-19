const { UserInputError } = require('apollo-server');
const uuid = require('uuid/v1');

const Author = require('./models/author');
const Book = require('./models/book');

exports.typeDefBook = `
  type Book {
    title: String!
    published: Int!
    author: String!
    genres: [String!]!
    id: ID!
  }
`;

exports.bookResolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    allBooks: (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({})
      } else if (args.author && args.genre) {
        const writer = Book.find({ author: args.author });
        return writer.find({ genres: { $in: [args.genre] } });
      } else if (args.author) {
        return Book.find({ author: args.author })
      } else if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } })
      }
    },
    findBook: (root, args) => Book.findOne({ title: args.title }),
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
  
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      if (!(await Author.findOne({ name: args.author }))) {
        const author = new Author({ name: args.author, id: uuid() });
        try {
          await author.save();
        } catch (error) {
          throw new UserInputError(error._message, {
            invalidArgs: args,
          })
        }
      }

      const book = new Book({ ...args, id: uuid() });
      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error._message, {
          invalidArgs: args,
        })
      }
      return book;
    }
  },
};