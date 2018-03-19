/** 
 * WORK IN PROGRESS
 * Creates controle element to hide/show the video frame 
 *	xxx todo: this should be accomplished with a audio description and other accessibility assistance
 */
define(['jquery'], function ($) {

    function ToggleVideoImage(options) {
        this.options = $.extend(this.options, options);

    }

    ToggleVideoImage.prototype = {

        options: {},

        init: function () {

            var o = new Image();
            $(o).attr('src', '/static/img/stills/' + this.options.thumbnail).addClass('toggle-pair').prependTo('#screen').hide();
            $(this.video).addClass('toggle-pair');
            var hidden = true;
            var btn = $('<span></span>')
                .addClass('toggle-moving-picture')
                .text('hide video')
                .prependTo('#screen')
                .click(function () {
                    $(this).text(hidden ? 'show video' : 'hide video');
                    hidden = !hidden;
                    $('#screen').find('.toggle-pair').toggle();
                });
            $('#screen').find('.toggle-pair').toggle().hide();
            $('.toggle-moving-picture').hide();

        }

    };

    return ToggleVideoImage;

});