const mongoose = require('mongoose');

const Sampl_Place_Schema = new mongoose.Schema({
    region: {
        type: String,
        required: true
    },
    name_place: {
        type: String,
        required: true,
    },
    type_water_object: {
        required: true,
        type: String,
    },
    name_water_object: {
        type: String,
        required: true,
    },
    longitude:{
        required: true,
        type: Number,
    },
    latitude: {
        required: true,
        type: Number,
    },
    comment: {
        type: String
    }
})

const Sampling_Place = mongoose.model('sampling_places', Sampl_Place_Schema);

module.exports = { Sampling_Place };
