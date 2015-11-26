"use strict";
var console = console || {},
  google = google || {},
  map = map || {},
  MarkerClusterer = MarkerClusterer || {},
  initMap = initMap || {};

var ModuleGasMarket;
ModuleGasMarket = {

  fullData: null,
  ini: function () {

    if (!this.fullData) {

      this.fullData = [];
      this.prepareUI();
      //this.loadDataByCoor();
      $(".noObjetosListados").hide();
      $("#objetosEncontrados").hide();
      initMap();
      MdlDpto.ini();

      MdlFilter.prepareUI();
      this.loadDataByCoor();

    }

  },


  //<editor-fold desc="Cargar datos">
  //---cargar---------------------------------------------------------------------
  loadDataByCoor: function () {

    var succes = function (data) {
      var dpto = data.RECORDS.dpto;
      if (!MdlDpto.isLoad(dpto)) {
        var cuantos = data.RECORDS.list.length;

        ModuleGasMarket.prepareData(data.RECORDS.list);
        MdlDpto.estadoCargado(dpto, cuantos);
        //TODO sacar mensaje avisando que se cargo, ni yo me entiendo?
        ModuleGasMarket.msgLoadDepartamenteByCoord(dpto);
      }
    };


    $("#cargando").show();

    MdlGeolocation.errorCallback = function () {
      var text = '<div class="alert alert-danger" role="alert">' +
        '<strong>No se ha autorizado compartir la ubicacion o hay problemas al detectarla.</strong></br>' +
        'Para descargar manualmente por favor cierre este mensaje dele click en boton "Cargar Departamentos"' +
        '</div>'
      $("#contentMensajes").html(text);
      $("#mensajes").modal('show');
      $("#cargando").hide();
    }
    MdlGeolocation.eventoSuccess = function (lat, lon) {
      //consultar coordenadas y enviarlas como parametro
      $.ajax({
        typex: "POST",
        type: "GET",
        dataType: "json",
        //url:"data/test10mill.json",

        contentType: "application/json; chartset:utf-8",
        url: "data/getByDepartament.json",
        urlx: "GasFillDep.aspx/getDepListaByCoords",

        //url: "data/gasmarket.json",
        data: JSON.stringify({lat: lat, lon: lon}),
        success: succes,
        error: function (error) {
          console.error(error);
        },
        async: true
      });
    };
    MdlGeolocation.geolocation();
  },
  loadDataByDepartament: function (depto) {
    console.info("se ha solicitado cargar el dpto", depto,MdlDpto.isLoad(depto));

    if (!MdlDpto.isLoad(depto)) {
      var succes = function (data) {
        console.info("data", data);
        data = data.d;
        ModuleGasMarket.prepareData(data.list);
        var cuantos = data.list.length;
        MdlDpto.estadoCargado(depto, cuantos);
      };


      $("#cargando").show();
      var url = "data/getByDepartament" + depto + ".json";
      //console.info("solicitando el archivo", url);
      $.ajax({
        typex: "POST",
        type: "GET",
        dataType: "json",
        //url:"data/test10mill.json",
        contentType: "application/json; chartset:utf-8",
        url: url,
        urlx: "GasFillDep.aspx/getDepListaByDepartament",
        //url: "data/gasmarket.json",
        data: JSON.stringify({departament: depto}),
        success: succes,
        error: function (error) {
          console.error(error);
          MdlDpto.estadoPendiente(depto);
        },
        async: true
      });
    }
  },
  prepareItem: function (obj) {

    if (!ModuleGasMarket.bandTemp) {
      console.info(obj);
      ModuleGasMarket.bandTemp = true;
    }
    if (obj.id) {
      //MdlList.createListItem(obj);
      obj.loc = (obj.lat) ? "loc" : null;//-------------


      var marker = MdlCluster.createMarker(obj);
      var mrkid = "mrk_" + obj.id + "_";
      console.info("marker",marker);
      obj.mrkid = mrkid;
      marker.mrkid = mrkid;
      marker.obj = obj;
      MdlCluster.data[mrkid] = marker;
      MdlCluster.markers.push(marker);
      MdlFilter.agregateFilter(obj);
      ModuleGasMarket.fullData.push(obj);
    }
  },
  prepareData: function (data) {
    //data = data.RECORDS;
    //ModuleGasMarket.fullData = data;
    //console.info("preparedata",data);
    console.info("preparedata");
    ProcessArray(data, ModuleGasMarket.prepareItem, ModuleGasMarket.endPrepareData);
    //console.info("this.prepareData",this);
    //ModuleGasMarket.endPrepareData(data);
  },
  endPrepareData: function (data) {
    console.info("endPrepareData");
    MdlList.ini(data);
    MdlCluster.refreshCluster(MdlCluster.markers, MdlCluster.bound);
    MdlFilter.fillFilterData();

    $("#cargando").hide(2000);//ocultar el mensaje de cargando cuando termina
    //google.maps.event.trigger(map, 'resize')
  },
  //</editor-fold>

  //<editor-fold desc="UI">
  ///---------------------- ui -----------------
  showAll: function () {
    MdlList.showAll();
    MdlCluster.showAll();
  },
  eventIrA: function (event) {
    console.info(event);
    var parent = $(event.currentTarget).parent();
    var mrkid = $(parent).find(".id").html();
    console.info("mrkid", mrkid);
    mrkid = "mrk_" + mrkid + "_";
    MdlCluster.showMarker(mrkid);
    return mrkid;
  },
  prepareUI: function () {
    $("#btnDownload").click(function () {
      ModuleGasMarket.downloaFileList();
    });
    $(".btnLimpiar").click(function () {


      $("[type=date]").val("");
      MdlFilter.clearFilter();
      ModuleGasMarket.showAll();
      $("#quick_search").val("");
      MdlList.showResume();
      MdlFilterShape.limpiar();
    });
    $(".btnFiltrar").click(function () {
      var objFilter = MdlFilter.getObjectConsult();
      var listFech = ModuleGasMarket.getFilterByDate();
      console.info("listFech",listFech);
      if (listFech && listFech !== null && objFilter !== null) {
        objFilter.mrkid = listFech;
      }

      console.info("objFilter", objFilter);
      var filterFunc = function (obj) {
        return filterObjectBy(obj, objFilter);
      };

      ModuleGasMarket.startFilterData(filterFunc);
    });
    $(document).on("click", ".btnIrA", ModuleGasMarket.eventIrA);
    $(document).on("click", ".btnEdit", function (event) {
      var mrkid = ModuleGasMarket.eventIrA(event);
      var objEDS = MdlCluster.data[mrkid].obj;
      //console.info(objEDS);
      var indexCallback = {
        endLoad: function (value) {
          if (value) {
            //console.info("cargo la pagina",value);
            if (value.msg) {
              //envia objeto
              MdlStorage.sendMsg("sendObjDetail", objEDS);
            }
          }
        },
        updateObjDetail: function (value) {
          if (value) {
            console.info("actualizo la informacion", value);
            if (value.msg) {
              ModuleGasMarket.updateEDS(value.msg, mrkid);
            }
          }
        }
      };

      MdlStorage.idem = "master";
      MdlStorage.indexCallback = indexCallback;

      MdlStorage.ini();
      var redirectWindow = window.open('detailol.html', '_blank');
      redirectWindow.location;
    });
    var timer = null;
    $("#quick_search").keyup(function (event) {
      var on = function () {
        ModuleGasMarket.showAll();
        var val = $("#quick_search").val();
        var len = val.length;
        if (len > 3) {
          console.info("------------------");


          var filterFunc = function (obj) {
            var res = filterObjectBy(obj, {nom: val});
            console.info("res nom", res);
            res = res || filterObjectBy(obj, {dep: val});
            console.info("res dep", res);
            res = res || filterObjectBy(obj, {cit: val});
            console.info("res cit", res);
            res = res || filterObjectBy(obj, {dir: val});
            console.info("res dir", res);
            res = res || filterObjectBy(obj, {cat: val});
            console.info("--------res car", res);
            return res;
          };

          ModuleGasMarket.startFilterData(filterFunc);
        } else if (len === 0) {
          //ModuleGasMarket.gasList.search();
          $("#btnLimpiar").click();
          MdlList.showResume();
        }
        MdlFilter.clearFilter();
      };
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(on, 1000);
    });
    $("#btnShowFilter").click(function () {
      ModuleGasMarket.togglePanelDataFilter();
    });
    $("#btnSpSearch").click(function () {//si boton buscar
      //buscar sobre la fulldata
      var filterFunc = function (objeto) {
        var res = false;
        var lat = objeto.lat;
        var lon = objeto.lon;
        res = MdlFilterShape.filtro(lat, lon);

        return res;
      };


      //verifica que seleccione un busqueda
      //ingresa el filtro
      ModuleGasMarket.startFilterData(filterFunc);
    });
    $(".btnSpSrh").click(function () {//si boton de filtrospacila
      if ($(this).is("#btnSpSrhPoligon")) {//boton poligono
        $("#collapseExample").removeClass("in");
        $("#msgSpSearch").text("Ha seleccionado busqueda por poligono");
        //console.info("boton poligono");
        //crea poligono en el centro del mapa
        MdlFilterShape.createPolygon(map.getCenter());
        map.setZoom(13);
        //aumentar el zoom
      } else {//boton circulo
        //crea circulo con el radio seleccionado
        $("#msgSpSearch").text("Ha seleccionado busqueda por circulo, por favor seleccione el radio del mismo");
        //console.info("boton circulo");

      }

    });
    $(".radioSpSearch").click(function () {
      var radio = $(this).data("radio");
      radio = radio || 10;
      radio = radio * 1000;
      //console.info("radio",radio,map.getCenter());
      MdlFilterShape.createCircle(map.getCenter(), radio);
      map.setZoom(13);
      //aumentar el zoom
    });
    $("#btnSpLimpiar").click(function () {
      $("#btnLimpiar").click();

    });
    $("[type=date]").datetimepicker({
      viewMode: 'years',
      locale: 'es',
      format: 'LL'
    });

    $(".ubicad").click();//FIXME se supone que ya esta listo
  },

  togglePanelDataFilter: function (marker) {
    if (marker) {
      var objeto = marker.obj;
      console.info(objeto);


      ModuleGasMarket.getTextDetail(objeto);

      $("#panelData").removeClass("hidden");
      $("#panelFilter").addClass("hidden");
    } else {
      $("#panelData").addClass("hidden");
      $("#panelFilter").removeClass("hidden");
    }

  },
  getTextDetail: function (objeto) {
    var text = $("#templateDetail").html();
    text = miniMustache(objeto, text);
    $("#datailContent").empty().append(text);
  },
  msgLoadDepartamenteByCoord: function (dpto) {
    var text = '<div class="alert alert-success" role="alert">' +
      'Segun sus coordenadas, hemos detectado que se encuentra en el departamento de <strong>' + dpto + '</strong>' +
      ', razon por la cual hemos descargado inicialmente la informacion de dicho departamento, si desea ver informacion ' +
      'de otros departamentos, por favor cierre este mensaje dele click en boton "Cargar Departamentos"' +
      '</div>'
    $("#contentMensajes").html(text);
    $("#mensajes").modal('show');
  },
  //</editor-fold>

  //<editor-fold desc="Filtro">
  //--------  filtro ----------------------
  startFilterData: function (objFilter) {
    var encontrados = ModuleGasMarket.filterData(objFilter);
    //console.log("encontrados",encontrados);

    MdlList.startFilterList(encontrados);
    MdlCluster.eventFilter(encontrados);
    MdlList.showResume();
    map.render();
  },


  filterData: function (filterFunc) {
    var len = this.fullData.length;
    var encontrados = [];
    for (var i = 0; i < len; i++) {
      var obj = this.fullData[i];

      if (filterFunc(obj)) {
        encontrados.push(obj.mrkid);
      }
    }
    return encontrados;
  },
  getFilterByDate: function () {
    var fromValue = null;
    var toValue = null;
    fromValue = $("#vconDesde").data("DateTimePicker").date();

    fromValue = (fromValue) ? fromValue.format('YYYY/MM/DD') : null;
    toValue = $("#vconHasta").data("DateTimePicker").date();
    toValue = (toValue) ? toValue.format('YYYY/MM/DD') : null;
    console.info("valores fechas", fromValue, toValue);

    if (toValue !== null || fromValue !== null) {
      var objFil = {};
      if (fromValue) {
        objFil.from = fromValue;
      }
      if (toValue) {
        objFil.to = toValue;
      }
      var objVcon = {
        vcon : objFil

      };
      //console.info("objFill", objFil);
      var filterFunc = function (obj) {
        //console.info("objetos fechas a evaluar",obj, objFil);
        return filterDate(obj, objVcon);
      }
      var encontrados = ModuleGasMarket.filterData(filterFunc);
      if (encontrados && encontrados.length > 0) {
        console.info("encontrados", encontrados);
        return encontrados;
      }


    }

  },


  //</editor-fold>

  updateEDS: function (objEdit, mrkid) {
    var objEDS = MdlCluster.data[mrkid].obj;
    MdlCluster.data[mrkid].obj = objEdit;
    console.info(MdlCluster.data[mrkid].obj, objEDS);

    //actualizar en list
    MdlList.updateElement(objEdit);
    //TODO actualizar en filt

    //actualizar en marker
    MdlCluster.updateMarker(mrkid)
    MdlCluster.showMarker(mrkid);
  },
  downloaFileList: function () {
    var listResult = MdlList.select4Inform();
    var csv = Papa.unparse(listResult);
    saveFile(csv,"Consulta.csv");
  }


};
