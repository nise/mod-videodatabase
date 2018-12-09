/**
 * Javascript Video for the Moodle videodatabase
 * 
 * This component arranges the video player.
 * 
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Video
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 */

define([
    'amd/src/lib/vue.js',
    'js/vi2.main.js',
    'amd/src/components/Ratings.js',
    'amd/src/components/Utils.js'
], function (Vue, Vi2, Ratings, Utils) {

    function Video(store, course, user, token) {
        this.store = store;
        this.course = course;
        this.user = user;

        var utils = new Utils();
        this.rating = new Ratings(store, course, user).ratings;

        this.modal = Vue.component('modal', {
            template: '#modal-template'
        });

        var _this = this;

        this.video = {
            template: '#app-video-template',//'<div>Video {{ $route.params.id }}: {{ video.title }}</div>', 
            data: function () {
                return {
                    vi2_player_id: 'vi2-1',
                    video_selector: 'seq',
                    video_overlay_selector: 'overlay',
                    current_video: -1,
                    showAnnotationForm: false,
                    annotationContent: '',
                    annotationTime: '',
                    showModal: false// not used
                };
            },
            computed: {
                video: function () {
                    var id = this.$route.params.id;
                    store.commit('setCurrentVideo', this.$route.params.id);
                    var video_data = store.getters.videoById(id);
                    if (video_data !== undefined) {
                        video_data.metadata = [];
                        video_data.metadata[0] = {};
                        video_data.metadata[0].author = video_data['contributor'];
                        video_data.metadata[0].title = video_data['title'];
                        video_data.metadata[0].abstract = video_data['description'];
                        video_data.metadata[0].thumbnail = "";//"still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                        video_data.video = video_data.filename;//'/videos/' + video_data.filename.replace('.mp4', '.mp4');
                        return video_data;//store.getters.videoById( this.$route.params.id );
                    } else {
                        return null;
                    }
                }
            },
            mounted: function () {

                var id = this.$route.params.id || 1;
                
                this.current_video = id;
                
                var video_data = store.getters.videoById(id);
                console.log(video_data.filename)
                if (video_data !== undefined) {
                    video_data.metadata = [];
                    video_data.metadata[0] = {};
                    video_data.metadata[0].author = video_data.contributor;
                    video_data.metadata[0].title = video_data.title;
                    video_data.metadata[0].abstract = video_data.description;
                    video_data.metadata[0].thumbnail = "";//"still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                    video_data.video = video_data.filename;//'/videos/' + video_data.filename.replace('.mp4', '.mp4'); // xxx bug?
                    Vi2.start(video_data, user, token, _this.course.id, id);
                } else {
                    console.log('mounted undefined');
                }
            },
            updated: function () {
               
                var id = this.$route.params.id || 1;
                
                if (this.current_video !== id) {
                    this.current_video = id;
                    var video_data = store.getters.videoById(id);
                    //this.$refs.childRating.setRate(video_data.rating);
                    if (video_data !== undefined) {
                        video_data.metadata = [];
                        video_data.metadata[0] = {};
                        video_data.metadata[0].author = video_data['contributor'];
                        video_data.metadata[0].title = video_data['title'];
                        video_data.metadata[0].abstract = video_data['description'];
                        video_data.metadata[0].thumbnail = '';//"still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                        video_data.video = video_data.filename;//'/videos/' + video_data.filename.replace('.mp4', '.mp4');
                        Vi2.update(video_data, _this.course.id, id);
                    }
                }
            },
            methods: {
                toggle: function () {
                    this.showAnnotationForm = !this.showAnnotationForm;
                    if (this.showAnnotationForm){
                        this.pause();
                        this.annotationTime = Vi2.getObserver().player.currentTime().toFixed(1);
                    }
                },
                saveAnnotation: function () {
                    var _this = this;
                    utils.get_ws('annotations', {
                        'userid': user.username,
                        'videoid': this.$route.params.id,
                        'courseid': course.id,
                        'content': this.annotationContent,
                        'playbacktime': this.annotationTime,
                        'created': new Date().getTime(),
                        'updated': new Date().getTime(),
                        'operation':'save'
                    }, function (e) {
                        _this.play();
                        Vi2.updateAnnotations('comments');
                        _this.showAnnotationForm = false;
                    });
                },
                removeAnnotation: function (id, video) {
                    utils.get_ws('annotations', {
                        courseid: course.id,
                        id: id,
                        videoid: video,
                        operation: 'remove'
                    }, function (msg) {
                        try {
                            var d = JSON.parse(msg.data);
                            Vi2.updateAnnotations('comments');
                        } catch (e) {
                            console.log('Could not parse comments from database after remove');
                            console.log(msg);
                        }
                    });
                },
                cancelAnnotation: function(){
                    this.showAnnotationForm = false;
                    this.play();
                },
                play:function(){
                    Vi2.getObserver().player.play();
                },
                pause: function () {
                    Vi2.getObserver().player.pause();
                },
                destroy: function(){
                    Vi2.getObserver().player.pause();
                    // xxx more things need to be done
                }
            },
            components: {
                'rating': this.rating,
                'modal-template': this.modal
            }
        };
    }

    return Video;
});   