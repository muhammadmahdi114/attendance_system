const mongoose = require('mongoose');

const gradeCriteriaSchema = new mongoose.Schema({
    email: { type: String, required: true },
    date: { type: String, required: true },
    grade: { type: String, required: true }
});

module.exports = mongoose.model('Grading', gradeCriteriaSchema);
