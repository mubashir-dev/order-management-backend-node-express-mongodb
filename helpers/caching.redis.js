const redis = require('redis')
const {client} = require("./caching.redis");

exports.client = redis.createClient({
    host:'127.0.0.1',
    port: 6379,
});

