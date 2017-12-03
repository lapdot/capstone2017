const path = require('path');

const passport = require('passport');

const Account = require('./../models/account');

module.exports = (router) => {
  router.get('/', (req, res) => {
    if (req.user) {
      res.render('home', { user: req.user });
    } else {
      res.sendFile(path.join(__dirname, './../public', 'first.html'));
    }
  });

  router.get('/update', (req, res) => {
    res.render('home_update', { user: req.user });
  })

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
    //res.redirect('/');
    res.render('logout', {});
  });

  router.get('/update_profile', (req, res, next) => {
    if (!req.user) {
      console.log('Forbidden');
      var err = new Error('Forbidden');
      err.status = 403;
      next(err);
      return;
    }
    res.render('update_profile', {});
  });

  router.get('/forget_password', (req, res, next) => {
    console.log(req.body.username);
    res.render('reset_password', {});
  });
}
