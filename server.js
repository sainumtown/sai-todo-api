var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require('underscore');
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

// get /todo/:id
app.get('/todos/:id' ,function (req, res){
	
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere( todos,{id: todoId});
	
	if(matchedTodo){
		res.send(matchedTodo);	
	} else {
		res.status(404).send();
	}
});

// post /todos
app.post('/todos',function (req,res){
	var body = req.body;
	// pick description and completed.
	body = _.pick(body,'description','completed');
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send();
	}
	body.description = body.description.trim();
	// push array
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);
	res.json(body);
});

app.listen(PORT,function(){
	console.log('Server started in port ' + PORT);
});