var saveFormData = (function () {
	'use strict;'

	var form = document.querySelector( '#save-me' );

	// Public APIs
	var publicAPIs = {};

	/**
	 * Public API.
	 */
	publicAPIs.init = function () {

		// Bail if there is no form.
		if ( ! form ) {
			return;
		}

		/**
		 * Get form data from localStorage.
		 */
		var getformData = function () {
			var savedData = localStorage.getItem( 'saveFormData');
			return savedData ? JSON.parse( savedData ) : {};
		}

		/**
		 * Listen form changes and save data.
		 *
		 * @param {object} e Event handler.
		 */
		var listenForm = function ( e ) {
			// Get saved data from localStorage.
			var savedDataForm = getformData();

			// Set form data name as key, and value as value.
			var key = e.target.name;
			var value = e.target.value;

			// Save data.
			if ( e.target.type === 'checkbox' ) {
				savedDataForm[key] = e.target.checked === true ? 'on' : 'off';
			} else {
				savedDataForm[key] = value;
			}

			console.log( savedDataForm );

			// Save data to localStorage.
			localStorage.setItem( 'saveFormData', JSON.stringify( savedDataForm ) );
		}

		/**
		 * Populate form.
		 */
		var populateForm = function () {
			// Get saved data from localStorage.
			var savedDataForm = getformData();

			// Get all form fields.
			var fields = form.elements;

			// Loop over each field in the form and load any saved data.
			Array.from( fields ).forEach( function ( field ) {
				if ( savedDataForm[ field.name ] ) {
					if ( field.type === 'checkbox' ) {
						savedDataForm[ field.name ] === 'on' ? field.checked = true : field.checked = false;
					} else if ( field.type === 'radio' ) {
						savedDataForm[ field.name ] === field.value ? field.checked = true : field.checked = false;
					} else {
						field.value = savedDataForm[ field.name ];
					}
				}
			} );
		}

		/**
		 * Clear data on submit.
		 */
		var submitHandler = function () {
			localStorage.removeItem( 'saveFormData' );
		}

		// Listen form in real time.
		form.addEventListener( 'input', listenForm, false );

		// Listen page load.
		window.addEventListener( 'load', populateForm, false );

		// Listen form submit.
		form.addEventListener( 'submit', submitHandler, false );
    };

    return publicAPIs;
})();

// Init the App.
saveFormData.init();
