/*!
 * Minified Utility Resources
 * Theme Core resources.
 */

;
(function ($) {
    var defaults = {
        width            : 400,
        height           : "65%",
        minimizedWidth   : 200,
        gutter           : 10,
        poppedOutDistance: "6%",
        title            : function () {
            return "";
        },
        dialogClass      : "",
        buttons          : [], /* id, html, buttonClass, click */
        animationSpeed   : 400,
        opacity          : 1,
        initialState     : 'modal', /* "modal", "docked", "minimized" */

        showClose   : true,
        showPopout  : true,
        showMinimize: true,

        create        : undefined,
        open          : undefined,
        beforeClose   : undefined,
        close         : undefined,
        beforeMinimize: undefined,
        minimize      : undefined,
        beforeRestore : undefined,
        restore       : undefined,
        beforePopout  : undefined,
        popout        : undefined
    };
    var dClass = "dockmodal";
    var windowWidth = $(window).width();

    function setAnimationCSS($this, $el) {
        var aniSpeed = $this.options.animationSpeed / 1000;
        $el.css({ "transition": aniSpeed + "s right, " + aniSpeed + "s left, " + aniSpeed + "s top, " + aniSpeed + "s bottom, " + aniSpeed + "s height, " + aniSpeed + "s width" });
        return true;
    }

    function removeAnimationCSS($el) {
        $el.css({ "transition": "none" });
        return true;
    }

    var methods = {
        init         : function (options) {

            return this.each(function () {

                var $this = $(this);

                var data = $this.data('dockmodal');
                $this.options = $.extend({}, defaults, options);

                // Check to see if title is a returned function
                (function titleCheck() {
                    if (typeof $this.options.title == "function") {
                        $this.options.title = $this.options.title.call($this);
                    }
                })();

                // If the plugin hasn't been initialized yet
                if (!data) {
                    $this.data('dockmodal', $this);
                } else {
                    $("body").append($this.closest("." + dClass).show());
                    methods.refreshLayout();
                    setTimeout(function () {
                        methods.restore.apply($this);
                    }, $this.options.animationSpeed);
                    return;
                }

                // create modal
                var $body = $("body");
                var $window = $(window);
                var $dockModal = $('<div/>').addClass(dClass).addClass($this.options.dialogClass);
                if ($this.options.initialState == "modal") {
                    $dockModal.addClass("popped-out");
                } else if ($this.options.initialState == "minimized") {
                    $dockModal.addClass("minimized");
                }
                //$dockModal.width($this.options.width);
                $dockModal.height(0);
                setAnimationCSS($this, $dockModal);

                // create title
                var $dockHeader = $('<div></div>').addClass(dClass + "-header");

                if ($this.options.showClose) {
                    $('<a href="#" class="header-action action-close" title="Close"><i class="icon-dockmodal-close"></i></a>').appendTo($dockHeader).click(function (e) {
                        methods.destroy.apply($this);
                        return false;
                    });
                }
                if ($this.options.showPopout) {
                    $('<a href="#" class="header-action action-popout" title="Pop out"><i class="icon-dockmodal-popout"></i></a>').appendTo($dockHeader).click(function (e) {
                        if ($dockModal.hasClass("popped-out")) {
                            methods.restore.apply($this);
                        } else {
                            methods.popout.apply($this);
                        }
                        return false;
                    });
                }
                if ($this.options.showMinimize) {
                    $('<a href="#" class="header-action action-minimize" title="Minimize"><i class="icon-dockmodal-minimize"></i></a>').appendTo($dockHeader).click(function (e) {
                        if ($dockModal.hasClass("minimized")) {
                            if ($dockModal.hasClass("popped-out")) {
                                methods.popout.apply($this);
                            } else {
                                methods.restore.apply($this);
                            }
                        } else {
                            methods.minimize.apply($this);
                        }
                        return false;
                    });
                }
                if ($this.options.showMinimize && $this.options.showPopout) {
                    $dockHeader.click(function () {
                        if ($dockModal.hasClass("minimized")) {
                            if ($dockModal.hasClass("popped-out")) {
                                methods.popout.apply($this);
                            } else {
                                methods.restore.apply($this);
                            }
                        } else {
                            methods.minimize.apply($this);
                        }
                        return false;
                    });
                }

                $dockHeader.append('<div class="title-text">' + ($this.options.title || $this.attr("title")) + '</div>');
                $dockModal.append($dockHeader);

                // create body section
                var $placeholder = $('<div class="modal-placeholder"></div>').insertAfter($this);
                $this.placeholder = $placeholder;
                var $dockBody = $('<div></div>').addClass(dClass + "-body").append($this);
                $dockModal.append($dockBody);

                // create footer
                if ($this.options.buttons.length) {
                    var $dockFooter = $('<div></div>').addClass(dClass + "-footer");
                    var $dockFooterButtonset = $('<div></div>').addClass(dClass + "-footer-buttonset");
                    $dockFooter.append($dockFooterButtonset);
                    $.each($this.options.buttons, function (indx, el) {
                        var $btn = $('<a href="#" class="btn"></a>');
                        $btn.attr({
                            "id"   : el.id,
                            "class": el.buttonClass
                        });
                        $btn.html(el.html);
                        $btn.click(function (e) {
                            el.click(e, $this);
                            return false;
                        });
                        $dockFooterButtonset.append($btn);
                    });
                    $dockModal.append($dockFooter);
                } else {
                    $dockModal.addClass("no-footer");
                }

                // create overlay
                var $overlay = $("." + dClass + "-overlay");
                if (!$overlay.length) {
                    $overlay = $('<div/>').addClass(dClass + "-overlay");
                }

                // raise create event
                if ($.isFunction($this.options.create)) {
                    $this.options.create($this);
                }

                $body.append($dockModal);
                $dockModal.after($overlay);
                $dockBody.focus();

                // raise open event
                if ($.isFunction($this.options.open)) {
                    setTimeout(function () {
                        $this.options.open($this);
                    }, $this.options.animationSpeed);
                }

                //methods.restore.apply($this);
                if ($dockModal.hasClass("minimized")) {
                    $dockModal.find(".dockmodal-body, .dockmodal-footer").hide();
                    methods.minimize.apply($this);
                } else {
                    if ($dockModal.hasClass("popped-out")) {
                        methods.popout.apply($this);
                    } else {
                        methods.restore.apply($this);
                    }
                }

                // attach resize event
                // track width, set to window width
                $body.data("windowWidth", $window.width());

                $window.unbind("resize.dockmodal").bind("resize.dockmodal", function () {
                    // do nothing if the width is the same
                    // update new width value
                    if ($window.width() == $body.data("windowWidth")) {
                        return;
                    }

                    $body.data("windowWidth", $window.width());
                    methods.refreshLayout();
                });
            });
        },
        destroy      : function () {
            return this.each(function () {

                var $this = $(this).data('dockmodal');
                if (!$this)
                    return;

                // raise beforeClose event
                if ($.isFunction($this.options.beforeClose)) {
                    if ($this.options.beforeClose($this) === false) {
                        return;
                    }
                }

                try {
                    var $dockModal = $this.closest("." + dClass);

                    if ($dockModal.hasClass("popped-out") && !$dockModal.hasClass("minimized")) {
                        $dockModal.css({
                            "left"  : "50%",
                            "right" : "50%",
                            "top"   : "50%",
                            "bottom": "50%"
                        });
                    } else {
                        $dockModal.css({
                            "width" : "0",
                            "height": "0"
                        });
                    }
                    setTimeout(function () {
                        $this.removeData('dockmodal');
                        $this.placeholder.replaceWith($this);
                        $dockModal.remove();
                        $("." + dClass + "-overlay").hide();
                        methods.refreshLayout();

                        // raise close event
                        if ($.isFunction($this.options.close)) {
                            $this.options.close($this);
                        }
                    }, $this.options.animationSpeed);

                } catch (err) {
                    alert(err.message);
                }
                // other destroy routines

            })
        },
        close        : function () {
            methods.destroy.apply(this);
        },
        minimize     : function () {
            return this.each(function () {

                var $this = $(this).data('dockmodal');
                if (!$this)
                    return;

                // raise beforeMinimize event
                if ($.isFunction($this.options.beforeMinimize)) {
                    if ($this.options.beforeMinimize($this) === false) {
                        return;
                    }
                }

                var $dockModal = $this.closest("." + dClass);
                var headerHeight = $dockModal.find(".dockmodal-header").outerHeight();
                $dockModal.addClass("minimized").css({
                    "width" : $this.options.minimizedWidth + "px",
                    "height": headerHeight + "px",
                    "left"  : "auto",
                    "right" : "auto",
                    "top"   : "auto",
                    "bottom": "0"
                });
                setTimeout(function () {
                    // for safty, hide the body and footer
                    $dockModal.find(".dockmodal-body, .dockmodal-footer").hide();

                    // raise minimize event
                    if ($.isFunction($this.options.minimize)) {
                        $this.options.minimize($this);
                    }
                }, $this.options.animationSpeed);

                $("." + dClass + "-overlay").hide();
                $dockModal.find(".action-minimize").attr("title", "Restore");

                methods.refreshLayout();
            })
        },
        restore      : function () {
            return this.each(function () {

                var $this = $(this).data('dockmodal');
                if (!$this)
                    return;

                // raise beforeRestore event
                if ($.isFunction($this.options.beforeRestore)) {
                    if ($this.options.beforeRestore($this) === false) {
                        return;
                    }
                }

                var $dockModal = $this.closest("." + dClass);
                $dockModal.removeClass("minimized popped-out");
                $dockModal.find(".dockmodal-body, .dockmodal-footer").show();
                $dockModal.css({
                    "width" : $this.options.width + "px",
                    "height": $this.options.height,
                    "left"  : "auto",
                    "right" : "auto",
                    "top"   : "auto",
                    "bottom": "0"
                });

                $("." + dClass + "-overlay").hide();
                $dockModal.find(".action-minimize").attr("title", "Minimize");
                $dockModal.find(".action-popout").attr("title", "Pop-out");

                setTimeout(function () {
                    // raise restore event
                    if ($.isFunction($this.options.restore)) {
                        $this.options.restore($this);
                    }
                }, $this.options.animationSpeed);

                methods.refreshLayout();
            })
        },
        popout       : function () {
            return this.each(function () {

                var $this = $(this).data('dockmodal');
                if (!$this)
                    return;

                // raise beforePopout event
                if ($.isFunction($this.options.beforePopout)) {
                    if ($this.options.beforePopout($this) === false) {
                        return;
                    }
                }

                var $dockModal = $this.closest("." + dClass);
                $dockModal.find(".dockmodal-body, .dockmodal-footer").show();

                // prepare element for animation
                removeAnimationCSS($dockModal);
                var offset = $dockModal.position();
                var windowWidth = $(window).width();
                $dockModal.css({
                    "width" : "auto",
                    "height": "auto",
                    "left"  : offset.left + "px",
                    "right" : (windowWidth - offset.left - $dockModal.outerWidth(true)) + "px",
                    "top"   : offset.top + "px",
                    "bottom": 0
                });

                setAnimationCSS($this, $dockModal);
                setTimeout(function () {
                    $dockModal.removeClass("minimized").addClass("popped-out").css({
                        "width" : "auto",
                        "height": "auto",
                        "left"  : $this.options.poppedOutDistance,
                        "right" : $this.options.poppedOutDistance,
                        "top"   : $this.options.poppedOutDistance,
                        "bottom": $this.options.poppedOutDistance
                    });
                    $("." + dClass + "-overlay").show();
                    $dockModal.find(".action-popout").attr("title", "Pop-in");

                    methods.refreshLayout();
                }, 10);

                setTimeout(function () {
                    // raise popout event
                    if ($.isFunction($this.options.popout)) {
                        $this.options.popout($this);
                    }
                }, $this.options.animationSpeed);
            });
        },
        refreshLayout: function () {

            var right = 0;
            var windowWidth = $(window).width();

            $.each($("." + dClass).toArray().reverse(), function (i, val) {
                var $dockModal = $(this);
                var $this = $dockModal.find("." + dClass + "-body > div").data("dockmodal");

                if ($dockModal.hasClass("popped-out") && !$dockModal.hasClass("minimized")) {
                    return;
                }
                right += $this.options.gutter;
                $dockModal.css({ "right": right + "px" });
                if ($dockModal.hasClass("minimized")) {
                    right += $this.options.minimizedWidth;
                } else {
                    right += $this.options.width;
                }
                if (right > windowWidth) {
                    $dockModal.hide();
                } else {
                    setTimeout(function () {
                        $dockModal.show();
                    }, $this.options.animationSpeed);
                }
            });
        }

    };

    $.fn.dockmodal = function (method) {
        if (methods[ method ]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.dockmodal');
        }
    };
})(jQuery);

