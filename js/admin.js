(function ($) {

  $("#main-page").hide();
  $("#products").hide();
  $("#usuarios").hide();
  $("#compras").hide();
  $("#devolucion").hide();
  $('.sidenav').sidenav();

  var server = "http://localhost:8888/proyectos/WiediiShop-Back/public/";
  var user = {};
  //validando huella
  $("#buttonLogin").on("click", login);

  function login() {
    var email = $("#email").val();
    var password = $("#password").val();

    // $.ajax({
    //   type: "POST",
    //   url: server + "user/loginAdmin",
    //   data: { "email": email, "password": password },
    //   dataType: "json",
    //   success: function (response) {
    //     dataUser = response.result;
    //     if (dataUser != null) {
    //       storeData(dataUser, 'user');
    //       $.each(dataUser, function (index, element) {
    //         $("#name").html("Bienvenido: " + element.name);
    //         $("#login-page").hide();
    //         $("#main-page").show();
    //       });
    //     }
    //   },
    //   error: function () {
    //     alert("Ocurrió un error inesperado.");
    //   }
    // });

    $("#login-page").hide();
    $(document.body).removeClass('indigo darken-3');
    $(document.body).addClass('grey lighten-4');
    $("#main-page").show();
    showProducts();
  }

  //guardar datos
  function storeData(data, type) {

    switch (type) {
      case 'user':
        $.each(data, function (index, element) {
          user['idUser'] = element.idUser;
          user['name'] = element.name;
          user['documentUser'] = element.document;
          user['mail'] = element.mail;
        });
        break;
    }
  }

  $("#buttonProducts").on("click", showProducts);

  function showProducts() {

    $("#products tbody").html("");
    $('#myPager').html("");
    $("#products").show();
    $("#usuarios").hide();
    $("#compras").hide();
    $("#devolucion").hide();

    var table = $("#productList tbody");
    $.ajax({
      type: "GET",
      url: server + "product/getAll",
      dataType: "json",
      success: function (response) {
        dataProduct = response.result;
        if (dataProduct != null) {
          $.each(dataProduct, function (i, elem) {
            table.append("<tr><td>" + elem.barcode + "</td><td>" + elem.name + "</td><td>$" + elem.price +
              "</td><td class='center'><button class='waves-effect waves-light teal btn-small'" +
              "value='" + elem.idPurchase + "'> Edit </button> <button class='waves-effect waves-light red btn-small'" +
              "value='" + elem.idPurchase + "'> X </button></td></tr>");
          });
        } else {
          table.append("<tr><td colspan='4'>No hay compras registradas.</td></tr>");
        }
      },
      error: function () {
        alert("Ocurrió un error inesperado.");
      }
    });

    $('#productList').pageMe({
      pagerSelector: '#myPager',
      activeColor: 'indigo',
      showPrevNext: true,
      hidePageNumbers: false,
      perPage: 7
    });
  }

})(jQuery);