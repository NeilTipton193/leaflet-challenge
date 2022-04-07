//generate tile layers
var defaultView = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//generate greyscale layer
var greyscaleView = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});


//generate topo layer
var topoView = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

//generate basemaps object
let basemaps= {
    Default: defaultView,
    GrayScale: greyscaleView,
    Topographic: topoView
}

//generate map object
var worldMap = L.map("map", {
    center: [35.6762, 139.6503],
    zoom: 5,
    layers: [defaultView,greyscaleView, topoView]
})

// add map object to maps
defaultView.addTo(worldMap);

//generate layer for tectonic data
let tectPlates = new L.layerGroup();

//generate layer for earthquake data
let earthQuakes = new L.layerGroup();

// add the overlay for tectPlates
let overlays = {
    "Tectonic Plates": tectPlates
}

//add a layer control
L.control
    .layers(basemaps, overlays)
    .addTo(worldMap);

//call GeoJSON api
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
    .then(function(quakeData){
        //plot circles such that the radius depends on the earthquake magnitude, color depends on depth
        //create function that chooses color based on depth
        function dataColor(depth){
            if (depth > 90)
                return "red";
            else if (depth > 70)
                return "#fc4903";
            else if (depth > 50)
                return "#fc8403";
            else if (depth > 30)
                return "#fcad03";
            else if (depth > 10)
                return "#cafc03";
            else
                return "green";
        }
        //create function that determines radius size
        function radiusSize(mag){
            if (mag==0)
                return 1;
            else
                return mag*4;
        }
        // create function to add style
        function dataStyle(feature){
            return {
                opacity: 1,
                fillOpacity: 1,
                fillColor: dataColor(feature.geometry.coordinates[2]), //index 2 is depth, 0 and 1 are lat and long
                color: "000000",
                radius: radiusSize(feature.properties.mag), 
                weight: 0.5
            }
        }
        //add GeoJson data to layer group
        L.geoJson(quakeData, {
            pointToLayer: function(feature, latLong){
                return L.circleMarker(latLong);
            }
        }).addTo(earthQuakes);
    })


//Call api using D3
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    .then(function(plotData){
    L.geoJson(plotData,{
        // add styling to make lines visible
        color: "yellow",
        weight: 1
    }).addTo(tectPlates)
    });

// add tectPlates to map
tectPlates.addTo(worldMap);

