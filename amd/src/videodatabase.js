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
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/lib/vue.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/lib/vue-router.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/lib/vue-i18n.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/datamodel.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/components/Store.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/components/Form.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/components/Video.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/components/Comments.js',
    M.cfg.wwwroot + '/mod/videodatabase/amd/src/components/Utils.js'
    // 'amd/src/vuejs-paginator.js',
    //'amd/src/lib/vfg.js',
    //'amd/src/lib/axios.min.js',
],
    function (
        $,
        Vue,
        VueRouter,
        VueI18n,
        Datamodel,
        Store,
        Form,
        Video,
        Comments,
        Utils
        // VuePaginator,
        //  VueFormGenerator,
        // Axios,
    ) {
        var datamodel = new Datamodel();

        var course = {
            id: parseInt($('#courseid').html()),
            module: parseInt($('#moduleid').html())
        };
        var utils = new Utils();

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
            Vue.use(VueI18n);

            const utils = new Utils();
            const vuestore = new Store(data, course);
            const store = vuestore.store;
            const videovue = new Video(store, course, user, $('#token').text());
            const video = videovue.video;
            const commentsvue = new Comments(store, course, user, $('#token').text(), utils);
            const comments = commentsvue.comments;
            const form = new Form(store, course, datamodel, utils);

            // init router
            router = new VueRouter({
                routes: [
                    { path: '/videos' },
                    { path: '/videos/:id/view', component: video },
                    { path: '/videos/:id/edit', component: form.Form },
                    { path: '/videos/new', component: form.Form },
                    { path: '/comments', component: comments }
                ],
                scrollBehavior: function (to, from, savedPosition) {
                    return { x: 0, y: 405 };
                }
            });

            const messages = {
                en: {
                    message: {
                        video_db_title: 'Videos',
                        'teacher': "Teacher",
                        'pupil': "Pupils",
                        'ccby': "Creative Commons CC-BY",
                        'pd': "Public Domain",
                        'r': "Rights Reserved",
                        'football': "Fußball",
                        'handball': "Handball",
                        'barren': "Barren",
                        'judo': "Judo",
                        'volleyball': "Volleyball",
                        'athletics': "Leichtathletik",
                        'movement': "Bewegen und Handeln",
                        'reflexion': "Reflektieren und Urteilen",
                        'interaction': "Interagieren",
                        'methods': "Methoden anwenden",
                        'eingangsstufe': "Eingangsstufe",
                        'unterstufe': "Unterstufe",
                        'mittelstufe': "Mittelstufe",
                        'werkstufe': "Werkstufe",
                        'k1': "Klassenstufe 1",
                        'k2': "Klassenstufe 2",
                        'k3': "Klassenstufe 3",
                        'k4': "Klassenstufe 4",
                        'k5': "Klassenstufe 5",
                        'k6': "Klassenstufe 6",
                        'k7': "Klassenstufe 7",
                        'k8': "Klassenstufe 8",
                        'k9': "Klassenstufe 9",
                        'k10': "Klassenstufe 10",
                        'k11': "Klassenstufe 11",
                        'k12': "Klassenstufe 12",
                        'k13': "Klassenstufe 13",
                        'lsws': "Laufen, Springen, Werfen, Stoßen",
                        'games': "Spiele",
                        'ass': "Bewegung an Geräten",
                        'fight': "Kämpfen nach Regeln",
                        'moves': "Bewegungsfolgen gestalten und darstellen",
                        'water': "Bewegen im Wasser",
                        'cycling': "Fahren, Rollen, Gleiten",
                        'action1': "Abbauen",
                        'action2': "Aufbauen",
                        'action3': "Begründen",
                        'action4': "Beraten",
                        'action5': "Beschreiben",
                        'action6': "Besprechen",
                        'action7': "Beurteilen",
                        'action8': "Demonstrieren",
                        'action9': "Disziplinieren",
                        'action10': "Erklären",
                        'action11': "Feedback, Korrektur",
                        'action12': "Gesprächsrunde",
                        'action13': "Gruppenbildung",
                        'action14': "Helfen",
                        'action15': "Kooperieren",
                        'action16': "Medieneinsatz",
                        'action17': "Motivieren",
                        'action18': "Organisieren",
                        'action19': "Präsentieren",
                        'action20': "Sichern",
                        'action21': "Störung",
                        'action22': "Üben",
                        'persp1': "Leistung",
                        'persp2': "Wagnis",
                        'persp3': "Gestaltung",
                        'persp4': "Körpererfahrung",
                        'persp5': "Kooperation",
                        'persp6': "Gesundheit",
                        'hall': "Sporthalle",
                        'pool': "Schwimmhalle",
                        'outdoor': "Outdoor"
                    }
                },
                de: {
                    message: {
                        video_db_title: 'Videos',
                        'teacher': "Lehrer/in",
                        'pupil': "Schüler/in",
                        'ccby': "Creative Commons CC-BY",
                        'pd': "Public Domain",
                        'r': "Rights Reserved",
                        'football': "Fußball",
                        'handball': "Handball",
                        'barren': "Barren",
                        'judo': "Judo",
                        'volleyball': "Volleyball",
                        'athletics': "Leichtathletik",
                        'movement': "Bewegen und Handeln",
                        'reflexion': "Reflektieren und Urteilen",
                        'interaction': "Interagieren",
                        'methods': "Methoden anwenden",
                        'eingangsstufe': "Eingangsstufe",
                        'unterstufe': "Unterstufe",
                        'mittelstufe': "Mittelstufe",
                        'werkstufe': "Werkstufe",
                        'k1': "Klassenstufe 1",
                        'k2': "Klassenstufe 2",
                        'k3': "Klassenstufe 3",
                        'k4': "Klassenstufe 4",
                        'k5': "Klassenstufe 5",
                        'k6': "Klassenstufe 6",
                        'k7': "Klassenstufe 7",
                        'k8': "Klassenstufe 8",
                        'k9': "Klassenstufe 9",
                        'k10': "Klassenstufe 10",
                        'k11': "Klassenstufe 11",
                        'k12': "Klassenstufe 12",
                        'k13': "Klassenstufe 13",
                        'lsws': "Laufen, Springen, Werfen, Stoßen",
                        'games': "Spiele",
                        'ass': "Bewegung an Geräten",
                        'fight': "Kämpfen nach Regeln",
                        'moves': "Bewegungsfolgen gestalten und darstellen",
                        'water': "Bewegen im Wasser",
                        'cycling': "Fahren, Rollen, Gleiten",
                        'action1': "Abbauen",
                        'action2': "Aufbauen",
                        'action3': "Begründen",
                        'action4': "Beraten",
                        'action5': "Beschreiben",
                        'action6': "Besprechen",
                        'action7': "Beurteilen",
                        'action8': "Demonstrieren",
                        'action9': "Disziplinieren",
                        'action10': "Erklären",
                        'action11': "Feedback, Korrektur",
                        'action12': "Gesprächsrunde",
                        'action13': "Gruppenbildung",
                        'action14': "Helfen",
                        'action15': "Kooperieren",
                        'action16': "Medieneinsatz",
                        'action17': "Motivieren",
                        'action18': "Organisieren",
                        'action19': "Präsentieren",
                        'action20': "Sichern",
                        'action21': "Störung",
                        'action22': "Üben",
                        'persp1': "Leistung",
                        'persp2': "Wagnis",
                        'persp3': "Gestaltung",
                        'persp4': "Körpererfahrung",
                        'persp5': "Kooperation",
                        'persp6': "Gesundheit",
                        'hall': "Sporthalle",
                        'pool': "Schwimmhalle",
                        'outdoor': "Outdoor"
                    }
                }
            };

            const i18n = new VueI18n({
                locale: 'de', // set locale
                messages, // set locale messages
            });



            var Main = new Vue({
                el: '#app-videomanager',
                router,
                i18n,
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
                    console.log(11);
                    var _this = this;
                    utils.get_ws('ratings', {
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
                            console.log(data);
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
                        utils.get_ws('get_log', {
                            'courseid': course.id,
                        }, function (data) { //console.log(data)

                            // extract log entries from result set
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


        utils.get_ws('videos', { 'courseid': course.id }, connection_handler);



        /**
         * CSV Export
         * xxx: auslagern
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
                    if (result.search(/("|,|\n)/g) >= 0) {
                        result = '"' + result + '"';
                    }
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
         * xxx: auslagern
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