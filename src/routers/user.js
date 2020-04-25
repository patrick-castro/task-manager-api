///////////////////////////////////////////////
//////// REST API route for User model ////////
///////////////////////////////////////////////

// Create new router to be registered in the Express application
const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');
const router = new express.Router();

// Creates a new user
router.post('/users', async (req, res) => {
    // req.body is the json object of the document
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token }); // Shorthand syntax
    } catch (e) {
        res.status(400).send(e);
    }
});

// Logs in user
router.post('/users/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        // Custom methods in object is not possible without schema
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.send({ user, token }); // This gets data from userSchema.methods.toJSON
    } catch (e) {
        res.status(400).send();
    }
});

// Logs out user
router.post('/users/logout', auth, async (req, res) => {
    try {
        // If the token/s from the user tokens array is not the auth token, it gets stored in req.user.tokens
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Logs out all sessions of the user
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Reads user data
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// Updates the user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    // Allowable properties from the collection to be updated
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    // Loops through every key in updates. If a key is not in allowedUpdates, isValidOperation is false
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const _id = req.user.id;
        const body = req.body;

        updates.forEach((update) => {
            req.user[update] = body[update];
        });
        await req.user.save();

        res.send(req.user);
    } catch (e) {
        return res.status(400).send();
    }
});

//Deletes a specific user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove(); // Mongoose method
        sendCancelationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png )$/)) {
            return cb(new Error('Please upload an image.'));
        }
        cb(undefined, true);
    },
});

// Uploads an avatar
router.post(
    '/users/me/avatar',
    auth, // Must be before the upload function
    upload.single('avatar'),
    async (req, res) => {
        // req.user.avatar = req.file.buffer; // Stores the image buffer to the avatar field

        // Makes the image uniform
        // The size is adjusted into the specified dimension and the file extension will be converted into png
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
        req.user.avatar = buffer; // Stores the modified image
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message }); // Returns this json message rather an a html
    }
);

// Deletes avatar
// This deletes the avatar field
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

// Fetching the avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        // Tell the requester that it is an image
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

module.exports = router;
