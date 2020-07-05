const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3
    },
    // friends: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Person'
    //   }
    // ],
    favoriteGenre: String,
  },
  { versionKey: false }
);

module.exports = mongoose.model('User', schema);