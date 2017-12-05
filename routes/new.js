const path = require('path');
const databaseAdapter = require('./../libs/database_adapter');

const Account = require('./../models/account');

const topicNames = ['politics', 'health', 'entertainment', 'tech', 'travel', 'sports', 'opinion'];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function cleanJson(data) {
  const cleanedJson = data.map((item) => {
    return {
      Category: item.Category,
      Headline: item.Headline,
      URL: item.URL,
      ReporterName: item.ReporterName,
      PubTime: item.PubTime,
      Source: item.Source,
      Paragraph1: item.Paragraph1,
      Paragraph2: item.Paragraph2,
    }
  });
  return cleanedJson;
}

module.exports = (router) => {
  topicNames.forEach((topicName) => {
    router.get('/' + topicName , (req, res) => {
      databaseAdapter.viewNews().then((output) => {
        const normalizedOutput = cleanJson(output);
        const filteredOutput = normalizedOutput.filter((item) => {
          return (item.Category === capitalizeFirstLetter(topicName));
        });
        res.render('topic', {
          user: req.user,
          topic: topicName,
          topic_first_letter_uppercased: capitalizeFirstLetter(topicName),
          news: filteredOutput,
        });
      });
    });
  });

  router.get('/news', (req, res, next) => {
    if (!req.user) {
      res.redirect('/');
    } else {
      next();
    }
  }, (req, res, next) => {
    databaseAdapter.viewNews().then((output) => {
      const normalizedOutput = cleanJson(output);
      const subscription = req.user.subscription;
      const selectedTopics = topicNames.filter((topicName) => {
        return subscription[topicName];
      });
      /*
      if (selectedTopics.length !== 3) {
        console.log('Number of topics is not 3.');
        var err = new Error('Number of topics is not 3.');
        err.status = 500;
        next(err);
      }
      */
      const categoriedOutput = selectedTopics.map((topicName) => {
        return {
          topic: topicName,
          topic_first_letter_uppercased: capitalizeFirstLetter(topicName),
          news: normalizedOutput.filter((item) => {
            return (item.Category === capitalizeFirstLetter(topicName));
          }),
        }
      });
      res.render('news', {
        user: req.user,
        categoried_news: categoriedOutput,
      });
    });
  });

  router.post('/subscribe', (req, res, next) => {
    if (!req.user) {
      res.redirect('/');
    } else {
      next();
    }
  }, (req, res, next) => {
    topicNames.forEach((topicName) => {
      req.user.subscription[topicName] = !!req.body[topicName];
    });
    req.user.save().then(() => {
      Account.findOne({ username: req.user.username }).catch((err) => {
        next(err);
      }).then((account) => {
        res.redirect('/news');
      });
    }, (err) => {
      next(err);
    });
  });
}
