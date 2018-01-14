
/* 
*	name: Vi2.Annotation
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Abstract class for video annotations
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- include hourse at format time
*/


Vi2.Annotation = inherit(/** @lends Annotation# */{

    /** 
    * 	@constructs 
    *		@param {object} options An object containing the parameters
    */
    __constructor: function (options) {
        this.options = options;
    },

    name: 'annotation',
    type: 'annotation',
    options: {},

    /* ... */
    init: function (ann) { },

    /* -- */
    appendToDOM: function (id) { },

    /* ... */
    begin: function (e, id, obj) { },

    /* ... */
    end: function (e, id) { },


    /*
        * 
        **/
    animation: function (selector, effect) {
        $(selector).animate({
            left: 100
        }, {
                duration: 1000

            });
    },

    /*
    * todo: 
    *  - check data types: string, number, decimal-time, ... from .data('datatype', 'decimal-time')
    *  - change messages
    **/
    validateAnnotationForm: function (selector, type) {
        var textarea_flag = 0, textinput_flag = 0, msg = '', sum_checked = 0, sum_checkbox = 0;

        // validate input fields
        $(selector).find('input[type=text]').each(function (i, val) {
            if ($(val).val() === '') {
                $(val).addClass('validation-conflict');
                textinput_flag = true;
            } else {
                $(val).removeClass('validation-conflict');
            }
        });
        if (textinput_flag) {
            msg += "\n Versehen Sie bitte die/das Textfeld/er mit einem Text.";
        }

        // validate textareas
        $(selector).find('textarea').each(function (i, val) {
            if (String($(val).val()).length < 2) {
                $(val).addClass('validation-conflict');
                textarea_flag = true;
            } else {
                $(val).removeClass('validation-conflict');
            }
        });
        if (textarea_flag) {
            msg += "\n Definieren Sie bitte einen Text für das Textfeld.";
        }

        // validate checkboxes
        if ($(selector).find('input[type=checkbox]').length > 0 && $(selector).find('input:checked').length === 0) {
            $(selector).find('input[type=checkbox]').addClass('validation-conflict');
            msg = + "\n Mindestens eine Antwortoption sollte als richtig markiert werden.";
        } else {
            $(selector).find('input[type=checkbox]').removeClass('validation-conflict');
        }

        if (String(msg).length === 0) {
            return msg;
        } else {
            console.log('Validation Error:' + msg);
            return msg;
        }
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
    }

}); // end class Annotation




Vi2.Metadata = inherit(/** @lends Vi2.Metadata# */
    {
        /** 
        *		@constructs 
        *		@param {object} options An object containing the parameters
        */
        __constructor: function (options) {
            this.metadata = vi2.db.getMetadataById(vi2.observer.current_stream);
            this.options = $.extend(this.options, options);
            this.update();
        },

        // defaults
        options: {
            selector: '.metadata',
            requiresMetatags: true,
            requiresDisplay: true
        },


        /** 
        * Updates all metadata
        */
        update: function () {
            if (this.options.requiresDisplay) {
                this.displayMetadata();
            }
            if (this.options.requiresMetatags) {
                this.buildMetaTags();
            }
        },


        /** 
        * Displays metadata to the given selector
        */
        displayMetadata: function () {
            //var html = new EJS({url: vi2.templatePath+'vi2.metadata.ejs'}).render( this.metadata );
            //$( this.options.selector ).html( html );
        },


        /** 
        * Append html meta tags to the DOM header in favour of SEO 
        */
        buildMetaTags: function () {
            $('head meta').each(function (i, val) { $(val).remove(); });
            $('head')
                .prepend('<meta content="text/html;charset=utf-8" http-equiv="Content-Type">')
                .prepend('<meta content="utf-8" http-equiv="encoding">')
                .prepend('<meta http-equiv="X-UA-Compatible" content="IE=Edge"/>')
                .prepend('<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />')
                .prepend('<meta itemprop="duration" content="' + this.metadata.length + '" />')
                .prepend('<meta itemprop="height" content="' + vi2.observer.player.height() + '" />')
                .prepend('<meta itemprop="width" content="' + vi2.observer.player.width() + '" />')
                .prepend('<meta itemprop="uploadDate" content="' + this.metadata.date + '" />')
                //.prepend('<meta itemprop="thumbnailUrl" content="'+vi2.page_url+'img/thumbnails/iwrm_'+vi2.observer.current_stream+'.jpg" />')
                .prepend('<meta itemprop="contentURL" content="' + vi2.db.getStreamById(vi2.observer.current_stream).video + '" />')
                //.prepend('<meta itemprop="embedURL" content="'+vi2.page_url+'#!'+vi2.observer.current_stream+'" />')
                ;
        }
    }); // end class


