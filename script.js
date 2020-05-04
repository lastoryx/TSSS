/* Include and start express. */
var express = require('express');
var app = express();

/* Path module for directing to the Public assets folder.*/
const path = require('path');

/* Set the path for loading assets like CSS and images.*/
app.use(express.static(path.join(__dirname, '/public')));

/* Include credentials and return a mySQL pool. */
var xData = require('./dbconnection.js');

/* Start express-handlebars. Set the main layout. */
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});

/* Set express-handlebars as the template engine. At runtime, the template
 * engine will replace variables in the template file with values and transform
 * the template into a web-page for the client.*/

app.engine('handlebars', handlebars.engine);  // Connect express-handlebars to express.
app.set('view engine', 'handlebars'); // Set express-handlebars to manage the views.
app.set('port', process.argv[2]); // Set input from the console to manage the port.

/* Create our express session and set the secret password.*/
var session = require('express-session');
app.use(session({secret: 'T1Q0@1qtJHAm'}));

/* Set up the HTTP request.*/
var request = require('request');


/*This code sets up the middleware used to parse POST requests
 * sent via the body. It can accept posts that are URL-Encoded
 * or JSON formatted.*/

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


/* Setup complete. Content starts here.*/


/* GET request renders the default page.*/

app.get('/', function (req, res, next) {

    var context = {};

    /* Renders the people page.*/
    res.render('front', context);
});

app.get('/people.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SHIPS table.*/

    xData.pool.query('SELECT people.first_name, people.last_name, worlds.name AS homeworld, factions.acronym AS faction, people.living FROM people INNER JOIN worlds ON people.homeworld = worlds.world_id LEFT JOIN factions ON people.faction = factions.faction_id ORDER BY people.last_name\n', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.count=result.length;
        context.columns=result.length+1;
        context.title="People-of-Interest";

        /* Renders the ships page.*/
        res.render('people', context);
    });

});


app.get('/ships.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SHIPS table.*/

    xData.pool.query('SELECT ships.name, ships.type, ships.class, factions.name AS owning_faction FROM ships INNER JOIN factions ON ships.faction=factions.faction_id ORDER BY ships.name', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.count=result.length;
        context.columns=result.length+1;
        context.title="Ships";

        /* Renders the ships page.*/
        res.render('ships', context);
    });
});

app.get('/passengers_by_ship.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SHIPS table.*/

    xData.pool.query('SELECT ships.name, ships.type, ships.class FROM ships ORDER BY ships.name', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.display=0;
        context.title="Passengers by Ship";

        /* Renders the search page for listing all passengers per ship.*/
        res.render('passengers_by_ship', context);
    });
});


app.get('/worlds.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SHIPS table.*/

    xData.pool.query('SELECT worlds.name, worlds.location, worlds.population, factions.name AS governing_body, worlds.designation AS resident_designation FROM worlds INNER JOIN factions ON worlds.faction=factions.faction_id', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.count=result.length;
        context.columns=result.length+1;
        context.title="Worlds";


        /* Renders the worlds page.*/
        res.render('worlds', context);
    });
});



app.get('/factions.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SHIPS table.*/

    xData.pool.query('SELECT factions.name, factions.acronym FROM factions ORDER BY factions.name', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.count=result.length;
        context.columns=result.length+1;
        context.title="Factions and Political Organizations";

        /* Renders the ships page.*/
        res.render('factions', context);
    });
});


app.get('/skills.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SHIPS table.*/

    xData.pool.query('SELECT skills.name FROM skills ORDER BY skills.name', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.count=result.length;
        context.columns=result.length+1;
        context.title="Skills & Qualifications";

        /* Renders the ships page.*/
        res.render('skills', context);
    });
});


app.get('/ships_boarded_by_individual.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SHIPS table.*/

    xData.pool.query('SELECT people.person_id, people.first_name, people.last_name FROM people INNER JOIN people_ships ON people.person_id = people_ships.passenger GROUP BY people.person_id ORDER BY people.last_name DESC', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.display=0;
        context.title="Ships Boarded by Individual";

        /* Renders the search page for listing all ships boarded by an individual person.*/
        res.render('ships_boarded_by_individual', context);
    });
});


app.get('/resume.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SHIPS table.*/

    xData.pool.query('SELECT people.person_id, people.first_name, people.last_name, skills.name FROM people INNER JOIN people_skills ON people.person_id = people_skills.individual INNER JOIN skills ON people_skills.skill = skills.skill_id ORDER BY people.last_name', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }


        /* Stores the results from the form.*/
        context.x = result;
        context.count=result.length;
        context.columns=result.length+1;
        context.title="Skills & Qualifications by Individual";



        /* Renders the search page for listing all ships boarded by an individual person.*/
        res.render('resume', context);
    });
});

/* Create a 500 page. */
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});


/* Create a 404 page. */
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});


/* Listen for someone to access the script on the specified port. */
app.listen(app.get('port'), function () {
    console.log('Express started on http://flip3.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});


