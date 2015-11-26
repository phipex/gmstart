var ModuleGasMarket = {
  fullData:null,
  bandTemp: false,
  ini:function(){
    'use strict';
    initMap();

    MdlDpto.ini();

    ModuleGasMarket.starPrepareDara();
    var success = function(data){

      ModuleGasMarket.prepareData(data.RECORDS);

    };
    ModuleGasMarket.loadData(success);

  },
  prepareItem:function(obj){

    if(!ModuleGasMarket.bandTemp){
      console.info(obj);
      ModuleGasMarket.bandTemp = true;
    }
    if (obj.id) {
      MdlList.createListItem(obj);
      var marker = MdlCluster.createMarker(obj);
      var mrkid = "mrk_" + obj.id + "_";
      obj.mrkid = mrkid;
      marker.mrkid = mrkid;
      MdlCluster.data[mrkid] = marker;
      MdlCluster.markers.push(marker);
      MdlFilter.agregateFilter(obj);
    }
  },
  loadData: function(success){

    $.ajax({
      dataType: "json",
      //url:"data/test10mill.json",
      url: "data/combustible_point8.json",
      //url: "data/gasmarket.json",
      data: {},
      success: success,
      error: function(error){
        console.error(error);
      }
    });
  },
  prepareData:function(data){

    var prepare = new ProcesarLote(data,this.prepareItem,ModuleGasMarket.endPreapeData,this.starPrepareDataPack,this.endPrepareDataPack);

   /* var size = 1000;
    var count = data.length;
    for (var i=0; i<count; i+=size) {
      var smallarray = data.slice(i,i+size);
      // do something with smallarray
      this.starPrepareDataPack();
      ProcessArray(smallarray,this.prepareItem,this.endPrepareDataPack, i );
    }

    ModuleGasMarket.endPreapeData();*/


  },
  starPrepareDara:function(){

    MdlList.prepareUI();

  },
  starPrepareDataPack:function(){

  },
  endPrepareDataPack:function(){
    console.info("endPrepareDataPack");
    MdlCluster.refreshCluster(MdlCluster.markers,MdlCluster.bound);

  },
  endPreapeData:function(){
    console.info("endPreapeData");
    MdlList.prepareList();
    var listenerHandle = google.maps.event.addListener(map, 'tilesloaded',  function() {
      console.info("termino");
      google.maps.event.removeListener(listenerHandle);
      $("#cargando").hide(2000);
    });
  }

};
