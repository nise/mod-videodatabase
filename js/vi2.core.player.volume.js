define(['jquery'], function ($) {

    function Volume() {

        // bug: vi2.observer.player; is not available
        this.video = document.getElementById("video1");

    }


    /**
     * 
     */
    Volume.prototype = {

        name: 'volume',
        type: 'player-widget',
        options: {
            selector: '.vi2-volume-controls'
        },

        volume_btn: null,
        volume: null,
        isMuted: false,
        defaultVolume: 1,
        video: null,
        tmp_volume: 0,

        init: function () {
            $(this.options.selector).empty();
            //$(this.options.selector + '> .vi2-volume-button').remove();
            var template = [
                '<div class="vi2-volume-slider" title="Lautstärke"></div>',
                '<span class="vi2-volume-button vi2-btn" title="Stumm schalten"></span>',
            ];
            $(this.options.selector).append(template.join(' '));
            this.volume = $('.vi2-volume-slider');
            this.volume_btn = $('.vi2-volume-button');

            var _this = this;

            $(this.volume).slider({
                orientation: 'horizontal',
                range: 'min',
                max: 1,
                step: 0.05,
                animate: false,
                value: _this.defaultVolume,
                slide: function (e, ui) {
                    if (ui.value > 0 && ui.value < 0.5) {
                        _this.isMuted = false;
                        _this.volume_btn.addClass('fa-volume-down');
                        _this.volume_btn.removeClass('fa-volume-up');
                        _this.volume_btn.removeClass('fa-volume-off');
                    } else if (ui.value >= 0.5) {
                        _this.isMuted = false;
                        _this.volume_btn.removeClass('fa-volume-down');
                        _this.volume_btn.addClass('fa-volume-up');
                        _this.volume_btn.removeClass('fa-volume-off');

                    } else {
                        _this.isMuted = true;
                        _this.volume_btn.removeClass('fa-volume-down');
                        _this.volume_btn.removeClass('fa-volume-up');
                        _this.volume_btn.addClass('fa-volume-off');
                    }
                    //_this.video_volume = parseFloat(ui.value);
                },
                change: function (e, ui) {
                    // set video volume
                    var v = document.getElementById("video1")
                    _this.video.volume = ui.value;

                    // button states
                    if (ui.value > 0 && ui.value < 0.5) {
                        _this.isMuted = false;
                        _this.volume_btn.addClass('fa-volume-down');
                        _this.volume_btn.removeClass('fa-volume-up');
                        _this.volume_btn.removeClass('fa-volume-off');
                    } else if (ui.value >= 0.5) {
                        _this.isMuted = false;
                        _this.volume_btn.removeClass('fa-volume-down');
                        _this.volume_btn.addClass('fa-volume-up');
                        _this.volume_btn.removeClass('fa-volume-off');
                    } else {
                        _this.isMuted = true;
                        _this.volume_btn.removeClass('fa-volume-down');
                        _this.volume_btn.removeClass('fa-volume-up');
                        _this.volume_btn.addClass('fa-volume-off');
                    }
                    //_this.video_volume = parseFloat(ui.value);
                }
            });

            this.volume_btn
                .bind('click', function (e) {
                    _this.muteVolume();
                })
                ;

            if (this.volume.slider('value') === 0) {
                this.isMuted = true;
                this.volume_btn.addClass('fa fa-volume-off');
            } else {
                this.volume_btn.addClass('fa fa-volume-up');
            }
        },

        /**
        * Get volume
        */
        getVolume: function () {
            return this.volume.slider('value');//this.video_volume;
        },


        /**
        * Set volume
        * @param volume {Number} Number in the range of 0 and 1. Every value outside that rang will be changed to the boundaries. 
        */
        setVolume: function (volume) {
            this.volume.slider('value', volume);
            vi2.observer.log({ context: 'player', action: 'set-volume', values: [volume] });
        },


        /** 
        * Increases audio volume by 5 percent 
        */
        increaseVolume: function () {
            $(this.volume).slider('value', $(this.volume).slider('value') + 0.05);
        },


        /** 
        * Decreases audio volume by 5 percent 
        */
        decreaseVolume: function () {
            $(this.volume).slider('value', $(this.volume).slider('value') - 0.05);
        },


        /** 
        * Toggles the button to mute/unmute the volume. If volume get unmuted the volume will be reset to the value it had befor muting.
        */
        muteVolume: function () {
            if (!this.isMuted) {
                this.tmp_volume = this.volume.slider('value');
                this.setVolume(0);
                this.isMuted = true;
            } else {
                this.setVolume(this.tmp_volume);
                this.isMuted = false;
            }
        }
    };


    return Volume;
});