const fs = require('fs');
const child_process = require('child_process');

const mongoose = require('mongoose');
const Q = require('q');

const config = require('./../config');

const NewsAtATime = require('./../models/new');
const Account = require('./../models/account');

let lastUpdateTime = 0.0;

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
    lastUpdateTime = Date.now();
    const newsAtATime = new NewsAtATime({
      Time: lastUpdateTime,
      News: resultArray,
    });
    return newsAtATime.save();
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

    readCrawlerResult().then(() => {
      console.log("Initialization completes.");
      setTimeout(() => {
        updateNews().then((response) => {
          console.log("RESPONSE:", response);
        }, (err) => {
          console.log("ERROR:", err);
        });
      }, 30 * 1000);
      setInterval(() => {
        updateNews().then((response) => {
          console.log("RESPONSE:", response);
        }, (err) => {
          console.log("ERROR:", err);
        });
      }, 3600 * 1000);
    }, () => {
      console.log("Initialization fails.");
    });
  });

}

const viewNews = () => {
  return NewsAtATime.findOne({
    Time: { $gt: lastUpdateTime - 1.0 },
  }).catch((err) => {
    return {
      Time: 0.0,
      News: [],
    }
  });
}

const updateNews = () => {
  console.log("Run: ", config.crawler.runCommand);
  const exec = Q.denodeify(child_process.exec);
  return exec(config.crawler.runCommand).then((stdout, stderr) => {
    return readCrawlerResult().then(() => {
      return { success: 1 };
    }, () => {
      throw new Error('readCrawlerResult');
    });
  }, (err) => {
    console.log("Crawler fails. Return code: ", err.code);
    throw new Error('Crawler');
  });
}

module.exports = {
  initDB,
  resetDB,
  readCrawlerResult,
  viewNews,
  updateNews,
}
