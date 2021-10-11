const {v4: uuidv4} = require('uuid');
const multer = require('multer');
const path = require('path');

//For Storing User Images
const UserStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads/users');
    },
    filename: function (req, file, callback) {
        callback(null, uuidv4() + '-' + path.extname(file.originalname));
    }
})
//Multer Configuration for uploading User Profiles
const UserUpload = multer({
    storage: UserStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

module.exports = {
    UserUpload
}