const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true, // Creates index when mongoose is working with mongodb
    useUnifiedTopology: true,
    useFindAndModify: false,
});
