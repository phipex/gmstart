var map = null;

var pro3857 = projection = ol.proj.get('EPSG:3857');
var pro4326 = projection = ol.proj.get('EPSG:4326');
var element = document.getElementById('popup');


var latlon=function(lat,lon){
  return ol.proj.transform([lon,lat],'EPSG:4326', 'EPSG:3857');

};

function mapSetZoom(zoom){
  map.getView().setZoom(zoom);
}

function mapSetCenter(center){

  map.getView().setCenter(center);
}


function getExtentByFeatureColl (feature) {
  var features = feature.get('features');
  var len = features.length;

  var extent = ol.extent.createEmpty();
  for (var i = len - 1; i >= 0; i--) {
    var obj = features[i];
    var geometry = obj.getGeometry();
    ol.extent.extend(extent, geometry.getExtent());
  };
  console.info(extent);
  return extent;
}

function zoomIn () {
  var view = map.getView();
  var zoom = view.getZoom();
  view.setZoom(zoom +1);
}

function zoomOut () {
  var view = map.getView();
  var zoom = view.getZoom();
  view.setZoom(zoom -1);
}

function zoomInByFeature (feature) {
  var extent = getExtentByFeatureColl (feature);
  //
  var center = ol.extent.getCenter(extent);
  mapSetCenter(center);
  //map.getView().fit(extent, map.getSize());
  //zoomOut();
  zoomIn();
}

function initMap(){

  map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    controls: ol.control.defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false
      })
    }),
    target: 'map',
    view: new ol.View({
      //projection: 'EPSG:4326',
      center: latlon(4,-74),
      zoom: 2
    })


  });

  map.on('dblclick', function(evt) {
    console.info("doble click evente");
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });
    if (feature) {
      console.info(feature);
      console.info(feature.getGeometry());
      zoomInByFeature (feature);
    }
  });



  map.on('click', function(evt) {
    console.info("click evente",evt);
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        console.info(feature, layer);
        return feature;
      });
    console.info(feature);
    if (feature) {

      var features = feature.get("features");
      if(features.length === 1){
        console.info(evt.coordinate);

        MdlCluster.openPopupByFeature(features[0]);



      }



    } else {
      $(element).popover('destroy');
    }
  });

  popup = new ol.Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: false
  });
  map.addOverlay(popup);

}




function openPopup(mensaje,posicion){
  popup.setPosition(posicion);
  $(element).popover({
    'placement': 'top',
    'html': true,
    'content': mensaje
  });
  $(element).popover('show');
}


var ProcesarLote = function(data,itemfn,finalfn,iniciopack,finalpack ){

  var that = this;

  this.proceso = {};

  var verficarFinal=function(){

    var res = false;
    var keys = Object.keys(that.proceso);
    var count = keys.length;

    res = res || keys[0];

    for (var i = 0; i < count; i++) {
      var obj = keys[i];
      res = res && that.proceso[obj];
    }
    console.info("verifica final",that.proceso,res);
    if(res){
      console.info("----------termino del todo");
      if(finalfn){finalfn();}
    }
  };

  var registrar = function(index){
    that.proceso["p"+index]=false;
  };

  var terminar = function(index){
    that.proceso["p"+index]=true;
    verficarFinal();
  };




  var ProcessArray = function(data, handler, callback,idem){
    var maxtime = 100;		// chunk processing time
    var delay = 20;		// delay between processes
    var queue = data.concat();	// clone original array
    //console.info("inicio proceso",idem);
    registrar(idem);
    setTimeout(function() {

      var endtime = +new Date() + maxtime;

      do {
        if (handler) {
          handler(queue.shift());
        }
      } while (queue.length > 0 && endtime > +new Date());
      if (queue.length > 0) {
        //console.info("medio proceso",idem);
        setTimeout(arguments.callee, delay);
      }
      else {
        //console.info("final proceso",idem);
        if (callback){

          callback();
          terminar(idem);
        }
      }

    }, delay);
    //console.info("final proceso",idem);
  };

  var prepararLista= function(data,itemfn,finalfn,iniciopack,finalpack){
    var size = 1000;
    var count = data.length;
    for (var i=0; i<count; i+=size) {
      var smallarray = data.slice(i,i+size);
      // do something with smallarray
      if(iniciopack){iniciopack();}
      ProcessArray(smallarray,itemfn,finalpack, i );
    }

  };
  prepararLista(data,itemfn,finalfn,iniciopack,finalpack);
};


