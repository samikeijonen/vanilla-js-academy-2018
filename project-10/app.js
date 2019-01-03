var cachedArticles = (function () {
    'use strict;'

	// Public APIs
	var publicAPIs = {};
	var settings;

	// Defaults
	var defaults = {
		selectorApp: '#app',
	};

	/**
	 * Dynamically vary the API endpoint
	 * @return {String} The API endpoint
	 */
	var getEndpoint = function () {
		var endpoint = 'https://vanillajsacademy.com/api/';
		var random = Math.random();
		if (random < 0.3) return endpoint + 'pirates.json';
		if (random < 0.6) return endpoint + 'pirates2.json';
		return endpoint + 'fail.json';
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
		var merge = function ( obj ) {
			for ( var prop in obj ) {
				if ( obj.hasOwnProperty( prop ) ) {
					extended[prop] = obj[prop];
				}
			}
		};

		// Loop through each object and conduct a merge
		for ( var i = 0; i < arguments.length; i++ ) {
			merge(arguments[i]);
		}

		return extended;
	};

	/**
	 * Get cached articles from localStorage.
	 *
	 * @return {Object} The cached articles.
	 */
	var getCachedArticles = function () {
		var cached = localStorage.getItem( 'savedArticles' );

		if ( ! cached ) {
			return;
		}

		return JSON.parse( cached );
	};

	/**
	 * Render failure message.
	 *
	 * @param {Object} app
	 * @param {Object} data
	 */
	var renderFailure = function( app, data ) {
		// Get data from localStorage.
		var savedArticles = getCachedArticles();

		// Check if there is data.
		if ( savedArticles ) {
			// There is already data, use it to render articles markup.
			renderArticles( app, savedArticles.data.articles );
		} else {
			app.textContent = 'Something went wrong. Try again?';
		}
	};

	/**
	 * Make XHR request to API.
	 *
	 * @param {String}   url     The URL to make the request to
	 * @param {String}   method  API method (GET, POST)
	 * @param {Function} success Callback when successful
	 * @param {Function} error   Callback when error
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
	 * Check if the cached data is still valid.
	 *
	 * @param {Object} saved Cached and saved data.
	 * @return {Boolean}     Returns true if it's still valid
	 */
	var isDataValid = function ( saved ) {

		// Check that there's data, and a timestamp key.
		if ( ! saved || ! saved.data || ! saved.timestamp ) {
			return false;
		}

		// Get the difference between the timestamp and current time.
		var difference = new Date().getTime() - saved.timestamp;

		// Convert the difference into hours.
		var oneHour = 1000 * 60 * 60;
		var convertedTime = difference / oneHour;

		// Check if it's been less than an hour.
		if ( convertedTime < 1 ) {
			return true;
		}

		// Return false in all other cases.
		return false;

	};

	/**
	 * Sanitize and encode all HTML in a user-submitted string
	 * @param  {String} str The user-submitted string
	 * @return {String} str The sanitized string
	 */
	var sanitizeHTML = function ( str ) {
		var temp = document.createElement( 'div' );
		temp.textContent = str;
		return temp.innerHTML;
	};

	/**
	 * Render articles markup.
	 *
	 * @param {Object} app      Where to output data.
	 * @param {Object} articles Articles data.
	 */
	var renderArticles = function ( app, articles ) {
		articles.forEach( function ( article ) {
			app.innerHTML +=
			'<article class="entry">' +
				'<p class="entry__byline">Written by '  + sanitizeHTML( article.author )  + '. Published ' + sanitizeHTML( article.pubdate ) + '</p>'  +
				'<h2 class="entry__title">'  + sanitizeHTML( article.title ) + '</h2>' +
				'<p class="entry__summary">' + sanitizeHTML( article.article ) + '</p>'  +
			'</article>';
		} );
	};

	/**
	 * Public API.
	 */
	publicAPIs.init = function ( options ) {

		// Merge options into defaults.
		settings = extend( defaults, options || {} );

		// App element.
		var app = document.querySelector( settings.selectorApp );

		if ( ! app ) {
			return;
		}

		// Get data from localStorage.
		var savedArticles = getCachedArticles();

		// Check its validity.
		if ( isDataValid( savedArticles ) ) {
			// The data is still good, use it to render articles markup.
			renderArticles( app, savedArticles.data.articles );
		} else {
			// Get fresh data and use that instead.

			// Get URL.
			var url = getEndpoint();

			// Make request to articles API.
			makeRequest( url, 'GET',
				// Success function.
				function ( data ) {

					data = JSON.parse( data.responseText );
					console.log( data );
					console.log( data.articles );
					var articles = data.articles;

					// Setup the localStorage data.
					var saved = {
						data: data,
						timestamp: new Date().getTime()
					};

					// Save articles to localStorage.
					localStorage.setItem( 'savedArticles', JSON.stringify( saved ) );

					// Render articles markup.
					renderArticles( app, articles );
				},
				// Failure function.
				function ( data ) {
					renderFailure( app, data );
				}
			);
		}
    };

    return publicAPIs;
})();

// Init the App.
cachedArticles.init();
