//var markerClusterer = null;

//var listenerHandle = null;

var map, google;

function initMap(){
  google = google || {};
  google.maps = google.maps || {};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new google.maps.LatLng(4.5708169672728345, -72.6363327178642),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    overviewMapControl:true,
    keyboardShortcuts:true,
    scaleControl:true,
    OverviewMapControlOptions:{
      opened:true
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
        handler(queue.shift());
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
  var maxtime = 100;		// chunk processing time
  var delay = 20;		// delay between processes
  var queue = data.concat();	// clone original array
  console.info("inicio proceso",idem);
  setTimeout(function() {

    var endtime = +new Date() + maxtime;

    do {
      handler(queue.shift());
    } while (queue.length > 0 && endtime > +new Date());
    if (queue.length > 0) {
      console.info("medio proceso",idem);
      setTimeout(arguments.callee, delay);
    }
    else {
      console.info("final proceso",idem);
      if (callback) callback();
    }

  }, delay);
  console.info("final function proceso",idem);
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

$(document).ready(function(){

  ModuleGasMarket.ini();


  $(".noObjetosListados").hide();
  $("#objetosEncontrados").hide();

});

