"use strict";
var console = console || {},
  google = google || {},
  map = map || {},
  MarkerClusterer = MarkerClusterer || {};


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
  bound: new Bounds(),
  /**
   * Refresca el mapa con los la lista de markers y lo
   * centra en los limites indicados
   * @param markers
   * @param bounds
   */
  refreshCluster:function(markers,bounds){
      //console.info("refreshCluster",markers,bounds);
      if (this.markerClusterer) {
        this.markerClusterer.clearMarkers();
      }

      this.markerClusterer = new Cluster(map, markers);
      map.setBounds(bounds);
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
  addInfoWindow: function(objeto) {
    //console.info(marker, message);
    var mensaje = objeto.nom + "("+objeto.dir+") </br>"+
      "<a target='_blank' href='http://maps.google.com/maps?q=&layer=c&cbll="+objeto.lat+","+objeto.lon+"&cbp=11,0,0,0,0'>Google Street View</a>";

    //marker.info(mensaje);


    return mensaje;
/*

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
*/


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
    var markerImage = {iconUrl: this.getImegeIrl(objeto.cat)};
    var lat = objeto.lat;
    var lon = objeto.lon;

    var latLng = [objeto.lat,objeto.lon];

    MdlCluster.boundExtend(latLng);

    var text = MdlCluster.addInfoWindow(objeto);


    var markerobjt = new Marker (lat,lon,markerImage,text);





    return markerobjt;
  },
  eventFilter: function (list) {


    var count = list.length;
    //console.info("termino, encontro %d",count);

    if (count > 0) {

      MdlCluster.markers = [];
      MdlCluster.bound = new google.maps.LatLngBounds();

      for (var i = 0; i < count; i++) {
        var mkrid = list[i];
        /*//console.info("ingresar la marca",obj.elm.dataset.idmarket);
        var idMarker = obj.elm.dataset.idmarket;*/

        var marker = MdlCluster.data[mkrid];
        MdlCluster.markers.push(marker);
        var latLng = marker.getPosition();
        MdlCluster.boundExtend(latLng);

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
      map.setZoom(18);
      var mark = MdlCluster.data[mkrid];
      console.log("mark",mark);
      var pos = mark.getPosition();
      map.setCenter(pos);
      //map.panTo(pos);
      //google.maps.event.trigger(mark, 'click');
    }
  },
  boundExtend: function (position) {
    console.info("boundExtend",position);
    var lat = position[0];
    var lon = position[1];
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

    MdlCluster.bound.extend(position);
  },
  updateMarker: function (mkrid) {
    var marker = MdlCluster.data[mkrid];
    if (marker) {
      var objeto = marker.obj;

      marker.setPosition(new google.maps.LatLng(objeto.lat, objeto.lon));
    }
  }
};