/*
 * mousetrap v1.5.3 craig.is/killing/mice
 */
!function(e,t,n){function r(e,t,n){e.addEventListener?e.addEventListener(t,n,!1):e.attachEvent("on"+t,n)}function a(e){if("keypress"==e.type){var t=String.fromCharCode(e.which);return e.shiftKey||(t=t.toLowerCase()),t}return p[e.which]?p[e.which]:f[e.which]?f[e.which]:String.fromCharCode(e.which).toLowerCase()}function i(e){var t=[];return e.shiftKey&&t.push("shift"),e.altKey&&t.push("alt"),e.ctrlKey&&t.push("ctrl"),e.metaKey&&t.push("meta"),t}function o(e){return"shift"==e||"ctrl"==e||"alt"==e||"meta"==e}function c(e,t){var n,r,a,i=[];for(n=e,"+"===n?n=["+"]:(n=n.replace(/\+{2}/g,"+plus"),n=n.split("+")),a=0;a<n.length;++a)r=n[a],d[r]&&(r=d[r]),t&&"keypress"!=t&&h[r]&&(r=h[r],i.push("shift")),o(r)&&i.push(r);if(n=r,a=t,!a){if(!u){u={};for(var c in p)c>95&&112>c||p.hasOwnProperty(c)&&(u[p[c]]=c)}a=u[n]?"keydown":"keypress"}return"keypress"==a&&i.length&&(a="keydown"),{key:r,modifiers:i,action:a}}function s(e,n){return null===e||e===t?!1:e===n?!0:s(e.parentNode,n)}function l(e){function n(e){e=e||{};var t,n=!1;for(t in m)e[t]?n=!0:m[t]=0;n||(g=!1)}function s(e,t,n,r,a,i){var c,s,l=[],u=n.type;if(!d._callbacks[e])return[];for("keyup"==u&&o(e)&&(t=[e]),c=0;c<d._callbacks[e].length;++c)if(s=d._callbacks[e][c],(r||!s.seq||m[s.seq]==s.level)&&u==s.action){var p;(p="keypress"==u&&!n.metaKey&&!n.ctrlKey)||(p=s.modifiers,p=t.sort().join(",")===p.sort().join(",")),p&&(p=r&&s.seq==r&&s.level==i,(!r&&s.combo==a||p)&&d._callbacks[e].splice(c,1),l.push(s))}return l}function u(e,t,n,r){d.stopCallback(t,t.target||t.srcElement,n,r)||!1!==e(t,n)||(t.preventDefault?t.preventDefault():t.returnValue=!1,t.stopPropagation?t.stopPropagation():t.cancelBubble=!0)}function p(e){"number"!=typeof e.which&&(e.which=e.keyCode);var t=a(e);t&&("keyup"==e.type&&k===t?k=!1:d.handleKey(t,i(e),e))}function f(e,t,r,i){function o(t){return function(){g=t,++m[e],clearTimeout(y),y=setTimeout(n,1e3)}}function s(t){u(r,t,e),"keyup"!==i&&(k=a(t)),setTimeout(n,10)}for(var l=m[e]=0;l<t.length;++l){var p=l+1===t.length?s:o(i||c(t[l+1]).action);h(t[l],p,i,e,l)}}function h(e,t,n,r,a){d._directMap[e+":"+n]=t,e=e.replace(/\s+/g," ");var i=e.split(" ");1<i.length?f(e,i,t,n):(n=c(e,n),d._callbacks[n.key]=d._callbacks[n.key]||[],s(n.key,n.modifiers,{type:n.action},r,e,a),d._callbacks[n.key][r?"unshift":"push"]({callback:t,modifiers:n.modifiers,action:n.action,seq:r,level:a,combo:e}))}var d=this;if(e=e||t,!(d instanceof l))return new l(e);d.target=e,d._callbacks={},d._directMap={};var y,m={},k=!1,b=!1,g=!1;d._handleKey=function(e,t,r){var a,i=s(e,t,r);t={};var c=0,l=!1;for(a=0;a<i.length;++a)i[a].seq&&(c=Math.max(c,i[a].level));for(a=0;a<i.length;++a)i[a].seq?i[a].level==c&&(l=!0,t[i[a].seq]=1,u(i[a].callback,r,i[a].combo,i[a].seq)):l||u(i[a].callback,r,i[a].combo);i="keypress"==r.type&&b,r.type!=g||o(e)||i||n(t),b=l&&"keydown"==r.type},d._bindMultiple=function(e,t,n){for(var r=0;r<e.length;++r)h(e[r],t,n)},r(e,"keypress",p),r(e,"keydown",p),r(e,"keyup",p)}var u,p={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},f={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},h={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},d={option:"alt",command:"meta","return":"enter",escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"};for(n=1;20>n;++n)p[111+n]="f"+n;for(n=0;9>=n;++n)p[n+96]=n;l.prototype.bind=function(e,t,n){return e=e instanceof Array?e:[e],this._bindMultiple.call(this,e,t,n),this},l.prototype.unbind=function(e,t){return this.bind.call(this,e,function(){},t)},l.prototype.trigger=function(e,t){return this._directMap[e+":"+t]&&this._directMap[e+":"+t]({},e),this},l.prototype.reset=function(){return this._callbacks={},this._directMap={},this},l.prototype.stopCallback=function(e,t){return-1<(" "+t.className+" ").indexOf(" mousetrap ")||s(t,this.target)?!1:"INPUT"==t.tagName||"SELECT"==t.tagName||"TEXTAREA"==t.tagName||t.isContentEditable},l.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)},l.init=function(){var e,n=l(t);for(e in n)"_"!==e.charAt(0)&&(l[e]=function(e){return function(){return n[e].apply(n,arguments)}}(e))},l.init(),e.Mousetrap=l,"undefined"!=typeof module&&module.exports&&(module.exports=l),"function"==typeof define&&define.amd&&define(function(){return l})}(window,document);

/*
 Easy pie chart is a jquery plugin to display simple animated pie charts for only one value
 */
(function(e){e.easyPieChart=function(t,n){var r,i,s,o,u,a,f,l,c=this;this.el=t;this.$el=e(t);this.$el.data("easyPieChart",this);this.init=function(){var t,r;c.options=e.extend({},e.easyPieChart.defaultOptions,n);t=parseInt(c.$el.data("percent"),10);c.percentage=0;c.canvas=e("<canvas width='"+c.options.size+"' height='"+c.options.size+"'></canvas>").get(0);c.$el.append(c.canvas);if(typeof G_vmlCanvasManager!=="undefined"&&G_vmlCanvasManager!==null){G_vmlCanvasManager.initElement(c.canvas)}c.ctx=c.canvas.getContext("2d");if(window.devicePixelRatio>1){r=window.devicePixelRatio;e(c.canvas).css({width:c.options.size,height:c.options.size});c.canvas.width*=r;c.canvas.height*=r;c.ctx.scale(r,r)}c.ctx.translate(c.options.size/2,c.options.size/2);c.ctx.rotate(c.options.rotate*Math.PI/180);c.$el.addClass("easyPieChart");c.$el.css({width:c.options.size,height:c.options.size,lineHeight:""+c.options.size+"px"});c.update(t);return c};this.update=function(e){e=parseFloat(e)||0;if(c.options.animate===false){s(e)}else{if(c.options.delay){i(c.percentage,0);setTimeout(function(){return i(c.percentage,e)},c.options.delay)}else{i(c.percentage,e)}}return c};f=function(){var e,t,n;c.ctx.fillStyle=c.options.scaleColor;c.ctx.lineWidth=1;n=[];for(e=t=0;t<=24;e=++t){n.push(r(e))}return n};r=function(e){var t;t=e%6===0?0:c.options.size*.017;c.ctx.save();c.ctx.rotate(e*Math.PI/12);c.ctx.fillRect(c.options.size/2-t,0,-c.options.size*.05+t,1);c.ctx.restore()};l=function(){var e;e=c.options.size/2-c.options.lineWidth/2;if(c.options.scaleColor!==false){e-=c.options.size*.08}c.ctx.beginPath();c.ctx.arc(0,0,e,0,Math.PI*2,true);c.ctx.closePath();c.ctx.strokeStyle=c.options.trackColor;c.ctx.lineWidth=c.options.lineWidth;c.ctx.stroke()};a=function(){if(c.options.scaleColor!==false){f()}if(c.options.trackColor!==false){l()}};s=function(t){var n;a();c.ctx.strokeStyle=e.isFunction(c.options.barColor)?c.options.barColor(t):c.options.barColor;c.ctx.lineCap=c.options.lineCap;c.ctx.lineWidth=c.options.lineWidth;n=c.options.size/2-c.options.lineWidth/2;if(c.options.scaleColor!==false){n-=c.options.size*.08}c.ctx.save();c.ctx.rotate(-Math.PI/2);c.ctx.beginPath();c.ctx.arc(0,0,n,0,Math.PI*2*t/100,false);c.ctx.stroke();c.ctx.restore()};u=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(e){return window.setTimeout(e,1e3/60)}}();i=function(e,t){var n,r;c.options.onStart.call(c);c.percentage=t;Date.now||(Date.now=function(){return+(new Date)});r=Date.now();n=function(){var i,f;f=Math.min(Date.now()-r,c.options.animate);c.ctx.clearRect(-c.options.size/2,-c.options.size/2,c.options.size,c.options.size);a.call(c);i=[o(f,e,t-e,c.options.animate)];c.options.onStep.call(c,i);s.call(c,i);if(f>=c.options.animate){return c.options.onStop.call(c,i,t)}else{return u(n)}};u(n)};o=function(e,t,n,r){var i,s;i=function(e){return Math.pow(e,2)};s=function(e){if(e<1){return i(e)}else{return 2-i(e/2*-2+2)}};e/=r/2;return n/2*s(e)+t};return this.init()};e.easyPieChart.defaultOptions={barColor:"#ef1e25",trackColor:"#f2f2f2",scaleColor:"#dfe0e0",lineCap:"round",rotate:0,size:110,lineWidth:3,animate:false,delay:false,onStart:e.noop,onStop:e.noop,onStep:e.noop};e.fn.easyPieChart=function(t){return e.each(this,function(n,r){var i,s;i=e(r);if(!i.data("easyPieChart")){s=e.extend({},t,i.data());return i.data("easyPieChart",new e.easyPieChart(r,s))}})};return void 0})(jQuery);

/*
 * jQuery UI Touch Punch 0.2.3
 */
!function(a){function f(a,b){if(!(a.originalEvent.touches.length>1)){a.preventDefault();var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}if(a.support.touch="ontouchend"in document,a.support.touch){var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a){var b=this;!e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a){e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){var b=this;b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){var b=this;b.element.unbind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)}}}(jQuery);

