const express = require('express');
const app = express();
const logger = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const fs = require('fs');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const passport = require('passport');
const http = require('http');
const path = require('path');
const flash = require('connect-flash');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const Docker = require('dockerode');
const configDB = require('./config/database.js');
const credentials = require('./credentials.json');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

mongoose.connect(configDB.url);

require('./config/passport')(passport);


app.use(logger("combined"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'iloveharborjsiloveharborjs',
  maxAge: new Date(Date.now() + 3600000),
  store: new MongoStore({
    'host': configDB.mongo_host,
    'port': configDB.mongo_port,
    'db': configDB.mongo_db,
    'url': configDB.url
  })
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport, docker); 

require('./config/sockets.js')(io, credentials, docker);

server.listen(port);

console.log('dokku admin is running on port ' + port);
