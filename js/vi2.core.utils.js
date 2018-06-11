
/**
 *	name: Vi2.Utils
 *	author: niels.seidel@nise81.com
 * license: MIT License
 *	description:
 * dependencies:
 *  - $-1.11.2.min.js
 */


define(['$'], function ($) {


    /* Defines custom drop out box  (style: #div.klappe)*/
    $.fn.dropdown = function (obj) {
        var head = $(this).find('h4');
        var all = $(this).html();
        $(this).toggle(
            function () {
                $(this).html(head.wrapInner('<h4></h4>').html());
            },
            function () {
                $(this).html(all).find('h4').attr('style', 'background-image:url(images/arrow_d.png); display:inline;');
            }
        ).click();
    };


    /* ...*/
    $.fn.hidetext = function (obj) {
        var text = $(this).text();
        var el = $(this).text(text.substr(0, 250) + ' ').append($('<span>more</span>')); //.button()
        return el;
    };



    $.fn.round = function (dec) {
        if (!dec) { dec = 0; }
        return Math.round(this * Math.pow(10, dec)) / Math.pow(10, dec);
    };


    function delegateX(obj, func) {
        var f = function () {
            var target = arguments.callee.target;
            var func = arguments.callee.func;
            return func.apply(target, arguments);
        };
        f.target = obj;
        f.func = func;
        return f;
    }

    function removeDuplicatesX(cat) {
        cat = cat.sort();
        for (var i = 1; i < cat.length;) {
            if (cat[i - 1] == cat[i]) { cat.splice(i, 1); }
            else { i++; }
        }
        return cat;
    }





    /////////////////////////////
    Object.size = function (obj) {
        var
            size = 0,
            key = {}
            ;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                size++;
            }
        }
        return size;
    };

    function Utils(ob) { };


    Utils.prototype = {
        name: 'utils',

        /**
         * Detects the web browser in use
         */
        detectBrowser: function () {
            var ua = navigator.userAgent, tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return M[0];//.join(' ');
        },

        /**
         * HTML5 playback detection
         * 	returns: mime type of supported video or empty string if there is no support
         *	called-by: vi2.core.player.loadVideo()
         */
        detectVideoSupport: function () {
            var dummy_video = document.createElement('video');

            if(typeof (dummy_video.canPlayType) === 'undefined'){
                return false;
            }

            // prefer mp4 over webm over ogv 
            if (dummy_video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') !== '') {
                //vi2.observer.log({ context: 'player', action: 'video-support-mp4', values: ['1'] });
                return 'video/mp4';
            } else if (dummy_video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '') {
                //vi2.observer.log({ context: 'player', action: 'video-support-webm', values: ['1'] });
                return 'video/webm';
            } else if (dummy_video.canPlayType('video/ogg; codecs="theora, vorbis"') !== '') {
                //vi2.observer.log({ context: 'player', action: 'video-support-ogv', values: ['1'] });
                return 'video/ogv';
            } else {
                // no suitable video format is avalable
                //vi2.observer.log({ context: 'player', action: 'video-support-none', values: ['1'] });
                $('#page').html('<h3>We appologize that video application is currently not supported by your browser.</h3>The provided video material can be played on Mozilla Firefox, Google Chrome and Opera. If you prefer Internet Explorer 9 you need to install a <a href="https://tools.google.com/dlpage/webmmf">webm video extension</a> provided by Google. In the near future we are going to server further video formats which will be supported by all major browsers.<br /><br /> Thank you for your understanding.');
            }
            return false;
        },


        /**
         * Converts seconds into decimal format
         */ 
        seconds2decimal: function (seconds) {
            d = Number(seconds);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "00:") + (s < 10 ? "0" : "") + s);
        },


        /* 
         * Converts decimal time format into seconds 
         **/
        deci2seconds: function (decimal) {
            if (Number(decimal) < 0 || decimal === undefined) { return 0; }
            var arr = decimal.split(':');
            return Number(arr[0]) * 3600 + Number(arr[1]) * 60 + Number(arr[2]);
        },


        /*
        * Formats time from seconds to decimal mm:ss
        * @todo: include hours
        **/
        formatTime: function (secs, delimiter) {
            delimiter = delimiter ? delimiter : '';
            var seconds = Math.round(secs);
            var minutes = Math.floor(seconds / 60);
            minutes = (minutes >= 10) ? minutes : "0" + minutes;
            seconds = Math.floor(seconds % 60);
            seconds = (seconds >= 10) ? seconds : "0" + seconds;
            return minutes + delimiter + seconds;
        },


        /*
        * calcs temporal distance to a given time stamp
        **/
        timeDifference: function (s, prefix, postfix) {
            //prefix = prefix === undefined ? 'vor ' : prefix;
            //postfix = postfix === undefined ? ' ago' : postfix; 

            var b = moment(s);
            var a = moment(s);


            var diff = a.diff(b, 'seconds');
            if (diff <= 60) {
                return prefix + diff.toFixed(1) + 's' + postfix;
            }

            diff = a.diff(b, 'minutes');
            if (diff <= 60) {
                return prefix + diff.toFixed(1) + 'min' + postfix;
            }

            diff = a.diff(b, 'hours', true);
            if (diff <= 24) {
                return prefix + diff.toFixed(1) + 'h' + postfix;
            }

            diff = a.diff(b, 'days', true);
            if (diff < 30) {
                return prefix + diff.toFixed(1) + 'd' + postfix;
            }

            diff = a.diff(b, 'months', true);
            if (diff < 12) {
                return prefix + diff.toFixed(1) + 'm' + postfix;
            }

            diff = a.diff(b, 'years', true);
            return prefix + diff.toFixed(1) + 'y' + postfix;

        }
    };

    return Utils;


}); // end utils


