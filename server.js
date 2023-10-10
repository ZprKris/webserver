/*********************************************************************************
* BTI325 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Kristina Zaporozhets Student ID: 128930229 Date: 9/27/2023
*
* Online (Cyclic) Link: https://long-gold-gear.cyclic.cloud/
*
********************************************************************************/ 

const blogService = require('./blog-service');
const express = require('express');
const path = require("path");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

// if initialize() is successful then listen. if not then print error to the console 
blogService.initialize().then(() => 
{
    app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
}).catch((error) =>
{
    console.log(error);
})

app.use(express.static("public"));

// / route 
app.get('/', (req, res) => {
    res.redirect('/about');
});
// about route 
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});
// blog route 
app.get('/blog', (req, res) => {
    blogService.getAllPosts().then((posts) => 
    {
        res.send(posts);
    }).catch((error)=>
    {
        res.send("message", error)
    });
 });
// posts route 
app.get('/posts', (req, res) => {
blogService.getAllPosts().then((posts) => 
    {
        res.send(posts);
    }).catch((error)=>
    {
        res.send("message", error)
    });
});
// categories route 
app.get('/categories', (req, res) => {
    blogService.getCategories().then((categories) => 
    {
        res.send(categories);
    }).catch((error)=>
    {
        res.send("message", error)
    });  
});

app.get(' /posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
})

// all routes 
app.get('*', function (req, res) {
    res.send('Page Not Found');
})


