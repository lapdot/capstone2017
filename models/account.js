const mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Subscription = new Schema({
  politics: Boolean,
  health: Boolean,
  entertainment: Boolean,
  tech: Boolean,
  travel: Boolean,
  sports: Boolean,
  opinion: Boolean
});

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
  subscription: Subscription,
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account, 'accounts');
