(function($) {

    //sidenav
    $(function() {
        $('.sidenav').sidenav();
    });

    //modal
    $(document).ready(function() {
        $('.modal').modal();
    });

    //validando huella
    $("#validarHuella").on("click", validarHuella);

    function validarHuella() {
        $.ajax({
            url: 'http://localhost:8888/proyectos/WiediiTienda/public/usuarios',
            success: function(respuesta) {
                console.log(respuesta);
            },
            error: function() {
                console.log("No se ha podido obtener la información");
            }
        });
    }

})(jQuery);