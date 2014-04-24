
	var huser;
	var hlights;
		
	var hexRed			= "FF0000";
	var hexGreen   		= "00FF00";
	var hexBlue    		= "0000FF";
	var hexWhite   		= "FFFFFF";
	
	var hexYellow 		= 'FFFF00'; // Looks more like green
	var hexOrange 		= 'FF6600'; // Not a nice orange
	var hexGreen 		= '00FF00';
	var hexPink 		= 'FF00FF';
	
	// Initialize: Search for bridges and check user permissions
	startHue = function() {
	
		changeLogTitle('Loading hue..');
		addToLog('Searching for bridges.');
	
		var funwithuser = 'funwithuser';
		var hue = jsHue();
	
		// Search for bridges
		hue.discover(
		    function(bridges) {
				console.log(bridges);
		        if(bridges.length === 0) {
		            addToLog('No bridges found.');
		        } else {
		            bridges.forEach(function(b) { // TODO: Multiple Bridges?
						addToLog('Bridge found at: '+b.internalipaddress+'.<br>');
						addToLog('Checking permissions for: '+funwithuser+'.');
						
						var user = hue.bridge(b.internalipaddress).user(funwithuser);
						console.log(user);
						
						// Check user permissions
				        user.getLights(function(result){ // TODO: Replace with something like getUser
					        
					        // No lights found.
					        if(Object.size(result)<=1){ // Check the number of lights. There is always something in success, the error or the lights
						        
						        addToLog('Error: '+result[0].error.description+'.<br>');
								addToLog('Trying to create user: '+funwithuser+'.');		
								
								// Try to create a new user.
								user.create(funwithuser, function(result) { // TODO: Multiple Errors?
									if(result[0].error) { 
									    addToLog('Error: '+result[0].error.description+'.<br>');
									    addToLog('Press the link button and try again.');
									} 
									if(result[0].success) {
										addToLog('User created.');				
								        checkLights(user);
									}
								});
					        } else { // Lights found.
								addToLog('Permission granted.<br>');
						        checkLights(user);
						    }
				        });
		            });
		        }
		    } // TODO: Callbacks?
		);
	
	}
	
	// Check if there are lights, turn them on, show the buttons
	checkLights = function(user) {
		addToLog('Searching for lights.')
	    user.getLights(function(result){
	
			huser = user;
			hlights = result;
	
	    	console.log(result);
		    addToLog(Object.size(result)+' lights found: ');
	
			i=1; // Light's object doesn't start at 0
			while (i <= Object.size(result)) 
			{
			    addToLog(result[i].name+'.');
				i++;
				turnOnLight(i);
			}
	
			addToLog('<br>Ready to go! Pick an effect.');
			showEffectButtons();
		});
	}

	// Effect - Turn ON light
	turnOnLight = function(id) {
		huser.setLightState(id, 
			{ on: true, xy: colors.getCIEColor(hexWhite), bri: 1 }, 
			function(result) {
				console.log(result);
			}
		);
	}
	
	// Effect - Turn OFF light
	turnOffLight = function(id) {
		huser.setLightState(id, 
			{ on: false }, 
			function(result) {
				console.log(result);
			}
		);
	}
	
	// Effect - Simple COLOR
	makeLight = function(id, hex) {
		huser.setLightState(id, { on: true, xy: colors.getCIEColor(hex), bri: 1 } );
	}





	
	
	// Add a message to the log. 
	addToLog = function(message) {
		$('#log').append(message+' ');
	};
	
	// Change the title of the log
	changeLogTitle = function(message) { 
		$('#logtitle').html(message);
		$('#log').html('&nbsp;');
	}
	
	// Hide the default buttons and show the light and effect buttons
	showEffectButtons = function() {
		$('#buttons_default').fadeOut("slow",function() {
	
			$('#logtitle').html('Ready for action');
			$('#log').fadeTo( "slow" , 0.2);
	
			$('#buttons_lights').fadeIn();
			$('#buttons_effects').fadeIn();
			
			i=1; // Light's object doesn't start at 0
			while (i <= Object.size(hlights)) 
			{
				$('#buttons_lights').append('<a class="btn btn-lg btn-default" id="light_'+i+'">'+hlights[i].name+'</a> ');
				i++;
			}
	
		});
	}
	
	
$(document).ready(function(){
	
	// Click: Start Hue
	$('#gogogo').click(function() {
		startHue();
	});

	// Show the default buttons on document ready
	$('#buttons_default').fadeIn();



	$('#effect_red').click(function() {
		i=1; while (i < Object.size(hlights)) {
			makeLight(i, hexRed);
		i++; }	
		
	});
	$('#effect_green').click(function() {
		i=1; while (i < Object.size(hlights)) {
			makeLight(i, hexGreen);
		i++; }	
	});
	$('#effect_blue').click(function() {
		i=1; while (i < Object.size(hlights)) {
			makeLight(i, hexBlue);
		i++; }
	});

	$('#buttons_lights').on('click', 'a', function() {
		$(this).toggleClass('btn-default');
		if( $(this).hasClass('btn-default') ) {
			i=0; while (i < Object.size(hlights)) {
				turnOnLight( $(this).attr('id').split('_')[1] );
			i++; }
		} else {
			i=0; while (i < Object.size(hlights)) {
				turnOffLight( $(this).attr('id').split('_')[1] );
			i++; }
		}
	});


	
});

	// Function to get the length of objects
	// http://stackoverflow.com/questions/5223/length-of-javascript-object-ie-associative-array
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};
