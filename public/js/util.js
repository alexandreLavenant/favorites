/* jshint laxbreak:true , laxcomma : true */

/**
 * render a message that you can close
 * @param  {string} message
 * @param  {string} type    of the message in bootstrap
 * @return {string}         html string with the message
 */
var renderMessage = function(type, message)
{
	$('#message').html('<div class="alert alert-'+type+' alert-dismissible" role="alert">'
	+'<button class="close" aria-label="Close" data-dismiss="alert" type="button">'
	+'<span aria-hidden="true">x</span>'
	+'</button>'
	+message
	+'</div>');
}
/**
 * collapse text with bootstrap
 * @param  {string} str   to collapse
 * @param  {number} index at which you want to cut the string
 * @param  {string} id    name of the id of your collapse message
 * @return {string}       string with html to collapse the message
 */
, collapseText = function(msg, index, id)
{
	var substr = [];
	if(msg.length > index)
	{
		substr.push(msg.substr(0,index));
		substr.push(msg.substr(index, msg.length-1));
		return substr[0]+'<a role="button" data-toggle="collapse" href="#'+id+'"> ...</a><div id="'+id+'" class="panel-collapse collapse">'+substr[1]+'</div>';
	}
	else return msg;
}
;
