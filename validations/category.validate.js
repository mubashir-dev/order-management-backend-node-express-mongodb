const Joi = require('@hapi/joi')

const categorySchema = Joi.object({
    name: Joi.string().min(5).required(),
    description: Joi.string()
        .min(20)
        .max(200)
        .required()
})

module.exports = {
    categorySchema
}