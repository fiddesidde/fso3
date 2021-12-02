//if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
//}

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const Person = require('./models/person');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());
app.use(
    morgan('tiny', {
        skip: (req, res) => req.method === 'POST',
    })
);
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :body',
        {
            skip: (req, res) => req.method !== 'POST',
        }
    )
);

app.get('/', (req, res) => {
    res.redirect('/api/persons');
});

app.get('/info', async (req, res) => {
    const persons = await Person.find({});
    res.send(`Phonebook has ${persons.length} entries <br> ${new Date()}`);
});

app.get('/api/persons', async (req, res) => {
    const persons = await Person.find({});
    res.json(persons);
});

app.post('/api/persons', async (req, res, next) => {
    try {
        const { name, number } = req.body;
        const newPerson = new Person({
            name,
            number,
        });
        await newPerson.save();
        res.json(newPerson);
    } catch (error) {
        next(error);
    }
});

app.get('/api/persons/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const person = await Person.findById(id);
        if (person) {
            res.json(person);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        next(error);
    }
});

app.delete('/api/persons/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await Person.findByIdAndRemove(id);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

app.put('/api/persons/:id', async (req, res, next) => {
    try {
        const { name, number } = req.body;
        const { id } = req.params;

        const person = {
            name,
            number,
        };

        const updatedPerson = await Person.findByIdAndUpdate(id, person, {
            new: true,
            runValidators: true,
            context: 'query',
        });
        res.json(updatedPerson);
    } catch (error) {
        next(error);
    }
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
    console.log(error.message);

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'Incorrectly formatted id' });
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
