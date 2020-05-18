-- -------------------------------------------
-- Create all tables.
-- -------------------------------------------
DROP TABLE IF EXISTS factions;
CREATE TABLE factions(
	faction_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
	name VARCHAR(255) NOT NULL,
	acronym VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS worlds;
CREATE TABLE worlds(
	world_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
	name VARCHAR(255) UNIQUE NOT NULL,
	location VARCHAR(255) UNIQUE NOT NULL,
	population BIGINT NOT NULL,
	faction INT,
	designation VARCHAR(255),
	FOREIGN KEY (faction) REFERENCES factions(faction_id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS people;
CREATE TABLE people(
	person_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	homeworld INT NOT NULL,
	faction INT,
	living BOOLEAN NOT NULL,
	FOREIGN KEY (homeworld) REFERENCES worlds(world_id),
	FOREIGN KEY (faction) REFERENCES factions(faction_id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS ships;
CREATE TABLE ships(
	ship_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
	name VARCHAR(255) NOT NULL UNIQUE,
	class VARCHAR(255) NOT NULL,
	type VARCHAR(255) NOT NULL,
	faction INT,
	FOREIGN KEY (faction) REFERENCES factions(faction_id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS people_ships;
CREATE TABLE people_ships(
	person_ship_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
	passenger INT NOT NULL,
	ship INT NOT NULL,
	FOREIGN KEY (passenger) REFERENCES people(person_id) ON DELETE CASCADE, 
	FOREIGN KEY (ship) REFERENCES ships(ship_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS skills;
CREATE TABLE skills(
	skill_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
	name VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS people_skills;
CREATE TABLE people_skills(
	person_skill_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
	individual INT NOT NULL,
	skill INT NOT NULL,
	FOREIGN KEY (individual) REFERENCES people(person_id),
	FOREIGN KEY (skill) REFERENCES skills(skill_id)
);


-- -------------------------------------------
-- Populate and describe the factions table.
-- -------------------------------------------

INSERT INTO factions (name, acronym) VALUES ('Outer Planets Alliance', 'OPA');
INSERT INTO factions (name, acronym) VALUES ('United Nations', 'UN');
INSERT INTO factions (name, acronym) VALUES ('Mars Congressional Republic', 'MCR');
DESCRIBE factions;


-- -------------------------------------------
-- Populate and describe the worlds table.
-- -------------------------------------------

INSERT INTO worlds (name, location, population, faction) 
VALUES ('Venus', 'Sol II', '0', (SELECT faction_id FROM factions WHERE factions.acronym='UN'));

INSERT INTO worlds (name, location, population, faction, designation) 
VALUES ('Earth', 'Sol III', '30000000000', (SELECT faction_id FROM factions WHERE factions.acronym='UN'), 'Earther');

INSERT INTO worlds (name, location, population, faction, designation) 
VALUES ('Luna', 'Sol IIIa', '10000000000', (SELECT faction_id FROM factions WHERE factions.acronym='UN'), 'Earther');

INSERT INTO worlds (name, location, population, faction, designation) 
VALUES ('Mars', 'Sol IV', '10000000000', (SELECT faction_id FROM factions WHERE factions.acronym='MCR'), 'Martian');

INSERT INTO worlds (name, location, population, faction, designation) 
VALUES ('Belt', '(Sol IV, Sol V)', '100000000', (SELECT faction_id FROM factions WHERE factions.acronym='OPA'), 'Belter');

INSERT INTO worlds (name, location, population, faction, designation) 
VALUES ('Jupiter', 'Sol V', '45000000', (SELECT faction_id FROM factions WHERE factions.acronym='UN'), 'Belter');

DESCRIBE worlds;

-- -------------------------------------------
-- Populate and describe the people table.
-- -------------------------------------------

INSERT INTO people (first_name, last_name, homeworld, living) VALUES ('Amos', 'Burton', (SELECT world_id FROM worlds WHERE worlds.name='Earth'), '1');

INSERT INTO people (first_name, last_name, homeworld, living) VALUES ('James', 'Holden', (SELECT world_id FROM worlds WHERE worlds.name='Earth'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Naomi', 'Nagata', (SELECT world_id FROM worlds WHERE worlds.name='Belt'), (SELECT faction_id FROM factions WHERE factions.acronym='OPA'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Alex', 'Kamal', (SELECT world_id FROM worlds WHERE worlds.name='Mars'), (SELECT faction_id FROM factions WHERE factions.acronym='MCR'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Chrisjen', 'Avasarala', (SELECT world_id FROM worlds WHERE worlds.name='Earth'), (SELECT faction_id FROM factions WHERE factions.acronym='UN'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Klaes', 'Ashford', (SELECT world_id FROM worlds WHERE worlds.name='Belt'), (SELECT faction_id FROM factions WHERE factions.acronym='OPA'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Carmina', 'Drummer', (SELECT world_id FROM worlds WHERE worlds.name='Belt'), (SELECT faction_id FROM factions WHERE factions.acronym='OPA'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Fred', 'Johnson', (SELECT world_id FROM worlds WHERE worlds.name='Earth'), (SELECT faction_id FROM factions WHERE factions.acronym='OPA'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Roberta "Bobbie"', 'Draper', (SELECT world_id FROM worlds WHERE worlds.name='Mars'), (SELECT faction_id FROM factions WHERE factions.acronym='MCR'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Julie', 'Mao', (SELECT world_id FROM worlds WHERE worlds.name='Earth'), (SELECT faction_id FROM factions WHERE factions.acronym='OPA'), '0');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Jules-Pierre', 'Mao', (SELECT world_id FROM worlds WHERE worlds.name='Earth'), (SELECT faction_id FROM factions WHERE factions.acronym='UN'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Sadavir', 'Errinwright', (SELECT world_id FROM worlds WHERE worlds.name='Earth'), (SELECT faction_id FROM factions WHERE factions.acronym='UN'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Diogo', 'Harari', (SELECT world_id FROM worlds WHERE worlds.name='Belt'), (SELECT faction_id FROM factions WHERE factions.acronym='OPA'), '1');

INSERT INTO people (first_name, last_name, homeworld, living) VALUES ('Josephus', 'Miller', (SELECT world_id FROM worlds WHERE worlds.name='Belt'), '0');

INSERT INTO people (first_name, last_name, homeworld, living) VALUES ('Dmitri', 'Havelocke', (SELECT world_id FROM worlds WHERE worlds.name='Earth'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Arjun', 'Avasarala', (SELECT world_id FROM worlds WHERE worlds.name='Luna'), (SELECT faction_id FROM factions WHERE factions.acronym='UN'), '1');

INSERT INTO people (first_name, last_name, homeworld, living) VALUES ('Praxideke', 'Meng', (SELECT world_id FROM worlds WHERE worlds.name='Belt'), '1');

INSERT INTO people (first_name, last_name, homeworld, living) VALUES ('Mei', 'Meng', (SELECT world_id FROM worlds WHERE worlds.name='Belt'), '1');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Pyotr', 'Korshunov', (SELECT world_id FROM worlds WHERE worlds.name='Mars'), (SELECT faction_id FROM factions WHERE factions.acronym='MCR'), '0');

INSERT INTO people (first_name, last_name, homeworld, faction, living) VALUES ('Theresa', 'Yao', (SELECT world_id FROM worlds WHERE worlds.name='Mars'), (SELECT faction_id FROM factions WHERE factions.acronym='MCR'), '0');

DESCRIBE people;


-- -------------------------------------------
-- Populate and describe the ships table.
-- -------------------------------------------

INSERT INTO ships (name, class, type) VALUES ('Rocinante', 'Corvette', 'Frigate');

INSERT INTO ships (name, class, type, faction) VALUES ('Razorback', 'Racing', 'Pinnace', (SELECT faction_id FROM factions WHERE factions.acronym='OPA'));

INSERT INTO ships (name, class, type, faction) VALUES ('Donnager', 'Donnager', 'Battleship', (SELECT faction_id FROM factions WHERE factions.acronym='MCR'));

INSERT INTO ships (name, class, type, faction) VALUES ('Behemoth', 'Generational', 'Colony', (SELECT faction_id FROM factions WHERE factions.acronym='OPA'));

INSERT INTO ships (name, class, type, faction) VALUES ('Canterbury', 'Ice Hauler', 'Freighter', (SELECT faction_id FROM factions WHERE factions.acronym='OPA'));

INSERT INTO ships (name, class, type, faction) VALUES ('Scopuli', 'Transport', 'Freighter', (SELECT faction_id FROM factions WHERE factions.acronym='OPA'));

INSERT INTO ships (name, class, type, faction) VALUES ('Guanshiyin', 'Custom', 'Luxury Yacht', (SELECT faction_id FROM factions WHERE factions.acronym='UN'));

INSERT INTO ships (name, class, type, faction) VALUES ('Scirocco', 'Scirocco', 'Assault Cruiser', (SELECT faction_id FROM factions WHERE factions.acronym='MCR'));

INSERT INTO ships (name, class, type, faction) VALUES ('Agatha King', 'Truman', 'Dreadnought', (SELECT faction_id FROM factions WHERE factions.acronym='UN'));

INSERT INTO ships (name, class, type, faction) VALUES ('Thomas Prince', 'Xerxes', 'Battleship', (SELECT faction_id FROM factions WHERE factions.acronym='UN'));

DESCRIBE ships;


-- -------------------------------------------
-- Populate and describe the people_ships connection table.
-- -------------------------------------------

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Amos' AND people.last_name='Burton'), (SELECT ship_id FROM ships WHERE ships.name='Canterbury')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Amos' AND people.last_name='Burton'), (SELECT ship_id FROM ships WHERE ships.name='Donnager')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Amos' AND people.last_name='Burton'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Amos' AND people.last_name='Burton'), (SELECT ship_id FROM ships WHERE ships.name='Behemoth')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='James' AND people.last_name='Holden'), (SELECT ship_id FROM ships WHERE ships.name='Canterbury')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='James' AND people.last_name='Holden'), (SELECT ship_id FROM ships WHERE ships.name='Donnager')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='James' AND people.last_name='Holden'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='James' AND people.last_name='Holden'), (SELECT ship_id FROM ships WHERE ships.name='Behemoth')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Naomi' AND people.last_name='Nagata'), (SELECT ship_id FROM ships WHERE ships.name='Canterbury')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Naomi' AND people.last_name='Nagata'), (SELECT ship_id FROM ships WHERE ships.name='Donnager')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Naomi' AND people.last_name='Nagata'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Naomi' AND people.last_name='Nagata'), (SELECT ship_id FROM ships WHERE ships.name='Behemoth')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Alex' AND people.last_name='Kamal'), (SELECT ship_id FROM ships WHERE ships.name='Canterbury')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Alex' AND people.last_name='Kamal'), (SELECT ship_id FROM ships WHERE ships.name='Donnager')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Alex' AND people.last_name='Kamal'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Alex' AND people.last_name='Kamal'), (SELECT ship_id FROM ships WHERE ships.name='Behemoth')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Chrisjen' AND people.last_name='Avasarala'), (SELECT ship_id FROM ships WHERE ships.name='Guanshiyin')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Chrisjen' AND people.last_name='Avasarala'), (SELECT ship_id FROM ships WHERE ships.name='Razorback')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Chrisjen' AND people.last_name='Avasarala'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Klaes' AND people.last_name='Ashford'), (SELECT ship_id FROM ships WHERE ships.name='Behemoth')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Carmina' AND people.last_name='Drummer'), (SELECT ship_id FROM ships WHERE ships.name='Behemoth')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Fred' AND people.last_name='Johnson'), (SELECT ship_id FROM ships WHERE ships.name='Behemoth')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Fred' AND people.last_name='Johnson'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Roberta "Bobbie"' AND people.last_name='Draper'), (SELECT ship_id FROM ships WHERE ships.name='Scirocco')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Roberta "Bobbie"' AND people.last_name='Draper'), (SELECT ship_id FROM ships WHERE ships.name='Guanshiyin')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Roberta "Bobbie"' AND people.last_name='Draper'), (SELECT ship_id FROM ships WHERE ships.name='Razorback')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Roberta "Bobbie"' AND people.last_name='Draper'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Julie' AND people.last_name='Mao'), (SELECT ship_id FROM ships WHERE ships.name='Razorback')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Julie' AND people.last_name='Mao'), (SELECT ship_id FROM ships WHERE ships.name='Scopuli')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Jules-Pierre' AND people.last_name='Mao'), (SELECT ship_id FROM ships WHERE ships.name='Guanshiyin')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Diogo' AND people.last_name='Harari'), (SELECT ship_id FROM ships WHERE ships.name='Behemoth')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Josephus' AND people.last_name='Miller'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Praxideke' AND people.last_name='Meng'), (SELECT ship_id FROM ships WHERE ships.name='Rocinante')
);

