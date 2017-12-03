const path = require('path');
const databaseAdapter = require('./../libs/database_adapter');

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
  topicNames = ['politics', 'health', 'entertainment', 'tech', 'travel', 'sports', 'opinion'];
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
    console.log("ENTER");
    databaseAdapter.viewNews().then((output) => {
      const normalizedOutput = cleanJson(output);
      const selectedTopics = ['politics', 'health', 'entertainment'];
      if (selectedTopics.length !== 3) {
        console.log('Number of topics is not 3.');
        var err = new Error('Number of topics is not 3.');
        err.status = 500;
        next(err);
      } else {
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
      }
    });
  });
}
