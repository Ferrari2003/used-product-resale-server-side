const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;

// middle wares

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjha8kd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
   
    if(!authHeader){
        return res.send(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        console.log(err)
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded
        next();
    })
}

async function run() {
    try {
        const categoriesCollection = client.db('bikeResale').collection('categories');
        const bookingsCollection = client.db('bikeResale').collection('bookings');
        const usersCollection = client.db('bikeResale').collection('users');

        app.get('/', async (req, res) => {
            const query = {}
            const cursor = await categoriesCollection.find(query).toArray()
            res.send(cursor)
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const category = await categoriesCollection.findOne(query)
            res.send(category);
        });

        app.get('/bookings',verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !==decodedEmail){
                return res.status(403).send({message: 'forbidden access'});
            }

            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user){
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({accessToken: token});
            }
            res.status(403).send({ accessToken: '' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('server running')
});


app.listen(port, () => {
    console.log(`backEnd Server is Running${port}`)
})
