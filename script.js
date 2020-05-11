/* Include and start express. */
let express = require('express');
let app = express();

/* Path module for directing to the Public assets folder.*/
const path = require('path');

/* Set the path for loading assets like CSS and images.*/
app.use(express.static(path.join(__dirname, '/public')));

/* Include credentials and return a mySQL pool. */
let xData = require('./dbconnection.js');

/* Start express-handlebars. Set the main layout. */
let handlebars = require('express-handlebars').create({defaultLayout: 'main'});

/* Set express-handlebars as the template engine. At runtime, the template
 * engine will replace variables in the template file with values and transform
 * the template into a web-page for the client.*/

app.engine('handlebars', handlebars.engine);  // Connect express-handlebars to express.
app.set('view engine', 'handlebars'); // Set express-handlebars to manage the views.
app.set('port', process.argv[2]); // Set input from the console to manage the port.

/* Create our express session and set the secret password.*/
let session = require('express-session');
app.use(session({secret: 'T1Q0@1qtJHAm'}));

/* Set up the HTTP request.*/
let request = require('request');

/*This code sets up the middleware used to parse POST requests
 * sent via the body. It can accept posts that are URL-Encoded
 * or JSON formatted.*/

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


/* This GET request handles loading the front page. */
app.get('/', function (req, res) {
    let context = {};
    res.render('front', context);
});


/* This GET request handles loading the "People-of-Interest" page. */
app.get('/people.html', function (req, res, next) {
    let context = {};
    renderPeople(res, next, context);
});


/* This POST request handles all forms submitted via the "People-of-Interest" page. */
app.post('/people.html', function (req, res, next) {
    let context = {};

    /* NEW: INSERTS a new person into the database. */
    if (req.body['New']) {

        /* If the person has no political allegiance, skip adding a faction.*/
        if (req.body.faction === 'NULL') {
            xData.pool.query("INSERT INTO people(`first_name`, `last_name`, `homeworld`, `living`) VALUES(?,?,?,?)", [req.body.first_name, req.body.last_name, req.body.worlds, req.body.status], function (err) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                renderPeople(res, next, context);
            });

        } else {

            /* Otherwise, the person has a faction; so insert it.*/
            xData.pool.query("INSERT INTO people(`first_name`, `last_name`, `homeworld`, `faction`, `living`) VALUES(?,?,?,?,?)", [req.body.first_name, req.body.last_name, req.body.worlds, req.body.faction, req.body.status], function (err) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                renderPeople(res, next, context);
            });
        }
    }

    /* DELETE: DELETES a selected person and refreshes the "People-of-Interest" page.*/
    if (req.body['Delete']) {

        xData.pool.query("DELETE FROM people WHERE people.person_id=?", [req.body.person_id], function (err) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            /* Render the ship page.*/
            renderPeople(res, next, context);
        });
    }

    /* EDIT: SELECTS a person to be edited and renders the "Edit Profile" page. */
    if (req.body['Edit']) {

        /* Rendering the "Edit Profile" page requires a person_id stored in the context object parameter.*/
        context.person_id = req.body.person_id;

        renderUpdateProfile(res, next, context);
    }

    /* REMOVE PEOPLE_SHIPS RELATIONSHIP (VIA PROFILE): DELETES a selected person's known people_ships
       association and updates the "Edit Profile" page.*/
    if (req.body['Remove people_ships from Profile']) {

        /* Rendering the "Edit Profile" page requires a person_id stored in the context object parameter.*/
        context.person_id = req.body.person_id;

        xData.pool.query("DELETE FROM people_ships WHERE people_ships.passenger=? AND people_ships.ship=?", [req.body.person_id, req.body.ship_id], function (err) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            renderUpdateProfile(res, next, context);
        });
    }

    /* ADD PEOPLE_SHIPS RELATIONSHIP (VIA PROFILE): INSERTS a people_ships relationship between
       a selected person and ship; updates the "Edit Profile" page.*/
    if (req.body['Add people_ships to Profile']) {

        /* Rendering the "Edit Profile" page requires a person_id stored in the context object parameter.*/
        context.person_id = req.body.person_id;
        context.ship_id = req.body.ship_to_add;

        xData.pool.query("INSERT INTO people_ships (`passenger`, `ship`)VALUES (?,?)", [context.person_id, context.ship_id], function (err) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            renderUpdateProfile(res, next, context);
        });
    }

    /* SAVE: UPDATES a selected person's data and loads the "People-of-Interest" page.*/
    if (req.body['Save']) {

        if (!req.body.faction) {
            req.body.faction = null;
        }

        xData.pool.query("UPDATE people SET people.first_name = ?, people.last_name=?, people.homeworld=?, people.faction=?, people.living=?  WHERE people.person_id=?", [req.body.first_name, req.body.last_name, req.body.world, req.body.faction, req.body.status, req.body.person_id], function (err) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            renderPeople(res, next, context);
        });
    }
});


