/* 
* name: Vi2.Zoom
* author: niels.seidel@nise81.com
* license: MIT License
* description: Allows to zoom the video in and out.
* todo:
*  - needs event logging
*  - reset position after using pan and zoom out.
*/


define(['jquery', 'js/jquery.panzoom.min.js'], function ($, PanZoom) {
    var
        vi2 = window.vi2,
        Vi2 = window.Vi2 || {}
        ;

    /** @constructs
    *	@param {object} options An object containing the parameters
    *		
    */
    function Zoom(options) {
        this.options = Object.assign(this.options, options);
        //vi.oberserver = options.observer;
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

        element:'',
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
                $('<span class="vi2-zoom-in fa fa-plus" title="vergrößern"></span>')
                    .attr('id', 'vi2zoomin')
                    .click(function () {
                        _this.showScale();
                    })
                    .prependTo(container)
                    ;
                $('<span class="vi2-zoom-out fa fa-minus vi2-zoom-disabled" title="verkleinern"></span>')
                    .attr('id', 'vi2zoomout')
                    .click(function () {
                        _this.showScale();
                    })
                    .appendTo(container)
                    ;
              
            }

            if (this.options.hasReset) {
                $('<span class="vi2-zoom-reset fa fa-undo" title="Zoom zurücksetzen"></span>')
                    .click(function () {
                        _this.showScale();
                    })
                    .appendTo(container)
                    ;
            }

            if(this.options.showScale){
                this.scaledisplay = $('<span></span>')
                    .addClass('vi2-zoom-display')
                    .appendTo('#overlay')
                    ;
            }

            // start panzoom with the given options
            this.element = $( vi2.observer.options.videoSelector).panzoom({
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
                }
            });
        
        },


        /**
         * Displays a short text about the current zoom level 
         */
        showScale: function () {
            //alert('zoom init')
            var num = this.element.panzoom("getMatrix")[0];
            num = Math.round(4*num)/4;
            var _this = this;
            this.scaledisplay
                .text(num+'x')
                .addClass('vi2-zoom-flash')
                .show()
                ;
            var 
                zoomin = document.getElementById("vi2zoomin"),
                zoomout = document.getElementById("vi2zoomout")
                ;
            zoomin.classList.remove('vi2-zoom-disabled');
            zoomout.classList.remove('vi2-zoom-disabled');          
            if(num === 4){
                zoomin.classList.add('vi2-zoom-disabled');
            }
            if (num === 1) {
                zoomout.classList.add('vi2-zoom-disabled');
            }    
            setTimeout(function(){
                _this.scaledisplay.hide();
            }, 2000);    
        }
    };

    return Zoom;
}); 
