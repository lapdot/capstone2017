const path = require('path');

const passport = require('passport');

const Account = require('./../models/account');

const topicNames = ['politics', 'health', 'entertainment', 'tech', 'travel', 'sports', 'opinion'];

const getRealQuestion = (name) => {
  if (name === 'q1') {
    return "Which is your birth city?";
  } else if (name === 'q2') {
    return "What is your favourite colour?";
  } else if (name === 'q3') {
    return "What is your pet's name?";
  } else if (name === 'q4') {
    return "What is your Mothers maiden name?";
  } else if (name === 'q5') {
    return "What is your favourite sport?";
  } else if (name === 'q6') {
    return "Who is your favourite actor?";
  } else {
    return '';
  }
}

const isAlphaNum = (str) => {
  const regEx = /^[a-zA-Z0-9]+$/;
  return str.match(regEx);
}

module.exports = (router) => {
  router.get('/', (req, res, next) => {
    if (req.user) {
      const selectedTopics = topicNames.filter((topicName) => {
        return req.user.subscription[topicName]
      });
      if (selectedTopics.length === 0) {
        res.redirect('/subscribe');
      } else {
        res.redirect('/news');
      }
    } else {
      res.sendFile(path.join(__dirname, './../public', 'first.html'));
    }
  });

  router.get('/signup', (req, res, next) => {
    if (req.user) {
      res.redirect('/');
    } else {
      res.render('signup', { info: req.flash('signup') });
    }
  });

  router.post('/signup', (req, res, next) => {
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
      req.flash('signup', 'The username is empty.');
    } else if (req.body.username.length > 25) {
      correct = false;
      req.flash('signup', 'The length of the username cannot be more than 25.');
    } else if (req.body.password !== req.body.password2) {
      correct = false;
      req.flash('signup', 'Two passwords are not equal.');
    } else if (req.body.password === '') {
      correct = false;
      req.flash('signup', 'The password is empty.');
    } else if (req.body.password.length < 8 || req.body.password.length > 15) {
      correct = false;
      req.flash('signup', 'The length of the password must be within 8 and 15.');
    } else if (!isAlphaNum(req.body.password)) {
      correct = false;
      req.flash('signup', 'The password can contains letters and digits only.');
    } else if (req.body.question1 !== 'q1' && req.body.question1 !== 'q2' && req.body.question1 !== 'q3') {
      correct = false;
      req.flash('signup', 'Question 1 is wrong.');
    } else if (req.body.security1.length > 30) {
      correct = false;
      req.flash('signup', 'The length of Answer 1 cannot be more than 30.');
    } else if (req.body.question2 !== 'q4' && req.body.question2 !== 'q5' && req.body.question2 !== 'q6') {
      correct = false;
      req.flash('signup', 'Question 2 is wrong.');
    } else if (req.body.security2.length > 30) {
      correct = false;
      req.flash('signup', 'The length of Answer 2 cannot be more than 30.');
    } else if (req.body.first.length > 30) {
      correct = false;
      req.flash('signup', 'The length of first name cannot be more than 30.');
    } else if (req.body.last.length > 30) {
      correct = false;
      req.flash('signup', 'The length of last name cannot be more than 30.');
    } else if (req.body.email.length > 100) {
      correct = false;
      req.flash('signup', 'The length of email cannot be more than 100.');
    }
    if (!correct) {
      res.redirect('/signup');
    } else {
      req.body.username = req.body.username.toLowerCase();
      req.body.email = req.body.email.toLowerCase();
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
    if (req.user) {
      res.redirect('/');
    } else {
      next();
    }
  }, (req, res, next) => {
    req.body.username = req.body.username.toLowerCase();
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
        first: req.user.first,
        last: req.user.last,
        email: req.user.email,
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
    let correct = true;
    if (req.body.first.length > 30) {
      correct = false;
      req.flash('update_profile', 'The length of first name cannot be more than 30.');
    } else if (req.body.last.length > 30) {
      correct = false;
      req.flash('update_profile', 'The length of last name cannot be more than 30.');
    } else if (req.body.email.length > 100) {
      correct = false;
      req.flash('update_profile', 'The length of email cannot be more than 100.');
    };
    if (!correct) {
      res.redirect('/update_profile');
    } else {
      next();
    }
  }, (req, res, next) => {
    req.user.first = req.body.first;
    req.user.last = req.body.last;
    req.user.email = req.body.email.toLowerCase();
    req.user.save().then(() => {
      res.redirect('/');
    }, (err) => {
      next(err);
    });
  });


  router.get('/update_password', (req, res, next) => {
    if (!req.user) {
      res.redirect('/');
    } else {
      res.render('update_password', {
        username: req.user.username,
        info: req.flash('update_password'),
      });
    }
  });

  router.post('/update_password', (req, res, next) => {
    if (!req.user) {
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
        let correct = true;
        if (req.body.password !== req.body.password2) {
          correct = false;
          req.flash('update_password', 'Two passwords are not equal.');
        } else if (req.body.password.length < 8 || req.body.password.length > 15) {
          correct = false;
          req.flash('update_password', 'The length of the password must be within 8 and 15.');
        } else if (!isAlphaNum(req.body.password)) {
          correct = false;
          req.flash('update_password', 'The password can contains letters and digits only.');
        }
        if (!correct) {
          res.redirect('/update_password');
        } else {
          account.changePassword(req.body.old_password, req.body.password, (err) => {
            if (err) {
              req.flash('update_password', 'Current password is wrong');
              res.redirect('/update_password');
            } else {
              account.save().then(() => {
                res.redirect('/');
              }, (err) => {
                next(err);
              });
            }
          });
        }
      }
    }, (err) => {
      next(err);
    });
  });

  router.post('/forget_password', (req, res, next) => {
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
        } else if (req.body.password.length < 8 || req.body.password.length > 15) {
          correct = false;
          req.flash('reset_password', 'The length of the password must be within 8 and 15.');
        }  else if (!isAlphaNum(req.body.password)) {
          correct = false;
          req.flash('reset_password', 'The password can contains letters and digits only.');
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
