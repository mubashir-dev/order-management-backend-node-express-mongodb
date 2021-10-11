const Joi = require('@hapi/joi')

const productSchema = Joi.object({
    name: Joi.string().min(5).required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    category: Joi.string().min(24).max(24).required(),
    description: Joi.string()
        .min(20)
        .max(200)
        .required()
})

module.exports = {
    productSchema
}
