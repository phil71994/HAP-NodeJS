var NurseryTemperature = "00";

// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 1883,
  host: '192.168.1.155',
  clientId: 'AdyPi_NurseryTemperatureSensor'
};
var client = mqtt.connect(options);
console.log("Nursery Temperature Sensor Connected to MQTT broker");
client.subscribe('NurseryTemperature');
client.on('message', function(topic, message) {
//  console.log(parseFloat(message));
  NurseryTemperature = message;
});

var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// here's a fake temperature sensor device that we'll expose to HomeKit
var FAKE_SENSOR = {
  currentTemperature: 50,
  getTemperature: function() { 
    console.log("Getting the current temperature!");
    // return FAKE_SENSOR.currentTemperature;
    return parseFloat(NurseryTemperature); 
  },
  randomizeTemperature: function() {
    // randomize temperature to a value between 0 and 100
    FAKE_SENSOR.currentTemperature = Math.round(Math.random() * 100);
  }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:nursery-temperature-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Nursery Temperature Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C3:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, FAKE_SENSOR.getTemperature());
  });

// randomize our temperature reading every 3 seconds
setInterval(function() {
  
  FAKE_SENSOR.randomizeTemperature();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, FAKE_SENSOR.currentTemperature);
  
}, 3000);
