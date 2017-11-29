const path = require('path');
const databaseAdapter = require('./../libs/database_adapter');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = (router) => {
  topicNames = ['politics', 'health', 'entertainment', 'tech', 'travel', 'sports', 'opinion'];
  topicNames.forEach((topicName) => {
    router.get('/' + topicName , (req, res) => {
      databaseAdapter.viewNews().then((output) => {
        const normalizedOutput = output.map((item) => {
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
}
