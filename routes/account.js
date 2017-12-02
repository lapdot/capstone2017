const path = require('path');

const passport = require('passport');

const Account = require('./../models/account');

module.exports = (router) => {
  router.get('/', (req, res) => {
    if (req.user) {
      res.render('index', { user : req.user });
    } else {
      res.sendFile(path.join(__dirname, './../public', 'first.html'));
    }

  });

  router.get('/signup', (req, res) => {
    res.render('signup', {});
  });

  router.post('/signup', (req, res) => {
    Account.register(new Account({ username : req.body.username }), req.body.password, (err, account) => {
      if (err) {
        return res.render('signup', { account : account });
      }

      passport.authenticate('local')(req, res, () => {
        res.redirect('/');
      });
    });
  });

  router.get('/login', (req, res) => {
    res.render('login', { user : req.user });
  });

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }));

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
}
