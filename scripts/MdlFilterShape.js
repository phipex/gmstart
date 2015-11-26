var MdlFilterShape = {
  shape:null,
  marker:null,
  bounds:null,
  calculateBounds:function(){
    if (this.shape) {
      var bounds =null;
      /*if(this.shape.getBounds){//circulo
        bounds = this.shape.getBounds();
      }else{//poligono*/
      if(!this.shape.getBounds){
        bounds = new google.maps.LatLngBounds();

        var points = this.shape.getPath().getArray();
        //console.info(points);
        var count = points.length;
        for (var i = 0; i < count; i++) {
          var punto = points[i];
          //console.info(punto);
          bounds.extend(punto);
        }
      }
      //console.info(bounds.toString());
      this.bounds = bounds;
    }

  },
  finishShape: function (polygon) {
    if(this.shape){
      this.shape.setMap(null);
      this.shape=null;
    }
    var handler = function (a) {
      console.info("evento",a);
      MdlFilterShape.calculateBounds();
      if (polygon.getPath) {//es un poligono
        var path = polygon.getPath();
        var len = path.length;
        if (len > 7) {
          alert("Maximo numero de nodos");
          path.removeAt(a);
        }
      }
    };
    var update = function(){
      var radio = polygon.getRadius();
      radio = (radio/1000).toFixed(2);
      $("#radioCircle").text("Radio del circulo "+radio+ " Km");
      console.info(radio);
    };
    var handlerCircle = function(){
      handler();
      update();
    };

    if (polygon.getPath) {//es un poligono
      google.maps.event.addListener(polygon.getPath(), 'insert_at', handler);
      google.maps.event.addListener(polygon.getPath(), 'remove_at', handler);
      google.maps.event.addListener(polygon.getPath(), 'set_at', handler);
    }
    /*else{//es un circulo
      google.maps.event.addListener(polygon, 'center_changed', handler);
      google.maps.event.addListener(polygon, 'radius_changed', handlerCircle);
      update();
    }*/

    this.shape = polygon;
    this.calculateBounds();
  },
  createPolygon:function(center){
    //this.createMarker(center);
    var centLat = center.lat();
    var centLon = center.lng();

    var polyCoords = [
      new google.maps.LatLng(centLat + 0.05, centLon),
      new google.maps.LatLng(centLat, centLon - 0.05),
      new google.maps.LatLng(centLat - 0.05, centLon),
      new google.maps.LatLng(centLat, centLon + 0.05),
      new google.maps.LatLng(centLat + 0.05, centLon)
    ];
    var polygon = new google.maps.Polygon({
      paths: polyCoords,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      draggable:true,
      editable: true
    });

    polygon.setMap(map);

    this.finishShape(polygon);
  },
  createCircle:function(center,radio){


    var polygon = new google.maps.Circle({
      map: map,
      clickable: false,
      editable: true,
      draggable:true,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      center:center,
      radius:radio
    });

    this.finishShape(polygon);
  },
  filtro:function(lat,lon){
    var res = false;
    if (this.shape && this.bounds) {//es un poligono
      console.info("es un poligono" +
        "");
      //console.info(bounds.toString());
      res = this.bounds.contains(new google.maps.LatLng(lat, lon));
    }else if(this.shape){//circulo
      console.info("es un circulo");
      var polygon =this.shape;
      var radio = polygon.getRadius();
      var centro = polygon.getCenter();
      var distance = getDistance(centro,lat,lon);
      console.info("distance",distance,"radio",radio);
      res = (distance < radio);
    }
    return res;
  },
  limpiar:function(){
    console.info("this",this);
    if (this.shape) {
      this.shape.setMap(null);
    }
    this.shape = null;
    this.bounds = null;
  }

};

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, lat, lon) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(lat - p1.lat());
  var dLong = rad(lon - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};
