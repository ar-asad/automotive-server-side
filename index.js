const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// const objectID=require('mongodb').ObjectId;


//Middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ruibyui.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        client.connect();
        const toyCarCollection = client.db("toycar").collection("cars");

        app.get('/cars', async (req, res) => {
            const searchQuery = req.query.search;
            let query = {};
            if (searchQuery) {
                query = {
                    toy_name: { $regex: new RegExp(searchQuery) },
                }
            }

            const results = await toyCarCollection.find(query).limit(20).toArray();
            res.send(results);
        });

        app.get('/cars/category', async (req, res) => {
            const category = req.query.category;
            let query;
            if (category) {
                query = { sub_category: category }
            }
            const result = await toyCarCollection.find(query).limit(3).toArray();
            res.send(result);
        })

        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const car = await toyCarCollection.findOne(query);
            res.send(car);
        });

        app.get('/mytoy', async (req, res) => {
            const email = req.query.email;
            const query = { seller_email: email }
            const user = await toyCarCollection.find(query).sort({ "price": 1, "_id": 1 }).toArray();
            res.send(user)
        })

        app.post('/cars', async (req, res) => {
            const addcar = req.body;
            const result = await toyCarCollection.insertOne(addcar)
            res.send(result);
        });

        app.put('/cars/:id', async (req, res) => {
            const updateCarInfo = req.body;
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    price: updateCarInfo.price,
                    available_quantity: updateCarInfo.available_quantity,
                    description: updateCarInfo.description
                }
            }
            const result = await toyCarCollection.updateOne(filter, updatedDoc);
            res.send(result);

        });

        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await toyCarCollection.deleteOne(filter);
            res.send(result);
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Hello World from Example app");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});