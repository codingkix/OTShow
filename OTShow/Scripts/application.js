var GlobalVars = {
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
    usMarkers: [],
    euMarkers: [],
    asiaMarkers: [],
    totalMarkers: [],

    usMarkerCluster: null,
    euMarkerCluster: null,
    asiaMarkerCluster: null,
    prevMarkerIndex: -1,

    revenue: 0,
    prevRevenue: 0,
    reservationCount: 0,
    prevReservCount: 0,
    revenueCounter: null,
    reservCounter: null,

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

var timerOptions = {
    markerShowTime: 7000,   //7 sec
    pieSpinTime: 3000,      //3 sec
    clearTime: 30 * 60 * 1000,  //half hour
    time: 60000,        //1 min
    autostart: true,
    flipTime: 10,    //10 sec
    flipPace: 200,      //200 ms
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
        if (region == 'us') {
            $.merge(GlobalVars.usMarkers, getMarkerArray(feeds.reservations, region, GlobalVars.usMap));
            GlobalVars.usMarkerCluster = new MarkerClusterer(GlobalVars.usMap, GlobalVars.usMarkers);

            $.merge(GlobalVars.totalMarkers, GlobalVars.usMarkers);
        }
        if (region == 'eu') {
            $.merge(GlobalVars.euMarkers, getMarkerArray(feeds.reservations, region, GlobalVars.euMap));
            GlobalVars.euMarkerCluster = new MarkerClusterer(GlobalVars.euMap, GlobalVars.euMarkers);

            $.merge(GlobalVars.totalMarkers, GlobalVars.euMarkers);
        }
        if (region == 'asia') {
            $.merge(GlobalVars.asiaMarkers, getMarkerArray(feeds.reservations, region, GlobalVars.asiaMap));
            GlobalVars.asiaMarkerCluster = new MarkerClusterer(GlobalVars.usMap, GlobalVars.asiaMarkers);

            $.merge(GlobalVars.totalMarkers, GlobalVars.asiaMarkers);
        }
    }
}

function getMarkerArray(reservations, region, map) {
    var markers = [];
    for (var i = 0; i < reservations.length; i++) {
        var marker = createMarker(region, map, reservations[i]);
        markers.push(marker);
    }
    return markers;
}

function createMarker(region, map, reserv) {
    var latlng = new google.maps.LatLng(reserv.latitude, reserv.longitude);
    var marker = new google.maps.Marker({
        position: latlng,
        draggable: false,
        animation: google.maps.Animation.DROP,
        icon: GlobalVars.siteName + 'Images/pin_' + region + '.png'
    });

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
    return marker;
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
    GlobalVars.reservCounter.incrementTo(GlobalVars.reservationCount, timerOptions.flipTime, timerOptions.flipPace);

    GlobalVars.revenueCounter.incrementTo(GlobalVars.revenue, timerOptions.flipTime, timerOptions.flipPace);
}

function clearMarkers() {
    if (GlobalVars.usMarkerCluster) {
        GlobalVars.usMarkerCluster.clearMarkers();
    }
    if (GlobalVars.asiaMarkerCluster) {
        GlobalVars.asiaMarkerCluster.clearMarkers();
    }
    if (GlobalVars.euMarkerCluster) {
        GlobalVars.euMarkerCluster.clearMarkers();
    }

    GlobalVars.totalMarkers = [];
    GlobalVars.prevMarkerIndex = -1;
}

function showMarkerInfoRandom() {
    //stop previous bouncing marker
    if (GlobalVars.prevMarkerIndex >= 0) {
        GlobalVars.totalMarkers[GlobalVars.prevMarkerIndex].setAnimation(null);
    }
    //get a new marker bouncing
    var total = GlobalVars.totalMarkers.length;
    if (total > 0) {
        do {
            var randomIndex = Math.floor(Math.random() * total);
        } while (randomIndex == GlobalVars.prevMarkerIndex)

        GlobalVars.totalMarkers[randomIndex].setAnimation(google.maps.Animation.BOUNCE);
        google.maps.event.trigger(GlobalVars.totalMarkers[randomIndex], 'click');
        GlobalVars.prevMarkerIndex = randomIndex;
    }
}

$(document).ready(function () {

    GlobalVars.startDateUTC = convertUTCDate(GlobalVars.startPoint);
    $(window).load(initialGoogleMap());

    createPieChart();

    //slice pie every 3 sec to show data detail 
    $.timer(selectPie, timerOptions.pieSpinTime, timerOptions.autostart);

    $.timer(showMarkerInfoRandom, timerOptions.markerShowTime, timerOptions.autostart);

    GlobalVars.reservCounter = new flipCounter('reservationCounter', { auto: false });
    GlobalVars.revenueCounter = new flipCounter('revenueCounter', { auto: false });

    //clear markers every hour
    $.timer(clearMarkers, timerOptions.clearTime, timerOptions.autostart)
})