/**
 *
 * @param data an array of items to process
 * @param handler a function which processes an individual data item
 * @param callback an optional function called when all processing is complete
 *
 */
function ProcessArray(data, handler, callback,idem){
  if (data) {
    var maxtime = 100;		// chunk processing time
    var delay = 20;		// delay between processes
    var queue = data.concat();	// clone original array
    console.info("inicio proceso", idem);
    setTimeout(function () {

      var endtime = +new Date() + maxtime;

      do {
        if (handler) {
          handler(queue.shift());
        }
      } while (queue.length > 0 && endtime > +new Date());
      if (queue.length > 0) {
        console.info("medio proceso", idem);
        setTimeout(arguments.callee, delay);
      }
      else {
        console.info("final proceso", idem);
        if (callback) callback(data);
      }

    }, delay);
    console.info("final function proceso", idem);
  }
}
// end of ProcessArray function
/**
 *
 * @param data an array of items to process
 * @param handler a function which processes an individual data item
 * @param callback an optional function called when all processing is complete
 * @param interval valor del paquete
 * @param callbackInterval callback cuando termina un paquete
 * @constructor
 */
function ProcessArrayPacked(data, handler, callback,interval,callbackInterval) {
  var maxtime = 100;		// chunk processing time
  var delay = 20;		// delay between processes
  var queue = data.concat();	// clone original array
  setTimeout(function() {
    var i = 0;
    var endtime = +new Date() + maxtime;

    do {
      handler(queue.shift());
    } while (queue.length > 0 && endtime > +new Date() && i++ < interval );
    if (queue.length > 0) {

      if(i >= interval){
        i=0;
        if (callbackInterval) callbackInterval();
      }
      setTimeout(arguments.callee, delay);
    }
    else {
      if (callback) callback();
    }

  }, delay);
}
// end of ProcessArray function

function filterObjectBy(obj,objfilt){

  if(!objfilt){
    return true;
  } else if((Object.keys(objfilt).length === 0))
  {
    return true;
  }

  var res;

  var compareIndividual = function (valueorig,valuefilt){

    //console.info("typeof valuefilt",typeof valuefilt);
    if (typeof valuefilt === "string") {//se busca sobre un array
      //console.info("es un string",valueorig.toLowerCase().indexOf(valuefilt.toLowerCase()));
      //console.info("valueorig",valueorig);
      if(valueorig && valueorig.toLowerCase().trim().indexOf(valuefilt.toLowerCase().trim()) > -1){
        //console.log("son iguales string");
        return true;
      }


    }else if(typeof valuefilt === "boolean"){
      var value_orig = Boolean(valueorig);
      var value_filt = Boolean(valuefilt);
      //console.info("booleanos",(value_orig === value_filt),value_orig , value_filt);
      if(value_orig === value_filt){
        return true;
      }

    }else if(valueorig === valuefilt){
      //console.log("son iguales simple");
      return true;
    }
    //console.info("no son iguales");
    return false;


  };


  for(var key in objfilt){
    //console.info(key,obj[key]);
    if(obj[key] !== undefined ){//existe la propiedad en el original
      //console.info("existe",objfilt[key]);
      if (objfilt[key] instanceof Array) {//se busca sobre un array
        //console.info("es un array");
        var array = objfilt[key];
        var length = array.length;
        var resArray = null;
        for (var i = 0; i < length; i++) {
          var item = array[i];

          var compareIndividualResult = compareIndividual(obj[key], item);
          resArray = resArray || compareIndividualResult;
          //console.info("resArray",resArray,item,"compareIndividualResult",compareIndividualResult);
        }
        res = (res)?(res && resArray):resArray;
        //console.info("res",res,objfilt[key]);
      }else{
        //console.info("no es un array");
        res = compareIndividual(obj[key],objfilt[key]);

      }

    }else{
      res = false;

    }
    if(res){
      continue;

    }else{
      break;
    }

  }
  //console.info("return res",res);
  return res || false;
}

