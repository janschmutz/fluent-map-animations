/**
 * Created by janschmutz on 10.01.17.
 */
$ = function(id) {
    return document.getElementById(id);
}

var show = function(id) {
    $(id).style.display ='flex';
}
var hide = function(id) {
    $(id).style.display ='none';
}