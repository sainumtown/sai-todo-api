var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// get /todos?completed=true
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if(query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true;
		db.todo.findAll(where);
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if(query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like : '%' + query.q + '%'
		};
	}

	db.todo.findAll({where:where}).then(function(todos){
		if(todos.length > 0){
			res.json(todos);	
		}else{
			res.status(404).send('Not found');
		}
		
	}, function (e){
		res.json({err : 'not found'});
	}); 

	/*if (queryParam.hasOwnProperty('completed') && queryParam.completed === 'true') {
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
	}*/
});

// get /todo/:id
app.get('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.send(todo);
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

// post /todos
app.post('/todos', function(req, res) {
	var body = req.body;

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
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



app.put('/todos/:id', function(req, res) {
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

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Server started in port ' + PORT);
	});
});