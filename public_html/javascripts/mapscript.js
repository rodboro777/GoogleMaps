window.onload = onAllAssetsLoaded;

function onAllAssetsLoaded()
{
    // hide the webpage loading message
   
    let center = {lat: 35.6643, lng: 139.5272};
    let map = new google.maps.Map(document.getElementById("mapDiv"), {
        zoom: 12,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP

    });
    ajaxDisplayMap(map);
    new AutocompleteDirectionsHandler(map);
    new initialize(map);
}



async function ajaxDisplayMap(map)
{
    let locations = [];
    // These constants must start at 0
    // These constants must match the data layout in the 'locations' array below
    let ID = 0; // the marker's zIndex is being used to hold a unique index for each marker
    let TITLE = 1;
    let CONTENT = 2;
    let LATITUDE = 3;
    let LONGITUDE = 4;
    let url = "newjson.json"; /* JSON file */
    let urlParameters = ""; /* Leave empty, as no parameter is passed to the JSON file */

    try
    {
        const response = await fetch(url,
                );
        updateWebpage(await response.json());
    }
    catch (error)
    {
        console.log("Fetch failed: ", error);
    }



    /* use the fetched data to change the content of the webpage */
    function updateWebpage(jsonData)
    {


        for (let i = 0; i < jsonData.length; i++)
        {
            locations.push([i, jsonData[i].title, '<div id="container"><img id="background_image" src="' + jsonData[i].photo + '"><img id="background_image" src="images/png.jpg"><div id="text_container"><p>' + jsonData[i].content + '</p></div></div>', parseFloat(jsonData[i].latitude), parseFloat(jsonData[i].longitude)]);
        }


        var infobox = [];
        for (i = 0; i < locations.length; i++)
        {
            var marker = new google.maps.Marker
                    (
                            {
                                title: locations[i][TITLE],
                                map: map,
                                position: new google.maps.LatLng(locations[i][LATITUDE], locations[i][LONGITUDE]),
                                zIndex: locations[i][ID]   // the zIndex is being used to hold a unique index for each marker
                            }
                    );
            infobox[marker.zIndex] = new google.maps.InfoWindow
                    (
                            {
                                content: locations[i][CONTENT],
                                disableAutoPan: false,
                                boxStyle:
                                        {
                                            opacity: 0,
                                            width: "200px"
                                        },
                                closeBoxMargin: "20px 20px 0px 0px",
                                closeBoxURL: "images/close_icon.png",
                                infoBoxClearance: new google.maps.Size(1, 1)
                            }
                    );
            google.maps.event.addListener(marker, 'click', function ()
            {
                // if another inforbox is open, then close it
                for (i = 0; i < infobox.length; i++)
                {
                    infobox[i].close();
                }

                infobox[this.zIndex].open(map, this);
                map.panTo(center);
            });
        }
    }



}

function AutocompleteDirectionsHandler(map)
{
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsRenderer = new google.maps.DirectionsRenderer;
    this.directionsRenderer.setMap(map);
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    // Specify just the place data fields that you need.
    originAutocomplete.setFields(['place_id']);
    var destinationAutocomplete =
            new google.maps.places.Autocomplete(destinationInput);
    // Specify just the place data fields that you need.
    destinationAutocomplete.setFields(['place_id']);
    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');
    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
            destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (
        id, mode)
{
    var radioButton = document.getElementById(id);
    var me = this;
    radioButton.addEventListener('click', function ()
    {
        me.travelMode = mode;
        me.route();
    });
};
AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
        autocomplete, mode)
{
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function ()
    {
        var place = autocomplete.getPlace();
        if (!place.place_id)
        {
            window.alert('Please select an option from the dropdown list.');
            return;
        }
        if (mode === 'ORIG')
        {
            me.originPlaceId = place.place_id;
        }
        else
        {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });
};
AutocompleteDirectionsHandler.prototype.route = function ()
{
    if (!this.originPlaceId || !this.destinationPlaceId)
    {
        return;
    }
    var me = this;
    this.directionsService.route(
            {
                origin: {'placeId': this.originPlaceId},
                destination: {'placeId': this.destinationPlaceId},
                travelMode: this.travelMode
            },
            function (response, status)
            {
                if (status === 'OK')
                {
                    me.directionsRenderer.setDirections(response);
                }
                else
                {
                    window.alert('Directions request failed due to ' + status);
                }
            });
};
function initialize(map)
{
    var myLatlng = new google.maps.LatLng(13.0839, 80.2700);
    var mapOptions = {
        zoom: 7,
        center: myLatlng
    };
    this.map = map;
    autocomplete(map);
}

var autocomplete;
var marker;
function autocomplete(map)
{
    var source = document.getElementById('autocomplete');
    autocomplete = new google.maps.places.Autocomplete(source);
    autocomplete.bindTo('bounds', map);
    infowindow = new google.maps.InfoWindow();
    var icon = "images/pointer.png";
    marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
        icon: icon

    });
    autocomplete.addListener('place_changed', function ()
    {
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry)
        {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport)
        {
            map.fitBounds(place.geometry.viewport);
        }
        else
        {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        google.maps.event.addListener(marker, 'click', function ()
        {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
    });

}