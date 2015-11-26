

var MdlDpto = {

  total:0,
  cargados:0,
  deptos:{},
  updateButton: function () {
    //FIXME validar para que no carge varias veces el mismo
    $("#numDptoLoad").html(MdlDpto.cargados);
    $("#numDptoTotal").html(MdlDpto.total);
  },
  filldata: function (data) {
    data = data.d.sort();

    var template = $("#templateDepto").html();
    var textDept = "";
    $(data).each(function (index,item) {

      console.info("textoSin(item)",item,textoSin(item));
      var text = replaceAll(template,"{{Departamento}}",item);
      text = replaceAll(text,"{{DepartamentoSin}}",textoSin(item));
      textDept += text;
    });
    //console.info(textDept);
    $("#contentDeptos").append(textDept);
    MdlDpto.total=data.length;
    MdlDpto.updateButton();
  },
  ini: function () {
    $.ajax({
      typex: "POST",
      type: "GET",
      contentType: "application/json; chartset:utf-8",
      dataType: "json",
      //url:"data/test10mill.json",
      url: "data/getDepartamentos.json",
      urlx: "GasFillDep.aspx/getDepartamentos",

      //url: "data/gasmarket.json",
      data: JSON.stringify({}),
      success: MdlDpto.succes,
      error: function(error){
        console.error(error);
      },
      async: true
    });
  },
  succes:function(data){
    MdlDpto.filldata(data);

    //dptoSin muestro
    $(".dptoSin").show();
    //dptoLoadEnd oculto
    //dptoLoading oculto
    $(".dptoLoadEnd,.dptoLoading").hide();
    //addClass bg-danger
    $(".dptoSec").addClass("bg-danger");

    $(".dptoBtnLoad").click(function(){
      var id= $(this).data("target");
      var depto = $(this).data("depto");
      console.info("click en el boton descargar departamento",depto,MdlDpto.isLoad(depto));

      if (!MdlDpto.isLoad(depto)) {
        console.info("DPTO id", id, depto);
        MdlDpto.estadoCargando(id);
        ModuleGasMarket.loadDataByDepartament(depto);
      }
    });
    $("#btnLoadAll").click(function () {
      if(confirm("Recuerde que esto pued tardar un momento y relentizar su navegador, esta seguro?")){
        $(".dptoBtnLoad").each(function () {
          try {
            $(this).click();
          } catch (e) {
          }
        });
      }
    });
  },
  openPanel: function () {
    $("#myModal").modal('show');
  },

  estadoPendiente: function (dpto) {
    //console.info("estadopendiente",dpto,"div[id='apto"+textoSin(dpto) +"']");
    var $divDpto = $("div[id='apto"+textoSin(dpto) +"']");
    //console.info($divDpto);
    //dpto = "#apto"+textoSin(dpto);
    $divDpto.find(".dptoSin").show();
    $divDpto.addClass("bg-danger");
    //addClass bg-warning
    $divDpto.removeClass("bg-warning");
    $divDpto.find(".dptoLoadEnd .dptoCount").html("");
    $divDpto.find(".dptoLoadEnd").hide();
    $divDpto.find(".dptoLoading").hide();
  },
  estadoCargando : function(dpto){
    //dptoLoading muestro
    var $divDpto = $("div[id='apto"+textoSin(dpto) +"']");
    $divDpto.find(".dptoLoading").show();
    //dptoSin oculto
    $divDpto.find(" .dptoSin").hide();
    //removeClass bg-danger
    $divDpto.removeClass("bg-danger");
    //addClass bg-warning
    $divDpto.addClass("bg-warning");

    /*setTimeout(function(){
     MdlDpto.estadoCargado(dpto,13);
     },5000);*/
  },
  estadoCargado: function(dpto,cuantos){
    console.info("estadoCargado",dpto,cuantos);
    MdlDpto.deptos[dpto]= cuantos;
    var $divDpto = $("div[id='apto"+textoSin(dpto) +"']");
    //dpto= "#apto"+textoSin(dpto);
    //dptoLoading oculto
    $divDpto.find(" .dptoLoading").hide();
    //dptoSin oculto
    $divDpto.find(" .dptoSin").hide();
    //dptoLoadEnd
    $divDpto.find(" .dptoLoadEnd").show();
    $divDpto.find(".dptoLoadEnd .dptoCount").html(cuantos);
    //removeClass bg-danger
    $divDpto.removeClass("bg-danger");
    //removeClass bg-warning
    $divDpto.removeClass("bg-warning");
    //addClass bg-success
    $divDpto.addClass("bg-success");
    MdlDpto.cargados += 1;
    MdlDpto.updateButton();
  },
  isLoad: function (dpto) {
    if(MdlDpto.deptos[dpto])
    {
        return true;
    }else{
      return false;
    }
  }

};
