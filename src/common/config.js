const { config } = require('dotenv');
const path = require('path');

config({
  path: path.join(__dirname, '../../.env')
});

module.exports = {
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING
};
