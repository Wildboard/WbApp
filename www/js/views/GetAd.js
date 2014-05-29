(function(window) {
    
    var debugCnt = 0;
    
    function debugLog(s) {
	debugCnt ++;
	console.log('' + debugCnt + ": " + s);
    }
    
    debugLog("Entering GetAd view.");

    function wbAlert(s) {
      navigator.notification.alert(s, function(){});
      console.log(s);
    }

    function ggDebug(s) {
      alertCnt++;
      wbAlert('' + alertCnt + '. ' + s);
    };


  app.GetAd = function() {
      debugLog("In app.GetAd");
      $(".pageGetAd").css("display", "block");
      app.GetAd.init();
      return app.GetAd.Content;
  }

  app.GetAd.Content = $(".pageGetAd");
  app.GetAd.Options = {};
  app.GetAd.Options.socket = null;
  app.GetAd.initiated = false;

  app.GetAd.init = function() {
      debugLog("In app.getAd.init()");
      app.GetAd.initiated = true;

    app.GetAd.Options = {};

    function fetchSavedFlyers() {
	var flyersStr = window.localStorage.getItem("flyers");
	var flyersArr = [];
	if (flyersStr) {
	    flyersArr = flyersStr.split(",");
	}  
	//	debugLog("XXX fetchSavedFlyers(): Fetched flyers: " + flyersStr + " (" + flyersArr.length + ")");
	return flyersArr;
    }

    function refreshSavedFlyers() {
	$('#savedFlyersOuterDiv').empty();
	var flyersArr = fetchSavedFlyers();
	//	debugLog("XXX refreshSavedFlyers(): Found " + flyersArr.length + " saved flyers");
	for (var i = 0; i < flyersArr.length; i++) {
	    var flyerId = flyersArr[i];
	    //	    debugLog("XXX refreshSavedFlyers(): Flyer ID " + flyerId);
	    try {
		var flyerKey = "flyerJson_"+flyerId;
		var flyerJsonStr = window.localStorage.getItem(flyerKey);
		// debugLog("XXX refreshSavedFlyers(): Fetched " + flyerKey +": " + flyerJsonStr);
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
		debugLog("Writing " + html);
		$(html).appendTo('#savedFlyersOuterDiv');
	    } catch (ex) {
		debugLog("XXX refreshSavedFlyers(): Error: " + ex);
		// do nothing
	    }
	}
    }
   
    $(".pageGetAd").css("display", "block");
    app.GetAd.Content = $(".pageGetAd");
    $('#serverMsg').html("");
    
    // TODO????
    $('#idGetAdArrowUp').css("display", "none");
    
    function clearDivDraggedFlyer() {
	$('#divDraggedFlyer').empty();
	$('<div id="divDraggedFlyerImg"></div>').appendTo('#divDraggedFlyer');
	$('<div id="divButtons"></div>').appendTo('#divDraggedFlyer');
    }
    
    clearDivDraggedFlyer();

    function onConnect() {
	// Step 9.
	if (app.GetAd.Options.socket) {
	    if (app.GetAd.Options.socket.id) {
		debugLog("Connected: " + app.GetAd.Options.socket.id);     
	    } else {
		debugLog("Connected: " + app.GetAd.Options.socket);
	    }
	} else {
	    debugLog("Weird: " + app.GetAd.Options.socket);
	}
	app.GetAd.Options.socket.emit('phoneHi', { deviceId : device.uuid});
    }

    function onDisconnect() {
      $('#serverMsg').html("Disconnected");
      app.GetAd.Options.socket = null;
    }

    // Step 13.
    function onOops(data) {
	var msg = data.msg;
        wbAlert(msg);
	$('#serverMsg').html(msg);
    }      

    function disconnect() {
	debugLog("Disconnecting.");
	if (app.GetAd.Options.socket) {
	    try {
		app.GetAd.Options.socket.disconnect();
	    } catch (ex) {
		debugLog("Error disconnecting: " + ex);
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
      debugLog("Connecting to " + data[0] + ".");
      $('#serverMsg').html("Connecting to " + data[0] + ".");
      app.GetAd.Options.socket.emit('phoneConnectTo', {boardName : data[0]});
    }
    
    function onGetAd(data) {
      var flyerId = data.flyerId;
      var flyerHtml = data.flyerHtml;
      var flyerJsonStr = data.flyerJson;
      debugLog("Received " + data.flyerId);
      var flyerJson = JSON.parse(flyerJsonStr);
      debugLog("Parsed JSON: " + flyerJson.titleArea.title);
      // Step 27.
      
      var imgSrc = "";
      // Modify the URL to point to main...
      if (flyerJson.mediaArea.length > 0) {
	  flyerJson.mediaArea[0] = flyerJson.mediaArea[0].replace("localhost/images","ads.wildboard.net/images/demo");
	  imgSrc = flyerJson.mediaArea[0];
      }

      flyerJsonStr = JSON.stringify(flyerJson);

      var html = "<img height=\"120\" width=\"160\" src=\"" + imgSrc + "\"></img>";

      // debugLog("XXX: Setting html to " + html);

      $('#divDraggedFlyerImg').html(html);
      var btnKeep = $('<input type="button" id="buttonKeep" value="Keep"></button>');
      var btnDiscard = $('<input type="button" id="buttonDiscard" value="Discard"></button>');

      //      debugLog("XXX: " + $('#divDraggedFlyer').html());
      //      debugLog("XXX: Attaching click to " + btnKeep);

      btnKeep.on('click', 
			     function() {
		                 var flyerKey = "flyerJson_" + flyerId;
				 window.localStorage.setItem(flyerKey, flyerJsonStr);
				 debugLog("XXX: Setting " + flyerKey + " to " + flyerJsonStr);
				 var savedFlyersArr = fetchSavedFlyers();
				 
				 savedFlyersArr.push(flyerId);
				 var savedFlyersStr = savedFlyersArr.join();
				 debugLog("XXX: New savedFlyersStr: " + savedFlyersStr + " (" + savedFlyersArr.length + ")");
				 window.localStorage.setItem("flyers", savedFlyersStr);
				 refreshSavedFlyers();
				 clearDivDraggedFlyer();
			     });
      
      btnDiscard.on('click', 
		    function() {
			refreshSavedFlyers();
			clearDivDraggedFlyer();
		    });

      //      debugLog("XXX: Showing buttons.");
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
    
    if (app.GetAd.Options.socket) {
	debugLog("I see app.GetAd.Options.socket = " + app.GetAd.Options.socket);
    } else {
	debugLog("No app.GetAd.Options.socket, connecting.");
	try {
	    // Step 7.
	    app.GetAd.Options.socket = io.connect('http://ads.wildboard.net:8888');
	} catch (ex) {
	    // Step 8.
	    wbAlert("Cannot establish connection");
	    $('#serverMsg').html("No connection.");
	    return;
	}
    } 

    app.GetAd.Options.socket.on('connect', onConnect);
    app.GetAd.Options.socket.on('toPhoneOops', onOops);
    app.GetAd.Options.socket.on('toPhoneWelcome', onWelcome);
    app.GetAd.Options.socket.on('toPhoneYourColorIs', onYourColorIs);
    app.GetAd.Options.socket.on('toPhoneGetAd', onGetAd);
    app.GetAd.Options.socket.on('disconnect', onDisconnect);
      refreshSavedFlyers();
    
  }
})(window);
