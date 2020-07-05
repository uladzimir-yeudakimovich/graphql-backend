const { UserInputError, gql } = require('apollo-server');
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');

const { JWT_SECRET_KEY } = require('./common/config');
const Author = require('./models/author');
const Book = require('./models/book');
const Person = require('./models/person');
const User = require('./models/user');

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: String!
    genres: [String!]!
    id: ID!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
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
    friends: [Person!]!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    authorCount: Int!
    allAuthors: [Author!]!
    findAuthor(name: String!): Author
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    findBook(title: String!): Book
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String!]!
    ): Book

    editNumber(
      name: String!
      phone: String!
    ): Person

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author

    createUser(
      username: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token

    addAsFriend(
      name: String!
    ): User
  }  
`;

const resolvers = {
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

    personCount: () => Person.collection.countDocuments(),
    allPersons: (root, args) => {
      if (!args.phone) {
        return Person.find({})
      }
  
      return Person.find({ phone: { $exists: args.phone === 'YES'  }})
    },
    findPerson: (root, args) => Person.findOne({ name: args.name }),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Person: {
    address: (root) => {
      return { 
        street: root.street,
        city: root.city
      }
    }
  },
  Mutation: {
    addPerson: async (root, args, context) => {
      const person = new Person({ ...args })
      const currentUser = context.currentUser
  
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
  
      try {
        await person.save()
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save()
      } catch (error) {
        throw new UserInputError(error._message, {
          invalidArgs: args,
        })
      }
  
      return person
    },
    addBook: async (root, args) => {
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
    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })
      person.phone = args.phone

      try {
        await person.save()
      } catch (error) {
        throw new UserInputError(error._message, {
          invalidArgs: args,
        })
      }

      return person
    },
    editAuthor: async (root, args) => {
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
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error._message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET_KEY) }
    },
    addAsFriend: async (root, args, { currentUser }) => {
      const nonFriendAlready = (person) => 
        !currentUser.friends.map(f => f._id).includes(person._id)
  
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
  
      const person = await Person.findOne({ name: args.name })
      if ( nonFriendAlready(person) ) {
        currentUser.friends = currentUser.friends.concat(person)
      }
  
      await currentUser.save()
  
      return currentUser
    }
  }
};

module.exports = { typeDefs, resolvers };