Vi2.VideoManager = inherit(/** @lends Vi2.VideoManager# */{ // 

	/** 
	*		@constructs 
	*		@param {object} options An object containing the parameters
	*/
    __constructor: function (options) {
        this.options = $.extend(this.options, options);
    },

    name: 'video-manager',
    type: 'collection',
    content_selector: '#content',
    options: {
        selector: '#seq'
    },
    viewing_history: [],

	/**
	* Define paths that the video manager is listing to. 
	*/
    init: function () {
        var _this = this;

        // define default get routes
        Sammy(this.options.selector, function () {

            this.get('#!/video/:stream/:time', function () {
                _this.handleNewStream(this.params);
            });

            this.get('#!/video/:stream', function () {
                _this.handleNewStream(this.params);
            });

            this.get('#!/videos/all', function () {
                _this.handleAllStreams();
            });

            this.get('#!/tags/:tag', function () {
                _this.handleTags(this.params);
            });

            this.get('#!/category/:category', function () {
                _this.handleCategory(this.params);
            });

        }).run();
    },


	/*
	* Interface for other widgets to define routes that will be handled on their own
	* @params path {String} Path under which the the given callback function should called. For instance http://example.com/#<my-path>. The '#' is set by default and should therefore be excluded.
	* @params callback {Object}
	* @params fn {Object}
	**/
    addRoute: function (path, callback, fn) {
        Sammy(this.options.selector, function () {
            this.get('#!' + path, function () {
                callback[fn]();
            });
        }).run();
    },


	/*
	* Calls the given template from the defined template path in order to render the given data.
	**/
    render: function (template, data) {
        return new EJS({ url: vi2.templatePath + '' + template }).render(data);
    },


	/**
	* This functions process a comma separated list of tags in order to identify the video streams that are related to these tags
	*/
    handleTags: function (params) {
        var tags = params.tag.split(/,/);
        var stream_names = '';
        var streams = [];
        var inverted = vi2.db.getInvertedTagIndex();

        for (var i = 0; i < tags.length; i++) {
            if (inverted[tags[i]] !== undefined) {
                stream_names += inverted[tags[i]].toString() + ',';
            }
        }
        var t = []; t = removeDuplicates(stream_names.split(/,/));
        for (var s = 0; s < t.length; s++) {
            if (t[s] !== '') {
                var str = vi2.db.getStreamById(t[s]);
                streams.push(str);
            }
        }
        // render it
        var html = this.render('vi2.video-manager.ejs', { title: 'Tags: ' + tags.toString(), items: streams });
        $(this.options.selector).html(html);
    },


	/**
	* This functions process a single given category 
	*/
    handleCategory: function (params) {
        var category = params.category;
        var streams = vi2.db.getStreamsByCategory(category);

        // render it
        var html = this.render('vi2.video-manager.ejs', { title: 'Category: ' + category, items: streams });
        $(this.options.selector).html(html);
    },


	/**
	* This functions processes all stream 
	*/
    handleAllStreams: function (params) {
        var streams = vi2.db.getAllStreams();
        // render it
        var html = this.render('vi2.video-manager.ejs', { title: 'Category: ' + category, items: streams });
        $(this.options.selector).html(html);
    },


	/**
	* Load a new video stream and naviagte to the give position in time.
	*/
    handleNewStream: function (params) {
        var _this = this;
        var seek = params.time === undefined ? 0 : params.time.split(/:/)[1];
        if (params.stream != vi2.observer.current_stream) {
            $(vi2.dom).empty();
            vi2.observer.setCurrentStream(params.stream, seek);
            vi2.observer.player.play();
            _this.loadWidgets();
        } else {
            vi2.observer.player.currentTime(seek);
        }
    },



	/**
	*
	*/
    loadWidgets: function () {

        // Define some annotation widgets
        var toc = new Vi2.TableOfContents({
            hasTimelineMarker: true,
            hasMenu: true,
            menuSelector: '.toc'
        });

        // Synchronize some presentation slides as 
        var syncMedia = new Vi2.SyncronizeMedia({
            selector: '.syncMedia',
            hasTimelineMarker: true,
            hasMenu: true,
            menuSelector: '.toc'
        });

        //var userNotes = new Vi2.UserNotes();

        // With these widgets we make use of the video database

        var relatedVideos = new Vi2.RelatedVideos({
            resultSelector: '.related-videos',
            criteria: [
                { criterion: 'random-destructor', weight: 0.1 },
                { criterion: 'same-author', weight: 0.8 },
                { criterion: 'same-tags', weight: 0.6 },
                { criterion: 'incomming-links', weight: 0.5 },
                { criterion: 'outgoing-links', weight: 0.5 }
            ]
        });
        //relatedVideos.init();

        var inVideoSearch = new Vi2.Search({
            resultSelector: '.search-results',
            limit: 25
        });
        //inVideoSearch.find('water basin');


        // add all the widgets
        vi2.observer.addWidget(toc);
        vi2.observer.addWidget(syncMedia);


        vi2.observer.addWidget(relatedVideos);
        //vi2.observer.addWidget( userNotes );
        //vi2.observer.addWidget( inVideoSearch );


    },







    /* buggy ... */
    listAllItems: function () {
        var template = $("#item_template").val();

        // list items of all categories		
        $.each(this.getCategoryTaxonomie(), function (i, cat_name) {
            // cat name
            $(_this.content_selector).append($("<h2></h2>").addClass('cat' + i).text(cat_name)).append('<br>');
            $.each(_this.json_data.stream, function (i, stream) {
                if (stream.metadata[0].category == cat_name) {
                    var item = $('<div></div>')
                        .setTemplate(template)
                        .processTemplate(stream)
                        .appendTo($(_this.content_selector));
                    //$('div.hyphenate').hyphenate({remoteloading:true,});//.css('color','red');
                    //$('.text').hidetext();						
                }
            });
        });

    }



}); // end class VideoManager	





