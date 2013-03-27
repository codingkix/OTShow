var GlobalVars = {
    googleAPIKey: 'AIzaSyCKe9-BfEAwyaR2Qb7XIRkq4FccIf4HOIM',
    timer: null,
    usMap: null,
    euMap: null,
    asiaMap: null,
    usReady: false,
    euReady: false,
    asiaReady: false
}

var timerOptions = {
    time: 60000,
    autostart: true
}

function initialGoogleMap() {
    var usCenter = new google.maps.LatLng(36.4230, -98.7372);
    var euCenter = new google.maps.LatLng(52.4230, 4.7372);
    var asiaCenter = new google.maps.LatLng(35.4230, 138.7372);
    var mapOptions = {
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    GlobalVars.usMap = new google.maps.Map(document.getElementById("usMapCanvas"), mapOptions);
    GlobalVars.usMap.setCenter(usCenter);
    GlobalVars.euMap = new google.maps.Map(document.getElementById("euMapCanvas"), mapOptions);
    GlobalVars.euMap.setCenter(euCenter);
    GlobalVars.asiaMap = new google.maps.Map(document.getElementById("asiaMapCanvas"), mapOptions);
    GlobalVars.asiaMap.setCenter(asiaCenter);
    GlobalVars.asiaMap.setZoom(6);

    google.maps.event.addListenerOnce(GlobalVars.usMap, 'idle', function () {
        GlobalVars.usReady = true;
        starttimer();
    });
    google.maps.event.addListenerOnce(GlobalVars.euMap, 'idle', function () {
        GlobalVars.euReady = true;
        starttimer();
    });
    google.maps.event.addListenerOnce(GlobalVars.asiaMap, 'idle', function () {
        GlobalVars.asiaReady = true;
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
    if (GlobalVars.usReady && GlobalVars.euReady && GlobalVars.asiaReady) {
        GlobalVars.timer = $.timer(processData, timerOptions.time, timerOptions.autostart).once();
    }
}

function processData() {
    $.getJSON('Home/GetAllResults', function (result) {
        processReservations(result.USFeeds.reservations, 'us');
        processReservations(result.EUFeeds.reservations, 'eu');
        processReservations(result.AsiaFeeds.reservations, 'asia');
    });
}

function processReservations(reservations, region) {
    if (reservations != null) {
        for (var i = 0; i < reservations.length; i++) {
            var latlng = new google.maps.LatLng(reservations[i].latitude, reservations[i].longitude);
            addMarker(latlng, region);
        }
    }
}

function addMarker(latlng, region) {
    var map;
    if (region == 'us')
        map = GlobalVars.usMap;
    if (region == 'eu')
        map = GlobalVars.euMap;
    if (region == 'asia')
        map = GlobalVars.asiaMap;

    new google.maps.Marker({
        position: latlng,
        map: map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        icon: 'Images/pin_' + region + '.png'
    });
}

function getFeeds(region) {
    $.getJSON('Home/GetJsonFeed', { region: region }, function (data) {
        if (data != null) {
            for (var i = 0; i < data.reservations.length; i++) {
                var latlng = new google.maps.LatLng(data.reservations[i].latitude, data.reservations[i].longitude);
                addMarker(latlng);
            }
        }
    });
}

window.onload = loadScript;

$(document).ready(function () {
    //getUSFeeds();
})