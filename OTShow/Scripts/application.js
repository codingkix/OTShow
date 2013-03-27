var GlobalVars = {
    googleAPIKey: 'AIzaSyCKe9-BfEAwyaR2Qb7XIRkq4FccIf4HOIM',
    timer: null,
    markers: [],
    locations: [],
    usMap: null
}

var timerOptions = {
    time: 60000,
    autostart: false
}

function initialGoogleMap() {
    var mapOptions = {
        zoom: 5,
        center: new google.maps.LatLng(36.4230, -98.7372),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    GlobalVars.usMap = new google.maps.Map(document.getElementById("usMapCanvas"), mapOptions);
    google.maps.event.addListenerOnce(GlobalVars.usMap, 'idle', function () {
        starttimer();
    });
}

function loadScript() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://maps.googleapis.com/maps/api/js?key=" + GlobalVars.googleAPIKey + "&sensor=true&callback=initialGoogleMap";
    document.body.appendChild(script);
}

function starttimer() {
    GlobalVars.timer = $.timer(processData);
    GlobalVars.timer.set(timerOptions);
    GlobalVars.timer.play();
}

function processData() {
    $.getJSON('Home/GetFeeds', { region: 'us' }, function (data) {
        if (data != null) {
            for (var i = 0; i < data.reservations.length; i++) {
                var latlng = new google.maps.LatLng(data.reservations[i].latitude, data.reservations[i].longitude);
                addMarker(latlng);
            }
        }
    });
}

function addMarker(latlng) {
    new google.maps.Marker({
        position: latlng,
        map: GlobalVars.usMap,
        draggable: false,
        animation: google.maps.Animation.DROP
    });
}

//function getUSFeeds() {
//    $.getJSON('Home/GetFeeds', { region: 'us' }, function (data) {
//        alert(data.title);
//    });
//}

window.onload = loadScript;

$(document).ready(function () {
    //getUSFeeds();
})