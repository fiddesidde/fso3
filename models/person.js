const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'error connecting to MongoDB:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const personSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, minlength: 3 },
    number: { type: String, required: true, minlength: 8 },
});

personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model('Person', personSchema);
