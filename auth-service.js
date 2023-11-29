const bcrypt = require('bcryptjs'); // hash part 
const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
      },
      password: String,
      email: String,
      loginHistory: [{dateTime: Date, userAgent: String}],
  });

  let User; // to be defined on new connection (see initialize)

  module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://zaporozhetskristina:GVn7wuTw3F8Cj6iK@cluster0.nu7iqc3.mongodb.net/first?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if(userData.password != userData.password2)
        {
            reject("Passwords do not match");
        }
        else{

            bcrypt.hash(userData.password, 10).then(hash=>{ // Hash the password using a Salt that was generated using 10 rounds
                userData.password = hash;

                let newUser = new User(userData); 
            
                newUser.save()
                .then(()=> {
    
                    resolve();
                })
                .catch((err)=>
                {
                    if(err.code == 11000) reject("User Name already taken"); 
                    else reject(`There was an error creating the user: ${err}`); 
                })

            })
            .catch(err=>{
                console.log("There was an error encrypting the password"); // Show any errors that occurred during the process
            });
            
        }

    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName }) 
        .exec()
        .then((users) => {
          if (!users) {
            reject(`Unable to find user: ${userData.userName}`)
          } 
          else {
            const hash = users[0].password;
            bcrypt.compare(userData.password, hash).then((result) => {
                if(result)
                {
                    users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent}); 
                    User.updateOne(
                        { userName: users[0].userName  }, 
                        { $set: { loginHistory: users[0].loginHistory } }
                      )
                      .exec()
                      .then(() => {
                        resolve(users[0]); 
                      })
                      .catch((err) => {
                        reject(`There was an error verifying the user: ${err}`); 
                      })
                }
                else
                    reject(`Incorrect Password for user: ${userData.userName}`);
             });
          }
        })
        .catch((err) => {
          reject(`Unable to find user: ${userData.userName}`);
        });

    });
};




