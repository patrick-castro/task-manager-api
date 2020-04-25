const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            // Ensures that every email saved is unique
            // If the db is already created, it must be dropped in order for this to work
            // This will create an index in the db
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid!');
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot contain "password"');
                }
            },
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be a positive number!');
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer, // Stored buffer of binary image data
        },
    },

    {
        timestamps: true,
    }
);

// Virtual property - Relationship between two entities
userSchema.virtual('tasks', {
    ref: 'Task', // Model
    localField: '_id', // Local ID data
    foreignField: 'owner', // Name of the field for the other thing, in this case task
});

// This is a standard function
// Removes the password and auth token
// userSchema.methods.getPublicProfile = function () {
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar; // Does not include this because fetching images is a heavy workload

    return userObject;
};

// Must not be an arrow function
// Accessible in the instance methods
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    // Converts object id to string
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token }); // Shorthand syntax
    await user.save();
    return token;
};

// Custom method for validating credentials
// Accessible in the model methods
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email }); // Returns a single document
    if (!user) {
        throw new Error('Unable to login');
    }
    // Won't run if there is no user found
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
};

// Do something before the save event
// Note that the function must NOT be an arrow function
// Arrow functions don't bind "this"
// "This" gives access to the individual user before being saved
// Param "next" is called when the function is done doing its purpose
// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    // Dont hash password if it is already hashed
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
