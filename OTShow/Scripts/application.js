﻿var GlobalVars = {
    googleAPIKey: 'AIzaSyCKe9-BfEAwyaR2Qb7XIRkq4FccIf4HOIM',
    siteName: '/OTShow/',
    timer: null,
    usMap: null,
    euMap: null,
    asiaMap: null,
    usReady: false,
    euReady: false,
    asiaReady: false,
    infoBox: new InfoBox(),
    markers: [],
    markerCluster: null,
    prevMarkerIndex: -1,

    revenue: 0,
    prevRevenue: 0,
    reservationCount: 0,
    prevReservCount: 0,
    startPoint: new Date(),
    startDateUTC: null,
    showUsMap: true
}

var PieChartVars = {
    consumerSite: 1,
    mobileSite: 1,
    iOS: 1,
    android: 1,
    yelp: 1,
    others: 1,
    highChartPie: null,
    pieReady: false,
    pieIndex: 0,
    pieTotal: 6
}

var TimeChartVars = {
    timeChart: null,
    maxRange: 14       //two weeks data
}

var timerOptions = {
    markerShowTime: 7000,
    pieSpinTime: 3000,
    clearTime: 60 * 60 * 1000,  //one hour
    time: 60000,
    autostart: true
}

function initialGoogleMap() {
    var usCenter = new google.maps.LatLng(36.4230, -98.7372);
    var euCenter = new google.maps.LatLng(52.4230, 4.7372);
    var asiaCenter = new google.maps.LatLng(36.4230, 137.7372);
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

    script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/src/infobox.js";
    document.body.appendChild(script);
}

function starttimer() {
    if (GlobalVars.usReady && GlobalVars.euReady && GlobalVars.asiaReady) {
        GlobalVars.timer = $.timer(fetchDataFeeds, timerOptions.time, timerOptions.autostart).once();
    }
}

function fetchDataFeeds() {
    $.getJSON(GlobalVars.siteName + 'Home/GetAllResults', function (result) {
        processReservations(result.USFeeds, 'us');
        processReservations(result.EUFeeds, 'eu');
        processReservations(result.AsiaFeeds, 'asia');

        GlobalVars.revenue += result.TotalRevenue;
        GlobalVars.prevReservCount = GlobalVars.reservationCount;
        GlobalVars.reservationCount += result.TotalReservation;

        updateCounters();

        PieChartVars.consumerSite += result.ConsumerSiteCount;
        PieChartVars.mobileSite += result.MobileSiteCount;
        PieChartVars.iOS += result.iOSCount;
        PieChartVars.android += result.AndroidCount;
        PieChartVars.yelp += result.YelpCount;
        PieChartVars.others += result.OthersCount;

        if (PieChartVars.pieReady) {
            updatePieChart();
        }
    });
}

function processReservations(feeds, region) {
    if (feeds != null) {
        var map;
        if (region == 'us') {
            map = GlobalVars.usMap;
        }
        if (region == 'eu') {
            map = GlobalVars.euMap;
        }
        if (region == 'asia') {
            map = GlobalVars.asiaMap;
        }

        var reservations = feeds.reservations;
        for (var i = 0; i < reservations.length; i++) {
            var latlng = new google.maps.LatLng(reservations[i].latitude, reservations[i].longitude);
            addMarker(latlng, region, map, reservations[i]);
        }

        GlobalVars.markerCluster = new MarkerClusterer(map, GlobalVars.markers);
    }
}

function addMarker(latlng, region, map, reserv) {

    var marker = new google.maps.Marker({
        position: latlng,
        draggable: false,
        animation: google.maps.Animation.DROP,
        icon: GlobalVars.siteName + 'Images/pin_' + region + '.png'
    });

    GlobalVars.markers.push(marker);

    google.maps.event.addListener(marker, 'click', function () {
        GlobalVars.infoBox.close();

        var infoBoxOptions = {
            disableAutoPan: false,
            maxWidth: 0,
            pixelOffset: new google.maps.Size(-60, -180),
            zIndex: null,
            closeBoxMargin: "0",
            closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
            infoBoxClearance: new google.maps.Size(1, 1),
            isHidden: false,
            pane: "floatPane",
            enableEventPropagation: false
        };

        if (region == 'us') {
            infoBoxOptions.boxClass = 'usInfoBox';
        }
        if (region == 'eu') {
            infoBoxOptions.boxClass = 'euInfoBox';
        }
        if (region == 'asia') {
            infoBoxOptions.boxClass = 'asiaInfoBox';
        }
        GlobalVars.infoBox = new InfoBox(infoBoxOptions);

        //generate infobox content for each marker
        var infoBoxDiv = $(document.createElement('div'));
        var resvInfo = $(document.createElement('div'));
        resvInfo.addClass('resvInfo');
        var restname = $(document.createElement('span'));
        restname.text(reserv.restaurantname);
        var party = $(document.createElement('span'));
        party.text(reserv.partysize + ' People');
        var resDate = $(document.createElement('span'));
        resDate.text(reserv.ReservationDateString);
        resvInfo.append(restname).append(party).append(resDate);
        infoBoxDiv.append(resvInfo);
        var img = document.createElement('img');
        img.src = 'http://www.opentable.com/img/restimages/x6/' + reserv.rid + '.jpg';
        img.className = 'restImg';
        infoBoxDiv.append(img);

        GlobalVars.infoBox.setContent(infoBoxDiv.html());
        GlobalVars.infoBox.open(map, marker);
    });
}

