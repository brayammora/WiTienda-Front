(function ($) {

  $("#purchase").hide();
  $("#returns").hide();

  //mantener el focus de la huella al empezar
  $("#fingerInit").focus();
  $("#fingerInit").blur(function () {
    if ($('#login').is(':visible')) {
      $("#fingerInit").focus();
    }
  });

  //mantener el focus del lector de codigo de barras
  $("#barcode").blur(function () {
    if ($('#purchase').is(':visible')) {
      $("#barcode").focus();
    }
  });
  $("#barcodeReturn").blur(function () {
    if ($('#returns').is(':visible')) {
      $("#barcodeReturn").focus();
    }
  });

  var products = [];
  var user = {};
  var total = 0;

  // <!-- :::::::::::::::::::: SCRIPTS General :::::::::::::::::::: -->

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

  //enviar email
  function sendMail() {
    console.log(user['mail']);
    $.ajax({
      type: "POST",
      url: "http://localhost:8888/proyectos/WiediiShop-Back/public/purchase/sendMail",
      data: user,
      dataType: "json",
      success: function (response) {
        console.log(response);
      },
      error: function () {
        console.log("Send Mail Error");
        //alert("An unexpected error occurred.");
      }
    });
  }
  // <!-- :::::::::::::::::::: SCRIPTS END General :::::::::::::::::::: -->


  // <!-- :::::::::::::::::::: SCRIPTS Login :::::::::::::::::::: -->

  //validando huella
  $("#fingerInit").on("keyup", validateFinger);

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
            $("#name").html("Bienvenido: " + element.name);
            $("#goReturns").hide();
            $("#fingerInit").blur();
            $("#login").hide();
            $("#purchase").show();
            $("#barcode").focus();
          });
        }
      },
      error: function () {
        alert("Ocurrió un error inesperado.");
      }
    });
  }

  //boton salir
  $("#logout").on("click", logout);

  function logout() {
    $.ajax({
      type: "POST",
      url: "http://localhost:8888/proyectos/WiediiShop-Back/public/user/logout",
      dataType: "json",
      success: function (response) {
        $("#barcode").blur();
        $("#login").show();
        $("#fingerInit").focus();
        $("#purchase").hide();
        $("#returns").hide();
        $("#fingerInit").val("");
        $("#name").html("");
        $("#goReturns").show();
        $("#barcode").val("");
        $("#product").val("");
        $("#subtotal").val("");
        $("#total").val("");
        products = [];
        user = {};
        total = 0;
      },
      error: function () {
        alert("Ocurrió un error inesperado.");
      }
    });
  }

  // <!-- :::::::::::::::::::: SCRIPTS END Login :::::::::::::::::::: -->


  // <!-- :::::::::::::::::::: SCRIPTS Purchase :::::::::::::::::::: -->

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
            console.log(response.message)
            if (response.message.trim == "Producto ya vendido.") {
              $("#product").val("Producto ya vendido.");
            }
            $("#product").val("");
            $("#subtotal").val("");
          }
        },
        error: function () {
          alert("Ocurrió un error inesperado.");
        }
      });
    }
  }

  //confirmar compra
  $("#buy").on("click", confirmPurchase);

  function confirmPurchase() {

    if (products.length > 0) {
      $.ajax({
        type: "POST",
        url: "http://localhost:8888/proyectos/WiediiShop-Back/public/purchase/save",
        data: { "user": user['idUser'], "products": products },
        dataType: "json",
        success: function (response) {
          M.toast({ html: response.message, classes: 'center' })
        },
        error: function () {
          alert("Ocurrió un error inesperado.");
        }
      });
      $("#confirmPurchase").show();
      //sendMail();
      logout();
    }
  }

  // <!-- :::::::::::::::::::: SCRIPTS END Purchase :::::::::::::::::::: -->


  // <!-- :::::::::::::::::::: SCRIPTS Returns :::::::::::::::::::: -->

  //ir a devoluciones
  $("#goReturns").on("click", goReturns);

  function goReturns() {

    $("#fingerInit").blur();
    $("#login").hide();
    $("#returns").show();
    $("#barcodeReturn").focus();
  }

  //leer codigo de barrras de devolucion
  $("#barcodeReturn").on("keyup", readBarcodeReturn);

  function readBarcodeReturn() {

    var barcodeReturn = $("#barcodeReturn").val().trim();
    if (barcodeReturn != '') {
      $.ajax({
        type: "GET",
        url: "http://localhost:8888/proyectos/WiediiShop-Back/public/purchase/getByBarcodeReturn/" + barcodeReturn,
        dataType: "json",
        success: function (response) {
          dataPurchase = response.result;
          if (dataPurchase != null) {
            $.each(dataPurchase, function (index, element) {
              $("#productReturn").val(element.productName);
              $("#owner").val(element.userName);
              $("#datePurchased").val(element.datePurchase);
              storeData(dataPurchase, 'purchase');
            });
          } else {
            $("#productReturn").val("");
            $("#owner").val("");
            $("#datePurchased").val("");
          }
        },
        error: function () {
          alert("Ocurrió un error inesperado.");
        }
      });
    }
  }

  //boton salir de devoluciones
  $("#logoutReturn").on("click", logoutReturn);

  function logoutReturn() {
    $.ajax({
      type: "POST",
      url: "http://localhost:8888/proyectos/WiediiShop-Back/public/user/logout",
      dataType: "json",
      success: function (response) {
        $("#barcodeReturn").blur();
        $("#login").show();
        $("#fingerInit").focus();
        $("#purchase").hide();
        $("#returns").hide();
        $("#fingerInit").val("");
        $("#name").html("");
        $("#goReturns").show();
        $("#barcodeReturn").val("");
        $("#productReturn").val("");
        $("#subtotalReturn").val("");
        $("#totalReturn").val("");
        products = [];
        user = {};
        total = 0;
      },
      error: function () {
        alert("Ocurrió un error inesperado.");
      }
    });
  }
  // <!-- :::::::::::::::::::: SCRIPTS END Returns :::::::::::::::::::: -->
})(jQuery);
