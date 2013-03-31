var GlobalVars = {
    googleAPIKey: 'AIzaSyCKe9-BfEAwyaR2Qb7XIRkq4FccIf4HOIM',
    timer: null,
    usMap: null,
    euMap: null,
    asiaMap: null,
    usReady: false,
    euReady: false,
    asiaReady: false,
    revenue: 0.00,
    prevRevenue: 0.00,
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
    pieReady: false
}

var TimeChartVars = {
    timeChart: null,
    maxRange: 14       //two weeks data
}

var timerOptions = {
    time: 60000,
    toogleTime: 0.15 * 60000,
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
        GlobalVars.timer = $.timer(fetchDataFeeds, timerOptions.time, timerOptions.autostart).once();
    }
}

function fetchDataFeeds() {
    $.getJSON('Home/GetAllResults', { startPoint: GlobalVars.startPoint.toUTCString() }, function (result) {
        processReservations(result.USFeeds, 'us');
        processReservations(result.EUFeeds, 'eu');
        processReservations(result.AsiaFeeds, 'asia');

        GlobalVars.revenue += result.TotalRevenue;
        GlobalVars.prevReservCount = GlobalVars.reservationCount;
        GlobalVars.reservationCount += result.TotalReservation;

        updateCounters();
        //$('#revenueCounter').text('$' + GlobalVars.revenue);
        //$('#reservationCounter').text(GlobalVars.reservationCount);

        PieChartVars.consumerSite += result.ConsumerSiteCount;
        PieChartVars.mobileSite += result.MobileSiteCount;
        PieChartVars.iOS += result.iOSCount;
        PieChartVars.android += result.AndroidCount;
        PieChartVars.yelp += result.YelpCount;
        PieChartVars.others += result.OthersCount;

        if (PieChartVars.pieReady)
            updatePieChart();

        updateTimeChart(result.TimeGroupCounts);

    });
}

function processReservations(feeds, region) {
    if (feeds != null) {
        var reservations = feeds.reservations;
        for (var i = 0; i < reservations.length; i++) {
            var latlng = new google.maps.LatLng(reservations[i].latitude, reservations[i].longitude);
            addMarker(latlng, region, reservations[i].restaurantname, reservations[i].partysize);
        }
    }
}

