(function ($) {

  $("#purchase").hide();

  //sidenav
  $(function () {
    $(".sidenav").sidenav();
  });

  //modal
  $(document).ready(function () {
    $(".modal").modal();
  });


  var purchase = [];
  var total = 0;

  //validando huella
  $("#validateFinger").on("click", validateFinger);

  function validateFinger() {
    var finger = $("#fingerInit").val();
    $.ajax({
      type: "POST",
      url: "http://localhost:8888/proyectos/WiediiShop-Back/public/user/login",
      data: { "finger": finger },
      dataType: "json",
      success: function (response) {
        dataUser = response.result;
        if (dataUser != null) {
          storeData(dataUser, 'user');
          $.each(dataUser, function (index, element) {
            $("#name").val(element.name);
            $("#document").val(element.document);
            $("#login").hide();
            $("#purchase").show();
          });
        } else {
          alert(response.message);
        }
      },
      error: function () {
        alert("An unexpected error occurred.");
      }
    });
  }

  function storeData(data, type) {

    switch (type) {
      case 'user':
        $.each(data, function (index, element) {
          purchase['idUser'] = element.idUser;
          purchase['name'] = element.name;
          purchase['documentUser'] = element.document;
          purchase['mail'] = element.mail;
        });
        break;
      case 'product':
        var product = [];
        $.each(data, function (index, element) {
          product['idProduct'] = element.idProduct;
          product['name'] = element.name;
          product['price'] = element.price;
          product['barcode'] = element.barcode;
          purchase.push(product);
        });
        break;
    }
  }

  //boton salir
  $("#logout").on("click", logout);

  function logout() {
    $.ajax({
      type: "POST",
      url: "http://localhost:8888/proyectos/WiediiShop-Back/public/user/logout",
      dataType: "json",
      success: function (response) {
        $("#login").show();
        $("#purchase").hide();
        $("#fingerInit").val("");
        $("#name").val("");
        $("#document").val("");
        $("#barcode").val("");
        $("#product").val("");
        $("#subtotal").val("");
        $("#total").val("");
        purchase = [];
        total = 0;
      },
      error: function () {
        alert("An unexpected error occurred.");
      }
    });
  }

  //enviar email
  $("#sendMail1").on("click", sendMail);
  $("#sendMail2").on("click", sendMail);

  function sendMail() {
    if (purchase.lenght > 0 || purchase['mail'] == null) {
      alert("Ponga su huella para continuar");
    } else {
      alert(purchase['mail']);
    }
  }

  //leer codigo de barras
  $("#barcode").on("keyup", readBarcode);

  function readBarcode() {

    var barcode = $("#barcode").val();
    if (barcode != '') {
      $.ajax({
        type: "GET",
        url: "http://localhost:8888/proyectos/WiediiShop-Back/public/product/getByBarcode/" + barcode,
        dataType: "json",
        success: function (response) {
          dataProduct = response.result;
          if (dataProduct != null) {
            $.each(dataProduct, function (index, element) {
              $("#product").val(element.name);
              $("#subtotal").val(element.price);
              total = parseInt(total) + parseInt(element.price);
              $("#total").val(total);
              storeData(dataProduct, 'product');
            });
          } else {
            $("#product").val("");
            $("#subtotal").val("");
          }
        },
        error: function () {
          alert("An unexpected error occurred.");
        }
      });
    }
  }
})(jQuery);
