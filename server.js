var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

app.get('/', function (req , res){
	res.send('To do api rest');
});

app.listen(PORT,function(){
	console.log('Server started in port ' + PORT);
});