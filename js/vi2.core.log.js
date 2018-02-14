/**
 * name: Vi2.Log
 * author: 2018 Niels Seidel, niels.seidel@nise81.com
 * license: MIT License
 * description:
 * todo:
 * * standardisazion:
 * https://sites.google.com/site/camschema/home
 * http://sourceforge.net/p/role-project/svn/HEAD/tree/trunk/gadgets/cam_sjtu/CamInstance.js
 * http://sourceforge.net/p/role-project/svn/HEAD/tree/trunk/gadgets/html5Video/videoGadget.xml
 */


define(['jquery'], function ($) {

    function Log(options) {
        this.options = Object.assign(this.options, options);
        this.userAgent = this.getUserAgent();
    }

    Log.prototype = {
        name: 'log',
        options: {
            output_type: 0, // -1: no logging, 0: console.log(), 1: server log, 
            prefix: '',
            logger_service_url: null,
            logger_service_params: { "data": 0 }
        },

        ip: '',

        /**
         * 
         */
        init: function () { },


        /**
         * Adds a message to the log by constructing a log entry
         */
        add: function (msg) {
            if (typeof msg === 'string') {
                console.log('warning: uncaptured log entrie: ' + msg);
                return;
            }

            var logEntry = {};

            // add date and time information
            var t = new Date();
            logEntry.utc = t.getTime();
            logEntry = this.getLogTime();
            //logEntry.phase: 						vi2.current,
            //logEntry.date:  						String,
            //logEntry.time:  						String,

            // add user information
            var user = vi2.db.currentUser();
            if (user !== undefined) {
                logEntry.user = user.id;
                logEntry.user_name = user.username;
                //logEntry.user_gender:			String,
                //logEntry.user_culture:			String,
                //logEntry.user_session:			Number,
            }

            // add video and playback information
            var pt = vi2.observer.player.currentTime();
            logEntry.playback_time = pt === undefined ? -1 : pt;
            //logEntry.video_id = vi2.observer.player.currentVideoFile();
            logEntry.video_file = vi2.observer.player.currentVideoFile();
            //logEntry.video_length: String,
            //logEntry.video_language: String,
            logEntry.context = msg.context;
            logEntry.action = msg.action;//this.validate(msg); /* context: msg.context, action: msg.action, values: msg.values */
            logEntry.value = msg.values;
            // add misc information
            logEntry.user_agent = this.getUserAgent();
            //group: vi2.currentGroup,

            this.output(logEntry);
        },


        /**
         * Validates the msg against illegal characters etc.
         */
        validate: function (msg) {
            return msg;
        },


        /**
         * Returs structured time information
         */
        getLogTime: function () {
            var date = new Date();
            var s = date.getSeconds();
            var mi = date.getMinutes();
            var h = date.getHours();
            var d = date.getDate();
            var m = date.getMonth() + 1;
            var y = date.getFullYear();

            return {
                utc: date.getTime(),
                date: y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d),
                time: (h <= 9 ? '0' + h : h) + ':' + (mi <= 9 ? '0' + mi : mi) + ':' + (s <= 9 ? '0' + s : s) + ':' + date.getMilliseconds()
            };
        },


        /**
         * Returns the user agent.
         * todo: This data could betters structured 
         */
        getUserAgent: function () {
            return navigator.userAgent.replace(/,/g, ';');
        },


        /**
         * 
         */
        output: function (logEntry) {
            // output
            if (this.options.output_type === 0) {
                console.log(logEntry);
            } else if (this.options.output_type === 1) {
                this.sendLog(logEntry);
            }
        },

        /**
         * Makes an AJAX call to send the log data set to the server
         */
        sendLog: function (entry) {
            this.options.logger_service_params.data = { entry: JSON.stringify(entry), courseid: 2 }; 
            $.ajax({
                method: 'POST',
                url: this.options.logger_service_url,
                data: this.options.logger_service_params,
                dataType: "json"
            })
            .done(function (msg) {
                //console.log(msg);
            })
            .fail(function (msg) {
                //console.log(msg);
            });
        }

    };

    return Log;

});