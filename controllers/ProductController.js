const Product = require("../models/product.model");
const Category = require("../models/category.model");
const ObjectId = require('mongoose').Types.ObjectId;
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");
const {productSchema} = require('../validations/product.validate')
const _ = require('underscore');
const {UserUpload, ProductUpload} = require("../config/storage");

//create product
exports.create = [auth,
    async (req, res, next) => {
        try {
            const validationResult = productSchema.validate(req.body, {abortEarly: false});
            if (!_.isEmpty(validationResult.error)) {
                let _errors = [];
                validationResult.error.details.forEach((element) => {
                    _errors.push(element.message);
                });
                res.status(422).send({
                    errors: _errors
                });
            } else if (!req.file) {
                next(new httpError(422, {
                    message: "Select Product Image"
                }));
            } else if (!ObjectId.isValid(req.body.category)) {
                next(new httpError(422, {
                    message: "Product Category ID is not in proper format"
                }));
            } else {
                const user = userData.user(req.headers.authorization);
                const nameExist = await Product.findOne({name: req.body.name})
                if (nameExist) {
                    next(new httpError(422, {
                        message: `This ${req.body.name} name is already been registered`
                    }));
                }
                //check if the product category is not in database
                const categoryExist = await Category.findOne({_id: req.body.category})
                if (!categoryExist) {
                    next(new httpError(422, {
                        message: `This Product Category has not been found`
                    }));
                }

                //Uploading Image
                try {
                    ProductUpload.single('image')
                } catch (err) {
                    console.log("Error has occurred while uploading Profile Image");
                }
                const category = new Product({
                    name: req.body.name,
                    description: req.body.description,
                    image: '/products/' + req.file.filename,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    category: req.body.category,
                    user: user._id
                })
                const result = await category.save();
                res.status(200).send({
                    message: "Product has been Created",
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

//edit product
exports.update = [auth,
    async (req, res, next) => {
        try {
            const validationResult = productSchema.validate(req.body, {abortEarly: false});
            if (!_.isEmpty(validationResult.error)) {
                let _errors = [];
                validationResult.error.details.forEach((element) => {
                    _errors.push(element.message);
                });
                res.status(422).send({
                    errors: _errors
                });
            } else if (!ObjectId.isValid(req.params.id)) {
                next(new httpError(422, {
                    message: "Product ID is not in proper format"
                }));
            } else {
                const user = userData.user(req.headers.authorization);

                if (user.role == "admin") {
                    const product = await Product.findOne({_id: req.params.id})
                    if (product) {
                        if (req.files) {
                            //Uploading Image
                            try {
                                ProductUpload.single('image')
                            } catch (err) {
                                console.log("Error has occurred while uploading Profile Image");
                            }
                            const updateProduct = await Product.findByIdAndUpdate({_id: req.params.id}, {
                                name: req.body.name,
                                description: req.body.description,
                                price: req.body.price,
                                image: '/products/' + req.file.filename,
                                quantity: req.body.quantity,
                                category: req.body.category,
                                user: user._id
                            })
                            if (updateProduct) {
                                res.status(200).send({
                                    message: "Product has been Updated",
                                });
                            } else {
                                res.status(200).send({
                                    message: "Product has not been Found",
                                });
                            }

                        } else {
                            const updateProduct = await Product.findByIdAndUpdate({_id: req.params.id}, {
                                name: req.body.name,
                                description: req.body.description,
                                price: req.body.price,
                                quantity: req.body.quantity,
                                category: req.body.category,
                                user: user._id
                            })

                            if (updateProduct) {
                                res.status(200).send({
                                    message: "Product has been Updated",
                                });
                            } else {
                                res.status(200).send({
                                    message: "Product has not been Found",
                                });
                            }
                        }
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
//get all products
exports.index = [
    async (req, res, next) => {
        try {
            const result = await Product.aggregate(
            ).match({
                status: "1"
            }).project({
                "_id": 1,
                "name": 1,
                "quantity": 1,
                "category": 1,
                "image": {$concat: [req.get('Host'), "/public", '$image']},
                "price": 1,
                "description": 1,
                "createdAt": 1,
                "updatedAt": 1

            });
            res.send({
                products: result
            });
        } catch
            (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
]
;
//get single product
exports.find = [
    async (req, res, next) => {
        try {
            const result = await Product.aggregate([

                {
                    $match: {
                        status: '1',
                        _id: ObjectId(req.params.id)
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "quantity": 1,
                        "category.name": 1,
                        "image": {$concat: [req.get('Host'), "/public", '$image']},
                        "price": 1,
                        "description": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    }
                }


            ]);
            res.send({
                product: result
            });
        } catch
            (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
]
;
//Deactivate Product product
exports.deactivate = [auth,
    async (req, res, next) => {
        try {
            const authUser = userData.user(req.headers.authorization);
            if (authUser.role == "admin") {
                let result = await Product.findByIdAndUpdate({
                    _id: req.params.id
                }, {
                    status: '0'
                });
                res.status(200).send({
                    user: result,
                    message: "The Product has been deactivated"
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
                let result = await Product.findByIdAndUpdate({
                    _id: req.params.id
                }, {
                    status: '0'
                });
                res.status(200).send({
                    user: result,
                    message: "The Product has been activated"
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
];//activate Product Category
exports.delete = [auth,
    async (req, res, next) => {
        try {
            const authUser = userData.user(req.headers.authorization);
            if (authUser.role == "admin") {
                let result = await Product.findByIdAndDelete({
                    _id: req.params.id
                });
                if (result) {
                    res.status(200).send({
                        user: result,
                        message: "The Product  has been deleted"
                    });
                } else {
                    res.status(409).send({
                        user: result,
                        message: "The Product has not been deleted"
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