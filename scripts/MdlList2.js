

var MdlList = {

  gasListOptions : {
    page: 10,
    plugins: [
      new ListPagination({})
    ],
    valueNames: ['cat','nom','cit','dep','id','loc'],
    item: $("#templateGasItem").html().trim()

  },
  settingsToast:{
    timeout:2500,
    'toaster'         :
    {
      'css'       :
      {
        'position' : 'fixed',
        'top'      : '10px',
        'left'    : '10px',
        'width'    : '300px',
        'zIndex'   : 50000
      }
    },
  },
  gasList: null,
  ini: function (listObject) {
    listObject = listObject || [];
    if(!this.gasList){
      //console.info("no a iniciado");
      this.iniList(listObject);
    }
    /*
     var len = listObject.length;
     for (var i = 0; i < len; i++) {
     var obj = listObject[i];
     this.gasList.add(obj);

     }*/
    console.log("agregando datos");
    ProcessArray(listObject, function (obj) {
      MdlList.gasList.add(obj);
    }, function () {
      console.info("termino de cargar datos");
    });
  },
  iniList: function () {

    this.gasList = new List('listaGas', this.gasListOptions);
    var callbackStar = function(event){
      if(MdlList.callbackStar){
        MdlList.callbackStar(event);

      }
    };
    var callbackComplete = function (event) {
      if(MdlList.callbackComplete){
        MdlList.callbackComplete(event);
      }
    };
    this.gasList.on("searchStart",callbackStar);
    this.gasList.on("filterComplete", callbackComplete);
    this.gasList.on("searchComplete", callbackComplete);


  },
  startFilterList: function (encontrados) {
    console.info("encontrados",encontrados.length);
    if (MdlList.gasList) {
    //console.info("encontrados",encontrados.length,encontrados);
      var filter = function (item) {
        //console.info("filter");
        var res = false;
        var objeto = item.values();
        //console.info("----"+objeto.mrkid, encontrados[0]);
        res = ($.inArray(objeto.mrkid, encontrados) > -1);
        //console.assert(($.inArray(objeto.mrkid,encontrados) > -1),"no encontrado");
        //console.info("filter",res);
        return res;
        //return false;
      };
      console.info("filtrara ...");
      MdlList.gasList.filter();
      MdlList.gasList.filter(filter);
    }//TODO hacer algo cuando no tiene datos

  },
  showAll: function () {
    if (MdlList.gasList) {
      MdlList.gasList.filter();
    }
  },
  showResume: function () {
    $("#objetosEncontrados").hide();
    $(".noObjetosListados").hide();
    if (MdlList.gasList) {
      var num = MdlList.gasList.matchingItems.length;
      if (num > 0 || MdlList.gasList.size() === 0) {
        var $dom = $("#objetosEncontrados");
        $dom.show();

        $("#noEncontrados").text(num);
        var msg = $dom.html();
        $.toaster({ message : msg, title : 'Filtrado exitoso', priority : 'success',settings :MdlList.settingsToast });
      } else {
        $(".noObjetosListados").show();
        var msg = $("#noObjetosEncontradosMsg").html();
        $.toaster({ message : msg, title : 'Filtrado fallido', priority : 'danger',settings :MdlList.settingsToast });
      }
    }//TODO hacer algo cuando no tiene datos
  },
  updateElement: function (obj) {
    var id = obj.id;
    var item = MdlList.gasList.get("id", id)[0];
    console.info("actualizando item list",item);
    item.values(obj);
  },
  select4Inform: function () {
    var list = MdlList.gasList.matchingItems;
    //console.info(list);
    //var keys = ["nom","dep","cit","dir"];
    var listlen = list.length;
    //var keyLen = keys.length;
    var listResult = [];
    for (var i = 0; i < listlen; i++) {
      var obj = list[i]._values;
      listResult.push(obj);
      /*var row = {};
      for (var j = 0; j < keyLen; j++) {
        var key = keys[j];
        row[key] = obj[key];
        //console.info(key,row);

      }
      listResult.push(row);*/


    }
    //console.info(listResult);
    return listResult;
  },
  callbackStar:null,
  callbackComplete:null
};
