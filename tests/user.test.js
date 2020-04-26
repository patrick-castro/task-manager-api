const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

// // Runs after each test case in the test suite
// afterEach(() => {
//     console.log('afterEach');
// });

test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Patrick',
            email: 'castropatrickantonio@gmail.com',
            password: 'abc1234',
        })
        .expect(201); // Expects 201 HTTP code

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    // expect(response.body.user.name).toBe('Patrick');

    // Asserts the user's name, email and the token we get back
    expect(response.body).toMatchObject({
        user: {
            name: 'Patrick',
            email: 'castropatrickantonio@gmail.com',
        },
        token: user.tokens[0].token,
    });

    // Make sure that the plain word password is not stored in the database
    expect(user.password).not.toBe('abc1234');
});

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: 'pncastro@up.edu.ph',
            password: 'abc1234',
        })
        .expect(200); // Expects 201 HTTP code

    const user = await User.findById(userOneId);

    // Compares the second token to the current token used by the user
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'userOne.email',
            password: 'abc1234asdfdsa', // Intended to be incorrect
        })
        .expect(400); // Expects 201 HTTP code
});

test('Should get profile for user', async () => {
    await request(app).get('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
    await request(app).delete('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200);
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('Should not delete account for user', async () => {
    await request(app).delete('/users/me').send().expect(401);
});

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    const user = await User.findById(userOneId);

    // Checks if the stored avatar is in Buffer form
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Patrick',
        })
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Patrick');
});

test('Should not update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Davao',
        })
        .expect(400);
});
