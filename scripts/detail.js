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


function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 17,
    center: new google.maps.LatLng(4.5708169672728345, -72.6363327178642),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    overviewMapControl: true,
    keyboardShortcuts: true,
    scaleControl: true,
    OverviewMapControlOptions: {
      opened: true
    }
  });

  var input = (document.getElementById('pac-input'));

  console.info("input",input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  google.maps.event.addListener(autocomplete, 'place_changed', function() {

    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }

  });

  /**
   * The CenterControl adds a control to the map that recenters the map on Chicago.
   * This constructor takes the control DIV as an argument.
   * @constructor
   */
  function CenterControl(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginTop = '10px';
    controlUI.style.marginRight = '5px';

    controlUI.style.textAlign = 'center';
    controlUI.title = 'Trae la marca aqui!';

    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    /*controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';*/
    controlText.className = 'btn btn-default';
    controlText.innerHTML = 'Traer Marca';

    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function() {
      console.info("donde estoy");
      var pos = map.getCenter();
      var lat = pos.lat();
      var lon = pos.lng();
      $("#gasLat").val(lat).trigger('change');
      $("#gasLon").val(lon).trigger('change');
    });

  }
  // Create the DIV to hold the control and call the CenterControl() constructor
  // passing in this DIV.
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map);

  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
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
            createMarker(value.msg.lat,value.msg.lon);
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


  });

}]);


