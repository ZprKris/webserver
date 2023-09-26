const blogService = require('./blog-service');
const express = require('express');
const path = require("path");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get('/blog', (req, res) => {
    res.send("TODO: get all posts who have published==true");
  });

  