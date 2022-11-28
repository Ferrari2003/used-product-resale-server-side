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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.send(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];
    console.log(token)
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        console.log(decoded)
        if (err) {
            return res.status(403).send({ message: 'forbidden access verifyjwt ' })

        }
        req.decoded = decoded
        next();
    })
}

async function run() {
    try {
        const categoriesCollection = client.db('bikeResale').collection('categories');
        const MyOrderCollection = client.db('bikeResale').collection('orders');
        const usersCollection = client.db('bikeResale').collection('users');
        const productCollection = client.db('bikeResale').collection('product');

        // make sure you verifyAdmin verifyHWT
        const verifyAdmin = async (req, res, next) => {
            console.log('inside verifyAdmin', req.decoded.email)
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access api' })
            }
            next()
        }

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

        app.get('/categorySpecial', async (req, res) => {
            const query = {}
            const result = await categoriesCollection.find(query).project({ title: 1 }).toArray();
            res.send(result)
        })

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { email: email };
            const bookings = await MyOrderCollection.find(query).toArray();
            res.send(bookings);
        });

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await MyOrderCollection.insertOne(booking);
            res.send(result)
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'

                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.get('/addOrders', verifyJWT,verifyAdmin, async (req, res) => {
            const query = {};
            const products = await productCollection.find(query).toArray();
            res.send(products)
        })

        app.post('/product', verifyJWT,verifyAdmin, async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result)
        });

        app.delete('/addOrders/:id', verifyJWT,verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(filter);
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
