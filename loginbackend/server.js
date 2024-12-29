const express = require('express');
const keys = require('./config/keys.js');
const app = express();
const bodyParser = require('body-parser');
const dataBaseName= "ESCAPEVR"
const hostname = "localhost"
const port = 9090
const mongoose = require('mongoose');
const morgan = require('morgan');
// parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }))

// Setting up DB

mongoose.connect(`mongodb://127.0.0.1:27017/${dataBaseName}`, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log("connected to the database ")
})
.catch((err)=>{
    console.log(err)
})
app.use(morgan("dev"));
// Setup database models
require('./model/Account');

// Setup the routes
require('./routes/authenticationRoutes')(app);

app.listen(port,hostname,()=>{
    console.log(`server running on port ${port}`)});