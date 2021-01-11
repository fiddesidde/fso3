if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();

app.use(express.json());
app.use(express.static('build'));
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

app.post('/api/persons', async (req, res) => {
    try {
        const { name, number } = req.body;
        const sameNamePerson = await Person.find({ name: name });

        if (!name || !number) {
            return res.status(400).json({ error: 'name/number is missing' });
        }
        if (sameNamePerson.length > 0) {
            return res
                .status(409)
                .json({ error: 'Person with this name already exist' });
        }

        const newPerson = new Person({
            name,
            number,
        });
        await newPerson.save();
        res.json(newPerson);
    } catch (error) {
        console.log(error);
        res.status(500).end();
    }
});

app.get('/api/persons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const person = await Person.findById(id);
        if (person) {
            res.json(person);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: 'Incorrectly formatted id' });
    }
});

app.delete('/api/persons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Person.findByIdAndRemove(id);
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).end();
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
