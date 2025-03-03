// 1️⃣ Create the base tile layers
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

let streetmap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenTopoMap contributors'
});

// 2️⃣ Create layer groups for earthquakes and tectonic plates
let earthquakeLayer = new L.LayerGroup();
let tectonicPlatesLayer = new L.LayerGroup();

// 3️⃣ Create the map object
let map = L.map("map", {
  center: [20, 0], // Centered at equator
  zoom: 2,
  layers: [basemap, earthquakeLayer] // Default layers
});

// 4️⃣ Add layer control to switch between maps and overlays
let baseMaps = {
  "Default Map": basemap,
  "Street Map": streetmap
};

let overlayMaps = {
  "Earthquakes": earthquakeLayer,
  "Tectonic Plates": tectonicPlatesLayer
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// 5️⃣ Fetch earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Function to define marker styles
  function styleInfo(feature) {
      return {
          radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
      };
  }

 
  // Function to determine color based on depth
function getColor(depth) {
  return depth > 90  ? '#FF0000' :
         depth > 70  ? '#FF7F00' : 
         depth > 50  ? '#FFFF00' : 
         depth > 30  ? '#7FFF00' : 
         depth > 10  ? '#00FF00' : 
         depth > -10 ? '#00FF7F' : 
                       '#00FF7F'; 
}

  // Function to determine radius based on magnitude
  function getRadius(magnitude) {
      return magnitude ? magnitude * 4 : 1;
  }

  // Add earthquake data as circle markers
  L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function (feature, layer) {
          layer.bindPopup(`
              <b>Location:</b> ${feature.properties.place} <br>
              <b>Magnitude:</b> ${feature.properties.mag} <br>
              <b>Depth:</b> ${feature.geometry.coordinates[2]} km <br>
              <b>Time:</b> ${new Date(feature.properties.time).toLocaleString()}
          `);
      }
  }).addTo(earthquakeLayer);
});

// 6️⃣ Add a legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  let grades = [0, 10, 30, 50, 70, 100];
  let colors = ["#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026", "#800026"];

  div.innerHTML = "<strong>Depth (km)</strong><br>";
  for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }
  return div;
};
legend.addTo(map);

// 7️⃣ Fetch and add tectonic plates data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plateData) {
  L.geoJson(plateData, {
      style: {
          color: "orange",
          weight: 2
      }
  }).addTo(tectonicPlatesLayer);
});
