// Port for the Express web server
var WEB_SERVER_PORT = 3000;
var OSC_PORT_IN = 12000;


// Import Express and initialise the web server
var express = require('express');
var app = express();
var server = app.listen(WEB_SERVER_PORT);
app.use(express.static('public'));
console.log('Node.js Express server running on port ' + WEB_SERVER_PORT);

// Import and configure body-parser for Express
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


// Import socket.io and create a socket to talk to the client
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newSocketConnection);

function newSocketConnection(socket) {
    console.log('*** New connection to server web socket ' + socket.id);
}

// Import MQTT
var mqtt=require('mqtt');
// const mqttHost = 'test.mosquitto.org'
// const mqttHost = 'public.mqtthq.com'
// const mqttHost = 'mqtt.eclipse.org'
// const mqttHost = 'broker.hivemq.com'
// const mqttHost = 'mqtt.flespi.io'
// const mqttHost = 'mqtt.dioty.co'
// const mqttHost = 'mqtt.fluux.io'
const mqttHost = 'broker.emqx.io'
const mqttPort = '1883';
const mqttClientId = `mqtt_${Math.random().toString(16).slice(3)}`
const mqttConnectUrl = `mqtt://${mqttHost}:${mqttPort}`
var mqttOptions = {
  mqttClientId,
  clean: true,
  connectTimeout: 4000,
  // username: 'emqx',
  // password: 'public',
  reconnectPeriod: 1000,
  will: {
     topic: 'death',
     payload: 'me'
    }
};
const mqttClient = mqtt.connect(mqttConnectUrl, mqttOptions);
mqttClient.on("connect", newMqttConnectionSuccess);
mqttClient.on("error", mqttConnectionrError);
mqttClient.on('message', receiveMqttMessage);
mqttClient.on('disconnect', mqttDisconnect);

function newMqttConnectionSuccess() {
    console.log('*** MQTT connected to host  ' + mqttHost + ':' + mqttPort + '(client id: ' + mqttClientId + ')');

    // Subscribe to message
    // const topicList = ['mqttHQ-client-ideaLabtest'];
    const topicList = ['mqttHQ-client-9102assignment2'];
    mqttClient.subscribe(topicList, {qos:1}, () => {
        console.log(`Subscribed to topics '${topicList}'`)
      });
}

function mqttConnectionrError(error) {
    console.log("Cannot connect to MQTT:" + error);
}

function mqttDisconnect(error) {
    console.log("Client disconnected:" + error);
}

function receiveMqttMessage(topic, message, packet) {
    console.log("topic is "+ topic);
    console.log("message is "+ message);
    var data = [topic, "" + message];
    io.sockets.emit('mqttMessage', data);
}


// Handle POST requests
app.post('/sendMessage', function(request, response) {
    var message = request.body.message;

    // console.log("POST received: address: " + address + ", value: " + value);

    var mqttTopic = 'mqttHQ-client-9101assignment1';
    sendMQTT(mqttTopic, message);
    response.end("");
});

// Send MQTT messages
function sendMQTT(topic, message) {
    var options={
        retain:true,
        qos:0
    };

    if (mqttClient.connected) {
        mqttClient.publish(topic, message, options);
    }
    console.log("##### MQTT message posted to topic: " + topic);
}


// Create an osc.js UDP Port listening on port 57121.
// Credit: https://www.npmjs.com/package/osc
var osc = require("osc");
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: OSC_PORT_IN,
    metadata: true
});

// Listen for incoming OSC messages.
udpPort.on("message", function (oscMsg, timeTag, info) {
    // console.log("An OSC message just arrived!", oscMsg);
    // console.log("Remote info is: ", info);
    io.sockets.emit('oscMessage', oscMsg);
});

// Open the socket.
udpPort.open();

// Handles termination of this process, i.e. this is run when 
// we type 'Ctrl+C' on the Terminal windoe to close thew server.
process.on('SIGINT', () => {
  console.log('===> SIGINT signal received.');
  mqttClient.end();
  console.log('===> MQTT connection closed.');
  udpPort.close();
  console.log('===> OSC connection closed.');
  io.close();
  console.log('===> WebSocket connection closed.');
  console.log('===> Node server exit complete.');
  process.exit(1);
});
