(function(window) {
  console.log("top: Get Ad");

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
    console.log("entered app.GetAd");
    //if (!app.GetAd.initiated) {
      app.GetAd.init();
      //}
    return app.GetAd.Content;
  }

  app.GetAd.Content = $(".pageGetAd");
  app.GetAd.Options = {}
  app.GetAd.initiated = false;
  app.GetAd.init = function() {
    var inProgressDialog = null;
    app.GetAd.initiated = true;
    app.GetAd.Options = {};
    var sess = Math.floor((Math.random()*1000000)+1);
    
    $(".pageGetAd").css("display", "block");
    app.GetAd.Content = $(".pageGetAd");
    

    var socket = io.connect('http://ads.wildboard.net:8888');
   
    function onConnect() {
      socket.emit('phoneHi', { deviceId : device.uuid});
    }


    function onDisconnect() {
      $('#serverMsg').html("Disconnected");
    }

    function onOops(data) {
      navigator.notification.alert(data.msg, function(){});
      console.log(data.msg);
    }      

    function onWelcome(data) {
      if (!data || !data.length) {
	wbAlert("No boards available");
	socket.disconnect()
	return;
      }
      wbAlert("Connecting to " + data[0]);
      socket.emit('phoneConnectTo', {boardName : data[0]});
    }
    
    function onGetAd(data) {
      var flyerId = data.flyerId;
      var flyerHtml = data.flyerHtml;
      console.log("Received " + data.flyerId);
      $('#serverMsg').html(flyerHtml);
    }
    
    
    function onYourColorIs(data) {
	var myColor = data.color;
	$('#serverMsg').html('<font color="' + 
			     myColor + 
			     '">Drag the flyer to the ' +
			     myColor +
			     ' area on the screen to get it on your phone.' +
			     '</font>');
    }
	
    
    // Events:
    // hi (client->server)
    // oops (server->client)
    // welcome (server->client)

    socket.on('connect', onConnect);
    socket.on('toPhoneOops', onOops);
    socket.on('toPhoneWelcome', onWelcome);
    socket.on('toPhoneYourColorIs', onYourColorIs);
    socket.on('toPhoneGetAd', onGetAd);
    socket.on('disconnect', onDisconnect);
    
    //function(){
    //			socket.on('event', function(data){});
    //			
    //		      });
    
    $("#base64image").unbind("touchstart");
    $("#base64image").bind("touchstart", function(event) {
			     var imgLarge = document.getElementById('imgLargeDiv');
			     imgLarge.style.display = 'block';
			     imgLarge.style.visibility = 'visible';
			   });
  }
})(window);
