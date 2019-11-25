(function ($) {

  $("#purchase").hide();
  $("#returns").hide();
  $("#survey").hide();

  //mantener el focus de la huella al empezar
  $("#fingerInit").focus();
  $("#fingerInit").blur(function () {
    if ($('#login').is(':visible')) {
      $("#fingerInit").focus();
    }
  });

  //mantener el focus del lector de codigo de barras en una compra
  $("#barcode").blur(function () {
    if ($('#purchase').is(':visible')) {
      $("#barcode").focus();
    }
  });

  //mantener el focus del lector de codigo de barras en una devolucion
  $("#barcodeReturn").blur(function () {
    if ($('#returns').is(':visible') && $("#barcodeReturn").attr("disabled", false)) {
      $("#barcodeReturn").focus();
    }
  });

  //mantener el focus de la huella en una devolucion
  $("#fingerReturn").blur(function () {
    if ($('#returns').is(':visible') && $("#fingerReturn").attr("disabled", false)) {
      $("#fingerReturn").focus();
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
      //url: "http://localhost:8888/proyectos/WiediiShop-Back/public/purchase/sendMail",
      url: "http://localhost/proyectos/WiediiShop-Back/public/purchase/sendMail",
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
      //url: "http://localhost:8888/proyectos/WiediiShop-Back/public/user/login",
      url: "http://localhost/proyectos/WiediiShop-Back/public/user/login",
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
            $("#decrease").addClass("disabled");
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
      //url: "http://localhost:8888/proyectos/WiediiShop-Back/public/user/logout",
      url: "http://localhost/proyectos/WiediiShop-Back/public/user/logout",
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
        $("#counter").val(0);
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

    $("#decrease").addClass("disabled");

    var barcode = $("#barcode").val().trim();
    if (barcode != '') {
      $.ajax({
        type: "GET",
        //url: "http://localhost:8888/proyectos/WiediiShop-Back/public/product/getByBarcode/" + barcode,
        url: "http://localhost/proyectos/WiediiShop-Back/public/product/getByBarcode/" + barcode,
        dataType: "json",
        success: function (response) {
          dataProduct = response.result;
          if (dataProduct != null) {
            $.each(dataProduct, function (index, element) {
              $("#product").val(element.name);
              $("#counter").val(1);
              $("#subtotal").val(element.price);
              total = parseInt(total) + (parseInt(element.price));
              $("#total").val(total);
              storeData(dataProduct, 'product');
            });
          } else {
            $("#product").val("");
            $("#subtotal").val("");
            $("#counter").val(0);
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
        //url: "http://localhost:8888/proyectos/WiediiShop-Back/public/purchase/save",
        url: "http://localhost/proyectos/WiediiShop-Back/public/purchase/save",
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

  //incrementar en 1 el producto
  $("#increase").on("click", increaseValue);

  function increaseValue() {

    $("#decrease").removeClass("disabled");

    if ($("#product").val() != "") {
      var count = parseInt($("#counter").val(), 10);
      count = isNaN(count) ? 0 : count;
      count++;
      $("#counter").val(count);
      var subtotal = parseInt($("#subtotal").val(), 10);
      total = total - (subtotal * (count - 1)) + (subtotal * count);
      $("#total").val(total);
      var product = products[products.length - 1];
      products.push(product);
    }
  }

  //decrementar en 1 el producto
  $("#decrease").on("click", decreaseValue);

  function decreaseValue() {

    if ($("#product").val() != "") {
      var count = parseInt($("#counter").val(), 10);
      count = isNaN(count) ? 0 : count;
      count > 1 ? count-- : count = 1;
      $("#counter").val(count);

      if (count == 1) {
        $("#decrease").toggleClass('disabled');
      }
      if (count >= 1) {
        var subtotal = parseInt($("#subtotal").val(), 10);
        total = total - (subtotal * (count + 1)) + (subtotal * count);
        $("#total").val(total);
        products.pop();
      }
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
    $("#survey").hide();
  }

  //leer codigo de barrras de devolucion
  $("#barcodeReturn").on("keyup", readBarcodeReturn);

  function readBarcodeReturn() {

    var barcodeReturn = $("#barcodeReturn").val().trim();
    if (barcodeReturn != '') {
      $.ajax({
        type: "GET",
        //url: "http://localhost:8888/proyectos/WiediiShop-Back/public/product/getByBarcodeReturn/" + barcodeReturn,
        url: "http://localhost/proyectos/WiediiShop-Back/public/product/getByBarcode/" + barcodeReturn,
        dataType: "json",
        success: function (response) {
          dataProduct = response.result;
          if (dataProduct != null) {
            $.each(dataProduct, function (index, element) {
              $("#productReturn").val(element.name);
              $("#barcodeReturn").prop("disabled", true);
              $("#barcodeReturn").blur();
              $("#fingerReturn").prop("disabled", false);
              $("#fingerReturn").focus();
              storeData(dataProduct, 'product');
            });
          } else {
            $("#productReturn").val("");
          }
        },
        error: function () {
          alert("Ocurrió un error inesperado.");
        }
      });
    }
  }

  //validando huella
  $("#fingerReturn").on("keyup", validateReturn);

  function validateReturn() {
    console.log(products);
    var finger = $("#fingerReturn").val();
    $.ajax({
      type: "POST",
      //url: "http://localhost:8888/proyectos/WiediiShop-Back/public/user/login",
      //url: "http://localhost/proyectos/WiediiShop-Back/public/purchase/validateReturn",
      url: "http://localhost/proyectos/WiediiShop-Back/public/user/login",
      data: { "finger": finger, "product": products.pop()['idProducts'] },
      dataType: "json",
      success: function (response) {
        dataUser = response.result;
        if (dataUser != null) {
          storeData(dataUser, 'user');
          $.each(dataUser, function (index, element) {
            $("#userReturn").val(element.name);
            $("#fingerReturn").blur();
            $("#returns").hide();
            $("#survey").show();
            $("#goReturns").hide();
            $("#name").html("Bienvenido: " + element.name);
          });
        } else {
          $("#userReturn").val("");
        }
      },
      error: function () {
        alert("Ocurrió un error inesperado.");
      }
    });
  }

  //boton salir de devoluciones
  $("#logoutReturn").on("click", logoutReturn);

  function logoutReturn() {
    $.ajax({
      type: "POST",
      //url: "http://localhost:8888/proyectos/WiediiShop-Back/public/user/logout",
      url: "http://localhost/proyectos/WiediiShop-Back/public/user/logout",
      dataType: "json",
      success: function (response) {
        $("#fingerReturn").blur();
        $("#fingerInit").val("");
        $("#barcodeReturn").val("").toggleClass('validate valid validate');
        $("#productReturn").val("");
        $("#userReturn").val("");
        $("#fingerReturn").val("");
        $("#name").html("");
        $("#fingerReturn").prop("disabled", true);
        $("#barcodeReturn").prop("disabled", false);
        $("#purchase").hide();
        $("#returns").hide();
        $("#login").show();
        $("#fingerInit").focus();


        $("#goReturns").show();
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

  // <!-- :::::::::::::::::::: SCRIPTS Survey :::::::::::::::::::: -->

  //boton salir de encuesta
  $("#logoutSurvey").on("click", logoutReturn);

  //ir a devoluciones
  $("#confirmSurvey").on("click", confirmSurvey);

  function confirmSurvey() {

    var radioSelected = $(".surveyRadio:checked").val();

  }

  // <!-- :::::::::::::::::::: SCRIPTS END Survey :::::::::::::::::::: -->
})(jQuery);
