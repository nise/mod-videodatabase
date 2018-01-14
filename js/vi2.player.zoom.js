/* 
* name: Vi2.Zoom
* author: niels.seidel@nise81.com
* license: MIT License
* description: Allows to zoom the video in and out.
* dependencies:
*  - jquery.panzoom.js
* todo:
*  - needs event logging
*  - diaplay zoom level
*/


define(['jquery', 'js/jquery.panzoom.min.js'], function ($, PanZoom) {

    /** @constructs
    *		@param {object} options An object containing the parameters
    *		
    */
    function Zoom(options) {
        this.options = $.extend(this.options, options);
        this.init();
    }

    /**
     * 
     */
    Zoom.prototype = {
        name: 'zoom',
        type: 'player-widget',
        options: {
            controlSelector: '.control-bar',
            hasControls: true,
            hasReset: true,
            haseSlider: true,
            showScale: true,
            min: 1,
            max: 4,
            steps: 0.25
        },

        scaledisplay: null,

        /**
        * Initializes the control elements including the plugin panzoom
        */
        init: function () { 
            var _this = this;
            // clear selector
            $(this.options.controlSelector + '> .vi2-zoom-controls').remove();

            // add controls
            var container = $('<div class="vi2-zoom-controls"></div>')
                .appendTo(this.options.controlSelector);

            if (this.options.hasSlider) {
                var range = $('<input></input>')
                    .attr('type', 'range')
                    .addClass('vi2-zoom-range')
                    .appendTo(container)
                    ;
            }

            if (this.options.hasControls) {
                var btn_in = $('<span class="vi2-zoom-in fa fa-plus" title="herein zoomen"></span>')
                    .click(function () {
                        _this.showScale();
                    })
                    .prependTo(container)
                    ;
                var btn_out = $('<span class="vi2-zoom-out fa fa-minus" title="heraus zoomen"></span>')
                    .click(function () {
                        _this.showScale();
                    })
                    .appendTo(container)
                    ;
              
            }

            if (this.options.hasReset) {
                var btn_reset = $('<span class="vi2-zoom-reset fa fa-undo" title="Zoom zurücksetzen"></span>')
                    .click(function () {
                        _this.showScale();
                    })
                    .appendTo(container)
                    ;
            }

            if(this.options.showScale){
                this.scaledisplay = $('<span></span>')
                    .addClass('vi2-zoom-display')
                    .text(999)
                    .appendTo('#overlay')
                    ;
            }

            // start panzoom with the given options
            var panzoom = $( vi2.observer.options.videoSelector).panzoom({
                cursor: "move",
                increment: this.options.steps,
                minScale: this.options.min,
                maxScale: this.options.max,
                rangeStep: this.options.steps,
                transition: true,
                duration: 200,
                easing: "ease-in-out",
                $zoomIn: $('.vi2-zoom-in'),
                $zoomOut: $('.vi2-zoom-out'),
                $zoomRange: $('.vi2-zoom-range'),
                $reset: $('.vi2-zoom-reset'),
                focal: {
                    clientX: 108,
                    clientY: 132
                },
                $panzoomzoom : function(e){
                    console.log(e);
                }
            });

            panzoom.on("change", function (e) {
                console.log(e);
            });
            
            
        },


        /**
         * 
         */
        showScale: function(value){
            var _this = this;
            this.scaledisplay
                .text(value+'x')
                .addClass('vi2-zoom-flash')
                .show()
                ;
            setTimeout(function(){
                _this.scaledisplay.hide();
            }, 2000);    
        }
    };

    return Zoom;
}); 
