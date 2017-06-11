var obj = JSON.parse('{"Leg":[{"index":1,"from":{"bearing":23,"instruction":{"direction":45,"message":"Bitte rechts abbiegen","type":"lead"},"location":{"floor":1,"latitude":52.519824,"longitude":13.569225}},"to":{"bearing":23,"instruction":{"direction":45,"message":"Bitte links abbiegen","type":"lead"},"location":{"floor":1,"latitude":52.519899,"longitude":13.568823}}},{"index":2,"from":{"bearing":23,"instruction":{"direction":45,"message":"Bitte rechts abbiegen","type":"lead"},"location":{"floor":1,"latitude":52.519899,"longitude":13.568823}},"to":{"bearing":23,"instruction":{"direction":45,"message":"Bitte links abbiegen","type":"lead"},"location":{"floor":1,"latitude":52.519712,"longitude":13.568753}}},{"index":3,"from":{"bearing":23,"instruction":{"direction":45,"message":"Bitte rechts abbiegen","type":"lead"},"location":{"floor":1,"latitude":52.519712,"longitude":13.568753}},"to":{"bearing":23,"instruction":{"direction":45,"message":"Bitte links abbiegen","type":"lead"},"location":{"floor":1,"latitude":52.519800,"longitude":13.568163}}},{"index":4,"from":{"bearing":23,"instruction":{"direction":45,"message":"Bitte rechts abbiegen","type":"lead"},"location":{"floor":1,"latitude":52.519800,"longitude":13.568163}},"to":{"bearing":23,"instruction":{"direction":45,"message":"Bitte links abbiegen","type":"lead"},"location":{"floor":1,"latitude":52.519047,"longitude":13.567908}}}]}');
var loc = JSON.parse('{"Position":[{"accuracy":80,"bearing":60,"mode":"indoor","location":{"floor":1,"latitude":52.519824,"longitude":13.569225}},{"accuracy":80,"bearing":60,"mode":"indoor","location":{"floor":1,"latitude":52.519899,"longitude":13.568823}},{"accuracy":80,"bearing":100,"mode":"indoor","location":{"floor":1,"latitude":52.519712,"longitude":13.568753}},{"accuracy":80,"bearing":100,"mode":"indoor","location":{"floor":1,"latitude":52.519800,"longitude":13.568163}},{"accuracy":80,"bearing":120,"mode":"indoor","location":{"floor":1,"latitude":52.519047,"longitude":13.567908}}]}')
$ = function(id) {
    return document.getElementById(id);
}

var show = function(id) {
    $(id).style.display ='flex';
}
var hide = function(id) {
    $(id).style.display ='none';
}
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var s = Snap(w,h);
var testgroup = s.group();
var centerx = w/2;
var centery = h - 100;
var g = s.group();
var karte = Snap.load("finalmap.svg", function ( loadedFragment ) {
    testgroup.append(loadedFragment);
    testgroup.transform('t289 R13 289 0');
} );

testgroup.appendTo(g);                                  //Funktionen wandeln längen und
                                                            // breitengrade in lokale koordinaten
var me = s.circle(centerx, centery, 15);
var anchorlat = 52.520290;
var anchorlong = 13.566929;
function latcoordinates(num) {
    var testxs = num;
    testxs=(anchorlat-testxs)/2;
    testxs=testxs*1000000;
    return testxs;
}
function longcoordinates(num) {
    var testxs = num;
    testxs=(testxs-anchorlong)/2;
    testxs=testxs*1000000;
    return testxs;
}

                                                            //Funktionen für die Route
function buildRoute() {
    for (i = 0; i < obj.Leg.length; i++) {
        var xs = obj.Leg[i].from.location.latitude;
        var ys = obj.Leg[i].from.location.longitude;
        var locpos = findLocalPos(ys,xs);
        var localxs = locpos[1];
        var localys = locpos[0];
        var xz = obj.Leg[i].to.location.latitude;
        var yz = obj.Leg[i].to.location.longitude;
        var locpoz = findLocalPos(yz,xz);
        var localxz = locpoz[1];
        var localyz = locpoz[0];

        var c  = s.circle(localys, localxs, 10);
        var l = s.line(localys, localxs, localyz, localxz);
        c.appendTo(g);
        l.appendTo(g);
    }
}

buildRoute();

var px;
var py;
var localpx;
var localpy;
var bearing;
var n = 0;
var prebearing;
bearingtest = [0];
//Mock für die Position(ändert sich alle 2 sek)
var change = setInterval(function() {
    if(n < 5) {
        py = loc.Position[n].location.latitude;
        px = loc.Position[n].location.longitude;
        var real = findLocalPos(px,py);
        localpy = real[1];
        localpx = real[0];
        bearing = loc.Position[n].bearing;
        console.log(bearing);
        n++;
    } else {clearInterval(change);}
}, 2000);
var counter = 0;
function getShortAngle(a1, a2) {                //Funktion lößt problem beim drehen der karte über 0grad
    var anglediff = a1 - a2;
    if (anglediff >= 180) {
        counter++;
    } if (anglediff < -180) {
        counter--;
    }
}

var x = 0;
function animate(){                                         //Animation zwischen einzelnen Positionen und Winkeln
    if(x < 5) {
        if (bearingtest.length > 2){
            bearingtest.splice(0,1);
        }
        bearingtest.push(bearing);
        prebearing = bearingtest[bearingtest.length - 2];
        console.log(prebearing);
        console.log(bearingtest);
        var diffx = centerx - localpx;
        var differencex = diffx.toString();
        var diffy = centery - localpy;
        var differencey = diffy.toString();
        getShortAngle(prebearing,bearing);
        var turnbearing = bearing + counter*360;
        g.animate({ transform: 't' + differencex + ' ' + differencey + 'R' + turnbearing + ' ' + centerx + ' ' + centery}, 2000);



        x++;
    } else {show('ziel');clearInterval(map);}
}
var map = setInterval(animate,2000);

function findLocalPos(lo,la){
    var mainscale = 10;
    var start = {
        latitude: 52.520290,
        longitude:  13.566909
    }
    var mid = {
        latitude: 52.520290,
        longitude: lo
    }
    var end = {
        latitude: la,
        longitude: lo
    }
    var mapstart = {
        latitude: 52.520235,
        longitude: 13.567306
    }
    var mapend = {
        latitude: 52.51995523,
        longitude: 13.56951535
    }
    var offsets = {
        latitude: 52.520290,
        longitude: 13.567306
    }
    var offset = {
        latitude: 52.520290,
        longitude: 13.566909
    }
    var offs = getDistance(offsets,offset);
    var maplenght = getDistance(mapstart,mapend);
    var distancex = getDistance(start,mid);
    var distancey = getDistance(mid,end);
    var realoff = offs*mainscale;
    var realx = distancex*mainscale;
    var realy = distancey*mainscale;
    var realmap = maplenght*mainscale;
    console.log(realmap);
    return [realx,realy];
}

function radians(n) {
    return n * (Math.PI / 180);
}
function degrees(n) {
    return n * (180 / Math.PI);
}

function getDistance(start, end){
    var R = 6371e3, // m
        dLat = radians(end.latitude - start.latitude),
        dLon = radians(end.longitude-start.longitude),
        lat1 = radians(start.latitude),
        lat2 = radians(end.latitude);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return d = R * c;
}







