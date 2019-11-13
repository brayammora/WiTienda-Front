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
        switch (respuesta.mensaje) {
          case "denegado":
            alert("Huella vacia: Acceso no autorizado.");
            break;
          case "inexistente":
            alert("No existen ningún usuario con esa huella.");
            break;
          default:
            var datos = JSON.parse(respuesta.mensaje);
            $.each(datos, function(index, elemento) {
              $("#nombre").val(elemento.nombre);
              $("#documento").val(elemento.cedula);
              $("#login").hide();
              $("#factura").show();
            });
        }
      },
      error: function() {
        alert(respuesta.mensaje);
      }
    });
  }

  //boton salir
  $("#salir").on("click", salir);

  function salir() {
    $("#login").show();
    $("#factura").hide();
  }
})(jQuery);