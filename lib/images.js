'use strict';

const { Storage } = require('@google-cloud/storage');
const config = require('../config');

const CLOUD_BUCKET = config.get('CLOUD_BUCKET');

const storage = new Storage({
  projectId: config.get('CLOUD_PROJECT_ID'),
  keyFilename: config.get('CLOUD_SECRET_FILE')
});
const bucket = storage.bucket(CLOUD_BUCKET);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}

function getSignedUrl(req) {
  const gcsname = Date.now() + 'newimage.jpg';
  const file = bucket.file(gcsname);
  console.log(file);
  return file.getSigendUrl();
}

function sendUploadToGCS(req, res, next) {
  if (!req.file) {
    return next();
  }

  const gcsname = Date.now() + req.file.originalname;
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
    resumable: false,
  });

  stream.on('error', err => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      next();
    });
  });

  stream.end(req.file.buffer);
}

const Multer = require('multer');
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});

module.exports = {
  getPublicUrl,
  getSignedUrl,
  sendUploadToGCS,
  multer,
};
