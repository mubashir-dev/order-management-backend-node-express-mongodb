const faker = require('faker');
const passwordHash = require("../../helpers/password.hash");
module.exports = {
    async up(db, client) {
        await db.collection('users').insertMany([
            {
                'name': faker.name.findName(),
                'username': faker.internet.userName(),
                'email': faker.internet.email(),
                'password': await passwordHash.hash('123456'),
                'role': 'user',
                'status': '1',
                'createdAt': new Date(),
                'updatedAt': new Date(),
            },
            {
                'name': faker.name.findName(),
                'username': faker.internet.userName(),
                'email': faker.internet.email(),
                'password': await passwordHash.hash('123456'),
                'role': 'user',
                'status': '1',
                'createdAt': new Date(),
                'updatedAt': new Date(),
            },
            {
                'name': faker.name.findName(),
                'username': faker.internet.userName(),
                'email': faker.internet.email(),
                'password': await passwordHash.hash('123456'),
                'role': 'user',
                'status': '1',
                'createdAt': new Date(),
                'updatedAt': new Date(),
            },
            {
                'name': faker.name.findName(),
                'username': faker.internet.userName(),
                'email': faker.internet.email(),
                'password': await passwordHash.hash('123456'),
                'role': 'user',
                'status': '1',
                'createdAt': new Date(),
                'updatedAt': new Date(),
            }

        ]);
    },

    async down(db, client) {

        await db.collection('users').deleteMany();
    }
};
