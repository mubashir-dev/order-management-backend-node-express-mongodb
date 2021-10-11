const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//UserSchema
const CategorySchema = new Schema({
    name: {type: String, require: true, unique: true},
    description: {type: String, require: true},
    user: {type: Schema.Types.ObjectId, ref: 'Users'},
    status: {type: String, enum: ['1', '0'], default: '1', require: true},
}, {timestamps: true});

module.exports = mongoose.model("Category", CategorySchema)
