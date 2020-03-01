var testModule = require('../helper.js');
var expect = require('chai').expect;

describe('Script', function() {
  describe('get station name', function() {
    it('should return correct station name if paramater contains zh-TW name', function() {
      var list =  [
                    { Value: "CAR QUALITY TN Zhonghua Store", Lang: "en-US" },
                    { Value: "車麗屋台南中華店站", Lang: "zh-TW" }
                  ]
      var result = testModule.getStationName(list);
      expect(result).to.equal('車麗屋台南中華店站');
    });
    it('should return substitute station name if paramater does not contain zh-TW name', function() {
      var list =  [{ Value: "CAR QUALITY TN Zhonghua Store", Lang: "en-US" }]
      var result = testModule.getStationName(list);
      expect(result).to.equal('未知站名');
    });
  });

  describe('generate geo json', function() {
    it('should return geo json format', function() {
      var data =  [
        { 
          Address: "Address Text",
          AvailableTime: "24HR",
          AvailableTimeByte: null,
          City: "City Text",
          District: "District Text",
          Id: "865a6d73-ab7d-4176-a542-09898fbf7dca",
          Latitude: 23.711194,
          LocName: "{\"List\": [{\"Value\": \"Gogoro Huwei Guangfu RS Center\",\"Lang\": \"en-US\"},{\"Value\": \"Gogoro 虎尾光復門市站\",\"Lang\": \"zh-TW\"}]}",
          Longitude: 120.433871,
          State: 1,
          ZipCode: "63244"
        },
        { 
          Address: "Address Text",
          AvailableTime: "24HR",
          AvailableTimeByte: null,
          City: "City Text",
          District: "District Text",
          Id: "8b8c3a4f-89a6-4544-9f69-116fab246164",
          Latitude: 23.788893,
          LocName: "{\"List\": [{\"Value\": \"7-ELEVEN Sanjing Store\",\"Lang\": \"en-US\"},{\"Value\": \"7-ELEVEN 三井店站\",\"Lang\": \"zh-TW\"}]}",
          Longitude: 120.471164,
          State: 1,
          ZipCode: "64881"
        }
      ];
      var result = testModule.generateGeoJson(data);

      var expectedResult = {
        type: 'FeatureCollection',
        features: [{ 
          type: 'Feature',
          properties: { 
            latitude: 23.711194, 
            longitude: 120.433871,
            name: 'Gogoro 虎尾光復門市站'
          }, 
          geometry: { type: 'Point', coordinates: [ 120.433871, 23.711194 ] }
        },
        { 
          type: 'Feature',
          properties: { 
            latitude: 23.788893, 
            longitude: 120.471164,
            name: '7-ELEVEN 三井店站'
          }, 
          geometry: { type: 'Point', coordinates: [ 120.471164, 23.788893 ] }
        }]
      }

      expect(result).to.deep.equal(expectedResult);
    });
  });
});