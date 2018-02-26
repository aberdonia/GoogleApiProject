// jshint ignore: start
// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead.
var viewModel = {
    locations: ko.observableArray(model.locations),
    venuesList: ko.observableArray(model.venuesList),
    sublistSetting: ko.observable(false),
    activeLocation: ko.observable("TBD")
};


ko.applyBindings(viewModel);
// ko.applyBindings(venuesList);


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

    // Make LargeInfowindow of InfoWindow a global variable so it can be called
    // outside function scope, instead of creating new instance. This means
    // only 1 infowindow is ever showing.
    window.largeInfowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');
    // click on the marker.
    var onclickIcon = makeMarkerIcon('F00');

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < viewModel.locations().length; i++) {
        // Get the position from the location array.
        var position = viewModel.locations()[i].location;
        var title = viewModel.locations()[i].title;
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
        marker.addListener('click', function() {
            this.setIcon(onclickIcon);
        });

        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });

    }
    // Load in listings marker, shows user options and allows animations to work on first closeclick
    showListings();
}

function populateInfoWindow(marker, infowindow) {

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
        var getStreetView = (data, status) => {
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
        };
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);

    }
}


// onKeyUp event handler
function search() {
    viewModel.sublistSetting(false);
    window.largeInfowindow.close(map);
    // get the search string -> remove leading & trailing whitespaces -> make lower case
    let string = filter_box.value.trim().toLowerCase();
    // get the list items in the unordered list ()
    var items = viewModel.locations();
    var bounds = new google.maps.LatLngBounds();
    hideMarkers(markers);
    for (let i = 0; i < items.length; i++) {
        console.log(typeof items[i].title);
        //Both the search string and the item text should be lower/upper case. Otherwise the string comparison won't work properly.
        const itemText = items[i].title.toLowerCase();
        if (itemText.startsWith(string)) {
            // required in oreder to display the full list when the search box is empty
            items[i].hideShow(true);
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        } else {
            // hide an item if it doesn't start with the search string
            items[i].hideShow(false);
        }
    }
}

function clickListing() {
    var index_id = viewModel.locations().indexOf(this);
    console.log(index_id);
    populateInfoWindow(markers[index_id], largeInfowindow);
    toggleBounce(markers[index_id]);
    generateSubList(index_id);
}


function showSubList(index_id) {
    document.getElementById(`sub-list-${index_id}`).display = "";
}


// Need to toggle visibility of sidebar with showlist

function hideListings() {
    hideMarkers(markers);
    viewModel.sublistSetting(false);
};


// This function will loop through the markers array and display them all.
function showListings() {
    console.log("showlisting");
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    viewModel.sublistSetting(false);
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
    } else {
        viewModel.showList = false;
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

function generateSubList(index_id) {
    var lat = viewModel.locations()[index_id].location.lat;
    var lng = viewModel.locations()[index_id].location.lng;
    var ll = `${lat},${lng}`;
    var oauth_token = "SRHXBQQUAGGQ1BWGQD3HXMYQCURB1YVDJQEXJ5VZAGOLE2C1";
    var grabSubList = document.getElementById(`sub-list-${index_id}`);
    if (grabSubList !== null) {
        console.log("present");
        // return;
        if (grabSubList.style.display !== 'none') {
            console.log("displaying");
            // grabSubList.style.display = 'none';
            return;
        } else {
            console.log("none");
        }
        showSubList(index_id);
    } else {
        console.log("not present");
    }

    viewModel.activeLocation(viewModel.locations()[index_id].title);

    var fourSquareApi = {
        "async": true,
        "crossDomain": true,
        "url": `https://api.foursquare.com/v2/venues/search?ll=${ll}&oauth_token=${oauth_token}&v=20180215`,
        "method": "GET"
    }

    $.ajax(fourSquareApi).done(function(response) {

        for (var i = 0; i < 5; i++) {
            viewModel.venuesList()[i].name(response.response.venues[i].name);
            viewModel.venuesList()[i].url(response.response.venues[i].url);
            viewModel.venuesList()[i].cat(response.response.venues[i].categories[0].name);
        }
        viewModel.sublistSetting(true);
    });

}