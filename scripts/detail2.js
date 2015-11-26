var point= null;

/**
 * Created by sony vaio on 03/07/2015.
 */
var MdlStorage = {
  eventUpdate:null,
  storage:window.localStorage,
  idem:null,
  indexCallback:null,
  isCompatible: function () {
    if (window.sessionStorage && window.localStorage)
    {
      return true;
    } else {
      alert('Lo siento, pero tu navegador no acepta almacenamiento local');
      return false;
    }
  },
  createMsg: function (objMsg) {
    var sObjMsg = {
      from:this.idem,
      msg:objMsg
    };
    return JSON.stringify(sObjMsg);

  },
  sendMsg: function (keyEvent,objMsg) {
    this.storage.setItem(keyEvent, this.createMsg(objMsg));
  },
  eventUpdateStorage: function (event) {
    console.info(event);
    var key = event.key;
    var value = MdlStorage.storage.getItem(key);
    console.info("eventUpdateStorage",key,value);
    value = JSON.parse(value);
    if (MdlStorage.indexCallback) {
      if (MdlStorage.indexCallback[key]) {
        console.info("ecnontrado la accion a realizar");
        MdlStorage.indexCallback[key](value);
      } else {
        console.error("no encontro la accion");
      }
    }
  },

  ini: function () {

    if (this.isCompatible()) {//if(typeof(Storage) !== "undefined")
      window.localStorage.clear();
      this.eventUpdate=  window.addEventListener("storage", MdlStorage.eventUpdateStorage, false);
    }
  }
};

var objEDS = null,marker = null;



/*Date.prototype.yyyymmdd = function() {
 var yyyy = this.getFullYear().toString();
 var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
 var dd  = this.getDate().toString();
 return yyyy +"/"+ (mm[1]?mm:"0"+mm[0]) +"/"+ (dd[1]?dd:"0"+dd[0]); // padding
 };*/


function initMap(lat, lon) {
  /**
   * Define a namespace for the application.
   */
  window.app = {};
  var app = window.app;



  /**
   * @constructor
   * @extends {ol.interaction.Pointer}
   */
  app.Drag = function() {

    ol.interaction.Pointer.call(this, {
      handleDownEvent: app.Drag.prototype.handleDownEvent,
      handleDragEvent: app.Drag.prototype.handleDragEvent,
      handleMoveEvent: app.Drag.prototype.handleMoveEvent,
      handleUpEvent: app.Drag.prototype.handleUpEvent
    });

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;

  };
  ol.inherits(app.Drag, ol.interaction.Pointer);


  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `true` to start the drag sequence.
   */
  app.Drag.prototype.handleDownEvent = function(evt) {
    console.info("handleDownEvent");
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });

    if (feature) {
      this.coordinate_ = evt.coordinate;
      this.feature_ = feature;
    }

    return !!feature;
  };


  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   */
  app.Drag.prototype.handleDragEvent = function(evt) {
    console.info("handleDragEvent");
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });

    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.feature_.getGeometry());
    geometry.translate(deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
  };


  /**
   * @param {ol.MapBrowserEvent} evt Event.
   */
  app.Drag.prototype.handleMoveEvent = function(evt) {
    console.info("handleMoveEvent");
    if (this.cursor_) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
          return feature;
        });
      var element = evt.map.getTargetElement();
      if (feature) {
        if (element.style.cursor != this.cursor_) {
          this.previousCursor_ = element.style.cursor;
          element.style.cursor = this.cursor_;
        }
      } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
      }
    }
  };


  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `false` to stop the drag sequence.
   */
  app.Drag.prototype.handleUpEvent = function(evt) {
    console.info("handleUpEvent",this.coordinate_);
    var coordinates = coord(this.coordinate_);
    eventDragEnd(coordinates[1],coordinates[0])
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
  };


  point = new ol.geom.Point([lon, lat]);
    pointFeature = new ol.Feature(point);



  drag = new app.Drag();
    interactionsPointer = ol.interaction.defaults().extend([drag]);
    map = new ol.Map({
    interactions: interactionsPointer,
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [pointFeature]
        }),
        style: new ol.style.Style({
          image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            opacity: 0.95,
            src: 'images/30x30/Otros.png'
          })),
          stroke: new ol.style.Stroke({
            width: 3,
            color: [255, 0, 0, 1]
          }),
          fill: new ol.style.Fill({
            color: [0, 0, 255, 0.6]
          })
        })
      })
    ],
    target: 'map',
    view: new ol.View({
      center: [0, 0],
      zoom: 2
    })
  });
}

