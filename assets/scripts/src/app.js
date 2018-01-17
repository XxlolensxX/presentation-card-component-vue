(function(window, document, $){
	"use strict";
	var DEBUG = true;
	var $window = $(window),
	$document = $(document),
	$body = $('body'),
	$mainNav, $mainHeader;

	/// guardo los media queries
	var TABLETS_DOWN = 'screen and (max-width: 64em)',
	VERTICAL_TABLETS_DOWN = 'screen and (max-width: 50em)',
	VERTICAL_TABLETS_UP = 'screen and (min-width: 50em)',
	PHABLETS_DOWN = 'screen and (max-width: 40em)';

	var actualposition = function(){
		return window.pageYOffset || document.documentElement.scrollTop;
	};

	var throttle = function( fn ){
		return setTimeout(fn, 1);
	};

	var mqMap = function( mq ){
		var MQ = '';

		switch( mq ){
			case 'tablet-down' :
			MQ = TABLETS_DOWN;
			break;
			case 'vertical-tablet-down' :
			MQ = VERTICAL_TABLETS_DOWN;
			break;
			case 'phablet-down' :
			MQ = PHABLETS_DOWN;
			break;
		}

		return MQ;
	};

	var normalize = (function() {
		var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
		to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
		mapping = {};

		for(var i = 0, j = from.length; i < j; i++ )
		mapping[ from.charAt( i ) ] = to.charAt( i );

		return function( str ) {
			var ret = [];
			for( var i = 0, j = str.length; i < j; i++ ) {
				var c = str.charAt( i );
				if( mapping.hasOwnProperty( str.charAt( i ) ) )
				ret.push( mapping[ c ] );
				else
				ret.push( c );
			}
			return ret.join( '' );
		};
	})();

	//TODO: watch
	// String.prototype.capitalize = function() {
	// 	return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
	// }

	//APP	
	var App = function(){
		this.path = $('body').attr("data-path");
        this.ajaxURL = '/wp-admin/admin-ajax.php';
        this.loadLegacyAssets();

        var app = this;
	};

	App.prototype = {
		//TODO:
		//Starting settings
		onReady : function(){
			this.setGlobals();
            this.autoHandleEvents( $('[data-func]') );
            this.handleMobileTables();
            this.initTextCounter();
            this.initAreaResizer();
			this.conditionalInits();
			
			this.initCleanSpace();
			this.initValidFile();
		},
		onLoad : function(){},
		loadLegacyAssets : function(){
            // voy a asumir que cualquier browser que no soporte <canvas> es un oldIE (IE8-)
            if( Modernizr.canvas ){ return false; }
            Modernizr.load({
                load : this.path + 'scripts/support/selectivizr.min.js'
            });
        },
		autoHandleEvents : function( $elements ){
			if( !$elements || !$elements.length ){ return false; }
			var self = this;
			$elements.each(function(i,el){
				var func = el.getAttribute('data-func') || false,
				evts = el.getAttribute('data-events') || 'click.customStuff';
				if( func && typeof( self[func] ) === 'function' ){
					$(el)
					.off(evts)
					.on(evts, $.proxy(self[func], self));
				}
			});
		},
		conditionalInits : function( $context ){
			if( !$context ){
				$context = $document;
			}
			// delegaciones directas
			if( $context.find('[data-func]').length ){
				this.autoHandleEvents( $context.find('[data-func]') );
			}

			if( $('[data-func="stickyheader"]').length ){
                this.stickyheader( $('[data-func="stickyheader"]') );
			}

			if( $('[data-role="videothumb"]').length ){
                this.videohide( $('[data-role="videothumb"]') );
			}
			
			this.singleMenu();
		},

		setGlobals : function(){
            $body = $('body');
		},
		
        debug : function( message ){
            DEBUG && console.log( message );
        },

		//FUNC:

		//<START
		// CIPER especiales
		singleMenu : function(event){
			//arma el menu side en el single
			$('.single__content h2').each(function( index ) {
				$( this ).attr('id', "h2_"+index);
				var texto = $( this ).text()
				var html ='<li class="sidebar__item"><a href="#h2_' + index +'" title="Ir a '+ texto.capitalize() +'" data-func="scrollToTarget" data-offset="40">'+ texto.capitalize() +'</a></li>';
				$('.sidebar__indice').append(html)
			});
		},

		filtrar_inicial : function(event){
			var $selctor = $(event.currentTarget);
			var inicial = $selctor.text();
			$selctor.siblings().removeClass("alphabet__item--current");
			$selctor.addClass("alphabet__item--current");
			$('[data-search]').val("")
			$('.simple-row--top article').hide();
			$('.simple-row--top article[data-inicial="'+inicial+'"]').show();
		},

		buscar_inicial : function(event){
			event.preventDefault();
			var s = $('[data-search]').val();
			if(s==""){
				$('.simple-row--top article').hide();
				$('.simple-row--top article[data-inicial="A"]').show();
				return;
			}

			s = s.toLowerCase();

			s  = 	s.replace(new RegExp(/\s/g),"");
			s  = 	s.replace(new RegExp(/[àáâãäå]/g),"a");
			s  = 	s.replace(new RegExp(/æ/g),"ae");
			s  = 	s.replace(new RegExp(/ç/g),"c");
			s  = 	s.replace(new RegExp(/[èéêë]/g),"e");
			s  = 	s.replace(new RegExp(/[ìíîï]/g),"i");
			s  = 	s.replace(new RegExp(/ñ/g),"n");
			s  = 	s.replace(new RegExp(/[òóôõö]/g),"o");
			s  = 	s.replace(new RegExp(/œ/g),"oe");
			s  = 	s.replace(new RegExp(/[ùúûü]/g),"u");
			s  = 	s.replace(new RegExp(/[ýÿ]/g),"y");
			s  = 	s.replace(new RegExp(/\W/g),"");

			s = s.toLowerCase().replace(/\b[a-z]/g, function(letter) {
				return letter.toUpperCase();
			});
			$('.simple-row--top article').hide();
			$(".simple-row--top article[data-fullname*='"+s+"']").show();
		},
		//END>

		moveElements : function( $set, type ){
            var areaType = 'data-' + type +'-area',
                groups = $set.groupByAtt( areaType );

            groups.forEach(function( $group ){
                var $target = $('[data-area-name="'+ $group.first().attr( areaType ) +'"]');

                $group.sort(function(a, b){
                    return $(a).data('order') - $(b).data('order');
                });

                $group.appendTo( $target );
            });
        },

		mapSectionsPositions : function( $items ){
            var map = [];
            $items.each(function( index, el ){
                var $el = $(el),
                    $target = $( $el.attr('href') ),
                    targetOffset = $target.offset();

                targetOffset.bottom = targetOffset.top + $target.height();

                map.push({
                    $item : $el,
                    offset : targetOffset,
                    selector : $el.attr('href')
                });
            });

            return map;
        },

        setFixedHeader : function(){
            if( Modernizr.mq(VERTICAL_TABLETS_DOWN) ){
                var headerHeight = document.querySelector('#main-header').offsetHeight;
                document.body.style.marginTop = headerHeight + 14 + 'px';
            }
            else {
                document.body.style.marginTop = 0;
            }
        },

        blockScroll : function( event ){
            event.stopPropagation();
        },

		//GENERAL

		handleMobileTables : function(){
            $('.regular-content-area table').each(function(i, table){
                $(table).wrap('<div class="regular-content-table-holder"></div>');
            });
		},

		scrollNavigation : function( $nav ){
            var app = this,
                $navItems = $nav.children(),
                locationsMap = this.mapSectionsPositions( $navItems );

            $window.on('resize.ScrollNav', function(){
                locationsMap = app.mapSectionsPositions( $navItems );
            });

            $window.on('scroll.ScrollNav', function(){
                var scrollPosition = $window.scrollTop();

                locationsMap.forEach(function( item_info ){
                    if( scrollPosition > (item_info.offset.top - 100) ){
                        $navItems.removeClass('active');
                        item_info.$item.addClass('active');
                    }
                });
            });
		},

		scrollToTarget : function( event ){
            event.preventDefault();
            event.stopPropagation();
            var targetPos = $( event.currentTarget.getAttribute('href') ).offset().top,
                offset = parseInt( event.currentTarget.getAttribute('data-offset') ),
                $parent = $(event.currentTarget).parent();

			console.log('gototarget');
            if( offset ){
                targetPos = targetPos - offset;
                //added
                // $parent.siblings().removeClass('sidebar__item--current');
                // $parent.addClass('sidebar__item--current');
            }

            $('html, body').animate({ scrollTop : targetPos }, 500);
		},
		
        getShareCount : function( $elements ){
            // se setea el api de google plus primero
            // api key publico
            // if( typeof gapi !== 'undefined' ){
            //     gapi.client.setApiKey('AIzaSyCKSbrvQasunBoV16zDH9R33D88CeLr9gQ');
            // }

            $elements.each(function(index, element){
                var type = element.getAttribute('data-type'),
                    url = element.getAttribute('data-url'),
                    jsonUrl = '',
                    data = {};

                var params = {
                    nolog: true,
                    id: url,
                    source: "widget",
                    userId: "@viewer",
                    groupId: "@self"
                };

                if( type === 'facebook' ){
                    jsonUrl = 'http://graph.facebook.com/';
                    data.id = url;
                }
                else if( type === 'twitter' ){
                    // Url obsoleta.
                    //jsonUrl = 'http://urls.api.twitter.com/1/urls/count.json';
                    //data.url = url;
                    return;
                }
                else if( type === 'linkedin' ){
                    jsonUrl = 'http://www.linkedin.com/countserv/count/share';
                    data.format = 'jsonp';
                    data.url = url;
                }
                else {
                    // gapi.client.rpcRequest('pos.plusones.get', 'v1', params).execute(function(resp) {
                    //     console.log('count:', resp.result.metadata.globalCounts.count);
                    // });
                }

                $.ajax({
                    method : 'GET',
                    url : jsonUrl,
                    data : data,
                    dataType : 'jsonp'
                }).then(function( response ){
                    var count = '';

                    // se saca el valor de cada red segun lo que responda el API correspondiente
                    if( type === 'facebook' ){ count = response.shares; }
                    else if( type === 'twitter' ){ count = response.count; }
                    else if( type === 'linkedin' ){ count = response.count; }
                    else {
                        // google
                    }


                    // prevencion de error en caso de false o undefined
                    count = count ? count : 0;
                    element.textContent = count;
                });
            });
		},
		
		calendarControl : function( event ){
			event.preventDefault();

			var app = this;

			var $btn = $(event.currentTarget),
			$dataHolder = $btn.parents('[data-role="calendar-data"]'),
			$itemsHolder = $('[data-events-holder]'),
			$monthName = $('[data-role="calendar-month"]'),
			direction = $btn.data('direction'),
			month = $dataHolder.data('month'),
			year = $dataHolder.data('year'),
			filter = $dataHolder.data('filter');

			if( app.isLoading ){
				return;
			}

			app.isLoading = true;

			/// se debe indicar que se esta cargando, asumo estados estandar
			/// eso queire decir, opacity nomas
			$monthName.css('opacity', '0.2');
			$itemsHolder.css('opacity', '0.2');

			$.getJSON('/wp-json/st-rest/actividades', {
				direction : direction,
				month : month,
				year : year,
				filter : filter
			}).then(function( response ){
				$dataHolder.data('month', response.month_num);
				$dataHolder.data('year', response.year);

				$monthName
				.text( response.month_name + ' - ' +  response.year)
				.attr({
					'data-prev' : response.prev,
					'data-next' : response.next
				});

				$itemsHolder.html( response.items );

				$monthName.css('opacity', '1');
				$itemsHolder.css('opacity', '1');

				app.isLoading = false;
			});
		},

		deployTarget : function( event ){
			event.preventDefault();

			var $item = $(event.currentTarget),
			target = $item.data('target'),
			$targetElem;

			if( !target ){
				console.warn('No se especificó un objetivo en el atributo "data-target":', target );
				return;
			}

			$targetElem = $(target);
			if( !$targetElem.length ){
				console.warn('El objetivo no fue encontrado o el atributo "data-target" no es un selector válido :', target );
				return;
			}

			$item.data('animating', true);

			if( $item.data('deployed') ){
				$targetElem
				.slideUp().promise()
				.then(function(){
					$item.data({
						deployed : false,
						animating : false
					}).removeClass('deployed');

					$targetElem.removeClass('deployed');
				});
			}
			else {
				$targetElem
				.slideDown().promise()
				.then(function(){
					$item.data({
						deployed : true,
						animating : false
					}).addClass('deployed');

					$targetElem.addClass('deployed');
				});
			}
		},

		deployMainNav : function( event ){
			event.preventDefault();

			var $btn = $(event.currentTarget),
			$nav = $('[data-role="nav-container"]'),
			$headerBody = $('[data-role="header-body"]');

			if( $btn.data('deployed') ) {
				$btn
				.data('deployed', false)
				.removeClass('deployed');

				$nav.removeClass('deployed');
				$headerBody.removeClass('deployed');
			}
			else {
				$btn
				.data('deployed', true)
				.addClass('deployed');

				$nav.addClass('deployed');
				$headerBody.addClass('deployed');
			}
		},

		deployCollapsable : function( event ) {
			event.preventDefault();

			var $item = $(event.currentTarget),
			$targetElem = $item.parents('.collapsable').find('.collapsable-body');

			$item.data('animating', true);

			if( $item.data('deployed') ){
				$targetElem
				.slideUp().promise()
				.then(function(){
					$item.data({
						deployed : false,
						animating : false
					}).removeClass('deployed');

					$targetElem.removeClass('deployed');
				});
			}
			else {
				$targetElem
				.slideDown().promise()
				.then(function(){
					$item.data({
						deployed : true,
						animating : false
					}).addClass('deployed');

					$targetElem.addClass('deployed');
				});
			}
		},

		toggleTarget : function( event ){
            event.preventDefault();

            $( event.currentTarget.getAttribute('data-target') ).toggleClass('deployed');

            // expansion para cuando quiero enfocar algo despues de mostrarlo
            if( event.currentTarget.getAttribute('data-focus') ){
                $( event.currentTarget.getAttribute('data-focus') ).focus();
            }
        },

        tabControl : function( event ){
            event.preventDefault();

            var $button = $(event.currentTarget),
                $target = $('[data-tab-name="'+ $button.data('target') +'"]');

            $button.siblings().removeClass('active');
            $target.siblings().removeClass('active');

            throttle(function(){
                $button.addClass('active');
                $target.addClass('active');
            });
        },

        deployParent : function( event ){
            event.preventDefault();
            $(event.currentTarget).parents( event.currentTarget.getAttribute('data-parent') ).toggleClass('deployed');
        },

        showTab : function( event ){
            event.preventDefault();
            var $item = $(event.currentTarget);

            $('[data-tabname="'+ $item.data('target') +'"]').addClass('active').siblings().removeClass('active');
            $item.addClass('active').siblings().removeClass('active');
		},
		
		deployMobileSearch : function( event ){
            event.preventDefault();

            var $button = $(event.currentTarget),
                $searchBox = $('#mobile-search-holder');

            $button.toggleClass('deployed');
            $searchBox.toggleClass('deployed');
		},

		printPage : function( event ){
            event.preventDefault();
            window.print();
		},

		goToTop : function( event ){
            event.preventDefault();
            $('html, body').animate({scrollTop : 0},800);
		},


		//HELPERS

		stickyheader : function($element){
			var $navBar = $element,
				$top = $navBar.data('offset');
			
			$window.scroll(function () {
				var scroll = actualposition();
				if (scroll >= $top) {
					$navBar.addClass('sticker');
				} else {
					$navBar.removeClass('sticker');
				}
			});
		},

		videohide : function($element){
			var $video = $element,
				$hiddenvideos = $('[data-role="videothumb"]:hidden'),
				$container = $('[data-module="videohide"]'), 
				$showatstart = $container.data('qant'),
				$btnhide = $('[data-role="hidevideos"]'),
				$btnshow = $('[data-role="loadvideos"]'),
				$total = $video.length;

			$video.slice(0, $showatstart).show();
			$('[data-role="hidevideos"]').hide();
			
			$btnshow.click( function(e){
				e.preventDefault();
				$hiddenvideos.show('slow');
				$(this).hide();
				$btnhide.show();
			});

			$btnhide.click( function(e){
				e.preventDefault();
				$video.slice($showatstart, $total).hide('slow');
				$(this).hide();
				$btnshow.show();
			});
		},
		
		//SELF INIT

		//data-role="textcounter"
		//data-role="countdown"
		initTextCounter : function(){
			$('[data-textcounter]').keyup(function(e){
				var $textarea = $(this),
					maxlength = parseInt($textarea.attr('maxlength')),
					valuelength = $textarea.val().length,
					countdown = $textarea.parent().find('[data-role="countdown"]');
	
				e.preventDefault();
				countdown.text(maxlength - valuelength);

			});
		},

		initAreaResizer : function(){
			jQuery.each(jQuery('textarea[data-autoresize]'), function() {
				var offset = this.offsetHeight - this.clientHeight;
				var resizeTextarea = function(el) {
					jQuery(el).css('height', 'auto').css('height', el.scrollHeight + offset);
				};
				jQuery(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
			});
		},


		initCleanSpace : function(){
			$('[data-cleanspace]').on({
				keydown: function(e) {
					if (e.which === 32) return false;
				},
				change: function() {
					this.value = this.value.replace(/\s/g, "");
				}
			});
		},

		initValidFile: function(){
			$('[data-validfile]').change(function(e){
				var $input = $(this),
					filename = $(this).val(),
					$father = $input.parents('.form-control').find('.form-control--file'),
					$mother = $input.parents('.form-control'),
					maxsize = $input.data('max-size'),
					filesize = $input.get(0).files[0].size,
					$okmessage = $mother.find('.form-control__text').text(),
					$errormessage = $mother.data('error-message');

				e.preventDefault();
				console.log('filesize: ' + filesize);
				console.log('okmessage: ' + $okmessage);
				//define el limite de tamaño
				if(maxsize){
					maxsize = maxsize;
					console.log('limit defined:' + maxsize);
				}else{
					maxsize = 100000 //100mb
					console.log('limit undefined:' + maxsize);
				}

				if(filesize>maxsize){
					console.log('too heavy');
					$mother.find('.form-control__text').html($errormessage);
					return false;
				}else{
					console.log('just right');
					$mother.find('.form-control__text').hide();
					if (filename.substring(3,11) == 'fakepath') {
						filename = filename.substring(12);
					}
					if(!filename){
						filename = $father.find('.content__btn--file__desc').text();
					}
					$father.find('.content__btn--file__desc').html(filename);
					return true;
				}
			});
		},

		copyClipboard : function( event ){
            event.preventDefault();

            var $button = $(event.currentTarget),
                $target = $('[data-target-name="'+ $button.data('target') +'"]'),
                $value = $target.val(),
                $textArea = document.createElement("textarea"),
                $okbtn = $('.copyboard-status'),
                $isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

            $textArea.value = $value;
            document.body.appendChild($textArea);

            if($isiOSDevice){
                var editable = $textArea.contentEditable;
                var readOnly = $textArea.readOnly;

                $textArea.contentEditable = true;
                $textArea.readOnly = false;

                var range = document.createRange();
                range.selectNodeContents($textArea);

                var selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);

                $textArea.setSelectionRange(0, 999999);
                $textArea.contentEditable = editable;
                $textArea.readOnly = readOnly;
            }else{
                $textArea.select();
            }

            if(document.execCommand('copy')){
                $okbtn.fadeIn(1500).addClass('ok');
                setTimeout(function () {
                    $okbtn.fadeOut('slow').addClass('ok');
                }, 1500);
            }else{
                $okbtn.fadeIn(1500).addClass('error');
                setTimeout(function () {
                    $okbtn.fadeOut('slow').removeClass('error');
                }, 1500);
            }

            document.body.removeChild($textArea);
            console.log('copied');
        },
		
		goToTop : function( event ){
            event.preventDefault();
            $('html, body').animate({scrollTop : 0},800);
        },
	};

	var app = new App();
	$document.ready(function(){ app.onReady && app.onReady(); });
	$window.on({'load' : function(){ app.onLoad && app.onLoad(); }
});

}(window, document, jQuery));