/*
 Project:       terMITes
 Authors:       Nuria Macia
                Juanita Devis
                Jason Nawyn
 Version:       2.2
 Date:          March 2017
 Last modified: July 2017 
 */



function validatePassword( password ) {  
  if ( password === "12345" ) {
    return true;
  }
  else {    
     return false;
  }
}

function validateRadio( radios ) {
  for ( i = 0; i < radios.length; ++ i) {
      if (radios [i].checked) return true;
  }
  return false;
}

function validateForm() { 
  var answerMood = validateRadio(document.forms["survey"]["mood"]);
  var answerEnergy = validateRadio(document.forms["survey"]["energy"]);
  var answerTemperature = validateRadio(document.forms["survey"]["temperature"]);
  var answerNoise = validateRadio(document.forms["survey"]["noise"]);
  var password = document.getElementById("password").value;

  var authentication = true;

  // Init error messages.
  document.getElementById("error-mood").innerHTML = "";
  document.getElementById("error-energy").innerHTML = "";
  document.getElementById("error-temperature").innerHTML = "";
  document.getElementById("error-noise").innerHTML = "";
  document.getElementById("error").innerHTML = "";

  // Display error messages when radios are not checked or password is incorrect.
  if ( !answerMood ) {
    document.getElementById("error-mood").innerHTML = "You forgot to answer this.";
  }
  if ( !answerEnergy ) {
    document.getElementById("error-energy").innerHTML = "You forgot to answer this.";
  }
  if ( !answerTemperature ) {
    document.getElementById("error-temperature").innerHTML = "You forgot to answer this.";
  }
  if ( !answerNoise ) {
    document.getElementById("error-noise").innerHTML = "You forgot to answer this.";
  }
  
  if ( !validatePassword( password ) ) {
    authentication = false;
    document.getElementById("error").innerHTML = "Wrong password";
  }
  
  if( answerMood && answerEnergy && answerTemperature && answerNoise && authentication) {
    return true;
  }

  return false;
}

function getForm() { 
  var mood = document.querySelector('input[name = "mood"]:checked').value;
  var energy = document.querySelector('input[name = "energy"]:checked').value;
  var temperature = document.querySelector('input[name = "temperature"]:checked').value;
  var noise = document.querySelector('input[name = "noise"]:checked').value;
  var password = document.getElementById("password").value;
  writeUserData(mood, energy, temperature, noise, password);
}

function writeUserData(mood, energy, temperature, noise, password) {
  
  var dt = new Date();

  firebase.database().ref('entry/' + dt).set({
    mood: mood,
    energy: energy,
    temperature : temperature,
    noise : noise,
    class : password
  });
}



// Catalog of sensors installed and their IDs in the SVG. 
var sensorCatalog = [
    /* Presence values: 0 or 1  Sensors: AndorraPIR1 */
    { name: "sensor-presence", id: ["AndorraPIR1"] },
    /* Motion values: 0.00-0.10 Do we need to scale them yes, boolean. Sensors: AndorraMotion1, AndorraMotion2 */
    { name: "sensor-motion", id: ["AndorraMotion1","AndorraMotion2"] },
    /* Window values: 0 or 1  Sensors form left to right: AndorraMITes-0769, AndorraMITes-1012,AndorraMITes-0109, AndorraMITes-1001, AndorraMITes-333 */
    { name: "sensor-window", id: ["w0769-value", "w1012-value", "w0109-value", "w1001-value","w333-value"] },
    /* Door values: 0 or 1 close  Sensors: Reed2 */
    { name: "sensor-door", id: ["door2-value"] },
    /* Light values: 0-1250  Sensors: AndorraLight2, AndorraLight3, AndorraLight4,AndorraLight5, AndorraLight6 */
    { name: "sensor-light", id: ["AndorraLight2","AndorraLight3","AndorraLight4","AndorraLight5","AndorraLight6"] },
     /* Curtains values: 0 or 1 move  Sensors form left to right: AndorraMITes-0210, AndorraMITes-0995, AndorraMITes-0066,AndorraMITes-0325*/
    { name: "sensor-curtains", id: ["cur0210-value","cur0995-value","cur0066-value","cur0325-value"] },
    /* Temperature values: 0-30  Sensors: AndorraLight2, AndorraLight3, AndorraLight4,AndorraLight5, AndorraLight6 */
    { name: "sensor-temperature", id: ["AndorraLight2","AndorraLight3","AndorraLight4","AndorraLight5","AndorraLight6"] },
    /* CO2 values:  2.6-1 Inverted, volt sign Sensor: AndorraBob1 */
    { name: "sensor-co2", id: ["AndorraBob1"] },
    /* Humidity values:  0-100%RH Sensor: AndorraHumidity1 */
    { name: "sensor-humidity", id: ["AndorraHumidity1"] }
]; 

