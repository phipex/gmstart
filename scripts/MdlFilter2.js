var MdlFilter = {

  /**
   * Listado de filtros
   */
  dataFilter:{},
  /**
   * Agrega a la lista de filtros la propiedad para ser ingresasa
   * en los filtros
   * @param object objeto a ser evaluado
   */
  agregateFilter:function(object) {
    //console.info(object);
    for(var key in this.dataFilter)
    {
      //console.info("key",key);
      var item = object[key].trim();
      if ((item) && (!this.dataFilter[key].list[item])) {
        //console.info("object.mar",object.mar);
        this.dataFilter[key].list[item] = null;
      }

    }


  },
  createDataFilter: function () {
    $(".selectDivPol").each(function () {
      var id= $(this).attr("id");
      var prop = $(this).data("prop");
      MdlFilter.dataFilter[prop]={
        id:id,
        list:{}
      };

    });
  },
  prepareUI: function () {
    this.createDataFilter();
    $("#dataFiltro").hide();

    $(".selectDivPol").select2();


    function updateLbNoFilter(){
      //console.info("updateLbNoFilter");
      var filterNum = 0;

      $(".filtroSelec").each(function () {
        var len = $(this).html().length;
        //console.info("len",len);
        filterNum += (len > 0)?1:0;
      });


      //console.info("filterNum",filterNum);
      if(filterNum > 0){
        $("#dataNoFiltro").hide();
        $("#dataFiltro").show();
      }else{
        $("#dataNoFiltro").show();
        $("#dataFiltro").hide();
      }
    }

    function vaciarLbFilVal(select) {
      var lbFilVal = $(select).data("lbfilval");

      var $lbFilVal = $("#" + lbFilVal + "");
      $lbFilVal.empty();
      updateLbNoFilter();
      console.info("vaciarLbFilVal",select,lbFilVal);
      return $lbFilVal;
    }

    function addLbFilVal($lbFilVal,element,option){
      //console.info("option",option);

      var mod;
      if(option){//esta definido
        if(typeof valuefilt === "string")//es un string
        {
          mod = true;
        }else if(option.length !== 1 || option[0] !== ""  ){//es [""]
          mod = true;
        }
        if (mod) {
          $lbFilVal.append("div").html("" + textoCon(element) + ": " + option+ "   <span data-elemento='"+textoSin(element)+"' class='btn btn-default btn-xs glyphicon glyphicon-remove clearFilter'></span>");
        }
      }


      updateLbNoFilter();
    }



    var eventSelect = function (e) {
      //console.info(e);
      var select = e.currentTarget;

      //console.info(select);
      var elemento = $(select).data("elemento");

      var option = $(select).select2("val");
      //console.info("option",option);

      var $lbFilVal = vaciarLbFilVal(select);

      addLbFilVal($lbFilVal, elemento, option);

      var optPar = $(select).data("optpar");

      if (optPar) {
        //console.warn("optpar", optPar, $("#" + optPar));
        select = $("#" + optPar);
        select.val(null).trigger("change");


      }


    };
    // $(".selectDivPol").on("select2:select select2:unselect", eventSelect);
    $(document).on("select2:close",".selectDivPol", eventSelect);
    $(document).on("click","span.clearFilter",function () {
      //console.info("click en el boton de limpiar filtro");
      var element = $(this).data("elemento");
      //console.info("element",element,"select","select[data-elemento="+element+"]");
      console.info("elemento","-"+element+"-");
      if (element === "Servicios") {
        $(".inputWalls.active").each(function () {
          $(this).removeClass("active");
          $(this).find('input').prop('checked',false);

        });

        //TODO set unchecked todos
        $("#lblFilServ").empty();
        updateLbNoFilter();



      }else if(element === "Ubicadas"){
        console.info("limpia ubicadas");
        $(".ubicad.active").each(function () {
          //console.info(this);
          $(this).removeClass("active");
          $(this).find('input').prop('checked',false);

        });
      }
      else {
        console.info("[data-elemento=" + textoSin(element) + "]")
        $("[data-elemento=" + textoSin(element) + "]").each(function () {
          $(this).val(null).trigger("change");
          vaciarLbFilVal(this);
        });
      }
    });

    //--------
    $(document).on("click",".inputWalls",function () {
      function updateLabel() {
        console.info("click en un servicio", $(".inputWalls.active input"));
        var servs = [];
        $(".inputWalls.active input").each(function () {
          //console.info($(this).data("serv"));
          var value = $(this).val();
          //console.info("value",value);
          servs.push(value);
        });
        var $lbFilVal = $("#lblFilServ");
        addLbFilVal($lbFilVal, "Servicios", servs);
      }
      setTimeout(updateLabel,900);

    });

    $(document).on("click",".ubicad",function () {
      function updateLabel() {
        console.info("click en ubicadas", $(".ubicad.active input"));
        var servs = [];
        $(".ubicad.active input").each(function () {
          //console.info($(this).data("serv"));
          var value = $(this).val();
          //console.info("value",value);
          servs.push(value);
        });
        var $lbFilVal = $("#lblFilUbicad");
        addLbFilVal($lbFilVal, "Ubicadas", servs);
      }
      setTimeout(updateLabel,900);

    });


    $("[type=date]").on("dp.change",function(){
      //console.info("datepicker",this,$(this).val());
      var $this = $(this);
      //console.info($this);
      var value = $this.val();

      var type = $this.data('elemento');

      var $lbFilVal = $this.data('lbfilval');
      $lbFilVal = $("#"+$lbFilVal);
      console.info("fechas",$lbFilVal, type, value);
      addLbFilVal($lbFilVal, type, value);
    });

    $(".ubicad").click();
    //-------------
  },
  fillFilterData: function () {
    //limpiar todas las opciones
    $(".selectDivPol").empty();
    var filtros = this.dataFilter;

    for(var key in filtros){
      var list = filtros[key].list;
      list = Object.keys(list);
      list = list.sort();
      var id = filtros[key].id;
      if (id) {
        var $id = $("#"+id);
        $id.empty();
        //console.info("MdlFilter:fillFilterData:$id", id, $id);
        var text = "";
        for (var i = 0; i < list.length; i++) {
          var value = list[i];
          text += '<option value="' + value + '">' + value + '</option>';

        }
        $id.append(text);
      }
    }


  },
  getObjectConsult: function () {
      var objFill = {};
      //filtro datos
      $(".selectDivPol ").each(function () {
          var val = $(this).val();
        var mod;
        if(val && val !== ""){//esta definido
          /*if(val.length !== 1 || val[0] !== ""  ){//es [""]
            mod = true;
          }else{
            mod = false;
          }*/
          mod = (val.length !== 1 || val[0] !== ""  );
          if (mod) {
            var prop = $(this).data("prop");
            if(!objFill[prop])
            {
              objFill[prop] = val;
            }
          }
        }
      });
    //filtro servicios
    $("[name=inputWalls]:checked").each(function () {
      console.info($(this).data("serv"));
      var serv = $(this).data("serv");

      objFill[serv] = true;
    });

    $("[name=ubicad]:checked").each(function () {
      console.info($(this).data("ubic"));
      var ubic = $(this).data("ubic");


      if(!objFill.loc)
      {
        objFill.loc=[];
      }
      objFill.loc.push(ubic);


    });

    return objFill;


  },
  clearFilter: function () {
    $(".clearFilter").click();
  }





  };
