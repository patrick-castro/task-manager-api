const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    // If the user isnt the value, the catch block will run
    // Validates through header
    try {
        // Authorization is a key in Postman header
        const token = req.header('Authorization').replace('Bearer ', ''); // Remove the substring Bearer in the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user with the correct authentication ID with the authentication token still stored
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error(); // This will trigger catch below so no need to write a message
        }

        req.token = token;
        req.user = user; // This is passed to the route handler
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' });
    }
};

module.exports = auth;
