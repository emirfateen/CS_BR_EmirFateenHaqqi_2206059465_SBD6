const express = require('express');

require('dotenv').config();

const bodyParser = require('body-parser');
const eventRepo = require('./repositories/repository.event');

const port = 9465;
const app = express();

app.use(bodyParser.json());

app.post('/events', eventRepo.addEvent);
app.get('/events', eventRepo.getAllEvents);
app.put('/events/:id', eventRepo.updateEvent);
app.delete('/events/:id', eventRepo.deleteEvent);
app.post('/events/bulk', eventRepo.bulkEvent);
app.get('/events/country/:country', eventRepo.getEventsByCountry);
app.get('/events/paginate/:page/:pageSize', eventRepo.getPaginated);

app.listen(port, () => {
    console.log('Server is running and listening on port ', port);
});