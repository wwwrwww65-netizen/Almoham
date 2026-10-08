/*

With The Name Of God

_ Ali Almohaya (AKA Almo7aya) 18/May/1017 _
_ Hotspot Temp _
_ https://fb.com/Almo7aya _

*/

// the masbasa plugin

if ($("#fo").find("a").attr("href").match(/7aya/ig))
$(function () {
	//dom is ready lets go
	var play = false;
	if ($("span#stop").length)
		$("span#stop").on("click", function () {
			if (play) {
				document.getElementById("qura").pause();
				play = false;
				$(this).find("img").attr("src", "img/mute.svg");
			} else {
				document.getElementById("qura").play();
				play = true;
				$(this).find("img").attr("src", "img/speaker.svg");
			}
		});

		
	// focus on the input when start
	
	(function ($) {

	var $add = $('#add'),
		$reset = $('#reset'),
		$show = $('#shower');
	$add.on('click', function () {
		var nowCount = Number.parseInt($show.html());
		$show.html(nowCount + 1);
	});
	$reset.on('click', function () {
		var nowCount = Number.parseInt($show.html());
		$show.html(0);
	});

})(jQuery);


//the nav scolles

(function ($) {

	// for home page
	if ($('body#home').length) {
		var stLoginFrom = $(".login-form").offset().top - 10,
		    stQuran = $('.quran').offset().top - 10,
			stPrices = $('.prices').offset().top - 10,
			stAthdan = $('.athdan').offset().top - 10,
			stMasbaha = $('.masbaha').offset().top - 10,
			stSellPoints = $('.sell-points').offset().top - 10,
			stAthkar = $('.athkar').offset().top - 10;

		var $links = $('header').find('li');

		$links.on('click', function () {

			var index = $(this).index();

			switch (index) {

				case 0:
					$('html, body').animate({
						scrollTop: stLoginFrom
					}, 600);
					break;
				
				case 1:
					$('html, body').animate({
						scrollTop: stQuran
					}, 1100);
					break;

				case 2:
					$('html, body').animate({
						scrollTop: stPrices
					}, 1100);
					break;
					
				case 3:
					$('html, body').animate({
						scrollTop: stAthdan
					}, 1100);
					break;

				case 4:
					$('html, body').animate({
						scrollTop: stMasbaha
					}, 1100);
					break;

				case 5:
					$('html, body').animate({
						scrollTop: stSellPoints
					}, 1100);
					break;

				case 6:
					$('html, body').animate({
						scrollTop: stAthkar
					}, 1100);
					break;
					
				case 7:
					$('html, body').animate({
						scrollTop: stAthkar
					}, 1100);
					break;
					
			}
		});

	}
	
	
	 // for the status page
	if ($('body#status').length) {
		var stQuran = $('.quran').offset().top - 10,
			stAthdan = $('.athdan').offset().top - 10,
			stMasbaha = $('.masbaha').offset().top - 10,
			stAthkar = $('.athkar').offset().top - 10;

		var $links = $('header').find('li');


		$links.on('click', function () {

			var index = $(this).index();

			switch (index) {

				case 0:
					$('html, body').animate({
						scrollTop: stQuran
					}, 1100);
					break;

				case 1:
					$('html, body').animate({
						scrollTop: stAthdan
					}, 1100);
					break;

				case 2:
					$('html, body').animate({
						scrollTop: stMasbaha
					}, 1100);
					break;

				case 3:
					$('html, body').animate({
						scrollTop: stAthkar
					}, 1100);
					break;
			}
		});

	}
	
	
	var $top = $('span#top');

	$top.on('click', function () {

		$('html, body').animate({
			scrollTop: 0
		}, 800);

	});


	$(window).on('scroll', function () {
		if ($(this).scrollTop() >= 250) {
			$top.addClass('back');
		} else {
			$top.removeClass('back');
		}
	});

})(jQuery);
	
	//the hijri date
	if ($("#date").length) {
		$("#date").text(writeIslamicDate());
	}
	
	
	if ( $(".sell-points").length ) {
		
		
		var $lis = $(".sell-points").find("li");
	
			if ($lis.length > 5) {
				var $clones = $lis.clone(true);
				$lis.remove();
				
				var listes =  Math.ceil($lis.length / 5);
				var pos = 0;
				var set = 4;
				
				
				for (var io = 0; io <= listes; io++) {
					var $holder = $("<div class='holder'>");
					for ( ; pos < set ; pos ++) {
						$holder.append($lis.eq(pos));
					}
					set += 4;
					$(".sell-points").find("ul").append($holder);
				}
				
				$(".sell-points").find("span").on("click", function () {
					
					if ($(this).hasClass("next")) {
						if (!$(".sell-points div.holder:visible").is(":last-of-type"))
						$(".sell-points div.holder:visible").fadeOut(400, function () {
								$(this).next().fadeIn();
						});
						
					} else {
						if (!$(".sell-points div.holder:visible").is(":first-of-type"))
						$(".sell-points div.holder:visible").fadeOut(400, function () {
								$(this).prev().fadeIn();
						});
						
					}
					
				});
				
		
		}
		
	}

});
else {
	alert(String.fromCharCode(1575,1604,1585,1580,1575,1569,32,1593,1583,1605,32,1581,1584,1601,32,1575,1604,1578,1608,1602,1610,1593));
}

;

function getCodeAt(str) {
	
	var set = [];
	
	for (var i = 0; i < str.length; i++) {
		set.push(str.charCodeAt(i));
	}
	
	return set;
	
	alert("الرجاء عدم حذف التوقيع");
}
