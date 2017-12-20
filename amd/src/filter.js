/**
 * Javascript controller for the "Actions" panel at the bottom of the page.
 *
 * @module     mod_videodatabase/filters
 * @package    mod_videodatabase
 * @class      Filters
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
    '/moodle/mod/videodatabase/amd/src/vfg.js',
    '/moodle/mod/videodatabase/amd/src/axios.min.js',
    //'/moodle/mod/videodatabase/amd/src/dropzone.js',
    //'/moodle/mod/videodatabase/amd/src/vue2Dropzone.js',
   // '/moodle/mod/videodatabase/amd/src/vue-paginate.min.js',
    
    'js/vi-two.js'
    ], 
    function (
        $, 
        log, 
        ajax, 
        Vue, 
        VueRouter, 
        Vuex,
        VueFormGenerator,
        Axios,
       // dropzone, 
      //  Vue2Dropzone,
        //VuePaginate, 
        Vi2
    ) {

    var Filters = function () { };

    /**
     * AJAX
     
    var promises = ajax.call([
        { methodname: 'core_get_string', args: { component: 'mod_videodatabase', stringid: 'pluginname' } },
        { methodname: 'core_get_string', args: { component: 'mod_videodatabase', stringid: 'changerate' } }
    ]);
 
   promises[0].done(function(response) {
       console.log('mod_wiki/pluginname is' + response);
   }).fail(function(ex) {
       // do something with the exception
   });
 
   promises[1].done(function(response) {
       console.log('mod_wiki/changerate is ' + response);
   }).fail(function(ex) {
       // do something with the exception
   });
*/


    function get_ws(ws, params, cb) {
        $.ajax({
            method: "POST",
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

    function con(msg) {
        //console.log(JSON.parse(msg.data)['165'].title);
        var data = JSON.parse(msg.data);


        // setup
        Vue.use(Vuex);
        Vue.use(VueRouter);
        Vue.use(VueFormGenerator);
        //Vue.use(Vue2Dropzone);
        //Vue.use(VuePaginate); // vue-bs-pagination
        

        // init store
        const store = new Vuex.Store({
            state: {
                myValue: 0,
                videos: data,
                mouse: {},
                showForm: false
            },
            getters: {
                videoById(state) {
                    var self = this;
                    return function (id) {
                        //state.videos[id].rating = Math.floor(Math.random()*5);
                        return state.videos[id];
                    };
                }
            },
            mutations: {
                
                // tests
                mouseOver(state, id) {
                    state.mouse[id] = 1;
                    console.log(id+'__'+ state.mouse[id]);
                },
                mouseOut(state, id) {
                    state.mouse[id] = 0;
                }
            }
        });
        //this.$set('contacts[' + newPsgId + ']', newObj)
        //Vue.set(this.contacts[newPsgId], 'name', this.editPsgName); 
        //console.log(store.state.videos[165].title);
        //store.commit('increment', 10);
        // console.log(store.getters.videoById(165));


        
        const Video = //new Vue.component('videoplayer', 
        {
            template: '#app-video-template',//'<div>Video {{ $route.params.id }}: {{ video.title }}</div>', 
            data: {
                hello:'world'
            },
            computed: {
                video() {
                    // data mapping
                    const video_data = store.getters.videoById(this.$route.params.id);
                    video_data.metadata = [];
                    video_data.metadata[0] = {}; 
                    video_data.metadata[0].author = video_data['contributor'];
                    video_data.metadata[0].title = video_data['title'];
                    video_data.metadata[0].abstract = video_data['description'];
                    video_data.metadata[0].thumbnail = "still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                    video_data.video = '/videos/' + video_data.filename.replace('.mp4', '.webm');
                    
                    //startVi2(video_data);
                    
                    return video_data;//store.getters.videoById( this.$route.params.id );
                }
            },
            updated() {
                video_data = store.getters.videoById(this.$route.params.id);
                video_data.metadata = [];
                video_data.metadata[0] = {};
                video_data.metadata[0].author = video_data['contributor'];
                video_data.metadata[0].title = video_data['title'];
                video_data.metadata[0].abstract = video_data['description'];
                video_data.metadata[0].thumbnail = "still-" + video_data.filename.replace('.mp4', '_comp.jpg');
                video_data.video = '/videos/' + video_data.filename.replace('.mp4', '.webm');
                //video_data.id = 'test';
                startVi2(video_data);
                //console.log(window.vi2.observer.current_stream);
                //console.log(window.vi2.db.json_data);
            }
        };

        const Form = {
            //el: '#form-data',
            template: '<vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>',
            computed: {
                model() { return store.getters.videoById(this.$route.params.id); },
                schema() { return datamodel.data;},
                formOptions() {
                    return { 
                        validateAfterLoad: true,
                        validateAfterChanged: true
                    }
                }
            }
        };

        
      
        const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

        var Main2 = new Vue({
            el: '#form-upload',
            template: '#form-upload-template',
            data: {
                error: '',
                advancedUpload: false,
                uploadedFiles: [],
                fileCount:0,
                uploadError: null,
                currentStatus: null,
                uploadFieldName: 'videouploads[]'
                
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
                    for(var i=0,len=fileList.length; i < len; i++){
                        formData.append('videofiles[]', fileList[i]);
                        this.uploadedFiles.push({ 
                            name: fileList[i].name, 
                            type: fileList[i].type, 
                            size: fileList[i].size, 
                            location:'',
                            status:'selected'
                        })
                    }
                    // save it
                    this.save(formData);
                }, 
                updateSelectedFiles(data){
                    if( data.error ){
                        this.currentStatus === STATUS_FAILED;
                        this.error = data.error;
                    }else{
                        this.uploadedFiles = data.files;
                        return this.currentStatus === STATUS_SUCCESS;
                    }
                }
            },
            mounted() {
                this.reset();
            }
        });

        
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
                    if(data.error !== ''){
                        console.log('ERROR: ' + data.error)
                        callback(data);
                    }else{
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

        // init router
        const router = new VueRouter({
            routes: [
                { path: '/videos', component: Video },
                { path: '/videos/:id/view', component: Video },
                { path: '/videos/:id/edit', component: Form }
            ]
        });


        var Main = new Vue({
            el: '#app-videomanager',
            router,
            data: {
                paginate: ['videolist'],
                mouseOverCheck: '',
                show: false
            },
            computed: {
                columnObject: function () { //console.log(JSON.stringify(this.videos))
                    return "col-xs-12 col-sm-5 col-md-2 video-item ";
                },
                videos() {
                    /*return store.state.videos.filter((item) => 
                        item.name.includes(this.search_by_name) 
                        && item.email.includes(this.search_by_email) 
                        && item.status === this.pending_or_completed);
                        */
                    return store.state.videos;
                }
            },
            methods: {
                toogleForm: function (id) {
                    store.commit('toggleForm', id);
                },
                videoItemClass: function (id) {
                    var video = store.getters.videoById(id);

                    return [
                        // multi
                        video['klasse'].split(' ').join('class-'),
                        //'competencies-' + video.compentencies.replace(/\ /g, ''),
                        // single
                        'actors-' + video.actors.replace(/\//g, ''),
                        'location-' + video.location,
                        'sports-' + video.sports.replace(/,\ /g, ''),
                        'movements-' + video.movements.replace(/, /g, ''),
                        ''
                    ].join(' ');
                }
            }
        });
        
    } // end con()



    get_ws('videodatabase_videos', { 'courseid': 2 }, con);
    //get_ws('videodatabase_video', { 'courseid': 2, 'videoid':165 }, con);



    var datamodel = {
        "language": "de",
        "version": 1,
        "data": {
            fields: [],
            groups: [
                {
                    legend: "Allgemeines",
                    fields: [
                        {
                            type: "input",
                            inputType: "text",
                            label: "Titel",
                            model: "title",
                            featured: true,
                            required: true,
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Beschreibung",
                            model: "description",
                            featured: true,
                            required: true,
                            min: 4,
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Schlüsselwörter",
                            model: "tags",
                            featured: true,
                            required: true,
                            validator: VueFormGenerator.validators.string
                        }

                    ]// end fields
                },
                {
                    legend: "Video",
                    fields: [
                        {
                            type: "input",
                            inputType: "text",
                            label: "Dateiname",
                            model: "filename",
                            diabled: true
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Länge",
                            model: "length",
                            diabled: true
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Dateigröße",
                            model: "size",
                            diabled: true
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Videoformat",
                            model: "format",
                            diabled: true
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Mime",
                            model: "mimetype",
                            diabled: true
                        }
                    ]
                },
                {
                    legend: "Dublin Core Metadaten",
                    fields:[
                        {
                            type: "input",
                            inputType: "text",
                            label: "Fach",
                            model: "subject",
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Ersteller",
                            model: "Creator",
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Herausgeber",
                            model: "publisher",
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Institution",
                            model: "institution",
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Quelle",
                            model: "source",
                            featured: true,
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Sprache",
                            model: "language",
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Lizenz",
                            model: "license",
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Urheberrechte",
                            model: "rights",
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Relation",
                            model: "relation",
                            validator: VueFormGenerator.validators.string
                        },
                        {
                            type: "input",
                            inputType: "text",
                            label: "Bereich",
                            model: "coverage",
                            validator: VueFormGenerator.validators.string
                        }
                    ]// end fields
                },
                {
                    legend: "Didaktische Einordnung",
                    fields: [
                        {
                            model: "sports",
                            label: "Sportart",
                            type: "select",
                            filterable: true,
                            "level": 1,
                            values: [
                                "Fußball",
                                "Handball",
                                "Barren",
                                "Judo",
                                "Handball",
                                "Volleyball"
                            ]
                        },
                        {
                            model: "movements",
                            label: "Bewegungsfelder",
                            type: "select",
                            multi: false,
                            filterable: true,
                            "level": 1,
                            values: [
                                "Laufen, Springen, Werfen, Stoßen",
                                "Spiele",
                                "Bewegung an Geräten",
                                "Kämpfen nach Regeln",
                                "Bewegungsfolgen gestalten und darstellen",
                                "Bewegen im Wasser",
                                "Fahren, Rollen, Gleiten"
                            ]
                        },
                        {
                            model: "class",
                            label: "Lerngruppe",
                            type: "checklist",
                            multi: true,
                            filterable: true,
                            "level": 1,
                            values: [
                                "Eingangsstufe",
                                "Unterstufe",
                                "Mittelstufe",
                                "Werkstufe",
                                "Klassenstufe 1",
                                "Klassenstufe 2",
                                "Klassenstufe 3",
                                "Klassenstufe 4",
                                "Klassenstufe 5",
                                "Klassenstufe 6",
                                "Klassenstufe 7",
                                "Klassenstufe 8",
                                "Klassenstufe 9",
                                "Klassenstufe 10",
                                "Klassenstufe 11",
                                "Klassenstufe 12",
                                "Klassenstufe 13"
                            ]
                        },
                        {
                            model: "actors",
                            label: "Akteure",
                            type: "select",
                            multi: false,
                            filterable: true,
                            "level": 2,
                            values: [
                                "Lehrer/in",
                                "Schüler/in"
                            ]
                        },
                        {
                            model: "location",
                            label: "Ort",
                            "type": "checklist",
                            filterable: true,
                            "level": 2,
                            values: [
                                "Sporthalle",
                                "Schwimmhalle",
                                "Outdoor"
                            ]
                        },
                        {
                            model: "compentencies",
                            label: "Fachbezogene Kompetenzen",
                            type: "checklist",
                            multi: true,
                            filterable: true,
                            "level": 2,
                            values: [
                                "Bewegen und Handeln",
                                "Reflektieren und Urteilen",
                                "Interagieren",
                                "Methoden anwenden"
                            ]
                        },
                        {
                            model: "activities",
                            label: "Aktivitäten",
                            type: "checklist",
                            multi: true,
                            filterable: true,
                            "level": 2,
                            values: [
                                "Abbauen",
                                "Aufbauen",
                                "Begründen",
                                "Beraten",
                                "Beschreiben",
                                "Besprechen",
                                "Beurteilen",
                                "Demonstrieren",
                                "Disziplinieren",
                                "Erklären",
                                "Feedback, Korrektur",
                                "Gesprächsrunde",
                                "Gruppenbildung",
                                "Helfen",
                                "Kooperieren",
                                "Medieneinsatz",
                                "Motivieren",
                                "Organisieren",
                                "Präsentieren",
                                "Sichern",
                                "Störung",
                                "Üben"
                            ]
                        },
                        {
                            model: "perspectives",
                            label: "Pädagogische Perspektiven",
                            type: "checklist",
                            listBox: true,
                            multi: true,
                            filterable: true,
                            "level": 2,
                            values: [
                                "Leistung",
                                "Wagnis",
                                "Gestaltung",
                                "Körpererfahrung",
                                "Kooperation",
                                "Gesundheit"
                            ]
                        }
                    ]// end fields
                }
            ]
        }     
    };
   

    /**
     * Filter
     */
    $(document).ready(function () {
        // render filter
        var arr = [];
        $.each(datamodel.data.groups[3].fields, function (j, val) {
            if(val.filterable){
                arr = [
                    // '<label>'+ val.name +'</label>',
                    '<select id="filter_' + val.model + '" class="sel2 ' + (val.multi ? 'multi-filter' : 'single-filter') + '" ' + (val.multi ? ' multiple="multiple" ' : '') + '>',
                    '<option class="option-head" value="" selected>' + val.label + ' (alle)</option>'
                ];
                for (var i = 0; i < val.values.length; i++) {
                    arr.push('<option value="' + val.model + '-' + val.values[i].replace(/\//g, '').replace(/,\ /g, '').replace(/\ /g, '') + '">' + val.values[i] + '</option>');
                }
                arr.push('</select>');
                $('#filter1').append(arr.join(''));
            }
        });

        var filters = {};


        $('.single-filter').change(function () {
            //console.log('__'+this.value)
            var filter_id = $(this).attr('id').replace('filter_','');
            var value = this.value;
            if (value === '') {
                filters[filter_id] = 'null';
            } else {
                filters[filter_id] = value;
                
            }
            //console.log(filters[filter_id]);
            applyFilter();
        });

  
        // multi
        $('.multi-filter').change(function () { // alert($(this).attr('))
            var filter_id = $(this).attr('id').replace('filter_', '');
            // reset
            $(this).find('option').each(function (i, val) {
                filters[filter_id+'_' + $(val).attr('value')] = 'null';
            });
            // set
            $('#filter_' + filter_id + ' :selected').each(function (i) {
                filters[filter_id + '_' + $(this).attr('value')] = $(this).attr('value');
            });
            applyFilter();
        });

        function applyFilter() {
            var filter_str = 'div.video-item';
            $('.video-item').hide();
            // apply logical AND 
            for (var f in filters) {
                if (filters.hasOwnProperty(f) && filters[f] !== 'null' && filters[f] !== '') {
                    filter_str += '.' + filters[f] + '';
                }
            }
            //console.log(filter_str)
            $('#videomanager').find(filter_str).show();
        }

    }); // end documents ready
    return Filters;
}); // end define
    /* jshint ignore:end */
