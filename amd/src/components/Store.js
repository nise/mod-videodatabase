/**
 * Javascript store for the Moodle videodatabase
 *
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Store
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      3.1
 */
define([
    'amd/src/lib/vue.js',
    'amd/src/lib/vuex.js'
],
    function (
        Vue,
        Vuex
    ) {

        function Store(data, course) {
            this.data = data;
            this.course = course;
            Vue.use(Vuex);
            // see best practice: id as keys: https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143/2
            // init vue store
            this.store = new Vuex.Store({
                strict: this.NODE_ENV !== 'production',
                state: {
                    myValue: 0,
                    videos: this.data,
                    newvideo: {
                        title: 'hello world',
                        description: '12345678',
                        tags: 'tag',
                        filename: 'video.mp4',
                        mimetype: '',
                        format: '',
                        size: '',
                        length: '',
                        courseid: this.course.id
                    },
                    mouse: {},
                    showForm: false,
                    formDataModel: {},
                    currentVideo: 0,
                    progresstranscode: 0,
                    progressanimation: 0,
                    progressthumbnail: 0,
                    progresspreview: 0
                },
                getters: {
                    videos(state) {
                        return function () {
                            return state.videos;
                        };
                    },
                    progresstranscode(state) {
                        return function () { return state.progresstranscode; };
                    },
                    progressanimation(state) {
                        return function () { return state.progressanimation; };
                    },
                    progressthumbnail(state) {
                        return function () { return state.progressthumbnail; };
                    },
                    progresspreview(state) {
                        return function () { return state.progresspreview; };
                    },
                    newvideo(state) {
                        return function () { return state.newvideo; };
                    },
                    videoById(state) {
                        var self = this;
                        return function (id) {
                            if (state.videos[id] !== undefined && id !== undefined) {
                                return state.videos[id];
                            } else {
                                console.log('id missing ' + id)
                            }
                        };
                    },
                    isVideo(state) {
                        var self = this;
                        return function (id) {
                            if (state.videos[id] !== undefined && id !== undefined) {
                                return true;
                            } else {
                                return false;
                            }
                        };
                    },
                    currentVideoData(state) {
                        var self = this;
                        return function () {
                            return state.videos[state.currentVideo];
                        };
                    }
                },
                mutations: {
                    addVideo(state, video) {
                        state.videos[video.id] = video;
                    },
                    updateVideos(state, videos){
                        // add new videos
                        for (var v in videos) {
                            if (state.videos[v] === undefined){ console.log(videos[v])
                                state.videos[v] = videos[v];
                            }
                        }
                        var ids = Object.values(state.videos);
                        // remove deleted videos from store
                        for(var v in state.videos){ 
                            if(ids.indexOf(v) === -1){
                                state.videos[v] = null;
                                delete state.videos[v];
                            }
                        }
                    },
                    removeVideo(state, video_id) {
                        //var index = state.videos.indexOf(video_id);
                        //delete state.videos[video_id];
                        state.videos[video_id] = null;
                        delete state.videos[video_id];
                        //console.log(state.videos);
                        //state.videos.splice(video_id, 1); //alert(0);
                    },
                    getFormDataModel() {

                    },
                    progresstranscode(state, p) {
                        p = typeof (p) === 'number' ? p : 0;
                        state.progresstranscode = p;
                    },
                    progressanimation(state, p) {
                        p = typeof (p) === 'number' ? p : 0;
                        state.progressanimation = p;
                    },
                    progressthumbnail(state, p) {
                        p = typeof (p) === 'number' ? p : 0;
                        state.progressthumbnail = p;
                    },
                    progresspreview(state, p) {
                        p = typeof (p) === 'number' ? p : 0;
                        state.progresspreview = p;
                    },
                    setCurrentVideo(state, id) {
                        state.currentVideo = id;
                    },
                    setCurrentVideoRating(state, rating) {
                        state.videos[state.currentVideo].rating = rating;
                    },
                    setVideoFileData(state, data) {
                        console.log(data);
                        if (data.isNewVideo) {
                            state.newvideo.mimetype = data.files.type;
                            state.newvideo.format = data.files.name.split('.')[1];
                            state.newvideo.size = data.files.size;
                            state.newvideo.length = data.files.duration;
                            state.newvideo.filename = data.files.name; //BASE_URL + 'test2/' +
                        } else {
                            state.videos[state.currentVideo].mimetype = data.files.type;
                            state.videos[state.currentVideo].size = data.files.size;
                            state.videos[state.currentVideo].filename = data.files.name; //BASE_URL + 'test2/' +
                        }
                    }
                }
            });
            //this.$set('contacts[' + newPsgId + ']', newObj)
            //Vue.set(this.contacts[newPsgId], 'name', this.editPsgName); 
            //console.log(store.state.videos[165].title);
            //store.commit('increment', 10);
            // console.log(store.getters.videoById(165));
            //store.commit('getFormDataModel');
        }
        return Store;
    }
);