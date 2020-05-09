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


/* This GET request handles loading the front page. */
app.get('/', function (req, res, next) {
    var context = {};

    /* Renders the front page.*/
    res.render('front', context);
});


/* This GET request handles loading the "View People" page. */
app.get('/people.html', function (req, res, next) {

    var context = {};

    /* Render the ship page.*/
    renderPeople(res, next, context);
});


/* This POST request handles all forms submitted on the "View People" page. */
app.post('/people.html', function (req, res, next) {

    /* Empty context object that will be passed to the view.*/
    var context = {};

    /* NEW: INSERTS a new person into the database. */
    if (req.body['New']) {

        /* If the person has no political allegiance, skip adding a faction.*/
        if (req.body.faction === 'NULL') {
            xData.pool.query("INSERT INTO people(`first_name`, `last_name`, `homeworld`, `living`) VALUES(?,?,?,?)", [req.body.first_name, req.body.last_name, req.body.worlds, req.body.status], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                /* Render the ship page.*/
                renderPeople(res, next, context);
            });

        } else {
            /* Otherwise, the person has a faction; so insert it.*/
            xData.pool.query("INSERT INTO people(`first_name`, `last_name`, `homeworld`, `faction`, `living`) VALUES(?,?,?,?,?)", [req.body.first_name, req.body.last_name, req.body.worlds, req.body.faction, req.body.status], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                /* Render the ship page.*/
                renderPeople(res, next, context);
            });
        }
    }

    /* DELETE: DELETES a selected person and refreshes the "View People" page.*/
    if (req.body['Delete']) {

        xData.pool.query("DELETE FROM people WHERE people.person_id=?", [req.body.person_id], function (err, result) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            /* Render the ship page.*/
            renderPeople(res, next, context);
        });
    }

    /* EDIT: SELECTS a person to be edited and renders the update_people page. */
    if (req.body['Edit']) {

        xData.pool.query("SELECT people.person_id, people.first_name, people.last_name, worlds.world_id, worlds.name AS homeworld, factions.faction_id, factions.acronym AS faction, people.living FROM people LEFT JOIN factions ON people.faction=factions.faction_id INNER JOIN worlds ON people.homeworld=worlds.world_id WHERE people.person_id=? ORDER BY people.last_name", [req.body.person_id], function (err, result) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            /* Stores information needed for the update_people page.*/
            context.title = "Edit Person";
            context.person_id = result[0].person_id;
            context.first_name = result[0].first_name;
            context.last_name = result[0].last_name;
            context.world_name = result[0].homeworld;
            context.world_id=result[0].world_id;
          context.status=result[0].living;


            if (!result[0].faction) {

                context.faction_name = 'NULL';
                context.faction_id = '';
            } else {

                context.faction_name = result[0].faction;
                context.faction_id=result[0].faction_id;

                console.log(context);
            }

            /* Selects all the factions from the faction table - this will populate the selection items.*/
            xData.pool.query("SELECT factions.faction_id, factions.acronym FROM factions", function (err, result) {
                /* Skips to the 500 page if an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                context.all_factions = result;


                /* Selects all the worlds from the worlds table - this will populate the selection items.*/
                xData.pool.query("SELECT worlds.world_id, worlds.name FROM worlds", function (err, result) {
                    /* Skips to the 500 page if an error is returned.*/
                    if (err) {
                        next(err);
                        return;
                    }
                    context.all_worlds = result;

                    /* Renders the search page for listing all ships boarded by an individual person.*/
                    res.render('update_people', context);
                });
            });
        });
    }


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
        context.display = 0;
        context.title = "Ships Boarded by Individual";

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
        context.count = result.length;
        context.columns = result.length + 1;
        context.title = "Skills & Qualifications by Individual";

        /* Renders the search page for listing all ships boarded by an individual person.*/
        res.render('resume', context);
    });
});


/* This GET request handles loading the initial "View Ships" page.
   Whenever this page is rendered, the function renderShips is called. */
app.get('/ships.html', function (req, res, next) {
    var context = {};

    /* Render the ship page.*/
    renderShips(res, next, context);
});