/* This GET request handles loading the "Ships Boarded By Individual" page. */
app.get('/ships_boarded_by_individual.html', function (req, res, next) {
    let context = {};

    /* Table display elements should be hidden since we haven't identified the target ship.*/
    context.display = 0;
    renderShipsBoardedByPerson(res, next, context);
});


/* This POST request handles all forms submitted via the "Ships Boarded By Individual" page. */
app.post('/ships_boarded_by_individual.html', function (req, res, next) {
    let context = {};

    /* SEARCH: SELECTS the person whose ships are being viewed. */
    if (req.body['Search']) {

        /* Once the target person is identified, the data table will display.*/
        context.target_person = req.body.person_to_search_for;
        context.display = 1;

        renderShipsBoardedByPerson(res, next, context);
    }

    /* ADD: INSERTS a people_ships relationship into the database and refreshes the "Ships Boarded by Individual" page. */
    if (req.body['Add']) {

        /* After adding a value, the page should render the data of the target person.*/
        context.target_person = req.body.person_id;
        context.display = 1;

        xData.pool.query('INSERT INTO people_ships(`passenger`, `ship`) VALUES(?,?)', [req.body.person_id, req.body.ship_to_add], function (err) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            renderShipsBoardedByPerson(res, next, context);
        });
    }

    /* REMOVE: DELETES a people_ships relationship from the database and refreshes the "Ships Boarded by Individual" page. */
    if (req.body['Remove']) {

        /* After deleting a value, the page should render the data of the target person.*/
        context.target_person = req.body.person_id;
        context.display = 1;

        xData.pool.query('DELETE FROM `people_ships` WHERE passenger=? AND ship=?', [req.body.person_id, req.body.ship_id], function (err) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            renderShipsBoardedByPerson(res, next, context);
        });
    }
});


/* This GET request handles loading the "Resume" page. This page has limited implementation.*/
app.get('/resume.html', function (req, res, next) {
    let context = {};

    xData.pool.query('SELECT people.person_id, people.first_name, people.last_name, skills.name FROM people INNER JOIN people_skills ON people.person_id = people_skills.individual INNER JOIN skills ON people_skills.skill = skills.skill_id ORDER BY people.last_name', function (err, result) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        context.x = result;
        context.count = result.length;
        context.columns = result.length + 1;
        context.title = "Skills & Qualifications by Individual";

        res.render('resume', context);
    });
});


/* This GET request handles loading the initial "Ships" page. */
app.get('/ships.html', function (req, res, next) {
    let context = {};
    renderShips(res, next, context);
});