Vi2.Maintain = inherit(/** @lends Maintain# */{
    /** @constructs 
    * 
    */
    __constructor: function () { },


	/**
	*
	*/
    validateTags: function () {
        var tax = [];
        $.each(this.json_data._taxonomy, function (i, stream) {
            $.each(stream.sub, function (i, val) {
                tax.push(val);//{first_level: this.id, second_level: this.sub});	
            });
            //tax.push(stream.id);
        });
        var tags = [];
        $.each(this.json_data._stream, function (i, val) {
            $.each(this.tags, function (i, tag) {
                tags.push(tag.tagname);
            });
        });

        $.each(tax, function (i, val) {
            if ($.inArray(val, tags) === -1) {
                $('#debug').append(val + ', ');
            }
        });

    },


	/*
	*
	**/
    validateTags2: function () {

        var tax = [];
        $.each(this.json_data._taxonomy, function (i, stream) {
            $.each(stream.sub, function (i, val) {
                tax.push(val);//{first_level: this.id, second_level: this.sub});	
            });
            tax.push(stream.id);
        });

        $.each(this.json_data._stream, function (i, val) {
            $('#debug').append('Not found in ' + val.id + ': ');
            $.each(this.tags, function (i, tag) {
                if ($.inArray(tag.tagname, tax) === -1) {
                    $('#debug').append(tag.tagname + ', ');
                }
            });
            $('#debug').append('<br/>');
        });

    },

    //
    validateLinks: function () {
        $.each(this.json_data._stream, function (i, val) {
            $('#debug').append('[' + val.id + '] ' + val.metadata[0].title + ' (' + val.metadata[0].author + '):<br/>');
            $.each(this.links, function (i, l) {
                $('#debug').append('"' + l.id + '" @ ' + l.start + ' => ' + l.text + '<br/>');
            });
            $('#debug').append('<br/>');
        });
    },


	/*

{"template":"basic","title":"New Project","guid":"E073E685-3ED6-4C5C-A210-A137894E4745","project":
{"targets":[{"id":8,"name":"Area1"},{"id":9,"name":"Area2"}],
"media":[{"id":"Media4","name":"Media41327357877524","url":"http://127.0.0.1:3033/static/videos/iwrm_cullmann.ogv","target":"main","
duration":178.378,"tracks":[

{"name":"Track1327357889581","id":"Track6","trackEvents":[

{"id":"TrackEvent128","type":"text","popcornOptions":{"start":3.5563294858342074,"end":12.915091290661069,"text":"hello","target":"Area2"},"track":"Track1327357889581","name":"Track1327357889591"}


]}]}]}}
	
	*/
    generateButter: function (id) {
        var _this = this;
        var video_url = vi2.db.getStreamById(id).video;
        // local file
        video_url = video_url.replace('http://141.46.8.101/beta/e2script/', 'http://127.0.0.1:3033/static/videos/');
        //video_url =  'http://127.0.0.1:3033' + video_url ;
        var butter = '{"template":"basic","title":"' + id + '","guid":"AA41AB3B-D145-477E-A264-3B42701F1E85", "project": {"targets":[{"id":0,"name":"Area1"},{"id":1,"name":"pop-container"}],"media":[ {"id":"Media0","name":"Media01327337635028","url":"' + video_url + '","target":"main","duration":4829.205,"tracks":[';
        var track0 = '',
            track1 = '',
            track2 = '',
            butter1 = '',
            butter2 = '',
            butter3 = '';

        // fetch slides
        $.each(vi2.db.getStreamById(id, true).slides, function (i, val) {
            //butter += '{"image":{"start": '+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1:3033/static/slides/'+id+'/'+this.img+'", "text":"", "target":"image-container", "link":{}, "id":"'+this.img.replace(/.jpg/, '')+'"}},'
            if (i % 2 === 0) {
                butter1 += '{"id":"TrackEvent' + i + '","type":"image","popcornOptions": {"start":' + this.starttime + ',"end":' + (Number(this.starttime) + Number(this.duration)) + ',"href":"","src":"http://127.0.0.1:3033/static/slides/' + this.img + '","text":"","target":"Area1"}, "track":"Track1327337639244","name":"Track1327337639' + Math.ceil(Math.random() * 1000) + '"},';
            } else {
                butter2 += '{"id":"TrackEvent' + i + '","type":"image","popcornOptions": {"start":' + this.starttime + ',"end":' + (Number(this.starttime) + Number(this.duration)) + ',"href":"","src":"http://127.0.0.1:3033/static/slides/' + this.img + '","text":"","target":"Area1"}, "track":"Track1327337639255","name":"Track1327337639' + Math.ceil(Math.random() * 1000) + '"},';
            }
        });

        // fetch hyperlinks 
		/*$.each(vi2.db.getStreamById(id).links, function(i, val){
			butter3 += '{"id":"TrackEventA'+i+'","type":"pop","popcornOptions":{"start":'+Number(_this.deci2seconds(this.start))+',"end":'+(Number(_this.deci2seconds(this.start))+Number(this.duration))+',"exit":"2.5","text":"'+this.id+'", "link":"'+this.text+'","target":"pop-container", "left":"'+this.x+'%", "top":"'+this.y+'%"},"track":"Track1327357889566","name":"Track1327357889'+Math.ceil(Math.random()*1000)+'"},';		
		});*/
        track0 = '{"name":"Track1327337639244","id":"Track0", "trackEvents":[' + butter1.substr(0, butter1.length - 1) + ']},';
        track1 = '{"name":"Track1327337639255","id":"Track1", "trackEvents":[' + butter2.substr(0, butter2.length - 1) + ']}';
        //track2 = '{"name":"Track1327357889566","id":"Track2", "trackEvents":['+butter3.substr(0, butter3.length -1)+']}';

        butter += track0 + track1 + ']}]}}';
        console.log('-------------------------------');
        console.log(butter);
        console.log('-------------------------------');
        //$('#debug').html(butter);
        //this.json_import();
        //this.test();

        /* 
{
"type": "seq",
"id": "",
"img": "video1/e2script_1-27.jpg",
"starttime": "2767.3",
"duration": 22.2
}*/
    },


    foo: function () {

        var u = [{ "id": "TrackEvent14", "type": "image", "popcornOptions": { "start": 54.7, "end": 93.6, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-1.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639593" }, { "id": "TrackEvent15", "type": "image", "popcornOptions": { "start": 125, "end": 289.3, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-3.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639694" }, { "id": "TrackEvent16", "type": "image", "popcornOptions": { "start": 668.1212462686567, "end": 945.8177313432838, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-5.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track132733763969" }, { "id": "TrackEvent17", "type": "image", "popcornOptions": { "start": 1121.7838208955225, "end": 1314.2467313432835, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-7.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639407" }, { "id": "TrackEvent18", "type": "image", "popcornOptions": { "start": 1366.4866641791045, "end": 1399.4803059701492, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-9.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track132733763919" }, { "id": "TrackEvent19", "type": "image", "popcornOptions": { "start": 1422.850802238806, "end": 1481.9644104477613, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-11.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639276" }, { "id": "TrackEvent20", "type": "image", "popcornOptions": { "start": 1744.5388097014925, "end": 1884.761787313433, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-13.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track132733763973" }, { "id": "TrackEvent21", "type": "image", "popcornOptions": { "start": 1916.380694029851, "end": 1997.490063432836, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-15.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639397" }, { "id": "TrackEvent22", "type": "image", "popcornOptions": { "start": 2084.0983731343285, "end": 2195.4519141791047, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-17.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639135" }, { "id": "TrackEvent23", "type": "image", "popcornOptions": { "start": 2354.921182835821, "end": 2386.540089552239, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-19.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639731" }, { "id": "TrackEvent24", "type": "image", "popcornOptions": { "start": 2510.266246268657, "end": 2536.3862126865674, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-21.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639377" }, { "id": "TrackEvent25", "type": "image", "popcornOptions": { "start": 2565.2556492537315, "end": 2603.748231343284, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-23.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639255", "name": "Track1327337639206" }, { "id": "TrackEvent0", "type": "image", "popcornOptions": { "start": 0, "end": 54.7, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-0.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639838" }, { "id": "TrackEvent1", "type": "image", "popcornOptions": { "start": 93.6, "end": 125, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-2.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639534" }, { "id": "TrackEvent2", "type": "image", "popcornOptions": { "start": 288.69436567164183, "end": 668.1212462686567, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-4.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639491" }, { "id": "TrackEvent3", "type": "image", "popcornOptions": { "start": 944.4429962686568, "end": 1121.7838208955225, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-6.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639782" }, { "id": "TrackEvent4", "type": "image", "popcornOptions": { "start": 1311.49726119403, "end": 1366.4866641791045, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-8.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639702" }, { "id": "TrackEvent5", "type": "image", "popcornOptions": { "start": 1399.4803059701492, "end": 1422.850802238806, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-10.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639931" }, { "id": "TrackEvent6", "type": "image", "popcornOptions": { "start": 1479.2149402985076, "end": 1743.1640746268658, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-12.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639523" }, { "id": "TrackEvent7", "type": "image", "popcornOptions": { "start": 1879.2628470149255, "end": 1916.380694029851, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-14.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639797" }, { "id": "TrackEvent8", "type": "image", "popcornOptions": { "start": 2000.2395335820895, "end": 2084.0983731343285, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-16.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639833" }, { "id": "TrackEvent9", "type": "image", "popcornOptions": { "start": 2191.327708955224, "end": 2353.546447761194, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-18.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639154" }, { "id": "TrackEvent10", "type": "image", "popcornOptions": { "start": 2385.165354477612, "end": 2510.266246268657, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-20.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639866" }, { "id": "TrackEvent11", "type": "image", "popcornOptions": { "start": 2537.760947761194, "end": 2562.5061791044777, "href": "", "src": "http://127.0.0.1:3033/static/slides/video5/e2script_5-22.jpg", "text": "", "target": "Area1" }, "track": "Track1327337639244", "name": "Track1327337639376" }];

        var ss = '';
        for (var i = 0; i < u.length; i++) {
            ss += '{ "id":"slide' + i + '", "type":"seq", "img":"' + u[i].popcornOptions.src.replace('http://127.0.0.1:3033/static/slides/', '') + '", "starttime":' + u[i].popcornOptions.start + ', "duration":' + (Number(u[i].popcornOptions.end) - Number(u[i].popcornOptions.start)) + ' },';
        }
        console.log(ss);
    },

    //
	/*
	Imports popcorn json into vi-two data/slides
	*/
    json_import: function () {
        var _this = this;
        var lectures = '';
        var images = '';
        $.ajax({
            type: "POST",
            dataType: "json",
            url: './data_slide_update.json',
            success: function (lec) {

                $.each(lec.data, function (i, val) {
                    images = '';//val.title+"\n";	

                    $.each(val.project.media, function (ii, media) {
                        $.each(media.tracks, function (i, track) {
                            $.each(track.trackEvents, function (i, img) {
                                if (img.type === 'image') {
                                    images += '{ "type":"seq", "starttime":' + img.popcornOptions.start + ', "duration":' + (img.popcornOptions.end - img.popcornOptions.start) + ', "id":"", "img":"' + String(img.popcornOptions.src).replace("http://elearning.ihi-zittau.de/beta/iwrm/slides/" + val.title + "/", "") + '" },';
                                } else if (img.type === 'pop') {
                                    images += '#x: ' + img.popcornOptions.left + '  #y: ' + img.popcornOptions.top + '  #start: ' + _this.seconds2deci(img.popcornOptions.start) + '  #dur: ' + (img.popcornOptions.end - img.popcornOptions.start) + '  #text: ' + img.popcornOptions.text + '  #target: ' + img.popcornOptions.link;
                                    images += "\n";
                                }
                            });
                        });
                    });
                    lectures += '\n { "id": "' + val.title + '", "slides":[' + images.substr(0, images.length - 1) + ']},\n';
                });

                var jsoon = '';
                jsoon += '{ "_name": "vi2 slides", "_slides": [\n';
                jsoon += lectures.substr(0, lectures.length - 1);
                jsoon += '\n]}';

                $('#debug').html(jsoon);
            },
            error: function (e, msg, x) { alert('error at json import ' + msg); }
        });
    },

    //
    seconds2deci: function (s) {
        var date = new Date(Math.ceil(s * 1000));
        return (date.getHours() - 1) + ':' + date.getMinutes() + ':' + date.getSeconds();
    },

	/*
	aim: search for broken images
	output: a string into debug textarea
	usage: copy the string into a bash script (e.g. script.sh) and run it inside the slides-folder: sh ./script.sh 
	*/
    validateImages: function () {
        var err = "#!/bin/bash \n";
        var img = new Image();

        $.each(this.json_slide_data._slides, function (i, lecture) {
            var id = lecture.id;
            err += 'mkdir ' + lecture.id;
            $.each(lecture.slides, function (j, img) {
                err += 'cp ./' + id + '/' + img.img + ' /' + lecture.id + ' ;';
                //err += 'test -e ./'+id+'/'+img.img+' || echo "bad: '+img.img+'"; ';

            });

        });
        $('#debug').html(err);
    },

    test: function () {
        var dataString = 'cullmann';
        if (dataString) {

            var butter = '{"template":"basic","title":"' + dataString + '","guid":"AA41AB3B-D145-477E-A264-3B42701F1E85", "project": {"targets":[{"id":0,"name":"Area1"},{"id":1,"name":"pop-container"}],"media":[ {"id":"Media0","name":"Media01327337635028","url":"http://127.0.0.1:3033/static/videos/iwrm_' + dataString + '.ogv","target":"main","duration":4829.205,"tracks":[';
            var track0 = '',
                track1 = '',
                track2 = '',
                butter1 = '',
                butter2 = '',
                //bam = '',
                butter3 = '';
            // 		
            $.ajax({
                type: "POST",
                dataType: "json",
                url: 'http://127.0.0.1:3033/static/data-slides.json',
                success: function (data) {
                    $.each(data._slides, function (j, val) {
                        //bam += '<option value="'+val.id+'">'+val.id+'</option>'
                        if (val.id == dataString) {
                            // fetch slides
                            $.each(val.slides, function (i, val) {
                                if (i % 2 === 0) {
                                    butter1 += '{"id":"TrackEvent' + i + '","type":"image","popcornOptions": {"start":' + this.starttime + ',"end":' + (this.starttime + this.duration) + ',"href":"","src":"http://127.0.0.1:3033/static/slides/' + dataString + '/' + this.img + '","text":"","target":"Area1"}, "track":"Track1327337639244","name":"Track1327337639' + Math.ceil(Math.random() * 1000) + '"},';
                                } else {
                                    butter2 += '{"id":"TrackEvent' + i + '","type":"image","popcornOptions": {"start":' + this.starttime + ',"end":' + (this.starttime + this.duration) + ',"href":"","src":"http://127.0.0.1:3033/static/slides/' + dataString + '/' + this.img + '","text":"","target":"Area1"}, "track":"Track1327337639255","name":"Track1327337639' + Math.ceil(Math.random() * 1000) + '"},';
                                }
                            });
                        }
                    });
                    //alert(bam);
                    // fetch hyperlinks 
                    /*$.each(this.getStreamById(id).links, function(i, val){
                        butter3 += '{"id":"TrackEventA'+i+'","type":"pop","popcornOptions":{"start":'+Number(_this.deci2seconds(this.start))+',"end":'+(Number(_this.deci2seconds(this.start))+Number(this.duration))+',"exit":"2.5","text":"'+this.id+'", "link":"'+this.text+'","target":"pop-container", "left":"'+this.x+'%", "top":"'+this.y+'%"},"track":"Track1327357889566","name":"Track1327357889'+Math.ceil(Math.random()*1000)+'"},';		
                    });*/
                    track0 = '{"name":"Track1327337639244","id":"Track0", "trackEvents":[' + butter1.substr(0, butter1.length - 1) + ']},';
                    track1 = '{"name":"Track1327337639255","id":"Track1", "trackEvents":[' + butter2.substr(0, butter2.length - 1) + ']}';
                    //track2 = '{"name":"Track1327357889566","id":"Track2", "trackEvents":['+butter3.substr(0, butter3.length -1)+']}';

                    butter += track0 + track1 + track2 + ']}]}}';

                    $('#debug').html(butter);
                    //var data = JSON.parse( butter );
                    //popupManager.hidePopups();
                    //pm.importProject( data, document.getElementById( 'timeline-media-input-box' ).value );
                },
                error: function (e) { alert('error at json import'); }
            });
        }

    },

    /* D3 Viz */
    chord: function () {
        var _this = this;
        var out = '';
        var links = '';

        $.ajax({
            type: "POST",
            dataType: "json",
            url: './data.json',
            success: function (res) {
                $.each(res._stream, function (i, val) {
                    links = '';
                    $.each(val.links, function (ii, vall) {
                        var cat = String(_this.getStreamById(val.id).metadata[0].category).replace(/\ /g, '').replace(/\_/g, '').replace(/\-/g, '').toLowerCase();
                        links += '"flare.' + cat + '.' + vall.text + '.x",';
                    });

                    out += '{"name":"flare.' + String(this.metadata[0].category).replace(/\ /g, '').replace(/\_/g, '').replace(/\-/g, '').toLowerCase() + '.' + val.id + '.x","size":1699,"imports":[' + links.slice(0, links.length - 1) + ']},';
                });
                $('#debug').html(out.slice(0, out.length - 1));
            }
        });





    }

});


