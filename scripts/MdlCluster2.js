//"use strict";
var console = console || {},
  google = google || {},
  map = map || {},
  MarkerClusterer = MarkerClusterer || {};



function OlCluster (map,sourceVector,iconStyle) {
  //TODO crear un stilo generico para el punto unico


  var currentResolution;

  var maxFeatureCount;

  var textFill = new ol.style.Fill({
    color: '#fff'
  });

  var textStroke = new ol.style.Stroke({
    color: 'rgba(0, 0, 0, 0.6)',
    width: 3
  });

  clusterSource = new ol.source.Cluster({
    distance: 40,
    //source: soureceVector
    source:sourceVector
  });


  function calculateClusterInfo(resolution) {
    maxFeatureCount = 0;
    var features = vector.getSource().getFeatures();
    var feature, radius;
    for (var i = features.length - 1; i >= 0; --i) {
      feature = features[i];
      var originalFeatures = feature.get('features');
      var extent = ol.extent.createEmpty();
      for (var j = 0, jj = originalFeatures.length; j < jj; ++j) {
        ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
      }
      maxFeatureCount = Math.max(maxFeatureCount, jj);
      radius = 0.25 * (ol.extent.getWidth(extent) + ol.extent.getHeight(extent)) /
        resolution;
      feature.set('radius', radius);
    }
  }

  function getImageStyleBySize (size) {
    var color = [];
    var prop = (size / (maxFeatureCount/2));
    prop = (0.1 + prop);
    //console.info("prop",size,(maxFeatureCount/2),prop);
    //var opacy = Math.max(0.4,prop);
    var opacy = 0.3;

    if(prop > 0.9){
      color = [255,0,0,opacy];//rojo
    }else if(prop > 0.8){
      color = [255,155,0,opacy];//naranja
    }else if(prop > 0.7){
      color = [255,255,0,opacy];//amarillo
    }else if(prop > 0.5){
      color = [0,255,0,opacy];//verde
    }else if(prop > 0.3){
      color = [0,255,255,opacy];//azul
    }else{
      color = [0,0,255,opacy];//azul
    }

    var radius = Math.min(50,prop*70);

    return new ol.style.Circle({
      radius: radius,
      /*radius: feature.get('radius'),
       fill: new ol.style.Fill({
       color: [255, 153, 0, Math.min(0.8, 0.4 + (size / maxFeatureCount))]
       })*/
      stroke: new ol.style.Stroke({
        color: color,
        width: 4
        //,lineDash: [2, 4]
      }),
      fill:new ol.style.Fill({
        color: color
      })
    });
  }



  function styleFunction(feature, resolution) {
    //console.info(feature, resolution);
    if (resolution != currentResolution) {
      calculateClusterInfo(resolution);
      currentResolution = resolution;
    }
    var style;

    var features = feature.get('features');
    if (features) {
      var size = features.length;
      if (size > 1) {
        //console.info(feature.get('radius'),feature.get('features').length);
        style = [new ol.style.Style({
          image: getImageStyleBySize (size),
          text: new ol.style.Text({
            text: size.toString(),
            fill: textFill,
            stroke: textStroke
          })
        })];
      } else {
        var originalFeature = feature.get('features')[0];
        style = [iconStyle];
      }

    };



    return style;
  }

  vector = new ol.layer.Vector({
    source: clusterSource,
    style: styleFunction
  });

  this.clearCLuster=function () {

    clusterSource.clear();
    sourceVector.clear();
  };

  this.eraseCluster=function(){
    map.removeLayer(vector);
  };

  map.addLayer(vector);
}


/**
 * Modulo que gestiona el cluster de marcas
 * @type {{markerClusterer: null, data: {}, markers: Array, bound: google.maps.LatLngBounds, refreshCluster: Function, getImegeIrl: Function, addInfoWindow: Function, createMarker: Function}}
 */
