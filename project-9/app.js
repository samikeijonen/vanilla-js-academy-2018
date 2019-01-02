var saveFormData = (function () {
	'use strict;'

	var form = document.querySelector( '#save-me' );
	var formData = {};

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

		var getformData = function () {
			var savedData = localStorage.getItem( 'saveFormData');
			return savedData ? JSON.parse( savedData ) : {};
		}

		var listenForm = function ( e ) {
			// Get saved data from localStorage.
			var savedDataForm = getformData();

			// Set form data name as key, and value as value.
			var key = e.target.name;
			var value = e.target.value;

			if ( e.target.type === 'checkbox' ) {
				savedDataForm[key] = e.target.checked === true ? 'on' : 'off';
			} else {
				savedDataForm[key] = value;
			}

			console.log( savedDataForm );

			// Save data to localStorage.
			localStorage.setItem( 'saveFormData', JSON.stringify( savedDataForm ) );
		}

		var populateForm = function () {
			// Get saved data from localStorage.
			var savedDataForm = getformData();

			var fields = form.elements;

			console.log( fields );

			// Check that we have data object.
			if ( savedDataForm ) {

				// Loop all keys and populate form fields.
				for ( var key in savedDataForm ) {
					if ( savedDataForm.hasOwnProperty( key) ) {
						//console.log( key, savedDataForm[key] );
						var formField = document.querySelector( '[name=' + key + ']' );

						if ( formField ) {
							console.log( formField.value, savedDataForm[key] );

							if ( formField.type === 'checkbox' ) {
								formField.value === 'on' ? formField.checked = true : formField.checked = false;
							} else if ( formField.type === 'radio' ) {
								if ( formField.value === savedDataForm[key] ) {
									formField.checked = true;
								}
							} else {
								formField.value = savedDataForm[key];
							}

						}
					}
				}
			}
		}

		var submitHandler = function () {
			localStorage.removeItem( 'saveFormData' );
		}

		// Listen form in real time.
		form.addEventListener( 'input', listenForm, false );

		// Populate form data on page load.
		window.addEventListener( 'load', populateForm, false );

		// Clear data on submit.
		document.addEventListener( 'submit', submitHandler, false );
    };

    return publicAPIs;
})();

// Init the App.
saveFormData.init();
