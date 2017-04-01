var routes1;
var stops1;
var massRoutesBus = [];
var massStopsBus = [];
var massStops = [];
var massStopsName = [];
var masLat = [];
var masLng = [];
var markers = [];
var map;
function CSVToArray(strData) {
    var objPattern = new RegExp(("(\\" + ";" + "|\\r?\\n|\\r|^)" + "(?:\'([^\']*(?:\'\'[^\']*)*)\'|" +
    "([^\'\\" + ";" + "\\r\\n]*))"), "gi");
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];
        if (strMatchedDelimiter.length && (strMatchedDelimiter != ";")) {
            arrData.push([]);
        }
        if (arrMatches[2]) {
            var strMatchedValue = arrMatches[2].replace(
            new RegExp("\"\"", "g"), "\"");
        } 
        else {
            var strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    return (arrData);
};
function CSV2JSON(csv) {
    var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var masKey = array[0][k].split(";");
            var masValue = array[i][k].split(";");
            for (var j = 0; j < masKey.length; j++) {
            	var key = masKey[j];
            	objArray[i - 1][key] = masValue[j];
            	};	
        }
    }
	return objArray;
};

window.onload = function(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://gp-js-test.herokuapp.com/proxy/http://www.minsktrans.by/city/minsk/routes.txt', true);
  xhr.send();
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) {
      return;
    }
    if (xhr.status != 200 && xhr.status != 0) {
      alert(xhr.status + ': ' + xhr.statusText);
      return;
    }
    routes1 = CSV2JSON(xhr.responseText);
    getRoutesBusAB();
  };
  var xhr1 = new XMLHttpRequest();
  xhr1.open('GET', 'https://gp-js-test.herokuapp.com/proxy/http://www.minsktrans.by/city/minsk/stops.txt', true);
  xhr1.send();
  xhr1.onreadystatechange = function() {
    if (xhr1.readyState != 4) {
      return;
    }
    if (xhr1.status != 200 && xhr1.status != 0) {
      alert(xhr1.status + ': ' + xhr1.statusText);
      return;
    }
    stops1 = CSV2JSON(xhr1.responseText);
    getStopsBus();
  };
};

function getStopsBus(){
	for (var i = 0; i <  stops1.length; i++) {
		if (stops1[i]["Lat"] !=""){
			massStopsBus.push(stops1[i]);
		};
	};
	for (var i = 0; i < massStopsBus.length; i++) {
		if(massStopsBus[i]["Name"] == "" ){
			var c = massStopsBus[i]["Stops"].split(",");
			var c1;
			var c2;
			var c3;
			for (var j = 0; j < massStopsBus.length; j++) {
				if(massStopsBus[j]["ID"] == c[0]){
					c1 = j
				}
				else if(massStopsBus[j]["ID"] == c[1]){
						c2 = j
				}
				else if(massStopsBus[j]["ID"] == c[2]){
						c3 = j
				}
			};
			if (massStopsBus[c1]["Name"]!=""){
				massStopsBus[i]["Name"] = massStopsBus[c1]["Name"]
			}
			else {massStopsBus[i]["Name"] = massStopsBus[c2]["Name"]}
		};
	};
};

function getRoutesBusAB(){
	var listRoutes = "<ul onmousedown='return false' onselectstart='return false'>";
	var c = 0;
	for (var i = 0; i <  routes1.length; i++) {
		if (routes1[i]["RouteType"] =="A>B"){
			if(routes1[i]["Transport"]=="metro"){break};
			massRoutesBus.push(routes1[i]);
			listRoutes +="<li id='"+c+"'onclick='showMarkers("+c+")'>"+routes1[i]["RouteNum"]+"  "+routes1[i]["RouteName"]+"<br></li>"
			c++;
			};
	};
	listRoutes +="</ul>";
	document.getElementById("listRoutesAB").innerHTML = listRoutes;
};

function initMap() {
	var minskTransCenterGPS = '27592013;53903311'.split(';')
	var centerGPS = {
    	lat: toGPS(minskTransCenterGPS[1]),
    	lng: toGPS(minskTransCenterGPS[0])
  	};
  	map = new google.maps.Map(document.getElementById('map'), {
    	zoom: 11,
    	zoomControl: false,
    	streetViewControl:false,
    	mapTypeControl:false,
    	center: centerGPS
  	});
};

function toGPS(bs) {
  	var tmp = bs.split('')
  	tmp.splice(2, 0, '.')
  	return parseFloat(tmp.join(''))
};

function getmassStopsForRoute(number){
	massStops = massRoutesBus[number]["RouteStops"].split(',');
	};

function getCoorStops(stopsID){
	for (var i = 0; i < massStopsBus.length; i++) {
		if(massStopsBus[i]["ID"] == stopsID){
			masLat.push(massStopsBus[i]["Lat"]);
			masLng.push(massStopsBus[i]["Lng"]);
			massStopsName.push(massStopsBus[i]["Name"]);
		};
	};
};

function getmassCoorPoints(){
	for (var i = 0; i < massStops.length; i++) {
		getCoorStops(massStops[i]);
	};
};

function addMarker(location, title) {
  	var contentString = '<div id="content">'+title+'</div>';
	var infowindow = new google.maps.InfoWindow({
    	content: contentString
  	});
  	var marker = new google.maps.Marker({
    	position: location,
    	map: map
  	});
  	marker.addListener('click', function() {
    infowindow.open(map, marker);
  	});  
  	markers.push(marker);
};

function getMarkers(){
	for (var i = 0; i < massStopsName.length; i++) {
		var obj = {};
		obj.lat = toGPS(masLat[i]);
		obj.lng = toGPS(masLng[i]);
		addMarker(obj, massStopsName[i]);
	};
};

function showMarkers(r){
	deleteMarkers();
	getmassStopsForRoute(r);
	getmassCoorPoints();
	getMarkers();
	var temp = document.getElementById(r);
	temp.style.backgroundColor = "red";
};

function setMapOnAll(map) {
  	for (var i = 0; i < markers.length; i++) {
    	markers[i].setMap(map);
  	};
};

function clearMarkers() {
  	setMapOnAll(null);
};

function deleteMarkers() {
  	clearMarkers();
  	markers = [];
  	masLat = [];
  	masLng = [];
  	massStopsName = [];
  	for (var i = 0; i < massRoutesBus.length; i++) {
   		var temp = document.getElementById(i);
  		temp.style.backgroundColor = "";
 	 };
};