var MdlCluster = {
  /**
   * gestion el cluster completo
   */
  markerClusterer: null,
  /**
   * Lista completa de marcas creadas al princpio
   */
  data:{},
  /**
   * marcas actuales despuesd ela busquerda
   */
  markers:[],
  /**
   * Limites del cluster (para centrar el mapa)
   */
  bound: ol.extent.createEmpty(),//TODO cambiar

  featureStyle:new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 32],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 1,
      src: "images/30x30/Otros.png"
    }))
  }),

  sourceLayer:new ol.source.Vector(),

  /**
   * Refresca el mapa con los la lista de markers y lo
   * centra en los limites indicados
   * @param markers
   * @param bounds
   */
  refreshCluster:function(markers,bounds){
      //console.info("refreshCluster",markers,bounds);
      if (this.markerClusterer) {
        this.markerClusterer.clearCLuster();
        this.markerClusterer.eraseCluster();
      }
    var source = new ol.source.Vector({
      features: MdlCluster.markers
    });

    //this.markerClusterer = new MarkerClusterer(map, markers);
      this.markerClusterer = new OlCluster(map, source,this.featureStyle);

    var extend = source.getExtent();
    console.info(extend);
    //map.getView().fit(vector.getSource().getExtent(), map.getSize());
    map.getView().fit(extend, map.getSize());
    //map.fitBounds(bounds);//TODO cambiar
      //console.info(bounds.toString());


  },
  /**
   * Retorna la imagen de la marca
   * @param categ
   * @returns {string}
   */
  getImegeIrl: function(categ){
    //var imegeUrl = "img/30x30/"+categ+".png";
    //TODO montar los iconos
    var imegeUrl = "images/30x30/Otros.png";

    return imegeUrl;

  },
  /**
   * AGrega el infowindo
   * @param marker
   * @param message
   * @deprecated llamar al evento que pregunte por cada informacion
   */
  addInfoWindow: function(marker, message) {
    //console.info(marker, message);

  //llamar al evento que pregunte por cada informacion
    google.maps.event.addListener(marker, 'click', function (event) {
      //console.info("this",this);
      //console.info("marker",marker);


      var objeto = marker.obj;
      var mensaje = objeto.nom + "("+objeto.dir+") </br>"+
        "<a target='_blank' href='http://maps.google.com/maps?q=&layer=c&cbll="+objeto.lat+","+objeto.lon+"&cbp=11,0,0,0,0'>Google Street View</a>";

      if(marker.infoWindow)
      {
        marker.infoWindow.setContent(mensaje);

      }else{

        marker.infoWindow = new google.maps.InfoWindow({
          content: mensaje
        });
      }
      marker.infoWindow.open(map, marker);
      MdlCluster.showData(marker);
    });
  },
  showData: function (marker) {
    console.info("marca seleccionada");
    ModuleGasMarket.togglePanelDataFilter(marker);
  },
  /**
   * crea la marca para despues ser agregada al cluster
   * @param objeto
   * @returns {google.maps.Marker}
   */
  createMarker: function(objeto){
    /*var markerImage = new google.maps.MarkerImage(this.getImegeIrl(objeto.cat),
      new google.maps.Size(30, 30));


    var latLng = new google.maps.LatLng(objeto.lat,objeto.lon);

    MdlCluster.boundExtend(latLng);

    var marker = new google.maps.Marker({
      position: latLng,
      icon: markerImage,
      optimized : false
    });

    MdlCluster.addInfoWindow(marker);

    return marker;*/
    var lat = objeto.lat;
    var lon = objeto.lon;
    var latlon3857 = latlon(lat,lon);
    var geom = new ol.geom.Point(latlon3857);
    var feature = new ol.Feature(geom);
    return feature;

  },
  eventFilter: function (list) {


    var count = list.length;
    //console.info("termino, encontro %d",count);

    if (count > 0) {

      MdlCluster.markers = [];
      //MdlCluster.bound = new google.maps.LatLngBounds();//TODO cambiar

      for (var i = 0; i < count; i++) {
        var mkrid = list[i];
        /*//console.info("ingresar la marca",obj.elm.dataset.idmarket);
        var idMarker = obj.elm.dataset.idmarket;*/

        var marker = MdlCluster.data[mkrid];
        MdlCluster.markers.push(marker);
        //var latLng = marker.getPosition();//TODO cambiar
        //MdlCluster.boundExtend(latLng);//TODO cambiar

      }
      MdlCluster.refreshCluster(MdlCluster.markers, MdlCluster.bound);
    }


  },
  showAll: function () {
    var list = Object.keys(MdlCluster.data);
    MdlCluster.eventFilter(list);
  },
  showMarker: function (mkrid) {
    if (mkrid) {
      $("#btnTabMap").click();
      mapSetZoom(18);
      var mark = MdlCluster.data[mkrid];

      console.info("mark",mark);

      MdlCluster.openPopupByFeature(mark);

      var pos = ol.extent.getCenter(mark.getGeometry().getExtent());

      mapSetCenter(pos);

      //map.setCenter(pos);
      //map.panTo(pos);
      //map.getView().setCenter();

      //google.maps.event.trigger(mark, 'click');//TODO cambiar
    }
  },
  openPopupByFeature:function(feature){
    var pos = ol.extent.getCenter(feature.getGeometry().getExtent());

    var objeto = feature.obj;
    console.info(feature,objeto);
    if(objeto){
      var mensaje = objeto.nom + "("+objeto.dir+") </br>"+
        "<a target='_blank' href='http://maps.google.com/maps?q=&layer=c&cbll="+objeto.lat+","+objeto.lon+"&cbp=11,0,0,0,0'>Google Street View</a>";

      openPopup(mensaje,pos);
    }

    mapSetCenter(pos);


  },
  boundExtend: function (position) {
    var lat = position.lat();
    var lon = position.lng();
    //console.info(lat,lon);

    if(lat > 10 || lat < -5)
    {
        //console.info("mal latitud");
        return;
    }
    if(lon > -69 || lon < -82)
    {
        //console.info("mal longitud");
        return;
    }

    MdlCluster.bound.extend(position);//TODO cambiar
  },
  updateMarker: function (mkrid) {
    var marker = MdlCluster.data[mkrid];
    if (marker) {
      var objeto = marker.obj;

      marker.setPosition(new google.maps.LatLng(objeto.lat, objeto.lon));//TODO cambiar
    }
  }
};
