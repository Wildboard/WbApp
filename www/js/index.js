/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	history : [],
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		app.receivedEvent('deviceready');
	},
	// Update DOM on a Received Event
	receivedEvent : function(id) {
		console.log("[wildboard] ", id)
		var parentElement = document.getElementById(id);

		parentElement.setAttribute('style', 'display:none;');
		document.getElementById('top').setAttribute('style', 'display:block;');
		document.getElementById('menu').setAttribute('style', 'display:block;');

		console.log('[wildboard] Received Event: ' + id);
		// window.viewNavigator = new ViewNavigator('body');
		app.Menu();

		function isTouchDevice() {
			try {
				document.createEvent("TouchEvent");
				return true;
			} catch (e) {
				return false;
			}
		}
		function touchScroll(id) {
			if (isTouchDevice()) { // if touch events exist...
				var el = document.getElementById(id);
				var scrollStartPos = 0;

				document.getElementById(id).addEventListener(
						"touchstart",
						function(event) {
							scrollStartPos = this.scrollTop
									+ event.touches[0].pageY;
							// event.preventDefault();
							event.stopPropagation();
						}, false);

				document.getElementById(id).addEventListener(
						"touchmove",
						function(event) {
							this.scrollTop = scrollStartPos
									- event.touches[0].pageY;
							// event.preventDefault();
							event.stopPropagation();
						}, false);

				document.getElementById(id).addEventListener("touchend",
						function(event) {
							// event.preventDefault();
							event.stopPropagation();
							return false;
						}, false);

			}
		}
		touchScroll("content");
		document.addEventListener("showkeyboard", function() {
			// alert("Keyboard is ON");
		}, false);
		document.addEventListener("hidekeyboard", function() {
			// alert("Keyboard is OFF");
		}, false);
		window.addEventListener("orientationchange", function(e) {

			setTimeout(function() {
				console.log("[wildboard] @@@@ orientation " + window.outerWidth
						+ ", " + window.outerHeight)

				console.log("window.orientation " + window.orientation)

				var space = $(window).outerHeight() - $('#menu').outerHeight()
				$('.pages').css('height', space + "px")
				$("#contentRoot").css('height', (space - 48) + "px")
				$("#fakeContent").css('height', (space - 48) + "px")
				$("#content").css('height', (space - 48) + "px")

			}, 100);

		})
	}

};
