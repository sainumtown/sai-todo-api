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

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
		db.todo.findAll(where);
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		if (todos.length > 0) {
			res.json(todos);
		} else {
			res.status(404).send('Not found');
		}

	}, function(e) {
		res.json({
			err: 'not found'
		});
	});
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
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: "no to delete with this id"
			});
		} else {
			res.status(204).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

// update
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			return todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	})
});

// user post
app.post('/users',function(req, res){
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user){
		res.json(user.toPublicJSON());
	},function(e){
		res.status(400).json(e);
	});
});

// post user login
app.post('/users/login',function(req,res){
	var body = _.pick(req.body, 'email', 'password');
	db.user.authenticate(body).then(function(user){
		/*res.json(user);*/
		token =  user.generatedToken('authentication');
		if(token){
			res.header('Auth', token).json(user.toPublicJSON());	
		}else{
			res.status(401).send();
		}
		
		
	},function(){
		res.status(401).send();
	});
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Server started in port ' + PORT);
	});
});
