var weatherApp = (function () {
    'use strict;'

    // Public APIs
	var publicAPIs = {};
	var settings;

   // Defaults
   var defaults = {
		selectorApp: '#app',
		apiKey: '',
		showFahrenheit: false,
		showIcon: true,
		message: function ( temp, desc, city ) {
			return 'It is currently ' + getTemp( temp ) + ' in ' + city + ', ' + desc + '.';
		}
	};

	/**
     * Merge two or more objects together.
     * @param   {Object}   objects  The objects to merge together
     * @returns {Object}            Merged values of defaults and options
     */
    var extend = function () {
        // Variables
        var extended = {};

        // Merge the object into the extended object
        var merge = function (obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    extended[prop] = obj[prop];
                }
            }
        };

        // Loop through each object and conduct a merge
        for (var i = 0; i < arguments.length; i++) {
            merge(arguments[i]);
        }

        return extended;
    };

	/**
	 * Show temperature using Celcius or Farenheits.
	 *
	 * @return number
	 */
	var getTemp = function ( temp ) {
		// Return Celcius.
		if ( ! settings.showFahrenheit ) {
			return temp + '&#8451;';
		}

		// Return Farenheits.
		return Math.round( (temp * 9/5) + 32 ) + '&#8457;';
	};

	/**
	 * Convert the response text into JSON.
	 *
	 * @param {Object} data
	 */
	var renderFailure = function( data ) {
		// App element.
		var app = document.querySelector( settings.selectorApp );

		if ( ! app ) {
			return;
		}

		app.textContent = 'Something went wrong. Try again?';
	};

	/**
	 * Make XHR request to API.
	 */
	var makeRequest = function ( url, method, success, error ) {
		// Make sure a URL and method were provided
		if ( ! url || ! method ) {
			return;
		}

		// Set up our HTTP request
		var xhr = new XMLHttpRequest();

		// Setup our listener to process request state changes
		xhr.onreadystatechange = function () {
			// Only run if the request is complete
			if ( xhr.readyState !== xhr.DONE ) {
				return;
			}

			// Process our return data
			if ( xhr.status >= 200 && xhr.status < 300 ) {
				// Run the success callback.
				if ( success && typeof success === 'function' ) {
					success( xhr );
				}
			} else {
				// Run the error callback.
				if ( error && typeof error === 'function' ) {
					error( xhr );
				}
			}
		};

		// Create and send a request
		// Defaults to GET
		xhr.open( method, url );
		xhr.send();
	};

	/**
	 * Sanitize and encode all HTML in a user-submitted string
	 * @param  {String} str  The user-submitted string
	 * @return {String} str  The sanitized string
	 */
	var sanitizeHTML = function ( str ) {
		var temp = document.createElement('div');
		temp.textContent = str;
		return temp.innerHTML;
	};

	/**
	 * Public API.
	 */
    publicAPIs.init = function ( options ) {

		// Merge options into defaults.
		settings = extend( defaults, options || {} );

		// Get location from ipapi.
		makeRequest( 'https://ipapi.co/json', 'GET',
			// Success function.
			function ( data ) {
				// App element.
				var app = document.querySelector( settings.selectorApp );

				if ( ! app ) {
					return;
				}

				data = JSON.parse( data.responseText );
				console.log( data );

				// Make request to weather API.
				makeRequest( 'https://api.weatherbit.io/v2.0/current?&lat=' + data.latitude + '&lon=' + data.longitude + '&key=' + settings.apiKey, 'GET',
					// Success function.
					function ( data ) {
						data = JSON.parse( data.responseText );
						console.log( data );
						// Render the weather.
						app.innerHTML = settings.message(
							sanitizeHTML( data.data[0].temp ),
							sanitizeHTML( data.data[0].weather.description ),
							sanitizeHTML( data.data[0].city_name ),
						);
					},
					// Failure function.
					function ( data ) {
						renderFailure();
					},

				);
			},
			// Failure function.
			function ( data ) {
				renderFailure();
			}
		);
    };

    return publicAPIs;
})();

// Init the App.
weatherApp.init({
	apiKey: 'efe2e0a3f4ea4f4d9e2363cbed694091'
});
