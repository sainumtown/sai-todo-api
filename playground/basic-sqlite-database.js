var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync({
	force: true
}).then(function() {
	console.log('Every thing is sync !!!');
	Todo.create({
		description: "Walk by dog",
	}).then(function(todo) {
		return Todo.create({
			description: "Go to work",
		}).then(function() {
			/*return Todo.findById(1);*/
			return Todo.findAll({
				where :{
					completed: false,
					description:{
						$like : '%work%'
					}
				}
			});
		}).then(function(todos) {
			if (todos) {
				todos.forEach(function(todo){
					console.log(todo.toJSON());
				});
				
			} else {
				console.log('nothing found');
			}
		}).catch(function(e) {
			console.log(e);
		})
	});
});