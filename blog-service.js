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












