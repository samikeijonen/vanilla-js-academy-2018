var todoApp = (function () {
	'use strict;'

	// Get the app container
	var appMarkup = document.querySelector( '#app' );
	var app, form, field;

	// Public APIs
	var publicAPIs = {};

	/**
	 * Get the URL parameters
	 * source: https://css-tricks.com/snippets/javascript/get-url-variables/
	 * @param  {String} url The URL
	 * @return {Object}     The URL parameters
	 */
	var getParams = function ( url ) {
		var params = {};
		var parser = document.createElement('a');
		url = url || window.location.href;
		parser.href = url;
		var query = parser.search.substring(1);
		var vars = query.split('&');
		for ( var i=0; i < vars.length; i++ ) {
			var pair = vars[i].split("=");
			params[pair[0]] = decodeURIComponent(pair[1]);
		}

		return params;
	};

	/**
	 * Save todo list data to localStorage
	 * @param  {Object} lists The todo list data
	 */
	var saveTodos = function ( lists ) {
		console.log( lists );
		if ( ! lists ) {
			return;
		}

		localStorage.setItem( 'savedTodos', JSON.stringify( lists ) );
	};

	/**
	 * Get cached todos from localStorage.
	 *
	 * @return {Object} The cached articles.
	 */
	var getCachedTodos = function () {
		var cached = localStorage.getItem( 'savedTodos' );

		if ( ! cached ) {
			return {};
		}

		return JSON.parse( cached );
	};

	/**
	 * Add new todo lists
	 */
	var addNewList = function () {

		// If there's no list name, bail.
		if ( field.value.length < 1 ) return;

		console.log( field.value );

		// Get the list data.
		var lists = app.getData().lists;

		// Make sure list name doesn't already exist.
		if ( lists[field.value] ) {
			return;
		}

		// Create the new list.
		lists[field.value] = [];

		console.log( lists );

		// Update the state.
		app.setData( {lists: lists} );

		// Clear the field and refocus.
		field.value = '';
		field.focus();

	};

	/**
	 * Add new todo items
	 */
	var addNewTodo = function () {

		// If there's no todo item, bail.
		if ( field.value.length < 1 ) {
			return;
		}

		// Add the todo item.
		var lists = app.getData().lists;
		lists[app.getData().list].push({
			item: field.value,
			completed: false
		});

		// Update the state
		app.setData( {lists: lists} );

		// Clear the field and refocus
		field.value = '';
		field.focus();

	};

	/**
	 * Render the initial homepage layout
	 */
	var renderHomepage = function () {

		// Set base template.
		app = new Reef( appMarkup, {
			data: {
				lists: getCachedTodos()
			},
			template: function ( props ) {

				var html =
				'<p><form id="add-list">' +
				'<label for="list-name">Create a new todo list</label>' +
				'<input id="list-name" type="text" data-todo="add">' +
				'<button data-click="add">Add todo</button></form></p>';

				  // If there are lists, create markup for them.
				  if ( Object.keys(props.lists).length > 0 ) {
					html += '<h2>Lists</h2><ol>';
					for ( var list in props.lists ) {
						if ( props.lists.hasOwnProperty(list) ) {
							html +=
								'<li>' +
									'<a href="edit.html?list=' + encodeURIComponent( list ) + '">' + list + '</a> ' +
								'</li>';
						}
					}
					html += '</ol>';
				}

				return html;
			}
		});

		app.render();

		// Cache the new form and list field.
		form = document.querySelector( '#add-list' );
		field = document.querySelector( '#list-name' );

	};

	/**
	 * Render the initial list detail layout
	 */
	var renderList = function () {

		// Create the component
		app = new Reef( appMarkup, {
			data: {
				lists: getCachedTodos(),
				list: getParams().list
			},
			template: function ( props ) {

				var html = '<p><a href="index.html">&larr; Back to all lists</a></p>';

				// Make sure there's a list
				if ( ! props.list || ! props.lists[props.list] ) {
					return html + '<h2>Uh oh!</h2><p>This list cannot be found. Sorry!</p>';
				}

				// Variables
				var list = props.lists[props.list];

				// Create the form
				html +=
					'<h2>' + props.list + '</h2>' +
					'<form id="add-todo">' +
						'<label for="todo-item">What do you need to do?</label>' +
						'<input type="text" id="todo-item" autofocus="autofocus">' +
						'<p><button class="btn">Add Todo</button></p>' +
					'</form>';

				// Create the list
				if ( list.length > 0 ) {
					html += '<h2>Todos</h2><ul class="todos reset-list">';
					list.forEach(function (todo, index) {
						var completed = todo.completed ? ' class="is-completed"' : '';
						var checked = todo.completed ? ' checked="checked"' : '';
						html +=
							'<li class="todo">' +
								'<label data-todo="' + index + '"' + completed + '>' +
									'<input type="checkbox"' + checked + '>' +
									todo.item +
								'</label>' +
							'</li>';
					});

					html += '</ul>';
				}

				return html;
			}
		});

		// Do an initial render
		app.render();

		// Update the page title
		document.title = app.getData().list + ' | Todo';

		// Cache the new todo item field
		field = document.querySelector( '#todo-item' );

	};

	/**
	 * Change the completed status of a todo list item
	 * @param  {Node} label The todo list item label in the DOM
	 */
	var toggleTodo = function ( label ) {

		// Get the checkbox for this item
		var input = label.querySelector( 'input' );
		if ( ! input ) {
			return;
		}

		// Get the todo item ID
		var todo = label.getAttribute( 'data-todo' );

		// Get the todo list
		var lists = app.getData().lists;
		if ( ! lists[app.getData().list][todo] ) {
			return;
		}

		// Update the "completed" state for the todo item.
		lists[app.getData().list][todo].completed = input.checked;

		// Save the state.
		app.setData({lists: lists});

	};

	/**
	 * Handle render events
	 */
	var renderHandler = function () {
		if ( ! app ) {
			return;
		}

		saveTodos( app.getData().lists );
	};

	/**
	 * Listen form submit.
	 *
	 * @param {Object} event
	 */
	var submitHandler = function ( event ) {
		console.log( event.target );

		// Add a new list.
		if ( event.target.matches('#add-list') ) {
			event.preventDefault();
			addNewList();
		}

		// Add a new todo item.
		if ( event.target.matches('#add-todo') ) {
			event.preventDefault();
			addNewTodo();
		}

	};

	/**
	 * Handle click events
	 */
	var clickHandler = function ( event ) {

		// If a todo list item was clicked, toggle its complete status.
		var label = event.target.closest('[data-todo]');
		if ( label ) {
			toggleTodo( label );
		}

	};

	/**
	 * Public API.
	 */
	publicAPIs.init = function () {

		// Bail if we don't have our app wrapper.
		if ( ! appMarkup ) {
			return;
		}

		// Determine the view/UI.
		var page = appMarkup.getAttribute( 'data-app' );

		// Render the correct UI.
		if ( page === 'home' ) {
			renderHomepage();
		}

		if ( page === 'edit' ) {
			renderList();
		}

		// Listen for form submit.
		document.addEventListener( 'submit', submitHandler, false );

		// This is Reef related listener, happens every time UI changes.
		document.addEventListener( 'render', renderHandler, false );

		// For completing todos.
		document.documentElement.addEventListener( 'click', clickHandler, false );
    };

    return publicAPIs;
})();

// Init the App.
todoApp.init();
