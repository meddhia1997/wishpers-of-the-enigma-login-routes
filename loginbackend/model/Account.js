const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountSchema = new Schema({
    username: String,
    password: String,
    mail: String,

    lastAuthentication: Date,
});

mongoose.model('accounts', accountSchema);