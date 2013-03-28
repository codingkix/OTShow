var GlobalVars = {
    googleAPIKey: 'AIzaSyCKe9-BfEAwyaR2Qb7XIRkq4FccIf4HOIM',
    timer: null,
    usMap: null,
    euMap: null,
    asiaMap: null,
    usReady: false,
    euReady: false,
    asiaReady: false,
    revenue: 0.0,
    reservationCount: 0
}

var PieChartVars = {
    pieData: null,
    pieOptions: {
        'title': 'Reservation Sources',
        'width': 400,
        'height': 300
    },
    pieChart: null,
    consumerSite: 0,
    mobileSite: 0,
    iOS: 0,
    android: 0,
    yelp: 0,
    others: 0
}

var timerOptions = {
    time: 60000,
    autostart: true
}


function initialGoogleMap() {
    var usCenter = new google.maps.LatLng(36.4230, -98.7372);
    var euCenter = new google.maps.LatLng(52.4230, 4.7372);
    var asiaCenter = new google.maps.LatLng(36.4230, 142.7372);
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

        GlobalVars.revenue += result.TotalRevenue;
        GlobalVars.reservationCount += result.TotalReservation;

        $('#revenueCounter').text('$' + GlobalVars.revenue);
        $('#reservationCounter').text(GlobalVars.reservationCount);

        PieChartVars.consumerSite += result.ConsumerSiteCount;
        PieChartVars.mobileSite += result.MobileSiteCount;
        PieChartVars.iOS += result.iOSCount;
        PieChartVars.android += result.AndroidCount;
        PieChartVars.yelp += result.YelpCount;
        PieChartVars.others += result.OthersCount;

        drawChart();
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

function initialPieChart() {
    PieChartVars.pieData = new google.visualization.DataTable();
    PieChartVars.pieData.addColumn('string', 'Source');
    PieChartVars.pieData.addColumn('number', 'ReservationCount');
    PieChartVars.pieData.addRow(6);
    PieChartVars.pieChart = new google.visualization.PieChart(document.getElementById('pieChart'));
}

function drawChart() {
    PieChartVars.pieData.setCell(0, 0, "OpenTable.com");
    PieChartVars.pieData.setCell(1, 0, "Mobile Site");
    PieChartVars.pieData.setCell(2, 0, "iOS");
    PieChartVars.pieData.setCell(3, 0, "Android");
    PieChartVars.pieData.setCell(4, 0, "Yelp");
    PieChartVars.pieData.setCell(5, 0, "Others");

    PieChartVars.pieData.setCell(0, 1, PieChartVars.consumerSite);
    PieChartVars.pieData.setCell(1, 1, PieChartVars.mobileSite);
    PieChartVars.pieData.setCell(2, 1, PieChartVars.iOS);
    PieChartVars.pieData.setCell(3, 1, PieChartVars.android);
    PieChartVars.pieData.setCell(4, 1, PieChartVars.yelp);
    PieChartVars.pieData.setCell(5, 1, PieChartVars.others);

    PieChartVars.pieChart.draw(PieChartVars.pieData, PieChartVars.pieOptions);
}

window.onload = loadScript;

$(document).ready(function () {
    // Load the Visualization API and the piechart package.
    google.load('visualization', '1.0', { 'packages': ['corechart'] });
    // Set a callback to run when the Google Visualization API is loaded.
    google.setOnLoadCallback(initialPieChart);
})