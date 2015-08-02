/* jshint laxcomma : true */
var express = require('express')
	,app = express()
	,request = require('request')
	,cheerio = require('cheerio')
	,Datastore = require('nedb')
	,util = require('./util')
	,server = require('http').Server(app)
	,io = require('socket.io')(server)
	,db = new Datastore({ filename: 'data/links', autoload: true })
	,links = null
	,port = 8080
	;

// set the view engine to ejs
app.set('view engine', 'ejs');

// index page
app.get('/', function(req, res) {
	res.render('index');
});

app.use(express.static('public'));

server.listen(port);
console.log('server listen on '+port);

//data


io.on('connection', function (socket)
{
	socket.on('get links', function()
	{
		db.find({}, function(err, docs)
		{
			if(err) console.error(err);
			else socket.emit('links', docs);
		});
	})
	;

	socket.on('save', function(url)
	{
		request(url, function(error, response, body)
		{
			if (!error && response.statusCode == 200)
			{
				var $ = cheerio.load(body,
					{
						normalizeWhitespace: true,
						xmlMode: false
					})
					,title = $('title').text()
					,description = $('meta[name="description"]').attr("content")
					,data =
					{
						title : title
						,description : description
						,date : util.getDate(Date.now())
						,time : util.getTime(Date.now())
						,link : url
					}
					;

					db.update({ link : url }, data, {upsert : true}, function(err, numReplaced, upsert)
					{
						if(err) console.log(err); socket.emit('message', { type : 'danger', message : JSON.stringify(err) });
						if(upsert) socket.emit('message', { type : 'success', message : 'Url <strong>'+url+'</strong> saved' });
						else socket.emit('message', { type : 'warning', message : 'Url <strong>'+url+'</strong> already in db' });
					})
					;
			}
			else socket.emit('message', { type : 'danger', message : "Can't reach this url" });
		});
	})
	;

	socket.on('remove', function(title)
	{
		db.delete({title : title}, {}, function(err, numReplaced)
		{
			if(err) socket.emit('message', {type : 'success', message : JSON.stringify(err)});
			if(numReplaced > 0) socket.emit('message', {type : 'success', message : 'Url <strong>'+url+'</strong> removed'});
		})
		;
	})
	;
});
