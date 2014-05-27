(function(window) {
    console.log("Entering GetAd view.");

    function wbAlert(s) {
      navigator.notification.alert(s, function(){});
      console.log(s);
    }

    function ggDebug(s) {
      alertCnt++;
      wbAlert('' + alertCnt + '. ' + s);
    };


  app.GetAd = function() {
    $(".pageGetAd").css("display", "block");
    app.GetAd.init();
    return app.GetAd.Content;
  }

  app.GetAd.Content = $(".pageGetAd");
  app.GetAd.Options = {};
  app.GetAd.Options.socket = null;
  app.GetAd.initiated = false;

  app.GetAd.init = function() {

    app.GetAd.initiated = true;

    app.GetAd.Options = {};

    function fetchSavedFlyers() {
	var flyersStr = window.localStorage.getItem("flyers");
	var flyersArr = [];
	if (flyersStr) {
	    flyersArr = flyersStr.split(",");
	}  
	return flyersArr;
    }

    function refreshSavedFlyers() {
	var flyersArr = fetchSavedFlyers();
	console.log("Fetched " + flyersArr.length + " saved flyers");
	for (var flyerId in flyersArr) {
	    console.log("Got " + flyerId);
	    try {
		var flyerJsonStr = window.localStorage.getItem("flyerJson_"+flyerId);
		var flyerJson = eval(flyerJsonStr);
		var imgSrc = flyerJson.mediaArea[0];
		var title = flyerJson.titleArea.title;
		var subtitle = "";
		for (var sub in flyerJson.titleArea.subtitle) { 
		    subtitle += sub + "<br/>\n";
		}
		var desc = flyerJson.bodyArea.description;
		var contact = "";
		for (var con in flyerJson.contactArea) {
		    contact += con.text + "<br/>\n";
		    // TODO type
		}
		var html = "<div id=\"divFlyer" + flyerId + "\">";
		html += "<h1>" + title + "</h1>";
		html += "<h2>" + subtitle + "</h2>";
		html += contact + "<br/>";
		html += "<img height=\"120\" width=\"160\" src=\"" + imgSrc + "\"></img>";
		html += "</div>";
		$('#savedFlyersOuterDiv').html(html);
	    } catch (ex) {
		// do nothing
	    }
	}
    }
   
    $(".pageGetAd").css("display", "block");
    app.GetAd.Content = $(".pageGetAd");
    $('#serverMsg').html("");
    
    // TODO????
    $('#idGetAdArrowUp').css("display", "none");
    $('#divDraggedFlyer').empty();

    function onConnect() {
	// Step 9.
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
	console.log("Disconnecting.");
	if (app.GetAd.Options.socket) {
	    try {
		app.GetAd.Options.socket.disconnect();
	    } catch (ex) {
		console.log("Error disconnecting: " + ex);
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
      wbAlert("Connecting to " + data[0]);
      app.GetAd.Options.socket.emit('phoneConnectTo', {boardName : data[0]});
    }
    
    function onGetAd(data) {
      var flyerId = data.flyerId;
      var flyerHtml = data.flyerHtml;
      var flyerJson = data.flyerJson;
      console.log("Received " + data.flyerId + "; saving.");
      console.log(data.flyerJson);
      // Step 27.

      // Modify the URL to point to main...
      flyerJson.mediaArea[0] = imgSrc.replace("localhost/images","ads.wildboard.net/images/demo");
      
      var imgSrc = flyerJson.mediaArea[0];

      var html = "<img height=\"120\" width=\"160\" src=\"" + imgSrc + "\"></img>";
      $('#divDraggedFlyerImg').html(html);
      $('<input type="button" id="buttonKeep" value="Keep"></button>').appendTo('#divButtonKeep');
      $('<input type="button" id="buttonDiscard" value="Discard"></button>').appendTo('#divButtonDiscard');

      $('#divButtonKeep').on('click', 
			     '#buttonKeep', 
			     function() {
				 window.localStorage.setItem("flyerJson_" + flyerId, flyerJson);
				 var savedFlyersArr = fetchSavedFlyers();
				 savedFlyersArr.push(flyerId);
				 var savedFlyersStr = savedFlyersArr.join();
				 window.localStorage.setItem("flyers", savedFlyersStr);
				 refreshSavedFlyers();
				 $('#divDraggedFlyer').empty();
			     });
      
      $('#divButtonDiscard').on('click', 
				'#buttonDiscard', 
				function() {
				    refreshSavedFlyers();
				    $('#divDraggedFlyer').empty();
				});
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
    if (!app.GetAd.Options.socket) {
	try {
	    // Step 7.
	    console.log("Trying to connect");
	    app.GetAd.Options.socket = io.connect('http://ads.wildboard.net:8888');
	    console.log("Connected: " + app.GetAd.Options.socket.id);
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
    
  }
})(window);
