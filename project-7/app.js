var tabsPanel = (function () {
    'use strict;'

	// Public APIs.
	var publicAPIs = {};
	var settings;

   // Defaults.
   var defaults = {
		selectorTabs: '.tabs',
		selectorTabContent: '.tab-content',
		selectorTabPane: '.tab-pane',
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
	 * Add ARIA for tabbed elements.
	 *
	 * @param {String} tabs     All the tabs.
	 * @param {String} tabPanes All the tab panes.
	 */
	var addAria = function ( tabs, tabPanes ) {
		// Add role="tablist" for all tabs.
		var tabsAll = document.querySelectorAll( tabs );
		for ( var i = 0; i < tabsAll.length; i++ ) {
			tabsAll[i].setAttribute( 'role', 'tablist' );
		}

		// Add roles for all <a> elements.
		var tabAnchors = document.querySelectorAll( tabs + ' a' );
		for ( var i = 0; i < tabAnchors.length; i++ ) {
			// Add role="tab" for all <a> elements.
			tabAnchors[i].setAttribute( 'role', 'tab' );

			// Add tabindex="-1" for all <a> elements.
			tabAnchors[i].setAttribute( 'tabindex', '-1' );

			// Add unique ID.
			tabAnchors[i].setAttribute( 'id', 'tab' + (i + 1) );

			// Add role="presentation" for all parent elements (<li>).
			tabAnchors[i].parentNode.setAttribute( 'role', 'presentation' );
		}

		// Add role="tabpanel" for all tab panes.
		var tabPanes = document.querySelectorAll( tabPanes );
		for ( var i = 0; i < tabPanes.length; i++ ) {
			tabPanes[i].setAttribute( 'role', 'tabpanel' );

			// Add `aria-labelledby` for matching ID.
			tabPanes[i].setAttribute( 'aria-labelledby', 'tab' + (i + 1) );

			// Add hidden attribute.
			tabPanes[i].hidden = true;
		}
	};

	/**
	 * Reveal the first tab link and content.
	 *
	 * @param {String} tabs
	 * @param {String} tabContent
	 * @param {String} tabPanes
	 */
	var revealFirst = function ( tabs, tabContent, tabPanes ) {
		// Remove tabindex and add aria-selected.
		var tabs = document.querySelectorAll( tabs );
		for ( var i = 0; i < tabs.length; i++ ) {
			tabs[i].querySelector( 'a' ).removeAttribute( 'tabindex' );
			tabs[i].querySelector( 'a' ).setAttribute( 'aria-selected', 'true' );
		}

		// Remove hidden attribute from the first tab content.
		var tabContent = document.querySelectorAll( tabContent );
		for ( var i = 0; i < tabContent.length; i++ ) {
			tabContent[i].querySelector( tabPanes ).hidden = false;
		}
	};

	var switchTab = function ( activeTab, newActiveTab ) {
		// Remove ARIA and add tabindex (current active).
		activeTab.removeAttribute( 'aria-selected' );
		activeTab.setAttribute( 'tabindex', '-1' );

		// Add ARIA and and remove tabindex (new active).
		newActiveTab.setAttribute( 'aria-selected', 'true' );
		newActiveTab.removeAttribute( 'tabindex' );
		newActiveTab.focus();

		// Add hidden attribute to current tab content.
		var currentContent = document.querySelector( '[aria-labelledby="' + activeTab.id + '"]' );
		currentContent.hidden = true;

		// Remove hidden attribute to new tab content.
		var newContent = document.querySelector( '[aria-labelledby="' + newActiveTab.id + '"]' );
		newContent.hidden = false;
	};

	/**
	 * Handle click events.
	 *
	 * @param {Event} event The click event
	 */
	var clickHandler = function ( event ) {
		// Only run if the click was on a tab.
		var newActiveTab = event.target.closest( settings.selectorTabs + ' a' );
		if ( ! newActiveTab ) {
			return;
		}

		console.log( event.target, newActiveTab );
		event.preventDefault();

		// Current active tab.
		var activeTab = event.target.closest( settings.selectorTabs ).querySelector('[aria-selected="true"]');

		// New active tab.
		var newActiveTab = event.target;
		console.log( activeTab );
		// Switch tab if it was not current active already.
		if ( newActiveTab !== activeTab ) {
			switchTab( activeTab, newActiveTab );
		}
	};

	/**
	 * Handle arrow key events.
	 *
	 * @param {Event} event The arrow key event
	 */
	var keyboardHandler = function ( event ) {
		// Only run if the click was on a tab.
		var newActiveTab = event.target.closest( settings.selectorTabs + ' a' );
		if ( ! newActiveTab ) {
			return;
		}

		// Get all tabs.
		var allTabs = event.target.closest( settings.selectorTabs ).querySelectorAll( 'a' );
		var allTabsLength = allTabs.length - 1;
		var firstTab = allTabs[0];
		var lastTab  = allTabs[allTabsLength];

		// Get index of current tab.
		var index = Array.prototype.indexOf.call( allTabs, event.target );

		// Set direction, left arrow keycode is 37, right 39.
		// var dir = event.keyCode === 37 ? index - 1 : event.keyCode === 39 ? index + 1 : event.which === 40 ? 'down' : null;
		var dir = null;
		if ( event.key === 'ArrowLeft' && event.target !== firstTab ) {
			dir = index - 1;
		}

		if ( event.key === 'ArrowRight' && event.target !== lastTab ) {
			dir = index + 1;
		}

		if ( event.key === 'ArrowLeft' && event.target === firstTab || event.key === 'End' ) {
			dir = allTabsLength;
		}

		if ( event.key === 'ArrowRight' && event.target === lastTab || event.key === 'Home' ) {
			dir = 0;
		}

		if ( dir !== null ) {
			event.preventDefault();

			// Go to next or previous tab.
			dir === 'down' ? panels[i].focus() : allTabs[dir] ? switchTab( event.target, allTabs[dir] ) : void 0;
		}
	};

	/**
	 * Public API.
	 */
	publicAPIs.init = function ( options ) {
		// Merge options into defaults.
		settings = extend( defaults, options || {} );

		// Add ARIA.
		addAria( settings.selectorTabs, settings.selectorTabPane );

		// Reveal the first pane.
		revealFirst( settings.selectorTabs, settings.selectorTabContent, settings.selectorTabPane );

		// Add click event listener.
		document.addEventListener( 'click', clickHandler, false );

		// Add arrow keys event listener for tabs.
		document.addEventListener( 'keydown', keyboardHandler, false );
    };

    return publicAPIs;
})();

// Init the App.
tabsPanel.init();
