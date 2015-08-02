/* jshint laxcomma : true */
/**
 * get date from epoch time
 * @param  {number} epoch format time
 * @return {string}       date format dd/mm/yyyy
 */
var getDate = function(epoch)
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
;

exports.getDate = getDate;
exports.getTime = getTime;
