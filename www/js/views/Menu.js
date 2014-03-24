(function(window) {
	console.log("[wildboard] Menu View");
	app.Menu = function() {
		app.Menu.init();

	}
	app.Menu.Content = $("#menu");
	app.Menu.init = function() {
		var space=$(window).outerHeight()-$('#menu').outerHeight()
		$('.pages').css('height',space+"px")
		$("#contentRoot").css('height',(space-48)+"px")
		$("#fakeContent").css('height',(space-48)+"px")
		$("#content").css('height',(space-48)+"px")
		$('.backButton').bind(
				"click",
				function() {
					console.log("[wildboard] you pressed back, go back to :",
							app.history[app.history.length - 1]);
					app.history.pop()
					window.viewNavigator
							.goBack(app.history[app.history.length - 1]);

				});
		$('.postAd').bind("click", function(event) {
			console.log("[wildboard] PostAd CLICK: ");
			var navView = app.getViewObject("PostAd");
			app.deleteHistory();
			app.updateHistory(navView);
			event.preventDefault();
			event.stopPropagation();
		//	window.viewNavigator.pushView(navView);
		});
	}
})(window)