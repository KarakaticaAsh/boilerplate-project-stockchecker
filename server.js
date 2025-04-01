'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); // For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// **Enhanced Security with Helmet**
app.use(helmet.contentSecurityPolicy({  // Protect against XSS
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://code.jquery.com/", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'"],
    connectSrc: ["'self'", "https://stock-price-checker-proxy.freecodecamp.rocks"], // Allow API calls
  },
}));
app.use(helmet.frameguard({ action: 'deny' }));     // Prevent Clickjacking
app.use(helmet.hidePoweredBy());                 // Hide Express version
app.use(helmet.hsts({                              // Force HTTPS
  maxAge: 7776000,
  force: true,
}));
app.use(helmet.noSniff());                      // Prevent MIME sniffing
app.use(helmet.xssFilter());                     // Sanitize inputs

// Index page (static HTML)
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

// 404 Not Found middleware
app.use(function (req, res, next) {
  res.status(404).type('text').send('Not Found');
});

// Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app;
