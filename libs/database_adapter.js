const fs = require('fs');

const mongoose = require('mongoose');
const Q = require('q');

const config = require('./../config');

const New = require('./../models/new');
const Account = require('./../models/account');

const initCollection = (collectionName) => {
  return mongoose.connection.db.dropCollection(collectionName).catch((err) => {
    // The collection doesn't exist.
    console.log("Collection", collectionName, "doesn't exist.")
    return null;
  })
}

const resetDB = () => {
  return Q.allSettled(config.database.collectionNames.map((name) => {
    return initCollection(name);
  })).then(() => {
    Account.register(new Account({
      username : "any",
      first: "first",
      last: "last",
      email: "a@g.com",
      question1: "q1",
      security1: "aaa",
      question2: "q4",
      security2: "bbb",
      subscription: {
        "politics": false,
        "health": false,
        "entertainment": true,
        "tech": false,
        "travel": true,
        "sports": true,
        "opinion": false,
      },
    }), "any", (err, account) => {});
    console.log("Initializes the database successfully.");
  }, () => {
    console.log("Initialization of the database fails.");
  });
}

const readCrawlerResult = () => {
  const readFile = Q.denodeify(fs.readFile);
  return readFile(config.crawler.resultLocation).catch((err) => {
    console.log("Reading the crawler's result fails.");
  }).then((crawlerResult) => {
    return JSON.parse(crawlerResult);
  }).then((resultArray) => {
    console.log("Read the crawler's result successfully.");
    return New.create(resultArray);
  });
}

const initDB = () => {
  mongoose.connect(config.database.url, {
    useMongoClient: true,
  }, (err) => {
    if (err) {
      console.log("Database connection fails");
    }
  });

  mongoose.connection.once('connected', () => {
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
      });
    });

    resetDB(mongoose).then(() => {
      return readCrawlerResult();
    }).then(() => {
      console.log("Initialization completes.");
    }, () => {
      console.log("Initialization fails.");
    });
  });

}

const viewNews = () => {
  return New.find({});
}

module.exports = {
  initDB,
  readCrawlerResult,
  viewNews,
}
