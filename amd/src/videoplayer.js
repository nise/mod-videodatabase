 /**
  * @module block_overview/videoplayer
  */

/* jshint ignore:start */
define(['jquery', 'core/log'], function($, log) {  // 'mod_videodatabase/jquery.select2',  'mod_videodatabase/test'
	return {   	
		test : function(data){ 
			alert(33)
		},
  	init : function(data){ 
  		$(document).ready(function() {
  			alert(44)
  			var Vi2 = {};  
 				var files = [
  				{path: 'data.json', storage: 'json_data'}
  			, {path: 'data-slides.min.json', storage: 'json_slide_data'}
				];
		
				db = new Vi2.DataBase( {path: './', jsonFiles: files }, this, 'test');
 				alert(44);
			});// doc.ready
  	}// end init
	}; 
});
/* jshint ignore:end */
