var timerApp = (function () {
	'use strict;'

	// Variables.
	var timer, countdown;

	// Public APIs
	var publicAPIs = {};

	/**
	 * Stop timer.
	 */
	var stopTimer = function () {
		window.clearInterval( countdown );
	};

	/**
	 * Reset timer.
	 */
	var resetTimer = function () {
		timer.setData( { time: 1500 } );
	};

	/**
	 * Start timer.
	 */
	var startTimer = function () {

		// If the timer is at 0, reset it.
		if ( timer.getData().time === 0 ) {
			resetTimer();
		}

		// Countdown to extinction.
		countdown = window.setInterval(function () {

			// Update the timer.
			var newTime = timer.getData().time - 1;
			timer.setData( {time: newTime} );

			// If the timer reaches zero, stop.
			if ( newTime === 0 ) {
				stopTimer();
			}

		}, 1000);
	};

	/**
	 * Listen timer clicks.
	 *
	 * @param {Object} event
	 */
	var clickHandler = function ( event ) {

		// Bail if data button is not clicked.
		var clickedData = event.target.getAttribute( 'data-click' );
		if ( ! clickedData ) {
			return;
		}

		if ( clickedData === 'start' ) {
			startTimer();
		}

		if ( clickedData === 'stop' ) {
			stopTimer();
		}

		if ( clickedData === 'reset' ) {
			resetTimer();
		}

	};

	/**
	 * Public API.
	 */
	publicAPIs.init = function () {

		// Set base template.
		var app = new Reef( '#app', {
			template: '<p id="timer"></p>' +
			'<p><button data-click="start">Start</button>' +
			'<button data-click="stop">Stop</button>' +
			'<button data-click="reset">Reset</button></p>'
		} );

		app.render();

		// Set timer template.
		timer = new Reef( '#timer', {
			data: {
				time: 1500 // 60 * 25.
			},
			template: function ( props ) {
				return parseInt( props.time / 60, 10 ).toString() + ':' + ( props.time % 60 ).toString().padStart( 2, '0' );
			}
		} );

		timer.render();

		// Listen for timer clicks.
		document.addEventListener( 'click', clickHandler, false );
    };

    return publicAPIs;
})();

// Init the App.
timerApp.init();
