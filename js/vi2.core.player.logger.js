/* 
* name: Vi2.core.player.logger
* author: niels.seidel@nise81.com
* license: MIT License
* description: 
*/


define(['jquery'], function () {

    var
        vi2 = window.vi2 || {},
        Vi2 = window.Vi2 || {}
        ;

    function Logger(options) {

        this.video = vi2.observer.player;
        this.interval = 5;
        this.lastposition = -1;
        this.timer = null;

        var _this = this;

        this.video.addEventListener('play', function (e) {
            _this.start();
        });

        this.video.addEventListener('pause', function (e) {
            _this.stop();
        });

        this.video.addEventListener('abort', function (e) {
            _this.stop();
        });

        this.video.addEventListener('timeupdate', function (e) {

        });

        this.video.addEventListener('ended', function (e) {
            _this.stop();
        }, false);

        /*
         player.oncanplay(start);
                player.onSeek(restart);
         player.onPause(stop);
             player.onBuffer(stop);
         player.onIdle(stop);
         player.onComplete(stop);
             player.onError(stop);
       */

    }

    Logger.prototype = {

        loop: function () {
            var currentinterval = (Math.round(vi2.observer.player.currentTime()) / this.interval) >> 0;
            console.log("i:" + currentinterval + ", p:" + vi2.observer.player.getPosition());
            if (currentinterval != this.lastposition) {
                vi2.observer.log({ context: 'player', action: 'playback', values: [currentinterval] });
                this.lastposition = currentinterval;
            }
        },

        start: function () {
            if (this.timer) {
                this.timer = clearInterval(this.timer);
            }
            this.timer = setInterval(this.loop, this.interval * 1000);
            setTimeout(this.loop, 100);
        },

        restart: function () {
            if (this.timer) {
                this.timer = clearInterval(this.timer);
            }
            //lasttime = -1;
            this.timer = setInterval(this.loop, this.interval * 1000);
            setTimeout(this.loop, 100);
        },

        stop: function () {
            this.timer = clearInterval(this.timer);
            this.loop();
        }

    };

    return Logger;
});