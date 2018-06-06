
/* 
* name: Vi2.VideoPlayer 
* author: 2018 Niels Seidel, niels.seidel@nise81.com
* license: MIT License
* description: 
*	todo:

 - bug: keydown binding vary in different browsers
 -- onliest fix: https://github.com/google/closure-library/blob/master/closure/goog/events/keyhandler.js
 
 - add getter and setter for quality, playback status, video information, next, previous, playback rate

 - YOuTube http://coding-everyday.blogspot.de/2013/03/how-to-grab-youtube-playback-video-files.html
 - visualize loaded bytes
  - simultanous playback of two clips
 - cache mangement for videos: http://www.misfitgeek.com/2012/10/html5-off-line-storing-and-retrieving-videos-with-indexeddb/
 - refine cycle including event bindings


 - manage to play parts of a video: http://www.xiph.org/oggz/doc/group__seek__api.html
- options: supported codecs / mime types
 - further: API calls: http://code.google.com/apis/youtube/js_api_reference.html
 - media fragment URI ..parser ..:: http://tomayac.com/mediafragments/mediafragments.html


 \begin{lstlisting}

\\ normal playback time
Schema: t=npt:<start-in-seconds>,<end-in-seconds>
Beispiel: t=npt:10,20 
.
t=120s,121.5s
Shema: t=npt:<m>,<s>.<ms>:<h>:<m>.<ms>
Beispiel: t=npt:120,0:02:01.5

// SMPTE timecode standard ... wie bei DVDs
Schema: t=smpte-<frame-rate>:<h>:<m>:<s>,<h>:<m>:<s>.<ms>
t=smpte-30:0:02:00,0:02:01:15
t=smpte-25:0:02:00:00,0:02:01:12.1


t=npt:10,20 			# => results in the time interval [10,20[
t=,20 						# => results in the time interval [0,20[
t=smpte:0:02:00, 	# => results in the time interval [120,end[


// Räumliche Dimension
Schema: #xywh=<einheit>:<x>:<y>:<width>:<height>
Beispiel: #xywh=pixel:10,10,30,30


track=1&track=2 track=video
track=Kids%20Video
# => results in only extracting track ’1’ and ’2’
# => results in only extracting track ’video’
# => results in only extracting track

xywh=160,120,320,240
# => results in a 320x240 box at x=160 and y=120
xywh=pixel:160,120,320,240 # => results in a 320x240 box at x=160 and y=120
xywh=percent:25,25,50,50 # => results in a 50%x50% box at x=25% and y=25%

// Named dimension
id=1 # => results in only extracting the section called ’1’
id=chapter-1 # => results in only extracting the section called ’chapter-1’
id=My%20Kids # => results in only extracting the section called ’My Kids’

\end{lstlisting}


https://developer.mozilla.org/en/Configuring_servers_for_Ogg_media
#1 determine duration
$ oggz-info /g/media/bruce_vs_ironman.ogv

#2 hard code duration for apache2 in the .htaccess-file of the media folder
<Files "elephant.ogv">
Header set X-Content-Duration "653.791"
</Files>


http://dev.opera.com/articles/view/everything-you-need-to-know-about-html5-video-and-audio/
*/


