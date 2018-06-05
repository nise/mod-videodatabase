/* 
*	name: Vi2.Comments
*	author: niels.seidel@nise81.com
*   license: MIT License
*	description: 
*	todo:
	- re-comments could be sorted desc by date. Solution needed
	- threaded comments
    - highlight comment while playing
    - add emoticons
    - handle @user keywords
*/


define(['jquery', 'js/vi2.core.utils.js', 'js/moment-with-locales.min.js'], function ($, Utils, moment) {
    var
        vi2 = window.vi2 || {},
        Vi2 = window.Vi2 || {}
        ;
    /** 
    *		@constructs 
    *		@param {object} options An object containing the parameters
    */
    function Comments(options) {
        this.options = Object.assign(this.options, options);
    }

    // instantiate utils
    var utils = new Utils();

    Comments.prototype = {
        name: 'comments',
        type: 'annotation',
        options: {
            hasTimelineMarker: true,
            hasMenu: true,
            menuSelector: '#comments',
            allowEmoticons: false,
            allowReplies: true,
            allowEditing: true,
            allowCreation: true,
            timelineSelector: '.vi2-timeline-bottom',
            path: '/'//,
            //annotation_service_url: {},
            //annotation_service_params: { data: { videoid: 3, courseid: 2 } }
        },

        /* ... */
        init: function (ann) { 
            if (ann === null) {
                ann = {};
            }
            var _this = this;
            var events = [];
            
            this.options.annotation_service_params.data.videoid = parseInt(localStorage.getItem('videoid'), 10);

            $.ajax({
                method: 'POST',
                url: this.options.annotation_service_url,
                data: this.options.annotation_service_params,
                dataType: "json"
            })
                .done(function (msg) {
                    try {
                        var d = JSON.parse(msg.data); 
                        var data = Object.keys(d).map(function(o){ return d[o]; }); 
                        
                        for (var i in data) {
                            if (data.hasOwnProperty(i)) {
                                if (data[i].type === 'comment') { 
                                    events.push({
                                        name: data[i].content,
                                        occ: [data[i].start],
                                        time: [data[i].start],
                                        date: data[i].updated,
                                        author: data[i].author
                                    });
                                }
                            }
                        }
                        // show comments in a menu
                        if (_this.options.hasMenu) {
                            _this.createMenu(events);
                        }

                        // map events on the timeline
                        if (_this.options.hasTimelineMarker) {
                            vi2.observer.player.timeline.addTimelineMarkers('comments', events, _this.options.timelineSelector);
                        }

                        if(_this.options.allowCreation){
                            _this.addComment();
                        }
                        
                    } catch (e) {
                        console.log('Could not parse comments from database');
                        console.log(msg);
                    }
                })
                .fail(function (msg) {
                    console.log(msg);
                }); 
        },

        /**
         * 
         */
        addComment: function(){
            var _this = this;
            //$('#video1').click(function(){
              //  console.log(_this.createAnnotationForm());
            //});
        },


        /*
        *
        **/
        createMenu: function (commentData) {
            var _this = this;
            var tmp_t = -1;

            var comments = $('<ul></ul>')
                .addClass('comments-list');
            $(this.options.menuSelector).html(comments);

            commentData = commentData.sort(function (a, b) {
                return Number(a.time) > Number(b.time) ? 1 : -1;
            });
            moment.locale('de');
            $.each(commentData, function (i, val) {

                var a = $('<a></a>')
                    .text(val.name)
                    .addClass('id-' + val.time + ' comments-menu-question')
                    //.attr('href', '#'+vi2.options.id)
                    .click(function () {
                        console.log(vi2.observer.player.currentTime())
                        vi2.observer.player.currentTime(val.time[0]);
                        vi2.observer.log({ context: 'comments', action: 'menu-click', values: [val.name, val.author, val.time[0]] });
                    })
                    ;

                if (_this.options.allowEmoticons) {
                    a.emoticonize({ /* delay: 800, animate: false, exclude: 'pre, code, .no-emoticons' */ });
                }


                var user = { name: 'Max Muster' };//vi2.db.getUserById(val.author);

                var header = $('<span></span>')
                    .addClass('comments-header');

                $('<span></span>')
                    //.text( user.firstname +' '+user.name )
                    .text(user.username)
                    .addClass('comments-user')
                    .appendTo(header)
                    ;
                header.append(' ' + moment(Number(val.date), "x").fromNow());

                var li = $('<li></li>')
                    .addClass('list-item')
                    .addClass('t' + val.time)
                    .attr('author', val.author)
                    .attr('date', 'd' + val.date)
                    .attr('id', 't' + utils.formatTime(val.time, '-'))
                    .html(header)
                    .append(a)
                    .appendTo(comments)
                    ;

                if (Number(val.time) === Number(tmp_t)) {
                    li.css({ 'margin-left': '15px' });
                    // re-comments could be sorted desc by date. Solution needed
                    //comments.find('.t'+val.time).tsort({ attr:"date", order:'asc'}); 
                }

                // edit
                if (_this.options.allowEditing && Number(val.author) === Number(vi2.wp_user)) {
                    var edit_btn = $('<a></a>')
                        .addClass('tiny-edit-btn fa fa-pencil')
                        .attr('data-toggle', "modal")
                        .attr('data-target', "#myModal")
                        .attr('data-annotationtype', 'comments')
                        .data('annotationdata', {
                            content: val.name,
                            time: val.time,
                            date: val.date,
                            author: val.author
                        })
                        .appendTo(header)
                        ;
                }
                // re-comments
                if (_this.options.allowReplies) {
                    var reply_btn = $('<a></a>')
                        .addClass('tiny-edit-btn fa fa-arrow-right')
                        .attr('data-toggle', "modal")
                        .attr('data-target', "#myModal")
                        .attr('data-annotationtype', 'comments')
                        .data('annotationdata', { content: '', time: val.time, date: (new Date().getTime()) })
                        .appendTo(header)
                        ;
                }

                tmp_t = val.time;
            }); // end each
        },

        /* -- */
        //<div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
        //
        appendToDOM: function (id) {
            /*
                var _this = this;
                $(vi2.dom).find('[type="comments"]').each(function (i, val) { $(this).remove(); });
                $.each(vi2.db.getCommentsById(id), function (i, val) {
                    var comm = $('<div></div>')
                        .attr('type', "comments")
                        .attr('starttime', val.start)
                        .attr('duration', 10)
                        .attr('author', val.author)
                        .attr('date', val.date)
                        .text(decodeURIComponent(val.comment))
                        .appendTo(vi2.dom)
                        ;
                });
                */
        },



        /*
        **/
        updateDOMElement: function (obj) {
            $(vi2.dom)
                .find('[date="' + obj.date + '"]')
                .attr('author', vi2.wp_user)
                .attr('date', obj.date)  // its the creation date
                .attr('starttime', obj.time)
                .text(obj.content);
        },

        /*
        * { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
        **/
        addDOMElement: function (obj) { 
            $('<div></div>')
                .attr('type', obj.type)
                .attr('author', vi2.wp_user)
                .attr('date', new Date().getTime())
                .attr('starttime', obj.time)
                .text(obj.content)
                .appendTo(vi2.dom);
        },

        /*
         *
         **/
        begin: function (e, id, obj) {

            // reset highlight
            $(this.options.menuSelector + ' li').each(function (i, val) {
                $(this).removeClass('vi2-highlight');
            });
            // highlight comment entry
            $(this.options.menuSelector + ' li.t' + obj.displayPosition.t1).addClass('vi2-highlight');

        },

        /*
         **/
        end: function (e, id) {
            $(this.options.menuSelector + ' li ').removeClass('vi2-highlight');
        },


        /*
        *
        **/
        createAnnotationForm: function (data) {
            /*jshint multistr: true */
            var str = "\
			<textarea name='comments-entry' data-datatype='string' placeholder='' aria-describedby='comments-form1'>"+data.content+"</textarea>\
			<br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='comments-form1'>Zeitpunkt (s)</span>\
				<input type='text' class='form-control' value='"+ vi2.observer.player.currentTime()+"' name='comments-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='comments-form1'>\
			</div>\
			";
            if (data) {
                return ejs.render(str, data);
            } else {
                return ejs.render(str, {
                    content: '',
                    time: vi2.observer.player.currentTime(),
                    date: (new Date().getTime()),
                    author: vi2.wp_user
                });
            }
        },


        /*
        *
        **/
        getAnnotationFormData: function (selector) {
            var obj = {};
            obj.content = $(selector).find('[name="comments-entry"]').val();
            obj.time = $(selector).find('[name="comments-entry-time"]').attr('value');
            return obj;
        }
    };

    return Comments;
}); 