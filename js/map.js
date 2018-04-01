
var Map = function(mapID) {

    //Last clicked Point
    this.previousPoint;
    //Last drawed lines in drawing Path(Multiline)
    this.drawLines = [];
    //Last measure of drawed geometry
    this.lastMeasure;
    //Polygon points
    this.nodesOfPolygon = [];

    this.previousFeature;

    this.zoom = 19;

    this.layerCMP500 = new OpenLayers.Layer.WMS('CMP_500', EXTERNAL_SERVICES.IGIK, {
        layers: 'cmp500',
        format: 'image/png',
        version: '1.3.0',
        transparent: true,
        crs: 'EPSG:3857'
    }, {
        isBaseLayer: false,
        visibility: false,
        projection: 'EPSG:3857'
    });

    this.layerCMP1000 = new OpenLayers.Layer.WMS('CMP_1000', EXTERNAL_SERVICES.IGIK, {
        layers: 'cmp1000_all',
        format: 'image/png',
        version: '1.3.0',
        crs: 'EPSG:3857',
        transparent: true
    }, {
        isBaseLayer: false,
        displayOutsideMaxExtent: true,
        visibility: false,
    });

    this.both = new OpenLayers.Layer.WMS('BOTH', EXTERNAL_SERVICES.IGIK, {
        layers: 'cmp1000_all,cmp500',
        format: 'image/png',
        version: '1.3.0',
        transparent: true,
    }, {
        isBaseLayer: false,
        displayOutsideMaxExtent: true,
        projection: 'EPSG:3857',
        yx: true
    });

    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
        renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    
    this.layersListeners =  {
        vertexmodified: function(event) {
            var geom = event.feature.geometry;
            var type = geom.componentTypes;

            if(OL_TYPE_POINT == type) {
                var length = geom.getGeodesicLength('EPSG:3857');
                self.showMeasure(length, UNIT_LEN);
            }else if(OL_TYPE_LINEAR_RING == type){
                var area = geom.getGeodesicArea('EPSG:3857');
                self.showMeasure(area, UNIT_AREA);
            }
            
            
            
        },
        afterfeaturemodified: function(event) {
            var geom = event.feature.geometry.clone();
            var type = geom.componentTypes;
            
            if(OL_TYPE_POINT == type){
                var length = geom.getGeodesicLength('EPSG:3857');
                if(length > MAX_PATH_LEN){
                    alert('Maximum allow length of path is '+ MAX_PATH_LEN + ', please edit current path');
                    self.switchFeature();
                    self.drawControls.modify.selectFeature(event.feature);
                }else{
                    alert("Ok kkk");
                }

            }else if(OL_TYPE_LINEAR_RING == type){
               var area = geom.getGeodesicArea('EPSG:3857');
                if(area > MAX_POLYGON_AREA){
                    alert('Maximum allow area of polygon is '+ MAX_POLYGON_AREA + ', please edit polygon');
                    self.switchFeature();
                    self.drawControls.modify.selectFeature(event.feature);
                }else{
                    alert("Ok");
                }
            }

            self.previousFeature = event.feature.clone();
        },
        featureunselected: function(feature){
            console.log("featureunselected !");
            var geom = feature.feature.geometry;
            var type = geom.componentTypes;
            console.log('TYPE: ' + type);
        },
        featureuelected: function(feature){
            console.log("featureuelected !");
            var geom = feature.feature.geometry;
            var type = geom.componentTypes;
            console.log('TYPE: ' + type);
        }
    };


    this.vectors = new OpenLayers.Layer.Vector("Vector Layer", {
        renderers: renderer,
        eventListeners : this.layersListeners
    });

    this.map = new OpenLayers.Map(mapID, {
        controls: [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.LayerSwitcher(),
            new OpenLayers.Control.MousePosition({displayProjection: 'EPSG:4326'})
        ],
        projection: 'EPSG:3857',
    });

    this.drawControls = {
        point: new OpenLayers.Control.DrawFeature(this.vectors, OpenLayers.Handler.Point),
        line: new OpenLayers.Control.DrawFeature(this.vectors, OpenLayers.Handler.Path,{
                        callbacks : {
                        create: function () {
                            self.drawLines = [];
                            self.previousPoint = null;
                            self.showMeasure(0.0, UNIT_LEN);
                        },
                        modify: function(aPoint){
                                if(self.previousPoint != null){
                                var segment = new OpenLayers.Geometry.LineString([self.previousPoint, aPoint]);
                                var dist = segment.getGeodesicLength('EPSG:3857');
                                var multiLine = new OpenLayers.Geometry.MultiLineString(self.drawLines);
                                var distMultiLine = multiLine.getGeodesicLength('EPSG:3857');
                                var currentDistance = distMultiLine + dist;
                                self.showMeasure(currentDistance, "m");
                                }
                        },
                        point : function(aPoint){
                            if(self.previousPoint != null){
                                var segment = new OpenLayers.Geometry.LineString([self.previousPoint, aPoint]);
                                var dist = segment.getGeodesicLength('EPSG:3857');
                                self.drawLines.push(segment.clone());
                                var multiLine = new OpenLayers.Geometry.MultiLineString(self.drawLines);
                                var distMultiLine = multiLine.getGeodesicLength('EPSG:3857');
                                self.showMeasure(distMultiLine, "m");
                            }
                            
                            self.previousPoint = aPoint.clone();
                        }
                    }
                }),
        polygon: new OpenLayers.Control.DrawFeature(this.vectors, OpenLayers.Handler.Polygon,{
                        persist: true,
                        callbacks : {
                            create : function(){
                                self.drawLines = [];
                                self.previousPoint = null;
                                self.nodesOfPolygon = [];

                                self.showMeasure(0.0, "m <sup>2</sup>");
                            },
                            modify: function(aPoint){
                                if(self.nodesOfPolygon.length > 1){
                                    var tempNodes = Array.from(self.nodesOfPolygon);
                                    tempNodes.push(aPoint.clone());
                                    var linearRing = new OpenLayers.Geometry.LinearRing(tempNodes);
                                    var polygon = new OpenLayers.Geometry.Polygon(linearRing);
                                    var area = polygon.getGeodesicArea('EPSG:3857');

                                    self.showMeasure(area, "m <sup>2</sup>");
                                }
                            },
                            point : function(aPoint){
                              self.nodesOfPolygon.push(aPoint.clone());
                              
                              if(self.nodesOfPolygon.length > 2){
                                var linearRing = new OpenLayers.Geometry.LinearRing(self.nodesOfPolygon);
                                var polygon = new OpenLayers.Geometry.Polygon(linearRing);
                                var area = polygon.getGeodesicArea('EPSG:3857');
                                self.showMeasure(area, "m <sup>2</sup>");
                                console.log('POINT ' + area);
                             }
                             
                              self.previousPoint = aPoint.clone();
                              
                            }
                        }
                        }),
        box: new OpenLayers.Control.DrawFeature(this.vectors, OpenLayers.Handler.RegularPolygon, {
                        handlerOptions: {
                            sides: 4,
                            irregular: true}
                        }),
        modify: new OpenLayers.Control.ModifyFeature(this.vectors),
        regular: new OpenLayers.Control.DrawFeature(this.vectors, OpenLayers.Handler.RegularPolygon, {handlerOptions: {sides: 5}}),
        lineMeasure: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
                        geodesic: true,
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                layer : this.vectors,
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        }
                    }),
        polygonMeasure: new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
                        geodesic: true,
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                layer : this.vectors,
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        }
                    }
                )
    };

    this.drawControls['line'].events.register('featureadded', this.drawControls['line'], function(event){
        var geom = event.feature.geometry.clone();
        self.lastMeasure = geom.getGeodesicLength('EPSG:3857');
        self.showLastMeasure(self.lastMeasure, "m");

        if(self.lastMeasure > MAX_PATH_LEN){
           alert('Maximum allow length of path is '+ MAX_PATH_LEN + ', please edit path');
            self.switchFeature();
            self.drawControls.modify.selectFeature(event.feature);
        }else {
            alert('Length is OK !');
        }
    }); 

    this.drawControls['polygon'].events.register('featureadded', this.drawControls['polygon'], function(event){
        var geom = event.feature.geometry;
        self.lastMeasure = geom.getGeodesicArea('EPSG:3857');
        console.log('Polygon featureadded ' + self.lastMeasure);
        self.showLastMeasure(self.lastMeasure, UNIT_AREA);

        if(self.lastMeasure > MAX_POLYGON_AREA){
            //alert('Maximum allow area of polygon is '+ MAX_POLYGON_AREA + ', please edit path');
            self.switchFeature();
            self.drawControls.modify.selectFeature(event.feature);
        }else {
            //alert('Area is OK !');
        }
    });

    this.switchFeature = function(){
         document.getElementById("createVertices").checked = true;
         document.getElementById('modifyToggle').checked = true;
         self.drawControls.line.deactivate();
         self.drawControls.polygon.deactivate();
         self.drawControls.modify.activate();
         self.drawControls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
    }


    var style = new OpenLayers.Style();
        style.addRules([
            new OpenLayers.Rule({symbolizer: sketchSymbolizers})
        ]);
    var styleMap = new OpenLayers.StyleMap({"default": style});

    var control;
    for(var key in this.drawControls) {
        if(key == 'lineMeasure' || key == 'polygonMeasure'){
              control = this.drawControls[key];
              control.events.on({
                    "measure": handleMeasurements,
                    "measurepartial": handleMeasurements
                });
            this.map.addControl(control);
        }else{
            this.map.addControl(this.drawControls[key]);
        }
    }

    this.layerOSM = new OpenLayers.Layer.OSM();
    
    var self = this;
  

    (function() {
        self.map.addLayers([self.layerOSM, self.layerCMP1000, self.layerCMP500,self.both]);
        self.map.addLayers([self.vectors]);

        self.map.setCenter(
           new OpenLayers.LonLat(lonTG, latTG).transform(
            'EPSG:4326',
            self.map.getProjectionObject()
        ) , self.zoom
        );

        document.getElementById('noneToggle').checked = true;
    })();

    this.toggleControl = function(element) {
        console.log("toggleControl");
        for(key in this.drawControls) {
            var control = this.drawControls[key];
            if(element.value == key && element.checked) {
                control.activate();
            } else {
                control.deactivate();
            }
        }
    }

    this.allowPan = function(element) {
        var stop = !element.checked;
        for(var key in this.drawControls) {
            this.drawControls[key].handler.stopDown = stop;
            this.drawControls[key].handler.stopUp = stop;
        }
    }

    this.update = function(){
        console.log("Call update function");
        // reset modification mode
        this.drawControls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
        var rotate = document.getElementById("rotate").checked;
        if(rotate) {
            this.drawControls.modify.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
        }
        var resize = document.getElementById("resize").checked;
        if(resize) {
            this.drawControls.modify.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
            var keepAspectRatio = document.getElementById("keepAspectRatio").checked;
            if (keepAspectRatio) {
                this.drawControls.modify.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
            }
        }
        var drag = document.getElementById("drag").checked;
        if(drag) {
            this.drawControls.modify.mode |= OpenLayers.Control.ModifyFeature.DRAG;
        }
        if (rotate || drag) {
            this.drawControls.modify.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
        }
        this.drawControls.modify.createVertices = document.getElementById("createVertices").checked;
        var sides = parseInt(document.getElementById("sides").value);
        sides = Math.max(3, isNaN(sides) ? 0 : sides);
        this.drawControls.regular.handler.sides = sides;
        var irregular =  document.getElementById("irregular").checked;
        this.drawControls.regular.handler.irregular = irregular;
    }

     this.showMeasure = function(measure, unit){
        var element = document.getElementById('outCurrentMeasure');
        var out = "Current measure: " + measure.toFixed(3) + " " + unit;
        element.innerHTML = out;
    }

    this.showLastMeasure = function(measure, unit){
        var element = document.getElementById('outLastMeasure');
        var out = "Last measure: " + measure.toFixed(3) + " " + unit;
        element.innerHTML = out;
    }
//end Map class
};

var map = new Map('map');

function handleMeasurements(event) {
    console.log('handleMeasurements');
    var geometry = event.geometry;
    var units = event.units;
    var order = event.order;
    var measure = event.measure;
    var element = document.getElementById('outLastMeasure');
    var out = "";
    if(order == 1) {
        out += "measure: " + measure.toFixed(3) + " " + units;
    } else {
        out += "measure: " + measure.toFixed(3) + " " + units + "<sup>2</" + "sup>";
    }
    element.innerHTML = out;
}

function toggleControl(element) {
    map.toggleControl(element);
}

function allowPan(element){
    map.allowPan(element);
}

function update() {
    map.update();
}
