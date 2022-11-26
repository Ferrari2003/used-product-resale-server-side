const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjha8kd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const categoriesCollection = client.db('bikeResale').collection('categories');

        app.get('/category', async(req, res)=> {
            const query= {};
            const options = await categoriesCollection.find(query).toArray();
            res.send(options)
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
