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
var todoNextId = 1;

app.use(bodyParser.json());

// get /todos?completed=true
app.get('/todos', function(req, res) {
	var queryParam = req.query;
	var filterTodos = todos;

	if (queryParam.hasOwnProperty('completed') && queryParam.completed === 'true') {
		filterTodos = _.where(filterTodos, {
			completed: true
		});
	} else if (queryParam.hasOwnProperty('completed') && queryParam.completed === 'false') {
		filterTodos = _.where(filterTodos, {
			completed: false
		});
	}

	if (queryParam.hasOwnProperty('q') && queryParam.q.length > 0) {
		filterTodos = _.filter(filterTodos, function(todo) {
			return todo.description.indexOf(queryParam.q) > -1;
		});
	}
	if (filterTodos.length !== 0) {
		res.send(filterTodos);
	} else {
		res.json({
			error: "not found"
		});
	}
});

// get /todo/:id
app.get('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (matchedTodo) {
		res.send(matchedTodo);
	} else {
		res.status(404).send();
	}
});

// post /todos
app.post('/todos', function(req, res) {
	var body = req.body;
	// pick description and completed.
	body = _.pick(body, 'description', 'completed');
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	body.description = body.description.trim();
	// push array
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);
	res.json(body);
});

// delete /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (matchedTodo) {
		matchedTodo = _.without(todos, matchedTodo);
		res.send("delete successfully");
	} else {
		res.status(404).json({
			"error": "not found"
		});
	}
});



app.put('/todoss/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed');

	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});

app.listen(PORT, function() {
	console.log('Server started in port ' + PORT);
});