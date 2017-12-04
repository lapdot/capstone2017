const mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Account = new Schema({
  username: String,
  password: String,
  first: String,
  last: String,
  email: String,
  question1: String,
  security1: String,
  question2: String,
  security2: String,
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account, 'accounts');
