import io from 'socket.io-client';
import $ from 'jquery';

$.urlParam = function(name)  
{  
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);  
    return results[1] || 0;  
}

let socket    = io();
let middle        = false;
let medium_qs     = false;
let hard_qs       = false;
let noUser        = false;
let question      = false;
let usrSuccessFul = false;
socket.on('connect', ()=> {
	middle        = false;
	medium_qs     = false;
	hard_qs       = false;
	noUser        = false;
	question      = false;
	usrSuccessFul = false;
});

socket.on('reconnect', ()=> {
	middle        = false;
	medium_qs     = false;
	hard_qs       = false;
	noUser        = false;
	question      = false;
});


socket.on('token', () => {
	socket.emit('token', $.urlParam('token'));
});

socket.on('message', (msg)=> {
	$('#messages').append($('<li>').text(msg.content));
});

socket.on('message:noUser', (msg) => {
	$('#messages').append($('<li>').text(msg.content));
	noUser = true;
})

socket.on('message:middle', (msg) => {
	middle = true;
	$('#messages').append($('<li>').text(msg.content));
});

socket.on('message:question:medium', (msg) => {
	medium_qs = true;
	$('#messages').append($('<li>').text(msg.content));
});
socket.on('message:question:hard', (msg) => {
	hard_qs = true;
	$('#messages').append($('<li>').text(msg.content));
})

socket.on('message:successful', (msg) => {
	$('#messages').append($('<li>').text(msg.content));
	usrSuccessFul = true;
});


socket.on('message:question', (msg) => {
	console.log(msg);
	$('#messages').append($('<li>').text(msg.content));
	question = true;
});

socket.on('redirect:index' , (msg) => {
	setTimeout(() => {window.location.href='http://localhost:8080/'} , 2000);
});

socket.on('chat', (msg) => {
	$('#messages').append($('<li>').text(msg.content));
});

socket.on('chat:open', (msg) => {
	$('#messages').append($('<li>').text("Opening App :"+msg.content));
})


$('form').submit(() => {
	let msg = {};
    msg.content = $('#m').val();
    if(usrSuccessFul){
    	socket.emit('chat', msg);
    }
	else if(middle){
		socket.emit('message:middle', msg);
		middle = false;
	}
	else if(medium_qs) {
		socket.emit('message:question:medium', msg);
		medium_qs = false;
	}
	else if(hard_qs) {
		socket.emit('message:question:hard', msg);
		hard_qs = false;
	}
	else if(noUser) {
		socket.emit('message:noUser', msg);
		noUser = false;
	}
	else if(question) {
		socket.emit('message:question', msg);
		question = false;
	}
	else {
		socket.emit('message' , msg);
	}
	$('#messages').append($('<li>').text(msg.content));
    $('#m').val('');
	return false;
});