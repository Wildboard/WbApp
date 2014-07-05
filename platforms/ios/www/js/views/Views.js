(function(window) {
	console.log("wildboard]  views??");
	app.updateHistory = function(obj) {
		app.history.push(obj);
		// TODO make back button visible
	}
	app.deleteHistory = function(obj) {
		app.history=[]
		// TODO remove back button
	}
	app.createView = function(view) {
		switch (view) {
		case "ScanQR":
			console.log("ScanQR: ")
			app.ScanQR.init()
			app.ScanQR();
			break
		case "GetAd":
			console.log("GetAd: ")
			app.GetAd.init()
			app.GetAd();
			break
		}
	}
	// returns {} for viewNavigator
	app.getViewObject = function(view) {
	    //console.log("wildboard] get view : " + view);
		switch (view) {
		case "ScanQR":
			return {
				title : null,
				backLabel : null,
				view : app.ScanQR()
			};
			break
		case "PostAd":
			return {
				title : null,
				backLabel : null,
				view : app.PostAd()
			};
			break
		case "GetAd":
			return {
				title : null,
				backLabel : null,
				view : app.GetAd()
			};
			break
		}
	}
	// returns HTML Object
	app.getView = function(view) {
		console.log("get view : " + view);
		switch (view) {
		case "ScanQR":
			return app.ScanQR();
			break
		case "GetAd":
			return app.GetAd();
			break
		case "PostAd":
			return app.PostAd();
			break
		}
	}
})(window)