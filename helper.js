function getStationName(list) {
    console.log('here');
    var result = list.filter(item => item.Lang === 'zh-TW');
    return result.length > 0 ? result[0].Value : '未知站名';
}


function generateGeoJson(data) {
    var geoJson = {}
    geoJson['type']= 'FeatureCollection';
    geoJson['features'] = [];
                            
    data.map(item => 
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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        getStationName: getStationName,
        generateGeoJson: generateGeoJson
    };
  }
  else {
      window.getStationName = getStationName;
      window.generateGeoJson = generateGeoJson;
  }