define([
    'jquery',
    'js/vi2.core.player.timeline.js',
    'js/vi2.core.utils.js',
    'js/spin.js'
], function (
    $,
    Timeline,
    Utils,
    Spinner
) {
        var
            vi2 = window.vi2 || {},
            Vi2 = window.Vi2 || {},
            utils = new Utils()
            ;
        
        function Player(options) { 
            vi2.observer.player = this;
            this.options = Object.assign(this.options, options);
            this.supportedMime = utils.detectVideoSupport();
            if (this.supportedMime){
                this.createUI();
            }else{
                console.log('No HTML5 video supported');
            }
        }

        Player.prototype = {
            name: 'player',
            // defaults
            options: {
                observer: null,
                selector: '#video1',
                width: 500,
                height: 375,
                seek: 0,
                videoControlsSelector: '.video-controls',
                thumbnail: '/static/img/placeholder.jpg',
                defaultVolume: 1, // 0..1
                enableKeyboardShortcuts: false,
                autoHideCursor: true
            },
            supportedMime: '',
            currentBrowser: '',
            video: null,
            timeline: null,
            observer: null,
            url: '',
            player_plugins: [],
            video_source:'',

            /* selectors */
            video_container: null,
            video_wrap: null,
            play_btn: null,

            /* flags */
            isSequence: false,
            seqList: [],
            seqNum: null,
            seqLoop: false,
            videoIsPlaying: true,
            percentLoaded: 0,
            buffclick: 0,

            /**
             * Creates a video element including timeline and necessary event listeners
             * @param url URL of the video 
             * @param seek Seek time within the video (in seconds)
             */
            createVideo: function (url, seek) { 
                var _this = this;
                this.url = url;
                this.seek = seek === undefined ? 0 : seek;

                // create and append video element
                $('video').remove();
                var video_element = $('<video></video>')
                    .attr('controls', false)
                    .attr('autobuffer', true)
                    .attr('preload', "auto") // "metadata"
                    .attr('id', this.options.selector.replace('#', ''))
                    //.show()
                    //.css({width:'75vw'}) // xxx: size should be defined somewhere
                    //.addClass('embed-responsive-item col-md-12')
                    .text('Your Browser does not support either this video format or videos at all')
                    .appendTo('#seq');

                this.video = document.getElementById((this.options.selector).replace(/\#/, ''));
                if(this.video === null){
                    return;
                }
                if (this.videoIsPlaying) {
                    $(vi2.observer.player).trigger('player.play', []);
                }
                this.video.pause();

                // Loading Indicator
                this.spinner = new Spinner(this.spinner_options);
                //this.startSpinning();


                this.video = $.extend(this.video, {
                    loop: false,
                    preload: 'metadata', // 'metadata' | true ??
                    autoplay: this.videoIsPlaying,
                    controls: false,
                    // 	poster: '/static/img/stills/'+this.options.thumbnail, // xxx wrong path !!
                    //	width: this.options.width,
                    //	height: this.options.height,
                    onerror: function (e) { _this.errorHandling(e); }
                });

                // add timeline
                this.timeline = new Timeline(this.video, {}, this.seek);



                this.play_btn = $('.vi2-video-play-pause');
                this.play_btn.find('.fa-pause').hide();

                this.video.addEventListener('play', function (e) {
                    vi2.observer.clock.startClock();
                    //$('header').hide();
                    _this.play_btn.find('.fa-pause').show();
                    _this.play_btn.find('.fa-play').hide();
                });

                this.video.onsuspend = function () {
                    //console.log("Media load suspended");
                    //_this.startSpinning();
                };

                this.video.onwaiting = function () {
                    //console.log("Video on waiting");
                    _this.startSpinning();
                };

                this.video.onstalled = function () {
                    //console.log("Media not available");
                    _this.startSpinning();
                };

                this.video.oncanplay = function () {
                    //console.log("Video can play");
                    _this.stopSpinning();
                };

                this.video.addEventListener('playing', function () {
                    //vi2.debug('networkstate code: ' + _this.video.networkState)
                    /*     
                        0 = NETWORK_EMPTY - audio/video has not yet been initialized
                        1 = NETWORK_IDLE - audio/video is active and has selected a resource, but is not using the network
                        2 = NETWORK_LOADING - browser is downloading data
                        3 = NETWORK_NO_SOURCE - no audio/video source found
                   
                    if (_this.video.error) {
                        //vi2.debug('error code: ' + _this.video.error.code);
                    }
                     */
                    /*
                        1 = MEDIA_ERR_ABORTED - fetching process aborted by user
                        2 = MEDIA_ERR_NETWORK - error occurred when downloading
                        3 = MEDIA_ERR_DECODE - error occurred when decoding
                        4 = MEDIA_ERR_SRC_NOT_SUPPORTED - audio/video not supported
                    */

                    /*
                        * 0 = HAVE_NOTHING - no information whether or not the audio/video is ready
                        * 1 = HAVE_METADATA - metadata for the audio/video is ready
                        * 2 = HAVE_CURRENT_DATA - data for the current playback position is available, but not enough data to play next frame/millisecond
                        * 3 = HAVE_FUTURE_DATA - data for the current and at least the next frame is available
                        * 4 = HAVE_ENOUGH_DATA - enough data available to start playing
                    
                    if (_this.video.readyState < 3) {
                        _this.startSpinning();
                    } else if (_this.video.readyState === 4) {
                        _this.stopSpinning();
                    }
                    */
                });

                this.video.addEventListener('pause', function (e) {
                    vi2.observer.clock.stopClock();
                    $('header').show();
                    _this.play_btn.find('.fa-pause').hide();
                    _this.play_btn.find('.fa-play').show();
                });

                this.video.addEventListener('abort', function (e) {
                    vi2.observer.clock.stopClock();
                    $('header').show();
                    _this.play_btn.find('.fa-pause').hide();
                    _this.play_btn.find('.fa-play').show();
                });

                // event binding: on can play
                this.video.addEventListener('readystate', function (e) {
                    _this.readyStateHandler(e);
                });

                // event binding: on time update
                this.video.addEventListener('timeupdate', function (e) {
                    //_this.timeUpdateHandler(e);
                });

                // event binding: on ended
                this.video.addEventListener('ended', function (e) {
                    _this.endedHandler(e);
                }, false);


                // trigger event that a new video stream has been loaded
                var t = new Date();
                $(vi2.observer).trigger('stream.loaded', {
                    stream: vi2.observer.current_stream,//params['stream'], 
                    playback_time: seek,//params['time'], 
                    time: t.getTime()
                });

                // get sources and load video
                if (url !== undefined) {
                    $(this.video).html(this.createSource(url), this.video.firstChild);
                }

            },


            /**
             * Stores a sequences of videos and starts playback of the first one.
             * @param sources Array of videos source urls
             * @param index Array index of the sourse parameter that indicates the video to be played
             * @param seek Seek position in seconds
             */
            loadSequence: function (sources, index, seek) {
                this.seqList = sources;
                this.seek = seek;
                this.isSequence = true;
                this.seqNum = index === undefined ? 0 : index;
                this.createVideo(this.seqList[this.seqNum].url, this.seek);
            },


            /** 
             * build video source element
             * @param src = video url; mime_type = mime_type of video
             * @returns: video source element including src and type attribute
             */
            createSource: function (src) {
                this.video_source = src;
                this.currentBrowser = utils.detectBrowser();
                var
                    mime_type = this.supportedMime,
                    ext = '.mp4',
                    source = document.createElement('source')
                    ;
                if (this.currentBrowser === 'Firefox') {
                    ext = '.mp4';  // lacy bug fix since firefox doesn't support mp4 anymore. xxx needs further testing.
                    mime_type = "video/mp4";
                } else if (this.currentBrowser=== 'Chrome') {
                    ext = '.webm';
                    mime_type = "video/webm";
                }

                // extract file type out of mime type
                source.src = src.replace('.mp4', ext) + "?foo=" + (new Date().getTime());//
                source.type = mime_type;
                return source;
            },



            /**
             * Creates the video player interface
             */
            createUI: function () {
               var _this = this; 
               this.createPlaybackControl();

                if (this.options.autoHideCursor) {
                    this.hideCursor();
                }

                if(this.options.enableKeyboardShortcuts){
                    $('body').unbind('keydown').bind('keydown', function (e) {
                        _this.keyboardCommandHandler(e); 
                    });
                }
            
                // show/hide video controls, xxx
                //$(_this.options.videoControlsSelector).addClass("open-controls");
                /*$("#overlay, #seq, #video1 #video-controls #accordion-resizer").hover(
                    function() {  
                        $(_this.options.videoControlsSelector).addClass("open-controls");
                    }, 
                    function() { 
                        $(_this.options.videoControlsSelector).removeClass("open-controls");
                    }
                );*/
                // ??
                //$('#overlay').css('height', $('video').height() );
                //$('#overlay').css('width', $('#video1').width() );

            },


            /**
             * Creates video playback control
             */
            createPlaybackControl: function () {
                var _this = this;

                this.play_btn = $('.vi2-video-play-pause');


                this.play_btn.bind('click', function () {
                    _this.play();
                });

                $(this.play_btn).bind('play', function (e) {
                    vi2.observer.play();
                    $('.screen').remove();
                });

                $(this.play_btn).bind('pause', function (e) {
                    vi2.observer.pause();
                });

                $(vi2.observer.player).bind('player.play', function (e, a, b) {
                    //$('.navbar').hide();
                });

                $(vi2.observer.player).bind('player.pause', function (e, a, b) {
                    //$('.navbar').show();	
                });
            },


            /**
             * Hide mouse cursor and controls if user is inactive for more then 1000ms.
             */
            hideCursor: function(){
                var mouseTimer = null, cursorVisible = true, _this = this;
                
                function disappearCursor() {
                    mouseTimer = null;
                    document.body.style.cursor = "none";
                    cursorVisible = false;
                    //$(_this.options.videoControlsSelector).removeClass("open-controls");
                }
                var el = document.getElementById(this.options.selector.replace('#', ''));
                document.onmousemove = function () {
                    if (mouseTimer) {
                        window.clearTimeout(mouseTimer);
                    }
                    if (!cursorVisible) {
                        document.body.style.cursor = "default";
                        cursorVisible = true;
                        //$(_this.options.videoControlsSelector).addClass("open-controls");
                    }
                    mouseTimer = window.setTimeout(disappearCursor, 1000);
                };
            },



            /********* LOADING Indicator *********************************/

            /* spinner options */
            spinner: false,
            spinner_options: {
                lines: 8, // The number of lines to draw
                length: 15, // The length of each line
                width: 12, // The line thickness
                radius: 64, // The radius of the inner circle
                scale: 0.55, // Scales overall size of the spinner
                corners: 1, // Corner roundness (0..1)
                color: '#ffffff', // CSS color or array of colors
                fadeColor: 'transparent', // CSS color or array of colors
                opacity: 0.6, // Opacity of the lines
                rotate: 8, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                speed: 1, // Rounds per second
                trail: 51, // Afterglow percentage
                fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                className: 'spinner', // The CSS class to assign to the spinner
                top: '50%', // Top position relative to parent
                left: '50%', // Left position relative to parent
                shadow: 'none', // Box-shadow for the lines
                position: 'absolute' // Element positioning
            },


            /** 
             * Starts the loading indicator in terms of a spinner. Function is called if video data is loading 
             */
            startSpinning: function () {
                var target = document.getElementById('overlay');
                this.spinner.spin();
                target.appendChild(this.spinner.el);
                //$('.spinner').css('top', '200px'); // xxx hardcoded repositioning of spinner element
            },

            /** 
             * Stops the loading indicator 
             */
            stopSpinning: function () {
                this.spinner.stop();
            },


            /* EVENT HANDLER *************************/

            /** 
             * Event handler: on can play. Notifies the observer about a new video.
             */
            readyStateHandler: function (e) {
                vi2.observer.updateVideo(this.seqList[this.seqNum].id, this.seqNum);
            },


            /**
             * Event handler that is called when the video has finished.
             */
            endedHandler: function (e) {
                vi2.observer.log({ context: 'player', action: 'video-ended', values: [this.url] });
                vi2.observer.ended();
                this.video.removeEventListener('ended', arguments.callee, false);
                //this.play_btn.removeClass('vi2-video-pause');
                //this.play_btn.addClass('vi2-video-play');
                // load next video clip if its a sequence
                if (this.isSequence && ((this.seqNum + 1) < this.seqList.length || this.seqLoop)) {
                    this.seqNum = (this.seqNum + 1) % this.seqList.length;
                    this.createVideo(this.seqList[this.seqNum].url);
                } else {
                    $(vi2.observer.player).trigger('video.end', null);
                }
            },

            /**
             * Event handler to print out errors
             */
            errorHandling: function (e) {
                //vi2.debug('Error - Media Source not supported: ' + this.video.error.code == this.video.error.MEDIA_ERR_SRC_NOT_SUPPORTED); // true
                //vi2.debug('Error - Network No Source: ' + this.video.networkState == this.video.NETWORK_NO_SOURCE); // true
            }


            /** 
             * Handles certain keyboad commends, xxx buggy
             */
            keyboardCommandHandler: function (e) {

                e.preventDefault();
                this.video.focus();
                switch (e.which) {
                    case 32: // space 
                        this.play(); //
                        break;
                    case 189: // minus 173  oder 189
                        vi2.observer.getWidget('playbackSpeed').decreaseSpeed();
                        break;
                    case 187: // plus 171 oder 187
                        vi2.observer.getWidget('playbackSpeed').increaseSpeed();
                        break;
                    case 38: // arrow up
                        //this.increaseVolume(); // volume control
                        break;
                    case 40: // arrow down
                        //this.decreaseVolume(); // volume control
                        break;
                    case 77: // m 
                        //this.muteVolume();// volume mute	
                        break;
                    case 39: // 39: right 
                        vi2.observer.widget_list.toc.nextElement();
                        break;
                    case 37: // 37:left		
                        vi2.observer.widget_list.toc.previousElement();
                        break;
                    case 34: // 39: right  presenter
                        vi2.observer.player.play();
                        //vi2.observer.widget_list.toc.nextElement();
                        break;
                    case 33: // 37:left		presenter
                        vi2.observer.widget_list.toc.previousElement();
                        break;
                }
                this.video.focus();
            },



            /* INTERFACES *************************/

            /**
             * Playback interface
             */
            play: function () {
                if (this.video.paused === false) {
                    this.video.pause();
                    this.isPlaying(false);
                    $(vi2.observer.player).trigger('player.pause', []);
                    vi2.observer.clock.stopClock();
                    vi2.observer.log({ context: 'player', action: 'pause-click', values: ['1'] });
                } else {
                    this.video.play();
                    this.isPlaying(true);
                    $(vi2.observer.player).trigger('player.play', []);
                    vi2.observer.clock.startClock();
                    vi2.observer.log({ context: 'player', action: 'play-click', values: ['1'] });
                }
            },


            /**
             * Pause interface
             */
            pause: function () {
                this.video.pause();
                this.isPlaying(false);
                $(vi2.observer.player).bind('player.pause');
                vi2.observer.log({ context: 'player', action: 'pause2-click', values: ['1'] });
            },


            /**
             * Interface to request playback status
             */
            isPlaying: function (x) {
                if (x === undefined) {
                    return this.videoIsPlaying;
                } else {
                    this.videoIsPlaying = x;
                }
            },


            /**
             * Returns the video playback duration
             */
            dur : 0,
            duration: function () {
                if (this.video !== null){
                    this.dur = this.video.duration
                }
                return this.dur;
            },

            /**
             * Returns the current videofile
             */
            currentVideoFile: function () {
                return this.video_source;
            },


            /**
             * Get or set the playback time.
             */
            currentTime: function (x) {
                if (x === undefined && this.video !== null) {
                    return this.video.currentTime; //$(this.options.selector).attr('currentTime');
                } else if (parseInt(x) >= 0) {
                    this.video.currentTime = parseInt(x);
                    //$(this.video).trigger('play');
                    //this.play();
                    this.video.play();
                }else{
                    return 0;
                }
            },


            /**
             * Get or set the video width
             */
            width: function (x) {
                if (x === null) {
                    return $(this.options.selector).width();
                } else {
                    //this.video.width = x;
                }
            },

            /**
             * Get or set the video height
             */
            height: function (x) {
                if (x === null) {
                    return $(this.options.selector).height();
                } else {
                    //this.video.height = x;
                }
            }

        };

        return Player;
    }); // end video class
