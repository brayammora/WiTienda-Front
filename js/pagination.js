
$.fn.pageMe = function (opts) {
  var $this = this,
    defaults = {
      activeColor: 'blue',
      perPage: 10,
      showPrevNext: false,
      nextText: '',
      prevText: '',
      hidePageNumbers: false
    },
    settings = $.extend(defaults, opts);

  //$this.addClass('initialized');

  var listElement = $this.find("tbody");
  var perPage = settings.perPage;
  var children = listElement.children();
  var pager = $('.pager');

  if (typeof settings.childSelector != "undefined") {
    children = listElement.find(settings.childSelector);
  }

  if (typeof settings.pagerSelector != "undefined") {
    pager = $(settings.pagerSelector);
  }

  var numItems = children.length < 1 ? 1 : children.length ;
  var numPages = Math.ceil(numItems / perPage);

  $("#total_reg").html(numItems + " Entradas");

  pager.data("curr", 0);

  if (settings.showPrevNext) {
    $('<li><a href="#" class="btn-floating btn-small waves-effect indigo darken-1 prev_link" style="color:white;">' + 
    '< </a></li>').appendTo(pager);
  }

  var curr = 0;
  while (numPages > curr && (settings.hidePageNumbers == false)) {
    $('<li class="waves-effect"><a href="#" class="page_link">' + (curr + 1) + '</a></li>').appendTo(pager);
    curr++;
  }

  if (settings.showPrevNext) {
    $('<li><a href="#" class="btn-floating btn-small waves-effect indigo darken-1 next_link" style="color:white;">' +
    '> </a></li>').appendTo(pager);
  }

  pager.find('.page_link:first').addClass('active');
  pager.find('.prev_link').addClass("disabled");
  if (numPages <= 1) {
    pager.find('.next_link').addClass("disabled");
  }
  pager.children().eq(1).addClass("active " + settings.activeColor);

  children.hide();
  children.slice(0, perPage).show();

  pager.find('li .page_link').click(function () {
    var clickedPage = $(this).html().valueOf() - 1;
    goTo(clickedPage, perPage);
    return false;
  });
  pager.find('li .prev_link').click(function () {
    previous();
    return false;
  });
  pager.find('li .next_link').click(function () {
    next();
    return false;
  });

  function previous() {
    var goToPage = parseInt(pager.data("curr")) - 1;
    goTo(goToPage);
  }

  function next() {
    goToPage = parseInt(pager.data("curr")) + 1;
    goTo(goToPage);
  }

  function goTo(page) {
    var startAt = page * perPage,
      endOn = startAt + perPage;

    children.css('display', 'none').slice(startAt, endOn).show();

    if (page >= 1) {
      pager.find('.prev_link').removeClass("disabled");
    }
    else {
      pager.find('.prev_link').addClass("disabled");
    }

    if (page < (numPages - 1)) {
      pager.find('.next_link').removeClass("disabled");
    }
    else {
      pager.find('.next_link').addClass("disabled");
    }

    pager.data("curr", page);
    pager.children().removeClass("active " + settings.activeColor);
    pager.children().eq(page + 1).addClass("active " + settings.activeColor);

  }
};