/*
 * https://github.com/douglascrockford/JSON-js/blob/master/json2.js
 */
var JSON;if(!JSON){JSON={}}(function(){function f(a){return a<10?"0"+a:a}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];if(i&&typeof i==="object"&&typeof i.toJSON==="function"){i=i.toJSON(a)}if(typeof rep==="function"){i=rep.call(b,a,i)}switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i){return"null"}gap+=indent;h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1){h[c]=str(c,i)||"null"}e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]";gap=g;return e}if(rep&&typeof rep==="object"){f=rep.length;for(c=0;c<f;c+=1){if(typeof rep[c]==="string"){d=rep[c];e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}else{for(d in i){if(Object.prototype.hasOwnProperty.call(i,d)){e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}";gap=g;return e}}"use strict";if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b"," ":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(a,b,c){var d;gap="";indent="";if(typeof c==="number"){for(d=0;d<c;d+=1){indent+=" "}}else if(typeof c==="string"){indent=c}rep=b;if(b&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":a})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e==="object"){for(c in e){if(Object.prototype.hasOwnProperty.call(e,c)){d=walk(e,c);if(d!==undefined){e[c]=d}else{delete e[c]}}}}return reviver.call(a,b,e)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})();

/*
 * NProgress 2.0.2
 */
!function(n,e){"function"==typeof define&&define.amd?define(e):"object"==typeof exports?module.exports=e():n.NProgress=e()}(this,function(){function n(n,e,t){return e>n?e:n>t?t:n}function e(n){return 100*(-1+n)}function t(n,t,r){var i;return i="translate3d"===c.positionUsing?{transform:"translate3d("+e(n)+"%,0,0)"}:"translate"===c.positionUsing?{transform:"translate("+e(n)+"%,0)"}:{"margin-left":e(n)+"%"},i.transition="all "+t+"ms "+r,i}function r(n,e){var t="string"==typeof n?n:o(n);return t.indexOf(" "+e+" ")>=0}function i(n,e){var t=o(n),i=t+e;r(t,e)||(n.className=i.substring(1))}function s(n,e){var t,i=o(n);r(n,e)&&(t=i.replace(" "+e+" "," "),n.className=t.substring(1,t.length-1))}function o(n){return(" "+(n.className||"")+" ").replace(/\s+/gi," ")}function a(n){n&&n.parentNode&&n.parentNode.removeChild(n)}var u={};u.version="0.1.6";var c=u.settings={minimum:.08,easing:"ease",positionUsing:"",speed:200,trickle:!0,trickleRate:.02,trickleSpeed:800,showSpinner:!0,barSelector:'[role="bar"]',spinnerSelector:'[role="spinner"]',parent:"body",barClass:"",barPos:"",template:'<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'};u.configure=function(n){var e,t;for(e in n)t=n[e],void 0!==t&&n.hasOwnProperty(e)&&(c[e]=t);return this},u.status=null,u.set=function(e){var r=u.isStarted();e=n(e,c.minimum,1),u.status=1===e?null:e;var i=u.render(!r),s=i.querySelector(c.barSelector),o=c.speed,a=c.easing;return i.offsetWidth,l(function(n){""===c.positionUsing&&(c.positionUsing=u.getPositioningCSS()),f(s,t(e,o,a)),1===e?(f(i,{transition:"none",opacity:1}),i.offsetWidth,setTimeout(function(){f(i,{transition:"all "+o+"ms linear",opacity:0}),setTimeout(function(){u.remove(),n()},o)},o)):setTimeout(n,o)}),this},u.isStarted=function(){return"number"==typeof u.status},u.start=function(){u.status||u.set(0);var n=function(){setTimeout(function(){u.status&&(u.trickle(),n())},c.trickleSpeed)};return c.trickle&&n(),this},u.done=function(n){return n||u.status?u.inc(.3+.5*Math.random()).set(1):this},u.inc=function(e){var t=u.status;return t?("number"!=typeof e&&(e=(1-t)*n(Math.random()*t,.1,.95)),t=n(t+e,0,.994),u.set(t)):u.start()},u.trickle=function(){return u.inc(Math.random()*c.trickleRate)},function(){var n=0,e=0;u.promise=function(t){return t&&"resolved"!=t.state()?(0==e&&u.start(),n++,e++,t.always(function(){e--,0==e?(n=0,u.done()):u.set((n-e)/n)}),this):this}}(),u.render=function(n){if(u.isRendered())return document.getElementById("nprogress");i(document.documentElement,"nprogress-busy");var t=document.createElement("div");t.id="nprogress",t.className=u.settings.barPos+" "+u.settings.barColor,t.innerHTML=c.template;var r,s=t.querySelector(c.barSelector),o=n?"-100":e(u.status||0),l=document.querySelector(c.parent);return f(s,{transition:"all 0 linear",transform:"translate3d("+o+"%,0,0)"}),c.showSpinner||(r=t.querySelector(c.spinnerSelector),r&&a(r)),l!=document.body&&i(l,"nprogress-custom-parent"),l.appendChild(t),t},u.remove=function(){s(document.documentElement,"nprogress-busy"),s(document.querySelector(c.parent),"nprogress-custom-parent");var n=document.getElementById("nprogress");n&&a(n)},u.isRendered=function(){return!!document.getElementById("nprogress")},u.getPositioningCSS=function(){var n=document.body.style,e="WebkitTransform"in n?"Webkit":"MozTransform"in n?"Moz":"msTransform"in n?"ms":"OTransform"in n?"O":"";return e+"Perspective"in n?"translate3d":e+"Transform"in n?"translate":"margin"};var l=function(){function n(){var t=e.shift();t&&t(n)}var e=[];return function(t){e.push(t),1==e.length&&n()}}(),f=function(){function n(n){return n.replace(/^-ms-/,"ms-").replace(/-([\da-z])/gi,function(n,e){return e.toUpperCase()})}function e(n){var e=document.body.style;if(n in e)return n;for(var t,r=i.length,s=n.charAt(0).toUpperCase()+n.slice(1);r--;)if(t=i[r]+s,t in e)return t;return n}function t(t){return t=n(t),s[t]||(s[t]=e(t))}function r(n,e,r){e=t(e),n.style[e]=r}var i=["Webkit","O","Moz","ms"],s={};return function(n,e){var t,i,s=arguments;if(2==s.length)for(t in e)i=e[t],void 0!==i&&e.hasOwnProperty(t)&&r(n,t,i);else r(n,s[1],s[2])}}();return u});