function createPieChart() {

    Highcharts.theme = {
        colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
        chart: {
            backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                stops: [
                   [0, 'rgb(255, 255, 255)'],
                   [1, 'rgb(240, 240, 255)']
                ]
            },
            borderWidth: 1,
            plotBackgroundColor: 'rgba(255, 255, 255, .9)',
            plotShadow: true,
            plotBorderWidth: 1
        },
        title: {
            style: {
                color: '#000',
                font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
            }
        },
        subtitle: {
            style: {
                color: '#666666',
                font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
            }
        },
        xAxis: {
            gridLineWidth: 1,
            lineColor: '#000',
            tickColor: '#000',
            labels: {
                style: {
                    color: '#000',
                    font: '11px Trebuchet MS, Verdana, sans-serif'
                }
            },
            title: {
                style: {
                    color: '#333',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    fontFamily: 'Trebuchet MS, Verdana, sans-serif'

                }
            }
        },
        yAxis: {
            minorTickInterval: 'auto',
            lineColor: '#000',
            lineWidth: 1,
            tickWidth: 1,
            tickColor: '#000',
            labels: {
                style: {
                    color: '#000',
                    font: '11px Trebuchet MS, Verdana, sans-serif'
                }
            },
            title: {
                style: {
                    color: '#333',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    fontFamily: 'Trebuchet MS, Verdana, sans-serif'
                }
            }
        },
        legend: {
            itemStyle: {
                font: '9pt Trebuchet MS, Verdana, sans-serif',
                color: 'black'

            },
            itemHoverStyle: {
                color: '#039'
            },
            itemHiddenStyle: {
                color: 'gray'
            }
        },
        labels: {
            style: {
                color: '#99b'
            }
        },

        navigation: {
            buttonOptions: {
                theme: {
                    stroke: '#CCCCCC'
                }
            }
        }
    };

    // Apply the theme
    var highchartsOptions = Highcharts.setOptions(Highcharts.theme);

    // Radialize the colors
    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
        return {
            radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
            stops: [
                [0, color],
                [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
            ]
        };
    });

    // Build the chart
    $('#pieChart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Reservation Sources'
        },
        subtitle: {
            text: 'Hover to see details and click to get your slice'
        },
        tooltip: {
            formatter: function () {
                return this.point.name + ': <b>' + this.percentage.toFixed(2) + '%</b>';
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false,
                },
                showInLegend: true
            }
        },
        series: [{
            type: 'pie',
            name: 'Reservation percent',
            data: [
                {
                    id: 'opentable',
                    name: 'OpenTable.com',
                    y: PieChartVars.consumerSite
                },
                {
                    id: 'mobilesite',
                    name: 'Mobile Site',
                    y: PieChartVars.mobileSite
                },
                {
                    id: 'ios',
                    name: 'iOS',
                    y: PieChartVars.iOS
                },
                {
                    id: 'android',
                    name: 'Android',
                    y: PieChartVars.android
                },
                {
                    id: 'yelp',
                    name: 'Yelp',
                    y: PieChartVars.yelp
                },
                {
                    id: 'others',
                    name: 'Others',
                    y: PieChartVars.others
                }
            ]
        }]
    });
    PieChartVars.highChartPie = $('#pieChart').highcharts();
    PieChartVars.pieReady = true;
    PieChartVars.pieTotal = PieChartVars.highChartPie.series[0].data.length;
}

