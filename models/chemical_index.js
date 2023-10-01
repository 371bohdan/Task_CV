const mongoose = require('mongoose');

const Sampling_Place = require('./sampling_places');

const Chemical_Index_Schema = new mongoose.Schema({
    name_place: {
        type: String,
        required: true,
        ref: 'sampling_place',
    },
    chemical_index: {
        type: String,
        required: true,
    },
    result_chemical_index: {
        type: String,
        required: true,
    },
    date_analysis: {
        type: String,
        required: true,
    },
    comment: {
        type: String
    }
})



const Chemical_Index = mongoose.model('chemical_index', Chemical_Index_Schema);

module.exports = {Chemical_Index};