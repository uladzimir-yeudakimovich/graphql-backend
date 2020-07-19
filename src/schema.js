const { makeExecutableSchema } = require('@graphql-tools/schema');
const { merge } = require('lodash');

const { typeDefAuthor, authorResolvers } = require('./author.js');
const { typeDefBook, bookResolvers } = require('./book.js');
const { typeDefPerson, personResolvers } = require('./person.js');

const Query = `
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
`;

const Mutation = `
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
      favoriteGenre: String!
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

const Subscription = `
  type Subscription {
    personAdded: Person!
  }  
`;

exports.schema = makeExecutableSchema({
  typeDefs: [ Query, Mutation, Subscription, typeDefPerson, typeDefAuthor, typeDefBook ],
  resolvers: merge(personResolvers, authorResolvers, bookResolvers)
});