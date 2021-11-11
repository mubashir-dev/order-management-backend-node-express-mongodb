const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}, (err) => {
    if (!err) {
        console.log(`MONGODB CONNECTION HAS MADE :  ${process.env.MONGO_DB}`)
    } else {
        console.log(`DB CONNECTION HAS FAILED ${err.stack}`)
    }
});

module.exports =
    {
        url: mongoose.connection
    }