/* This POST request handles all forms submitted on the "Ships" page. */
app.post('/ships.html', function (req, res, next) {
    let context = {};

    /* NEW: INSERTS a new ship into the database and then renders the "Ships" page. */
    if (req.body['New']) {

        /* If the ship being inserted is without a faction, skip associating the faction. */
        if (req.body.faction === 'NULL') {
            xData.pool.query("INSERT INTO ships(`name`, `class`, `type`) VALUES(?,?,?)", [req.body.ship_name, req.body.ship_class, req.body.ship_type], function (err) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                renderShips(res, next, context);
            });

        } else {
            /* Otherwise, the new ship has a faction. So, insert the faction data.*/
            xData.pool.query("INSERT INTO ships(`name`, `class`, `type`, `faction`) VALUES(?,?,?,?)", [req.body.ship_name, req.body.ship_class, req.body.ship_type, req.body.faction], function (err) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                renderShips(res, next, context);
            });
        }
    }

    /* EDIT: SELECTS a ship to be edited and renders the "Edit Ship" page. */
    if (req.body['Edit']) {

        /* Rendering the "Edit Ship" page requires a target_ship stored in the context object parameter.*/
        context.target_ship = req.body.ship_id;
        renderUpdateShip(res, next, context);
    }

    /* SAVE: Updates the ship data on the "Edit Ship" page and then renders the "Ships" page.*/
    if (req.body['Save']) {
        if (!req.body.faction) {
            req.body.faction = null;
        }

        xData.pool.query("UPDATE ships SET ships.name = ?, ships.class=?, ships.type=?, ships.faction=? WHERE ships.ship_id=?", [req.body.ship_name, req.body.ship_class, req.body.ship_type, req.body.faction, req.body.ship_id], function (err) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            renderShips(res, next, context);
        });
    }

    /* DELETE: DELETES a selected ship and refreshes the "Ships" page.*/
    if (req.body['Delete']) {

        xData.pool.query("DELETE FROM ships WHERE ships.ship_id=?", [req.body.ship_id], function (err) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            renderShips(res, next, context);
        });
    }

    /* REMOVE PEOPLE_SHIPS RELATIONSHIP (VIA SHIPS): DELETES a selected ship's known passengers and updates the "Edit Ships" page.*/
    if (req.body['Remove people_ships from Edit Ships']) {

        /* Rendering the "Edit Profile" page requires a target_ship stored in the context object parameter.*/
        context.target_ship = req.body.ship_id;

        xData.pool.query("DELETE FROM people_ships WHERE people_ships.passenger=? AND people_ships.ship=?", [req.body.person_id, req.body.ship_id], function (err) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            renderUpdateShip(res, next, context);
        });
    }

    /* ADD PEOPLE_SHIPS RELATIONSHIP (VIA SHIPS): INSERTS a people_ships relationship between
       a selected ship and potential passenger; updates the "Edit Ships" page.*/
    if (req.body['Add people_ships to Edit Ships']) {

        /* Rendering the "Edit Ship" page requires a target_ship stored in the context object parameter.*/
        context.person_id = req.body.passenger_to_add;
        context.target_ship = req.body.ship_id;

        xData.pool.query("INSERT INTO people_ships (`passenger`, `ship`)VALUES (?,?)", [context.person_id, context.target_ship], function (err) {
            /* Skips to the 500 page is an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            renderUpdateShip(res, next, context);
        });
    }
});

/* This GET request handles loading the initial "Passenger Manifest" page.
   It features a search bar for identifying a target ship. */
app.get('/passengers_by_ship.html', function (req, res, next) {
    let context = {};

    /* Table display elements should be hidden since we haven't identified the target ship.*/
    context.display = 0;

    renderPassengersByShip(res, next, context);
});


/* This POST request handles all forms submitted to the "Passenger Manifest" page. */
app.post('/passengers_by_ship.html', function (req, res, next) {
    let context = {};
    context.display = 1;

    /* SEARCH: SELECTS the ship whose passenger manifest is being viewed. */
    if (req.body['Search']) {

        /* Once the target ship is identified, the data table will display.*/
        context.ship_manifest = req.body.ship_to_search_for;

        renderPassengersByShip(res, next, context);
    }

    /* ADD: INSERTS a people_ships relationship into the database and refreshes the "Passenger Manifest" page. */
    if (req.body['Add']) {

        /* After adding a value, the page should render the data of the target ship.*/
        context.ship_manifest = req.body.ship_id;

        xData.pool.query('INSERT INTO people_ships(`passenger`, `ship`) VALUES(?,?)', [req.body.person_to_add, req.body.ship_id], function (err) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            renderPassengersByShip(res, next, context);
        });
    }

    /* ADD: INSERTS a people_ships relationship into the database and refreshes the "Passenger Manifest" page. */
    if (req.body['Remove']) {

        /* After removing a value, the page should render the data of the target ship.*/
        context.ship_manifest = req.body.ship_id;

        xData.pool.query('DELETE FROM `people_ships` WHERE passenger=? AND ship=?', [req.body.person_id, req.body.ship_id], function (err) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }

            renderPassengersByShip(res, next, context);
        });
    }
});


/* This GET request handles rendering the initial "Worlds" page. */
app.get('/worlds.html', function (req, res, next) {
    let context = {};
    xData.pool.query('SELECT worlds.name, worlds.location, worlds.population, factions.name AS governing_body, worlds.designation AS resident_designation FROM worlds INNER JOIN factions ON worlds.faction=factions.faction_id', function (err, result) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }
        context.x = result;
        context.count = result.length;
        context.columns = result.length + 1;
        context.title = "Worlds";

        /* Renders the "Worlds" page.*/
        res.render('worlds', context);
    });
});