// This function id blocking all the code
/*function showSensorValuePresence ( svgDoc, ) {

}*/


var previousQuery = "";
var phantom = true;
var motion = true;



function showSensorValue ( typeOfSensor ) {
    
    var classroom = document.getElementById("santasensorssvg");
    
    // Get the inner DOM of svg file.
    var svgDoc = classroom.contentDocument;
    
    
    // Hide sensor values queried before.
    if ( previousQuery !== "" ) {
      svgDoc.getElementById( previousQuery ).setAttribute("display","none");
    }
    
    // Get the inner element by id.
    var sensor = svgDoc.getElementById( typeOfSensor );
    
    if ( sensor ) {
      
      // Search the sensor IDs for the SVG.
      var sensorIDs = $.grep(sensorCatalog, function( element ){ 
          return element.name === typeOfSensor; 
        }
      );
      
      var status = sensor.getAttribute("display");    
      if ( status === "none" ) {      

        switch ( typeOfSensor ) {
        
          case 'sensor-presence':
                var numberOfSensors = sensorIDs[0].id.length;
                for (var i = 0; i < numberOfSensors; i++) {
	                var sensorId = sensorIDs[0].id[i];   
	                $.ajax({
				        url: 'http://replace.media.mit.edu/electronautes/php/getActivationCountTodayByName.php?name=' + sensorId,
				        async: false,
				        dataType: 'json',
				        success: function(data) {
					        var count = data['count'];
							if (count > 0) {
			                    svgDoc.getElementById(sensorId+'-icon-0').setAttribute("display","none");
			                    svgDoc.getElementById(sensorId+'-icon-1').setAttribute("display","block");
			                    $(svgDoc.getElementById(sensorId+'-value')).text(count.toString());
			                }
			                else {
			                    svgDoc.getElementById(sensorId+'-icon-0').setAttribute("display","block");
			                    svgDoc.getElementById(sensorId+'-icon-1').setAttribute("display","none");
			                    $(svgDoc.getElementById(sensorId+'-value')).text("0");
			                }
				        }
				    });
                }
                break;               
          case 'sensor-motion':
                var numberOfSensors = sensorIDs[0].id.length;
   				for (var i = 0; i < numberOfSensors; i++) {
	            	var sensorId = sensorIDs[0].id[i];
	                $.ajax({
				        url: 'http://replace.media.mit.edu/electronautes/php/getActivationCountTodayByName.php?name=' + sensorId,
				        async: false,
				        dataType: 'json',
				        success: function(data) {
					        var count = data['count'];
					        if (count > 0) {
					            svgDoc.getElementById(sensorId+'-icon-0').setAttribute("display","none");
			                    svgDoc.getElementById(sensorId+'-icon-1').setAttribute("display","block");
			                    $(svgDoc.getElementById(sensorId+'-value')).text(count.toString());
							}
							else {
			                    svgDoc.getElementById(sensorId+'-icon-0').setAttribute("display","block");
			                    svgDoc.getElementById(sensorId+'-icon-1').setAttribute("display","none");
			                    $(svgDoc.getElementById(sensorId+'-value')).text("0");
		                 	}
		                }
		            });
                }
                break;
          case 'sensor-window':
                
                /*
                DOES NOT WORK :(
                */
                
                var numberOfSensors = sensorIDs[0].id.length;
                // TODO: change the icon depending on the value of the sensor (0,1) if value=1 display-icon-1 else display-icon-0
                for (var i = 0; i < numberOfSensors; i++) {
                  if ( phantom ) {
                    console.log(sensorIDs[0].id[i]+'-icon-0');
                    svgDoc.getElementById(sensorIDs[0].id[i]+'-icon-0').setAttribute("display","none");
                    svgDoc.getElementById(sensorIDs[0].id[i]+'-icon-1').setAttribute("display","block");
                    phantom = false;
                    $(svgDoc.getElementById(sensorIDs[0].id[i])).text("1");
                  }
                  else {
                    svgDoc.getElementById(sensorIDs[0].id[i]+'-icon-0').setAttribute("display","block");
                    svgDoc.getElementById(sensorIDs[0].id[i]+'-icon-1').setAttribute("display","none");
                    phantom = true;
                    $(svgDoc.getElementById(sensorIDs[0].id[i])).text("0");
                  }
                }
                break;
          case 'sensor-door':
                 var numberOfSensors = sensorIDs[0].id.length;
                // TODO: change the icon depending on the value of the sensor (0,1) if value=1 display-icon-1 else display-icon-0
                for (var i = 0; i < numberOfSensors; i++) {
                  if ( phantom ) {
                    console.log(sensorIDs[0].id[i]+'-icon-0');
                    svgDoc.getElementById(sensorIDs[0].id[i]+'-icon-0').setAttribute("display","none");
                    svgDoc.getElementById(sensorIDs[0].id[i]+'-icon-1').setAttribute("display","block");
                    phantom = false;
                    $(svgDoc.getElementById(sensorIDs[0].id[i])).text("1");
                  }
                  else {
                    svgDoc.getElementById(sensorIDs[0].id[i]+'-icon-0').setAttribute("display","block");
                    svgDoc.getElementById(sensorIDs[0].id[i]+'-icon-1').setAttribute("display","none");
                    phantom = true;
                    $(svgDoc.getElementById(sensorIDs[0].id[i])).text("0");
                  }
                }
                break;
          case 'sensor-light':
                // Change value for each sensor.
				var numberOfSensors = sensorIDs[0].id.length;
                for (var i = 0; i < numberOfSensors; i++) {
					var sensorId = sensorIDs[0].id[i];
					$.ajax({
				        url: 'http://replace.media.mit.edu/electronautes/php/getLastValueByName.php?name=' + sensorId,
				        async: false,
				        dataType: 'json',
				        success: function(data) {
							$(svgDoc.getElementById(sensorId + "-value")).text(data[0]['value']);
							var lastDate = data[0]['time'].split('.')[0].replace(/-/g, '/');
							$(svgDoc.getElementById(sensorId + "-light-lastimevalue")).text(lastDate.substring(0, lastDate.lastIndexOf(":")));	
				        }    
					});
                }
                break;   
                break;
          case 'sensor-curtains':
                // Change value for each sensor.
                var numberOfSensors = sensorIDs[0].id.length;
                for (var i = 0; i < numberOfSensors; i++) {
                  $(svgDoc.getElementById(sensorIDs[0].id[i])).text("2");
                }
                break;
          case 'sensor-co2':
                // Change value for each sensor. ***This value needs to be inverted volt sign
                var numberOfSensors = sensorIDs[0].id.length;
                for (var i = 0; i < numberOfSensors; i++) {
	                var sensorId = sensorIDs[0].id[i];  
	           		$.ajax({
				        url: 'http://replace.media.mit.edu/electronautes/php/getLastValueByName.php?name=' + sensorId,
				        async: false,
				        dataType: 'json',
				        success: function(data) {
							$(svgDoc.getElementById(sensorId + "-value")).text(data[0]['value']);	
				        }    
					});
				}
                break;
          case 'sensor-humidity':
                // Change value for each sensor. ***This value needs to be inverted volt sign
                var numberOfSensors = sensorIDs[0].id.length;
                for (var i = 0; i < numberOfSensors; i++) {
					var sensorId = sensorIDs[0].id[i];
					$.ajax({
				        url: 'http://replace.media.mit.edu/electronautes/php/getLastValueByName.php?name=' + sensorId,
				        async: false,
				        dataType: 'json',
				        success: function(data) {
							$(svgDoc.getElementById(sensorId + "-value")).text(data[0]['value'] + '%');	
				        }    
					});
                }
                break;
           case 'sensor-temperature':
                // Change value for each sensor.
                var numberOfSensors = sensorIDs[0].id.length;
                for (var i = 0; i < numberOfSensors; i++) {
	                var sensorId = sensorIDs[0].id[i];                
				    $.ajax({
				        url: 'http://replace.media.mit.edu/electronautes/php/getLastTemperatureByName.php?name=' + sensorId,
				        async: false,
				        dataType: 'json',
				        success: function(data) {
							$(svgDoc.getElementById(sensorId + "-value")).text(data[0]['temperature'] + '&deg;C');
							var lastDate = data[0]['time'].split('.')[0].replace(/-/g, '/');
							$(svgDoc.getElementById(sensorId + "-temp-lastimevalue")).text(lastDate.substring(0, lastDate.lastIndexOf(":")));	
				        }
				    });
                }
                break;   
        }
        
        // Display sensors on the SVG.
        sensor.setAttribute("display","block");
        previousQuery = typeOfSensor;
      } 
    }
}


