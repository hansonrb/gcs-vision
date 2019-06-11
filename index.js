"use strict";

const path = require("path");
const express = require("express");
const config = require("./config");

const app = express();

app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'pug');

app.use('/upload', require('./controllers/upload/api'));

// viewed at http://localhost:8080
app.get("/", function(req, res) {
  res.redirect("/upload");
});

// Basic 404 handler
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Basic error handler
app.use((err, req, res) => {
  console.error(err);
  res.status(500).send(err.response || "Something broke!");
});

const server = app.listen(config.get("PORT"), () => {
  const port = server.address().port;
  console.log(`App listening on port ${port}`);
});
