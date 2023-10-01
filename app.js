const express = require('express');
const app = express();

const mongoose = require("mongoose");

require('dotenv').config();

const expressHandlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const helpers = require('handlebars-helpers')();
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

//для коректної роботи flash потрібен express-session
const session = require('express-session');
const flash = require('connect-flash');

app.use(session({
    secret:'verygoodsecret',
    resave: false,
    saveUninitialized: false
}))

//Якщо будете користуватися флеш повідомленнями накшталт error чи success, обов'язково налаштуйте app.use для flash
app.use(flash());

app.use((req, res, next) => {
    res.locals.flash = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    next();
});

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});


//Реалізація routes, щоб забезпечити місцеположення файлів js
const indexRouter = require('./routes/routes');


//public = folder public with this directory who have name "__dirname"
app.engine('hbs', expressHandlebars.engine({ extname: '.hbs', handlebars: allowInsecurePrototypeAccess(Handlebars), helpers: {
    // Registration helper ifCond
    ifCond: helpers.ifCond,
    ifEqual: (arg1, arg2, options) => {
        return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
      }
  }}));

app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(express.static('public'));


//For read data from database
app.use(express.urlencoded({extended: true}));

app.use(express.json());


const PORT = process.env.PORT || 4000;

async function connectToDatabase() {
    try {
        const connection = await mongoose.connect(process.env.MONGO_DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database MongoDB connect successful");
        return connection;
    } catch (err) {
        console.log(`Something wrong with MongoDB ${err}`);
        return null;
    }
}

async function startServer() {
    try {
        const connection = await connectToDatabase();
        if (!connection) {
            console.log("Unable to connect to MongoDB. Exiting...");
            process.exit(1);
        }
        await app.listen(PORT);
        console.log(`Server has been started ${PORT}`);
    } catch (err) {
        console.log(`Error starting server: ${err}`);
        process.exit(1);
    }
}


//Routes
app.use('/', indexRouter);

startServer();

module.exports = {app, startServer};