/* This POST request handles all forms submitted on the "View Ships" page. */
app.post('/ships.html', function (req, res, next) {

    /* Empty context object that will be passed to the view.*/
    var context = {};

    /* NEW: INSERTS a new ship into the database. */
    if (req.body['New']) {

        /* If the ship being inserted is without a faction, skip associating the faction. */
        if (req.body.faction === 'NULL') {
            xData.pool.query("INSERT INTO ships(`name`, `class`, `type`) VALUES(?,?,?)", [req.body.ship_name, req.body.ship_class, req.body.ship_type], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                /* Render the ship page.*/
                renderShips(res, next, context);
            });

        } else {
            /* Otherwise, the new ship has a faction. So, insert the faction data.*/
            xData.pool.query("INSERT INTO ships(`name`, `class`, `type`, `faction`) VALUES(?,?,?,?)", [req.body.ship_name, req.body.ship_class, req.body.ship_type, req.body.faction], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                /* Render the ship page.*/
                renderShips(res, next, context);
            });
        }
    }

    /* EDIT: SELECTS a ship to be edited and renders the updateShips page. */
    if (req.body['Edit']) {

        /* There are two cases: a case where the ship being edited has a NULL
           value for the faction and a case where the ship being edited has
           a known faction. */

        xData.pool.query("SELECT ships.ship_id, ships.name, ships.class, ships.type, ships.faction FROM ships WHERE ships.ship_id=?", [req.body.ship_id], function (err, result) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            /* Stores information needed for the update_ships page.*/
            context.title = "Edit Ships";
            context.ship_id = result[0].ship_id;
            context.name = result[0].name;
            context.class = result[0].class;
            context.type = result[0].type;

            /* If the selected ship does NOT currently have a faction, this code gets the ship's information and
               all of the faction data. It will set the context object to record the ship's faction as being NULL.*/
            if (!result[0].faction) {

                context.faction_name = 'NULL';
                context.faction_id = '';

                /* Selects all the factions from the faction table - this will populate the selection items.*/
                xData.pool.query("SELECT factions.faction_id, factions.name FROM factions", function (err, result) {
                    /* Skips to the 500 page if an error is returned.*/
                    if (err) {
                        next(err);
                        return;
                    }
                    context.all_factions = result;

                    /* Renders the search page for listing all ships boarded by an individual person.*/
                    res.render('update_ships', context);
                });

            } else {

                /* Otherwise, the selected ship has a known faction. So, this code gets the ship's information
                   (including its faction) and then obtains all faction data for the selection options.*/
                context.faction_id = result[0].faction;

                xData.pool.query("SELECT factions.name AS faction_name FROM factions WHERE factions.faction_id=?", [context.faction_id], function (err, result) {
                    /* Skips to the 500 page if an error is returned.*/
                    if (err) {
                        next(err);
                        return;
                    }

                    /* Store the ship's actual faction name.*/
                    context.faction_name = result[0].faction_name;

                    /* Selects all the factions from the faction table - this will populate the selection items.*/
                    xData.pool.query("SELECT factions.faction_id, factions.name FROM factions", function (err, result) {

                        /* Skips to the 500 page if an error is returned.*/
                        if (err) {
                            next(err);
                            return;
                        }

                        context.all_factions = result;

                        /* Renders the page that will update the date of a particular ship.*/
                        res.render('update_ships', context);
                    });
                });
            }
        });
    }

    /* UPDATE: Updates the ship data on the updateShips page and then renders the ships page.*/
    if (req.body['Save']) {

        /* There are two cases: setting the faction as NULL and setting a specific faction.
           If there is no faction, set the faction as NULL.*/
        if (req.body.faction === '') {
            xData.pool.query("UPDATE ships SET ships.name = ?, ships.class=?, ships.type=?, ships.faction=NULL WHERE ships.ship_id=?", [req.body.ship_name, req.body.ship_class, req.body.ship_type, req.body.ship_id], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                /* Render the ship page.*/
                renderShips(res, next, context);
            });

        } else {
            /* Otherwise, a specific faction needs to be stored along with the rest of the data.*/
            xData.pool.query("UPDATE ships SET ships.name = ?, ships.class=?, ships.type=?, ships.faction=? WHERE ships.ship_id=?", [req.body.ship_name, req.body.ship_class, req.body.ship_type, req.body.faction, req.body.ship_id], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                /* Render the ship page.*/
                renderShips(res, next, context);
            });
        }
    }

    /* DELETE: DELETES a selected ship and refreshes the ships page. */
    if (req.body['Delete']) {

        xData.pool.query("DELETE FROM ships WHERE ships.ship_id=?", [req.body.ship_id], function (err, result) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            /* Render the ship page.*/
            renderShips(res, next, context);
        });
    }
});


