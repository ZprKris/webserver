/*********************************************************************************
* BTI325 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Kristina Zaporozhets Student ID: 128930229 Date: 11/16/2023
*
* Online (Cyclic) Link: https://easy-rose-snail-slip.cyclic.app
*
********************************************************************************/ 
const blogData = require('./blog-service');
const express = require('express');
const path = require("path");
const app = express();
// ass4
const Handlebars = require('handlebars');
const stripJs = require('strip-js');
const exphbs = require("express-handlebars" ); 
app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: "main"}));
app.set('view engine', '.hbs');
// ass2
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { ExpressHandlebars } = require('express-handlebars');
cloudinary.config({
    cloud_name: 'dggs1k1vk',
    api_key: '781132277325654',
    api_secret: 'aG64Q7089Opw6zGNr-POkBpeSuU',
    secure: true
});
const upload = multer(); // no { storage: storage } since we are not using disk storage
// ass4: handlebars 
Handlebars.registerHelper('navLink', function (url, options) {
    return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
});

Handlebars.registerHelper('equal', function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }

});

Handlebars.registerHelper('safeHTML', function(context){
    return stripJs(context);
});

Handlebars.registerHelper('FormatDate', function(dateObj){
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
})


const HTTP_PORT = process.env.PORT || 8080;

// if initialize() is successful then listen. if not then print error to the console 
blogData.initialize().then(() => 
{
    app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
}).catch((error) =>
{
    console.log(error);
})

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

// ass4: midleware for nav bar active highlight 
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// / route 
app.get('/', (req, res) => {
    res.redirect('/blog');
});
// about route 
app.get('/about', (req, res) => {
  res.render(path.join(__dirname, "/views/about"));
});
// ass4: blog route: provided 
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});
// ass4: post by id route 
app.get('/post/:postId', (req, res) => {
    if(req.params.postId) 
        blogData.getPostById(req.params.postId).then((post) => 
        {
            res.json(post); 
        }).catch((error) => {
            res.status(500).json({ message: 'An error: ', error });
        })
})
// posts route 
app.get('/posts', (req, res) => {
    // queries:
    if(req.query.category)
    {
        blogData.getPostsByCategory(req.query.category).then((posts) =>
        {
            if(posts.length > 0)
                res.render("posts", {posts: posts})
            else 
                res.render("posts",{ message: "no results" });
        }).catch((error) => 
        {   
            res.status(500).json({ message: 'An error: ', error });
        });
    } 
    else if(req.query.minDate)
    {
        blogData.getPostsByMinDate(req.query.minDate).then((posts) => 
        { 
            if(posts.length > 0)
                res.render("posts", {posts: posts})
            else 
                res.render("posts",{ message: "no results" });
        }).catch((error) => 
        {
         res.status(500).json({ message: 'An error: ', error });
        });
    }
    else // get all 
    {
        blogData.getAllPosts().then((posts) => 
        {
            if(posts.length > 0)
                res.render("posts", {posts: posts})
            else 
                res.render("posts",{ message: "no results" });            
        }).catch((error)=>
        {
           res.status(500).json({ message: 'An error: ', error });
        });
    }
});
// categories route 
app.get('/categories', (req, res) => {
    blogData.getCategories().then((categories) => 
    {
        if(categories.length > 0)
            res.render("categories", {categories: categories});
        else 
            res.render("categories",{ message: "no results" });            
    }).catch((error)=>
    {
        res.render("categories", {message: "no results"});
        res.send("message", error)
    });  
});

app.get('/categories/add', (req, res) => {
    res.render(path.join(__dirname, "/views/addCategory"));
});

// posts/add route 
app.get('/posts/add', (req, res) => {
    blogData.getCategories().then((categories) => 
    {
        res.render("addPost", {categories: categories});
    }).catch(()=>
    {
        res.render("addPost", {categories: []});
    })
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
        return result;
    };
    
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blogData.addPost(req.body).then(() => {res.redirect('/posts');});
    });
    
});

app.post('/categories/add', (req, res) => {
    blogData.addCategory(req.body).then(() => {res.redirect('/categories');});
});

app.get('/categories/delete/:id', (req, res) => {
    if(req.params.id) 
    blogData.deleteCategoryById(req.params.id).then((category) => 
    {
        res.redirect('/categories');
    }).catch((error) => {
        res.status(500).send('Unable to Remove Category / Category not found');
    })
});

app.get('/posts/delete/:id', (req, res) => {
    if(req.params.id) 
    blogData.deletePostById(req.params.id).then((category) => 
    {
        res.redirect('/posts');
    }).catch((error) => {
        res.status(500).send('Unable to Remove Post / Post not found');
    })
});

// ass4 provided route for blogs 
app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get('/*', (req, res) => {
    res.render(path.join(__dirname, "/views/404")); 
  }); 

  
