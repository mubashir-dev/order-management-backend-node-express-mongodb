const Category = require("../models/category.model");
const ObjectId = require('mongoose').Types.ObjectId;
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");
const {categorySchema} = require('../validations/category.validate')
const _ = require('underscore');
const {client} = require('../helpers/caching.redis');
const {response} = require("express");

//create product category
exports.create = [auth,
    async (req, res, next) => {
        try {
            const validationResult = categorySchema.validate(req.body, {abortEarly: false});
            if (!_.isEmpty(validationResult.error)) {
                let _errors = [];
                validationResult.error.details.forEach((element) => {
                    _errors.push(element.message);
                });
                res.status(422).send({
                    errors: _errors
                });
            } else {
                const user = userData.user(req.headers.authorization);
                const nameExist = await Category.findOne({name: req.body.name})
                if (nameExist)
                    next(new httpError(422, {
                        message: `This ${req.body.name} name is already been registered`
                    }));
                const category = new Category({
                    name: req.body.name,
                    description: req.body.description,
                    user: user._id
                })
                const result = await category.save();
                res.status(200).send({
                    message: "Product Category has been Created",
                    user: result
                });
            }

        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
]
//create product category
exports.update = [auth,
    async (req, res, next) => {
        try {
            const validationResult = categorySchema.validate(req.body, {abortEarly: false});
            if (!_.isEmpty(validationResult.error)) {
                let _errors = [];
                validationResult.error.details.forEach((element) => {
                    _errors.push(element.message);
                });
                res.status(422).send({
                    errors: _errors
                });
            } else if (!ObjectId.isValid(req.params.id)) {
                next(new httpError(200, {
                    message: 'Product Category is Invalid'
                }))
            } else {
                const user = userData.user(req.headers.authorization);
                if (user.role == "admin") {
                    const nameExist = await Category.findOne({name: req.body.name})
                    if (nameExist)
                        next(new httpError(422, {
                            message: `This ${req.body.name} name is already been registered`
                        }));
                    const foundCategory = await Category.findByIdAndUpdate({_id: req.params.id}, {
                        name: req.body.name,
                        description: req.body.description
                    })
                    console.log(foundCategory)
                    if (foundCategory) {
                        res.status(200).send({
                            message: "Product Category has been Updated",
                        });
                    } else {
                        res.status(200).send({
                            message: "Product Category has not been Found",
                        });
                    }


                } else {
                    res.status(403).send({
                        message: "Permission denied"
                    });
                }

            }

        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
]
//get all categories
exports.index = [
    async (req, res, next) => {
        try {
            client.get('categoriess', async (error, response) => {
                if (response) {
                    res.send({
                        product_categories: JSON.parse(response)
                    });
                } else {
                    const result = await Category.aggregate()
                        .match({
                            status: "1",
                        })
                        .project({
                            "_id": 1,
                            "name": 1,
                            "description": 1,
                            "createdAt": 1,
                            "updatedAt": 1
                        });
                    client.setex('categories', 6000, JSON.stringify(result));
                    res.send({
                        product_categories: result
                    });
                }
            })
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
//get single category
exports.find = [
    async (req, res, next) => {
        try {
            console.log(req.params.id)
            const result = await Category.find({_id: req.params.id, status: "1"}, {
                "_id": 1,
                "name": 1,
                "description": 1,
                "createdAt": 1,
                "updatedAt": 1
            })
            res.send({
                product_category: result
            });
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
//Deactivate Product Category
exports.deactivate = [auth,
    async (req, res, next) => {
        try {
            const authUser = userData.user(req.headers.authorization);
            if (authUser.role == "admin") {
                let result = await Category.findByIdAndUpdate({
                    _id: req.params.id
                }, {
                    status: '0'
                });
                res.status(200).send({
                    user: result,
                    message: "The Product Category has been deactivated"
                });
            } else {
                res.status(403).send({
                    message: "Permission denied"
                });
            }


        } catch
            (error) {
            next(new httpError(500, {
                message: error
            }));
        }
    }
];
//activate Product Category
exports.activate = [auth,
    async (req, res, next) => {
        try {
            const authUser = userData.user(req.headers.authorization);
            if (authUser.role == "admin") {
                let result = await Category.findByIdAndUpdate({
                    _id: req.params.id
                }, {
                    status: '0'
                });
                res.status(200).send({
                    user: result,
                    message: "The Product Category has been activated"
                });
            } else {
                res.status(403).send({
                    message: "Permission denied"
                });
            }
        } catch
            (error) {
            next(new httpError(500, {
                message: error
            }));
        }
    }
];
//activate Product Category
exports.delete = [auth,
    async (req, res, next) => {
        try {
            const authUser = userData.user(req.headers.authorization);
            if (authUser.role == "admin") {
                let result = await Category.findByIdAndDelete({
                    _id: req.params.id
                });
                if (result) {
                    res.status(200).send({
                        user: result,
                        message: "The Product Category has been deleted"
                    });
                } else {
                    res.status(409).send({
                        user: result,
                        message: "The Product Category has not been deleted"
                    });
                }

            } else {
                res.status(403).send({
                    message: "Permission denied"
                });
            }
        } catch
            (error) {
            next(new httpError(500, {
                message: error
            }));
        }
    }
];