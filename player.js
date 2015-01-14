var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Player = new Schema({
    vk_id: { type: Number, unique: true },
    first_name: { type: String, required: true}
});

module.exports = mongoose.model('Player', Player);