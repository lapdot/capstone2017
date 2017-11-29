const path = require('path');
const exec = require('child_process').exec;
const databaseAdapter = require('./../libs/database_adapter');

module.exports = (router) => {
  router.get('/ls', (req, res) => {
    exec('ls -al', (error, stdout, stderr) => {
      if (error) {
        res.json({ code: error.code });
      } else {
        res.send(stdout);
      }
    });
  });

  router.get('/data', (req, res) => {
    databaseAdapter.viewNews().then((output) => {
      res.json(output);
    });
  });
}
