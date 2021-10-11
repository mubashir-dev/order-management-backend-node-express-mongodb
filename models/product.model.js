const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//ProductSchema
const ProductSchema = new Schema({
    name: {type: String, require: true, unique: true},
    description: {type: String, require: true},
    image: {type: String, require: true},
    price: {type: Number, require: true},
    quantity: {type: Number, require: true},
    category: {type: Schema.Types.ObjectId, ref: 'Users'},
    user: {type: Schema.Types.ObjectId, ref: 'Users'},
    status: {type: String, enum: ['1', '0'], default: '1', require: true},
}, {timestamps: true});

module.exports = mongoose.model("Product", ProductSchema)
