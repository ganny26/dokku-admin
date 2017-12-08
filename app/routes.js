var config = require('../config/application.js');
var App = require('../app/models/apps');
var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

module.exports = function (app, passport, docker) {



  app.get('/', function (req, res) {
    res.render('index.ejs');
  });


  app.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile.ejs', {
      user: req.user
    });
  });

  app.get('/dashboard', isLoggedIn, function (req, res) {
    docker.listContainers(function (err, cont) {
      console.log('container.......', cont);
      App.find(function (warn, apps, count) {
        if (!apps) apps = [];
        if (!cont) cont = [];
        res.render('dashboard.ejs', { apps: apps, containers: cont, user: req.user });
      });
    });
  });

  app.get('/ssh', isLoggedIn, function (req, res) {
    res.render('ssh.ejs');
  });

  app.get('/containers/:id', isLoggedIn, function (req, res) {
    console.log('INSPECT CONTAINER WITH ID ' + req.params.id);
    var container = docker.getContainer(req.params.id);
    container.getContainer(req.params.id, function (err, requ) {
      if (err) throw err;
      var reqname = requ.Config.Image;
      container.attach({ stream: true, stdout: true, stderr: false, tty: false }, function (err, stream) {
        res.render('containers/show.ejs', { container: requ, name: reqname, stream: stream });
      });
    });
  });


  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/new', isLoggedIn, function (req, res) {
    res.render('containers/new.ejs', { user: req.user });
  });

  app.post('/create', config.create);

  app.post('/createdb', config.createdb);

  app.get('/destroy/:id', config.destroy);

  
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

 
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });


  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));



  
  app.get('/connect/local', function (req, res) {
    res.render('connect-local.ejs', { message: req.flash('loginMessage') });
  });
  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

 
  app.get('/unlink/local', function (req, res) {
    var user = req.user;
    user.local.username = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/');
    });
  });
};


function isLoggedIn(req, res, next) {

  if (req.user) {
    return next();
  }
  res.redirect('/');
}
