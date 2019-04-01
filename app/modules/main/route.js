var express = require('express');
var router = express.Router();
var logInRouter = express.Router();
var appRouter = express.Router();
var firebase = require('firebase');
const nodemailer = require('nodemailer');   
var config = {
  apiKey: 'AIzaSyAwo-v5EvPL3VMsc9yuVOaTSrphpVERMgw',
  authDomain: 'emailapp-65706.firebaseapp.com',
  databaseURL: 'emailapp-65706.firebaseio.com',
  projectId: 'emailapp-65706',
  storageBucket: 'emailapp-65706.appspot.com',
  messagingSenderId: '919686798595'
}
firebase.initializeApp(config);
var database = firebase.firestore();
let recipients = database.collection('recipients');


appRouter.get('/', (req, res) => {
    console.log('Log In Router');
    let numberProcessed = 0;
    let arrayRecipients = [];
    recipients.get().then(collection => {
        console.log('----Collection: Recipients----')
        let collectionLength = collection.size;
        collection.forEach(doc => {
            numberProcessed++
            console.log(doc.data().fullname);
            let recipientJSON = {}
            recipientJSON['fullname'] = doc.data().fullname;
            recipientJSON['emailaddress'] = doc.data().emailaddress;
            recipientJSON['id'] = doc.id;
            arrayRecipients.push(recipientJSON);
            if(numberProcessed == collectionLength){
                console.log(arrayRecipients)
                res.render('main/views/recipients', {recipients: arrayRecipients});
            }
        });
    });

})

appRouter.post('/recipient/add', (req, res) => {
    recipients.add({
        fullname: req.body.name,
        emailaddress: req.body.email,
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        res.send({docID: docRef.id});
        res.end();
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
})

appRouter.post('/delete', (req, res) => {
    recipients.doc(req.body.docID).delete().then(function() {
        console.log("Document successfully deleted!");
        res.send('success');
        res.end();
    }).catch(function(error) {
        console.error("Error removing document: ", error);
        res.send('error');
        res.end();
    });
})

appRouter.post('/email/send', (req, res) => {
    console.log(req.body.message)
    var message = req.body.message;
    var subject = req.body.subject;

    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    recipients.get().then(collection => {
        console.log('----Collection: Recipients----')
        collection.forEach(doc => {
            let recipientJSON = {}
            recipientJSON['fullname'] = doc.data().fullname;
            recipientJSON['emailaddress'] = doc.data().emailaddress;
            recipientJSON['id'] = doc.id;
            var replacedMessage = replaceAll(message, "{{fullname}}", recipientJSON.fullname);
            var replacedSubject = replaceAll(subject, "{{fullname}}", recipientJSON.fullname);
            console.log(replacedMessage)

            nodemailer.createTestAccount((err, account) => {

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com.',
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: 'shinaydalla@gmail.com',
                        pass: 'aprilann49'
                    },
                    tls:{
                        rejectUnauthorized: false
                    }
                });

                mailOptions = {
                    from: '"IDEATION PHILIPPINES" <contact@ideation.com>', // sender address
                    to: recipientJSON.emailaddress, // list of receivers
                    subject: replacedSubject, // Subject line
                    html: replacedMessage,
                };
                console.log(mailOptions)

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    // Preview only available when sending through an Ethereal account
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
                    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                });
            });


        });
    });

    res.end()
})

appRouter.get('/email', (req, res) => {
    console.log('Log In Router');
    res.render('main/views/email');
})

exports.index = appRouter;
exports.login = logInRouter;
