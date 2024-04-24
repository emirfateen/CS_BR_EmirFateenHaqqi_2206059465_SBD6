const { Pool } = require("pg");

const pool = new Pool({
    user: "emir",
    password: "Mcz9Bwrg7smu",
    host: "ep-orange-block-a1srykew.ap-southeast-1.aws.neon.tech",
    database: "emir_6",

    ssl: {
        require: true,
    },
});

pool.connect().then(()=> {
    console.log("Connected to PostgreSQL database");
});

async function getAllEvents(req,res){
    try{
        const result = await pool.query(
            'select * from historyevent'
        );
        const events = result.rows;
        res.status(200).json(events);
    }catch (error){
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function addEvent(req,res){
    const {title, description, year, period, month, day, country, city} = req.body;

    try{
        const result = await pool.query(
            'insert into historyevent (title, description, year, period, month, day, country, city) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *',
            [title, description, year, period, month, day, country, city]
        );
        const newEvent = result.rows[0];
        res.status(201).json(newEvent);
    }catch (error){
        res.status(500).json({error: "Internal Server Error"});
        console.error(error);
    }
}

async function updateEvent(req,res){
    const eventId = req.params.id;
    const {title, description, year, period, month, day, country, city} = req.body;

    try{
        const result = await pool.query(
            'update historyevent set title = $1, description = $2, year = $3, period = $4, month = $5, day = $6, country = $7, city = $8 where id = $9 returning *',
            [title, description, year, period, month, day, country, city, eventId]
        );
        if (result.rowCount == 0){
            return res.status(404).json({ error: "Event not found"});
        }
        console.log(result);

        const updatedEvent = result.rows[0];
        res.status(200).json(updatedEvent);
    }catch (error){
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function deleteEvent(req,res){
    const eventId = req.params.id;
    
    try{
        const result = await pool.query(
            'delete from historyevent where id = $1 returning *',
            [eventId]
        );
        if (result.rowCount == 0){
            return res.status(404).json({ error: "Event not found"});
        }

        res.status(204).send();
    }catch (error){
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function bulkEvent(req, res) {
    const { events } = req.body;
    try {
        const values = events.map(event => {
            const { title, description, year, period, month, day, country, city } = event;
            return [title, description, year, period, month, day, country, city];
        });
        const result = await pool.query(
            `insert into historyevent (title, description, year, period, month, day, country, city) values 
            ${values.map((_, index) => `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`).join(",")}
            returning *`,
            values.flat()
        );
        res.status(201).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}   

async function getEventsByCountry(req,res){
    const { country } = req.params;
    try {
        const result = await pool.query(`select * from historyevent where country = $1`, [country]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getPaginated(req, res){
    const { page, pageSize } = req.params;
    try {
        const result = await pool.query(`select * from historyevent limit $1 offset $2`, [pageSize, (page - 1) * pageSize]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    addEvent,
    getAllEvents,
    updateEvent,
    deleteEvent,
    bulkEvent,
    getEventsByCountry,
    getPaginated
};