/* This GET request handles rendering the initial "Factions" page. */
app.get('/factions.html', function (req, res, next) {
    let context = {};
    xData.pool.query('SELECT factions.name, factions.acronym FROM factions ORDER BY factions.name', function (err, result) {
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

        res.render('factions', context);
    });
});


/* This GET request handles loading the initial "Skills" page. */
app.get('/skills.html', function (req, res, next) {
    let context = {};
    xData.pool.query('SELECT skills.name FROM skills ORDER BY skills.name', function (err, result) {
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


/* These functions help render the various pages and reduce code duplication. */

function renderPeople(res, next, context) {

    context.title = "People-of-Interest";

    xData.pool.query('SELECT worlds.world_id, worlds.name FROM worlds', function (err, result) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        context.worlds = result;

        xData.pool.query('SELECT factions.faction_id, factions.acronym FROM factions', function (err, result) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            context.factions = result;

            xData.pool.query('SELECT people.person_id, people.first_name, people.last_name, worlds.world_id, worlds.name AS homeworld, factions.faction_id, factions.acronym AS faction, people.living FROM people LEFT JOIN factions ON people.faction=factions.faction_id INNER JOIN worlds ON people.homeworld=worlds.world_id ORDER BY people.last_name', function (err, result) {
                /* Skips to the 500 page if an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                context.person = result;
                res.render('people', context);
            });
        });
    });
}


function renderUpdateProfile(res, next, context) {

    xData.pool.query("SELECT people.person_id, people.first_name, people.last_name, worlds.world_id, worlds.name AS homeworld, factions.faction_id, factions.acronym AS faction, people.living FROM people LEFT JOIN factions ON people.faction=factions.faction_id INNER JOIN worlds ON people.homeworld=worlds.world_id WHERE people.person_id=? ORDER BY people.last_name", [context.person_id], function (err, result) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores information needed for the update_people page.*/
        context.title = "Edit Profile";
        context.person_id = result[0].person_id;
        context.first_name = result[0].first_name;
        context.last_name = result[0].last_name;
        context.world_name = result[0].homeworld;
        context.world_id = result[0].world_id;
        context.status = result[0].living;

        if (!result[0].faction) {
            context.faction_name = 'NULL';
            context.faction_id = '';
        } else {
            context.faction_name = result[0].faction;
            context.faction_id = result[0].faction_id;
        }

        /* Selects all the factions from the faction table - this will populate the selection items for
       editing the individual's faction.*/
        xData.pool.query("SELECT factions.faction_id, factions.acronym FROM factions", function (err, result) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            context.all_factions = result;

            /* Selects all the worlds from the world table - this will populate the selection items for
            editing the individual's homeworld.*/
            xData.pool.query("SELECT worlds.world_id, worlds.name FROM worlds", function (err, result) {
                /* Skips to the 500 page if an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }
                context.all_worlds = result;

                /* Selects all the ships that the selected individual has boarded.*/
                xData.pool.query("SELECT ships.ship_id, ships.name, ships.class, ships.type, ships.faction AS faction_id, factions.acronym AS faction FROM ships LEFT JOIN factions ON ships.faction=factions.faction_id INNER JOIN people_ships ON ships.ship_id=people_ships.ship INNER JOIN people ON people_ships.passenger=people.person_id WHERE people.person_id=?", [context.person_id], function (err, result) {
                    /* Skips to the 500 page if an error is returned.*/
                    if (err) {
                        next(err);
                        return;
                    }
                    context.crewed_ships = result;

                    /* This code ensures that the word "Null" shows up properly in the table.*/
                    for (let i in context.crewed_ships) {
                        if (!context.crewed_ships[i].faction) {
                            context.crewed_ships[i].faction = "NULL";
                        }
                    }

                    /* Selects all the ships that the selected individual has NOT boarded.*/
                    xData.pool.query("SELECT ships.ship_id, ships.name AS ship_name FROM ships LEFT JOIN(SELECT ships.ship_id, ships.name, ships.class, ships.type, ships.faction FROM ships INNER JOIN people_ships ON ships.ship_id=people_ships.ship INNER JOIN people ON people_ships.passenger=people.person_id WHERE people.person_id=?) as knownShips ON ships.ship_id=knownShips.ship_id WHERE knownShips.ship_id IS NULL ORDER BY ships.name DESC", [context.person_id], function (err, result) {
                        /* Skips to the 500 page if an error is returned.*/
                        if (err) {
                            next(err);
                            return;
                        }
                        context.notAboard = result;
                        res.render('update_people', context);
                    });
                });
            });
        });
    });
}


function renderUpdateShip(res, next, context) {

    xData.pool.query("SELECT ships.ship_id, ships.name, ships.class, ships.type, factions.faction_id, factions.name AS faction_name FROM ships LEFT JOIN factions ON ships.faction=factions.faction_id WHERE ships.ship_id=?", [context.target_ship], function (err, result) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        /* Stores information needed for the "Edit Ship" page.*/
        context.title = "Edit Ship";
        context.ship_id = result[0].ship_id;
        context.name = result[0].name;
        context.class = result[0].class;
        context.type = result[0].type;

        if (!result[0].faction_name) {
            context.faction_name = 'NULL';
            context.faction_id = '';
        } else {
            context.faction_name = result[0].faction_name;
            context.faction_id = result[0].faction_id;
        }

        /* Selects all the factions from the faction table - this will populate the selection items.*/
        xData.pool.query("SELECT factions.faction_id, factions.name FROM factions", function (err, result) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            context.all_factions = result;

            /* Next, search for all of the target ship's known passengers.*/
            xData.pool.query("SELECT ships.ship_id, ships.name AS ship_name, people.person_id, people.first_name, people.last_name, worlds.designation, people.faction, factions.acronym AS faction_name, people.living AS status FROM ships INNER JOIN people_ships ON ships.ship_id = people_ships.ship INNER JOIN people ON people_ships.passenger = people.person_id INNER JOIN worlds ON people.homeworld=worlds.world_id LEFT JOIN factions ON people.faction = factions.faction_id WHERE ship_id=? ORDER BY people.last_name", [context.target_ship], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }

                context.known_passengers = result;

                /* If there is at least one passenger, populate the data table accordingly.*/
                if (context.known_passengers[0]) {

                    /* This code ensures that the word "Null" shows up properly in the table.*/
                    for (let i in context.known_passengers) {
                        if (!context.known_passengers[i].faction_name) {
                            context.known_passengers[i].faction_name = "NULL";
                        }
                    }

                    /* Uses the "living" boolean to determine and express whether a person is alive or dead.*/
                    for (let i in context.known_passengers) {
                        if (context.known_passengers[i].status === 0) {
                            context.known_passengers[i].status = "Deceased";
                        } else {
                            context.known_passengers[i].status = "Alive";
                        }
                    }

                    /* Next, select all the individuals who are NOT on the target ship. These names populate the
                       list of potential passengers that can be added.*/
                    xData.pool.query("SELECT people.person_id, people.first_name, people.last_name FROM people LEFT JOIN(SELECT people.person_id, ships.name AS ship_name FROM people INNER JOIN people_ships ON people.person_id=people_ships.passenger INNER JOIN ships ON people_ships.ship = ships.ship_id WHERE ships.ship_id=?) as alreadyAboard ON people.person_id=alreadyAboard.person_id WHERE alreadyAboard.ship_name IS NULL ORDER BY people.last_name DESC", [context.target_ship], function (err, result) {
                        /* Skips to the 500 page is an error is returned.*/
                        if (err) {
                            next(err);
                            return;
                        }

                        context.data = 1; /* It's true! There's data for the table!*/
                        context.notAboard = result;
                        res.render('update_ships', context);
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
                        res.render('update_ships', context);
                    });
                }
            });
        });
    });
}


function renderShipsBoardedByPerson(res, next, context) {

    /* The first query populates the search bar with all known people*/
    xData.pool.query('SELECT people.person_id, people.first_name, people.last_name, people.homeworld, people.faction, people.living FROM people ORDER BY people.last_name', function (err, result) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        context.person_search = result;

        /* If there has already been at least one productive search, continue populating each section of the page.*/
        if (context.display) {

            /* Get the name of the target person and store it.*/
            xData.pool.query("SELECT people.first_name, people.last_name FROM people WHERE people.person_id=? ORDER BY people.last_name ASC", [context.target_person], function (err, result) {
                /* Skips to the 500 page is an error is returned.*/
                if (err) {
                    next(err);
                    return;
                }

                context.first_name = result[0].first_name;
                context.last_name = result[0].last_name;

                /* Next, search for all of the target person's boarded ships.*/
                xData.pool.query("SELECT ships.ship_id, ships.name AS ship_name, ships.class, ships.type, ships.faction, factions.acronym AS faction_name, people.person_id FROM ships INNER JOIN people_ships ON ships.ship_id = people_ships.ship INNER JOIN people ON people_ships.passenger = people.person_id LEFT JOIN factions ON ships.faction = factions.faction_id WHERE people.person_id=? ORDER BY ship_name", [context.target_person], function (err, result) {
                    /* Skips to the 500 page is an error is returned.*/
                    if (err) {
                        next(err);
                        return;
                    }

                    context.boarded_ship = result;

                    /* If there is at least one ship, populate the data table accordingly.*/
                    if (context.boarded_ship[0]) {

                        /* This code ensures that the word "Null" shows up properly in the table.*/
                        for (let i in context.boarded_ship) {
                            if (!context.boarded_ship[i].faction_name) {
                                context.boarded_ship[i].faction_name = "NULL";
                            }
                        }

                        /* Next, select all the ships that the target has NOT boarded. These names populate the
                           list of potential ships that can be added.*/
                        xData.pool.query("SELECT ships.ship_id, ships.name AS ship_name FROM ships LEFT JOIN(SELECT ships.ship_id, ships.name AS ship_name, ships.class, ships.type, ships.faction, factions.acronym AS faction_name, people.person_id FROM ships INNER JOIN people_ships ON ships.ship_id = people_ships.ship INNER JOIN people ON people_ships.passenger = people.person_id LEFT JOIN factions ON people.faction = factions.faction_id WHERE people.person_id=? ORDER BY ship_name) as boardedShips ON ships.ship_id=boardedShips.ship_id WHERE boardedShips.ship_name IS NULL ORDER BY ship_name DESC", [context.target_person], function (err, result) {
                            /* Skips to the 500 page is an error is returned.*/
                            if (err) {
                                next(err);
                                return;
                            }

                            context.data = 1; /* It's true! There's data for the table!*/
                            context.notAboard = result;
                            res.render('ships_boarded_by_individual', context);
                        });
                    } else {

                        /* Otherwise, the ship is empty and all passengers could potentially populate the ship.
                        *  So, select all potential passengers.*/
                        xData.pool.query("SELECT ships.ship_id, ships.name AS ship_name FROM ships", function (err, result) {
                            /* Skips to the 500 page is an error is returned.*/
                            if (err) {
                                next(err);
                                return;
                            }

                            context.data = 0; /* It is false! The ship is currently empty.*/
                            context.notAboard = result;
                            res.render('ships_boarded_by_individual', context);
                        });
                    }
                });
            });
        } else {

            /* Otherwise, we are rendering the page for the first time.*/
            res.render('ships_boarded_by_individual', context);
        }
    });
}


