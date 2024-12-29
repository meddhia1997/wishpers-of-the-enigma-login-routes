const mongoose = require('mongoose');
const Account = mongoose.model('accounts');

const argon2i = require('argon2-ffi').argon2i;
const crypto = require('crypto');

const passwordRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,24})");

module.exports = app => {
    // Routes
    app.get('/accounts' , async(req,res) => {
        Account.find({}) 
        .select('username')      
        .select('lastAuthentication')
        .then(docs =>{
         res.status(200).json(docs)
        })
        .catch(err =>{
         res.status(400).json(err)
        })
    })
     app.delete('/:username',async(req,res)=> {
        const { username } = req.params;

  try {
    const deletedUser = await Account.findOneAndDelete({ username });

    if (!deletedUser) {
      return res.status(404).json('User not found' );
    }

    return res.status(200).json('User deleted successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).json('Internal server error');
  }
});
    
    app.post('/account/login', async (req, res) => {

        var response = {};

        const { rUsername, rPassword } = req.body;
        if(rUsername == null || !passwordRegex.test(rPassword))
        {
            //response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({ username: rUsername}, 'username adminFlag password');
        if(userAccount != null){
            argon2i.verify(userAccount.password, rPassword).then(async (success) => {
                if(success){
                    userAccount.lastAuthentication = Date.now();
                    await userAccount.save();

                    //response.code = 0;
                    response.msg = "Account found";
                    response.data = ( ({username, adminFlag}) => ({ username, adminFlag }) )(userAccount);
                    res.send(response);

                    return;
                }
                else{
                    //response.code = 1;
                    response.msg = "Invalid credentials";
                    res.send(response);
                    return;
                }
            });
        }
        else{
            //response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);
            return;
        }
    });

    app.post('/account/create', async (req, res) => {

        var response = {};

        const { rUsername, rPassword } = req.body;
        if(rUsername == null || rUsername.length < 3 || rUsername.length > 24)
        {
            //response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);
            return;
        }

        console.log(passwordRegex);
        console.log(rPassword);
        if(!passwordRegex.test(rPassword))
        {
            //response.code = 3;
            response.msg = "Unsafe password";
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({ username: rUsername},'_id');
        if(userAccount == null){
            // Create a new account
            console.log("Create new account...")

            // Generate a unique access token
            crypto.randomBytes(32, function(err, mail) {
                if(err){
                    console.log(err);
                }

                argon2i.hash(rPassword, mail).then(async (hash) => {
                    var newAccount = new Account({
                        username : rUsername,
                        password : hash,
                        mail: mail,
        
                        lastAuthentication : Date.now()
                    });
                    await newAccount.save();

                    //response.code = 0;
                    response.msg = "Account Added successfully";
                    response.data = ( ({username}) => ({ username }) )(newAccount);
                    res.send(response);
                    return;
                });
            });
        } else {
           // response.code = 2;
            response.msg = "Username is already taken";
            res.send(response);
        }
        
        return;
    });
}