/* 
* Preliminary set up of svg file
*/
function formatSVG(svgObjectId) {
    var svgObj = document.getElementById(svgObjectId);
    if (svgObj){
        svgObj.addEventListener("load",function() { 
            console.log('svg loaded');
            var svgDoc = svgObj.contentDocument;
            
            // Set the size of the svg root element always to 100%
            var rootLayer = svgDoc.getElementById('root-layer');
            rootLayer.setAttribute('width', '100%');
            rootLayer.setAttribute('height', '100%');
 
            // create the style element within the svg and adds the import for the right font
            var importStament = `
                @import url(http://fonts.googleapis.com/css?family=Amatic+SC);
            `;
            var style = svgDoc.createElementNS("http://www.w3.org/2000/svg", 'style');        
            style.innerHTML = style.innerHTML + importStament;
            svgDoc.documentElement.appendChild(style);
            
            
            // change all the .text font-family to the correct one
            var textElements = svgDoc.getElementsByTagNameNS("http://www.w3.org/2000/svg",'text');
            for (var i = 0; i <textElements.length; i++) {
                var textElement = textElements[i];
                textElement.setAttribute('font-family', 'Amatic SC');
                if(textElement.id.endsWith('lastimevalue')) {
                    textElement.setAttribute('font-weight', '500');    
                }
                else {
                    textElement.setAttribute('font-weight', '700');
                }

            }
        }, false);
    }
}

