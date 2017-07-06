 /**
  * @module block_overview/videodatabase
  */
define(['jquery'], function($) { // 'jquery'
	// wraper
	alert(33)
	console.log(3333);
  var t = {  
  	init : function(){
  		$('.hhh').text('neu');
  		var tt = $('body').find('div').length;
  		console.log(99);
  		//$('.sel2').select2();
  		//
  		//this.test('hello');
  	},
  	
    test : function(data) { 
//    	var tt = $('body').find('div').length;
    	
        /** @access private */
				/*
				$(document).ready(function(){ 
					
					//$(".js-example-basic-multiple").select2();
					var filter = { "language":"de", "version":1, "data":[ { "id":"compentencies", "name":"Fachbezogene Kompetenzen", "type":"single", "items":[  "Bewegen und Handeln",  "Reflektieren und Urteilen",  "Interagieren",  "Methoden anwenden" ] }, { "id":"movements", "name":"Bewegungsfelder", "type":"single", "items":[  "Laufen, Springen, Werfen, Stoßen",  "Spiele",  "Bewegung an Geräten",  "Kämpfen nach Regeln",  "Bewegungsfolgen gestalten und darstellen",  "Bewegen im Wasser",  "Fahren, Rollen, Gleiten" ] }, { "id":"activities", "name":"Aktivitäten", "type":"multi", "items":[  "Abbauen",  "Aufbauen",  "Begründen",  "Beraten",  "Beschreiben",  "Besprechen",  "Beurteilen",  "Demonstrieren",  "Disziplinieren",  "Erklären",  "Feedback, Korrektur",  "Gesprächsrunde",  "Gruppenbildung",  "Helfen",  "Kooperieren",  "Medieneinsatz",  "Motivieren",  "Organisieren",  "Präsentieren",  "Sichern",  "Störung",  "Üben" ] }, { "id":"actors", "name":"Akteure", "type":"single", "items":[  "Lehrer/in",  "Schüler/in" ] }, { "id":"perspectives", "name":"Pädagogische Perspektiven", "type":"multi", "items":[  "Leistung",  "Wagnis",  "Gestaltung",  "Körpererfahrung",  "Kooperation",  "Gesundheit" ] }, { "id":"location", "name":"Ort", "type":"single", "items":[  "Sporthalle",  "Schwimmhalle",  "Outdoor" ] }, { "id":"group", "name":"Lerngruppe", "type":"multi", "items":[  "Klassenstufe 1",  "Klassenstufe 2",  "Klassenstufe 3",  "Klassenstufe 4",  "Klassenstufe 5",  "Klassenstufe 6",  "Klassenstufe 7",  "Klassenstufe 8",  "Klassenstufe 9",  "Klassenstufe 10",  "Klassenstufe 11",  "Klassenstufe 12",  "Klassenstufe 13",  "Eingangsstufe",  "Unterstufe",  "Mittelstufe",  "Werkstufe" ] } ] };	
			
					for(var i = 0; i < filter.data.length; i++){ 
						var select = '';
						select = $('<select>eee</select>')
							.addClass('select2-filter')
							.attr('multiple','multiple')
							;// "+ filter.data[i].type === 'multiple' ? 'multiple' : '' +"
						for(var j = 0; j < filter.data[i].items.length; j++){ 
							select.append($("<option>" + filter.data[i].items[j] + "</option>"));
							//value='" + filter.data[i].items[j] + "'
						}

						$('#videofilter').append( select );
						//$(select).select2();
					}
					
				});	
				//var tt = $('body').find('div').length;
        //alert(tt);
        */
    },
    
    
     /*
     * 
     **/
    loadFilters : function(){ 

    } // end setupFilters
	}; 
  return t;
});
