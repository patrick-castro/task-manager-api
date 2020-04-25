const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            trim: true,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        // Stores the ID of the owner
        owner: {
            type: mongoose.Schema.Types.ObjectId, // Data stored in owner is an object id
            required: true,
            ref: 'User', // Reference to the user
        },
    },
    {
        timestamps: true,
    }
);
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
