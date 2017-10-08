/**
 * @module block_overview/videodatabase
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/* jshint ignore:start */
define(['jquery', 'core/log', 'mod_videodatabase/jquery.dataTables'], function ($, log) {

    return {       
        init: function (type) {
			log.debug('started');
            if (type === undefined) {
                type = 'table';
            }
            var filter_schema = {
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
            //console.log(JSON.stringify(json));

            $(document).ready(function () { 
                $('#debug').html(999);

                //console.log(JSON.parse(JSON.stringify(data)))
                if (type === 'table') {
                    var table = $('#the_videotable').DataTable({
                        "order": [],
                        paging: false
                    });
                }
				// render filter
				
				var arr = [];
                $.each(filter_schema.data, function (j, val) {
                    arr = [
                        //'<label>'+ val.name +'</label>',
                        '<select id="filter_' + val.id + '" class="sel2 ' + (val.type === 'multi' ? 'multi-filter"' : 'single-filter') + '" ' + (val.type === 'multi' ? 'multiple="multiple"' : '') + '>',
                        '<option class="option-head" value="" selected>' + val.name + ' (alle)</option>' // disabled 
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
                $('#filter_activities').change(function () { //alert($(this).val())
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

                $('#filter_compentencies').change(function () { //alert($(this).val())
                    // reset
                    $(this).find('option').each(function (i, val) {
                        filters['compentencies_' + $(val).attr('value')] = 'null';
                    });
                    // set
                    $('#filter_compentencies :selected').each( function (i) {
                        filters['compentencies_' + $(this).attr('value')] = $(this).attr('value');
                    });
                    applyFilter();
                });

                $('#filter_perspectives').change( function () { //alert($(this).val())
                    // reset
                    $(this).find('option').each( function (i, val) {
                        filters['perspectives_' + $(val).attr('value')] = 'null';
                    });
                    // set
                    $('#filter_perspectives :selected').each(function (i, val) {
                        filters['perspectives_' + $(this).attr('value')] = $(this).attr('value');
                    });
                    applyFilter();
                });

                $('#filter_group').change(function () { //alert($(this).val())
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
                    var filter_str = type === 'table' ? 'tr' : 'div';
                    // apply logical AND 
                    for (var f in filters) {
                        if (filters.hasOwnProperty(f) && filters[f] !== 'null' && filters[f] !== '') {
                            filter_str += '.' + filters[f] + '';
                        }
                    }
                    //alert('_'+filter_str)
                    if (type === 'table') {
                        $('#the_videotable tbody tr').hide();
                        $('#the_videotable tbody').find(filter_str).show();
                    } else {
                        $('#the_videotable > div').hide();
                        $('#the_videotable').find(filter_str).show();
                    }

                }


              /*require(['json!mod_videodatabase/data/category-schema-de.json'], function(data){
                    console.log(data)
                }, function (err) {
                    console.log(err)
                })*/


            });
        }
    };
});
/* jshint ignore:end */
