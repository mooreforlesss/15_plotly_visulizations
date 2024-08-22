function markerSize(mag) {
    let radius = 1;
    if (mag > 1) {
        radius = mag * 25000
    }
    return radius;
}


// Custom named function
function chooseColor(depth) {
    let color = "black";
  
    // Switch on borough name
    if (depth <= 10) {
      color = "#98EE00";
    } else if (depth <= 30) {
      color = "#D4EE00";
    } else if (depth <= 50) {
      color = "#EECC00";
    } else if (depth <= 70) {
      color = "#EE9C00";
    } else if (depth <= 90) {
      color = "#EA822C";
    } else {
      color = "#EA2C2C";
    }
  
    // return color
    return (color);
  }

function createMap(data) {
    // STEP 1: Init the Base Layers
  
    // Define variables for our tile layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Step 2: Create the Overlay layers
    let markers = L.markerClusterGroup();
    let heatArray = [];
    let circleArray = [];
  
    for (let i = 0; i < data.length; i++){
      let row = data[i];
      let location = row.geometry;
  
      // create marker
      if (location) {
        // extract coord
        let point = [location.coordinates[1], location.coordinates[0]];
  
        // make marker
        let marker = L.marker(point);
        let popup = `<h1>${row.properties.title}</h1>`;
        marker.bindPopup(popup);
        markers.addLayer(marker);
  
        // add to heatmap
        heatArray.push(point);

        // create circle
        let cirlcMarker = L.circle(point, {
            fillOpacity: 0.75,
            color: chooseColor(location.coordinates[2]),
            fillcolor: chooseColor(location.coordinates[2]),
            radius: markerSize(row.properties.mag)
        }).bindPopup(popup);

        circleArray.push(cirlcMarker);
      }
    }
  
    // create layer
    let heatLayer = L.heatLayer(heatArray, {
      radius: 25,
      blur: 20
    });

    let circleLayer = L.layerGroup(circleArray)
  
    // Step 3: BUILD the Layer Controls
  
    // Only one base layer can be shown at a time.
    let baseLayers = {
      Street: street,
      Topography: topo
    };
  
    let overlayLayers = {
      Markers: markers,
      Heatmap: heatLayer,
      Circles: circleLayer
    }
  
    // Step 4: INIT the Map
    let myMap = L.map("map", {
      center: [40, -90],
      zoom: 4,
      layers: [street, markers]
    });
  
  
    // Step 5: Add the Layer Control filter + legends as needed
    L.control.layers(baseLayers, overlayLayers).addTo(myMap);
    

    // Step 6: Legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    let legendInfo = "<h4>Legend</h4>"
    legendInfo += "<i style='background: #98EE00'></i>-10-10<br/>";
    legendInfo += "<i style='background: #D4EE00'></i>10-30<br/>";
    legendInfo += "<i style='background: #EECC00'></i>30-50<br/>";
    legendInfo += "<i style='background: #EE9C00'></i>50-70<br/>";
    legendInfo += "<i style='background: #EA822C'></i>70-90<br/>";
    legendInfo += "<i style='background: #EA2C2C'></i>90+";

    div.innerHTML = legendInfo;
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);
  }
  
  function doWork() {

    // Assemble the API query URL.
    let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
  
    d3.json(url).then(function (data) {
      // console.log(data);
        let data_rows = data.features;
      createMap(data_rows);
    });
  }
  
  doWork();
  