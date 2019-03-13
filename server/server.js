'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes');
const auth = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan('combined'));
app.use(cors());
app.use(auth());

app.use(function(req, res, next) {
  res.set({
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'deny',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  res.removeHeader('X-Powered-By');
  next();
});

routes(app);
app.listen(PORT, 'localhost');

console.log(`Running on http://localhost:${PORT}`);
