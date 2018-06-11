/* 
* name: Vi2.SkipBack
* author: niels.seidel@nise81.com
* license: MIT License
* description: Add the functionality of jumping back or forth on playback when pressing a button.
* dependencies:
*  - jquery-1.11.2.min.js
* todo:
*  - remove jquery dependency
*/


define(['jquery'], function ($) {

    /** @constructs
    *		@param {object} options An object containing the parameters
    *		@param {string} options.selector ...
    *		@param {number} options.steps ...
    *		@param {string} options.label ...
    *		
    */
    function Skip(options) {
        this.options = $.extend(this.options, options); // todo: wroite in plain js
    }

    Skip.prototype = {

        name: 'skip',
        type: 'player-widget',
        options: {
            player_selector: '#vi2-1',
            selector: '.control-bar',
            label: '',
            step: -5 // jump 5 seconds back
        },

        /**
        * Initializes the skip back button of content and handles options
        */
        init: function () {
            var selector = document.querySelectorAll(this.options.player_selector + ' ' + this.options.selector)[0];
            // clear selector
            var el = document.querySelectorAll(this.options.selector + ' > .vi2-skipback-controls')[0]; // select the first returned <div> element 
            if (el) {
                el.parentNode.removeChild(el);
            }

            var template = [
                '<div class="vi2-skipback-controls vi2-btn" title="' + this.options.step + 's zurückspringen">',
                '<div class="vi2-skipback-label fa fa-step-backward">',
                this.options.label,
                '</div>',
                '</div>'
            ];

            $(this.options.selector).append(template.join('')); // todo: wroite in plain js
            //selector.innerHTML += template.join('');

            var _this = this;
            var t = document.querySelectorAll('.vi2-skipback-controls')[0];//.addEventListener('keydown', this.handler);
            if (t !== undefined) {
                t.onclick = function (e) {
                    var
                        current = Number(vi2.observer.player.currentTime()),
                        next = current + _this.options.step
                        ;
                    next = typeof next === 'number' ? next : current;
                    next = next < 0 ? 0 : next;
                    vi2.observer.player.currentTime(next);
                    vi2.observer.log({ context: 'skipBack', action: 'skip-back', values: [current, String(next)] });
                };
            }
        }
    };

    return Skip;
});   