/*
 * Underscore.js 1.7.0
 */
(function(){var n=this,t=n._,r=Array.prototype,e=Object.prototype,u=Function.prototype,i=r.push,a=r.slice,o=r.concat,l=e.toString,c=e.hasOwnProperty,f=Array.isArray,s=Object.keys,p=u.bind,h=function(n){return n instanceof h?n:this instanceof h?void(this._wrapped=n):new h(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=h),exports._=h):n._=h,h.VERSION="1.7.0";var g=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}};h.iteratee=function(n,t,r){return null==n?h.identity:h.isFunction(n)?g(n,t,r):h.isObject(n)?h.matches(n):h.property(n)},h.each=h.forEach=function(n,t,r){if(null==n)return n;t=g(t,r);var e,u=n.length;if(u===+u)for(e=0;u>e;e++)t(n[e],e,n);else{var i=h.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},h.map=h.collect=function(n,t,r){if(null==n)return[];t=h.iteratee(t,r);for(var e,u=n.length!==+n.length&&h.keys(n),i=(u||n).length,a=Array(i),o=0;i>o;o++)e=u?u[o]:o,a[o]=t(n[e],e,n);return a};var v="Reduce of empty array with no initial value";h.reduce=h.foldl=h.inject=function(n,t,r,e){null==n&&(n=[]),t=g(t,e,4);var u,i=n.length!==+n.length&&h.keys(n),a=(i||n).length,o=0;if(arguments.length<3){if(!a)throw new TypeError(v);r=n[i?i[o++]:o++]}for(;a>o;o++)u=i?i[o]:o,r=t(r,n[u],u,n);return r},h.reduceRight=h.foldr=function(n,t,r,e){null==n&&(n=[]),t=g(t,e,4);var u,i=n.length!==+n.length&&h.keys(n),a=(i||n).length;if(arguments.length<3){if(!a)throw new TypeError(v);r=n[i?i[--a]:--a]}for(;a--;)u=i?i[a]:a,r=t(r,n[u],u,n);return r},h.find=h.detect=function(n,t,r){var e;return t=h.iteratee(t,r),h.some(n,function(n,r,u){return t(n,r,u)?(e=n,!0):void 0}),e},h.filter=h.select=function(n,t,r){var e=[];return null==n?e:(t=h.iteratee(t,r),h.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e)},h.reject=function(n,t,r){return h.filter(n,h.negate(h.iteratee(t)),r)},h.every=h.all=function(n,t,r){if(null==n)return!0;t=h.iteratee(t,r);var e,u,i=n.length!==+n.length&&h.keys(n),a=(i||n).length;for(e=0;a>e;e++)if(u=i?i[e]:e,!t(n[u],u,n))return!1;return!0},h.some=h.any=function(n,t,r){if(null==n)return!1;t=h.iteratee(t,r);var e,u,i=n.length!==+n.length&&h.keys(n),a=(i||n).length;for(e=0;a>e;e++)if(u=i?i[e]:e,t(n[u],u,n))return!0;return!1},h.contains=h.include=function(n,t){return null==n?!1:(n.length!==+n.length&&(n=h.values(n)),h.indexOf(n,t)>=0)},h.invoke=function(n,t){var r=a.call(arguments,2),e=h.isFunction(t);return h.map(n,function(n){return(e?t:n[t]).apply(n,r)})},h.pluck=function(n,t){return h.map(n,h.property(t))},h.where=function(n,t){return h.filter(n,h.matches(t))},h.findWhere=function(n,t){return h.find(n,h.matches(t))},h.max=function(n,t,r){var e,u,i=-1/0,a=-1/0;if(null==t&&null!=n){n=n.length===+n.length?n:h.values(n);for(var o=0,l=n.length;l>o;o++)e=n[o],e>i&&(i=e)}else t=h.iteratee(t,r),h.each(n,function(n,r,e){u=t(n,r,e),(u>a||u===-1/0&&i===-1/0)&&(i=n,a=u)});return i},h.min=function(n,t,r){var e,u,i=1/0,a=1/0;if(null==t&&null!=n){n=n.length===+n.length?n:h.values(n);for(var o=0,l=n.length;l>o;o++)e=n[o],i>e&&(i=e)}else t=h.iteratee(t,r),h.each(n,function(n,r,e){u=t(n,r,e),(a>u||1/0===u&&1/0===i)&&(i=n,a=u)});return i},h.shuffle=function(n){for(var t,r=n&&n.length===+n.length?n:h.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=h.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},h.sample=function(n,t,r){return null==t||r?(n.length!==+n.length&&(n=h.values(n)),n[h.random(n.length-1)]):h.shuffle(n).slice(0,Math.max(0,t))},h.sortBy=function(n,t,r){return t=h.iteratee(t,r),h.pluck(h.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var m=function(n){return function(t,r,e){var u={};return r=h.iteratee(r,e),h.each(t,function(e,i){var a=r(e,i,t);n(u,e,a)}),u}};h.groupBy=m(function(n,t,r){h.has(n,r)?n[r].push(t):n[r]=[t]}),h.indexBy=m(function(n,t,r){n[r]=t}),h.countBy=m(function(n,t,r){h.has(n,r)?n[r]++:n[r]=1}),h.sortedIndex=function(n,t,r,e){r=h.iteratee(r,e,1);for(var u=r(t),i=0,a=n.length;a>i;){var o=i+a>>>1;r(n[o])<u?i=o+1:a=o}return i},h.toArray=function(n){return n?h.isArray(n)?a.call(n):n.length===+n.length?h.map(n,h.identity):h.values(n):[]},h.size=function(n){return null==n?0:n.length===+n.length?n.length:h.keys(n).length},h.partition=function(n,t,r){t=h.iteratee(t,r);var e=[],u=[];return h.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},h.first=h.head=h.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:0>t?[]:a.call(n,0,t)},h.initial=function(n,t,r){return a.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},h.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:a.call(n,Math.max(n.length-t,0))},h.rest=h.tail=h.drop=function(n,t,r){return a.call(n,null==t||r?1:t)},h.compact=function(n){return h.filter(n,h.identity)};var y=function(n,t,r,e){if(t&&h.every(n,h.isArray))return o.apply(e,n);for(var u=0,a=n.length;a>u;u++){var l=n[u];h.isArray(l)||h.isArguments(l)?t?i.apply(e,l):y(l,t,r,e):r||e.push(l)}return e};h.flatten=function(n,t){return y(n,t,!1,[])},h.without=function(n){return h.difference(n,a.call(arguments,1))},h.uniq=h.unique=function(n,t,r,e){if(null==n)return[];h.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=h.iteratee(r,e));for(var u=[],i=[],a=0,o=n.length;o>a;a++){var l=n[a];if(t)a&&i===l||u.push(l),i=l;else if(r){var c=r(l,a,n);h.indexOf(i,c)<0&&(i.push(c),u.push(l))}else h.indexOf(u,l)<0&&u.push(l)}return u},h.union=function(){return h.uniq(y(arguments,!0,!0,[]))},h.intersection=function(n){if(null==n)return[];for(var t=[],r=arguments.length,e=0,u=n.length;u>e;e++){var i=n[e];if(!h.contains(t,i)){for(var a=1;r>a&&h.contains(arguments[a],i);a++);a===r&&t.push(i)}}return t},h.difference=function(n){var t=y(a.call(arguments,1),!0,!0,[]);return h.filter(n,function(n){return!h.contains(t,n)})},h.zip=function(n){if(null==n)return[];for(var t=h.max(arguments,"length").length,r=Array(t),e=0;t>e;e++)r[e]=h.pluck(arguments,e);return r},h.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},h.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=h.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}for(;u>e;e++)if(n[e]===t)return e;return-1},h.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=n.length;for("number"==typeof r&&(e=0>r?e+r+1:Math.min(e,r+1));--e>=0;)if(n[e]===t)return e;return-1},h.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var d=function(){};h.bind=function(n,t){var r,e;if(p&&n.bind===p)return p.apply(n,a.call(arguments,1));if(!h.isFunction(n))throw new TypeError("Bind must be called on a function");return r=a.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(a.call(arguments)));d.prototype=n.prototype;var u=new d;d.prototype=null;var i=n.apply(u,r.concat(a.call(arguments)));return h.isObject(i)?i:u}},h.partial=function(n){var t=a.call(arguments,1);return function(){for(var r=0,e=t.slice(),u=0,i=e.length;i>u;u++)e[u]===h&&(e[u]=arguments[r++]);for(;r<arguments.length;)e.push(arguments[r++]);return n.apply(this,e)}},h.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=h.bind(n[r],n);return n},h.memoize=function(n,t){var r=function(e){var u=r.cache,i=t?t.apply(this,arguments):e;return h.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},h.delay=function(n,t){var r=a.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},h.defer=function(n){return h.delay.apply(h,[n,1].concat(a.call(arguments,1)))},h.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var l=function(){o=r.leading===!1?0:h.now(),a=null,i=n.apply(e,u),a||(e=u=null)};return function(){var c=h.now();o||r.leading!==!1||(o=c);var f=t-(c-o);return e=this,u=arguments,0>=f||f>t?(clearTimeout(a),a=null,o=c,i=n.apply(e,u),a||(e=u=null)):a||r.trailing===!1||(a=setTimeout(l,f)),i}},h.debounce=function(n,t,r){var e,u,i,a,o,l=function(){var c=h.now()-a;t>c&&c>0?e=setTimeout(l,t-c):(e=null,r||(o=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,a=h.now();var c=r&&!e;return e||(e=setTimeout(l,t)),c&&(o=n.apply(i,u),i=u=null),o}},h.wrap=function(n,t){return h.partial(t,n)},h.negate=function(n){return function(){return!n.apply(this,arguments)}},h.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},h.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},h.before=function(n,t){var r;return function(){return--n>0?r=t.apply(this,arguments):t=null,r}},h.once=h.partial(h.before,2),h.keys=function(n){if(!h.isObject(n))return[];if(s)return s(n);var t=[];for(var r in n)h.has(n,r)&&t.push(r);return t},h.values=function(n){for(var t=h.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},h.pairs=function(n){for(var t=h.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},h.invert=function(n){for(var t={},r=h.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},h.functions=h.methods=function(n){var t=[];for(var r in n)h.isFunction(n[r])&&t.push(r);return t.sort()},h.extend=function(n){if(!h.isObject(n))return n;for(var t,r,e=1,u=arguments.length;u>e;e++){t=arguments[e];for(r in t)c.call(t,r)&&(n[r]=t[r])}return n},h.pick=function(n,t,r){var e,u={};if(null==n)return u;if(h.isFunction(t)){t=g(t,r);for(e in n){var i=n[e];t(i,e,n)&&(u[e]=i)}}else{var l=o.apply([],a.call(arguments,1));n=new Object(n);for(var c=0,f=l.length;f>c;c++)e=l[c],e in n&&(u[e]=n[e])}return u},h.omit=function(n,t,r){if(h.isFunction(t))t=h.negate(t);else{var e=h.map(o.apply([],a.call(arguments,1)),String);t=function(n,t){return!h.contains(e,t)}}return h.pick(n,t,r)},h.defaults=function(n){if(!h.isObject(n))return n;for(var t=1,r=arguments.length;r>t;t++){var e=arguments[t];for(var u in e)n[u]===void 0&&(n[u]=e[u])}return n},h.clone=function(n){return h.isObject(n)?h.isArray(n)?n.slice():h.extend({},n):n},h.tap=function(n,t){return t(n),n};var b=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof h&&(n=n._wrapped),t instanceof h&&(t=t._wrapped);var u=l.call(n);if(u!==l.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]===n)return e[i]===t;var a=n.constructor,o=t.constructor;if(a!==o&&"constructor"in n&&"constructor"in t&&!(h.isFunction(a)&&a instanceof a&&h.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c,f;if("[object Array]"===u){if(c=n.length,f=c===t.length)for(;c--&&(f=b(n[c],t[c],r,e)););}else{var s,p=h.keys(n);if(c=p.length,f=h.keys(t).length===c)for(;c--&&(s=p[c],f=h.has(t,s)&&b(n[s],t[s],r,e)););}return r.pop(),e.pop(),f};h.isEqual=function(n,t){return b(n,t,[],[])},h.isEmpty=function(n){if(null==n)return!0;if(h.isArray(n)||h.isString(n)||h.isArguments(n))return 0===n.length;for(var t in n)if(h.has(n,t))return!1;return!0},h.isElement=function(n){return!(!n||1!==n.nodeType)},h.isArray=f||function(n){return"[object Array]"===l.call(n)},h.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},h.each(["Arguments","Function","String","Number","Date","RegExp"],function(n){h["is"+n]=function(t){return l.call(t)==="[object "+n+"]"}}),h.isArguments(arguments)||(h.isArguments=function(n){return h.has(n,"callee")}),"function"!=typeof/./&&(h.isFunction=function(n){return"function"==typeof n||!1}),h.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},h.isNaN=function(n){return h.isNumber(n)&&n!==+n},h.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===l.call(n)},h.isNull=function(n){return null===n},h.isUndefined=function(n){return n===void 0},h.has=function(n,t){return null!=n&&c.call(n,t)},h.noConflict=function(){return n._=t,this},h.identity=function(n){return n},h.constant=function(n){return function(){return n}},h.noop=function(){},h.property=function(n){return function(t){return t[n]}},h.matches=function(n){var t=h.pairs(n),r=t.length;return function(n){if(null==n)return!r;n=new Object(n);for(var e=0;r>e;e++){var u=t[e],i=u[0];if(u[1]!==n[i]||!(i in n))return!1}return!0}},h.times=function(n,t,r){var e=Array(Math.max(0,n));t=g(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},h.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},h.now=Date.now||function(){return(new Date).getTime()};var _={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},w=h.invert(_),j=function(n){var t=function(t){return n[t]},r="(?:"+h.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};h.escape=j(_),h.unescape=j(w),h.result=function(n,t){if(null==n)return void 0;var r=n[t];return h.isFunction(r)?n[t]():r};var x=0;h.uniqueId=function(n){var t=++x+"";return n?n+t:t},h.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var A=/(.)^/,k={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},O=/\\|'|\r|\n|\u2028|\u2029/g,F=function(n){return"\\"+k[n]};h.template=function(n,t,r){!t&&r&&(t=r),t=h.defaults({},t,h.templateSettings);var e=RegExp([(t.escape||A).source,(t.interpolate||A).source,(t.evaluate||A).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,a,o){return i+=n.slice(u,o).replace(O,F),u=o+t.length,r?i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":a&&(i+="';\n"+a+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var a=new Function(t.variable||"obj","_",i)}catch(o){throw o.source=i,o}var l=function(n){return a.call(this,n,h)},c=t.variable||"obj";return l.source="function("+c+"){\n"+i+"}",l},h.chain=function(n){var t=h(n);return t._chain=!0,t};var E=function(n){return this._chain?h(n).chain():n};h.mixin=function(n){h.each(h.functions(n),function(t){var r=h[t]=n[t];h.prototype[t]=function(){var n=[this._wrapped];return i.apply(n,arguments),E.call(this,r.apply(h,n))}})},h.mixin(h),h.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=r[n];h.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],E.call(this,r)}}),h.each(["concat","join","slice"],function(n){var t=r[n];h.prototype[n]=function(){return E.call(this,t.apply(this._wrapped,arguments))}}),h.prototype.value=function(){return this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return h})}).call(this);
