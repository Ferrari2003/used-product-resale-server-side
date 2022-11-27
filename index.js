const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;

// middle wares

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjha8kd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const categoriesCollection = client.db('bikeResale').collection('categories');
        const bookingsCollection = client.db('bikeResale').collection('bookings');
        const usersCollection = client.db('bikeResale').collection('users');

       app.get('/', async(req, res)=> {
        const query = {}
        const cursor = await categoriesCollection.find(query).toArray()
        res.send(cursor)
       })

       app.get('/category/:id', async(req, res)=> {
        const id = req.params.id
        const query = {_id: ObjectId(id)}
        const category = await categoriesCollection.findOne(query)
        res.send(category);
       });

       app.get('/bookings', async(req, res) => {
        const email = req.query.email;
        const query = {email:email};
        const bookings = await bookingsCollection.find(query).toArray();
        res.send(bookings);
       })

       app.post('/bookings', async(req, res) => {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);
        res.send(result)
       });

       app.post('/users', async(req, res)=> {
        const user = req.body;
        const result =await usersCollection.insertOne(user);
        res.send(result);
       })

    }
    finally{

    }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('server running')
});


app.listen(port, () => {
    console.log(`backEnd Server is Running${port}`)
})
