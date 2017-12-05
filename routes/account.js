const path = require('path');

const passport = require('passport');

const Account = require('./../models/account');

const getRealQuestion = (name) => {
  if (name === 'q1') {
    return "Which is your birth city?"
  } else if (name === 'q2') {
    return "What is your favourite colour?"
  } else if (name === 'q3') {
    return "What is your pet's name?"
  } else if (name === 'q4') {
    return "Who is your favourite actor?";
  } else {
    return '';
  }
}

module.exports = (router) => {
  router.get('/', (req, res) => {
    if (req.user) {
      console.log("UU", req.user);
      res.render('home', {
        username: req.user.username,
        subscription: req.user.subscription,
      });
    } else {
      res.sendFile(path.join(__dirname, './../public', 'first.html'));
    }
  });


  router.get('/signup', (req, res) => {
    if (req.user) {
      res.redirect('/');
    } else {
      res.render('signup', { info: req.flash('signup') });
    }
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
    if (req.user) {
      res.redirect('/');
    } else {
      next();
    }
  }, (req, res, next) => {
    if (req.body.password !== req.body.password2) {
      req.flash('signup', 'Two passwords are not equal.');
      res.redirect('/signup');
    } else {
      next();
    }
  }, (req, res, next) => {
    let correct = true;
    if (req.body.username === '') {
      correct = false;
      req.flash('signup', 'username is empty.');
    } else if (req.body.password !== req.body.password2) {
      correct = false;
      req.flash('signup', 'Two passwords are not equal.');
    } else if (req.body.password === '') {
      correct = false;
      req.flash('signup', 'Password is empty.');
    }
    if (!correct) {
      res.redirect('/signup');
    } else {
      next();
    }
  }, (req, res, next) => {
    Account.register(new Account({
      username : req.body.username,
      first: req.body.first,
      last: req.body.last,
      email: req.body.email,
      question1: req.body.question1,
      security1: req.body.security1,
      question2: req.body.question2,
      security2: req.body.security2,
      subscription: {
        politics: false,
        health: false,
        entertainment: false,
        tech: false,
        travel: false,
        sports: false,
        opinion: false,
      },
    }), req.body.password, (err, account) => {
      if (err) {
        req.flash('signup', 'The username exists.');
        res.redirect('/signup');
      } else {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/');
        });
      }
    });
  });

  router.get('/login', (req, res) => {
    if (req.user) {
      res.redirect('/');
    } else {
      res.render('login', { info: req.flash('login') });
    }
  });

  router.post('/login', (req, res, next) => {
    console.log("POST /login");
    console.log(req.body.username);
    console.log(req.body.password);
    next();
  }, (req, res, next) => {
    if (req.user) {
      res.redirect('/');
    } else {
      next();
    }
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

  router.get('/logout', (req, res, next) => {
    if (!req.user) {
      res.redirect('/');
    } else {
      req.logout();
      //res.redirect('/');
      res.render('logout', {});
    }
  });

  router.get('/update_profile', (req, res, next) => {
    if (!req.user) {
      res.redirect('/');
    } else {
      res.render('update_profile', {
        username: req.user.username,
        question1: getRealQuestion(req.user.question1),
        security1: req.user.security1,
        question2: getRealQuestion(req.user.question2),
        security2: req.user.security2,
        info: req.flash('update_profile'),
      });
    }
  });

  router.post('/update_profile', (req, res, next) => {
    if (!req.user) {
      res.redirect('/');
    } else {
      next();
    }
  }, (req, res, next) => {
    if (req.body.password !== req.body.password2) {
      req.flash('update_profile', 'Two passwords are not equal.');
      res.redirect('/update_profile');
    } else if (req.body.password === '') {
      res.redirect('/');
    } else {
      next();
    }
  }, (req, res, next) => {
    Account.findOne({ username: req.user.username }).catch((err) => {
      next(err);
    }).then((account) => {
      if (!account) {
        res.redirect('/login');
      } else {
        account.setPassword(req.body.password, (err) => {
          if (err) {
            next(err);
          } else {
            account.save().then(() => {
              res.redirect('/');
            }, (err) => {
              next(err);
            });
          }
        });
      }
    }, (err) => {
      next(err);
    });
  });

  router.post('/forget_password', (req, res, next) => {
    console.log("POST /forget_password");
    console.log(req.body.username);
    next();
  }, (req, res, next) => {
    if (req.user) {
      res.redirect('/');
    } else {
      next();
    }
  }, (req, res, next) => {
    Account.findOne({ username: req.body.username }).catch((err) => {
      next(err);
    }).then((account) => {
      if (!account) {
        req.flash('login', 'The username does not exist.');
        res.redirect('/login');
      } else {
        const question1 = getRealQuestion(account.question1);
        const question2 = getRealQuestion(account.question2);
        res.render('reset_password', {
          username: req.body.username,
          question1: question1,
          question2: question2,
        });
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
    if (req.user) {
      res.redirect('/');
    } else {
      next();
    }
  }, (req, res, next) => {
    Account.findOne({ username: req.body.username }).catch((err) => {
      next(err);
    }).then((account) => {
      if (!account) {
        req.flash('login', 'The username does not exist.');
        res.redirect('/login');
      } else {
        let correct = true;
        if (req.body.security1 !== account.security1 || req.body.security2 !== account.security2) {
          correct = false;
          req.flash('reset_password', 'Answers to security questions are wrong.');
        } else if (req.body.password !== req.body.password2) {
          correct = false;
          req.flash('reset_password', 'Two passwords are not equal.');
        } else if (req.body.password === '') {
          correct = false;
          req.flash('reset_password', 'Password is empty.');
        }
        if (!correct) {
          const question1 = getRealQuestion(account.question1);
          const question2 = getRealQuestion(account.question2);
          res.render('reset_password', {
            username: req.body.username,
            question1: question1,
            question2: question2,
            info: req.flash('reset_password'),
          });
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
      }
    });
  });
}
