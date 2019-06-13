const express = require('express');
const bodyParser = require('body-parser');
const images = require('../../lib/images');
const vision = require('@google-cloud/vision');
const router = express.Router();
const config = require('../../config');

router.use(bodyParser.urlencoded({extended: false}));

router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

router.get('/', (req, res, next) => {
  res.render('home.pug');
});

router.get('/signedurl', (req, res, next) => {
  res.set('Content-Type', 'application/json');
  const fileName = Date.now() + "-" + req.query.fileName;
  images.getSignedUrl(fileName, req.query.fileType).then(([ url ]) => {
    res.json({
      signedUrl: url,
      fileName,
    });
  });
});

router.get('/annotate', (req, res, next) => {
  res.set('Content-Type', 'application/json');
  const client = new vision.ImageAnnotatorClient({
    projectId: config.get('CLOUD_PROJECT_ID'),
    keyFilename: config.get('CLOUD_SECRET_FILE')
  });

  client.textDetection({
    image: {
      source: {
        imageUri: 'gs://test-invoices-healthnote/' + req.query.fileName
        // imageUri: "https://PUBLIC_IMAGE_URL"
      }
    }
  }).then(result => {
    // result[0].textAnnotations.forEach(ta => console.log(ta));
    res.json(result[0].fullTextAnnotation);
  }).catch(err => {
    console.log(err);
  });
});

/* upload to gcs from nodejs server */
router.post(
  '/add',
  images.multer.single('image'),
  images.sendUploadToGCS,
  (req, res, next) => {
    let data = req.body;
    if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl;
    }

    console.log(data);
    res.redirect('/');
  }
);

router.use((err, req, res, next) => {
  err.response = {
    message: err.message,
    internalCode: err.code,
  };
  console.log(err);
  next(err);
});

module.exports = router;
