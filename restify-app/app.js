//this is definitely standard
//standard protocol to require restify
const restify = require('restify');
const server = restify.createServer();

//additional sequelize code
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//setup restify
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

//setup the mysql configuration
const sql = new Sequelize('trello', 'root', '!Mysql99', {
	host: 'localhost',
	port: 3306,
	dialect: 'mysql',
	operatorsAliases: false,
	pool: {
		max: 5,
		min: 0,
		acuire: 30000,
		idle: 10000
	}
});

//make the connection
sql
	.authenticate()
	.then(() => {
		console.log("The connection was successful!");
	})
	.catch(err => {
		console.log("There was an error when connecting!");
	});


//set up swimlane table
var Swimlane = sql.define('swimlane', {
	id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
	name: { type: Sequelize.STRING }
});


//***set up card table
var Card = sql.define('card', {
	id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
	name: { type: Sequelize.STRING },
	cardDescription: { type: Sequelize.STRING }
});



//***set up sql associations
Card.Swimlane = Card.belongsTo(Swimlane);

sql.sync();

//the force flag will drop the tables if they exist and recreate them - NOT FOR PRODUCTION
// sql.sync({ force: true }).then(() => {
// 	getSwimlanes();
// });

// //static swimlanes to make sure render on page when command lines express/restify started, localhost:3000
// let swimlanes = [{
// 		"id": 1,
// 		"name": "swimlane 1",
		
// 	},
// 	{
// 		"id": 2,
// 		"name": "swimlane 2",
// 	}
// ];

// //static cards rendering on webpage
// let cards = [{
// 		"id": 1,
// 		"swimlane_id": 1,
// 		"name": "card 1",
// 		"cardDescription": "description 1"
// 	},
// 	{
// 		"id": 2,
// 		"swimlane_id": 2,
// 		"name": "card 2",
// 		"cardDescription" : "description 2"
// 	}
// ];

// //Constructor for swimlanes
// var Swimlane = function(id, name){
// 	this.id = id;
// 	this.name = name;
// }

// //Constructor for cards
// var Card = function(id, swimlane_id, name, cardDescription){
// 	this.id = id;
// 	this.swimlane_id = swimlane_id;
// 	this.name = name;
// 	this.cardDescription = cardDescription;
// }

//gets swimlanes passing in request, response, next [where does it use them]
function getSwimlanes(req, res, next) {
	// Restify currently has a bug which doesn't allow you to set default headers
	// These headers comply with CORS and allow us to serve our response to any origin
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//find the appropriate data
	Swimlane.findAll().then((swimlanes) => {
		res.send(swimlanes);
	});
	// res.send(swimlanes);
}

//***gets cards passing in request, response, next [where does it use them]
function getCards(req, res, next) {
	// Restify currently has a bug which doesn't allow you to set default headers
	// These headers comply with CORS and allow us to serve our response to any origin
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//find the appropriate data
	Card.findAll().then((cards) => {
		res.send(cards);
	});
	// res.send(cards);
}

//posts swimlanes passing in request, response, next
function postSwimlane(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	console.log(req.body);

	Swimlane.create({
		name: req.body.name
	}).then((swimlane) => {
		res.send(swimlane);
	});

	// var swimlane = new Swimlane(req.body.id, req.body.name);

	// swimlanes.push(swimlane);

	// res.send(swimlane);
}

//***posts cards passing in request, response, next - needs to know from ajax in express lower case swimlane id
function postCard(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	console.log(req.body);

	Swimlane.findAll({
  		where: {
    		id: req.body.swimlaneId
  		}
	})
	.then((swimlanes) => {
		Card.create({
			name: req.body.name,
			cardDescription: req.body.cardDescription
		}).then((card) => {
			card.setSwimlane(swimlanes[0]);
			res.send(card);
		});
	});


	

	// var card = new Card(req.body.id, req.body.swimlane_id, req.body.name, req.body.cardDescription);

	// cards.push(card);

	// // save the new message to the collection

	// res.send(card);
}


function getCardsBySwimlaneId (req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	console.log(req.params)
	
	Card.findAll({
  		include: [{
        	model: Swimlane,
        	where: { id: req.params.swimlane_id }
    	}]
 		
	})
	.then ((cards) => {
		res.send(cards);
	});
}


function updateSwimlaneById (req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "X-Requested-With");
//get swimlaneid from url
var swimlane_id = req.params.swimlane_id;
//get newswimlane name from body
var name = req.body.name;
//find swimlane by swimlane id
var swimlane = swimlanes.find(function(swimlane){
	return swimlane.id == swimlane_id;
});
//update swimlanes name property
swimlane.name = name;
//return swimlane to caller
res.send(swimlane);
}


//need to change names to card
function updateCardNameById (req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "X-Requested-With");
//get swimlaneid from url
var card_id = req.params.card_id;
//get newswimlane name from body
var name = req.body.name;
//find swimlane by swimlane id
var card = cards.find(function(card){
	return card.id == card_id;
});
//update card name property
card.name = name;
//return card to caller
res.send(card);
}


// Set up our routes and start the server
server.get('/swimlanes', getSwimlanes);
server.post('/swimlanes', postSwimlane);

server.get('/swimlanes/:swimlane_id/cards', getCardsBySwimlaneId);
server.post('/swimlanes/:swimlane_id', updateSwimlaneById);

server.get('/cards', getCards);
server.post('/cards', postCard);
server.post('/swimlanes/cards/:card_id', updateCardNameById)

server.listen(8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});
