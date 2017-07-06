

				
			

define(['jquery', 'core/log'], function($, log) {  // 'mod_videodatabase/jquery.select2',  'mod_videodatabase/test'
	var
		vi2 = this,
		viLog = '',
		vi2.dom = "#vi2",
		vi2.templatePath = "views/",
		observer = undefined, 
		vi2 = undefined, 
		ocr = undefined
		;
		
	return {   	
		test : function(data){ 
			var Vi2 = {}; // set the Namespace
			$(document).ready(function(){ 
				this.init();
			});
		},
  	init : function(data){ 
			alert(33)
			var files = [
					{path: 'data.json', storage: 'json_data'}
					, {path: 'data-slides.min.json', storage: 'json_slide_data'}
			];
		
			vi2.db = new Vi2.DataBase( {path: './', jsonFiles: [] }, this, 'init');
			vi2.db.json_data = [
					{
						"id": "test",
						"metadata":[{
							"selector":"#metadata",
							"author": "Prof. Dr. D. Borchardt",
							"institution": "Helmholtz Centre for Environmental Research - UFZ,Head of Department of Aquatic Ecosystems Analysis and Management,Magdeburg,Germany / Technische Universität Dresden,Department of Hydrosciences,Professor in Aquatic Ecosystem Analysis and Management,Dresden,Germany",
							"title": "Introduction to Integrated Water Resources Management (IWRM)",
							"category": "-- General Introduction --",
							"abstract": "This lecture is meant as a brief, overall introduction to the concept of IWRM, both from a conceptual perspective and concerning challenges in its practical implementation. It addresses sectoral water use and related approaches in water resources management, explains the integrative concept’s history and principles, illustrates a number of predominant characteristics and draws particular focus on its river basin aspect. The lecture finally closes by emphasizing the importance of capacity development in IWRM.",
							"length": 80,
							"date": "2012/10/01",
							"weight": 5,
							"titleselector":"h2"
						}],
						"video": "http://localhost/movie.webm",
						"tags": [
							{"tagname":"IWRM","occ":[0]},
							{"tagname":"sectors in water use","occ":[0]},
							{"tagname":"water management principles","occ":[0]},
							{"tagname":"river basin perspective","occ":[0]},
							{"tagname":"capacity development","occ":[0]}
						],
						"toc": [
							{"label":"Introduction to IWRM","duration":1,"start":"0"},
							{"label":"Content","duration":1,"start":"85.200"},
							{"label":"1. Why do we need a better water management?","duration":1,"start":"125.44"},
							{"label":"2. What is IWRM?","duration":1,"start":"1546.6"},
							{"label":"3. History of IWRM","duration":1,"start":"1730.36"},
							{"label":"4. Water management principles","duration":1,"start":"2021.92"},
							{"label":"5. Sectoral perspectives in IWRM","duration":1,"start":"2558.88"},
							{"label":"6. Implementing IWRM & IWRM process","duration":1,"start":"3472.32"},
							{"label":"7. Water Management at River Basin Scale","duration":1,"start":"3909.6"},
							{"label":"8. IWRM and capacity development (CD)","duration":1,"start":"4159.68"},
							{"label":"References","duration":1,"start":"4751.8"}
						],
						"links":[]
					}	
				];
		
		
			alert(22)
			this.viLog = new Vi2.Log({logger_path:this.server_url+'/log'}/**/); 
					
			vi2.utils = new Vi2.Utils();
			
			vi2.observer = new Vi2.Observer({selector:"#seq", videoWidth:"400px", videoHeight:"800px"}); 
			vi2.observer.init(0);  
			vi2.observer.setCurrentStream('test'); 
	
		
			//this.loadConfig();
		
			var videoManager = new Vi2.VideoManager(); 
			vi2.observer.addWidget( videoManager ); 
			videoManager.init();
			vi2.videoManager = videoManager;
	
			var playbackSpeed = new Vi2.PlaybackSpeed();
			var skipBack = new Vi2.SkipBack();
			vi2.observer.addWidget( playbackSpeed );  
			vi2.observer.addWidget( skipBack ); 
		}// end init
	}; // end return
});
/* jshint ignore:end */

