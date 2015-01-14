var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Queue = new Schema({
    ids : { type: String },
    text: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Queue', Queue);
