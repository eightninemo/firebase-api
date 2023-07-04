/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const express = require('express');
const app = express();
const db = admin.firestore();
//
const cors = require('cors');
app.use(cors({origin: true}))

// Routes
app.get('/hello-world', (req, res) => {
return res.status(200).send('Hello World!');
});


// Create
// post method
app.post('/api/create', (req, res) => {
    (async () => {
        try{
            await db.collection('products').doc('/' + req.body.id + '/').create({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price
            });

            return res.status(200).send({
                error: false,
                message: "Product Created Successfully.",
                data: {
                    id: req.body.id,
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price
                }

            });
        }
        catch(e)
        {
            console.log(e);
            res.status(500).send(e);
        }
    })();
    });

// Read(get product based on ID)
// get method
app.get('/api/read/:id', (req, res) => {
    (async () => {
        try{
           const document = db.collection('products').doc(req.params.id);
           let product = await document.get();
           let response = product.data();
            return res.status(200).send({
                error: false,
                data: response
            });
        }
        catch(e)
        {
            console.log(e);
            res.status(500).send(e);
        }
    })();
    });

// read all products
app.get('/api/read-products', (req, res) => {
    (async () => {
        try{
         let query = db.collection('products');
         let response = [];

         await query.get().then(querySnapshot => {
            let docs =querySnapshot.docs; // result of the query
            for(let doc of docs){
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    description: doc.data().description,
                    price: doc.data().price
                };
                response.push(selectedItem);
            }
            return response;
         })
         return res.status(200).send(response);
        }
        catch(e)
        {
            console.log(e);
            res.status(500).send(e);
        }
    })();
    });

// Update
// put method
app.put('/api/update/:id', (req, res) => {
    (async () => {
        try{
            const document = db.collection('products').doc(req.params.id);
            await document.update({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price
            })

            return res.status(200).send({
                error: false,
                message: "Product Updated Successfully.",
                data: {
                    id: req.body.id,
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price
                }

            });
        }
        catch(e)
        {
            console.log(e);
            res.status(500).send(e);
        }
    })();
    });

// delete
// delete method
app.delete('/api/delete/:id', (req, res) => {
    (async () => {
        try{
            const document = db.collection('products').doc(req.params.id);
            await document.delete();

            return res.status(200).send({
                error: false,
                message: "Product Deleted Successfully.",
            });
        }
        catch(e)
        {
            console.log(e);
            res.status(500).send(e);
        }
    })();
    });


// Export the api to firebase cloud functions
exports.app = functions.https.onRequest(app);