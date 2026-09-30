const fs = require('fs');
const { geoMercator, geoIdentity, geoPath } = require('d3-geo');

fetch('https://code.highcharts.com/mapdata/custom/world.geo.json')
  .then(res => res.json())
  .then(geojson => {
      let isProjected = false;
      try {
        let coords = geojson.features[0].geometry.coordinates;
        while (Array.isArray(coords[0])) {
          coords = coords[0];
        }
        if (Math.abs(coords[0]) > 180) {
          isProjected = true;
        }
      } catch (e) {}
      
      console.log('isProjected', isProjected);

      const projection = isProjected
          ? geoIdentity()
              .reflectY(true)
              .fitExtent(
                [[30, 30], [600 - 30, 720 - 30]],
                geojson
              )
          : geoMercator()
              .fitExtent(
                [[30, 30], [600 - 30, 720 - 30]],
                geojson
              );

      const path = geoPath().projection(projection);
      
      const paths = geojson.features
          .map((feat) => ({
            name: (feat.properties?.name) || 'Unknown',
            d: path(feat) || '',
          }))
          .filter((sp) => sp.d.length > 0);
          
      console.log('Paths generated:', paths.length);
      console.log('India generated?', paths.some(p => p.name === 'India'));
  });
