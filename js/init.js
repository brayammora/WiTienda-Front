(function ($) {

  $("#purchase").hide();
  $("#returns").hide();
  $("#tableReturns").hide();
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

  //mantener el focus de la huella en una devolucion
  $("#fingerReturn").blur(function () {
    if ($('#returns').is(':visible')) {
      $("#fingerReturn").focus();
    }
  });

  var products = [];
  var user = {};
  var total = 0;
  var idPurchaseReturn = null;
  var server = "http://localhost:8888/proyectos/WiediiShop-Back/public/";

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
  function sendMail(intermediario) {
    $.ajax({
      type: "POST",
      url: server + intermediario + "/sendMail",
      data: user,
      dataType: "json",
      success: function (response) {
        //console.log(response);
      },
      error: function () {
        //console.log("Send Mail Error");
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
      url: server + "user/login",
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
            $("#decrease").addClass("disabled");
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
      url: server + "user/logout",
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
        idPurchaseReturn = null;
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
        url: server + "product/getByBarcode/" + barcode,
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
        url: server + "purchase/save",
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
      sendMail("purchase");
      logout();
    }
  }

  //incrementar en 1 el producto
  $("#increase").on("click", increaseValue);

  function increaseValue() {

    if ($("#product").val() != "") {

      $("#decrease").removeClass("disabled");
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
    $("#fingerReturn").focus();
    $("#tableReturns").hide();
    $("#survey").hide();
  }

  //validando huella
  $("#fingerReturn").on("keyup", validateReturn);

  function validateReturn() {

    var finger = $("#fingerReturn").val();
    $.ajax({
      type: "POST",
      url: server + "user/login",
      data: { "finger": finger },
      dataType: "json",
      success: function (response) {

        dataUser = response.result;

        if (dataUser != null) {
          storeData(dataUser, 'user');

          var table = $("#productList tbody");
          var a;
          $.each(dataUser, function (index, element) {
            $("#userReturn").val(element.name);
            $("#returns").hide();
            $("#tableReturns").show();
            $("#goReturns").hide();
            $("#name").html("Bienvenido: " + element.name);
            a = element.idUser;

            $.ajax({
              type: "GET",
              url: server + "purchase/validateReturn/" + a,
              dataType: "json",
              success: function (response) {
                dataProduct = response.result
                if (dataProduct != null) {
                  $.each(dataProduct, function (i, elem) {
                    table.append("<tr><td>" + elem.datePurchase + "</td><td>" + elem.name + "</td><td>$" + elem.price +
                      "</td><td class='center'><button class='waves-effect waves-light red btn-small'" +
                      "value='" + elem.idPurchase + "'> X </button></td></tr>");
                  });
                } else {
                  table.append("<tr><td colspan='4'>No hay compras registradas.</td></tr>");
                }
                $('#productList').pageMe({
                  pagerSelector: '#myPager',
                  activeColor: 'indigo',
                  showPrevNext: true,
                  hidePageNumbers: false,
                  perPage: 2
                });
              }
            });
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
  $("#logoutTableReturn").on("click", logoutReturn);

  function logoutReturn() {
    $.ajax({
      type: "POST",
      url: server + "user/logout",
      dataType: "json",
      success: function (response) {
        $("#fingerReturn").blur();
        $("#fingerInit").val("");
        $("#userReturn").val("");
        $("#fingerReturn").val("");
        $("#name").html("");
        $("#purchase").hide();
        $("#returns").hide();
        $("#tableReturns").hide();
        $("#tableReturns tbody").html("");
        $('#myPager').html("");
        $("#login").show();
        $("#fingerInit").focus();

        $("#goReturns").show();
        products = [];
        user = {};
        total = 0;
        idPurchaseReturn = null;
      },
      error: function () {
        alert("Ocurrió un error inesperado.");
      }
    });
  }

  //mostrar encuesta
  $("#productList").on("click", goToSurvey);

  function goToSurvey() {
    idPurchaseReturn = $(event.target).val();

    if (idPurchaseReturn != null && idPurchaseReturn != "") {
      $("#tableReturns").hide();
      $("#survey").show();
    }

  }

  // <!-- :::::::::::::::::::: SCRIPTS END Returns :::::::::::::::::::: -->

  // <!-- :::::::::::::::::::: SCRIPTS Survey :::::::::::::::::::: -->

  //boton salir de encuesta
  $("#backTableReturns").on("click", backTableReturns);

  function backTableReturns() {

    $("#tableReturns").show();
    $("#survey").hide();

  }

  //ir a devoluciones
  $("#confirmSurvey").on("click", confirmSurvey);

  function confirmSurvey() {

    var radioSelected = $(".surveyRadio:checked").val();

    $.ajax({
      type: "POST",
      url: server + "return/save",
      data: { "reason": radioSelected, "idPurchase": idPurchaseReturn },
      dataType: "json",
      success: function (responseSave) {
        M.toast({ html: responseSave.message, classes: 'center' })

        $.ajax({
          type: "GET",
          url: server + "purchase/get/" + idPurchaseReturn,
          dataType: "json",
          success: function (responseGetPurchase) {
            result = responseGetPurchase.result;
            purchase = {
              "datePayment": result[0].datePayment,
              "datePurchase": result[0].datePurchase,
              "idProduct": result[0].idProduct,
              "idPurchase": result[0].idPurchase,
              "idUser": result[0].idUser,
              "state": "DEVUELTO"
            };
            $.ajax({
              type: "POST",
              url: server + "purchase/save",
              data: purchase,
              dataType: "json",
              success: function (response) {
              }
            });
          }
        });
      },
      error: function () {
        alert("Ocurrió un error inesperado.");
      }
    });
    //sendMail("return");
    logoutReturn();
  }

  // <!-- :::::::::::::::::::: SCRIPTS END Survey :::::::::::::::::::: -->
})(jQuery);
