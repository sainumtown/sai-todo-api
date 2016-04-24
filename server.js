var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
/*var todos = [{
	id: 1,
	description: 'Meet mom dinner',
	completed: false
}, {
	id: 2,
	description: 'Go to market',
	completed: false
}, {
	id: 3,
	description: 'Feed the cat',
	completed: false
}];

app.get('/', function (req , res){
	res.send('To do api rest');
});*/

var todos = [];
var todoNextId = 1 ;

app.use(bodyParser.json());

// get /todos
app.get('/todos',function (req, res){
	res.send(todos);
});

app.get('/todoss/:id',function (req, res){
	res.send(req.params);
});

// get /todo/:id
app.get('/todos/:id' ,function (req, res){
	
	var todoId = parseInt(req.params.id,10);
	
	var matchedTodo;
	for (var i = 0; i < todos.length; i++) {
		if ( todos[i].id === todoId ){
			matchedTodo = todos[i];
		}
	};
	if(matchedTodo){
		res.send(matchedTodo);	
	} else {
		res.status(404).send();
	}
});

// post /todos
app.post('/todos',function (req,res){
	var body = req.body;
	console.log('description');
	// push array
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);
	res.json(body);
});

app.listen(PORT,function(){
	console.log('Server started in port ' + PORT);
});