/* Drag and drop relate sensors emotions */

function allowDrop(ev) {
    ev.preventDefault();
}

var fromId = {};

function drag(ev) {
    var draggableButtonDiv = $(ev.target).closest('.r-button-sensor')[0];
  
    var containerOfButton = draggableButtonDiv.parentElement;
    if (containerOfButton.id !== 'center-dragbox-forsensors') {
        fromId[draggableButtonDiv.id] = containerOfButton.id;
    }
    
    ev.dataTransfer.setData("draggedId", draggableButtonDiv.id);     
    console.log("containerOfButton.id: " + containerOfButton.id);  
}

function drop(ev) {
    ev.preventDefault();
    var draggedId = ev.dataTransfer.getData("draggedId");
    
    console.log(fromId);
    if (ev.target.id !== "center-dragbox-forsensors") {
        $("#" + fromId[draggedId]).append(document.getElementById(draggedId));
    }
    else {
        $('#center-dragbox-forsensors').append(document.getElementById(draggedId));  
    }   
}



$(document).ready(function() {

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCx9BjCK5xNx7q7sdD2EjCgdfjqesQSdTY",
    authDomain: "termites-752ca.firebaseapp.com",
    databaseURL: "https://termites-752ca.firebaseio.com",
    projectId: "termites-752ca",
    storageBucket: "termites-752ca.appspot.com",
    messagingSenderId: "58714056226"
  };
  firebase.initializeApp(config);
  
  // Get a reference to the database service
  var database = firebase.database();

});






