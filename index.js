/* jshint laxcomma : true */
var express = require('express')
	,app = express()
	,args = process.argv.slice(2)
	,request = require('request')
	,cheerio = require('cheerio')
	,Datastore = require('nedb')
	,server = require('http').Server(app)
	,io = require('socket.io')(server)
	,users = {}
	,numUsers = 0
	,db = new Datastore({ filename: 'data/'+(args[0]? args[0] : 'links'), autoload: true })
	,port = 8080
	/**
	 * get date from epoch time
	 * @param  {number} epoch format time
	 * @return {string}       date format dd/mm/yyyy
	 */
	, getDate = function(epoch)
		{
					var date = new Date(epoch);

					var day = '0'+date.getDate();
					var month = '0'+(date.getMonth()+1);
					var year = date.getFullYear();

					return day.substr(-2)+'/'+month.substr(-2)+'/'+year;
		}
	/**
	 * get time from epoch time format
	 * @param  {number} epoch format time
	 * @return {string}       time format hh/mm/ss
	 */
	, getTime = function(epoch)
		{
			var date = new Date(epoch);
			var seconds = '0'+date.getSeconds();
			var minutes = '0'+date.getMinutes();
			var hours = date.getHours();

			return hours+':'+minutes.substr(-2)+':'+seconds.substr(-2);
		}
	/**
	 * update favorites
	 * @param  {object} socket from socket.io
	 */
	, update = function(socket)
	{
		db.find({}, function(err, docs)
		{
			if(err) console.error(err);
			else socket.broadcast.emit('update', docs);
		});
	}
	;
// set the view engine to ejs
app.set('view engine', 'ejs');

// index page
app.get('/', function(req, res) {
	res.render('index');
});

//resources (favicon, js and css)
app.use(express.static('public'));

server.listen(port);
console.log('server listen on '+port);

// socket.io, communication between server and client
io.on('connection', function (socket)
{
	var addedUser = false;

	//new user
	socket.on('add user', function(userID)
	{
		if(! addedUser)
		{
			socket.user = userID;
			users[userID] = userID;
			++numUsers;
			addedUser = true;
			socket.emit('new message',  {type : 'info', message : 'new user joined, total:'+numUsers});
		}
	})
	;

	//user disconnect from the server
	socket.on('disconnect', function()
	{
		if(addedUser)
		{
			delete users[socket.user];
			--numUsers;
			addedUser = false;
			socket.emit('new message',  {type : 'info', message : 'user left, total:'+numUsers});
		}
	})
	;
	//a client wants the favorites
	socket.on('get links', function()
	{
		db.find({}, function(err, docs)
		{
			if(err)
			{
				console.error(err);
				socket.emit('new message', {type : 'danger', message : err});
			}
			else socket.emit('links', docs);
		});
	})
	;

	//a client wants to save a link
	socket.on('save', function(url)
	{
		//get information from the url given
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
						,date : getDate(Date.now())
						,time : getTime(Date.now())
						,link : url
					}
					;
					if(typeof data.title === 'undefined') data.title = 'None';
					if(typeof data.description === 'undefined') data.description = 'None';
					db.update({ link : url }, data, {upsert : true}, function(err, numReplaced, upsert)
					{
						if(err) socket.emit('new message', { type : 'danger', message : JSON.stringify(err) });
						if(upsert)
						{
							socket.emit('new message', { type : 'success', message : 'Link <strong>'+url+'</strong> saved' });
							//update links table
							update(socket);
						}
						else socket.emit('new message', { type : 'warning', message : 'Link <strong>'+url+'</strong> already saved!' });
					})
					;
			}
			else socket.emit('new message', { type : 'danger', message : "Can't reach this url, "+error });
		});
	})
	;

	//a client wants to remove a link
	socket.on('remove', function(link)
	{
		db.remove({link : link}, {}, function(err, numReplaced)
		{
			if(err) socket.emit('new message', {type : 'danger', message : JSON.stringify(err)});
			if(numReplaced > 0)
			{
				socket.emit('new message', {type : 'success', message : 'Link <strong>'+link+'</strong> removed'});
				// update links table
				update(socket);
			}
		})
		;
	})
	;
});
