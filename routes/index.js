var express = require('express');
var mqtt = require('mqtt');
var router = express.Router();
var url = require('url');

var mqtt_url = process.env.CLOUDMQTT_URL || 'mqtt://soldier.cloudmqtt.com';
var options = {
  port: 10576,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: "zoffbyyx",
  password: "8MtNrJ6KUCKm",
};
// var mqtt_url = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';
var topic = process.env.CLOUDMQTT_TOPIC || 'main';
var topicStatus = process.env.CLOUDMQTT_TOPIC || 'stra';

var client = mqtt.connect(mqtt_url, options);

/* GET home page. */
router.get('/', function(req, res, next) {
  var config =  url.parse(mqtt_url);
  config.topic = topic;
  res.render('index', {
	connected: client.connected,
	config: config
  });
});

client.on('connect', function() {
  router.post('/publish', function(req, res) {
	var msg = JSON.stringify({
	  date: new Date().toString(),
	  msg: req.body.msg
	});
    client.publish(topic, msg, function() {
      res.writeHead(204, { 'Connection': 'keep-alive' });
      res.end();
    });
  });

  router.post('/ligar', function(req, res) {
  
    const codeComponentResult = req.body.codComponent;
    console.log('REQUEST BODY TURN ON', req.body);
    var msg = JSON.stringify({
      codeComponent: codeComponentResult,
      msg: 'L'
    });
    client.publish(topic, msg, function() {
      // res.writeHead(204, { 'Connection': 'keep-alive' });
      res.status(200).send({statusCode: 200, mensagem: "Ligado com sucesso", codComponent: codeComponentResult});
      // res.end();
    });
  });

  router.post('/desligar', function(req, res) {
    console.log('REQUEST BODY TURN OFF', req.body);
  
    const codeComponentResult = req.body.codComponent;

  var msg = JSON.stringify({
    date: new Date().toString(),
    msg: 'D'
  });
    client.publish(topic, msg, function() {
      res.status(200).send({statusCode: 200, mensagem: "Desligado com sucesso", codComponent: codeComponentResult});

    });
  });

  router.post('/status', function(req, res) {
  var msg = JSON.stringify({
    // date: new Date().toString(),
    msg: 'S'
  });
    client.publish(topic, msg, function() {
      res.writeHead(204, { 'Connection': 'keep-alive' });
      res.end();
    });
  });
    
  router.get('/stream', function(req, res) {
    // Monitoramento
    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    // Timeout timer, send a comment line every 20 sec
    var timer = setInterval(function() {
      res.write('event: ping' + '\n\n');
    }, 20000);

    client.subscribe(topic, function() {
      client.on('message', function(topic, msg, pkt) {
		//res.write("New message\n");
		var json = JSON.parse(msg);
        res.write("data: " + json.date + ": " + json.msg + "\n\n");
      });
    });
  });
});

module.exports = router;