function addMarker(latlng, region, restName, partySize) {
    var map;
    if (region == 'us')
        map = GlobalVars.usMap;
    if (region == 'eu')
        map = GlobalVars.euMap;
    if (region == 'asia')
        map = GlobalVars.asiaMap;

    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        icon: 'Images/pin_' + region + '.png'
    });

    var infoWindows = new google.maps.InfoWindow(
        {
            content: '<div class="infoBox"><p class="name">' + restName +
                '</p><p>Party size:<strong>' + partySize + '</strong></p></div>',
            maxWidth: 100
        });

    google.maps.event.addListener(marker, 'click', function () {
        infoWindows.open(map, marker);
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
    $('#pieChart2').highcharts({
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
                    y: PieChartVars.iOS,
                    sliced: true,
                    selected: true
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
    PieChartVars.highChartPie = $('#pieChart2').highcharts();
    PieChartVars.pieReady = true;
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

function updatePieChart() {
    PieChartVars.highChartPie.get('opentable').update(PieChartVars.consumerSite, true);
    PieChartVars.highChartPie.get('mobilesite').update(PieChartVars.mobileSite, true);
    PieChartVars.highChartPie.get('ios').update(PieChartVars.iOS, true);
    PieChartVars.highChartPie.get('android').update(PieChartVars.android, true);
    PieChartVars.highChartPie.get('yelp').update(PieChartVars.yelp, true);
    PieChartVars.highChartPie.get('others').update(PieChartVars.others, true);
}

function createTimeChart() {
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

    $('#timeFlowChart').highcharts({
        chart: {
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'Reservation Timeline'
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' :
                'Drag your finger over the plot to zoom in'
        },
        xAxis: {
            type: 'datetime',
            maxZoom: 14 * 24 * 3600000, // fourteen days
            title: {
                text: null
            }
        },
        yAxis: {
            title: {
                text: 'Reservation Counts'
            }
        },
        tooltip: {
            shared: true
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series: [{
            type: 'area',
            name: 'Reservation count',
            pointInterval: 24 * 3600 * 1000,
            pointStart: GlobalVars.startDateUTC,
            data: []
        }]
    });

    TimeChartVars.timeChart = $('#timeFlowChart').highcharts();
}

function updateTimeChart(groupCounts) {
    var currentData = TimeChartVars.timeChart.series[0].data;
    var size = groupCounts.length;
    var max = groupCounts[size - 1].ItemIndex;
    //hold one year data for now
    if (max > TimeChartVars.maxRange)
        max = TimeChartVars.maxRange;
    var start = null;
    for (var i = currentData.length; i <= max; i++) {
        if (currentData[i] == null) {
            //reset start point to calculate new point date
            start = new Date(GlobalVars.startPoint.valueOf());
            TimeChartVars.timeChart.series[0].addPoint([start.setDate(start.getDate() + i - 1), 0]);
        }
    }

    for (var j = 0; j < groupCounts.length; j++) {
        var item = groupCounts[j];
        if (item.ItemIndex >= 0 && item.ItemIndex <= TimeChartVars.maxRange) {
            var y = currentData[item.ItemIndex].y;
            currentData[item.ItemIndex].update(item.CountValue + y, true);
        }
    }
}

function convertUTCDate(date) {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function toggleRow1() {
    var option = {};
    if (GlobalVars.showUsMap) {
        BV
        $('#usMapCanvas').hide('slide', option, 500, function () { $('#timeFlowChart').show('slide', option, 400) });
        GlobalVars.showUsMap = false;
    } else {
        $('#timeFlowChart').hide('slide', option, 500, function () { $('#usMapCanvas').show('slide', option, 400) });
        GlobalVars.showUsMap = true;
    }

}

function updateCounters() {
    $('#reservationCounter').flipCounter(
        "startAnimation", // scroll counter from the current number to the specified number
        {
            end_number: GlobalVars.reservationCount, // the number we want the counter to scroll to
            easing: jQuery.easing.easeOutCubic, // this easing function to apply to the scroll.
            duration: 50000, // number of ms animation should take to complete  20 sec
        }
     );

    $('#revenueCounter').flipCounter(
       "startAnimation", // scroll counter from the current number to the specified number
       {
           end_number: GlobalVars.revenue, // the number we want the counter to scroll to
           easing: jQuery.easing.easeOutCubic, // this easing function to apply to the scroll.
           duration: 50000, // number of ms animation should take to complete  20 sec
       }
    );
}

window.onload = loadScript;

$(document).ready(function () {
    GlobalVars.startDateUTC = convertUTCDate(GlobalVars.startPoint);
    createPieChart();
    createTimeChart();

    //$.timer(toggleRow1, timerOptions.toogleTime, timerOptions.autostart)

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
            imagePath: "Images/flipCounter-medium.png", // the path to the sprite image relative to your html document
        }
     );

    $('#revenueCounter').flipCounter(
       {
           number: GlobalVars.prevRevenue, // the number we want to scroll from
           end_number: GlobalVars.revenue, // the number we want the counter to scroll to
           numIntegralDigits: 5, // number of places left of the decimal point to maintain
           numFractionalDigits: 2, // number of places right of the decimal point to maintain
           digitClass: "counter-digit", // class of the counter digits
           counterFieldName: "counter-value", // name of the hidden field
           digitHeight: 40, // the height of each digit in the flipCounter-medium.png sprite image
           digitWidth: 30, // the width of each digit in the flipCounter-medium.png sprite image
           imagePath: "Images/flipCounter-medium.png", // the path to the sprite image relative to your html document
       }
    );
})