/* This GET request handles loading the initial "View Passenger Manifests" page.
   It features a search bar for identifying a target ship. */
app.get('/passengers_by_ship.html', function (req, res, next) {

    var context = {};

    /* Table display elements should be hidden since we haven't identified the target ship.*/
    context.display = 0;

    /* Render the ship page.*/
    renderPassengersByShip(res, next, context);
});


/* This POST request handles all forms submitted "View Passenger Manifests" page. */
app.post('/passengers_by_ship.html', function (req, res, next) {

    /* Empty context object that will be passed to the view.*/
    var context = {};
    context.display = 1;

    /* SEARCH: SELECTS the ship who passenger manifest is being viewed. */
    if (req.body['Search']) {

        /* Once the target ship is identified, the data table should display.*/
        context.ship_manifest = req.body.ship_to_search_for;

        /* Render the ship page.*/
        renderPassengersByShip(res, next, context);
    }

    /* ADD: INSERTS a people_ships relationship into the database and refreshes the "View Passenger Manifests" page. */
    if (req.body['Add']) {

        /* After adding a value, the page should render the data of the target ship.*/
        context.ship_manifest = req.body.ship_id;


        xData.pool.query('INSERT INTO people_ships(`passenger`, `ship`) VALUES(?,?)', [req.body.person_to_add, req.body.ship_id], function (err, result, fields) {

            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            /* Render the ship page.*/
            renderPassengersByShip(res, next, context);
        });
    }

    /* ADD: INSERTS a people_ships relationship into the database and refreshes the "View Passenger Manifests" page. */
    if (req.body['Remove']) {

        /* After removing a value, the page should render the data of the target ship.*/
        context.ship_manifest = req.body.ship_id;

        xData.pool.query('DELETE FROM `people_ships` WHERE passenger=? AND ship=?', [req.body.person_id, req.body.ship_id], function (err, result, fields) {

            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            /* Render the ship page.*/
            renderPassengersByShip(res, next, context);
        });
    }
});


app.get('/worlds.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the WORLDS table.*/

    xData.pool.query('SELECT worlds.name, worlds.location, worlds.population, factions.name AS governing_body, worlds.designation AS resident_designation FROM worlds INNER JOIN factions ON worlds.faction=factions.faction_id', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.count = result.length;
        context.columns = result.length + 1;
        context.title = "Worlds";


        /* Renders the worlds page.*/
        res.render('worlds', context);
    });
});


app.get('/factions.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the FACTIONS table.*/

    xData.pool.query('SELECT factions.name, factions.acronym FROM factions ORDER BY factions.name', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.count = result.length;
        context.columns = result.length + 1;
        context.title = "Factions and Political Organizations";

        /* Renders the factions page.*/
        res.render('factions', context);
    });
});


app.get('/skills.html', function (req, res, next) {

    var context = {};

    /* Query the database and load the SKILLS table.*/

    xData.pool.query('SELECT skills.name FROM skills ORDER BY skills.name', function (err, result, fields) {

        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.x = result;
        context.count = result.length;
        context.columns = result.length + 1;
        context.title = "Skills & Qualifications";

        /* Renders the skills page.*/
        res.render('skills', context);
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


/* These functions render the various pages. */


function renderPeople(res, next, context) {

    context.title = "People-of-Interest";

    xData.pool.query('SELECT worlds.world_id, worlds.name FROM worlds', function (err, result, fields) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        context.worlds = result;

        xData.pool.query('SELECT factions.faction_id, factions.acronym FROM factions', function (err, result, fields) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            /* Stores the results from the form.*/
            context.factions = result;

            xData.pool.query('SELECT people.person_id, people.first_name, people.last_name, worlds.world_id, worlds.name AS homeworld, factions.faction_id, factions.acronym AS faction, people.living FROM people LEFT JOIN factions ON people.faction=factions.faction_id INNER JOIN worlds ON people.homeworld=worlds.world_id ORDER BY people.last_name', function (err, result, fields) {
                /* Skips to the 500 page if an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }

                /* Stores the results from the form.*/
                context.person = result;

                /* Renders the people page.*/
                res.render('people', context);
            });
        });

    });
}

function renderShips(res, next, context) {
    xData.pool.query('SELECT ships.ship_id, ships.name, ships.type, ships.class, factions.name AS owning_faction FROM ships LEFT JOIN factions ON ships.faction=factions.faction_id ORDER BY ships.name', function (err, result, fields) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores the results from the form.*/
        context.ships = result;
        context.count = result.length;
        context.columns = result.length + 1;
        context.title = "Ships";

        for (let i in context.ships) {
            if (!context.ships[i].owning_faction) {
                context.ships[i].owning_faction = "NULL";
            }
        }

        xData.pool.query('SELECT factions.faction_id, factions.name FROM factions', function (err, result, fields) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            /* Stores the results from the form.*/
            context.factions = result;

            /* Renders the ships page.*/
            res.render('ships', context);
        });
    });
}


