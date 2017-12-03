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
    res.render('signup', { info: req.flash('signup') });
  });

  router.post('/signup', (req, res, next) => {
    console.log("POST /signup");
    console.log(req.body.first);
    console.log(req.body.last);
    console.log(req.body.username);
    console.log(req.body.email);
    console.log(req.body.password);
    console.log(req.body.password2);
    console.log(req.body.question1);
    console.log(req.body.security1);
    console.log(req.body.question2);
    console.log(req.body.security2);
    next();
  }, (req, res, next) => {
    if (req.body.password !== req.body.password2) {
      req.flash('signup', 'Two passwords are not equal.');
      res.redirect('signup');
    } else {
      next();
    }
  }, (req, res, next) => {
    Account.register(new Account({ username : req.body.username }), req.body.password, (err, account) => {
      if (err) {
        return res.render('signup', { account : account });
      }

      account.first = req.body.first;
      account.last = req.body.last;
      account.password = req.body.password;
      account.question1 = req.body.question1;
      account.security1 = req.body.security1;
      account.question2 = req.body.question2;
      account.security2 = req.body.security2;

      account.save().then(() => {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/');
        });
      }, (err) => {
        next(err);
      });
    });
  });

  router.get('/login', (req, res) => {
    res.render('login', { info: req.flash('login') });
  });

  router.post('/login', (req, res, next) => {
    console.log("POST /login");
    console.log(req.body.username);
    console.log(req.body.password);
    next();
  }, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('login', 'The username or the password is wrong.');
        return res.redirect('/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    }) (req, res, next);
  });

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

  router.post('/forget_password', (req, res, next) => {
    console.log("POST /forget_password");
    console.log(req.body.username);
    next();
  }, (req, res, next)=> {
    Account.findOne({ username: req.body.username }).catch((err) => {
      next(err);
    }).then((account) => {
      if (!account) {
        req.flash('login', 'The username does not exist.');
        res.redirect('/login');
      } else {
        res.render('reset_password', {username: req.body.username});
      }
    })
  });

  router.post('/reset_password', (req, res, next) => {
    console.log("POST /reset_password");
    console.log(req.body.username);
    console.log(req.body.security1);
    console.log(req.body.security2);
    console.log(req.body.password);
    console.log(req.body.password2);
    next();
  }, (req, res, next) => {
    Account.findOne({ username: req.body.username }).catch((err) => {
      next(err);
    }).then((account) => {
      if (!account) {
        req.flash('login', 'The username does not exist.');
        res.redirect('/login');
      } else {
        console.log("HERE8");
        console.log(account.security1);
        console.log(account.security2);
        account.setPassword(req.body.password, (err) => {
          if (err) {
            next(err);
          } else {
            account.save().then(() => {
              req.flash('login', 'Reset your password successfully.');
              res.redirect('/login');
            }, (err) => {
              next(err);
            });
          }
        });
      }
    });
  });
}
