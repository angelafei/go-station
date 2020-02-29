// var mapboxTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//   });
var mapboxTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

  var map = L.map('map', { maxZoom: 12 });
    map.addLayer(mapboxTiles);
    map.setView([23.725969, 120.565414], 9);

  var overlayPane = d3.select(map.getPanes().overlayPane);
  var featuresdata, linePath, d3path, toLine, ptFeatures, marker, begend, text;
  var newGeoJson;
  var count = 0;

  function getStationName(list) {
    var result = list.filter(item => item.Lang === 'zh-TW');
    return result ? result[0].Value : '未知站名';
  }

  function generateGeoJson(data) {
    var geoJson = {}
    geoJson['type']= 'FeatureCollection';
    geoJson['features'] = [];
                            
    data.slice(0,4).map((item, index) => 
      geoJson['features'].push(
      {
        type: 'Feature',
        properties: { 
          latitude: item.Latitude, 
          longitude: item.Longitude,
          name: getStationName(JSON.parse(item.LocName).List)
        }, 
        geometry: { type: 'Point', coordinates: [ item.Longitude, item.Latitude ] }
      }));
    return geoJson;
  }

  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  function resetPoints(geoJson) {
    if (overlayPane.select("svg").length > 0) {
      overlayPane.select("svg").remove(); // reset
    }

    count = geoJson.features.length/2 > count ? count : 0;

    var svg = overlayPane.append("svg");
    svg.append("defs").append("pattern").attr("id","marker-image").attr("width", "20").attr("height", "20")
		   .append("image").attr("xlink:href","./marker.png").attr("width", "20").attr("height", "20");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    linePath = null;
    begend = null;
    var startPoint = geoJson['features'][2*count];
    var endPoint = geoJson['features'][2*count+1];

    var middlePointLat = (startPoint['properties']['latitude']+endPoint['properties']['latitude'])/2;
    var middlePointLng = Math.max(startPoint['properties']['longitude'], endPoint['properties']['longitude']) + Math.abs(startPoint['properties']['longitude'] - endPoint['properties']['longitude'])/2;
    var middlePoint = {
      type: 'Feature',
      properties: { 
          latitude: middlePointLat, 
          longitude: middlePointLng, 
          name: "along route"
      }, 
      geometry: { 'type': "Point", 'coordinates': [ middlePointLng, middlePointLat ] }
    };

    newGeoJson = { ...geoJson, features: [startPoint, middlePoint, endPoint] };
    featuresdata = newGeoJson.features;

    var transform = d3.geo.transform({
        point: projectPoint
    });

    d3path = d3.geo.path().projection(transform);
    toLine = d3.svg.line()
      .interpolate('basis')
      .x(function(d) {
          return applyLatLngToLayer(d).x
      })
      .y(function(d) {
          return applyLatLngToLayer(d).y
      });

    ptFeatures = g.selectAll("circle")
      .data(featuresdata)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("class", "waypoints");

    linePath = g.selectAll(".lineConnect")
      .data([featuresdata])
      .enter()
      .append("path")
      .attr("class", "lineConnect");
    
    marker = g.append("circle")
      .attr("r", 12)
      .attr("id", "marker")
      .attr("class", "travelMarker");


    var originANDdestination = [featuresdata[0], featuresdata[2]];

    begend = g.selectAll(".station")
      .data(originANDdestination)
      .enter()
      .append("circle", ".station")
      .attr("r", 10)
      // .style("fill", "red")
      .style("fill", "url('#marker-image')")
      .style("opacity", "1");

    text = g.selectAll("text")
      .data(originANDdestination)
      .enter()
      .append("text")
      .text(function(d) {
        return d.properties.name
      })
      .attr("class", "locnames")
      // .attr("y", function(d) {
      //   return -10
      // });
      .attr("x", function(d) {
        return 20
      })
      .attr("y", function(d) {
        return 5
      });

      count ++;

      map.setView([middlePointLat, middlePointLng], 10);
    }

    // Reposition the SVG to cover the features.
    function reset() {
      var bounds = d3path.bounds(newGeoJson),
        topLeft = bounds[0],
        bottomRight = bounds[1];

      text.attr("transform",
        function(d) {
          return "translate(" +
            applyLatLngToLayer(d).x + "," +
            applyLatLngToLayer(d).y + ")";
        });

      begend.attr("transform",
        function(d) {
          return "translate(" +
            applyLatLngToLayer(d).x + "," +
            applyLatLngToLayer(d).y + ")";
        });

      ptFeatures.attr("transform",
        function(d) {
          return "translate(" +
            applyLatLngToLayer(d).x + "," +
            applyLatLngToLayer(d).y + ")";
        });

      marker.attr("transform",
        function() {
          var y = featuresdata[0].geometry.coordinates[1]
          var x = featuresdata[0].geometry.coordinates[0]
          return "translate(" +
            map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
            map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
        });

      var svg = overlayPane.select("svg");
      var g = svg.select("g");

      svg.attr("width", bottomRight[0] - topLeft[0] + 200)
        .attr("height", bottomRight[1] - topLeft[1] + 200)
        .style("left", topLeft[0] - 50 + "px")
        .style("top", topLeft[1] - 50 + "px");

      linePath.attr("d", toLine)
      g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");

    }

    function tweenDash() {
      return function(t) {
        //total length of path (single value)
        var l = linePath.node().getTotalLength(); 
        interpolate = d3.interpolateString('0,' + l, l + ',' + l);
        var marker = d3.select('#marker');
        var p = linePath.node().getPointAtLength(t * l);

        //Move the marker to that point
        marker.attr('transform', 'translate(' + p.x + ',' + p.y + ')'); //move marker
        
        return interpolate(t);
      }
    }

    function applyLatLngToLayer(d) {
      let y = d.geometry.coordinates[1];
      let x = d.geometry.coordinates[0];
      return map.latLngToLayerPoint(new L.LatLng(y, x));
    }

    d3.json("https://wapi.gogoro.com/tw/api/vm/list", function(collection){
      var geoJson = generateGeoJson(collection.data);

      map.on("viewreset", reset);
      transition();

      function transition() {
        resetPoints(geoJson);
        reset();
        linePath.transition()
          .duration(5000)
          .attrTween('stroke-dasharray', tweenDash)
          .each('end', function() {
            d3.select(this).call(transition); // loop
        }); 
      }
      
  });