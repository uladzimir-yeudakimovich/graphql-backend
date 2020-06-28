const { UserInputError, gql } = require('apollo-server');
const uuid = require('uuid/v1');

let authors = require('./data/authors');
let books = require('./data/books');
let persons = require('./data/persons');

const Person = require('./models/person');

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    published: Int
    author: String!
    id: ID!
    genres: [String!]!
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
  }  
`;

const resolvers = {
  Query: {
    authorCount: () => authors.length,
    allAuthors: () => {
      const authorsWithBookCount = [];
      authors.forEach(author => {
        author.bookCount = books.filter(book => book.author === author.name).length
        authorsWithBookCount.push(author)
      })
      return authorsWithBookCount
    },
    findAuthor: (root, args) =>
      authors.find(p => p.name === args.name),
    bookCount: () => books.length,
    allBooks: (root, args) => {
      if (!args.author && !args.genre) {
        return books
      } else if (args.author && args.genre) {
        const authorBooks = books.filter(el => el.author === args.author)
        return authorBooks.filter(el => el.genres.indexOf(args.genre) > -1)
      } else if (args.author) {
        return books.filter(el => el.author === args.author)
      } else if (args.genre) {
        return books.filter(el => el.genres.indexOf(args.genre) > -1)
      }
    },
    findBook: (root, args) => books.find(p => p.title === args.title),

    personCount: () => Person.collection.countDocuments(),
    allPersons: (root, args) => {
      if (!args.phone) {
        return Person.find({})
      }
  
      return Person.find({ phone: { $exists: args.phone === 'YES'  }})
    },
    findPerson: (root, args) => Person.findOne({ name: args.name })
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
    addPerson: async (root, args) => {
      const person = new Person({ ...args })

      try {
        await person.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return person
    },
    addBook: (root, args) => {
      if (!authors.find(a => a.name === args.author)) {
        authors.push({
          name: args.author,
          id: uuid()
        })
      }

      const book = { ...args, id: uuid() }
      books = books.concat(book)
      return book
    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })
      person.phone = args.phone

      try {
        await person.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return person
    },
    editAuthor: (root, args) => {
      const author = authors.find(p => p.name === args.name)
      if (!author) {
        return null
      }
  
      const updatedAuthor = { ...author, born: args.setBornTo }
      authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
      return updatedAuthor
    }
  }
};

module.exports = { typeDefs, resolvers };