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
        //Vue.use(VuePaginate); // vue-bs-pagination
        

        // init store
        const store = new Vuex.Store({
            state: {
                myValue: 0,
                videos: data
            },
            getters: {
                videoById(state) {
                    var self = this;
                    return function (id) {
                        return state.videos[id];
                    };
                }
            },
            mutations: {
                increment(state, value) {
                    state.myValue += value;
                }
            }
        });
        //console.log(store.state.videos[165].title);
        //store.commit('increment', 10);
        // console.log(store.getters.videoById(165));


        
        const Video = //new Vue.component('Videoplayer', 
            {
            template: '#app-videoplayer',//'<div>Video {{ $route.params.id }}: {{ video.title }}</div>', 
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
                    console.log(video_data)
                    startVi2(video_data);
                    
                    return video_data;//store.getters.videoById( this.$route.params.id );
                }
            }
        };

        // init router
        const router = new VueRouter({
            routes: [
                { path: '/videos', component: Video },
                { path: '/videos/:id/view', component: Video },
                { path: '/videos/:id/edit', component: Video }
            ]
        });


        var app4 = new Vue({
            el: '#app-videomanager',
            router,
            data: {
                paginate: ['videolist']
            },
            computed: {
                columnObject: function () { //console.log(JSON.stringify(this.videos))
                    return "col-xs-12 col-sm-5 col-md-2 video-item ";
                },
                videos() {
                    return store.state.videos;
                }
            }
        });


        /*
                var form = new Vue({
                    el: '#app-form',
                    //router,
                    data: { videos: data, form_schema: filterSchema },
                    // computed: {
                    render: function (createElement) {
                        var form_elements = [];
                        // consider dublin core meta data
                        var meta = [['title', 'Titel'],
                        ['description', 'Beschreibung'],
                        ['subject', 'Fach'],
                        ['tags', 'Schlüsselwörter'],
                        ['Creator', 'Ersteller'],
                        ['publisher', 'Herausgeber'],
                        ['institution', 'Institution'],
                        ['source', 'Quelle'],
                        ['language', 'Sprache'],
                        ['license', 'Lizenz'],
                        ['rights', 'Urheberrechte'],
                        ['relation', 'Relation'],
                        ['coverage', 'Bereich']];
                        for (var i = 0, len = meta.length; i < len; i++) {
                            form_elements.push(createElement(
                                'label',
                                {
                                    attrs:
                                        {
                                            for: 'text',
                                        }
                                },
                                meta[i][1]
                            )
                            );
                            form_elements.push(createElement(
                                'input',
                                {
                                    attrs:
                                        {
                                            type: 'text',
                                            id: meta[i][0],
                                            'v-model': meta[i][0]
                                        }
                                }
                            )
                            );
                            form_elements.push(createElement('br'));
                        }
                        // consider categories
                        for (var i = 0, len = this.form_schema.data.length; i < len; i++) {
                            var items = [];
                            // h
                            items.push(createElement('h4', {}, this.form_schema.data[i].name));
                            for (var j = 0, len2 = this.form_schema.data[i].items.length; j < len2; j++) {
                                var combi = [];
                                // input
                                combi.push(
                                    createElement(
                                        'input',
                                        {
                                            attrs:
                                                {
                                                    type: this.form_schema.data[i].type === 'single' ? "radio" : "checkbox",
                                                    id: this.form_schema.data[i].id + '-' + j,
                                                    name: this.form_schema.data[i].id,
                                                    value: this.form_schema.data[i].items[j],
                                                    'v-model': this.form_schema.data[i].id
                                                }
                                        },
                                        this.form_schema.data[i].items[j]
                                    )
                                );
                                // label
                                combi.push(
                                    createElement(
                                        'label',
                                        {
                                            attrs: { for: this.form_schema.data[i].id }
                                        },
                                        this.form_schema.data[i].items[j]
                                    )
                                );
                                items.push(createElement('div', { class: { 'col-md-4': true } }, combi));
                            }
                            var el = createElement('div', { class: { 'row': true, 'col-md-8': true } }, items);
                            form_elements.push(el);
                        }
                        // consider video data
        
                        // done
                        return createElement('div', form_elements);
                    }
                    //}
                });
        
        */
    } // end con()



    get_ws('videodatabase_videos', { 'courseid': 2 }, con);
    //get_ws('videodatabase_video', { 'courseid': 2, 'videoid':165 }, con);


    /************************/

    var filterSchema = {
        "language": "de",
        "version": 1,
        "data": [
            {
                "id": "sports",
                "name": "Sportart",
                "type": "single",
                "level": 1,
                "items": [
                    "Fußball",
                    "Handball",
                    "Barren",
                    "Judo",
                    "Handball",
                    "Volleyball"
                ]
            },
            {
                "id": "movements",
                "name": "Bewegungsfelder",
                "type": "single",
                "level": 1,
                "items": [
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
                "id": "group",
                "name": "Lerngruppe",
                "type": "multi",
                "level": 1,
                "items": [
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
                "id": "actors",
                "name": "Akteure",
                "type": "single",
                "level": 2,
                "items": [
                    "Lehrer/in",
                    "Schüler/in"
                ]
            },
            {
                "id": "location",
                "name": "Ort",
                "type": "single",
                "level": 2,
                "items": [
                    "Sporthalle",
                    "Schwimmhalle",
                    "Outdoor"
                ]
            },
            {
                "id": "compentencies",
                "name": "Fachbezogene Kompetenzen",
                "type": "multi",
                "level": 2,
                "items": [
                    "Bewegen und Handeln",
                    "Reflektieren und Urteilen",
                    "Interagieren",
                    "Methoden anwenden"
                ]
            },
            {
                "id": "activities",
                "name": "Aktivitäten",
                "type": "multi",
                "level": 2,
                "items": [
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
                "id": "perspectives",
                "name": "Pädagogische Perspektiven",
                "type": "multi",
                "level": 2,
                "items": [
                    "Leistung",
                    "Wagnis",
                    "Gestaltung",
                    "Körpererfahrung",
                    "Kooperation",
                    "Gesundheit"
                ]
            }
        ]
    };
    // console.log(JSON.stringify(json));

    $(document).ready(function () {

        // render filter
        var arr = [];
        $.each(filterSchema.data, function (j, val) {
            arr = [
                // '<label>'+ val.name +'</label>',
                '<select id="filter_' + val.id + '" class="sel2 ' + (val.type === 'multi' ? 'multi-filter"' : 'single-filter') + '" ' + (val.type === 'multi' ? 'multiple="multiple"' : '') + '>',
                '<option class="option-head" value="" selected>' + val.name + ' (alle)</option>'
            ];
            for (var i = 0; i < val.items.length; i++) {
                arr.push('<option value="' + val.id + '-' + val.items[i].replace(/\//g, '').replace(/,\ /g, '').replace(/\ /g, '') + '">' + val.items[i] + '</option>');
            }
            arr.push('</select>');
            if (j === 1 || j === 4) {
                arr.push('<br>');
            }
            $('#filter' + val.level).append(arr.join(''));
        });

        var filters = {};

        $('#filter_actors').change(function () {
            if (this.value === "") {
                filters.actors = 'null';
            } else {
                filters.actors = this.value;
            }
            applyFilter();
        });

        $('#filter_location').change(function () {
            if (this.value === "") {
                filters.location = 'null';
            } else {
                filters.location = this.value;
            }
            applyFilter();
        });


        $('#filter_movements').change(function () {
            if (this.value === "") {
                filters.movements = 'null';
            } else {
                filters.movements = this.value;
            }
            applyFilter();
        });

        $('#filter_sports').change(function () {
            if (this.value === "") {
                filters.sports = 'null';
            } else {
                filters.sports = this.value;
            }
            applyFilter();
        });

        // multi
        $('#filter_activities').change(function () { // alert($(this).val())
            // reset
            $(this).find('option').each(function (i, val) {
                filters['activities_' + $(val).attr('value')] = 'null';
            });
            // set
            $('#filter_activities :selected').each(function (i) {
                filters['activities_' + $(this).attr('value')] = $(this).attr('value');
            });
            applyFilter();
        });

        $('#filter_compentencies').change(function () { // alert($(this).val())
            // reset
            $(this).find('option').each(function (i, val) {
                filters['compentencies_' + $(val).attr('value')] = 'null';
            });
            // set
            $('#filter_compentencies :selected').each(function (i) {
                filters['compentencies_' + $(this).attr('value')] = $(this).attr('value');
            });
            applyFilter();
        });

        $('#filter_perspectives').change(function () { //alert($(this).val())
            // reset
            $(this).find('option').each(function (i, val) {
                filters['perspectives_' + $(val).attr('value')] = 'null';
            });
            // set
            $('#filter_perspectives :selected').each(function (i, val) {
                filters['perspectives_' + $(this).attr('value')] = $(this).attr('value');
            });
            applyFilter();
        });

        $('#filter_group').change(function () { // alert($(this).val())
            // reset
            $(this).find('option').each(function (i, val) {
                filters['group_' + $(val).attr('value')] = 'null';
            });
            // set
            $('#filter_group :selected').each(function (i, val) {
                filters['group_' + $(this).attr('value')] = $(this).attr('value');
            });
            applyFilter();
        });

        function applyFilter() {
            var filter_str = 'div';
            $('.video-item').hide();
            // apply logical AND 
            for (var f in filters) {
                if (filters.hasOwnProperty(f) && filters[f] !== 'null' && filters[f] !== '') {
                    filter_str += '.' + filters[f] + '';
                }
            }
            // alert('_'+filter_str)
            $('#the_filters').find(filter_str).show();


        }


        /*require(['json!mod_videodatabase/data/category-schema-de.json'], function(data){
              console.log(data)
          }, function(err) {
              console.log(err)
          })*/


    }); // end documents ready
    return Filters;
}); // end define
    /* jshint ignore:end */
