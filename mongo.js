const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log(
        'Please provide the password as an argument: node mongo.js <password>'
    );
    process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://first-user:${password}@cluster0.ho4n1.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
    name,
    number,
});

const addPerson = async () => {
    await person.save();
    console.log(`added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
};

const logAllPersons = async () => {
    const persons = await Person.find({});
    console.log('Phonebook:');
    persons.forEach(person => {
        console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
};

if (name && number) {
    addPerson();
} else {
    logAllPersons();
}

// person.save().then(res => {
//     console.log('person saved!');
//     mongoose.connection.close();
// });

// Person.find({}).then(result => {
//     result.forEach(person => {
//         console.log(person);
//     });
//     mongoose.connection.close();
// });

// const addPerson = async () => {
//     notes = await Person.find({});
//     console.log(notes);
//     mongoose.connection.close();
// };
