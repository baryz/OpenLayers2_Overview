var EXTERNAL_SERVICES = {
    IGIK: 'http://212.180.216.237/geoserver/igik/wms',
}
var sketchSymbolizers = {
                "Point": {
                    pointRadius: 4,
                    graphicName: "square",
                    fillColor: "white",
                    fillOpacity: 1,
                    strokeWidth: 1,
                    strokeOpacity: 1,
                    strokeColor: "yellow"
                },
                "Line": {
                    strokeWidth: 3,
                    strokeOpacity: 1,
                    strokeColor: "#666666",
                    strokeDashstyle: "dash"
                },
                "Polygon": {
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    strokeColor: "#666666",
                    fillColor: "white",
                    fillOpacity: 0.3
                }
};

var MAX_PATH_LEN = 100;  //m
var MAX_POLYGON_AREA = 20000; //m^2

var UNIT_LEN = "m";
var UNIT_AREA = "m <sup>2</sup>";

var OL_TYPE_POINT = "OpenLayers.Geometry.Point";
var OL_TYPE_LINEAR_RING = "OpenLayers.Geometry.LinearRing";

//Examples cordinates
//TG
var lonTG = 18.85432;
var latTG = 50.45059;

//OlympiaStadion
var lonOlymp = 13.2389011;
var latOlymp = 52.5142522;

Proj4js.defs['EPSG:2180'] = '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
//
Proj4js.defs['EPSG:4326'] = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
Proj4js.defs['EPSG:900913'] = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs';
//Google
Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
Proj4js.defs["EPSG:3785"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs";
