/* jshint laxbreak:true, laxcomma : true */
var socket = io.connect('http://localhost:8080');

// render table
socket.on('links', function(datas)
{
	var records = [];

	for (var i = 0; i < datas.length; i++)
	{
		var data =
		{
			title : collapseText(datas[i].title, 15, 'collaspeTitle'+i)
			,description : collapseText(datas[i].description, 15, 'collapseDesc'+i)
			,date : datas[i].date
			,time : datas[i].time
			,link : '<a href="'+datas[i].link+'" target="about:blank"><span class="glyphicon glyphicon-play-circle"></span></a>'
			,remove : '<a class="remove" href="#"><span class="glyphicon glyphicon-remove"></span></a>'
		};

		records.push(data);
	}

	$('#myTable').dynatable({
		dataset:
		{
			records: records
		}
	});
})
;

socket.on('message', function(data)
{
	renderMessage(data.type, data.message);
})
;

(function($)
{
	$(document).ready(function()
	{
		socket.emit('get links');

		$('#save').click(function(e)
		{
			e.preventDefault();
			var url = $('#url').val();
			socket.emit('save', url);
			//update table
			// socket.emit('get links');
		})
		;

		$('.remove').click(function(e)
		{
			// e.preventDefault();
			var title = $(this).closest('tr').children('td:eq(0)').text();
			console.log(title);
			// socket.emit('remove', url);
		})
		;
	})
	;
})(jQuery)
;