function selectPie() {
    if (PieChartVars.pieIndex > 0) {
        PieChartVars.highChartPie.tooltip.hide();
    }
    var pie = PieChartVars.highChartPie.series[0].data[PieChartVars.pieIndex];
    pie.select(true, false);
    PieChartVars.highChartPie.tooltip.refresh(pie);
    PieChartVars.pieIndex++;
    if (PieChartVars.pieIndex >= PieChartVars.pieTotal) {
        PieChartVars.pieIndex = 0;
    }
}
function updatePieChart() {
    PieChartVars.highChartPie.get('opentable').update(PieChartVars.consumerSite, true);
    PieChartVars.highChartPie.get('mobilesite').update(PieChartVars.mobileSite, true);
    PieChartVars.highChartPie.get('ios').update(PieChartVars.iOS, true);
    PieChartVars.highChartPie.get('android').update(PieChartVars.android, true);
    PieChartVars.highChartPie.get('yelp').update(PieChartVars.yelp, true);
    PieChartVars.highChartPie.get('others').update(PieChartVars.others, true);
}

function convertUTCDate(date) {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function updateCounters() {
    $('#reservationCounter').flipCounter(
        "startAnimation", // scroll counter from the current number to the specified number
        {
            end_number: GlobalVars.reservationCount, // the number we want the counter to scroll to
            easing: jQuery.easing.easeOutCubic, // this easing function to apply to the scroll.
            duration: 10000, // number of ms animation should take to complete  10 sec
        }
     );

    $('#revenueCounter').flipCounter(
       "startAnimation", // scroll counter from the current number to the specified number
       {
           end_number: GlobalVars.revenue, // the number we want the counter to scroll to
           easing: jQuery.easing.easeOutCubic, // this easing function to apply to the scroll.
           duration: 10000, // number of ms animation should take to complete  10 sec
       }
    );
}

function clearMarkers() {
    if (GlobalVars.markerCluster) {
        GlobalVars.markerCluster.clearMarkers();
    }
}

function showMarkerInfoRandom() {
    //stop previous bouncing marker
    if (GlobalVars.prevMarkerIndex >= 0) {
        GlobalVars.markers[GlobalVars.prevMarkerIndex].setAnimation(null);
    }
    //get a new marker bouncing
    var total = GlobalVars.markers.length;
    do{
        var randomIndex = Math.floor(Math.random() * total);
    } while (randomIndex == GlobalVars.prevMarkerIndex)

    GlobalVars.markers[randomIndex].setAnimation(google.maps.Animation.BOUNCE);
    google.maps.event.trigger(GlobalVars.markers[randomIndex], 'click');
    GlobalVars.prevMarkerIndex = randomIndex;
}

$(document).ready(function () {

    GlobalVars.startDateUTC = convertUTCDate(GlobalVars.startPoint);
    $(window).load(initialGoogleMap());

    createPieChart();

    //slice pie every 3 sec to show data detail 
    $.timer(selectPie, timerOptions.pieSpinTime, timerOptions.autostart);

    $.timer(showMarkerInfoRandom, timerOptions.markerShowTime, timerOptions.autostart);

    $('#reservationCounter').flipCounter(
        {
            number: GlobalVars.prevReservCount, // the number we want to scroll from
            end_number: GlobalVars.reservationCount, // the number we want the counter to scroll to
            numIntegralDigits: 9, // number of places left of the decimal point to maintain
            numFractionalDigits: 0, // number of places right of the decimal point to maintain
            digitClass: "counter-digit", // class of the counter digits
            counterFieldName: "counter-value", // name of the hidden field
            digitHeight: 40, // the height of each digit in the flipCounter-medium.png sprite image
            digitWidth: 30, // the width of each digit in the flipCounter-medium.png sprite image
            imagePath: GlobalVars.siteName + "Images/flipCounter-medium.png", // the path to the sprite image relative to your html document
        }
     );

    $('#revenueCounter').flipCounter(
       {
           number: GlobalVars.prevRevenue, // the number we want to scroll from
           end_number: GlobalVars.revenue, // the number we want the counter to scroll to
           numIntegralDigits: 8, // number of places left of the decimal point to maintain
           numFractionalDigits: 0, // number of places right of the decimal point to maintain
           digitClass: "counter-digit", // class of the counter digits
           counterFieldName: "counter-value", // name of the hidden field
           digitHeight: 40, // the height of each digit in the flipCounter-medium.png sprite image
           digitWidth: 30, // the width of each digit in the flipCounter-medium.png sprite image
           imagePath: GlobalVars.siteName + "Images/flipCounter-medium.png", // the path to the sprite image relative to your html document
       }
    );

    //clear markers every hour
    $.timer(clearMarkers, timerOptions.clearTime, timerOptions.autostart)
})