INSERT INTO people_ships (passenger, ship) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Theresa' AND people.last_name='Yao'), (SELECT ship_id FROM ships WHERE ships.name='Donnager')
);

DESCRIBE people_ships;



-- -------------------------------------------
-- Populate and describe the skills table.
-- -------------------------------------------

INSERT INTO skills (name) VALUES ('Leadership');
INSERT INTO skills (name) VALUES ('Navigation');
INSERT INTO skills (name) VALUES ('Science');
INSERT INTO skills (name) VALUES ('Medical');
INSERT INTO skills (name) VALUES ('Engineering');
INSERT INTO skills (name) VALUES ('Security');
INSERT INTO skills (name) VALUES ('Espionage');
INSERT INTO skills (name) VALUES ('Politics');
INSERT INTO skills (name) VALUES ('Programming');
INSERT INTO skills (name) VALUES ('Weapons');
INSERT INTO skills (name) VALUES ('Ballistics');
INSERT INTO skills (name) VALUES ('Strategy');
DESCRIBE skills;

-- -------------------------------------------
-- Populate and describe the people_skills connection table.
-- -------------------------------------------

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Amos' AND people.last_name='Burton'), (SELECT skill_id FROM skills WHERE skills.name='Weapons'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Amos' AND people.last_name='Burton'), (SELECT skill_id FROM skills WHERE skills.name='Ballistics'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Amos' AND people.last_name='Burton'), (SELECT skill_id FROM skills WHERE skills.name='Engineering'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Amos' AND people.last_name='Burton'), (SELECT skill_id FROM skills WHERE skills.name='Security'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Naomi' AND people.last_name='Nagata'), (SELECT skill_id FROM skills WHERE skills.name='Engineering'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Naomi' AND people.last_name='Nagata'), (SELECT skill_id FROM skills WHERE skills.name='Programming'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Naomi' AND people.last_name='Nagata'), (SELECT skill_id FROM skills WHERE skills.name='Leadership'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Naomi' AND people.last_name='Nagata'), (SELECT skill_id FROM skills WHERE skills.name='Strategy'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Alex' AND people.last_name='Kamal'), (SELECT skill_id FROM skills WHERE skills.name='Navigation'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Alex' AND people.last_name='Kamal'), (SELECT skill_id FROM skills WHERE skills.name='Ballistics'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Alex' AND people.last_name='Kamal'), (SELECT skill_id FROM skills WHERE skills.name='Medical'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Chrisjen' AND people.last_name='Avasarala'), (SELECT skill_id FROM skills WHERE skills.name='Politics'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Chrisjen' AND people.last_name='Avasarala'), (SELECT skill_id FROM skills WHERE skills.name='Strategy'));

INSERT INTO people_skills (individual, skill) VALUES (
(SELECT person_id FROM people WHERE people.first_name='Chrisjen' AND people.last_name='Avasarala'), (SELECT skill_id FROM skills WHERE skills.name='Espionage'));