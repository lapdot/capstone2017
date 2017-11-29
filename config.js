module.exports = {
  database: {
    url: 'mongodb://localhost:27017/myproject',
    collectionNames: ['news', 'accounts'],
  },
  crawler: {
    runCommand: 'java -jar ./../News.jar',
    resultLocation: __dirname + '/crawler_result/output.json',
  },
}