function diffObject(obj1, obj2) {
  var result = {};
  for (key in obj1) {
    if (obj2[key] != obj1[key]) result[key] = obj2[key];
    if (typeof obj2[key] == 'array' && typeof obj1[key] == 'array')
      result[key] = arguments.callee(obj1[key], obj2[key]);
    if (typeof obj2[key] == 'object' && typeof obj1[key] == 'object')
      result[key] = arguments.callee(obj1[key], obj2[key]);
  }
  return result;
}


/*
function createMarker(lat,lon){
  var latLng = new google.maps.LatLng(lat,lon);
  console.info("creando marca en ",$("#gasLat").val(),
    $("#gasLon").val());
  map.setCenter(latLng);
  marker = new google.maps.Marker({
    position: latLng,
    map:map,
    optimized: false
  });


  var handler = function () {
    var lat = $("#gasLat").val();
    var lon = $("#gasLon").val();
    var latLng = new google.maps.LatLng(lat, lon);
    marker.setPosition(latLng);
    map.setCenter(latLng);
  };
  var eventoDrg = function () {

    var pos = marker.getPosition();
    var lat = pos.lat();
    var lon = pos.lng();
    $("#gasLat").val(lat).trigger('input');
    $("#gasLon").val(lon).trigger('input');
    console.info("draged", lat, lon);
    var latLng = new google.maps.LatLng(lat, lon);

    map.setCenter(latLng);
  };

  marker.setAnimation(google.maps.Animation.BOUNCE);
  $("#gasLat,#gasLon").bind("change", handler);
  marker.setDraggable(true);

  google.maps.event.addListener(marker, 'dragend', eventoDrg);

}
*/

function mapSetZoom(zoom){
  map.getView().setZoom(zoom);
}

function mapSetCenter(center){

  map.getView().setCenter(center);
}

var latlon=function(lat,lon){
  return ol.proj.transform([lon,lat],'EPSG:4326', 'EPSG:3857');

};

var coord=function(coordinates){
  return ol.proj.transform(coordinates, 'EPSG:3857','EPSG:4326');
};

function eventDragEnd(lat,lon){
  $("#gasLat").val(lat).trigger('input');
  $("#gasLon").val(lon).trigger('input');
}

function eventFormCoordChange(lat,lon){
  var coor = latlon(lat,lon);
  if (point) {
      point.setCoordinates(coor);
      mapSetCenter(coor);
    mapSetZoom(15);

      }
}



var app = angular.module('gasmarket',
  [
    'datetimepicker'
  ])
  .config([
    'datetimepickerProvider',
    function (datetimepickerProvider) {
      datetimepickerProvider.setOptions({
        viewMode: 'years',
        locale: 'es',
        format: 'L'
      });
    }
  ]);
