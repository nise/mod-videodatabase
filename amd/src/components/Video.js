/**
 * Javascript Video for the Moodle videodatabase
 * 
 * The component takes user ratings for a video and calculated the Wilson coefficient by considering the previous positive and negative ratings. A user is only allowed to vote once on a video.
 * 
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Video
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 * 
 * 
 */

define([
    'jquery',
    '/moodle/mod/videodatabase/amd/src/lib/vue.js',
    '/moodle/mod/videodatabase/js/vi2.main.js',
    '/moodle/mod/videodatabase/amd/src/components/Ratings.js'
], function ($, Vue, Vi2, Ratings) {
    

    function Video(store, course, user) {
        this.store = store;
        this.course = course;
        this.user = user;
        
        this.rating = new Ratings(store, course, user).ratings;

        this.video = {
            template: '#app-video-template',//'<div>Video {{ $route.params.id }}: {{ video.title }}</div>', 
            data: function () {
                return {
                    vi2_player_id: 'vi2-1',
                    video_selector: 'seq',
                    video_overlay_selector: 'overlay'
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
                        video_data.metadata[0].thumbnail = "still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                        video_data.video = '/videos/' + video_data.filename.replace('.mp4', '.webm');
                        return video_data;//store.getters.videoById( this.$route.params.id );
                    } else {
                        //return null;
                    }
                }
            },
            updated: function () {
                var id = this.$route.params.id;
                if (id === undefined) {
                    id = 1;
                }
                var video_data = store.getters.videoById(id);
                //this.$refs.childRating.setRate(video_data.rating);
                if (video_data !== undefined) {
                    video_data.metadata = [];
                    video_data.metadata[0] = {};
                    video_data.metadata[0].author = video_data['contributor'];
                    video_data.metadata[0].title = video_data['title'];
                    video_data.metadata[0].abstract = video_data['description'];
                    video_data.metadata[0].thumbnail = "still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                    video_data.video = '/videos/' + video_data.filename.replace('.mp4', '.webm');
                    Vi2.update(video_data);
                }
                //return video_data;    
            },
            mounted: function () {
                var id = this.$route.params.id;
                if (id === undefined) {
                    id = 1;
                }
                var video_data = store.getters.videoById(id);

                if (video_data !== undefined) {
                    video_data.metadata = [];
                    video_data.metadata[0] = {};
                    video_data.metadata[0].author = video_data.contributor;
                    video_data.metadata[0].title = video_data.title;
                    video_data.metadata[0].abstract = video_data.description;
                    video_data.metadata[0].thumbnail = "still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                    video_data.video = '/videos/' + video_data.filename.replace('.mp4', '.webm'); // xxx bug?
                    Vi2.start(video_data, user);
                }
            },
            methods: {
                onAfterRate: function (rate) {
                    //store.commit('setCurrentVideoRating', rate);
                }
            },
            components: {
                'rating': this.rating
            }
        };
    }

    return Video;
});   