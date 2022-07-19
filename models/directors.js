const mongoose = require('mongoose');

const directorsSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Directors', directorsSchema);