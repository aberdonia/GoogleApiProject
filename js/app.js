		// jshint ignore: start
		// These are the real estate listings that will be shown to the user.
		// Normally we'd have these in a database instead.
		var viewModel = {
		    filterSearch: "",
		    showList: false,
		    locations: model.locations,
		    refresh: function(filterQuery) {

		        for (var i = 0; i < viewModel.locations.length; i++) {
		            // Get the position from the location array.
		            var filterResult = viewModel.locations[i].filterResult();
		            var filterSearch = filterQuery;
		            var title = viewModel.locations[i].title;
		            console.log(filterSearch);
		            if (title.includes(filterSearch)) {
		                viewModel.locations[i].filterResult(true);

		            } else {
		                viewModel.locations[i].filterResult(false);
		            }
		        hideMarkers(markers);
		        showListings();
		        }
		    }
		};
		ko.applyBindings(viewModel);

		console.log(viewModel.locations[0].hideShow());


		function populateList(items, listId) {
	        // get the unordered list ('resultslist') by id
	        var list = document.getElementById(listId);
	        console.log(list);
	        console.log(items);
	        // // add all countries to the list
	        for (i = 0; i < items.length; i++) {
	            list.innerHTML += `<li id="list-item-${i}" onclick="isolate(this.id)">${items[i].title}</li>`;
	        }
    	};





    	// onKeyUp event handler
	    function search() {

	        // get the search string -> remove leading & trailing whitespaces -> make lower case
	        let string = document.getElementById('filter-box').value.trim().toLowerCase();
	        console.log(string);

	        // get the list items in the unordered list ()
	        const items = document.getElementById('list').getElementsByTagName('li');
	        var bounds = new google.maps.LatLngBounds();
	        hideMarkers(markers);
	        for (let i = 0; i < items.length; i++) {

	            //Both the search string and the item text should be lower/upper case. Otherwise the string comparison won't work properly.
	            const itemText = items[i].textContent.toLowerCase();

	            if (itemText.startsWith(string)) {
	                // required in oreder to display the full list when the search box is empty
	                items[i].style.display = '';
				    markers[i].setMap(map);
				    bounds.extend(markers[i].position);
	            } else {
	                // hide an item if it doesn't start with the search string
	                items[i].style.display = 'none';
	            }

		    }
		    map.fitBounds(bounds);

	    }

	    function isolate(itemId, listId = 'list') {
	    	console.log(itemId);
	    	var index_id = Number(itemId.substr(10));
	    	console.log(index_id);
	    	const items = document.getElementById('list').getElementsByTagName('li');
	        var bounds = new google.maps.LatLngBounds();
	    	for (let i = 0; i < items.length; i++) {
				if (i === index_id) {
	                // this is the one to display
	                items[i].style.display = '';
				    markers[i].setMap(map);
				    bounds.extend(markers[i].position);
				    var largeInfowindow = new google.maps.InfoWindow();
				    populateInfoWindow(markers[i], largeInfowindow);
				    toggleBounce(markers[i]);
	            } else {
	                // hide an item if it doesn't start with the search string
	                items[i].style.display = 'none';
	            }
	    	}

	    	hideMarkers(markers, index_id);
	    }

	    populateList(model.locations, 'list');



		// Need to toggle visibility of sidebar with showlist

		document.getElementById('show-listings').addEventListener('click', showListings);
		document.getElementById('hide-listings').addEventListener('click', function() {
			hideMarkers(markers);
		});

		// OLD METHOD

		// Use keyup instead of keypress for instant response instead of delayed.
		// document.getElementById('filter-box').addEventListener('keyup', function() {
		// 	var filterQuery = document.getElementById("filter-box").value;
		// 	console.log("pressed");
		// 	console.log(filterQuery);
		// 	viewModel.refresh(filterQuery);
		// });

		var map;
		// Create a new blank array for all the listing markers.
		var markers = [];
		// Create placemarkers array to use in multiple functions to have control
		// over the number of places that show.
		var placeMarkers = [];

		function initMap() {
		    // Constructor creates a new map - only center and zoom are required.
		    map = new google.maps.Map(document.getElementById('map'), {
		        center: {
		            lat: 40.7413549,
		            lng: -73.9980244
		        },
		        zoom: 13,
		        // styles: styles,
		        mapTypeControl: false
		    });
		    // This autocomplete is for use in the geocoder entry box.
		    var zoomAutocomplete = new google.maps.places.Autocomplete(
		        document.getElementById('zoom-to-area-text'));
		    // Bias the boundaries within the map for the zoom to area text.
		    zoomAutocomplete.bindTo('bounds', map);


		    var largeInfowindow = new google.maps.InfoWindow();

		    // Style the markers a bit. This will be our listing marker icon.
		    var defaultIcon = makeMarkerIcon('0091ff');
		    // Create a "highlighted location" marker color for when the user
		    // mouses over the marker.
		    var highlightedIcon = makeMarkerIcon('FFFF24');
		    // The following group uses the location array to create an array of markers on initialize.
		    for (var i = 0; i < viewModel.locations.length; i++) {
		        // Get the position from the location array.
		        var position = viewModel.locations[i].location;
		        var title = viewModel.locations[i].title;
		        // Create a marker per location, and put into markers array.
		        var marker = new google.maps.Marker({
		            position: position,
		            title: title,
		            animation: google.maps.Animation.DROP,
		            icon: defaultIcon,
		            id: i
		            // var id = viewmodel.location.id - move up
		        });
		        // Push the marker to our array of markers.
		        markers.push(marker);
		        // Create an onclick event to open the large infowindow at each marker.
		        marker.addListener('click', function() {
		            populateInfoWindow(this, largeInfowindow);
		        });
		        // Two event listeners - one for mouseover, one for mouseout,
		        // to change the colors back and forth.
		        marker.addListener('mouseover', function() {
		            this.setIcon(highlightedIcon);
		        });
		        marker.addListener('mouseout', function() {
		            this.setIcon(defaultIcon);
		        });

		    }
		    // Load in listings marker, shows user options and allows animations to work on first click
		    showListings();
		}

		function populateInfoWindow(marker, infowindow) {
		    const _getStreetView = (data, status) => {
		        if (status == google.maps.StreetViewStatus.OK) {
		            var nearStreetViewLocation = data.location.latLng;
		            var heading = google.maps.geometry.spherical.computeHeading(
		                nearStreetViewLocation, marker.position);
		            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
		            var panoramaOptions = {
		                position: nearStreetViewLocation,
		                pov: {
		                    heading: heading,
		                    pitch: 30
		                }
		            };
		            var panorama = new google.maps.StreetViewPanorama(
		                document.getElementById('pano'), panoramaOptions);
		        } else {
		            infowindow.setContent(`<div> ${marker.title} </div><div>No Street View Found</div>`);
		        }
		    }
		    // Check to make sure the infowindow is not already opened on this marker.
		    if (infowindow.marker != marker) {
		        // Clear the infowindow content to give the streetview time to load.
		        infowindow.setContent('');
		        infowindow.marker = marker;
		        // Make sure the marker property is cleared if the infowindow is closed.
		        infowindow.addListener('closeclick', function() {
		            infowindow.marker = null;
		        });
		        var streetViewService = new google.maps.StreetViewService();
		        var radius = 50;
		        // In case the status is OK, which means the pano was found, compute the
		        // position of the streetview image, then calculate the heading, then get a
		        // panorama from that and set the options
		        const getStreetView = (data, status) => {
		            _getStreetView(data, status);
		        }
		        // Use streetview service to get the closest streetview image within
		        // 50 meters of the markers position
		        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
		        // Open the infowindow on the correct marker.
		        infowindow.open(map, marker);
		    }
		}
		// This function will loop through the markers array and display them all.
		function showListings() {
		    console.log("showlisting");
		    var bounds = new google.maps.LatLngBounds();
		    // Extend the boundaries of the map for each marker and display the marker
		    for (var i = 0; i < markers.length; i++) {
		        if (viewModel.locations[i].filterResult() === true) {
		            markers[i].setMap(map);
		            bounds.extend(markers[i].position);
		        } else {
		            console.log(viewModel.locations[i].title);
		            console.log('no match');
		        }

		    }
		    map.fitBounds(bounds);
		    search();

		}
		// This function will loop through the listings and hide them all.
		function hideMarkers(markers, index_id) {
			// Check if something has been passed into (index_id)
			if (index_id !== undefined) {
				console.log("present");
				console.log(index_id);
			    for (var i = 0; i < markers.length; i++) {
		        	if (i !== index_id) {
		        		console.log("null");
		        		console.log(i);

		        		markers[i].setMap(null);
		        	}
		    	}
			} else {viewModel.showList = false;
				console.log("nothing here");
		    	for (var i = 0; i < markers.length; i++) {
		        	markers[i].setMap(null);
		    	}
		    }
		}


		function makeMarkerIcon(markerColor) {
		    var markerImage = new google.maps.MarkerImage(
		        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
		        '|40|_|%E2%80%A2',
		        new google.maps.Size(21, 34),
		        new google.maps.Point(0, 0),
		        new google.maps.Point(10, 34),
		        new google.maps.Size(21, 34));
		    return markerImage;
		}

		function zoomToArea() {
		    // Initialize the geocoder.
		    var geocoder = new google.maps.Geocoder();
		    // Get the address or place that the user entered.
		    var address = document.getElementById('zoom-to-area-text').value;
		    // Make sure the address isn't blank.
		    if (address === '') {
		        window.alert('You must enter an area, or address.');
		    } else {
		        // Geocode the address/area entered to get the center. Then, center the map
		        // on it and zoom in
		        geocoder.geocode({
		            address: address,
		            componentRestrictions: {
		                locality: 'New York'
		            }
		        }, function(results, status) {
		            if (status == google.maps.GeocoderStatus.OK) {
		                map.setCenter(results[0].geometry.location);
		                map.setZoom(15);
		            } else {
		                window.alert('We could not find that location - try entering a more' +
		                    ' specific place.');
		            }
		        });
		    }
		}

		function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
        // 2 sec delay before stopping
        setTimeout(function() {
			marker.setAnimation(null);
		}, 2000);
      }