/**
 * Javascript 
 *
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Form 
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 */
define([
    'jquery',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/lib/vue.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/lib/vfg.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/lib/axios.min.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/components/Utils.js'
],
    function (
        $,
        Vue,
        VueFormGenerator,
        Axios,
        Utils
    ) {


        EditForm = function (store, course, datamodel, utils) {
            this.datamodel = datamodel;

            Vue.use(VueFormGenerator);

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
                                video_data.metadata[0].thumbnail = "";// "still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                                video_data.video = video_data.filename;// '/videos/' + video_data.filename.replace('.mp4', '.webm');
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
                        }
                        console.log(fileList[0])
                        $('.vue-form-generator').show();
                        $('#submit_video_form').show();
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
                    $('.vue-form-generator').hide();
                    $('#submit_video_form').hide();
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
            const upload = function (formData, callback) {
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
                        if (data.error !== '') { // xxx: bug?
                            callback(data);
                        } else {
                            console.log(data.files[0].upload_tmp)
                            console.log(data.files[0].tmp_location)
                            startProgressLog(
                                data.files[0].tmp_location,//data.files[0].upload_tmp,//
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
                utils.get_ws('files', {
                    filename: filename,
                    location: location,
                    filearea: area,
                    courseid: course.id,
                    moduleid: course.module,
                }, function (e) {
                    console.log('Got callback');
                    console.log(JSON.parse(e.data));
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


          

            /**
             * Generates a matrix of videos that have been uploaded via the plugin videofiles
             */
            
            const SimpleForm = {
                template: '#pool',
                data: function () {
                    return {
                        videos: [],
                        selectedVideos: []
                    };
                },
                created() {
                    var vm = this;
                    utils.get_ws('video_pool', { 'courseid': course.id }, function (res) {
                        var data = JSON.parse(res.data);
                        for(var i in data){
                            if(data.hasOwnProperty(i)){
                                if (store.getters.isVideo(data[i].id)){
                                    data[i].selected = true;
                                }
                            }
                        }
                        vm.selectedVideos = Object.keys(data).filter(function(d){
                            if (data[d].selected){
                                return data[d].id;
                            }
                        });
                        vm.videos = data;
                    }, false);

                },
                methods: {
                    
                    submitForm() {
                        // store selection from pool in plugin database and inside store
                        var _this = this;
                        utils.get_ws('store_video', {
                                courseid: course.id,
                                videos: this.selectedVideos.toString()
                        }, function (res) {
                            console.log(res.data)
                            //if (nu) {
                                //store.commit('addVideo', data); // videofileid, courseid
                                //store.commit('setCurrentVideo', id);
                            //}
                            store.commit('updateVideos', JSON.parse(res.data));
                            //_this.$forceUpdate();
                            _this.$router.push({ path: '/videos' });
                        });
                        
                    },
                    getVideoById(id){
                        for (var v in this.videos){
                            if(this.videos.hasOwnProperty(v)){
                                if(this.videos[v].id === id){
                                    return this.videos[v];
                                }
                            }
                        }
                        return false;
                    },
                    select(id) { console.log('click'+id)
                        this.getVideoById(id).selected = !this.getVideoById(id).selected;
                    },
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
                    //const upload = h(UploadForm);
                    //const meta = h(MetadataForm);
                    //const submit = h(SubmitForm);//h('input', { class: { 'btn-primary':true, btn:true }, attrs: { type: 'submit' } }, 'speichern');
                    //return h("div", [upload, meta, submit]);
                    return h("div", [h(SimpleForm)]);
                }
            };
            this.Form = Form;

        }
        return EditForm;

    });