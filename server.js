const express = require('express');
const bodyParser = require('body-parser');
const braintree = require('braintree');

const app = express();

app.use(bodyParser.json());

// Replace with your Braintree credentials
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox, // Use Sandbox for testing, switch to Production for live
    merchantId: '4zpxkccbmgvntj5q',
    publicKey: 'qsrs84q46pqkhv2f',
    privateKey: 'c608fe111ba533b9228fcceb4e95a909'
});

// Generate client token for client-side initialization
app.get('/api/client_token', (req, res) => {
    gateway.clientToken.generate({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(response.clientToken);
        }
    });
});

// Handle payment transaction
app.post('/api/checkout', (req, res) => {
    const nonceFromTheClient = req.body.paymentMethodNonce;
    const amountToCharge = req.body.amount;

    gateway.transaction.sale({
        amount: amountToCharge,
        paymentMethodNonce: nonceFromTheClient,
        options: {
            submitForSettlement: true
        }
    }, (err, result) => {
        if (err) {
            res.status(500).send(err);
            console.log(err);
        } else if (result.success) {
            res.send(result);
            console.log(result);
        } else {
            res.status(400).send(result);
            console.log(result);
        }
    });
});

// Export the app as a Vercel serverless function
module.exports = app;
