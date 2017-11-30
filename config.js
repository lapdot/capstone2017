const path = require('path');

module.exports = {
  database: {
    url: 'mongodb://localhost:27017/capstone2017',
    collectionNames: ['news', 'accounts'],
  },
  crawler: {
    runCommand: 'java -jar ./../News.jar',
    resultLocation: path.join(__dirname , './../../output.json'),
  },
}
