/*
	Disabling canvas scroll for better experience on mobile interfce.
	Source: 
		User 'soanvig', answer posted on Jul 20 '17 at 18:23.
		https://stackoverflow.com/questions/16348031/disable-scrolling-when-touch-moving-certain-element 
*/
document.addEventListener('touchstart', function(e) {
    document.documentElement.style.overflow = 'hidden';
});

document.addEventListener('touchend', function(e) {
    document.documentElement.style.overflow = 'auto';
});


//////////////////////////////////////////////////
//FIXED SECTION: DO NOT CHANGE THESE VARIABLES
//////////////////////////////////////////////////
var HOST = window.location.origin;
let xmlHttpRequest = new XMLHttpRequest();

////////////////////////////////////////////////////
// CUSTOMIZABLE SECTION - BEGIN: ENTER OUR CODE HERE
////////////////////////////////////////////////////
let userId = `user_${Math.random().toString(16).slice(3)}`
sendMessage(`login|||${userId}`);

function sendRipple(el) {
	let wish = el.closest('.section').querySelector('textarea').value;
	let color = el.closest('.section').querySelector('input:checked').closest('label').querySelector('.screenreader').innerHTML;
	sendMessage(`ripple|||${wish}|||${color}`);
}

window.addEventListener("visibilitychange", function(e){
	e.preventDefault();
	sendMessage(`logout|||${userId}`);
	return e.returnValue = '';
});

//onMount
document.addEventListener("DOMContentLoaded", function () {

});

function nextStep(val) {
	document.querySelectorAll('.step').forEach(step=> {
		step.style.display = step.className.indexOf(`step-${val}`) > -1 ? '' : 'none';
	})
}


////////////////////////////////////////////////////
// CUSTOMIZABLE SECTION - END: ENTER OUR CODE HERE
////////////////////////////////////////////////////

/***********************************************************************
  === PLEASE DO NOT CHANGE OR DELETE THIS SECTION ===
  This function sends a MQTT message to server
***********************************************************************/
function setupMqtt() {
	socket = io.connect(HOST);
	socket.on('mqttMessage', receiveMqtt);
}

function sendMessage(data) {
	let postData = JSON.stringify({ id: 1, 'message': data });
	xmlHttpRequest.open("POST", HOST + '/sendMessage', false);
    xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
	xmlHttpRequest.send(postData);
}

function receiveMqtt(data) {
	var topic = data[0];
	var message = data[1];
	console.log('Topic: ' + topic + ', message: ' + message);

	if (topic.includes('9102assignment2')) {
		if (message.split('|||')[0] === 'emotion' && userId === message.split('|||')[1]) {

		}
	}
}