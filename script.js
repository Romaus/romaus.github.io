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
var opts = {
  	lines: 13 , 
  	length: 28, 
  	width: 14, 
  	radius: 42, 
  	scale: 1, 
  	corners: 1, 
  	color: '#D62929', 
  	opacity: 0.25, 
  	rotate: 0, 
  	direction: 1, 
  	speed: 1.8, 
  	trail: 100 , 
  	fps: 60 , 
  	zIndex: 2e9, 
  	className: 'spinner', 
  	top: '60%', 
  	left: '50%', 
  	shadow: false, 
  	hwaccel: false, 
  	position: 'absolute'
};
var target = document.getElementById('loading');
var spinner = new Spinner(opts).spin(target);

const csvToJson = csv => {
  const [firstLine, ...lines] = csv.split('\n');
  return lines.map(line =>
    firstLine.split(';').reduce(
      (curr, next, index) => ({
        ...curr,
        [next]: line.split(';')[index],
      }),
      {}
    )
  );
};

window.onload = function(){
	if (localStorage.minsktransAppLastDate === undefined || (Date.now() - localStorage.minsktransAppLastDate) > 86400000) {
		localStorage.minsktransAppLastDate = Date.now();
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
			localStorage.minsktransAppRoutes = xhr.responseText;
			routes1 = csvToJson(xhr.responseText);
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
			localStorage.minsktransAppStops = xhr1.responseText;
    	stops1 = csvToJson(xhr1.responseText);
    	getStopsBus();
  	};
	} else {
		routes1 = csvToJson(localStorage.minsktransAppRoutes);
  	getRoutesBusAB();
  	stops1 = csvToJson(localStorage.minsktransAppStops);
  	getStopsBus();
	}
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
	let backgroundColor = "rgba(255,0,0,0.3)";
	for (var i = 0; i <  routes1.length; i++) {
		if (routes1[i]["RouteType"] =="A>B" && routes1[i]["RouteNum"]!=""){
			if(routes1[i]["Transport"]=="tram"){
				backgroundColor = "rgba(0,255,0,0.3)"
			}
			else if (routes1[i]["Transport"]=="trol") {
				backgroundColor = "rgba(0,0,255,0.3)"
			}
			massRoutesBus.push(routes1[i]);
			listRoutes +=`<div style='background-color:${backgroundColor}'><li style='margin:0' id='`+c+"'onclick='showMarkers("+c+")'>"+routes1[i]["RouteNum"]+"  "+routes1[i]["RouteName"]+"</li></div>"
			c++;
			};
	};
	listRoutes +="</ul>";
	document.getElementById("listRoutesAB").innerHTML = listRoutes;
};

function initMap() {
	var minskTransCenterGPS = '27443346;53909250'.split(';')
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
	if (massRoutesBus[number]["RouteStops"]!=""){
		massStops = massRoutesBus[number]["RouteStops"].split(',');}
	else if(massRoutesBus[number]["RouteStops"]==""){
		for (var i = 0; i < routes1.length; i++) {
			if(routes1[i]["RouteID"] == massRoutesBus[number]["RouteID"]){
				massStops = routes1[i+1]["RouteStops"].split(',').reverse();
			}
		};
	}
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

function calcDistanceRoute(){
	var dis = 0;
	var time = 0;
	for (var i = 0; i < massStopsName.length-1; i++) {
		var p1 = new google.maps.LatLng(toGPS(masLat[i]), toGPS(masLng[i]));
    	var p2 = new google.maps.LatLng(toGPS(masLat[i+1]), toGPS(masLng[i+1]));
    	var distance = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
       	dis+=distance;
    };
    time = dis/270;
    var text;
    text = "Длина маршрута составляет "+dis.toFixed(2)+" метров <br><br>Длительность маршрута равна " +time.toFixed(0)+" мин."
   	var temp = document.getElementById("disRoutes");
   	temp.innerHTML = text;
   	temp.style.display = "block";
};

function showMarkers(r){
	deleteMarkers();
	getmassStopsForRoute(r);
	getmassCoorPoints();
	getMarkers();
	calcDistanceRoute();
	var temp = document.getElementById(r);
	temp.style.backgroundColor = "#D62929";
	temp.style.boxShadow = "inset 0 0 6px rgba(0,0,0,.3)";
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
  		temp.style.boxShadow = "";
 	 };
};