function renderPassengersByShip(res, next, context) {

    /* The first query populates the search bar with all the known ships.*/
    xData.pool.query('SELECT ships.ship_id, ships.name, ships.type, ships.class FROM ships ORDER BY ships.name', function (err, result, fields) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        context.ship_search = result;

        /* If there has already been at least one productive search, continue populating each section of the page.*/
        if (context.display) {

            /* Get the name of the target ship and store it.*/
            xData.pool.query("SELECT ships.name FROM ships WHERE ship_id=?", [context.ship_manifest], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }

                context.ship_name = result[0].name;

                /* Next, search for all of the target ship's known passengers.*/
                xData.pool.query("SELECT ships.ship_id, ships.name AS ship_name, people.person_id, people.first_name, people.last_name, worlds.designation, people.faction, factions.name AS faction_name, people.living AS status FROM ships INNER JOIN people_ships ON ships.ship_id = people_ships.ship INNER JOIN people ON people_ships.passenger = people.person_id INNER JOIN worlds ON people.homeworld=worlds.world_id LEFT JOIN factions ON people.faction = factions.faction_id WHERE ship_id=? ORDER BY people.last_name", [context.ship_manifest], function (err, result) {
                    /* Skips to the 500 page is an error is returned.*/
                    if (err) {
                        next(err);
                        return;
                    }

                    context.passenger = result;

                    /* If there is at least one passenger, populate the data table accordingly.*/
                    if (context.passenger[0]) {

                        context.data = 1; /* It's true! There's data for the table!*/

                        /* This code ensures that the word "Null" shows up properly in the table.*/
                        for (let i in context.passenger) {
                            if (!context.passenger[i].faction_name) {
                                context.passenger[i].faction_name = "NULL";
                            }
                        }

                        /* Uses the "living" boolean to determine and express whether a person is alive or dead.*/
                        for (let i in context.passenger) {
                            if (context.passenger[i].status === 0) {
                                context.passenger[i].status = "Deceased";
                            } else {
                                context.passenger[i].status = "Alive";
                            }
                        }

                        /* Next, select all the individuals who are NOT on the target ship. These names populate the
                           list of potential passengers that can be added.*/
                        xData.pool.query("SELECT people.person_id, people.first_name, people.last_name FROM people LEFT JOIN(SELECT people.person_id, ships.name AS ship_name FROM people INNER JOIN people_ships ON people.person_id=people_ships.passenger INNER JOIN ships ON people_ships.ship = ships.ship_id WHERE ships.ship_id=?) as alreadyAboard ON people.person_id=alreadyAboard.person_id WHERE alreadyAboard.ship_name IS NULL ORDER BY people.last_name DESC", [context.ship_manifest], function (err, result) {
                            /* Skips to the 500 page is an error is returned.*/
                            if (err) {
                                next(err);
                                return;
                            }

                            context.notAboard = result;

                            /* Renders the "View Passenger Manifest" page.*/
                            res.render('passengers_by_ship', context);

                        });
                    } else {

                        /* Otherwise, the ship is empty and all passengers could potentially populate the ship.
                        *  So, select all potential passengers.*/
                        xData.pool.query("SELECT people.person_id, people.first_name, people.last_name FROM people", function (err, result) {
                            /* Skips to the 500 page is an error is returned.*/
                            if (err) {
                                next(err);
                                return;
                            }

                            context.data = 0; /* It is false! The ship is currently empty.*/
                            context.notAboard = result;

                            /* Renders the "View Passenger Manifest" page.*/
                            res.render('passengers_by_ship', context);
                        });
                    }
                });
            });
        } else {
            /* Otherwise, we are rendering the page for the first time.*/

            /* Renders the search page for listing all passengers per ship.*/
            res.render('passengers_by_ship', context);
        }
    });
}