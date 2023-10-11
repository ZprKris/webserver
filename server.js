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
// 
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
cloudinary.config({
    cloud_name: 'dggs1k1vk',
    api_key: '781132277325654',
    api_secret: 'aG64Q7089Opw6zGNr-POkBpeSuU',
    secure: true
});
const upload = multer(); // no { storage: storage } since we are not using disk storage

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
    // queries:
    if(req.query.category)
    {
        blogService.getPostsByCategory(req.query.category).then((posts) =>
        {
            res.json(posts)
        }).catch((error) => 
        {   
            res.status(500).json({ message: 'An error occurred', error });
        });
    } 
    else if(req.query.postDate)
    {
        blogService.getPostsByMinDate(req.query.postDate).then((posts) => 
        { 
            res.json(posts);
        }).catch((error) => 
        {
         res.status(500).json({ message: 'An error occurred', error });
        });
    }
    else 
    {
        blogService.getAllPosts().then((posts) => 
        {
            res.send(posts);
        }).catch((error)=>
        {
           res.status(500).json({ message: 'An error occurred', error });
        });
    }
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
// posts/add route 
app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

// all routes 
app.get('*', function (req, res) {
    res.send('Page Not Found');
});

// post to /posts/add
app.post('/posts/add', upload.single('featureImage'), (req, res) => {

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
         
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blogService.addPost(req.body).then(() => {res.redirect('/posts');});
    });
    
});

