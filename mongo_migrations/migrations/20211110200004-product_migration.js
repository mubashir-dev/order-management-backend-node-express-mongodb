const faker = require("faker");
const {fa} = require("faker/lib/locales");
module.exports = {
    async up(db, client) {
        const user = await db.collection('users').findOne({});
        const category = await db.collection('categories').findOne({});
        await db.collection('products').insertMany([
            {
                'name': faker.name.findName(),
                'description': faker.lorem.text(),
                'price': faker.commerce.price,
                'quantity': faker.commerce.quantity,
                'category': category._id,
                'user': user._id,
                'createdAt': new Date(),
                'updatedAt': new Date(),
                'status': 1
            }, {
                'name': faker.name.findName(),
                'description': faker.lorem.text(),
                'price': faker.commerce.price,
                'quantity': faker.commerce.quantity,
                'category': category._id,
                'user': user._id,
                'createdAt': new Date(),
                'updatedAt': new Date(),
                'status': 1
            }, {
                'name': faker.name.findName(),
                'description': faker.lorem.text(),
                'price': faker.commerce.price,
                'quantity': faker.commerce.quantity,
                'category': category._id,
                'user': user._id,
                'createdAt': new Date(),
                'updatedAt': new Date(),
                'status': 1
            }

        ]);
    },

    async down(db, client) {
        await db.collection('products').deleteMany();
    }
};
