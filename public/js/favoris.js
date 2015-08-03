/* jshint laxbreak:true, laxcomma : true */
var socket = io.connect('http://localhost:8080')
	,dynatable = null
	/* update table */
	, updateTable = function(datas)
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
				,link : '<a href="'+datas[i].link+'" target="about:blank" title="go to '+datas[i].title+'"><span class="glyphicon glyphicon-play-circle"></span></a>'
				,action : '<a href="#" title="remove" id="remove"><span class="glyphicon glyphicon-remove"></span></a>'
			};

			records.push(data);
		}
		console.log('ok');
		dynatable.settings.dataset.originalRecords = records;
		dynatable.process();
	};

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
			,link : '<a href="'+datas[i].link+'" target="about:blank" title="go to '+datas[i].title+'"><span class="glyphicon glyphicon-play-circle"></span></a>'
			,action : '<a href="#" title="remove" id="remove"><span class="glyphicon glyphicon-remove"></span></a>'
		};

		records.push(data);
	}

	dynatable = $('#myTable').dynatable({
		dataset:
		{
			records: records
		}
	}).data('dynatable');
})
;

// update table
socket.on('update', function(datas)
{
	updateTable(datas);
})
;

// display message
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
		})
		;

		$(document).on('click','#remove',function()
		{
			var link = $(this).closest('tr').children('td:eq(4)').find('a').attr('href');
			socket.emit('remove', link);
		})
		;
	})
	;
})(jQuery)
;
