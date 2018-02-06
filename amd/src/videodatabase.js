/**
 * Javascript controller for Vue.js and Vi-Two
 *
 * @module     mod_videodatabase/filters
 * @package    mod_videodatabase
 * @class      Videodatabase
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      3.1
 * https://unpkg.com/vue
 * http://localhost/moodle/mod/videodatabase/
 * https://unpkg.com/vue-router/dist/vue-router.js
 * 
 */
define([
    'jquery',
    'core/log',
    'core/ajax',
    '/moodle/mod/videodatabase/amd/src/vue.js',
    '/moodle/mod/videodatabase/amd/src/vue-router.js',
    '/moodle/mod/videodatabase/amd/src/vuex.js',
    //'/moodle/mod/videodatabase/amd/src/vue-uniq-ids.min.js',
    '/moodle/mod/videodatabase/amd/src/vfg.js',
    '/moodle/mod/videodatabase/amd/src/axios.min.js',

    '/moodle/mod/videodatabase/amd/src/datamodel.js',

    //'/moodle/mod/videodatabase/amd/src/dropzone.js',
    //'/moodle/mod/videodatabase/amd/src/vue2Dropzone.js',
   // '/moodle/mod/videodatabase/amd/src/vuejs-paginator.js',
    //'js/vi-two-lib.js',
    'js/vi2.main.js'
],
    function (
        $,
        log,
        ajax,
        Vue,
        VueRouter,
        Vuex,
        // VueUniqIds,
        VueFormGenerator,
        Axios,

        Datamodel,

        // dropzone, 
        //  Vue2Dropzone,
       // VuePaginator,
        //  Vi2Lib, 
        Vi2
    ) {

        var Filters = function () { };

        var datamodel = new Datamodel();


        /**
         * Obtains data from a moodle webservice
         * @param {*} ws: Name of the web service 
         * @param {*} method: GET or POST 
         * @param {*} params: Parameter to transfer 
         * @param {*} cb: Callback function 
         */
        function get_ws(ws, method, params, cb) {
            $.ajax({
                method: method,
                url: "/moodle/webservice/rest/server.php",
                data: {
                    wstoken: 'e321c48e338fc44830cda07824833944',
                    moodlewsrestformat: 'json',
                    wsfunction: ws,
                    data: params
                },
                dataType: "json"
            })
                .done(function (msg) {
                    cb(msg);
                })
                .fail(function (data) {
                    console.log(data);
                });
        }


        /**
         * 
         * @param {*} msg 
         */
        function con(msg) {

            // map data on internal model
            var
                data = JSON.parse(msg.data),
                user = {
                    username: msg.username,
                    firstname: msg.firstname,
                    lastname: msg.lastname,
                    id: msg.userid,
                    image: msg.userimage
                };


            // setup vue
            Vue.use(Vuex);
            Vue.use(VueRouter);
            Vue.use(VueFormGenerator);


            //Vue.use(VueUniqIds);
            //Vue.use(Vue2Dropzone);
           // Vue.use(VuePaginator); 

            //Vue.component('paginate', VuePaginate);

        
            // init vue store
            const store = new Vuex.Store({
                state: {
                    myValue: 0,
                    videos: data,
                    mouse: {},
                    showForm: false,
                    formDataModel: {},
                    currentVideo: 0
                },
                getters: {
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
                    currentVideoData(state) {
                        var self = this;
                        return function () {
                            return state.videos[state.currentVideo];
                        };
                    }
                },
                mutations: {
                    getFormDataModel() {

                    },
                    setCurrentVideo(state, id) {
                        state.currentVideo = id;
                    },
                    setCurrentVideoRating(state, rating) {
                        state.videos[state.currentVideo].rating = rating;
                    }
                }
            });
            //this.$set('contacts[' + newPsgId + ']', newObj)
            //Vue.set(this.contacts[newPsgId], 'name', this.editPsgName); 
            //console.log(store.state.videos[165].title);
            //store.commit('increment', 10);
            // console.log(store.getters.videoById(165));
            //store.commit('getFormDataModel');



            const Rating = {
                template: '#rating',
                props: {
                    value: { type: [Number, String] },
                    name: { type: String, default: 'rate' },
                    length: { type: Number },
                    showcount: { type: Boolean },
                    required: { type: Boolean },
                    ratedesc: { type: Array, default() { return [] } },
                    disabled: { type: Boolean, default: false },
                    readonly: { type: Boolean, default: false }
                },
                data() {
                    return {
                        over: 0,
                        rate: 0
                    }
                },
                methods: {
                    onOver(index) { if (!this.readonly) this.over = index },
                    onOut() { if (!this.readonly) this.over = this.rate },
                    setRate(index) {
                        var _this = this; 
                        if(index === undefined){ index=0; }
                        
                        this.userHasRatedVideo(function(hasRated){
                            if(hasRated){
                                // not allowed to rate anymore
                            }else{
                                if (_this.rate !== index) {
                                    _this.$emit('beforeRate', _this.rate);
                                    var data = store.getters.currentVideoData();
                                    _this.storeRating(function (e) {
                                        _this.$emit('readonly', true); // xxx bug // set readonly after giving a vote
                                    });
                                }
                                _this.rate = index;
                                _this.$emit('input', _this.rate);
                                _this.$emit('value', _this.rate);
                                _this.$emit('after-rate', _this.rate);
                            }
                        });
                        
                    },
                    isFilled: function(index) { 
                        return index <= this.over; 
                    },
                    isEmpty: function(index) { 
                        return index > this.over || !this.value && !this.over; 
                    },
                    getRatingsOfVideo: function (callback){
                        get_ws('videodatabase_ratings', "POST", {
                            'videoid': 1,
                            'courseid': 2,
                        }, function (e) {
                            //console.log(e);
                            callback(e);
                        });
                    },
                    userHasRatedVideo: function(callback){
                        get_ws('videodatabase_ratings', "POST", {
                            'videoid': 1,
                            'courseid': 2,
                            'userid': 20
                        }, function (e) {
                            var data = JSON.parse(e.data);
                            if ( typeof data === 'array' && data.length === 0){
                                callback(false);
                            }else {
                                callback(true)
                            }
                        });
                    },
                    storeRating: function (rating, callback){
                        get_ws('videodatabase_ratings', "POST", {
                            'videoid': 1,
                            'courseid': 2,
                            'userid': 2,
                            'rating': rating
                        }, function (e) {
                            callback(e);
                        });
                    },

                    // http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
                    // http://julesjacobs.github.io/2015/08/17/bayesian-scoring-of-ratings.html
                    /*
In your case calculating mean is simple. It is the mean of ratings itself. Assume p1 is the fraction of 1-star rating, p2,..., p5. p1+p2+...+p5 = 1. And assume you are calculating these stats using n samples. mean of your data is 1*p1+2*p2+...+5*p5.

The variance of your data is ( E(x^2)-(E(x))^2 )/n = ( (p1*1^2 + p2*2^2..+p5*5^2) - (1*p1+2*p2+..+5*p5)^2 )/n

Since std = sqrt(var), it is pretty straightforward to calculate Normal approximation interval. I will let you work on extending this to WCI.
                    */
                    wilsonScore: function (pos, n){
                        if (n === 0){
                            return 0;
                        }
                        const z = 1.96; //Statistics2.pnormaldist(1 - (1 - confidence) / 2)
                        const phat = 1.0 * pos / n;
                        return (phat + z * z / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n);
                    }
                },
                created: function() {
                    if (this.value >= this.length) {
                        this.value = this.length;
                    } else if (this.value < 0) {
                        this.value = 0;
                    } 
                    this.rate = this.value;
                    this.over = this.value;
                }, 
                updated: function () { 
                    var d = store.getters.currentVideoData().rating;
                    if(d === undefined){ d=0;}
                    this.rate = d;
                    this.hover = d;
                    this.$emit('value', d);
                    this.onOut();
                }
            };


            

            const Video =
                {
                    template: '#app-video-template',//'<div>Video {{ $route.params.id }}: {{ video.title }}</div>', 
                    data: function () {
                        return {
                            vi2_player_id: 'vi2-1',
                            video_selector: 'seq',
                            video_overlay_selector: 'overlay'//,
                            //getRating: store.getters.currentVideoData().rating
                        }
                    },
                    computed: {
                        video: function() {
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
                    updated: function() {
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
                    mounted: function() {
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
                            video_data.video = '/videos/' + video_data.filename.replace('.mp4', '.webm');
                            Vi2.start(video_data, user);
                        }
                    },
                    methods: {
                        onAfterRate: function(rate) {
                            store.commit('setCurrentVideoRating', rate);
                        }
                    },
                    components: {
                        'rating': Rating
                    }
                };


            const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

            var UploadForm = {
                template: '#form-upload-template',
                data: function () {
                    return {
                        error: '',
                        advancedUpload: false,
                        uploadedFiles: [],
                        fileCount: 0,
                        uploadError: null,
                        currentStatus: null,
                        uploadFieldName: 'videouploads[]'

                    }
                },
                computed: {

                    isInitial() {
                        return this.currentStatus === STATUS_INITIAL;
                    },
                    isSaving() {
                        return this.currentStatus === STATUS_SAVING;
                    },
                    isSuccess() {
                        return this.currentStatus === STATUS_SUCCESS;
                    },
                    isFailed() {
                        return this.currentStatus === STATUS_FAILED;
                    }
                },
                methods: {
                    isAdvancedUpload() {
                        var div = document.createElement('div');
                        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
                    },
                    reset() {
                        // reset form to initial state
                        this.currentStatus = STATUS_INITIAL;
                        this.uploadedFiles = [];
                        this.uploadError = null;
                        this.advancedUpload = this.isAdvancedUpload();
                    },
                    save(formData) {
                        // upload data to the server
                        this.currentStatus = STATUS_SAVING;
                        upload(formData, this.updateSelectedFiles);
                    },
                    filesChange(fieldName, fileList) {
                        if (!fileList.length) return;
                        const formData = new FormData();
                        for (var i = 0, len = fileList.length; i < len; i++) {
                            formData.append('videofiles[]', fileList[i]);
                            this.uploadedFiles.push({
                                name: fileList[i].name,
                                type: fileList[i].type,
                                size: fileList[i].size,
                                location: '',
                                status: 'selected'
                            });
                        }
                        // save it
                        this.save(formData);
                    },
                    updateSelectedFiles(data) {
                        if (data.error) {
                            this.currentStatus === STATUS_FAILED;
                            this.error = data.error;
                        } else {
                            this.uploadedFiles = data.files;
                            return this.currentStatus === STATUS_SUCCESS;
                        }
                    }
                },
                mounted() {
                    this.reset();
                }
            };


            const SERVICE_URL = 'http://localhost/videos/php-video-upload-chain/upload.php';
            const BASE_URL = 'http://localhost/videos/';

            function upload(formData, callback) {

                $.ajax({
                    url: SERVICE_URL,//window.location.pathname,
                    type: 'POST',
                    data: formData,
                    success: function (data) {
                        console.log(data);
                        data = JSON.parse(data.toString());
                        if (data.error !== '') {
                            console.log('ERROR: ' + data.error)
                            callback(data);
                        } else {
                            callback(data);
                        }
                    },
                    error: function (data) {
                        console.log('upload error:' + data)
                    },
                    cache: false,
                    contentType: false,
                    processData: false
                });
                /*
                var data = new FormData();
        
                data.append('file', formData[0]);
                var config = {
                    onUploadProgress: function (progressEvent) {
                        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log("Progress:-" + percentCompleted);
                    }
                };
                Axios.post(SERVICE_URL, data, config)
                    .then(function (res) {
                        console.log(res)
                    })
                    .catch(function (err) {
                        console.log(err.message);
                    });
        
                return Axios.post(SERVICE_URL, formData)
                    // get data
                    .then(x => x.data)
                    // add url field
                    .then(x => x.map(img => Object.assign({},
                        img, { url: `${BASE_URL}/images/${img.id}` })
                    ).catch(function(err){
                        console.log(err)
                    })
                );
                */
            }




            const MetadataForm = {
                template: '<vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>',
                computed: {
                    model() {
                        if (this.$route.params.id !== undefined) {
                            store.commit('setCurrentVideo', this.$route.params.id);
                            return store.getters.videoById(this.$route.params.id);
                        }
                    },
                    schema() { return datamodel.data; },
                    formOptions() {
                        return {
                            validateAfterLoad: true,
                            validateAfterChanged: true
                        };
                    }
                }
            };


            const SubmitForm = {
                template: '#form-submit-template',
                methods: {
                    submitForm() {
                        get_ws('videodatabase_store_video', "POST", {
                            'id': store.getters.currentVideoData().id,
                            'data': JSON.stringify(store.getters.currentVideoData())
                        }, this.response);
                    },
                    response(res) {
                        console.log(res);
                    }

                }
            };

            // combine the parts of the form
            const Form = {
                render(h) {
                    const upload = h(UploadForm);
                    const meta = h(MetadataForm);
                    const submit = h(SubmitForm);//h('input', { class: { 'btn-primary':true, btn:true }, attrs: { type: 'submit' } }, 'speichern');
                    return h("div", [upload, meta, submit]);
                }
            };

            // init router
            const router = new VueRouter({
                routes: [
                    { path: '/videos' },
                    { path: '/videos/:id/view', component: Video },
                    { path: '/videos/:id/edit', component: Form },
                    { path: '/videos/new', component: Form }
                ]
            });


            var Main = new Vue({
                el: '#app-videomanager',
                router,
                data: {
                  //  paginate: ['videolist'],
                    mouseOverCheck: '',
                    show: false,
                    isEditor: true,
                    listView: false,
                },
                computed: {
                    columnObject: function () { //console.log(JSON.stringify(this.videos))
                        return "col-xs-12 col-sm-5 col-md-2 video-item ";
                    },
                    videos: function() {
                        return store.state.videos;
                    }
                },
                methods: {
                    setListView: function () { this.listView = true; },
                    setTableView: function () { this.listView = false; },
                    toogleForm: function (id) {
                        store.commit('toggleForm', id);
                    },
                    videoItemClass: function (id) {
                        var video = store.getters.videoById(id);

                        var ffn = function (key) {
                            var arr = video[key].split(';');
                            var out = '';
                            for (var i = 0, len = arr.length; i < len; i++) {
                                out += ' ' + key + '-' + arr[i].replace(/\ /g, '') + ' ';
                            }
                            return out;
                        };
                        return [
                            // multi
                            ffn('courselevel'),
                            ffn('competencies'),
                            ffn('activities'),
                            ffn('perspectives'),

                            // single
                            'actors-' + video.actors.replace(/\//g, ''),
                            'location-' + video.location,
                            'sports-' + video.sports.replace(/,\ /g, ''),
                            'movements-' + video.movements.replace(/, /g, ''),
                            ''
                        ].join(' ');
                    }
                },
                components: {
                    
                }
            });

        } // end con()



        get_ws('videodatabase_videos', "POST", { 'courseid': 2 }, con);
        //get_ws('videodatabase_video', { 'courseid': 2, 'videoid':165 }, con);



        /**
         * Filter
         */
        // render filter
        $(function () {

            // xxx remove for production
            var overflowing = [];
            jQuery(':not(script)').filter(function () {
                return jQuery(this).width() > jQuery(window).width();
            }).each(function () {
                overflowing.push({
                    'xpath': createXPathFromElement(jQuery(this).get(0)),
                    'width': jQuery(this).width(),
                    'overflow': jQuery(this).width() - jQuery(window).width()
                });
            });
            console.table(overflowing);

            function createXPathFromElement(e) { for (var t = document.getElementsByTagName("*"), a = []; e && 1 == e.nodeType; e = e.parentNode)if (e.hasAttribute("id")) { for (var s = 0, l = 0; l < t.length && (t[l].hasAttribute("id") && t[l].id == e.id && s++ , !(s > 1)); l++); if (1 == s) return a.unshift('id("' + e.getAttribute("id") + '")'), a.join("/"); a.unshift(e.localName.toLowerCase() + '[@id="' + e.getAttribute("id") + '"]') } else if (e.hasAttribute("class")) a.unshift(e.localName.toLowerCase() + '[@class="' + e.getAttribute("class") + '"]'); else { for (i = 1, sib = e.previousSibling; sib; sib = sib.previousSibling)sib.localName == e.localName && i++; a.unshift(e.localName.toLowerCase() + "[" + i + "]") } return a.length ? "/" + a.join("/") : null }



            var arr = [];
            $.each(datamodel.data.groups[2].fields, function (j, val) {
                if (val.filterable) {
                    arr = [
                        '<select id="filter_' + val.model + '" class="sel2 ' + (val.multi ? 'multi-filter' : 'single-filter') + '" ' + (val.multi ? ' multiple="multiple" ' : '') + '>',
                        '<option class="option-head" value="all" selected>' + val.label + ' (alle)</option>'
                    ];
                    for (var i = 0; i < val.values.length; i++) {
                        arr.push('<option value="' + val.model + '-' + val.values[i].replace(/\//g, '').replace(/,\ /g, '').replace(/\ /g, '') + '">' + val.values[i] + '</option>');
                    }
                    arr.push('</select>');
                    $('#filter1').append(arr.join(''));
                }
            });
            var filters = {};

            // single filter
            $(document.body).on('change', '.single-filter', function () {
                var filter_id = $(this).attr('id').replace('filter_', '');
                filters['s_' + filter_id] = {} || filters['s_' + filter_id];

                if (this.value === '') {
                    filters['s_' + filter_id][filter_id] = 'null';
                } else {
                    filters['s_' + filter_id][filter_id] = this.value;
                }
                applyFilter();
            });


            // multi
            $(document.body).on('change', '.multi-filter', function () {
                var filter_id = $(this).attr('id').replace('filter_', '');
                filters['m_' + filter_id] = {} || filters['m_' + filter_id];
                // reset
                $(this).find('option').each(function (i, val) {
                    delete filters['m_' + filter_id][$(val).attr('value')];
                });
                // set
                $('#filter_' + filter_id + ' :selected').each(function (i, val) {
                    filters['m_' + filter_id][$(val).attr('value')] = $(this).attr('value');
                });
                applyFilter();
            });


            /**
             * 
             */
            function applyFilter() {

                var contains = function (obj, arr2) {
                    var val = false;
                    Object.keys(obj).forEach(function (n) {
                        if (arr2.indexOf(n) !== -1) {
                            val = true;
                        }
                    });
                    return val;
                };

                $('.video-item').hide().filter(function () {
                    var
                        self = $(this),
                        result = {},
                        cl = self.attr('class').split(' ')
                        ;
                    if (filters !== undefined) {
                        Object.keys(filters).forEach(function (cat) {
                            if (filters[cat]) {
                                Object.keys(filters[cat]).forEach(function (f) {
                                    if (cat.substr(0, 2) === 'm_' && filters[cat][f] && (filters[cat][f] != 'none') && (filters[cat][f] != 'all')) {
                                        // logical OR
                                        result[cat] = contains(filters[cat], cl);
                                    } else if (filters[cat][f] && (filters[cat][f] != 'none') && (filters[cat][f] != 'all')) {
                                        result[cat] = self.hasClass(filters[cat][f]);
                                    }
                                });
                            }
                        });
                    }
                    // AND operation for every select box
                    var res = true;
                    for (var i in result) {
                        if (result.hasOwnProperty(i)) {
                            res = result[i] && res;
                        }
                    }
                    return res;
                }).show();
            }
        });


        return Filters;
    }); 