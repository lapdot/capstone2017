const mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;
const Schema = mongoose.Schema;

const New = new Schema({
  Category: String,
  Headline: String,
  URL: String,
  ReporterName: String,
  PubTime: String,
  Source: String,
  Paragraph1: String,
  Paragraph2: String,
});

const NewsAtATime = new Schema({
  Time: Number,
  News: [New],
});

module.exports = mongoose.model('NewsAtATime', NewsAtATime, 'news');
