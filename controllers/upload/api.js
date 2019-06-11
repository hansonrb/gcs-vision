const express = require('express');
const bodyParser = require('body-parser');
// const images = require('../lib/images');

const router = express.Router();

router.use(bodyParser.urlencoded({extended: false}));

router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

router.get('/', (req, res, next) => {
  res.render('home.pug', {});
});

router.use((err, req, res, next) => {
  err.response = {
    message: err.message,
    internalCode: err.code,
  };
  console.log(err);
  next(err);
});

module.exports = router;
