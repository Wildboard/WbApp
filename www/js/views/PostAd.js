(function(window) {
    wbDebugLog("Entering PostAd view.");
    
    app.PostAd = function() {
	$(".page1").css("display", "block");
	$(".pageGetAd").css("display", "none");
	wbDebugLog("app.PostAd.initiated: " + app.PostAd.initiated);
	if (!app.PostAd.initiated) {
	    app.PostAd.init();
	}
	return app.PostAd.Content;
    }

    app.PostAd.Content = $(".page1");
    app.PostAd.Options = {}
    app.PostAd.initiated = false;
    app.PostAd.init = function() {
	wbDebugLog("In app.PostAd.init()");
	// We are creating this here because in case of data URI submission we have to 
	// go through several callbacks. 
	var fuOptions;
	
	    // Constant
	    var DATA_URI_PREFIX = "data:image/jpeg;base64,";
	    var PLACEHOLDER_IMAGE = "./img/placeholder.gif";

	    // Submission started
	    var selectorInProgress = false;

	    var inProgressDialog = null;
	    app.PostAd.initiated = true;
	    app.PostAd.Options = {};

	    // $('<div class="page page2">MAIN VIEW PAGE</div>')
	    $(".page1").css("display", "block");
	    app.PostAd.Content = $(".page1");
		
		//console.log("localStorage "+window.localStorage.getItem("name"))
		if(window.localStorage.getItem("name")){
		    $("#name").val(window.localStorage.getItem("name"));
		}
		if(window.localStorage.getItem("email")){
		    $("#email").val(window.localStorage.getItem("email"));
		}

		if(window.localStorage.getItem("phone")){
		    $("#phone").val(window.localStorage.getItem("phone"));
		}
		if(window.localStorage.getItem("website")){
		    $("#website").val(window.localStorage.getItem("website"));
		}
		if(window.localStorage.getItem("address")){
		    $("#address").val(window.localStorage.getItem("address"));
		}

		
		$('#datetimepicker_start').datetimepicker();
		$('#datetimepicker_end').datetimepicker();

		$('#datetimepicker_start').click(function() {
			$('#datetimepicker_start').datetimepicker('show');
		});
		$('#datetimepicker_end').click(function() {
			console.log("datetimepicker_start click")
			$('#datetimepicker_end').datetimepicker('show');
		});

		$('#datetimepicker_start').datetimepicker({
			onChangeDateTime : function(dp, $input) {
				$('#datetimepicker_start').text($input.val())
			}
		});
		$('#datetimepicker_end').datetimepicker({
			onChangeDateTime : function(dp, $input) {
				$('#datetimepicker_end').text($input.val())
			}
		});

		$('#events').live('change', function() {
			if ($(this).is(':checked')) {
				$('.eventsOptions').css('display', 'block')
				// window.viewNavigator.refreshScroller()
			} else {
				$('.eventsOptions').css('display', 'none')
				$('#datetimepicker_start').datetimepicker('hide');
				$('#datetimepicker_end').datetimepicker('hide');
				// window.viewNavigator.refreshScroller()
			}
		});


		/*
		  // Sometimes you want to type information that was in the image
		  // so temproarily you may want to show the image in larger size
		  // this is that logic sort of
		$("#base64image").unbind("touchstart");
		$("#base64image").bind("touchstart", function(event) {
		    var imgLarge = document.getElementById('imgLargeDiv');
		    imgLarge.style.display = 'block';
                    imgLarge.style.visibility = 'visible';
	        });

		$("#imgLargeDiv").unbind("touchend");
		$("#imgLarge").bind("touchend", function(event) {
		    var imgLarge = document.getElementById('imgLargeDiv');
		    imgLarge.style.display = 'none';
		    imgLarge.style.visibility = 'hidden';
	        });
		*/

		var destType = navigator.camera.DestinationType.FILE_URI;
		if (device.platform == 'Android') {
		    destType = navigator.camera.DestinationType.DATA_URL;
		}

		$(".selectImage").unbind("touchstart");
		$(".selectImage").bind("touchstart", function(event) {
			navigator.camera.getPicture(onGetPictureData, onSubmitFail, {
				quality : 100,
			        encodingType: Camera.EncodingType.JPEG,
			    //	destinationType : navigator.camera.DestinationType.FILE_URI,
				destinationType : destType,
				    sourceType : navigator.camera.PictureSourceType.PHOTOLIBRARY,
				    //     sourceType : navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
          			allowEdit: true,
				correctOrientation : true
			    });

			event.preventDefault();
			event.stopPropagation();
		    });

		
		$(".takeImage").unbind("touchstart");
		$(".takeImage").bind("touchstart", function(event) {
			navigator.camera.getPicture(onGetPictureFile, onSubmitFail, {
				quality : 100,
			        encodingType: Camera.EncodingType.JPEG,
  			        allowEdit : true,
				destinationType : navigator.camera.DestinationType.FILE_URI,
  			        sourceType : navigator.camera.PictureSourceType.CAMERA,
				correctOrientation : true
			})
			event.preventDefault();
			event.stopPropagation();
		    });

		$(".submitAd").unbind("touchstart");
		$(".submitAd").bind("touchstart", startSubmitAd);

		function startSubmitAd() {
		    var params = constructParams();
		    if (params == null) {
			navigator.notification.alert("Please fill out all required fields.");
			$(".info").css("display", "block");
			return;
		    } 

		    if (!app.PostAd.Options.file) {
			ggDebug("No image!");
			return;
		    }

		    if (selectorInProgress) {
			navigator.notification.alert("Ad submission in progress...");
			return;
		    }

		    $('#progressBarDiv').show();
		    $('#progressBar').css('backround-color', '#0000ff');
		    $('#progressBar').css('width', '5%');
		    //		    $('#progressBarDiv').progressbar({value:1});
		    selectorInProgress = true;
		    $(".info").css("display", "none");
		    submitAd(params);
		}

	    function pb(yn) {
		if (yn) {
		    $('#progressBar').css('display','inline');
		} else {
		    $('#progressBarDiv').css('display','none');
		}
	    }

                function setImage(uri) {
                    var image = document.getElementById('base64image');
		    image.style.display = 'block';
 		    image.src = uri;
		    app.PostAd.Options.file = uri;
		    var imgLarge = document.getElementById('imgLarge');
		    imgLarge.src = uri;

		    /*
		     navigator.camera.cleanup(
			 function(x){	
  		         ggDebug("Cleanup OK: " +  x);
		 }, 
		 function(x){
		     ggDebug("Cleanup error: " + x);
		 });
		    */
		}

		

		function onGetPictureFile(uri) {
		    setImage(uri);
		}

		function onGetPictureData(data) {
		    var uri = DATA_URI_PREFIX + data;
		    setImage(uri);
		}

		function constructParams() {
			if ($("#title").val() != ""
					&& $(".page input:checked").val() != undefined
					&& $("#description").val() != "" && $("#name").val() != ""
					&& $("#email").val() != "") {
				var params = new Object();
				params.title = $("#title").val()
				params.name = $("#name").val()
				params.email = $("#email").val()
				params.category = $(".page input:checked").val()
				params.description = $("#description").val();

				params.address = $('#address').val();
				params.website = $('#website').val();
				params.phone  = $('#phone').val();
				params.price = $('#price').val();
				//console.log("localStorage "+window.localStorage.getItem("name"))

				window.localStorage.setItem("name", params.name);
				window.localStorage.setItem("email", params.email);

				window.localStorage.setItem("phone", params.phone);
				window.localStorage.setItem("address", params.address);
				window.localStorage.setItem("website", params.website);

				return params;
			} else {
			    return null;
			}

			// $(".page input:checked").val();
			// $("#description").val()
		}

		function toStr(o) {
		    var out = '';
		    for (var p in o) {
			out += p + ': ' + o[p] + '\n';
		    }
		    return out;
		}

	    var tmpFileEntry;
	
	    function onGotFileEntry(fe) {
		tmpFileEntry = fe;
		fe.createWriter(onGotFileWriter, onFsFail);
	    }
	    
	    function onGotFs(fs) {
		var fname = fuOptions.fileName;
		var fileOpts = {};
		fileOpts.create = true;
		fileOpts.exclusive = false;
		fs.root.getFile(fname, fileOpts, onGotFileEntry, onFsFail);
	    }

	    function onWriteEnd(evt) {
		var ft = new FileTransfer();
		//		ggDebug("Uploading ad...");
		ft.onprogress = onSubmitProgress;
		ft.upload(app.PostAd.Options.file,
			  encodeURI("http://ads.wildboard.net/post-new-app.html"),
			  onSubmitSuccess, onSubmitFail, fuOptions);
	    }
	    

	    function onGotFileWriter(writer) {
		// ggDebug("Writing to " + tmpFileEntry.name + ": " + app.PostAd.Options.file.substring(0,10));
		writer.onwriteend = onWriteEnd;
		writer.write(app.PostAd.Options.file);
		app.PostAd.Options.file = tmpFileEntry.toURL();
	    }

	    function submitAd(params) {
		fuOptions = new FileUploadOptions();
		fuOptions.fileKey = "image0";
	
		var image = document.getElementById('base64image');
		var imgSrc = image.src;
		if (!imgSrc) { 
		    imgSrc = PLACEHOLDER_IMAGE;
		    ggDebug("No image.");
		    return;
		}
		
		if (imgSrc.substring(0,DATA_URI_PREFIX.length) == DATA_URI_PREFIX) {
		    app.PostAd.Options.file = imgSrc.substring(DATA_URI_PREFIX.length);
		    params.wb_base64 = "true";
		    fuOptions.fileName = "wbimage_" + Math.floor((Math.random()*1000000)+1);
		    fuOptions.params = params;
		    var askForSize = app.PostAd.Options.file.length*2;
		    //		    ggDebug("Asking for "+ askForSize + " bytes");
		    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, onGotFs, onFsFail);
		} else {
		    
		    fuOptions.fileName = app.PostAd.Options.file.substr(app.PostAd.Options.file.lastIndexOf('/') + 1);
		    fuOptions.params = params;
		    var ft = new FileTransfer();
		    // ggDebug("submitAd: calling ft.upload("+toStr(fuOptions) + " ********************************* " + toStr(params) + ")");
		    // ggDebug("Uploading ad.");
		    
		    ft.onprogress = onSubmitProgress;
		    ft.upload(app.PostAd.Options.file,
			      encodeURI("http://ads.wildboard.net/post-new-app.html"),
			      onSubmitSuccess, onSubmitFail, fuOptions);
		}
	    }

	    function onSubmitProgress(progressEvent) {
		//ggDebug("Progress event: " + toStr(progressEvent) + "; inProgressDialog: " +inProgressDialog);
		if (selectorInProgress) {
		    if (progressEvent.lengthComputable)  {
			var perc =    Math.round( (progressEvent.loaded / progressEvent.total) * 100 );
			if (perc > 90) {
			    perc = perc - 3;
			}
			$('#progressBar').css('width', perc + '%');
		    } else {
			var curW = $('#progressBar').css('width');
			curW = curW.replace('%','');
			if (Math.round(Math.floor())) {
			    curW = curW + 5;
			} else {
			    curW = curW - 5;
			}
			$('#progressBar').css('width', curW + '%');
		    }
		    //		    ggDebug("TESTING: " + $('#progressBarDiv').html());
		} else {
		    //		    ggAlert("Weird, no in progress dialog!");
		}
	    }

	    function onSubmitSuccess(r) {
		submissionDone(1);
		navigator.notification.alert("Your ad has been posted and is pending review. " + r.bytesSent 
					     + " bytes sent; status: " + r.responseCode);
		
	    }

	    function submissionDone(ok) {
		selectorInProgress = false;

		if (ok) {
		    $('#progressBar').css('width', '100%');
		} else {
		    $('#progressBar').css('width', '0%');
		}
		$('#progressBarDiv').hide();
	    }		
	    
	    function onFsFail(error) {
		submissionDone(0);
		var msg = "Error " + error.code + " creating temp file: ";
		switch (error.code) {
		case FileError.NOT_FOUND_ERR:
		    msg = "File not found";
		    break;
		case FileError.SECURITY_ERR:
		    msg = "Security error";
		    break;
		case FileError.ABORT_ERR:
		    msg = "Aborted";
		    break;
		case FileError.NOT_READABLE_ERR:
		    msg = "Not readable";
		    break;
		case FileError.ENCODING_ERR:
		    msg = "Encoding error";
		    break;
		case FileError.NO_MODIFICATION_ALLOWED_ERR:
		    msg = "No modification allowed";
		    break;
		case FileError.INVALID_STATE_ERR:
		    msg = "Invalid state";
		    break;
		case FileError.SYNTAX_ERR:
		    msg = "Syntax error";
		    break;
		case FileError.INVALID_MODIFICATION_ERR:
		    msg = "Invalid notification";
		    break;
		case FileError.QUOTA_EXCEEDED_ERR:
		    msg = "Quota exceeded";
		    break;
		case FileError.TYPE_MISMATCH_ERR:
		    msg = "Type mismatch";
		    break;
		case FileError.PATH_EXISTS_ERR:
		    msg = "Path exists";
		    break;
		default:
		    msg = "Unknown";
		}
		navigator.notification.alert(msg);
	    }		

	    function onSubmitFail(error) {
		submissionDone(0);
		var msg = "Error uploading image " + error.code + ": ";
		switch (error.code) {
		case FileTransferError.FILE_NOT_FOUND_ERR:
		    msg = "File not found";
		    break;
		case FileTransferError.INVALID_URL_ERR:
		    msg = "Invalid URL";
		    break;
		case FileTransferError.CONNECTION_ERR:
		    msg = "Connection error";
		    break;
		case FileTransferError.ABORT_ERR:
		    msg  = "Aborted";
		    break;
		default:
		    msg = "Unknown error";
		}
		navigator.notification.alert(msg);
	    }

		
	}
})(window);