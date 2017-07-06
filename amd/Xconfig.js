define([], function() {
	console.log("9")
	window.requirejs.config({
			//enforceDefine : false,
			paths: {
		     // "btable": '/mod/videodatabase/js/bootstrap-table.js'
		      "btable": '/mod/videodatabase/js/test.js'
		  },
		  shim: {
		      'btable' : {
		      	deps: ['jquery','core/url'],
		      	exports: 'btable'
		  		}
		  }
	});
});	
