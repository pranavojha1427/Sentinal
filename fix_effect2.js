const fs = require("fs");
let code = fs.readFileSync("src/components/StateRiskMap.tsx", "utf8");

const regex = /  \/\/ Load GeoJSON and pre-compute SVG paths[\s\S]*?  \}, \[country\]\r?\n  \);/;

const rep = `  // Load GeoJSON and pre-compute SVG paths
  useEffect(() => {
    setLoading(true);
    
    if (country === "India") {
      fetch("/india.geojson")
        .then((res) => res.json())
        .then((geojson) => {
          const mainland = {
            type: "FeatureCollection",
            features: geojson.features.filter(
              (f) => !ISLAND_TERRITORIES.includes(f.properties?.ST_NM || "")
            ),
          };
          const projection = geoMercator().fitExtent(
            [[30, 30], [WIDTH - 30, HEIGHT - 30]],
            mainland
          );
          const path = geoPath().projection(projection);
          const paths = geojson.features
            .map((feat) => ({
              name: (feat.properties?.ST_NM) || "Unknown",
              d: path(feat) || "",
            }))
            .filter((sp) => sp.d.length > 0);
          setStatePaths(paths);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading India map:", err);
          setLoading(false);
        });
      return;
    }

    let geoUrl = "";
    if (country === "All") {
      geoUrl = "https://code.highcharts.com/mapdata/custom/world.geo.json";
    } else {
      let hcPrefix = "";
      if (country === "China") {
        geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/china.geojson";
      } else {
        if (country === "Russia") hcPrefix = "ru";
        else if (country === "Brazil") hcPrefix = "br";
        else if (country === "South Africa") hcPrefix = "za";
        if (hcPrefix) {
          geoUrl = "https://code.highcharts.com/mapdata/countries/" + hcPrefix + "/" + hcPrefix + "-all.geo.json";
        }
      }
    }

    if (!geoUrl) {
      setStatePaths([]);
      setLoading(false);
      return;
    }

    fetch(geoUrl)
      .then((res) => res.json())
      .then((geojson) => {
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

        const projection = isProjected
          ? geoIdentity()
              .reflectY(true)
              .fitExtent(
                [[30, 30], [WIDTH - 30, HEIGHT - 30]],
                geojson
              )
          : geoMercator()
              .fitExtent(
                [[30, 30], [WIDTH - 30, HEIGHT - 30]],
                geojson
              );

        const path = geoPath().projection(projection);
        
        const paths = geojson.features
          .map((feat) => ({
            name: (feat.properties?.name) || "Unknown",
            d: path(feat) || "",
          }))
          .filter((sp) => sp.d.length > 0);
          
        setStatePaths(paths);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading BRICS map:", err);
        setStatePaths([]);
        setLoading(false);
      });
  }, [country]);`;

code = code.replace(regex, rep);

fs.writeFileSync("src/components/StateRiskMap.tsx", code, "utf8");

