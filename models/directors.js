const mongoose = require('mongoose');
const Film  = require('./films');

const directorsSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    }
});

directorsSchema.pre('remove', function (next){
    Film.find({ director: this.id}, (err, films)=>{
        if(err){
            next(err);
        }else if (films.length > 0){
            next(new Error('This director has films still'));
        } else {
            next();
        }
    });
});

module.exports = mongoose.model('Directors', directorsSchema);