///////////////////////////////////////////////
//////// REST API route for Task model ////////
///////////////////////////////////////////////

const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/task');
const router = new express.Router();

// Creates a new task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body, // ES6 spread operator. It copies the req.body object to task
        owner: req.user._id, // Assigns a user for task
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Fetches all tasks
// GET /tasks?completed=true||false
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:asc||desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'; // match.completed = true if the condition is correct
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user
            .populate({
                path: 'tasks',
                match, // Shorthand syntax
                options: {
                    limit: parseInt(req.query.limit), // The number of documents on first load
                    skip: parseInt(req.query.skip), // Skips the results to <skip_value> + 1
                    sort, // Shorthand syntax
                },
            })
            .execPopulate();

        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

// Fetches a specific task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        // This filters the task thru the id and owner filter
        const task = await Task.findOne({ _id, owner: req.user._id }); // Shorthand syntax
        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.send(404).send();
    }
});

// Updates a specific task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.send(400).send();
    }
    try {
        const _id = req.params.id;
        const body = req.body;
        // const task = await Task.findByIdAndUpdate(_id, body, {
        //     new: true,
        //     runValidators: true,
        // });
        // const task = await Task.findById(_id);
        const task = await Task.findOne({ _id: _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => {
            task[update] = body[update];
        });
        await task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send();
    }
});

// Deletes a specific tasks
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const _id = req.params.id;
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(500).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