function filterDate(obj,objDateFilter){
  var res = null;

  if (objDateFilter) {//verificar que si tenga los parametros
    for (var key in objDateFilter) {
      if (obj.hasOwnProperty(key) && objDateFilter.hasOwnProperty(key)) {//verificar que si exista la propiedad para comparar
        var dateObj = new Date(obj[key]).getTime();
        console.info("objeto fecha",dateObj,obj[key],new Date(obj[key]));
        if (dateObj !== NaN) {//verificar que la fecha seaa valida
          console.info("fecha valida");
          var valuefilt = objDateFilter[key];

          //console.info("valida prop",(objDateFilter[key].from),(objDateFilter[key].to),((objDateFilter[key].from) && (objDateFilter[key].to)),"tienes?");

          if(typeof valuefilt === "string" && obj[key] === valuefilt){// fecha directa verificar que sean iguales
            return true;
          }else if(!((objDateFilter[key].from) || (objDateFilter[key].to))){// verificar el formato de objeto datafilter
            //objeto con propiedad desde(from) o hasta(to)
            console.info("no contiene la propiedad to o from");
            return false;
          }else{
            console.info("tiene alguna de las 2 propiedades");
            if(objDateFilter[key].from){
              var dateObjFilter = new Date(objDateFilter[key].from).getTime();

              if (dateObjFilter === NaN) {
                return false;
              }else{
                console.info("tiene from",dateObjFilter, dateObj);
                var fromres = (dateObjFilter <= dateObj);
                res = res || fromres;
                res = res && fromres;
              }
            }
            if(objDateFilter[key].to){
              console.info("tiene to");
              var dateObjFilter = new Date(objDateFilter[key].to).getTime();

              if (dateObjFilter === NaN) {
                return false;
              }else{
                console.info("tiene from",dateObjFilter, dateObj);
                var tores = (dateObjFilter >= dateObj);
                res = res || tores;
                res = res && tores;
              }
            }
          }

        }else{
          console.info("fecha invalida");
        }
      }
    }
  }

  return res || false;
}


function replaceAll(text,replaceFor,replaceTo){
  return text.replace(new RegExp(replaceFor, "g"), replaceTo);

}

function textoSin(texto){
  var replaceAllText = replaceAll(texto, ' ', '_');
  replaceAllText = replaceAll(replaceAllText, '/.', '_');
  return replaceAllText;
}

function textoCon(texto){
  var replaceAllText = replaceAll(texto, '_', ' ');

  return replaceAllText;
}

function miniMustache(obj,text){

  for(var key in obj)
  {
      if(obj.hasOwnProperty(key))
      {
        var value = obj[key];
        text = replaceAll(text,"{{"+key+"}}",value);
      }

  }

  return text;
}

var MdlGeolocation = {
  eventoPre:null,
  eventoPost:null,
  eventoSuccess:null,
  errorCallback:null,
  initPosition:false,
  geoOptions:{

    timeout: 20000,
    enableHighAccuracy: true,
    maximumAge: 10000

  },
  geolocation:function(){

    var successCallback = function(position){

      var lat = position.coords.latitude;
      var lon = position.coords.longitude;


      var accuracy = position.coords.accuracy;
      //if(accuracy < 1000 || confirm("El error en la posicion es de "+accuracy+",desea usar esa posicion"))
      //{
      //  console.info("suficiente acurrancy", this);
        if(MdlGeolocation.eventoSuccess){
          //console.info("entro");
          MdlGeolocation.eventoSuccess(lat,lon);
          MdlGeolocation.initPosition=true;
        }

      //}
      if (MdlGeolocation.eventoPost) {
        eventoPost();
      }
    };


    if (navigator && navigator.geolocation) {
      if (this.eventoPre) {
        eventoPre();
      }
      if(!this.errorCallback){
        this.errorCallback=function(){};
      }

        navigator.geolocation.getCurrentPosition(successCallback, this.errorCallback, this.geoOptions);
        setTimeout(function () {
          if(!MdlGeolocation.initPosition){
            window.console.log("No confirmation from user, using fallback");
            MdlGeolocation.errorCallback();
          }
        }, this.geoOptions.timeout + 1000); // Wait extra second

    } else {
      //console.log('Geolocation is not supported');
      alert("Su navergador no soporta localizacion");
      if(!this.errorCallback){
        this.errorCallback();
      }
    }
  }

};

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
        console.warm("no encontro la accion");
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


function saveFile(dataString,fileName) {
  var blob = new Blob([dataString]);
  if (window.navigator.msSaveOrOpenBlob) {// IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
    window.navigator.msSaveBlob(blob, fileName);
  }
  else
  {
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
    a.download = "filename.csv";
    document.body.appendChild(a);
    a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }

}

$(document).ready(function(){

  ModuleGasMarket.ini();




});

