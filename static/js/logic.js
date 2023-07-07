// Ensuring that the links work
console.log("Hello World")



// Create initial tile layers, a layerGroup for the earthquakes and a layer control
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' + '<br> Alex Kopp <a href="https://github.com/alexkopp12/leaflet-challenge/">OpenStreetMap</a>'
})

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a baseMaps object.
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};


let earthquakes = new L.layerGroup();

let overlayMaps = {
    Earthquakes: earthquakes
  };

let myMap = L.map("map", {
center: [
    37.09, -95.71
],
zoom: 5,
layers: [street, earthquakes]
});

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

//Get Earthquake Data

let earthquakeQuery = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a D3.json request to the query URL - Ajax type function/
d3.json(earthquakeQuery).then(function (data) {
  // Once we get a response, console log the data.
  console.log(data.features);

  function markerColor(depth) {
    return depth > 200 ? '#762a83' :
    depth > 100  ? '#9970ab' :
    depth > 50  ? '#c2a5cf' :
    depth > 25  ? '#d9f0d3' :
    depth > 10   ? '#a6dba0' :
    depth > 5   ? '#EEB24C' :
    depth > 1   ? '#5aae61' :
              '#1b7837';
  };
  

  //Marker Size Function
  function markerSize(magnitude) {
    return magnitude * 4
  };

  function styleInfo(feature) {
  // create a GeoJSON layer using data
    return {
      radius: markerSize(feature.properties.mag),
      fillColor: markerColor(feature.geometry.coordinates[2]),
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: .9
      }
  };

  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, styleInfo)
    },

    style: styleInfo,
    // Use onEachFeature to add a popup with location, time, magnitude, and depth
    onEachFeature: function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p></h3>Magnitude: ${feature.properties.mag.toLocaleString()}</h3></h3> Depth: ${feature.geometry.coordinates[2].toLocaleString()}</h3>`)
    }

  }).addTo(myMap)

  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 5, 10, 25, 50, 100, 200],
      labels = [];

    div.innerHTML += "Depth (km) <br>"
    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};
  
  legend.addTo(myMap);

  let info = L.control();

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
      this._div.innerHTML = '<h4>USGS Earthquake Data over Past 7 Days</h4>'
    };

  info.addTo(myMap);
});