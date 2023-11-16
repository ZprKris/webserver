const Sequelize = require('sequelize');
var sequelize = new Sequelize('SenecaDB', 'ZprKris', '4qEicnyaTDf6', {
  host: 'ep-flat-sound-80316598.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {ssl: { rejectUnauthorized: false }},
  query: { raw: true }});

const Post = sequelize.define('Post', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

const Category = sequelize.define('Category', {
  category: Sequelize.STRING,
});

Post.belongsTo(Category, {foreignKey: 'category'});
  
module.exports.initialize = () => 
{
  return new Promise((resolve, reject) => {
    sequelize.sync().then(() => {
      resolve(); 
    }).catch((error) =>
    {
      reject("unable to sync the database");
    })
  });
};

module.exports.getAllPosts = () =>
{
    return new Promise((resolve, reject) => {
      Post.findAll({}).then((data) => {
        resolve(data); 
      }).catch((error) => {
        reject(error);
      })
    });
  };

module.exports.getCategories = () =>
{
  return new Promise((resolve, reject) => {
    
    Category.findAll({}).then((data) => {
        resolve(data); 
    }).catch((error) => {
      reject("no results returned");
    })
  });  
}

module.exports.deleteCategoryById = (id) =>
{
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: { id: id }, 
    }).then(() => {
      resolve(); 
    }).catch((error) =>
    {
      reject("could not delete category");
    })

  })
}

module.exports.deletePostById = (id) =>
{
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: { id: id }, 
    }).then(() => {
      resolve(); 
    }).catch((error) =>
    {
      reject("could not delete category");
    })

  })
}

module.exports.addCategory = (categoryData) =>
{
  return new Promise((resolve, reject) => {
    if(categoryData.category == "") categoryData.category = null; 

    Category.create({
      category: categoryData.category,
    }).then(() => {
      resolve()
    }).catch((error) =>{
      reject("unable to create category");
    })
  })
}


module.exports.addPost = (postData) =>
{
  return new Promise((resolve, reject) => {
    postData.published = (postData.published) ? true : false;
    for (const property in postData) {
      if(property=="") postData[property] = null; 
    }
    postData.postDate = new Date(); 
    Post.create({
      body: postData.body,
      title: postData.title,
      postDate: postData.postDate,
      featureImage: postData.featureImage,
      published: postData.published,
      category: postData.category 
    }).then(() => {
      resolve()
    }).catch((error) =>{
      reject("unable to create post");
    })
  });
}

module.exports.getPostsByCategory = (category) => 
{
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        category: category,
      },
    }).then((data) => {
        resolve(data); 
    }).catch((error) => {
      reject("no results returned");
    })
  });
  }

module.exports.getPostsByMinDate = (minDateStr) => 
{
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    Post.findAll({
        where: {
            postDate: {
                [gte]: new Date(minDateStr)
            }
        }
    }).then((data) => 
    {
      resolve(data); 
    }).catch((error) => {
      reject("no results returned");
    })
  });
}

module.exports.getPostById = (id) => 
{
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        id: id,
      },
    }).then((data) => {
        resolve(data[0]); 
    }).catch((error) => {
      reject("no results returned");
    })
  });
}

module.exports.getPublishedPostsByCategory = (category) =>
{
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true, 
        category: category,
      },
    }).then((data) => {
        resolve(data); 
    }).catch((error) => {
      reject("no results returned");
    })
  });
  }

module.exports.getPublishedPosts = () =>
{
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
      },
    }).then((data) => {
        resolve(data); 
    }).catch((error) => {
      reject("no results returned");
    })
  });
  }






