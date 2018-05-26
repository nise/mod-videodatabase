/**
 * Javascript controller for Vue.js and Vi-Two
 *
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Videodatabase
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 */
define([
    'jquery',
    'core/log',
    '/moodle/mod/videodatabase/amd/src/lib/vue.js',
    '/moodle/mod/videodatabase/amd/src/lib/vue-router.js',
    '/moodle/mod/videodatabase/amd/src/lib/vfg.js',
    '/moodle/mod/videodatabase/amd/src/lib/axios.min.js',
    '/moodle/mod/videodatabase/amd/src/datamodel.js',
    // '/moodle/mod/videodatabase/amd/src/vuejs-paginator.js',
    '/moodle/mod/videodatabase/amd/src/components/Store.js',
    '/moodle/mod/videodatabase/amd/src/components/Video.js',
    '/moodle/mod/videodatabase/amd/src/components/Utils.js'
],
    function (
        $,
        log,
        Vue,
        VueRouter,
        VueFormGenerator,
        Axios,
        Datamodel,
        // VuePaginator,
        Store,
        Video,
        Utils
    ) {

        var datamodel = new Datamodel();

        var course = {
            id: parseInt($('#courseid').html()),
            module: parseInt($('#moduleid').html())
        };
        const utils = new Utils();

        /**
         * Connection handler
         * @param {*} msg 
         */
        function connection_handler(msg) {

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
            Vue.use(VueRouter);
            Vue.use(VueFormGenerator);

            const vuestore = new Store(data, course);
            const store = vuestore.store;
            const utils = new Utils();
            const videovue = new Video(store, course, user, $('#token').text());
            const video = videovue.video;


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
                        currentStatus: 0,
                        uploadFieldName: 'videouploads[]'
                    };
                },
                computed: {
                    progtranscode: {
                        get: function () {
                            return store.getters.progresstranscode();
                        },
                        set: function (e) {
                            if (typeof (e) === 'number') {
                                store.commit('progresstranscode', e);
                            }
                        }
                    },
                    proganimation: {
                        get: function () {
                            return store.getters.progressanimation();
                        },
                        set: function (e) {
                            if (typeof (e) === 'number') {
                                store.commit('progressanimation', e);
                            }
                        }
                    },
                    progthumbnail: {
                        get: function () {
                            return store.getters.progressthumbnail();
                        },
                        set: function (e) {
                            if (typeof (e) === 'number') {
                                store.commit('progressthumbnail', e);
                            }
                        }
                    },
                    progpreview: {
                        get: function () {
                            return store.getters.progresspreview();
                        },
                        set: function (e) {
                            if (typeof (e) === 'number') {
                                store.commit('progresspreview', e);
                            }
                        }
                    },
                    video: function () {
                        if (this.$route.params.id) { // if video already exists
                            var id = this.$route.params.id;
                            store.commit('setCurrentVideo', id);
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
                        } else { // else it must be a new video
                            console.log('no video data');
                        }

                    },
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
                    isAdvancedUpload: function () {
                        var div = document.createElement('div');
                        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
                    },
                    reset: function () {
                        // reset form to initial state
                        this.currentStatus = STATUS_INITIAL;
                        this.uploadedFiles = [];
                        this.uploadError = null;
                        this.advancedUpload = this.isAdvancedUpload();
                    },
                    save: function (formData) {
                        // upload data to the server
                        this.currentStatus = STATUS_SAVING;
                        upload(formData, this.updateSelectedFiles);
                    },
                    progresstranscode: function (e) {
                        this.progresstranscode = store.getters.progresstranscode();
                    },
                    progressanimation: function (e) {
                        this.progressanimation = store.getters.progressanimation();
                    },
                    progressthumbnail: function (e) {
                        this.progressthumbnail = store.getters.progressthumbnail();
                    },
                    progresspreview: function (e) {
                        this.progresspreview = store.getters.progresspreview();
                    },
                    filesChange: function (fieldName, fileList) {
                        if (!fileList.length) {
                            return;
                        } console.log(fileList[0])
                        this.currentStatus = STATUS_INITIAL;
                        this.uploadedFiles = [];
                        document.getElementById("file").value = "";
                        const formData = new FormData();
                        for (var i = 0, len = fileList.length; i < len; i++) {
                            fileList[i].lastModifiedDate = new Date();
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
                    updateSelectedFiles: function (data) {
                        console.log(data);
                        if (data.hasOwnProperty('error') && String(data.error).length > 0) { // 
                            this.currentStatus = STATUS_FAILED;
                            this.error = data.error;
                            console.log(this.error);
                        } else {
                            console.log(data.files);
                            this.uploadedFiles[0] = data.files[0];
                            console.log('.....................')
                            console.log(data.files[0])
                            data.files = data.files[0];
                            if (this.$route.params.id !== undefined) {
                                data.isNewVideo = false;
                            } else {
                                data.isNewVideo = true;
                            }
                            store.commit('setVideoFileData', data);
                            this.currentStatus = STATUS_SUCCESS;
                            return this.currentStatus === STATUS_SUCCESS;
                        }
                    }
                },
                mounted: function () {
                    this.reset();
                }
            };

            const url = new URL(window.location.href);
            const server = url.protocol + '//' + url.hostname + (url.port === '' ? '' : ':' + url.port);
            const UPLOAD_URL = server + '/videos/php-video-upload-chain/upload.php';
            const TRANSCODING_URL = server + '/videos/php-video-upload-chain/transcoding.php';
            const BASE_URL = server + '/videos/';

            /**
             * Metadata and preview files will be generated. File conversions will take place.
             * @param {*} formData 
             * @param {*} callback 
             */
            function upload(formData, callback) {
                $.ajax({
                    url: UPLOAD_URL,
                    type: 'POST',
                    data: formData,
                    crossOrigin: true,
                    success: function (data) {
                        try {
                            data = JSON.parse(data.toString());
                        } catch (e) {
                            console.log(e);
                        }
                        if (data.error !== '') {
                            callback(data);
                        } else {
                            startProgressLog(
                                data.files[0].tmp_location,
                                data.files[0].duration,
                                data.files[0].name_clean
                            );
                            callback(data);
                        }
                    },
                    xhr: function () {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function (evt) {
                            if (evt.lengthComputable) {
                                $('#uploadprogress')
                                    .attr('value', evt.loaded)
                                    .attr('max', evt.total);
                                //console.log(evt.loaded/evt.total);
                            }
                        }, false);

                        return xhr;
                    },
                    error: function (data) {
                        console.log('upload error:');
                        console.log(data);
                    },
                    cache: false,
                    contentType: false,
                    processData: false
                });
            }


            /**
             * Establishes a EventSource Connection and receives different messages about the state of video pre-procession on the server.
             * @param {*} location File location
             * @param {*} duration Video duration
             * @param {*} name Name of the video file excluding file extention
             */
            function startProgressLog(location, duration, name) {
                var
                    params = '?location=' + encodeURIComponent(location) + '&duration=' + duration + '&name=' + name,
                    es = new EventSource(TRANSCODING_URL + params),
                    ready = [0, 0, 0, 0]
                    ;

                es.addEventListener('message', function (e) {
                    try {
                        var result = JSON.parse(e.data);

                        if (e.message == 'CLOSE') {
                            es.close();
                            UploadForm.progress = 100;

                        } else {
                            if (result.message === 'x264' || result.message === 'webm') {
                                store.commit('progresstranscode', result.progress);
                                UploadForm.progtranscode = result.progress;
                                ready[0] = result.progress;

                            } else if (result.message === 'animation') {
                                store.commit('progressanimation', result.progress);
                                UploadForm.proganimation = result.progress;
                                ready[1] = result.progress;

                            } else if (result.message === 'thumbnail') {
                                store.commit('progressthumbnail', result.progress);
                                UploadForm.progthumbnail = result.progress;
                                ready[2] = result.progress;

                            } else if (result.message === 'preview') {
                                store.commit('progresspreview', result.progress);
                                UploadForm.progpreview = result.progress;
                                ready[3] = result.progress;

                            } else {
                                console.warn('Unknown EventSource message: ' + result.message);
                            }
                        }
                        if (ready.reduce(function (acc, val) { return acc + val; }) === 400) {
                            es.close();
                        }
                    } catch (e) {
                        console.log('JSON.parse failed fro Event Source Message');
                        console.error(e);
                    }
                });

                es.addEventListener('error', function (e) {
                    console.log('Some EventSource Error');
                    //console.error(e);
                    //es.close();
                });
            }


            /**
             * storeFileToMoodle 
             * @param {*} filename 
             * @param {*} location 
             * @param {*} area 
             */
            function storeFileToMoodle(filename, location, area) {

                console.log('start storing' + '---' + filename + '---' + location + '---' + area);
                utils.get_ws('videodatabase_files', "POST", {
                    filename: filename,
                    location: location,
                    filearea: area,
                    courseid: course.id,
                    moduleid: course.module,
                }, function (e) {
                    console.log('Got callback');
                    console.log(e);
                    //callback(e);
                }, function (err) {
                    console.log('WS Error');
                    console.error(err);
                });
            }


            /**
             * 
             */
            function complete_upload(filename, duration, callback) {
                $.ajax({
                    url: UPLOAD_URL,
                    type: 'GET',
                    data: { completeupload: filename, duration: duration },
                    success: function (msg) {
                        console.log('moving successful');
                        callback(msg);
                    },
                    error: function (data) {
                        console.log('file move error:'); console.log(data);
                    },
                    cache: false,
                    contentType: false
                    //processData: false
                });
            }


            const MetadataForm = {
                template: '<vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>',
                computed: {
                    model() {
                        if (this.$route.params.id !== undefined) {
                            store.commit('setCurrentVideo', this.$route.params.id);
                            return store.getters.videoById(this.$route.params.id);
                        } else {
                            return store.getters.newvideo();
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
                        var id = -1, data = {}, nu = 0;
                        if (this.$route.params.id !== undefined) {
                            id = store.getters.currentVideoData().id;
                            data = store.getters.currentVideoData();
                        } else {
                            data = store.getters.newvideo();
                            nu = 1;
                            id = (data.title + data.description).hashCode();
                            data.id = id;
                            //store.commit('addVideo', data );
                            //store.commit('setCurrentVideo', id);
                        }
                        // move files into the moodledata diretory
                        var name = data.filename.split('.')[0];
                        var tmp_path = '/videos/tmp/';
                        storeFileToMoodle('still-' + name + '_comp.jpg', tmp_path, 'thumbnail');
                        storeFileToMoodle('still-' + name + '_comp.gif', tmp_path, 'animation');
                        storeFileToMoodle(data.filename, tmp_path, 'video');
                        for (var i = 0, len = data.length; i < len; i++) {
                            storeFileToMoodle('preview-' + name + '-' + i + '.jpg', tmp_path, 'preview');
                        }
                        // move files outside moodle
                        /*
                        complete_upload(data.filename.split('.')[0], data.length, function(msg){
                            console.log('Moving files is done.');
                            console.log(msg);
                        });
                        */
                        // save data to videodatabase
                        utils.get_ws('videodatabase_store_video', "POST", {
                            'nu': nu,
                            'id': id,
                            'data': JSON.stringify(data)
                        }, function (res) {
                            if (nu) {
                                store.commit('addVideo', data);
                                store.commit('setCurrentVideo', id);
                            }
                            router.push({ path: '/videos' });
                        });
                    },
                    removeVideo() {
                        var id = this.$route.params.id;
                        if (id !== undefined) {
                            if (window.confirm('Wollen Sie das Video wirklich löschen?')) {
                                router.push({ path: '/videos' });
                                store.commit('removeVideo', id);
                            }
                        }
                    },
                    response(res) {
                        console.log(res);
                    }

                }
            };

            String.prototype.hashCode = function () {
                var hash = 0, i, chr;
                if (this.length === 0) return hash;
                for (i = 0; i < this.length; i++) {
                    chr = this.charCodeAt(i);
                    hash = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
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
                    { path: '/videos/:id/view', component: video },
                    { path: '/videos/:id/edit', component: Form },
                    { path: '/videos/new', component: Form }
                ],
                scrollBehavior: function (to, from, savedPosition) {
                    return { x: 0, y: 405 };
                }
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
                    search: '',
                    videoRatings: {}
                },
                computed: {
                    columnObject: function () { //console.log(JSON.stringify(this.videos))
                        return "col-xs-12 col-sm-5 col-md-2 video-item ";
                    },
                    videos: function () {
                        return store.state.videos;
                    },
                    filteredList: function () {
                        return Object.values(store.getters.videos()).filter(video => {
                            // video.title.toLowerCase().includes(this.search.toLowerCase());
                            return Object.values(video).join(' ').toLowerCase().includes(this.search.toLowerCase());
                        });
                    }
                },
                created: function () {
                    var _this = this;
                    utils.get_ws('videodatabase_ratings', "POST", {
                        'courseid': course.id,
                    }, function (e) {
                        try {
                            var data = {};
                            var d = Object.values(JSON.parse(e.data));

                            for (var obj in d) {
                                if (d.hasOwnProperty(obj)) {
                                    if (data[d[obj].videoid] === undefined) {
                                        data[d[obj].videoid] = [];
                                    }
                                    data[d[obj].videoid].push(d[obj].rating);
                                }
                            }

                            for (var video in data) {
                                if (data.hasOwnProperty(video) && data[video].length > 0) {
                                    var positiveRatings = data[video].filter(function (obj) {
                                        return obj > 2 ? true : false;
                                    });
                                    var wilson = _this.wilsonScore(positiveRatings.length, data[video].length) * 5;
                                    _this.videoRatings[video] = Math.round(wilson);
                                }
                            }
                        } catch (e) { console.error(e); }
                    });
                },
                methods: {
                    /**
                     * Wilson scoring algorithm for a balanced overall rating
                     */
                    wilsonScore: function (positiveRatings, n) {
                        const z = 1.96; //Statistics2.pnormaldist(1 - (1 - confidence) / 2)
                        const z2 = Math.sqrt(2);
                        const phat = 1.0 * positiveRatings / n;
                        return (phat + z2 / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n)) / (1 + z2 / n);
                    },
                    /**
                     * 
                     */
                    imageLoadError: function (id) {
                        var img = document.getElementById('video-img-' + id);
                        img.src = 'images/stills/default.jpg';
                    },
                    setListView: function () { this.listView = true; },
                    setTableView: function () { this.listView = false; },
                    toogleForm: function (id) {
                        store.commit('toggleForm', id);
                    },
                    videoItemClass: function (id) {
                        var video = store.getters.videoById(id);

                        var ffn = function (key) {
                            var out = '', arr = [];
                            if (video[key] && typeof video[key] === 'string') {
                                arr = video[key].split(';');
                            }
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
                            video.actors ? 'actors-' + video.actors.replace(/\//g, '') : '',
                            video.location ? 'location-' + video.location : '',
                            video.sports ? 'sports-' + video.sports.replace(/,\ /g, '') : '',
                            video.movements ? 'movements-' + video.movements.replace(/, /g, '') : '',
                            ''
                        ].join(' ');
                    },
                    downloadLogData: function () {
                        utils.get_ws('videodatabase_get_log', "POST", {
                            'courseid': course.id,
                        }, function (data) { //console.log(data)

                            // extract log entries form result set
                            var json = Object.values(JSON.parse(data.response)).map(function (d) { return JSON.parse(d.entry); });
                            if (json.length === 0) {
                                alert('Es liegen noch keine Logdaten vor.');
                            } else {
                                // convert json to csv
                                var fields = Object.keys(json[0]);
                                var csv = json.map(function (row) {
                                    return Object.values(row);
                                });
                                csv.unshift(fields); // add header column
                                // export
                                exportToCsv('moodle-videodatabase-log-data-.csv', csv);
                            }
                        });
                    }
                },
                components: {
                    rating: videovue.rating

                }
            });

        } // callback to webservice


        utils.get_ws('videodatabase_videos', "POST", { 'courseid': course.id }, connection_handler);





        /**
         * CSV Export
         */
        function exportToCsv(filename, rows) {
            var processRow = function (row) {
                var finalVal = '';
                for (var j = 0; j < row.length; j++) {
                    var innerValue = row[j] === null ? '' : row[j].toString();
                    if (row[j] instanceof Date) {
                        innerValue = row[j].toLocaleString();
                    };
                    var result = innerValue.replace(/"/g, '""');
                    if (result.search(/("|,|\n)/g) >= 0)
                        result = '"' + result + '"';
                    if (j > 0) {
                        finalVal += ',';
                    }
                    finalVal += result;
                }
                return finalVal + '\n';
            };

            var csvFile = '';
            for (var i = 0; i < rows.length; i++) {
                csvFile += processRow(rows[i]);
            }

            var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                var link = document.createElement("a");
                if (link.download !== undefined) { // feature detection
                    // Browsers that support HTML5 download attribute
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        }


        /**
         * Filter
         */
        // render filter
        $(function () {

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

    }); 