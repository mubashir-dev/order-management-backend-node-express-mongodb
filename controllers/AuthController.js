const {
    body,
    check,
    validationResult
} = require("express-validator");
const User = require("../models/user.model");
const ObjectId = require('mongoose').Types.ObjectId;
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");
const {authRegisterSchema, LoginSchema, authEditSchema, ChangePasswordSchema} = require('../validations/auth.validate')
const _ = require('underscore');
const {UserUpload} = require('../config/storage');

//register user
exports.register = async (req, res, next) => {
    try {
        const validationResult = authRegisterSchema.validate(req.body, {abortEarly: false});
        if (!_.isEmpty(validationResult.error)) {
            let _errors = [];
            validationResult.error.details.forEach((element) => {
                _errors.push(element.message);
            });
            res.status(422).send({
                errors: _errors
            });
        } else {
            const emailExist = await User.findOne({email: req.body.email})
            const usernameExist = await User.findOne({username: req.body.username})
            if (emailExist)
                next(new httpError(422, {
                    message: `This ${req.body.email} email is already been registered`
                }));
            if (usernameExist)
                next(new httpError(422, {
                    message: `This ${req.body.username} username is already been registered`
                }));
            let hash = await passwordHash.hash(req.body.password);
            const user = new User({
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: hash
            })
            const result = await user.save();
            res.status(200).send({
                user: result
            });
        }

    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}
//register user
exports.addProfileImage = [
    auth,
    async (req, res, next) => {
        try {
            if (!req.file) {
                next(new httpError(422, {
                    message: "Select Profile Image"
                }));
            } else {
                const user = userData.user(req.headers.authorization);
                try {
                    UserUpload.single('image')
                } catch (err) {
                    console.log("Error has occurred while uploading Profile Image");
                }
                const userExist = await User.findOne({_id: user._id})
                if (userExist) {
                    const result = await userExist.update({image: '/users/' + req.file.filename});
                    res.status(200).send({
                        user: result,
                        message: "User Profile Image has been Added"
                    });
                } else {
                    res.status(404).send({
                        message: "User has not found"
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
//login
exports.login = async (req, res, next) => {
    try {
        const validationResult = LoginSchema.validate(req.body, {abortEarly: false});
        if (!_.isEmpty(validationResult.error)) {
            let _errors = [];
            validationResult.error.details.forEach((element) => {
                _errors.push(element.message);
            });
            res.status(422).send({
                errors: _errors
            });
        } else {
            const foundUser = await User.findOne({
                email: req.body.email,
            })
            if (!foundUser) {
                next(new httpError(404, 'User is not found in our system'));
            }
            //Compare password
            let hashCompare = await passwordHash.compare(req.body.password, foundUser.password);

            if (hashCompare) {
                //Check if user is active or suspended
                if (foundUser.status == '1') {
                    let userData = {
                        _id: foundUser._id,
                        name: foundUser.name,
                        email: foundUser.email,
                        username: foundUser.username,
                        role: foundUser.role,
                        image: req.get('Host')+foundUser.image ?? null,
                        status: foundUser.status == 1 ? "Active" : "Suspend",
                    };
                    //Prepare JWT token for authentication
                    const jwtPayload = userData;
                    const jwtData = {
                        expiresIn: process.env.JWT_TIMEOUT_DURATION,
                    };
                    const secret = process.env.JWT_SECRET;
                    res.status(200).send({
                        message: "Successfully Logged-In",
                        token: jwt.sign(jwtPayload, secret, jwtData),
                        expires: jwtData.expiresIn,
                        user: userData
                    })
                } else {
                    next(new httpError(400, 'Your Account is not activated'));
                }
            }
            next(new httpError(401, {
                message: "Password or Email is not Correct"
            }));
        }
    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}
//get all users,this is only for admin
exports.index = [auth,
    async (req, res, next) => {
        try {
            const user = userData.user(req.headers.authorization);
            if (user.role == 'admin') {
                const result = await User.aggregate()
                    .match({
                        status: "1",
                        _id: {$ne: user._id}
                    })
                    .project({
                        "_id": 1,
                        "role": 1,
                        "status": 1,
                        "name": 1,
                        "username": 1,
                        "email": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    });
                res.send({
                    users: result
                });
            } else {
                next(new httpError(403, {
                    message: "Permission denied"
                }));
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
//get single user,this is only for admin
exports.find = [auth,
    async (req, res, next) => {
        try {
            const user = userData.user(req.headers.authorization);
            if (user.role == 'admin') {
                const result = await User.aggregate()
                    .match({
                        _id: req.params.id,
                        status: "1"
                    })
                    .project({
                        "_id": 1,
                        "role": 1,
                        "status": 1,
                        "name": 1,
                        "username": 1,
                        "email": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    });

                res.send({
                    user: result,
                });
            } else {
                next(new httpError(401, {
                    message: "You don't have permissions to do this"
                }));
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
exports.update = [auth,
    async (req, res, next) => {
        try {
            const validationResult = authEditSchema.validate(req.body, {abortEarly: false});
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
                let result = await User.findByIdAndUpdate({
                    _id: user._id
                }, {
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email
                });
                res.status(200).send({
                    message: "User Profile has been updated"
                });
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
//get single user,this is only for amdin
exports.changePassword = [auth,
    async (req, res, next) => {
        try {
            const validationResult = ChangePasswordSchema.validate(req.body, {abortEarly: false});
            if (!_.isEmpty(validationResult.error)) {
                let _errors = [];
                validationResult.error.details.forEach((element) => {
                    _errors.push(element.message);
                });
                res.status(422).send({
                    errors: _errors
                });
            } else {
                const auth_user = userData.user(req.headers.authorization);
                let hash = await passwordHash.hash(req.body.password);
                let user = await User.findOne({
                    _id: auth_user._id
                });
                if (user) {
                    let result = await User.findByIdAndUpdate({
                        _id: auth_user._id
                    }, {
                        password: hash
                    });
                    res.status(200).send({
                        user: result,
                        message: "Your password has been updated"
                    });
                } else {
                    res.status(404).send({
                        message: "User has not been found"
                    });
                }
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
//Deactivate user
exports.deactivate = [auth,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (req.params.id == undefined) {
                next(new httpError(422, {
                    message: "User id must be passed"
                }));
            } else {
                let user = await User.findOne({
                    _id: req.params.id
                });
                if (user) {
                    const authUser = userData.user(req.headers.authorization);
                    if (authUser.role == "admin") {
                        let result = await User.findByIdAndUpdate({
                            _id: req.params.id
                        }, {
                            status: '0'
                        });
                        res.status(200).send({
                            user: result,
                            message: "The user has been deactivated"
                        });
                    } else {
                        res.status(200).send({
                            message: "Permission denied"
                        });
                    }

                } else {
                    res.status(404).send({
                        message: "User has not been found"
                    });
                }
            }
        } catch (error) {
            next(new httpError(500, {
                message: error
            }));
        }
    }
];
//activate user
exports.activate = [auth,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (req.params.id == undefined) {
                next(new httpError(422, {
                    message: "User id must be passed"
                }));
            } else {
                let user = await User.findOne({
                    _id: req.params.id
                });
                if (user) {
                    const authUser = userData.user(req.headers.authorization);
                    if (authUser.role == "admin") {
                        let result = await User.findByIdAndUpdate({
                            _id: req.params.id
                        }, {
                            status: '0'
                        });
                        res.status(200).send({
                            user: result,
                            message: "The user has been activated"
                        });
                    } else {
                        res.status(200).send({
                            message: "Permission denied"
                        });
                    }

                } else {
                    res.status(404).send({
                        message: "User has not been found"
                    });
                }
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
//logout user
exports.logout = []