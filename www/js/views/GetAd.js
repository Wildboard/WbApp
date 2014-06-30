(function(window) {
    
    wbDebugLog("Entering GetAd view.");


  app.GetAd = function() {
      wbDebugLog("In app.GetAd");
      $(".pageGetAd").css("display", "block");
      $(".page1").css("display", "none");
      app.GetAd.init();
      return app.GetAd.Content;
  }

  

  app.GetAd.Content = $(".pageGetAd");
  app.GetAd.Options = {};
  app.GetAd.Options.socket = null;
  app.GetAd.initiated = false;

  function onGeoSuccess(pos) {
      wbDebugLog("Got coordinates: " + position.coords.latitude + "x" +position.coords.longitude);
      app.GetAd.Options.position = pos;
  }

  function onGeoError(err) {
      wbDebugLog("Could not get position: " + err.code + ": " + err.message);
      app.GetAd.Options.position = null;
  }

  navigator.geolocation.getCurrentPosition(
					   onGeoSuccess, 
					   onGeoError, 
					   { enableHighAccuracy: true });

  app.GetAd.init = function() {
      wbDebugLog("In app.getAd.init()");
      app.GetAd.initiated = true;
      
      app.GetAd.Options = {};

      function fetchSavedFlyers() {
	var flyersStr = window.localStorage.getItem("flyers");
	var flyersArr = [];
	if (flyersStr) {
	    flyersArr = flyersStr.split(",");
	}  
	//	wbDebugLog("XXX fetchSavedFlyers(): Fetched flyers: " + flyersStr + " (" + flyersArr.length + ")");
	return flyersArr;
    }

    function clearDivDraggedFlyer() {
	$('#divDraggedFlyer').empty();
	$('<div id="divDraggedFlyerImg"></div>').appendTo('#divDraggedFlyer');
	$('<div id="divButtons"></div>').appendTo('#divDraggedFlyer');
    }

    function refreshSavedFlyers() {
	$('#savedFlyersOuterDiv').empty();
	var flyersArr = fetchSavedFlyers();
	//	wbDebugLog("XXX refreshSavedFlyers(): Found " + flyersArr.length + " saved flyers");
	for (var i = 0; i < flyersArr.length; i++) {
	    var flyerId = flyersArr[i];
	    //	    wbDebugLog("XXX refreshSavedFlyers(): Flyer ID " + flyerId);
	    try {
		var flyerKey = "flyerJson_"+flyerId;
		var flyerJsonStr = window.localStorage.getItem(flyerKey);
		// wbDebugLog("XXX refreshSavedFlyers(): Fetched " + flyerKey +": " + flyerJsonStr);
		var flyerJson = JSON.parse(flyerJsonStr);
		var imgSrc = flyerJson.mediaArea[0];
		var title = flyerJson.titleArea.title;
		var subtitle = "";
		for (var idx in flyerJson.titleArea.subtitle) { 
		    subtitle += flyerJson.titleArea.subtitle[idx] + "<br/>\n";
		}
		var desc = flyerJson.bodyArea.description;
		var contact = "";
		for (var idx in flyerJson.contactArea) {
		    contact += flyerJson.contactArea[idx].text + "<br/>\n";
		    // TODO type
		}
		var html = "<div height=\"180\" width=\"180\" style=\"border-style:solid;\" id=\"divFlyer" + flyerId + "\">";
		html += "<h1>" + title + "</h1>";
		html += "<h2>" + subtitle + "</h2>";
		html += desc +"<br/>";
		html += contact + "<br/>";
		html += "<img height=\"120\" align=\"center\" width=\"160\" src=\"" + imgSrc + "\"></img>";
		html += "</div>";
		// wbDebugLog("Writing " + html);
		$(html).appendTo('#savedFlyersOuterDiv');
		$('<br>').appendTo('#savedFlyersOuterDiv');
	    } catch (ex) {
		wbDebugLog("XXX refreshSavedFlyers(): Error: " + ex);
		// do nothing
	    }
	}
    }
   
    $(".pageGetAd").css("display", "block");
    app.GetAd.Content = $(".pageGetAd");
    $('#serverMsg').html("");
    $('#idGetAdArrowUp').css("display", "none");
    clearDivDraggedFlyer();

    

    function onConnect() {
	// Step 9.
	if (app.GetAd.Options.socket) {
	    if (app.GetAd.Options.socket.id) {
		wbDebugLog("Connected: " + app.GetAd.Options.socket.id);     
	    } else {
		wbDebugLog("Connected: " + app.GetAd.Options.socket);
	    }
	    var msg = { deviceId : device.uuid, latitude : -1, longitude : -1};
	    if (app.GetAd.Options.position) {
		msg.latitude = app.GetAd.Options.position.coords.latitude;
		msg.longitude = app.GetAd.Options.position.coords.longitude;
	    }
	    app.GetAd.Options.socket.emit('phoneHi', 
					  msg);
	} else {
	    wbDebugLog("Weird: " + app.GetAd.Options.socket);
	}
    }

    function onDisconnect() {
      $('#serverMsg').html("Disconnected");
      $('#divConnectToDifferentBoard').css("display", "none");
      app.GetAd.Options.socket = null;
    }

    // Step 13.
    function onOops(data) {
	var msg = data.msg;
        wbAlert(msg);
	$('#serverMsg').html(msg);
    }      

    function disconnect() {
	wbDebugLog("Disconnecting.");
	if (app.GetAd.Options.socket) {
	    try {
		app.GetAd.Options.socket.disconnect();
	    } catch (ex) {
		wbDebugLog("Error disconnecting: " + ex);
	    }
	}
	$('#idGetAdArrowUp').css("display", "none");
	app.GetAd.Options.socket = null;
    }

    function onWelcome(data) {
      if (!data || !data.length) {
	  // Should not happen!
	  wbAlert("No boards available");
	  return;
      }
      // Step 14 in progress
      $('#selectBoard').empty();
      for (var i = 0; i<data.length; i++) {
	  var sel = "";
	  if (i == 0) {
	      sel = "selected";
	  }

	  if (i > 0) { 
	      // TODO allow switching to a different board...
	      sel = "disabled";
	  }

	  var opt = $('<OPTION ' +
		      sel + 
		      ' ' +
		      value + 
		      '"' + 
		      data[i] + 
		      '">'  + 
		      data[i] + 
		      "</option>");
	  opt.appendTo('#selectBoard');
      }
      wbDebugLog("Connecting to " + data[0] + ".");
      $('#serverMsg').html("Connecting to " + data[0] + ".");
      app.GetAd.Options.socket.emit('phoneConnectTo', {boardName : data[0]});
    }
    
    function onGetAd(data) {
	var flyerId = data.flyerId;
	var flyerHtml = data.flyerHtml;
	var flyerJsonStr = data.flyerJsonStr;
	var flyerJsonObj = data.flyerJsonObj;
	wbDebugLog("Received " + data.flyerId);
	var flyerJson ;
	try {
	    var flyerJson = JSON.parse(flyerJsonStr);
	} catch (error) {
	    wbDebugLog("Error parsing " + flyerJsonStr);
	    wbDebugLog(error);
	    $('#serverMsg').html("Error occurred");
	    return;
	}
	wbDebugLog("Parsed JSON: " + flyerJson.titleArea.title);
	// Step 27.
      
	var imgSrc = "";
	// Modify the URL to point to main...
	if (flyerJson.mediaArea.length > 0) {
	  flyerJson.mediaArea[0] = flyerJson.mediaArea[0].replace("localhost/images","ads.wildboard.net/images/demo");
	  imgSrc = flyerJson.mediaArea[0];
	}

	flyerJsonStr = JSON.stringify(flyerJson);
	
	var html = "<img height=\"120\" width=\"160\" src=\"" + imgSrc + "\"></img>";
	
	// wbDebugLog("XXX: Setting html to " + html);
	
	$('#divDraggedFlyerImg').html(html);
	var btnKeep = $('<input type="button" id="buttonKeep" value="Keep"></button>');
	var btnDiscard = $('<input type="button" id="buttonDiscard" value="Discard"></button>');
	
	//      wbDebugLog("XXX: " + $('#divDraggedFlyer').html());
	//      wbDebugLog("XXX: Attaching click to " + btnKeep);
	
	btnKeep.on('click', 
		   function() {
		       var flyerKey = "flyerJson_" + flyerId;
		       window.localStorage.setItem(flyerKey, flyerJsonStr);
		       wbDebugLog("XXX: Setting " + flyerKey + " to " + flyerJsonStr);
		       var savedFlyersArr = fetchSavedFlyers();
		       
		       savedFlyersArr.push(flyerId);
		       var savedFlyersStr = savedFlyersArr.join();
		       wbDebugLog("XXX: New savedFlyersStr: " + savedFlyersStr + " (" + savedFlyersArr.length + ")");
		       window.localStorage.setItem("flyers", savedFlyersStr);
		       refreshSavedFlyers();
		       clearDivDraggedFlyer();
		   });
	
	btnDiscard.on('click', 
		      function() {
			  refreshSavedFlyers();
			  clearDivDraggedFlyer();
		      });
	
      //      wbDebugLog("XXX: Showing buttons.");
	btnKeep.appendTo('#divButtons');
	btnDiscard.appendTo('#divButtons');
	
	// Step 28.
	disconnect();
    }
    
    function onYourColorIs(data) {
	var myColor = data.color;
	// Step 20. 
	$('#serverMsg').html('<font color="' + 
			     myColor + 
			     '">Drag the flyer to the ' +
			     ' arrow on the screen to get it on your phone.' +
			     '</font>');
	// http://css-tricks.com/snippets/css/css-triangle/
	$('#idGetAdArrowUp').css("display", "block");
	//$('#idGetAdArrowUp').css("width", "0");
	//$('#idGetAdArrowUp').css("height", "0");
	//$('#idGetAdArrowUp').css("border-left", "200px solid transparent");
	//$('#idGetAdArrowUp').css("border-right", "200px solid transparent");
	//$('#idGetAdArrowUp').css("border-bottom", "40px solid " +myColor);
    }
    
    // Events:
    // hi (client->server)
    // oops (server->client)
    // welcome (server->client)
     disconnect();
        
      function bindSocketHandlers() {
	  wbDebugLog("Entered bindSocketHandlers()"); 

	  app.GetAd.Options.socket.on('connect', onConnect);
	  app.GetAd.Options.socket.on('toPhoneOops', onOops);
	  app.GetAd.Options.socket.on('toPhoneWelcome', onWelcome);
	  app.GetAd.Options.socket.on('toPhoneYourColorIs', onYourColorIs);
	  app.GetAd.Options.socket.on('toPhoneGetAd', onGetAd);
	  app.GetAd.Options.socket.on('disconnect', onDisconnect);
      }
      
      if (app.GetAd.Options.socket) {
	wbDebugLog("I see app.GetAd.Options.socket = " + app.GetAd.Options.socket);
	$('#idGetAdArrowUp').css("display", "block");
    } else {
	wbDebugLog("No app.GetAd.Options.socket, connecting.");
	try {
	    // Step 7.
	    app.GetAd.Options.socket = io.connect('http://ads.wildboard.net:8888',
						  {'force new connection': true});
	    
	    bindSocketHandlers();
	    wbDebugLog("Socket: " + app.GetAd.Options.socket + " ("
		       + app.GetAd.Options.socket.id);
	} catch (ex) {
	    // Step 8.
	    wbAlert("Cannot establish connection");
	    $('#serverMsg').html("No connection.");
	    return;
	}
      }
        
      refreshSavedFlyers();
  }
})(window);
