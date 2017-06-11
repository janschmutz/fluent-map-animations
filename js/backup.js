/**
 * Created by janschmutz on 11.02.17.
 */
controller('guidance', {

    load: function(){
        var model = {};

        var device = window.guidance.getDevice('mock');
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var s = Snap(w,h);
        var testgroup = s.group();
        var g = s.group();
        var centerx = w/2;
        var centery = h - 100;
        var me = s.circle(centerx, centery, 15);
        var p = s.polygon(centerx,centery-8,centerx-8,centery+8,centerx+8,centery+8);
        var karte = Snap.parse(template('map.svg',{}));
        testgroup.append(karte);
        testgroup.transform('t280 R13 280 0');
        testgroup.appendTo(g);
        var interval;

        var view = new Guidance(model, {


            onStart : function(){
                device.start(null, null); // mock device does not care about the actual route
            },
            onStop : function(){
                device.stop();
            }
        });

        device
            .on('stop', function(e){
                window.clearInterval(interval);
                interval = null;
                view.update({ leg: null, position: null});
            })
            .on('start', function(e){
                console.log(e);
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

                function buildRoute() {
                    for (i = 0; i < e.route.length; i++) {
                        var xs = e.route[i].from.location.latitude;
                        var ys = e.route[i].from.location.longitude;
                        var locpos = findLocalPos(ys,xs);
                        var localxs = locpos[1];
                        var localys = locpos[0];
                        var xz = e.route[i].to.location.latitude;
                        var yz = e.route[i].to.location.longitude;
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
                /*view.update({leg: e.current});*/

                var counter = 1;
                function getShortAngle(a1, a2) {                //Funktion lößt problem beim drehen der karte über 0grad
                    var anglediff = a1 - a2;
                    if (anglediff >= 180) {
                        counter++;
                    } if (anglediff < -180) {
                        counter--;
                    }
                }

                bearings = [0];
                interval = window.setInterval(function(){
                    var position = device.getCurrentPosition();
                    if (typeof position !== 'undefined'){
                        var bearing = position.bearing;
                        var px = position.location.latitude;
                        var py = position.location.longitude;
                        var realpos = findLocalPos(py,px);
                        var localpy = realpos[1];
                        var localpx = realpos[0];
                        console.log(localpx,localpy);
                        if (bearings.length > 2){
                            bearings.splice(0,1);
                        }
                        bearings.push(bearing);
                        var prebearing = bearings[bearings.length - 2];;
                        var diffx = centerx - localpx;
                        var differencex = diffx.toString();
                        var diffy = centery - localpy;
                        var differencey = diffy.toString();
                        getShortAngle(prebearing,bearing);
                        var turnbearing = Math.ceil(bearing + counter*360);
                        /*console.log(px,py,bearing);*/
                        /*g.transform('t' + differencex + ' ' + differencey + 'R' + turnbearing + ' ' + centerx + ' ' + centery);*/
                    }

                }, 500);

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

                    var distancex = getDistance(start,mid);
                    var distancey = getDistance(mid,end);
                    var realx = distancex*mainscale;
                    var realy = distancey*mainscale;
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
            })
            .on('turn', function(e){
                view.update({leg: e.current});
            })
            .on('end', function(e){
                view.update({ leg: null, position: null});
            });

        view.bind('main');

        this._view = view;
    },

    unload : function(){
        var view = this._view;

        if(view){
            view.unbind();
        }

        delete this._view;
    }
})