var model = {
    locations: [{
            title: 'Park Ave Penthouse',
            location: {
                lat: 40.7713024,
                lng: -73.9632393
            },
            hideShow: ko.observable(true),
            hideShowSubList: ko.observable(false)
        },
        {
            title: 'Chelsea Loft',
            location: {
                lat: 40.7444883,
                lng: -73.9949465
            },
            hideShow: ko.observable(true),
            hideShowSubList: ko.observable(false)
        },
        {
            title: 'Union Square Open Floor Plan',
            location: {
                lat: 40.7347062,
                lng: -73.9895759
            },
            hideShow: ko.observable(true),
            hideShowSubList: ko.observable(false)
        },
        {
            title: 'East Village Hip Studio',
            location: {
                lat: 40.7281700,
                lng: -73.984377
            },
            hideShow: ko.observable(true),
            hideShowSubList: ko.observable(false)
        },
        {
            title: 'TriBeCa Artsy Bachelor Pad',
            location: {
                lat: 40.7195264,
                lng: -74.0089934
            },
            hideShow: ko.observable(true),
            hideShowSubList: ko.observable(false)
        },
        {
            title: 'Chinatown Homey Space',
            location: {
                lat: 40.7180628,
                lng: -73.9961237
            },
            hideShow: ko.observable(true),
            hideShowSubList: ko.observable(false)
        }
    ],
    venuesList: [
	    {
			name: ko.observable(),
			url: ko.observable(),
			cat: ko.observable()
		},
		{
			name: ko.observable(),
			url: ko.observable(),
			cat: ko.observable()
		},
		{
			name: ko.observable(),
			url: ko.observable(),
			cat: ko.observable()
		},
		{
			name: ko.observable(),
			url: ko.observable(),
			cat: ko.observable()
		},
	    {
			name: ko.observable(),
			url: ko.observable(),
			cat: ko.observable()
		}
	]
};

// Add ID to model