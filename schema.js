const { UserInputError, gql } = require('apollo-server');
const uuid = require('uuid/v1');

let authors = require('./data/authors');
let books = require('./data/books');
let persons = require('./data/persons');

const typeDefs = gql`
  type Author {
    name: String!
    born: Int!
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
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
    editNumber(
      name: String!
      phone: String!
    ): Person
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
      } else if (args.author) {
        return books.filter(el => el.author === args.author)
      } else if (args.genre) {
        return books.filter(el => el.genres.indexOf(args.genre) > -1)
      }
    },
    findBook: (root, args) =>
      books.find(p => p.title === args.title),
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if (!args.phone) {
        return persons
      }
      const byPhone = (person) =>
        args.phone === 'YES' ? person.phone : !person.phone
      return persons.filter(byPhone)
    },
    findPerson: (root, args) =>
      persons.find(p => p.name === args.name)
  },
  Person: {
    name: (root) => root.name,
    phone: (root) => root.phone,
    address: (root) => {
      return { 
        street: root.street,
        city: root.city
      }
    },
    id: (root) => root.id
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find(p => p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name,
        })
      }

      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    },
    editNumber: (root, args) => {
      const person = persons.find(p => p.name === args.name)
      if (!person) {
        return null
      }
  
      const updatedPerson = { ...person, phone: args.phone }
      persons = persons.map(p => p.name === args.name ? updatedPerson : p)
      return updatedPerson
    }
  }
};

module.exports = { typeDefs, resolvers };