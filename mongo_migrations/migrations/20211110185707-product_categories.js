const faker = require('faker');
const {fa} = require("faker/lib/locales");
module.exports = {
    async up(db, client) {
        const user = await db.collection('users').findOne({});
        await db.collection('categories').insertMany([
            {
                'name': faker.name.findName(),
                'description': faker.lorem.text(),
                'user': user._id,
                'createdAt': new Date(),
                'updatedAt': new Date(),
                'status': 1
            }, {
                'name': faker.name.findName(),
                'description': faker.lorem.text(),
                'user': user._id,
                'createdAt': new Date(),
                'updatedAt': new Date(),
                'status': 1
            }, {
                'name': faker.name.findName(),
                'description': faker.lorem.text(),
                'user': user._id,
                'createdAt': new Date(),
                'updatedAt': new Date(),
                'status': 1
            }, {
                'name': faker.name.findName(),
                'description': faker.lorem.text(),
                'user': user._id,
                'createdAt': new Date(),
                'updatedAt': new Date(),
                'status': 1
            },

        ]);
    },

    async down(db, client) {

        await db.collection('categories').deleteMany();
    }
};
