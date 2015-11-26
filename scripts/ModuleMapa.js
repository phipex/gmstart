function LMap (center,zoom) {
  var _this= this;

  _this.map = L.map('map').setView(center,zoom);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(_this.map);



  _this.getMapa=function () {
    return _this.map;
  };

  _this.getZoom=function () {
    return _this.map.getZoom();
  };

  _this.setZoom=function (zoom) {
    _this.map.setZoom(zoom);
  };

  _this.zoomIn=function  () {
    _this.map.zoomIn();
  };

  _this.zoomOut=function  () {
    _this.map.zoomOut();
  };

  _this.getCenter = function () {
    return _this.map.getCenter();
  };

  _this.setCenter=function (arrayLatLon) {
    _this.map.panTo(arrayLatLon);
  };

  _this.getBounds= function () {
    var bound = new Bounds();
    bound.bound = _this.map.getBounds();
    return bound;
  };

  _this.setBounds=function  (parametro) {
    console.log("parametro",parametro);

    if(!parametro){
      return;
    }

    var bounds = null;

    if(parametro.constructor === Array){
      console.log("es un array");
      bounds = parametro;
    }

    if(parametro.constructor === Bounds){
      console.log("Es un bounds");
      bounds = parametro.bound;

    }

    console.info("bounds",bounds);
    _this.map.fitBounds(bounds);
  };

}

function Bounds () {
  var _this = this;
  _this.bound = new L.LatLngBounds();

  _this.extend=function (arrayLatLon) {
    if (_this.bound) {
          _this.bound.extend(arrayLatLon);
    }
  };
}

function Marker (lat,lon,iconObj,text) {
  this.marker = null;



  if (iconObj) {
    var icon = L.icon(iconObj);
    this.marker = new L.marker([lat,lon], {icon: icon});
  }else{
    this.marker = new L.marker([lat,lon]);
  }

  var marker = this.marker;
  //L.marker([lat,lon]).addTo(map.map);
  this.text = text;



  this.add=function (map) {
    if (map.map) {
      marker.addTo(map.map);
    }
  };

  this.info=function (text) {
    this.text = text || this.text;
    if (this.text) {
      marker.bindPopup(this.text);
    }
  };

  this.getPosition=function(){
    var position = marker.getLatLng();
    var lat = position.lat;
    var lon = position.lng;
    return [lat,lon];
  };

  if (text) {
    this.info();
  }

  this.openPopup= function () {
    marker.openPopup();
  };
}

function Cluster (map,lista) {
  var _this = this;
  var markersGroup = new L.markerClusterGroup();
  //console.info("markersGroup",markersGroup);
  //markersGroup.addLayers(lista);
  function addList (lista) {
    for (var i = 0; i < lista.length; i++) {

      var marker = lista[i].marker;
        //console.info(lista[i]);
        if (marker) {
          markersGroup.addLayer(marker);
        }
    }
  }

  addList(lista);

  map.map.addLayer(markersGroup);
  _this.clearMarkers=function () {
    markersGroup.clearLayers();
  };

  _this.refresh=function (lista) {
    markersGroup.clearLayers();
    addList(lista);
  };
}
