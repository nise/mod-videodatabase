/* 
* name: Vi2.core.player.logger
* author: niels.seidel@nise81.com
* license: MIT License
* description: Logs segments of specified size that the user has been watched.
*/

define(function () {

    var
        vi2 = window.vi2 || {},
        Vi2 = window.Vi2 || {}
        ;

    function Logger(options) {

        
    }

    Logger.prototype = {

        interval:5,
        timer: null,
        lastposition:-1,
        video:null,

        init: function () {
            if (vi2.observer.name !== 'observer'){
                console.log('No observer available. Player log not possible.');
                return;
            } else if (vi2.observer.player.name !== 'player'){
                console.log('No player available. Player log not possible.');
                return;
            }
            this.video = vi2.observer.player.video;
            this.interval = 2;
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
                //_this.start();
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
        },

        loop: function () { 
            var interval = 5, lastposition = -1;
            var curr = vi2.observer.player.currentTime();
            var currentinterval = curr > 0 ? Math.round( curr / interval ) : 0;
            //console.log(currentinterval)
            if (currentinterval != lastposition) {
                vi2.observer.log({ context: 'player', action: 'playback', values: [currentinterval] });
                lastposition = currentinterval;
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