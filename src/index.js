const express = require('express');
// Only call the mongoose to ensure that the app is connected in the database
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

// Automatically parse incoming json to an object so we can access it in our request handlers.
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});
