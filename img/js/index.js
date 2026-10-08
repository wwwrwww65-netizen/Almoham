/*
  AL_HADATH.NET Hotspot Scripts
*/

$(function () {
  // Masbaha counter plugin
  (function ($) {
    var $add = $('#add'),
        $reset = $('#reset'),
        $show = $('#shower');
    if ($add.length && $show.length) {
      $add.on('click', function () {
        var nowCount = Number.parseInt($show.html()) || 0;
        $show.html(nowCount + 1);
      });
    }
    if ($reset.length && $show.length) {
      $reset.on('click', function () {
        $show.html(0);
      });
    }
  })(jQuery);

  // Nav scrolls
  (function ($) {
    var getTop = function (sel) {
      var $el = $(sel);
      return $el.length && $el.offset() ? $el.offset().top - 10 : 0;
    };

    if ($('body#home').length) {
      var $links = $('header').find('li');
      $links.on('click', function () {
        var index = $(this).index();
        var targetTop = 0;
        switch (index) {
          case 0: targetTop = getTop('.login-card-container, .login-form'); break;
          case 1: targetTop = getTop('.prices-section, .prices'); break;
          case 2: targetTop = getTop('.sell-section, .sell-points'); break;
          case 3: targetTop = getTop('.services-section, .athkar'); break;
          default: targetTop = 0; break;
        }
        if (targetTop > 0) {
          $('html, body').animate({ scrollTop: targetTop }, 700);
        }
      });
    }

    var $top = $('span#top');
    if ($top.length) {
      $top.on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 600);
      });

      $(window).on('scroll', function () {
        if ($(this).scrollTop() >= 250) {
          $top.addClass('back');
        } else {
          $top.removeClass('back');
        }
      });
    }
  })(jQuery);

  // Hijri date
  if ($("#date").length && typeof writeIslamicDate === 'function') {
    try {
      $("#date").text(writeIslamicDate());
    } catch(e) {}
  }
});