app.controller('editController', ['$scope', function ($scope){
  //$scope.objEDS = {"cat":null,"nom":null,"cit":null,"dep":null,"mar":null,"lat":null,"lon":null,"dir":null,"id":2,"was":0,"rcar":0,"oil":0,"ins":0,"hot":0,"res":0,"gro":0,"smon":0,"atm":0,"gym":0,"ffo":0,"scel":0,"trep":0,"par":0,"obs":"","cer":"","rvp":"","tel":"","vol":0,"vcon":"","prv1":"","prv2":"","eml":"","rpl":"","loc":"loc","mrkid":"mrk_2_"};


  $scope.objEDS = {};

  $scope.objEdsOrig = {};

  $scope.vm = {
    datetime: ''
  };
  $scope.$watch('vm', function(actual) {

    console.info("watch actual",actual);
    //$scope.objEDS.vcon = actual.datetime;
    actual.datetime = (actual.datetime!=="Invalid date")?actual.datetime:null;
    actual.datetime = actual.datetime || "01/01/1970";
    $scope.objEDS.vcon = moment(actual.datetime,'DD/MM/YYYY').format('YYYY/MM/DD');
  },true);

  $scope.$watch("objEDS.lat+objEDS.lon", function (actual) {
    var lat = $scope.objEDS.lat;
    var lon = $scope.objEDS.lon;

    eventFormCoordChange(lat,lon);
  },true);

  /*$scope.$watch('objEDS.lat', function(actual) {

    console.info("watch actual",actual);
//eml,lat, lon,obs,rvp

  },true);*/

  /*$scope.vcont = {};
   $scope.$watch('vcont', function(actual) {

   console.info("watch actual",actual);
   //tempActual = actual;
   if (actual) {
   //$scope.objEDS.vcon = actual.yyyymmdd();
   }
   });*/

  $scope.actualizaObjeto = function (){

    console.info("actulizando",$scope.objEdsOrig);
    console.info("actualizado",$scope.objEDS);
    var despues = diffObject($scope.objEdsOrig, $scope.objEDS);
    var antes = diffObject($scope.objEDS, $scope.objEdsOrig);

    var modificaciones = {
      antes: antes,
      despues: despues
    };

    console.info("diferencia",modificaciones );
    //console.info("fecha nueva",$scope.objEDS.vcon);
    //console.info("loc",$scope.objEDS.lat,$scope.objEDS.loc);
    $scope.objEDS.loc = ($scope.objEDS.lat)? "loc" : null;
    //console.info("loc",$scope.objEDS.loc);
    //$("#objEDS").html(""+JSON.stringify($scope.objEDS));
    $scope.objEDS.modificaciones = JSON.stringify(modificaciones);
    //$scope.objEDS.vcon = $scope.objEDS.vcom || "01-01-1970";
    var succes = function (res) {
      if(res.d)
      {

        MdlStorage.sendMsg("updateObjDetail",$scope.objEDS);
        $scope.objEdsOrig = $scope.objEDS;
        //TODO mostrar mensaje que se actualizo correctamente
        delete $scope.objEDS.modificaciones;
        //alert(res.d);
        $.toaster({ message : 'Los datos se han guardado con exito', title : 'Proceso Exitoso', priority : 'success',settings :{timeout:6000} });
      }
    };
    var obj = $scope.objEDS;
    console.info("obj a enviar",obj);
    $.ajax({
      type: "POST",
      dataType: "json",
      contentType: "application/json; chartset:utf-8",
      //url: "data/combustible_point5_2.json",
      //url: "gasmarket.json",
      url: "GasFillDep.aspx/update",
      data: JSON.stringify(obj),
      success: succes,
      error: function (error) {
        console.error(error);
        //alert(false);
        $.toaster({ message : 'No se pudo guardar', title : 'Error', priority : 'danger',settings :{timeout:6000} });

      },
      async: true
    });


  };


  var indexCallback= {
    sendObjDetail: function (value) {
      if(value){
        console.info("cargo la pagina",value);
        if(value.msg)
        {
          //cargo el objeto y lo pinto
          $scope.$apply(function () {
            $scope.objEDS = value.msg;
            $scope.vm.datetime =  moment($scope.objEDS.vcon, "MM/DD/YYYY").format('DD/MM/YYYY');

          console.info("$scope.objEDS.vcon",$scope.objEDS.vcon);
            console.info("$scope.vm.datetime",$scope.vm.datetime);
            console.info('moment($scope.objEDS.vcon, "YYYY/MM/DD").format("DD/MM/YYYY")',moment($scope.objEDS.vcon, "YYYY/MM/DD").format('DD/MM/YYYY'));
            $scope.objEdsOrig = $.extend(true,{},value.msg);

            console.info("pintanto objeto",value.msg,$scope.objEDS);
            $("#objEDS").html(""+JSON.stringify($scope.objEDS));

            angular.element("#cargando").hide(1000);
            initMap();
            //eventFormCoordChange(value.msg.lat,value.msg.lon);
          });

        }
      }
    }
  };


  angular.element(document).ready(function () {
    console.info("ready");
    /*$("[type=date]").datetimepicker({
     viewMode: 'years',
     locale: 'es',
     format: 'LL'
     });
     */

    MdlStorage.ini();
    MdlStorage.idem="datail";
    MdlStorage.indexCallback=indexCallback;
    MdlStorage.sendMsg("endLoad",true);
    $(".panel-collapse").on("shown.bs.collapse",function(){
      map.updateSize();
    });

  });

}]);