function renderShips(res, next, context) {
    xData.pool.query('SELECT ships.ship_id, ships.name, ships.type, ships.class, factions.name AS owning_faction FROM ships LEFT JOIN factions ON ships.faction=factions.faction_id ORDER BY ships.name', function (err, result) {
        /* Skips to the 500 page if an error is returned.*/
        if (err) {
            next(err);
            return;
        }

        context.ships = result;
        context.count = result.length;
        context.columns = result.length + 1;
        context.title = "Ships";

        for (let i in context.ships) {
            if (!context.ships[i].owning_faction) {
                context.ships[i].owning_faction = "NULL";
            }
        }

        xData.pool.query('SELECT factions.faction_id, factions.name FROM factions', function (err, result) {
            /* Skips to the 500 page if an error is returned.*/
            if (err) {
                next(err);
                return;
            }
            context.factions = result;
            res.render('ships', context);
        });
    });
}


function renderPassengersByShip(res, next, context) {

    /* The first query populates the search bar with all the known ships.*/
    xData.pool.query('SELECT ships.ship_id, ships.name, ships.type, ships.class FROM ships ORDER BY ships.name', function (err, result) {
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

                            context.data = 1; /* It's true! There's data for the table!*/
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
            res.render('passengers_by_ship', context);
        }
    });
}