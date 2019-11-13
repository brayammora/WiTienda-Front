(function($) {
  $("#factura").hide();

  //sidenav
  $(function() {
    $(".sidenav").sidenav();
  });

  //modal
  $(document).ready(function() {
    $(".modal").modal();
  });

  //validando huella
  $("#validarHuella").on("click", validarHuella);

  function validarHuella() {
    var huella = $("#huella").val();
    $.ajax({
      type: "POST",
      url: "http://localhost:8888/proyectos/WiediiTienda/public/login",
      data: { "huella" : huella },
      dataType: "json",
      success: function(respuesta) {
        datos = respuesta.result;
        if(datos != null ){
            $.each(datos, function(index, elemento) {
                $("#nombre").val(elemento.nombre);
                $("#documento").val(elemento.cedula);
                $("#login").hide();
                $("#factura").show();
            });
        }else{
            alert(respuesta.message);
        }
      },
      error: function() {
        alert("Ocurrió un error con la aplicación.");
      }
    });
  }

  //boton salir
  $("#salir").on("click", salir);

  function salir() {
    $.ajax({
      type: "GET",
      url: "http://localhost:8888/proyectos/WiediiTienda/public/logout",
      dataType: "json",
      success: function(respuesta) {
        $("#login").show();
        $("#factura").hide();
      },
      error: function() {
        alert("Ocurrió un error con la aplicación.");
      }
    });
  }
})(jQuery);
