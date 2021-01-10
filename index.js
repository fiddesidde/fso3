const express = require('express');
const app = express();
const morgan = require('morgan');

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

let persons = [
    {
        name: 'Arto Hellas',
        number: '040-123456',
        id: 1,
    },
    {
        name: 'Ada Lovelace',
        number: '39-44-5323523',
        id: 2,
    },
    {
        name: 'Dan Abramov',
        number: '12-43-234345',
        id: 3,
    },
    {
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
        id: 4,
    },
];

app.get('/', (req, res) => {
    res.redirect('/api/persons');
});

app.get('/info', (req, res) => {
    res.send(`Phonebook has ${persons.length} entries <br> ${new Date()}`);
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.post('/api/persons', (req, res) => {
    const newId = Math.floor(Math.random() * 10000);
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: 'name/number is missing' });
    }
    if (persons.filter(person => person.name === name).length > 0) {
        return res
            .status(409)
            .json({ error: 'Person with this name already exist' });
    }

    const newPerson = {
        name: name,
        number: number,
        id: newId,
    };
    persons = persons.concat(newPerson);
    res.json(newPerson);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find(person => person.id === id);
    if (person) {
        res.json(person);
    } else {
        res.status(404).end();
    }
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter(person => person.id !== id);
    res.status(204).end();
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
