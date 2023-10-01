const mongoose = require('mongoose');

const Places_Schema = new mongoose.Schema({
    country:{
        require: true,
        type: String
    },
    region:{
        require: true,
        type: String
    }
})

const Places = mongoose.model('places', Places_Schema);

module.exports = {Places};

