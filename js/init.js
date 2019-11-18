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


  var products = [];
  var user = {};
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
          user['idUser'] = element.idUser;
          user['name'] = element.name;
          user['documentUser'] = element.document;
          user['mail'] = element.mail;
        });
        break;
      case 'product':
        var product = {};
        $.each(data, function (index, element) {
          product['idProduct'] = element.idProduct;
          product['name'] = element.name;
          product['price'] = element.price;
          product['barcode'] = element.barcode;
          products.push(product);
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
        products = [];
        user = {};
        total = 0;
      },
      error: function () {
        alert("An unexpected error occurred.");
      }
    });
  }

  //leer codigo de barras
  $("#barcode").on("keyup", readBarcode);

  function readBarcode() {

    var barcode = $("#barcode").val().trim();
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

  //confirmar compra
  $("#buy").on("click", confirmPurchase);

  function confirmPurchase() {

    $.ajax({
      type: "POST",
      url: "http://localhost:8888/proyectos/WiediiShop-Back/public/purchase/save",
      data: { "user": user['idUser'], "products": products },
      dataType: "json",
      success: function (response) {
        alert(response.message);
      },
      error: function () {
        alert("An unexpected error occurred.");
      }
    });

    sendMail();
    logout();
  }

  //enviar email
  $("#sendMail1").on("click", sendMail);
  $("#sendMail2").on("click", sendMail);

  function sendMail() {
    if (user.lenght > 0 || user['mail'] == null) {
      alert("Ponga su huella para continuar");
    } else {
      alert(user['mail']);
      console.log(user);
      $.ajax({
        type: "POST",
        url: "http://localhost:8888/proyectos/WiediiShop-Back/public/purchase/sendMail",
        data: user,
        dataType: "json",
        success: function (response) {
          console.log(response);
        },
        error: function () {
          alert("An unexpected error occurred.");
        }
      });
    }
  }

})(jQuery);
