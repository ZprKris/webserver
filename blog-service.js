const fs = require("fs"); 

const posts = []; 
const categories = []; 

// takes file name and array, puts read objects into array 
const read = function (file, arr) 
{
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data) => 
      {
        if (err) reject(err.message);
        else 
        {
            const jsonData = JSON.parse(data);
            arr.push(...jsonData);
            resolve(arr);
        }
        });
    }); 
};
  
module.exports.initialize = () => 
{
    return new Promise((resolve, reject) => {
      read('./data/posts.json', posts)
      .then(() => { read('./data/categories.json', categories);}) 
      .then(() => { resolve(); })
      .catch((error) => { reject(error); });
    });
};

module.exports.getAllPosts = () =>
{
  return new Promise((resolve, reject) => {
      if(posts.length === 0) reject('no posts');
      else resolve(posts);
    })
}

module.exports.getCategories = () =>
{
  return new Promise((resolve, reject) => {
      if(categories.length === 0) reject('no categories');
      else resolve(categories);
    });
}; 

module.exports.addPost = (postData) =>
{
  return new Promise((resolve, reject) => {
    if(postData.published === undefined) postData.published = false; 
    else postData.published = true; 
    postData.id = posts.length + 1; 
    posts.push(postData);
    resolve();  
  })
}

module.exports.getPostsByCategory = (category) => 
{
  return new Promise ((resolve, reject) => 
  {
    res = []; 
    for(let i = 0; i < posts.length; ++i)
    {
      if(posts[i].category == category)
        res.push(posts[i]); 
    }
    if(res.length) resolve(res); 
    else reject('no results returned');
  })
}

module.exports.getPostsByMinDate = (minDateStr) => 
{
  return new Promise((resolve, reject) => 
  {
    res = []; 
    for(let i = 0; i < posts.length; ++i)
    {
      if(new Date(posts[i].postDate) > new Date(minDateStr))
        res.push(posts[i]); 
    }
    if(res.length) resolve(res); 
    else reject('no results returned'); 
  })
}

module.exports.getPostById = (id) => 
{
  return new Promise((resolve, reject) => 
  {
    let flag = false; 
    let res = {}; 

    for(let i = 0; i < posts.length; ++i)
    {
      if(id == posts[i].id) 
      {
        flag = true; 
        res = posts[i];
        break; 
      }
    }

    if(flag) resolve(res); 
    else reject('no result returned')
  })
}









