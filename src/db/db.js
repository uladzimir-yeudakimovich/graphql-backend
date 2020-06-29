const mongoose = require('mongoose');

const { MONGO_CONNECTION_STRING } = require('../common/config');

const connectToDb = callback => {
  mongoose.set('useFindAndModify', false);

  mongoose.connect(MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }).then(() => {
      console.log('connected to MongoDB');
      callback();
    })
    .catch((error) => {
      console.log('error connection to MongoDB:', error.message);
    });
};

module.exports = connectToDb;
