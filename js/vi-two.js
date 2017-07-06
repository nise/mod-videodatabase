/* 
* name: Vi2.Observer 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
* - bug: current_stream / video is wrong
* - complete interfaces for the player
*	- clear overlay-container and other at updateVideo()
*	- allow page back, offer bread crumb menu, ...
*	- RSS: http://code.google.com/apis/youtube/2.0/reference.html
**/
	
Vi2.Observer = $.inherit(/* @lends Observer# **/{
	
	/* 
	 *		@constructs
	 *		@params {object} options  
	 **/
	__constructor : function(options) {
		vi2.observer = this; 
		this.options = $.extend(this.options, options); 
		this.widget_list = {}; // Assoc Array is an Object // Object.size(this.widget_list)
		this.clock = new Vi2.Clock(this.options.clockInterval);
	},
	
	// defaults
	name : 'observer',
	options : {
		id: 'start', 
		embed: true, 
		selector: '#screen', 
		clockInterval: 500, 
		videoSelector: '#video1', 
		videoWidth:500, 
		videoHeight:375, 
		videoControlsSelector:'.video-controls', 
		markupType: 'wiki', 
		childtheme:''
	},
	pieList : $('<ul></ul>').attr('class', 'pieContextMenu').attr('id', 'menu'),
	player : undefined,
	clock : undefined,
	parseSelector : '',
	widget : undefined,
	widget_list : [],
	hooks : [],
	vid_arr : [],
	current_stream : 'start',
	seek : 0,
	parser : '',
	
	
	/*
	 *
	 **/
	setCurrentStream : function(stream, seek){  
		this.current_stream = stream;
		this.seek = seek; 
		
		// append video
	  var video = $('<div></div>')
				.attr('type',"video")
				.attr('starttime',0)
				.attr('duration',7)
				.attr('id', "myvideo")
				.text(vi2.db.getStreamById(stream).video)
				.appendTo('#vi2');	
		//this.annotationsToDOM();
		// restart the clock
		this.clock.stopClock();
		this.clock.reset(); 
		// generate and render metadata
		var metadata = new Vi2.Metadata();  
		// re-parse DOM
		this.parse(vi2.dom, 'html'); 
		
	},


	/*
	 *
	 **/
	parse : function(selector, markupType){ 
		this.parseSelector = selector;
		this.parser = new Parser(selector, markupType === null ? this.markupType : markupType);
		this.vid_arr = [];  
		this.vid_arr = this.parser.run(); 
		this.clock.stopClock(); 
		this.clock.reset();  
		this.player.loadSequence(this.vid_arr, 0, this.seek );  				
	},
	

	/*
	 * Initialize the video player and the bindings to it.
	 **/
	init : function(seek){   
		var _this = this; 
	
		this.player = new Video({
				embed: this.options.embed, 
				selector: this.options.videoSelector, 
				width:this.options.videoWidth, 
				height:this.options.videoHeight, 
				videoControlsSelector: this.options.videoControlsSelector, 
				theme:this.options.theme, 
				childtheme:this.options.childtheme,
				thumbnail: this.options.thumbnail, 
				seek: seek === undefined ? 0 : seek
			}, this); 
		
		// some event bindings hooks
		$(this).bind('player.ready', function(e, id, i){  
			_this.setAnnotations(); 
		});
	},
	
	
	/*
	 *
	 **/
	setAnnotations : function(){  
		var _this = this; 
		this.clock.annotations = [];			 
		this.vid_arr = this.parser.run(); 

		// add Annotations at the clock
		$.each(_this.vid_arr[0].annotation, function(i, val){ 		
			_this.clock.addAnnotation(val); 
		}); 

		// initializes widgets
		$.each(_this.widget_list, function(j, widget){ 
			if( widget.type !== 'player-widget' ){ 
				widget.init( _this.vid_arr[0].annotation );			
			}else{ 
				widget.init(); 
			}	
		});
	},
  		
	
	/* 
	 *
	 **/
	updateLocation : function(identifier, value){ 
		window.location.replace(window.location.href.split('#')[0] + '#!'+identifier+':'+value.replace(/\ /g, '_'));
	},
  		  		

	/* 
	 * Add a new widget to the observer by binding events to it. One a widget has been added it can become accessible in the player or video environment.
	 **/
	addWidget : function( obj ){ 
		var _this = this;   	
		obj.player = this.player; // xxx: no good style / tell the widget about the player 
		this.clock.addHook(obj.name, obj);	

		if( obj.type === 'annotation' ){
			// convert annotations into DOM elements that will be parsed later on.   
			obj.appendToDOM( this.current_stream );
			// bind time-depending events for begin and end of an annotation to the player
			$(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
			$(this.player).bind('annotation.end.'+obj.name, function(e, a, b){ obj.end(e, a, b);});
		}	

		// xxx: needs to be put into widgets
		switch(obj.name){
			case 'relatedVideos' :
				$(this.player).bind('video.end', function(e, a){ obj.showLinkSummary(); });
				break;  
			case 'log' :
				$(this.player).bind('log', function(e, msg){ obj.add(msg); });
				break;
		}
	
		// put widget to the list of registered / added widgets
		this.widget_list[obj.name] = obj;
		//   
		return true; 
	},
	
	
	/* 
		* Returns true or false whether the given string is the name of an registered widget or not. 
		**/
	isWidget : function(widget){
		return this.widget_list[widget] !== null;	
	},
	
	
	/* 
	 * Returns the widget object to the given name. 
	 **/
	getWidget : function(widget_name){
		return this.widget_list[widget_name];
	},
	
	
	/*
	 * Removes widget from widget_list
	 **/
	removeWidget : function(widget_name){
		// bugy?
		this.widget_list[widget_name] = 0;
	},
	
	
	/* 
	 * appends all annotation data of the widgets to DOM of the current HTML page
	 **/
	annotationsToDOM : function(){ 
		var _this = this; 
		$.each(this.widget_list, function(i, widget){ 
			if(widget.type === 'annotation'){  
				widget.appendToDOM( _this.current_stream ); 
			}
		});
	},
  		  		

	/*
	* xxx
	**/
	ended : function(){ 
		//this.clock.reset(); // if enabled slide sync does not work after vides has ended.
	},


	/*
	 *
	 **/
	pause : function(){ 
		this.clock.stopClock();
	},


	/*
	 *
	 **/
	play : function(){ 
		//this.clock.startClock();
	},


	/*
	 * Proxy function to trigger the logger
	 **/
	log : function(msg){
		$(this.player).trigger('log', [msg]);
	},


	/*
	 *
	 **/
	destroy : function(){
		$('video').stop();
		this.clock.reset();
		$('#vi2').empty();
	}
  		
});// end 
	
	
		
/* DataBase
* author: niels.seidel@nise81.com
* license: MIT License

* todo:
- call_back als Event umsetzen
- filenames as parameter
- handle different data sets

*/


	/* class DataBase **/ 
	Vi2.DataBase = $.inherit(/** @lends DataBase# */{

		/** 
		*		@constructs
		*		@param {object} options An object containing the parameters
		*		@param {function} call_back Function that will be called after relevant data is available 
		*/
  	__constructor : function(options, call_back, fn, video_id) {   
  		this.call_back = call_back;
  		var _this = this;
  		this.options = $.extend(this.options, options); 
  		this._d = 0;   
  		$.each(this.options.jsonFiles, function(key, file) { 
        console.log("making requst for " + file.path);  
        _this.loadJSON(file.path, file.storage, fn);
       });
		},
				
		name : 'dataBase',
		mode : '', // vi-lab
		options : {
			path :'',
			jsonFiles: [
  		//	{path: '/json/videos/', storage: 'json_data'}, 
  		//	{path: '/groups', storage: 'json_group_data'},
				// {path: this.options.path+'data-slides.json', storage: 'json_slide_data'},
  		//	{path: '/json/users', storage: 'json_user_data'}
  		]
		}, // ?
		call_back : {},
		_d : 0,
		json_data : {},
		json_slide_data : {},
		json_user_data : {},
		content_selector : '#content',
		dom : '#hydro1', // unused
		

	/**
	*	@param {Sring} URL of JSON file
	*	@param {Object} Internal Object where the fetched data will be stored for processing within the class 
	*/
	loadJSON : function(jsonURL, storage, fn){ 
		var _this = this;
    $.ajax({
        type: "get",
        beforeSend: function(xhr){
    				if (xhr.overrideMimeType){
				      xhr.overrideMimeType("application/json");
    				}
  			},
        url: _this.options.path + jsonURL,
        dataType: 'json',
        success: function(data){  
            //alert("got " + jsonURL);
            _this[storage] = data;  
            
            //alert(JSON.stringify(_this.json_data.stream))
            _this._d++; 
            if (_this._d === Object.size( _this.options.jsonFiles ) ){ 
            	console.log('done'); 
            	// call
            	_this.call_back[fn]();
            	
            }
            if( _this.mode !== 'vi-lab'  &&  _this.json_data._name !== undefined ){
            	_this.json_data = _this.json_data.stream;
            	//alert(JSON.stringify(_this.json_data))
            }
        },
        error: function(e){ console.log(JSON.stringify(e))
        	var err = new Error('Could not catch data: '+ _this.options.path + jsonURL);
					window.location = "/login"; 
				}
    });
	},


/* DB Calls */	
	
	/* returns true if stream of id exists */
	isStream : function(id){
		var t = false;
		$.each(this.json_data, function(val){
			if (this.id === id){
				t = true;
			}
		});
		return t;
	},
		
	//get stream by id
	getStreamById : function(id){  
		if(this.json_data === undefined){
			return {};
		}else if( this.mode === 'vi-lab' ){
			return this.json_data;
		}else{
			var stream = {};  
			$.each(this.json_data, function(i, val){ 
				if (val.id === id){  
					stream = this; 
				}
			});
			return stream;
		}
	},
			


	/* CATEGORIES*/

	/* returns data of all categories */
	getAllCategories : function(){ 
		return this.json_data.categories;
	},
	
	
	// returns ordered list of all categories
	getCategoryTaxonomie : function(){
		var cat = {};
		$.each(this.json_data.categories, function(i,val){ 
				cat[this.pos] = {first_level: this.title, desc: this.desc};
		}); 
		return cat;
	},
	
	
	/* returns data of the requested category */
	getCategory : function(cat_name){
		var data = {};
		$.each(this.json_data.categories, function(i,val){ 
			if(this.title === cat_name){
				data = {first_level: this.title, desc: this.desc, pos: this.pos, link: this.link, icon:this.icon};
			} 
		}); 
		return data;
	},
	

	/* META DATA */

	//
	getMetadataById : function(id){
		if( this.getStreamById(id) !== undefined ){ 
			return this.getStreamById(id).metadata[0];
		}	
	},
		
	//get all titles
	getTitles : function(){
		var titles = [];
		$.each(this.json_data, function(val){
				titles.push({first_level: this.metadata[0].title});
		});
		return removeDuplicates(titles);
	},
	
	//get all authors
	getAuthors : function(){
		var authors = [];
		$.each(this.json_data, function(val){
				authors.push({first_level: this.metadata[0].author});
		});
		return removeDuplicates(authors);
	},
	
	/* - - */
	getStreamsOfSameAuthor : function(id){
		var author = this.getMetadataById(id).author; 
		var authors = [];
		$.each(this.json_data, function(i, stream){ 
				if(stream.metadata[0].author === author && stream.id != id){ 
					authors.push(stream.id); //$('#debug').val($('#debug').val() + stream.id);
				}
		});
		return authors;
	}, 
	
	

	/* TAGS */	

	/* returns all tags of a video/stream **/
	getTagsById : function(id){
		if(this.json_data.tags === undefined){
			return {};
		}else{
			return this.getStreamById(id).tags;
		}
	},
	
	/* returns all comments related to an video **/
	getCommentsById : function(id){
		if( this.getStreamById(id).comments === null ){
			return {}
		}else{
			return this.getStreamById(id).comments;
		}	
	},
		
	/* returns all tags related to the whole video collection **/
	getTagList : function(){
		var tags = [];
		$.each(this.json_data, function(val){
			$.each(this.tags, function(val){
				tags.push({first_level: this.tagname});
			});
		});
		return this.removeDuplicates(tags).sort();
	},
	
	/* returns ordered list of all tags */
	getTagTaxonomie : function(){ 
		var tax = [];
		$.each(this.json_data._taxonomy, function(i, stream){
			tax.push({first_level: this.id, second_level: this.sub});	
		});
		return tax;
	},
	
	/* -- */ 
	getStreamsWithSameTag : function(id){
		var _this = this;
		var streams = [];
		var tags = this.getStreamById(id).tags; 
		$.each(tags, function(i, the_tag_name){	
			$.each(_this.json_data, function(j, stream){  
				$.each(stream.tags, function(k, tag){ 
					if(this.tagname === the_tag_name.tagname){ 
					 streams.push(stream.id); //$('#debug').val($('#debug').val() +' '+ stream.id);
					}
				});
			});			
		});
		return streams;
	},
	
	
	/* -- */
	getRandomStreams : function( id ){
		var _this = this;
		var streams = [];
		$.each(_this.json_data, function(j, stream){ 
			streams.push(stream.id);
		});
		return streams; // xxx need to be sort random
	},
	
	

	/* LINKS */
	
		/* -- */
	getLinkTargetsById : function(id){
		var links = []; 
		$.each(	this.getStreamById(id).hyperlinks, function(val){ 
			links.push(this.target);  //$('#debug').val($('#debug').val() + this.target);
		});
		return	links;
	},
	
	/* -- */
	getLinkSourcesById : function(id){
		var links = [];	
		$.each(this.json_data, function(i, stream){
			$.each(stream.hyperlinks, function(i, link){
				if(this.target === id){
				 links.push(stream.id); //$('#debug').val($('#debug').val() +' '+ stream.id);
				}
			});
		});			
		return links;	
	},
	
	/* -- */ 	
	getLinksById : function(id){
		return this.getStreamById(id).hyperlinks; 
	},
	
	/* -- */ 	
	getAssessmentFillInById : function(id){
		return this.getStreamById(id).assessmentfillin; 
	},
	
	/* -- */ 	
	getAssessmentWritingById : function(id){
		return this.getStreamById(id).assessmentwriting; 
	},
	
	/* -- */ 	
	getAssessmentById : function(id){
		if(this.json_data.assessment === undefined){
			return {};
		}else{	
			return this.json_data.assessment; 
			//return this.getStreamById(id).assessment;
		}
	},
	
	/* returns all comments related to an video **/
	getAnalysisById : function(id){  
		return this.getStreamById(id).assessmentanalysis === null ? {} : this.getStreamById(id).assessmentanalysis;
	},
	
	
	/* returns table of content of the requested video */
	getTocById : function(id){
		if(this.json_data.toc === undefined){
			return {};
		}else{ 
			return this.getStreamById(id).toc;
		}
	},
	
		/* returns highlight of the requested video */
	getHighlightById : function(id){ 
		if( this.json_data.highlight === undefined ){
			return {};
		}else{ 
			return this.getStreamById(id).highlight;
		}
	},
	
	
	/** 
	*	@param {String} Video id
	*	@returns {Object} JSON object with temporal annotation of images/slides of video with the given id.
	*/ 	  
	getSlidesById : function(id){ 
		//alert(JSON.stringify( this.getStreamById(id)['slides'] ))
		return this.getStreamById(id).slides; 
		/*
		if(this.json_data.slides === undefined){
			return {};
		}else{
			return this.json_data.slides;
		}
		*/
		/*
		var slides = {}; 
		$.each(this.json_data, function(i, val){ 
			if (this._id === id){  
				slides = this.slides;
			}
		}); 
		return slides;
		*/
	}, 
	
	/*
	*
	**/
	hasSlides : function(id){
		if(this.getStreamById(id).slides !== undefined){
			if(this.getStreamById(id).slides.length > 0){
				return true;
			}
		}
		return false;
	},
	
	
	/**
	
	*/
	getUserById : function(id){  //alert(id); alert(this.json_user_data)
		var user = {}; 
		$.each(this.json_user_data, function(i, val){ 
			if( Number(val.id) === Number(id) ){  
				user = val;
			}
		}); 
		return user;
	}, 
		
		
	/**
	
	*/
	getGroupById : function(id){
		var group = {}; 
		$.each(this.json_group_data, function(i, val){ 
			if ( Number(val.id) === Number(id) ){  
				group = val;
			}
		}); 
		return group;
	},
	
	/* --- **/
	getUserByGroupId : function(group, pos){ //alert(group+'  '+pos)
		var u = [];
		$.each(this.json_user_data, function(i, val){ 
			if ( val.groups[pos] === group){  
				u.push( val );
			}
		});
		
		return u;
	}, 
				
	






	

	



	



	
	
	
	
	
	
	
	
	
/* TO CLEAN UP */	

	//
	getVideoById : function(id){ 
		var video = $('<div></div>')
			.attr('type',"video")
			.attr('starttime',0)
			.attr('duration',7)
			.attr('id', "myvideo")
			.text(this.getStreamById(id).video);  
		return video;
	}
	
	/* returns stream by its title  // xxx remove rendering code
	getStreamsByTitle : function(title_name){
		var _this = this;
		var template = $("#item_template").val();
		
		$(_this.content_selector)
			.empty()
			.trigger('clear');
			//.append($('<h2></h2>').text('Lectures in category: '+title_name));

		$.each(this.json_data.stream, function(i, stream){
				if(stream.metadata[0].title == title_name){
					var item =$('<div></div>')
						.addClass('content-item')
						.setTemplate(template)
						.processTemplate(stream)
						.appendTo($(_this.content_selector));
				}
		});
		//$('.text').hidetext();
		// reset drop downs
		$('.getStreamsByTag').val(-1);
		$('.getStreamsByCategory').val(-1);
	},
	*/
	
	
	
	}); // end class DataBase	
/* 
*	name: Vi2.Parser
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- separate widget-code 
	- popcorn.js export/import
	- scorm export?
	- show code box
	- inherit sub parser from Parser
	- write complex testing function
	- apply standard TTML: http://www.w3.org/TR/2010/REC-ttaf1-dfxp-20101118/#example
*/



var Parser = $.inherit(/** @lends Parser# */
	{
			/** 
			*		@constructs 
			*		@param {Selector} selector Indicates the DOM selector that contains markup code to be parsed
			*		@param {String} type Defines which markup, 'wiki' or 'html', is going to be parsed
			*/
  		__constructor : function(selector, type) {
  			this.selector = selector;
  			this.type = type;
  		},
  		
			vid_arr : [],
			selector : '',
			
			/** 
				* Distinguishes the markup type and calls paser routins
				*/
			run : function(){
				switch(this.type){
					case 'wiki' :
						return this.parseWiki();
					case 'html' :
						return this.parseHtml();
				}
			},	
			
			/** 
				* Parses the wiki creole markup
				*/
			parseWiki : function(){ 
				var _this = this;
			  var v_id = -1;
			  // dirty hack for mediawiki xxx
			  $(this.selector).val($(this.selector).val().replace(/\<p\>/, ''));
				// go through markup lines
  			$($(this.selector+' > p').text().split(/\n/)).each(function(i, val){ 
  				if(val.substr(0,8) === "[[Video:" || val.substr(0,8) === "[[video:"){ 
						// parse videos to sequence
						v_id++; 	  				  		
  					_this.vid_arr[v_id] = _this.parseWikiVideo(val);
	  				}else if(val.substr(0,2) === "[["){
	  				// parse hyperlinks related to the latter video 
  					_this.vid_arr[v_id]['annotation'].push(_this.parseWikiHyperlink(val)); //alert('ok_'+val);  					
  				}else{
  					//alert('bug_'+val);
  				}
  			}); 			
				return this.vid_arr;  			
			},
			
			/** 
				* Pareses standard DOM/HTML
				*/
			parseHtml : function(){ 
				var 
					_this = this,
			  	v_id = -1,
			  	arr = [],
			  	obj = {},
			  	t = 0
			  ;
  			$('div'+this.selector+' div').each(function(i, val){ 
  				
  				t = new Date()
  				obj = {};	
  				obj.author = $(this).attr('author') === undefined ? '' : $(this).attr('author');
  				obj.date = $(this).attr('date') === undefined ? t.getTime() : $(this).attr('date');
  				obj.type = $(this).attr('type') === undefined ? 'none' : $(this).attr('type');
  				
  				if($(this).attr('type') === "video"){ 
  					// video
  					arr = {}; 
  					arr['id'] = $(this).attr('id'); 
  					arr['url'] = $(this).text();
  					arr['seek'] = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
  					arr['duration'] = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration');
  					arr['annotation'] = []; 
						v_id++; 
  					_this.vid_arr[v_id] = arr; 
  					
  				}else if($(this).attr('type') === "hyperlinks"){ 
  					// standard and external links
  					obj.title = $(this).text(); 
						obj.description = $(this).attr('description');
						obj.target = $(this).attr('target');
						obj.linktype = 'standard';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration');
						obj.seek = $(this).attr('seek');
						obj.duration2 = $(this).attr('duration2'); 

						// distinguish external links
						var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
						var regex = new RegExp(expression);
						if ( (obj.target).match(regex) ){ 
							obj.linktype = 'external'; 
						}
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
  				}else if($(this).attr('type') === "cycle"){ 
  					// cycle
  					obj.title = $(this).text();
						obj.target = $(this).attr('target');
						obj.description = $(this).attr('description');
						obj.linktype = 'cycle';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration'); 
						obj.seek = $(this).attr('seek');
						obj.duration = $(this).attr('duration2'); 
  					_this.vid_arr[v_id]['annotation'].push(obj);
  	  					 			
  				}else if($(this).attr('type') === "syncMedia"){
  					// sequential media such as pictures
  					obj.title = $(this).text();
						obj.target = $(this).attr('path');
						obj.linktype = '';
						obj.x = 0;
						obj.y = 0;
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
					}else if($(this).attr('type') === "map"){
  					// sequential media such as pictures
  					obj.title = '';
						obj.target = $(this).text();
						obj.linktype = '';
						obj.type = 'map';
						obj.x = 0;
						obj.y = 0;
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  			
					}else if($(this).attr('type') === "toc"){
						// table of content references
						obj.title = $(this).text();
						obj.target = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.note = $(this).attr('note');
						obj.x = 0;
						obj.y = 0;
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = 1;// default // $(this).attr('duration') === undefined ? 1 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
					}else if($(this).attr('type') === "tags"){
						// temporal tags
						obj.title = $(this).text();
						obj.target = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration');
						_this.vid_arr[v_id]['annotation'].push(obj);
	
					}else if($(this).attr('type') === "highlight"){
						// hight
						obj.title = $(this).text();
						obj.target = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration');
						_this.vid_arr[v_id]['annotation'].push(obj);

					}else if($(this).attr('type') === "comments"){ 
						// comments
						obj.title = $(this).text();
						obj.target = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.x = 0;
						obj.y = 0;
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = 1;// default // $(this).attr('duration') === undefined ? 1 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);

  				}else if($(this).attr('type') === "assessmentanalysis"){ 
						// analysis
						obj.title = $(this).text();
						obj.target = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.x = $(this).attr('x');
						obj.y = $(this).attr('y');
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 1 : $(this).attr('duration');
						obj.marker = $(this).data('marker');
						obj.markertype = $(this).attr('markertype');
						obj.markerlabel = $(this).attr('markerlabel');
						obj.markerdescription = $(this).attr('markerdescription');
						obj.markerdescription2 = $(this).attr('markerdescription2');
						obj.markerselect_option = $(this).attr('markerselectoption');
						obj.id = $(this).attr('id')
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
  				}else if($(this).attr('type') === "assessment"){ 
						// assessment
						obj.title = $(this).data('task');
						obj.target = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.type = 'assessment';
						obj.x = 0;
						obj.y = 0; 
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime'); 
						obj.t2 = 1;// default // $(this).attr('duration') === undefined ? 1 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
					}else if($(this).attr('type') === "assessment-fill-in"){ 
  					// fill-in assessment tasks
  					obj.title = $(this).attr('id');
						obj.target = $(this).text();
						obj.linktype = 'standard';
						obj.width = $(this).attr('width') === undefined ? 100 : $(this).attr('width');
						obj.type = 'assessment-fill-in';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration');
						obj.seek = $(this).attr('seek')
						obj.duration = $(this).attr('duration2')
  					_this.vid_arr[v_id]['annotation'].push(obj);
  				
  				}else if($(this).attr('type') === "assessment-writing"){ 
  					// assessment, task on demand
  					obj.title = encodeURIComponent( $(this).text() );//$(this).attr('id');
						obj.target = $(this).text();
						obj.linktype = 'standard';
						obj.width = $(this).attr('width') === undefined ? 100 : $(this).attr('width');
						obj.type = 'assessment-writing';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') === undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') === undefined ? 0 : $(this).attr('duration');
						obj.seek = $(this).attr('seek')
						obj.duration = $(this).attr('duration2')
  					_this.vid_arr[v_id]['annotation'].push(obj);
  				}
  				
  			});  	
  			
				return _this.vid_arr; 	
			},
  		
  		/** 
				*
				* @todo all of that is quick & dirty and needs further testing / testing procedures
				*/
  		parseWikiVideo : function(str){

					var arr = [];
					var url, start, duration, id = '_';
  				str = str
  					.replace(/^\[\[Video:/, '') // start delimiter
  					.replace(/\]\]/, '') // end delimiter
  					.replace(/\# /, ' #') // start-time
  					.replace(/\| /, ' |') // duration
  					.replace(/  /, ' '); // double spaces
  				var a = str.split(/ /);
  				$.each(a, function(i, val){
  					if(val.substr(0,1) === '#'){ start = val.substr(1,val.length); }
  					else if(val.substr(0,1) === '|'){ duration = val.substr(1,val.length); }
  					else if(val.match(/(?=.ogg)/)){ url = val; }
  					else if(val.length > 0){ id = val; }
  				})
  				//alert('   url:'+url +' start:'+ start +'  duration:'+ duration +'  id:'+ id);
  				// build arr
  				arr['id'] = id;
  				arr['url'] = url;
  				arr['seek'] = start === undefined ? 0 : start;
  				arr['duration'] = duration === undefined ? 0 : duration;
  				arr['annotation'] = [];
  			return arr;
  		},
  		
  		/** 
				*
				*/
  		parseWikiHyperlink : function(str){ 
  				var _this = this;
  				var re = "";
  				var tmp = '';
  				var obj = {};
  				obj.type = 'hyperlinks';
  				obj.linktype = 'standard';
  	
  				// link types // ?=.ogg | ?=.ogv | 
  				re = new RegExp(/^\[\[http:\/\//);
					if(str.match(re)){ 
						// external link
  					re = new RegExp(/\[\[http:\/\/[a-z A-Z 0-9 \#\ \_\/:.-]+/);
  					tmp = re.exec(str).toString().split(" ");
						obj.target = tmp[0].replace(/^\[\[/,'');
						obj.title = tmp.length >= 2 ? tmp.slice(1) : tmp[0].replace(/^[\[\[http:\/\/]/, '');
						obj.title = obj.title.toString().replace(/,/g,' ');
  					//alert(obj.target+' - '+obj.title);
						obj.linktype = 'external'; 
					}else{
						// standard links
  					re = new RegExp(/\[\[[a-z A-Z 0-9 \# \ \_\/\|:.-]+/);
  					tmp = re.exec(str).toString().split(/\|/);
						obj.target = tmp[0].replace(/^\[\[/,'');
						obj.title = tmp.length >= 2 ? tmp[1] : tmp[0].replace(/^\[\[/,'');
  					//alert(obj.target+' - '+obj.title);
					}
					//alert(obj.target +'  '+ obj.linktype);						
  				//alert(tmp.length+'  '+obj.title);
  		
					// strip start time and duration
					var str2 = str.split(/\]/);
					re = new RegExp(/[\ ]\#[0-9]+/);  				
  				obj.t1 = str.match(re) ? re.exec(str2[1]).toString().replace(/[\#]/, '') : 0; // .replace(/|\ /,'')
					re = new RegExp(/[\ ]\|[0-9]+/);  				
  				obj.t2 = str.match(re) ? re.exec(str2[1]).toString().replace(/[\|]/, '') : 1000;
//					alert(obj.t1+' - '+obj.t2);
					
					// relative width/height: 50% 20%
					re = new RegExp(/[\ ]+[0-9]{2}(?=\%)/g);
					tmp = str.match(re) ? str.match(re).toString().split(/,/) : [50,50];
					obj.x = tmp[0] ? tmp[0] : 50;
					obj.y = tmp[1] ? tmp[1] : 50;			
					//alert(''+obj.x+' - '+obj.y+'   time: '+obj.t1+' - '+obj.t2);
					
					 return obj;
  		}

  });
	
/* 
* name: Vi2.VideoPlayer 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 - variablen aufräumen
 - bug: keydown binding vary in different browsers
 -- onliest fix: https://github.com/google/closure-library/blob/master/closure/goog/events/keyhandler.js
 
 - add getter and setter for quality, playback status, video information, next, previous, playback rate

 - @createVideoHiding: build function to turn of the video screen in order to listen to the audio only.
	- YOuTube http://coding-everyday.blogspot.de/2013/03/how-to-grab-youtube-playback-video-files.html
 - visualize loaded bytes
  - simultanous playback of two clips
 - cache mangement for videos: http://www.misfitgeek.com/2012/10/html5-off-line-storing-and-retrieving-videos-with-indexeddb/
 - refine cycle including event bindings


 - manage to play parts of a video: http://www.xiph.org/oggz/doc/group__seek__api.html
- options: supported codecs / mime types
 - further: API calls: http://code.google.com/apis/youtube/js_api_reference.html
 - media fragment URI ..parser ..:: http://tomayac.com/mediafragments/mediafragments.html


 \begin{lstlisting}

\\ normal playback time
Schema: t=npt:<start-in-seconds>,<end-in-seconds>
Beispiel: t=npt:10,20 
.
t=120s,121.5s
Shema: t=npt:<m>,<s>.<ms>:<h>:<m>.<ms>
Beispiel: t=npt:120,0:02:01.5

// SMPTE timecode standard ... wie bei DVDs
Schema: t=smpte-<frame-rate>:<h>:<m>:<s>,<h>:<m>:<s>.<ms>
t=smpte-30:0:02:00,0:02:01:15
t=smpte-25:0:02:00:00,0:02:01:12.1


t=npt:10,20 			# => results in the time interval [10,20[
t=,20 						# => results in the time interval [0,20[
t=smpte:0:02:00, 	# => results in the time interval [120,end[


// Räumliche Dimension
Schema: #xywh=<einheit>:<x>:<y>:<width>:<height>
Beispiel: #xywh=pixel:10,10,30,30


track=1&track=2 track=video
track=Kids%20Video
# => results in only extracting track ’1’ and ’2’
# => results in only extracting track ’video’
# => results in only extracting track

xywh=160,120,320,240
# => results in a 320x240 box at x=160 and y=120
xywh=pixel:160,120,320,240 # => results in a 320x240 box at x=160 and y=120
xywh=percent:25,25,50,50 # => results in a 50%x50% box at x=25% and y=25%

// Named dimension
id=1 # => results in only extracting the section called ’1’
id=chapter-1 # => results in only extracting the section called ’chapter-1’
id=My%20Kids # => results in only extracting the section called ’My Kids’

\end{lstlisting}


https://developer.mozilla.org/en/Configuring_servers_for_Ogg_media
#1 determine duration
$ oggz-info /g/media/bruce_vs_ironman.ogv

#2 hard code duration for apache2 in the .htaccess-file of the media folder
<Files "elephant.ogv">
Header set X-Content-Duration "653.791"
</Files>


http://dev.opera.com/articles/view/everything-you-need-to-know-about-html5-video-and-audio/
*/



var Video = $.inherit(/** @lends VideoPlayer# */
{
	/** 
	* 	@constructs 
	*		@param {object} options An object containing the parameters
	*		@param {Observer} observer Observer of VI-TWO
	*/
  __constructor: function(options) { 
  	vi2.observer.player = this;
		this.options = $.extend(this.options, options); 
		// init spinner
		this.spinner = new Spinner(this.spinner_options); //this.stopSpinning();
		this.video = document.getElementById( (this.options.selector).replace(/\#/,'') );  
  	this.loadUI();
  },

	name: 'video player',
	// defaults
	options: {
		observer: null, 
		selector: '#video1', 
		width: 500, 
		height: 375, 
		seek:0, 
		videoControlsSelector: '.video-controls', 
		thumbnail:'/static/img/placeholder.jpg', 
		defaultVolume : 1 // 0..1
	},
	video: null,
	timeline : null,
	observer: null,
	url: '',

	/* selectors */
  video_container: null,
	video_wrap: null,
	play_btn: null,
	volume_btn: null,
	
	/* flags */
	volume: null,
	isMuted: false,
	isSequence: false,
	seqList: [],
	seqNum: null,
	seqLoop: false,
	videoIsPlaying: true,
	percentLoaded: 0,
	buffclick: 0,
	
	/* spinner options */
	spinner : false,
	spinner_options : {
  	lines: 6, // The number of lines to draw
  	length: 0, // The length of each line
  	width: 20, // The line thickness
  	radius: 20, // The radius of the inner circle
  	color: '#003366', // #rgb or #rrggbb
  	speed: 1, // Rounds per second
  	trail: 89, // Afterglow percentage
  	shadow: false, // Whether to render a shadow
  	hwaccel: false, // Whether to use hardware acceleration
  	className: 'spinner', // The CSS class to assign to the spinner
  	zIndex: 29, // The z-index (defaults to 2000000000)
  	top: 'auto', // Top position relative to parent in px
  	left: 'auto' // Left position relative to parent in px
	},
	

	/* load video */
	// param: url= url of video; seek = time seek within video in seconds
	loadVideo: function(url, seek) {    
		var _this = this;
		this.url = url;
	  this.seek = seek === undefined ? 0 : seek;
	  
	  // create and append video element
	  var video_element = $('<video></video>')
				.attr('controls', false)
				.attr('autobuffer', true)
				.attr('preload', "metadata")
				.attr('id', 'video1')
				//.show()
				.css({width:'75vw'}) // xxx: size should be defined somewhere
				//.addClass('embed-responsive-item col-md-12')
				.text('Your Browser does not support either this video format or videos at all');
		$('#seq')
			//.addClass('embed-responsive embed-responsive-16by9')
			.html( video_element ); 
		
			
			
	  this.video = document.getElementById( ( this.options.selector ).replace(/\#/,'') );
	 
	  if(this.videoIsPlaying){
	  		$(vi2.observer.player).trigger('player.play', []);
	  }
	  this.video.pause();
		this.startSpinning(); 
		
		var supportedCodec = this.detectVideoSupport();
		this.video = $.extend( this.video, {
			loop: false,
	  	preload: 'metadata', // 'metadata' | true ??
	  	autoplay: this.videoIsPlaying,
	  	controls: false,
	 // 	poster: '/static/img/stills/'+this.options.thumbnail, // xxx wrong path !!
	 		 //	width: this.options.width,
	  	//	height: this.options.height,
	  	onerror: function(e) { _this.errorHandling(e); }
		});
		
		// add timeline
		this.timeline = new Vi2.AnnotatedTimeline( this.video, {}, this.seek );
		
		// add playback logger
		this.logger();
		
		// xxx should depend on the configuration
		var playbackSpeed = new Vi2.PlaybackSpeed();
		vi2.observer.addWidget( playbackSpeed );  
		
		//var temporalBookmarks = new Vi2.TemporalBookmarks();
		//vi2.observer.addWidget( temporalBookmarks );
		
		//var zoom = new Vi2.Zoom();
		//vi2.observer.addWidget( zoom );	
		
		var skipBack = new Vi2.SkipBack();
		vi2.observer.addWidget( skipBack );
		
		//var sharing = new Vi2.Sharing();
		//vi2.observer.addWidget( sharing ); // http://localhost/elearning/vi2/vi-two/examples/iwrm/videos/iwrm_seidel1.webm
		
		this.play_btn = $('.vi2-video-play-pause');
		
		this.video.addEventListener('play', function(e){ 
			vi2.observer.clock.startClock();
			//$('header').hide();
			_this.play_btn.find('.glyphicon-pause').show();
			_this.play_btn.find('.glyphicon-play').hide();
		});
		
		this.video.addEventListener('pause', function(e){ 
			vi2.observer.clock.stopClock();
			$('header').show();
			_this.play_btn.find('.glyphicon-pause').hide();
			_this.play_btn.find('.glyphicon-play').show();
		});
		
		this.video.addEventListener('abort', function(e){  
			vi2.observer.clock.stopClock();
			$('header').show();
			_this.play_btn.find('.glyphicon-pause').hide();
			_this.play_btn.find('.glyphicon-play').show();
		});

		// event binding: on can play
		this.video.addEventListener('readystate', function(e) { 
			_this.readyStateHandler(e); 
		});

		// event binding: on time update
		this.video.addEventListener('timeupdate', function(e) { 
			_this.timeUpdateHandler(e); 
		});
		
		// event binding: on ended
		this.video.addEventListener('ended', function(e) { 
			_this.endedHandler(e); 
		}, false);

		
	// trigger event that a new video stream has been loaded
			var t = new Date();
			$(vi2.observer).trigger('stream.loaded', { 
				stream: vi2.observer.current_stream,//params['stream'], 
				playback_time: seek,//params['time'], 
				time: t.getTime()
			} );	

 	// get sources and load video
	 	if( url !== undefined){
			$( this.video ).html( this.createSource(url, supportedCodec ), this.video.firstChild);	 
		}
	 
	},


	/* HTML5 playback detection 
	* 	returns: mime type of supported video or empty string if there is no support
	*		called-by: loadVideo()
	* 	toDo: check support for video element
	**/
	detectVideoSupport: function() {
		var dummy_video = document.createElement('video');

		// prefer mp4 over webm over ogv 
		if (dummy_video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') !== '') {
			vi2.observer.log({context:'player',action:'video-support-mp4', values:['1'] });
			return 'video/mp4'; 		
		}else if (dummy_video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '') {
			vi2.observer.log({context:'player',action:'video-support-webm', values:['1'] });
			return 'video/webm'; 
		}else	 if(dummy_video.canPlayType('video/ogg; codecs="theora, vorbis"') !== ''){
			vi2.observer.log({context:'player',action:'video-support-ogv', values:['1'] });
			return 'video/ogv';
		}else{
			// no suitable video format is avalable
			vi2.observer.log({context:'player',action:'video-support-none', values:['1'] }); 
			$('#page').html('<h3>We appologize that video application is currently not supported by your browser.</h3>The provided video material can be played on Mozilla Firefox, Google Chrome and Opera. If you prefer Internet Explorer 9 you need to install a <a href="https://tools.google.com/dlpage/webmmf">webm video extension</a> provided by Google. In the near future we are going to server further video formats which will be supported by all major browsers.<br /><br /> Thank you for your understanding.');
		}
		return '';
	},
	
	
	detectBrowser : function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M[0];//.join(' ');
	},


	/* load sequence */
	loadSequence: function(sources, num, seek) {  
		this.seqList = sources;
		this.seek = seek;
		this.isSequence = true;
		if (num === undefined) {
			this.seqNum = 0;
		}else {
			this.seqNum = num;// % this.seqList.length;
		} 
		this.loadVideo(this.seqList[this.seqNum].url, this.seek);
	},


	/** 
	* build video source element
	* @param src = video url; mime_type = mime_type of video
	*	@returns: video source element including src and type attribute
	*/
	createSource: function(src, mime_type) { 
  	var
  		ext = '.mp4',
  		source = document.createElement('source'); 
  	if( this.detectBrowser() === 'Firefox'){
  		ext = '.webm';  // lacy bug fix since firefox doesn't support mp4 anymore. xxx needs further testing.
  		mime_type = "video/webm";
  	}else if( this.detectBrowser() === 'Chrome'){
  		ext = '.webm';
  		mime_type = "video/webm";
  	}
  	
  	// extract file type out of mime type
  	source.src = src.replace('.mp4', ext)+"?foo="+(new Date().getTime());//
  	// set mime type
  	source.type = mime_type;
  	return source;
	},



	/** 
	* load UI 
	**/
	loadUI: function() { 
		var _this = this;
		// load other ui elements
		this.createPlaybackControl();
		this.createVolumeControl();
		this.createVideoHiding();
		
		// show/hide video controls
		$(_this.options.videoControlsSelector).addClass("open-controls");
		/*$("#overlay, #seq, #video1 #video-controls #accordion-resizer").hover(
			function() {  
		  	$(_this.options.videoControlsSelector).addClass("open-controls");
			}, 
			function() { 
		  	$(_this.options.videoControlsSelector).removeClass("open-controls");
			}
		);*/
		// ??
		//$('#overlay').css('height', $('video').height() );
		//$('#overlay').css('width', $('#video1').width() );
		
	
		// hide cursor and controls if inactive
		var mouseTimer = null, cursorVisible = true;

		function disappearCursor() {
		    mouseTimer = null; 
		    document.body.style.cursor = "none";
		    cursorVisible = false;
		    $(_this.options.videoControlsSelector).removeClass("open-controls");
		}
		var el = document.getElementById('video1');
		document.onmousemove = function() {
		    if (mouseTimer) {
		        window.clearTimeout(mouseTimer);
		    }
		    if (!cursorVisible) {
		        document.body.style.cursor = "default";
		        cursorVisible = true;
		        $(_this.options.videoControlsSelector).addClass("open-controls");
		    }
		    mouseTimer = window.setTimeout(disappearCursor, 1000);
		};
		
		$('body').unbind('keydown').bind('keydown', function(e) { 
			//_this.keyboardCommandHandler(e); 
		});
		
	},
	
	/**
	* Creates video playback control
	*/
	createPlaybackControl : function(){
		var _this = this;
		
		this.play_btn = $('.vi2-video-play-pause');
		
		
		this.play_btn.bind('click', function() {
			_this.play(); 
		});

		$(this.play_btn).bind('play', function(e) {  
			vi2.observer.play();
			$('.screen').remove();
		});

		$(this.play_btn).bind('pause', function(e) { 
			vi2.observer.pause();
		});
		
		$(vi2.observer.player).bind('player.play', function(e, a, b) { 
  			//$('.navbar').hide();
  	});
  	
  	$(vi2.observer.player).bind('player.pause', function(e, a, b) { 
  			//$('.navbar').show();	
  	});
  	
  	
  	
	},


	/** 
	* Creates a volume control element 
	*/
	createVolumeControl : function(){ 		
		var _this = this;
		// intit controls
		this.volume = $('.vi2-volume-slider', this.video_container);
		this.volume_btn = $('.vi2-volume-button', this.video_container);
		// init slider
		$(this.volume).slider({
				orientation: 'horizontal',
				range: 'min',
				max: 1,
				step: 0.05,
				animate: false,
				value : _this.options.defaultVolume,
				slide: function(e,ui) { 
					if(ui.value > 0 && ui.value < 0.5 ){ 
						_this.isMuted = false;
						_this.volume_btn.addClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
					}else if( ui.value >= 0.5 ){
						_this.isMuted = false;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.addClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
						
					}else{
						_this.isMuted = true;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.addClass('glyphicon-volume-off');
					}
					//_this.video_volume = parseFloat(ui.value);
				},
				change : function(e,ui){
					// set video volume
					_this.video.volume = ui.value;
					// button states
					if(ui.value > 0 && ui.value < 0.5 ){ 
						_this.isMuted = false;
						_this.volume_btn.addClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
					}else if( ui.value >= 0.5 ){
						_this.isMuted = false;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.addClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
						
					}else{
						_this.isMuted = true;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.addClass('glyphicon-volume-off');
					}
					//_this.video_volume = parseFloat(ui.value);
				}	
		});
		
		this.volume_btn
			.bind('click', function(e) { 
				_this.muteVolume();
			})
			;
			
		if( this.volume.slider('value') === 0 ){
			this.isMuted = true;
			this.volume_btn.addClass('glyphicon glyphicon-volume-off');
		}else{
			this.volume_btn.addClass('glyphicon glyphicon-volume-up');
		}

		// set initial volume
		// xxx does not work
	},
	
	/**
	* Get volume
	*/
	getVolume : function(){
		return this.volume.slider('value');//this.video_volume;
	},
	
	
	/**
	* Set volume
	* @param volume {Number} Number in the range of 0 and 1. Every value outside that rang will be changed to the boundaries. 
	*/
	setVolume : function(volume){ 
		this.volume.slider('value', volume);
		vi2.observer.log({context:'player',action:'set-volume', values:[volume] }); 
	},
	
	
	/** 
	* Increases audio volume by 5 percent 
	*/
	increaseVolume : function(){ 
		$(this.volume).slider('value', $(this.volume).slider('value') + 0.05 );
	},
	
	
	/** 
	* Decreases audio volume by 5 percent 
	*/
	decreaseVolume : function(){
		$(this.volume).slider('value', $(this.volume).slider('value') - 0.05 );
	},


	tmp_volume : 0,
	/** 
	* Toggles the button to mute/unmute the volume. If volume get unmuted the volume will be reset to the value it had befor muting.
	*/
	muteVolume: function() { 
		if( ! this.isMuted) {
			tmp_volume = this.volume.slider('value');
			this.setVolume(0);
			this.isMuted = true;
		}else {
			this.setVolume( tmp_volume );
			this.isMuted = false;
		}
	},



	
	
	
	
	/* Creates controle element to hide/show the video frame 
	*	xxx todo: this should be accomplished with a audio description and other accessibility assistance
	*/
	createVideoHiding: function(){		return;
		
		// hide moving picture in order limit visual cognition channel to one
		// xxx: #screen should be replaced by an option
		var o = new Image(); 
		$(o).attr('src', '/static/img/stills/'+this.options.thumbnail).addClass('toggle-pair').prependTo('#screen').hide();
		$(this.video).addClass('toggle-pair');
		var hidden = true;
		var btn = $('<span></span>')
			.addClass('toggle-moving-picture')
			.text('hide video')
			.prependTo('#screen')
			.click(function(){
				$(this).text(hidden ? 'show video' : 'hide video');
				hidden = ! hidden; 
				$('#screen').find('.toggle-pair').toggle();
			});
			$('#screen').find('.toggle-pair').toggle().hide();
			$('.toggle-moving-picture').hide();
		
	},
	

/********* LOADING Indicator *********************************/

	/* 
	* Starts the loading indicator in terms of a spinner. Function is called if video data is loading 
	**/
	startSpinning : function(){
		this.spinner.spin(document.getElementById('overlay'));
		$('.spinner').css('top','200px'); // xxx hardcoded repositioning of spinner element
	},

	/* 
	* Stops the loading indicator 
	**/
	stopSpinning : function(){
		this.spinner.stop(); 
	},



/* EVENT HANDLER *************************/


	

	/** 
	* event handler: on can play. Notifies the observer about a new video.
	*/
	readyStateHandler: function(e) {
		vi2.observer.updateVideo(this.seqList[this.seqNum].id, this.seqNum);
	},


	/* 
	* event handler: on time update
	**/
	timeUpdateHandler: function(e) {
		if ( this.video.readyState === 2 ) {
			this.startSpinning(); 
		}else if ( this.video.readyState === 4 ) {
			this.stopSpinning();
		}
	},


	/*
	* event handler: on ended
	**/
	endedHandler: function(e) { 
		vi2.observer.log({context:'player',action:'video-ended', values:[ this.url ]});
		vi2.observer.ended();
		this.video.removeEventListener('ended', arguments.callee, false);
		//this.play_btn.removeClass('vi2-video-pause');
		//this.play_btn.addClass('vi2-video-play');
		// load next video clip if its a sequence
		if (this.isSequence && ((this.seqNum + 1) < this.seqList.length || this.seqLoop)) {
			this.seqNum = (this.seqNum + 1) % this.seqList.length;
			this.loadVideo(this.seqList[this.seqNum].url);
		}else { 
			$(vi2.observer.player).trigger('video.end', null);
		}
	},
	
	
	/* 
	* Handles certain keyboad commends 
	**/
	keyboardCommandHandler : function(e){	
		
		e.preventDefault();
		this.video.focus();
		switch (e.which) {
			case 32: // space 
				this.play(); //
				break;
			case 189: // minus 173  oder 189
				vi2.observer.getWidget('playbackSpeed').decreaseSpeed();
				break;
			case 187: // plus 171 oder 187
				vi2.observer.getWidget('playbackSpeed').increaseSpeed();
				break;
			case 	38: // arrow up
				this.increaseVolume(); // volume control
				break;
			case 40: // arrow down
				this.decreaseVolume(); // volume control
				break;
			case 77: // m 
				this.muteVolume();// volume mute	
				break;
			case 39: // 39: right 
				vi2.observer.widget_list.toc.nextElement();
				break;
			case 37: // 37:left		
				vi2.observer.widget_list.toc.previousElement();
				break;
			case 34: // 39: right  presenter
				vi2.observer.player.play();
				//vi2.observer.widget_list.toc.nextElement();
				break;
			case 33: // 37:left		presenter
				vi2.observer.widget_list.toc.previousElement();
				break;	
		}
		this.video.focus(); 
	},



	/* INTERFACES *************************/

	/* just play */
	play: function() {   
		if ( this.video.paused === false) { 
			this.video.pause(); 
			this.isPlaying(false);
			$(vi2.observer.player).trigger('player.pause', []);
			vi2.observer.clock.stopClock();
			vi2.observer.log({context:'player',action:'pause-click', values:['1'] }); 
		} else {  
			this.video.play(); 
			this.isPlaying(true);
			$(vi2.observer.player).trigger('player.play', []);
			vi2.observer.clock.startClock();
			vi2.observer.log({context:'player',action:'play-click', values:['1'] }); 
		}
	},

	/* just pause */
	pause: function() {
		this.video.pause();
		this.isPlaying(false);
		$(vi2.observer.player).bind('player.pause');
		vi2.observer.log({context:'player',action:'pause2-click', values:['1'] }); 
	},
	
	/*
	**/
	isPlaying : function(x){
		if( x === undefined){
			return this.videoIsPlaying;
		}else{
			this.videoIsPlaying = x;
		}
	},

	/* returns duration of video */
	duration: function() {   
		return this.video.duration; //$(this.options.selector).attr('duration');
	},

	/* return current playback time or set the time */
	currentTime: function(x) { 
		if (x === undefined) {
			return this.video.currentTime; //$(this.options.selector).attr('currentTime');
		}else { 
			$(this.video).trigger('play');
			this.video.currentTime = x;
			this.play();
			
		}
	},

	/* sets or returns video width */
	width: function(x) {
		if (x === null) {
			return $('#video1').width();
		}else {
			//this.video.width = x;
		}
	},

	/* sets or return video width */
	height: function(x) {
		if (x === null) {
			return $('#video1').height();
		}else {
			//this.video.height = x;
		}
	},
	

	/* prints errors */
	errorHandling: function(e) { 
//		console.log('Error - Media Source not supported: ' + this.video.error.code == this.video.error.MEDIA_ERR_SRC_NOT_SUPPORTED); // true
//	 	console.log('Error - Network No Source: ' + this.video.networkState == this.video.NETWORK_NO_SOURCE); // true
	},
	
	
	/*
	* Logger
	**/
	logger : function(){
		var
			_this = this,
			interval = 5,
			lastposition = -1, 
    	timer
    	;
    	
		function loop() {
        var currentinterval;
        currentinterval = (Math.round( _this.currentTime() ) / interval) >> 0;
        //console.log("i:" + currentinterval + ", p:" + player.getPosition());
        if (currentinterval != lastposition) { 
            vi2.observer.log({context:'player', action:'playback', values:[ currentinterval ]});
            lastposition = currentinterval;
        }
    }

    function start() { 
        if (timer) {
            timer = clearInterval(timer);
        }
        timer = setInterval(loop, interval * 1000);
        setTimeout(loop, 100);
    }

    function restart() {
        if (timer) {
            timer = clearInterval(timer);
        }
        lasttime = -1;
        timer = setInterval(loop, interval * 1000);
        setTimeout(loop, 100);
    }

    function stop() {
        timer = clearInterval(timer);
        loop();
    }
/*
    player.oncanplay(start);
   	 player.onSeek(restart);
    player.onPause(stop);
    	player.onBuffer(stop);
    player.onIdle(stop);
    player.onComplete(stop);
    	player.onError(stop);
  */  
    this.video.addEventListener('play', function(e){ 
			start();	
		});
		
		this.video.addEventListener('pause', function(e){ 
			stop();
		});
		
		this.video.addEventListener('abort', function(e){  
			stop();
		});

		this.video.addEventListener('timeupdate', function(e) { 
							
		});
		
		this.video.addEventListener('ended', function(e) { 
			stop();
		}, false);
    
	}
	
	
}); // end video class


/* 
*	name: Vi2.Clock
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Checks which annotations need to be activated or deactivated in given time intervall during video playback
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
* - use tracks for storing annoations
*	 	- implement checkAnnotation in order to trigger certain events at the listenning instances
* 		- use timeUpdate insteate of setTimeOut or setIntervall: http://blog.gingertech.net/2009/08/19/jumping-to-time-offsets-in-videos/
http://stackoverflow.com/questions/3255/big-o-how-do-you-calculate-approximate-it
https://de.wikipedia.org/wiki/Bin%C3%A4re_Suche#Intervallschachtelung
https://de.wikipedia.org/wiki/Interpolationssuche
https://en.wikipedia.org/wiki/Search_engine_indexing#Inverted_indices
https://en.wikipedia.org/wiki/Inverted_index
https://en.wikipedia.org/wiki/Index#Computer_science

- Indexstruktur wird bei Änderungen (z.B. einer neuen Annotation) neu berechnet. Muss das so sein?
- es handelt sich um eine eindimensionale Indexstruktur, in der die Anzeigezeit indiziert ist 
- Alternative Implementierung: B-Baum
- Ermittlung der optimalen Länge des Index  ... Abspielzeit in Minuten / Anzahl der Annotation ... Videolänger / Prüfungsintervall ??
- Ziel müsste es sein, die Annotationen möglichst gleich auf die Indexeinträge zu verteilen, so dass in jedem Indexeintrag so wenig wie möglich und immer gleichviele Suchoperationen vorgenommen werden müssten.
- Ein Nebenziel müsste sein, die Bestimmung des aktuellen Index so einfach wie möglich zu gestalten. 
- Landau-Notation:: Man müsste Testfälle generieren, in dem man die Anzahl der Annotation verdoppelt, um dazu den Zeitaufwand misst. = Zeitkomplexität. Diese Messung müsste in verschiedenen Browsern durchgeführt werden.
%http://de.wikipedia.org/wiki/Landau-Symbole#Beispiele_und_Notation 

*/
	

Vi2.Clock = $.inherit(/** @lends vi2.core.Clock# */
	{
		/** 
		*		@constructs 
		*		@param {Videoplayer} player Related video player 
		*		@param {Number} clockInterval Interval of clock granularity in milliseconds
		*/
		__constructor : function(clockInterval) {
			if ( clockInterval > 20 && clockInterval < 5000 ){
  			this.clockInterval = clockInterval;  		
  		}else{
  			console.log('Error')
  		}	
		},
  		
		
		name : 'clock',
		clockInterval : 500, // = default
		isRunning : false,
		interval : -1,	
		annotations : [],
		hooks : [],
		
		/**
		* Checks whether the provided type of annotation has been already added as a hook
		* @param {String} type
		* @return {boolean}
		*/
  	isHook : function(type){
  		return this.hooks[type] !== null;	
  	},
  	
  	
  	/*
  	 * Registers a type of annotation as a hook for later use
  	 * @param {String} name Name of the widget
  	 * @param {object} data Annotation-related data 
		 * @return {boolean} 
  	 **/
  	addHook : function( name, data){
  		this.hooks[ name ] = data;
  		return true;
  	},
	
	
		/* 
		 * push annotations on their stack by mapping the parser object to the specific annotation object structure 
		 **/
		addAnnotation : function(obj){ 					
			if(this.isHook(obj.type)){   
				this.annotations.push({
					active:false,
					author: obj.author,
					width: obj.width, 
					content: {
						title: obj.title, 
						target:obj.target,
						description:obj.description,
						note:obj.note
					}, 
					linktype:obj.linktype, 
					type: obj.type, 
					displayPosition: {
						x: obj.x, 
						y: obj.y, 
						t1: obj.t1, 
						t2: obj.t2
					},
					seek : obj.seek,
					duration : obj.duration,
					data : obj
				});
			}	
		},
	
		/* Trivial */
		checkAnnotation : 	function() {
			var iTime = this.parseTime( vi2.observer.player.currentTime() );
			var annoLength = this.annotations.length;
			for (var i=0; i < annoLength; i++ ){ 
				var oAnn = this.annotations[i];
				if(iTime >= oAnn.displayPosition.t1 && iTime < (Number(oAnn.displayPosition.t1) + Number(oAnn.displayPosition.t2))) {
					if(!oAnn.active){
						oAnn.active = true; 
	  				$( vi2.observer.player).trigger('annotation.begin.'+oAnn.type, [i, oAnn]); 
					}
				}else {
					oAnn.active = false;
	  			$( vi2.observer.player).trigger('annotation.end.'+oAnn.type, [i, oAnn]);
				}
			}
		},
		
		
		
	/* Optimized algorithm, making advantage of indexing the time of appearance */
		/* to do: 
		-generate test data, 
		-try different approaches to generate the index, 
		-measure time, 
		-calculate complexity in landau notation
		*/
		prepAnno : [],
		
		buildAnnotationIndex : function(){
			var prepAnno = [];
			for (var i = 0; i < 1000; i++){ prepAnno[i] = [];} 
			$.each(this.annotations, function(i, val){
				var index = val.displayPosition.t1 < 1 ? 0 : Math.ceil(val.displayPosition.t1 / 100);
				prepAnno[index].push(val);
			});
			this.prepAnno = prepAnno;
		},
		
		checkAnnotation_new : 	function() {
			var _this = this;
			var iTime = this.parseTime( vi2.observer.player.currentTime() ); // returns time in decimal 
			var x = vi2.observer.player.currentTime() < 1 ? 0 : Math.ceil(iTime / 100); 
			//$('#debug').val(_this.prepAnno[x].length);	
			$.each(_this.prepAnno[x], function(i, oAnn){  
				
				if(iTime >= oAnn.displayPosition.t1 && iTime < (Number(oAnn.displayPosition.t1) + Number(oAnn.displayPosition.t2))) {
					if(!oAnn.active){
						oAnn.active = true; //alert(oAnn.type);
	  				$( vi2.observer.player).trigger('annotation.begin.'+oAnn.type, [i, oAnn]); 
					}
				}else {
					oAnn.active = false;
	  			$( vi2.observer.player).trigger('annotation.end.'+oAnn.type, [i]);
				}
			});
		},
		
		
		// Another approach
		/*
		1. generate an inverted index where Index[ playbacktime_rounded ] = {annotation_1, annotation_2, ..., annotation_n}. The Index contains all annotations, that should be visible at time. 
		2. at a given playbacktime just test whether the time in ms exists in the Index.
		
		Problem:: Size of Index
		*/
		
							
		/*
		 * Starts the clock interval counter
		 **/
		startClock : function(){  
			//this.buildAnnotationIndex();
			if(this.isRunning){ return;}
			var _this = this;
			this.isRunning = true;
			this.interval = setInterval(function() { _this.checkAnnotation();  }, this.clockInterval);		
		},
		
		
		/*
		 * Stops the clock interval counter
		 **/
		stopClock : function(){
			clearInterval(this.interval);
			clearInterval(this.interval);
			this.isRunning = false;
		},


		/*
		 * Resets all annotations and its overlays.
		 **/		
		reset : function(){
			$('#overlay').html('');
			this.annotations = [];
		},

	
		/* xxxx */
		parseTime : function (strTime) { 
			return strTime;
			//var aTime = strTime.toString().split(":");
			//return parseInt(aTime[0],10) * 60 + parseInt(aTime[1],10) * 1;// + parseFloat(aTime[2]);
		}
	
	
}); // end class Clock 
/* 
*	name: Vi2.Assessment
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Abstract class for video annotations
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- include hourse at format time
*/

 
Vi2.Annotation = $.inherit(/** @lends Annotation# */{

		/** 
		* 	@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  		this.options = options;  
		},
		
		name : 'annotation',
		type : 'annotation',
		options : {},

		/* ... */
		init : function(ann){},	
		
		/* -- */
		appendToDOM : function(id){},						
				
		/* ... */
		begin : function(e, id, obj){},
	
		/* ... */
		end : function(e, id){},
		
		
		/*
			* 
			**/
		animation : function(selector, effect){
			$( selector ).animate({
				left: 100
			}, {
				duration: 1000
				
			});
		},
		
		/*
		* todo: 
		*  - check data types: string, number, decimal-time, ... from .data('datatype', 'decimal-time')
		*  - change messages
		**/
		validateAnnotationForm : function(selector, type){ 
			var textarea_flag = 0, textinput_flag = 0, msg = '', sum_checked = 0, sum_checkbox = 0;
			
			// validate input fields
			$(selector).find('input[type=text]').each(function(i,val){
				if($(val).val() === ''){
					$(val).addClass( 'validation-conflict' );
					textinput_flag = true;
				}else{
					$(val).removeClass( 'validation-conflict' );
				}
			});
			if(textinput_flag){
				msg += "\n Versehen Sie bitte die/das Textfeld/er mit einem Text.";
			}
			
			// validate textareas
			$(selector).find('textarea').each(function(i,val){
				if(String($(val).val()).length < 2){
					$(val).addClass( 'validation-conflict' );
					textarea_flag = true;
				}else{
					$(val).removeClass( 'validation-conflict' );
				}
			});
			if(textarea_flag){
				msg += "\n Definieren Sie bitte einen Text für das Textfeld.";
			}
			
			// validate checkboxes
			if($(selector).find('input[type=checkbox]').length > 0 && $(selector).find('input:checked').length === 0){ 
				$(selector).find('input[type=checkbox]').addClass( 'validation-conflict' );
				msg =+ "\n Mindestens eine Antwortoption sollte als richtig markiert werden.";
			}else{
				$(selector).find('input[type=checkbox]').removeClass( 'validation-conflict' );
			}
			
			if(String(msg).length === 0){ 
				return msg; 
			}else{ 
				console.log('Validation Error:' + msg); 
				return msg;
			}
		},
		
		
		/*
		* Formats time from seconds to decimal mm:ss
		* @todo: include hours
		**/		
		formatTime : function(secs, delimiter){
			delimiter = delimiter ? delimiter : '';
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + delimiter + seconds;
		}
		
	}); // end class Annotation
/* 
*	name: Vi2.Utils
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*/


////////////////////////////////
/* Defines custom drop out box  (style: #div.klappe)*/
		jQuery.fn.dropdown = function(obj) {
				var head = $(this).find('h4');
				var all = $(this).html();
				$(this).toggle(
					function(){
						$(this).html(head.wrapInner('<h4></h4>').html());
					},
					function(){
						$(this).html(all).find('h4').attr('style','background-image:url(images/arrow_d.png); display:inline;');
					}
				).click();
			};

////////////////////////////////
/* ...*/
		jQuery.fn.hidetext = function(obj) {
			var text = $(this).text();
			var el = $(this).text(text.substr(0, 250)+' ').append($('<span>more</span>')); //.button()
			return el;
			};
			
			
////////////////////////////////			
		jQuery.fn.round = function(dec) {	
	    if (!dec) { dec = 0; }
    	return Math.round(this*Math.pow(10,dec))/Math.pow(10,dec);
  	};

//////////////////////////////
function delegate(obj, func){
	var f = function() {
		var target = arguments.callee.target;
		var func = arguments.callee.func;
		return func.apply(target, arguments);
	}; 
	f.target = obj;
	f.func = func; 
	return f;
}

//////////////////////////////
function removeDuplicates (cat){
	cat = cat.sort();
  for(var i = 1; i < cat.length;){
  	if(cat[i-1] == cat[i]){ cat.splice(i, 1); } 
  	else { i++; }
  }
  return cat;     
}


/*
* calcs temporal distance to a given time stamp
**/
function timeDifference (s, prefix, postfix){
			//prefix = prefix === undefined ? 'vor ' : prefix;
			//postfix = postfix === undefined ? ' ago' : postfix; 
			
			var b = moment( s );  
			var a = moment( s ); 
			
			
			var diff = a.diff(b, 'seconds'); 
			if(diff <= 60 ){
				return prefix + diff.toFixed(1) + 's' + postfix; 
			}
			
			diff = a.diff(b, 'minutes'); 
			if(diff <= 60){
				return prefix + diff.toFixed(1) + 'min' + postfix;
			}
			
			diff = a.diff(b, 'hours', true); 
			if(diff <= 24){
				return prefix + diff.toFixed(1) + 'h' + postfix; 
			}
			
			diff = a.diff(b, 'days', true); 
			if(diff < 30){
				return prefix + diff.toFixed(1) + 'd' + postfix; 
			}
			
			diff = a.diff(b, 'months', true);
			if(diff < 12){
				return prefix + diff.toFixed(1) + 'm' + postfix; 
			}
			
			diff = a.diff(b, 'years', true);
			return prefix + diff.toFixed(1) + 'y' + postfix; 
			
}




/////////////////////////////
Object.size = function(obj) {
    var 
    	size = 0, 
    	key = {}
    	;
    for (key in obj) {
        if (obj.hasOwnProperty(key)){
        	size++;
        }	
    }
    return size;
};



Vi2.Utils = $.inherit(/** @lends Utils # */{

	/** 
	*		@constructs 
	*		
	*/
	__constructor : function(options) { },
	
	name : 'utils',
	
	
	/* Converts seconds into decimal format */
	seconds2decimal : function(seconds) {
		d = Number(seconds);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "00:") + (s < 10 ? "0" : "") + s); 
	},
	
	/* 
	*Converts decimal time format into seconds 
	**/
	deci2seconds: function( decimal ){
		if(Number(decimal) < 0 || decimal === undefined ){ return 0; }
		var arr = decimal.split(':');
		return Number(arr[0])*3600+Number(arr[1])*60+Number(arr[2]);
	}
	
}); // end utils


/* 
*	name: Vi2.Log
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 further options:
	** standardisazion:
	* https://sites.google.com/site/camschema/home
	* http://sourceforge.net/p/role-project/svn/HEAD/tree/trunk/gadgets/cam_sjtu/CamInstance.js
	* http://sourceforge.net/p/role-project/svn/HEAD/tree/trunk/gadgets/html5Video/videoGadget.xml
	*/

	Vi2.Log = $.inherit(/** @lends Log# */{

		/** 
		*	Input:
		* 	client IP Adress via server side request
		* 	client browser, operating system, 
		* 	time in ms since 1970	
		* 	clicks: tags, category, startpage, lecture 
		* 	search terms
		* 	video: seek on timeline, link clicks, seek2link, toc clicks
		* 
		* Output options:
		* 	dom #debug
		* 	log.txt via PHP
		* 	console.log (default)
		*
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*		@param {String} options.output Output channel that could be a 'logfile' or a 'debug' panel
		*		@param {Selector} options.debug_selector If options.output is set to debug at following DOM selector will used to output log data
		*		@param {String} options.logfile If options.output is set to logfile that option indicates the filename of the logfile
		*		@param {String} options.parameter Its a comma separated list of data parameters that should be logged. Possible values are: time, ip, msg, user
		*		@param {object} options.logger_path Relative path to a remote script that writes text messages to options.file
		*/
  	__constructor : function(options) { 
  			var _this = this;
  			this.options = $.extend(this.options, options); 
  			this.userAgent = this.getUserAgent();
  			// get client IP xxx 
  			/*if(this.options.logger_path !== '-1'){ 
					$.ajax({
						url: this.options.logger_path,
		 				success: function(res){ 
							_this.ip = res.ip;
						},
						dataType: 'json'
					});
				}				
				// clear
				$('#debug').html('');*/
		},
		
		name : 'log',
		options : {
			output: 'logfile', 
			debug_selector: '#debug', 
			prefix: '', 
			logfile:'log.txt', 
			parameter: 'time,ip,msg,user', 
			logger_path: '-1'//'../php/ip.php'
		}, // output: debug/logfile
		bucket : '',
		ip : '',
	
		/* ... */
		init : function(){},		
		
		/* -- */
		add : function(msg){
			//var logEntry = this.getLogTime()+', '+this.options.prefix+', '+this.getIP()+', '+msg+', '+this.getUserAgent()+'\n';
			
			//var logEntry = this.getLogTime()+', '+vi2.currentVideo+', '+', '+vi2.currentGroup+', '+vi2.userData.id+', '+msg+', '+this.getUserAgent()+'\n'; 
			//'clickcommentfromlist:'+val.name +' '+val.author+' '+ val.time 
			if(typeof msg === 'string'){
				console.log('warning: uncaptured log emtrie: ' +msg);
				return;
			}else{
				//console.log(msg.context);
			}
			var 
				pt = vi2.observer.player.currentTime();
				t = new Date()
				;
			t = t.getTime();
			
			var logEntry = {
				utc: 								t, 
				//phase: 						vi2.current,
				//date:  						String, 
				//time:  						String, 
				//group:  					vi2.currentGroup, 
				user:  						vi2.userData.id,   
				//user_name:  			String,
				//user_gender:			String,
				//user_culture:			String,
				//user_session:			Number,
				video_id:  				vi2.currentVideo,
				//video_file:  			String,
				//video_length:  		String,
				//video_language:  	String,
				action: msg,  /*{
					context: msg.context,
					action: msg.action,
					values: msg.values
				},						*/
				playback_time:		pt === undefined ? -1 : pt,
				user_agent:  			this.getUserAgent()
				//ip: 							String,
			
			};
			
			this.writeLog( logEntry );
			
			return;
		},
		
		/* -- */
		getLogs : function(){
			return this.bucket;
		},
		
		/* -- */
		getLogTime : function(){
			var date = new Date();
			var s = date.getSeconds();
			var mi =date.getMinutes();
			var h = date.getHours();
			var d = date.getDate();
    	var m = date.getMonth()+1;
    	var y = date.getFullYear();
    	//return date.getTime()+', ' + y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d)+', '+(h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds();
			return { 
				utc: date.getTime(), 
				date: y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d),
				time: (h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds()
			};	
		},
		
		/* -- */
		getIP : function(){
			return this.ip;
		},
						
		/* -- */
		getUserAgent : function(){
		 var ua = $.browser; 
  		return	navigator.userAgent.replace(/,/g,';');
		},
		
		/* -- */
		writeLog : function (entry){ 
			//$.post('php/log.php', { entry:entry });
			if(this.options.logger_path !== '-1'){ 
				$.post(this.options.logger_path, { data: entry }, function(data){}); 
			}
		}					
				
	
		
	}); // end class Log
	
/* 
* name: Vi2.Metadata
* author: niels.seidel@nse81.com
* license: MIT License
* description:
* depends on:
*  - lib: embedded java script
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:	
	- integrate it on server side
	- do we really need a rendering funtion?
	- complete metadata
	- think about sitemap.xml and dbpedia
	- bug: metadata width and height is Null since the video has not been loaded yet.
*/


Vi2.Metadata = $.inherit(/** @lends Vi2.Metadata# */
	{
			/** 
			*		@constructs 
			*		@param {object} options An object containing the parameters
			*/
  		__constructor : function( options ) { 
  			this.metadata = vi2.db.getMetadataById( vi2.observer.current_stream );
  			this.options = $.extend(this.options, options);
  			this.update();
  		},
  		
  		// defaults
  		options : { 
  			selector: '.metadata',
  			requiresMetatags: true, 
  			requiresDisplay: true
  		},
  		
  		
  		/** 
  		* Updates all metadata
  		*/
  		update: function(){
  			if( this.options.requiresDisplay ){
  				this.displayMetadata();
  			}
  			if( this.options.requiresMetatags){	 
  				this.buildMetaTags();
  			}	
  		},
  		
  	
  		/** 
  		* Displays metadata to the given selector
  		*/
  		displayMetadata : function(){
  			//var html = new EJS({url: vi2.templatePath+'vi2.metadata.ejs'}).render( this.metadata );
				//$( this.options.selector ).html( html );
  		},
  		
  		
  		/** 
  		* Append html meta tags to the DOM header in favour of SEO 
  		*/
			buildMetaTags : function(){ 
				$('head meta').each( function(i,val){ $(val).remove(); });
				$('head')
					.prepend('<meta content="text/html;charset=utf-8" http-equiv="Content-Type">')
					.prepend('<meta content="utf-8" http-equiv="encoding">')
					.prepend('<meta http-equiv="X-UA-Compatible" content="IE=Edge"/>')
					.prepend('<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />')
					.prepend('<meta itemprop="duration" content="'+this.metadata.length+'" />')
					.prepend('<meta itemprop="height" content="'+ vi2.observer.player.height() +'" />')
					.prepend('<meta itemprop="width" content="'+ vi2.observer.player.width() +'" />')
					.prepend('<meta itemprop="uploadDate" content="'+this.metadata.date+'" />')
					//.prepend('<meta itemprop="thumbnailUrl" content="'+vi2.page_url+'img/thumbnails/iwrm_'+vi2.observer.current_stream+'.jpg" />')
					.prepend('<meta itemprop="contentURL" content="' + vi2.db.getStreamById( vi2.observer.current_stream ).video + '" />')
					//.prepend('<meta itemprop="embedURL" content="'+vi2.page_url+'#!'+vi2.observer.current_stream+'" />')
				;	
			}
}); // end class

/* 
* name: Vi2.AnnotatedTimline
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* related code:		
	- timeline preview: https://github.com/brightcove/videojs-thumbnails/blob/master/videojs.thumbnails.js

* todo:
*   - cluster / zoom : - Vergleiche Darstellung von sehr vielen Markern bei Google Maps ...
		- diagramm (?)
		- filter
		- multi tracks
		- add slide preview
		- bug: previw is not exact and is loading very slow

*/


Vi2.AnnotatedTimeline = $.inherit(/** @lends Vi2.TableOfContents# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(video, options, seek) { 
  			this.video = video;
  			this.options = $.extend(this.options, options);  
  			this.seek = seek === undefined ? 0 : seek;
  			this.init();
		},
		
		name : 'annotated timeline',
		type : 'core',
		options : {
			timelineSelector : '.vi2-timeline-main',
			hasPreview : false,
			hasSlidePreview: false,
			previewPath : '/static/img/video-stills/theresienstadt/still-image-',
			hasMarker : true,
			path:'/'
		},
		video : null,
		seek : 0,
		seeksliding: false,
		video_seek: null,  
		
		video_loading_progress: null,
		video_timer: null,
		interval: 0,
		percentLoaded:0,
		video_container: null,
		cursorX : 0,

		/**
		Initializes the table of content and handles options
		*/
		init : function(annotations){ 
			var _this = this;
			// init
			this.video_seek = $( this.options.timelineSelector );
			this.video_loading_progress = $('.vi2-timeline-progress');
			this.video_timer = $('.vi2-video-timer'); // could become an option
		
			if( this.options.hasPreview ){
				//this.createTimelineVideoPreview();
			}
			
			if( this.options.hasSlidePreview ){
				//this.createTimelineSlidePreview();
			}		
		
			// initiate event listeners, vi2.observer.log('loadingtime--video:'+url);
			var 
				t0 = 0, 
				t1 = 0
				;
			this.video.onloadstart = function(e){
				// 1. event called 
				t0 = Date.now();
			};
			this.video.ondurationchange = function(){ 
				// 2. event called
				t1 = ( Date.now() - t0 );
				//console.log('duration '+ ( Date.now() - t0 ) );
				_this.handleDurationChange();  
			}; 
			this.video.onloadedmetadata = function(e){ 
				// 3. event called
				//console.log('load meta '+ ( Date.now() - t0 ) );  
			};
			this.video.onloadeddata = function(e){ 
				// 4. event called
				vi2.observer.log({context:'player', action:'video-loading-time', values:[t1, ( Date.now() - t0 )]});
				//console.log('load data '+ ( Date.now() - t0 ) ); 
			};
			this.video.onprogress = function(e){ 
				// 5. event called  
			};
			this.video.oncanplay = function(e){ 
				// 6. event called
				//console.log('can play '+ ( Date.now() - t0 ) );  
			};
			this.video.oncanplaythrough = function(e){ 
				// 7. event called
				//console.log('can play through '+ ( Date.now() - t0 ) ); 
			};
			
			
			this.video.addEventListener('timeupdate', function(e){ 
				_this.handleTimeupdate(e); 
			});
			
		},		
		
		/** 
		* Creates a timeline slider to seek within the playback time 
		*/
		createTimelineControl : function() { 
			var _this = this;
			//
			/*if (this.video.readyState) {  
				clearInterval(this.interval);
				clearInterval(this.interval);*/
				//var video_duration = _this.video.duration; //$(this.options.selector).attr('duration');
				this.video_seek.slider({
					value: 0,
					step: 0.01,
					orientation: 'horizontal',
					range: 'min',
					max: vi2.observer.player.duration(),
					animate: false,
				  slide: function(event, ui) { 
							_this.seeksliding = true;
					},
					start: function(event, ui) { 
						vi2.observer.log({context:'player',action:'seek-start',values: [ui.value]} );
						_this.buffclick++;
						_this.seeksliding = true;
					},
					stop: function(event, ui) { 
						vi2.observer.log({context:'player',action:'seek-stop',values:[ui.value]}	);
						_this.seeksliding = false;
						//if(_this.percentLoaded > (ui.value / _this.duration())){
						vi2.observer.player.currentTime( parseFloat(Math.ceil(ui.value)) ); // XXX bugy / webkit fix
					}
					
				});
				
			/*} else {
				// try reinitiate the slider as long the ...? 
				this.interval = setInterval(function() { _this.createTimelineControl(); }, 150);
			}*/
		
		},
		
		
		/*
		* Add Video preview on timeline
		* todo: event could be logged
		**/
		createTimelineVideoPreview : function(){ 
			var 
					_this = this,
					width = $( this.options.timelineSelector ).width(),
					left = ($( this.options.timelineSelector )).offset().left,
					t = 1,
					o = null
					;
			
			var img = new Image();
			img.id = 'videopreview';//);//.attr('src', _this.options.previewPath + "001.jpg");
			var timeline_preview = $('<div></div>')
				.addClass('vi2-timeline-preview')
				.html( img )
				.appendTo( _this.options.timelineSelector );
			
			// event
			var handleTimelineMoves = function(event){ 
					$( timeline_preview ).css({ left: (event.pageX - 100) });
					t = (Math.round( ( event.pageX / width ) * vi2.observer.player.duration() ) - 20); // correction value is unclear
					o = new Image();
					img_selector = document.getElementById("videopreview");
					listener = function(event2){
						img_selector.src = o.src; 
					};
					o.removeEventListener('load', listener, false);
					o.addEventListener('load', listener, false); 
					o.src = _this.options.previewPath + "" + t + ".jpg";//  + "?_=" + (+new Date());
					o.onerror = function () { this.style.display = "none"; };
			};			
			var el = document.getElementsByClassName( 'vi2-timeline-main' );
			el[0].removeEventListener('mousemove', handleTimelineMoves );
			el[0].addEventListener('mousemove', handleTimelineMoves );
		},
		

		/*
		* Add Video preview on timeline
		* todo: event could be logged
		**/
		createTimelineSlidePreview : function(){ 
			var 
					_this = this,
					width = $( this.options.timelineSelector ).width(),
					left = $( this.options.timelineSelector ).offset().left,
					t = 1,
					o = null
					;
			var timeline_preview = $('<div></div>')
				.addClass('vi2-timeline-preview')
				.appendTo( this.options.timelineSelector );
			
			// event			
			var el = document.getElementsByClassName( 'vi2-timeline-main' );
			el[0].addEventListener('mousemove', function(event){ 
					$( timeline_preview ).css({ left: (event.pageX - 100) });
					t = (Math.floor( ( vi2.observer.player.duration() / width ) * Math.floor(event.pageX) )).toString();
					
					o = new Image();
					o.src = _this.options.previewPath + "" + t + ".png";
					listener = function(event2){
						$( timeline_preview )
							//.css({ left: (event.pageX - 100) })
							.html(o);
					};
					o.removeEventListener('load', listener, true);
					o.addEventListener('load', listener, true); 
			}, false);
		},
	
		
		/** 
		* Displays markers on the timeline
		* options: hasTooltip, clickable, type, 
		*/
		addTimelineMarkers : function(type, data, timelineSelector){   
			var _this= this; 
			if( timelineSelector === undefined ){
				timelineSelector = this.options.timelineSelector;
			}
			this.options[ type ] = { markerHasTooltip: true, markerIsClickable:true };
			var timeline = $( timelineSelector );
			
			// remove existing markes of the same type before rewriting them
			$('.'+type + '-timeline-marker').each(function(i, val){ $(val).remove(); });
			
			$.each( data, function(i, val){ 
				var progress = val.occ[0] / vi2.observer.player.duration();
				progress = ((progress) * $( timelineSelector ).width());
	    	if (isNaN(progress) || progress > $( timelineSelector ).width()) { return;}
	    	
	    	var sp = $('<a></a>')			// $('<span></span>');		
					.addClass( type + '-timeline-marker ttoc')
					.attr('style','left:'+ progress +'px;')
					;
				if( _this.options[ type ].markerHasTooltip){
					sp
						.attr('title', val.name)
						.attr('data-toggle', 'tooltip');
				}	
				if( _this.options[ type ].markerIsClickable ){	
					sp.bind('click', function(event){ 
							vi2.observer.player.currentTime( val.occ[0] );
							// xxx bug for type === assessment !!! todo
							vi2.observer.log( {context:type, action:'timeline-link-click',values:[val.name,val.author,val.occ[0]]});
					});
				}
 				timeline.append(sp); // val.title
			});
		},
		
				
		/*
		* Event is called when the total playback time has been determined
		**/
		handleDurationChange : function(e) {  
			this.createTimelineControl(); 
			//if( $(_this.options.selector).attr('duration') != undefined )  
			 
			 	vi2.observer.player.currentTime( this.seek );
				$(vi2.observer).trigger('player.ready', [vi2.observer.player.seqList[vi2.observer.player.seqNum].id, vi2.observer.player.seqNum]);
				
			
			/*if (Number(this.seek) > 0) { 
				if(this.percentLoaded > (this.seek / this.duration())){
					//this.currentTime(seek); // bugy in production use or on remote sites
					vi2.observer.player.currentTime( this.seek );
					$(vi2.observer).trigger('player.ready', [vi2.observer.player.seqList[vi2.observer.player.seqNum]['id'], vi2.observer.player.seqNum]);
				}
			}*/
			 	
		},
		
		
		/*
		* Event is called during the videos is buffering
		**/
		handleProgress : function (e) {
			//_this.setProgressRail(e);
			var
				target = this.video;//(e != undefined) ? e.target : this.video,
				percent = null;			

			if (target && target.buffered && target.buffered.length > 0 && target.buffered.end && target.duration) {
				percent = target.buffered.end(0) / target.duration;
			} else if (target && target.bytesTotal !== undefined && target.bytesTotal > 0 && target.bufferedBytes !== undefined) {
				percent = target.bufferedBytes / target.bytesTotal; 
			} else if (e && e.lengthComputable && e.total !== 0) {
				percent = e.loaded/e.total;
			}

			if (percent !== null) {
				this.percentLoaded = percent;
				percent = Math.min(1, Math.max(0, percent));
				
				if (this.video_loading_progress && this.video_seek) {
					this.video_loading_progress.width(this.video_seek.width() * percent);
				}
			}
			
		},


		/*
		* Event is called every time when the playback time changes
		**/
		handleTimeupdate : function(e) { 
			if (!this.seeksliding & vi2.observer.player !== undefined ) {
				this.video_seek.slider('value', vi2.observer.player.currentTime() ); // / vi2.observer.player.duration()
			}
			//this.video_timer.text( vi2.utils.seconds2decimal( vi2.observer.player.currentTime() ) + ' / ' + vi2.utils.seconds2decimal( vi2.observer.player.duration() ));
		},
		
		
		/**/
		pixelInTime : function(){}
		
		
	
		
	/* -- 
		setCurrentRail: function(e) {

			var t = this;
		
			if (t.media.currentTime != undefined && t.media.duration) {

				// update bar and handle
				if (t.total && t.handle) {
					var 
						newWidth = t.total.width() * t.media.currentTime / t.media.duration,
						handlePos = newWidth - (t.handle.outerWidth(true) / 2);

					t.current.width(newWidth);
					t.handle.css('left', handlePos);
				}
			}

		}	*/
		
	}); // end class
/* 
*	name: Vi2.VideoManager
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Implements a journaled naviagtion for browsing back and forth in a collection of videos.
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:

- kann templates laden und für seine kinder (e.g. related videos verarbeiten)


- listen to url changes and load videos and views
- list streams by category / tag / author / date / ...
- offers different rendering styles: 
Karussell, Liste, Card-Deck, Matrix, Stack, Video-Wall, Slide-Row, Slide-Matrix, ...
- sort order, change sort order .. sort by..

*/



Vi2.VideoManager = $.inherit(/** @lends Vi2.VideoManager# */{ // 

	/** 
	*		@constructs 
	*		@param {object} options An object containing the parameters
	*/
	__constructor : function(options) { 
		this.options = $.extend(this.options, options); 
	},
	
	name : 'video-manager',
	type : 'collection',
	content_selector : '#content',
	options : {
		selector : '#seq'
	},
	viewing_history : [],

	/**
	* Define paths that the video manager is listing to. 
	*/
	init : function(){  
		var _this = this; 
		
		// define default get routes
		Sammy(this.options.selector, function() { 
        
        this.get('#!/video/:stream/:time', function() {
        	_this.handleNewStream( this.params );
        });
     
        this.get('#!/video/:stream', function() {
        	_this.handleNewStream( this.params );
        });
        
        this.get('#!/videos/all', function() {
        	_this.handleAllStreams( );
        });
        
        this.get('#!/tags/:tag', function() {
        	_this.handleTags( this.params );
        });
        
        this.get('#!/category/:category', function() {
        	_this.handleCategory( this.params );
        });
        
      }).run();	
	},
	
	
	/*
	* Interface for other widgets to define routes that will be handled on their own
	* @params path {String} Path under which the the given callback function should called. For instance http://example.com/#<my-path>. The '#' is set by default and should therefore be excluded.
	* @params callback {Object}
	* @params fn {Object}
	**/
	addRoute : function(path, callback, fn){
		Sammy(this.options.selector, function() { 
		  this.get('#!'+path, function() {
		  	callback[fn]();
		  });
		}).run();
	},
	
	
	/*
	* Calls the given template from the defined template path in order to render the given data.
	**/
	render : function(template, data){ 
			return new EJS( { url: vi2.templatePath+''+template} ).render( data );
	},
	
	
	/**
	* This functions process a comma separated list of tags in order to identify the video streams that are related to these tags
	*/
	handleTags : function(params){ 
		var tags = params.tag.split(/,/); 
		var stream_names = '';
		var streams = [];
		var inverted = vi2.db.getInvertedTagIndex();
		
		for(var i = 0; i < tags.length; i++){
			if( inverted[tags[i]] !== undefined ){ 
				stream_names += inverted[tags[i]].toString() +',';
			}	
		}
		var t = []; t = removeDuplicates( stream_names.split(/,/) ); 
		for( var s = 0; s < t.length; s++){ 
			if( t[s]  !== ''){
				var str = vi2.db.getStreamById( t[s] );
				streams.push( str ); 
			}
		}
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Tags: ' + tags.toString(), items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* This functions process a single given category 
	*/
	handleCategory : function(params){ 
		var category = params.category; 
		var streams = vi2.db.getStreamsByCategory( category );
		
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Category: ' + category, items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* This functions processes all stream 
	*/
	handleAllStreams : function(params){ 
		var streams = vi2.db.getAllStreams();
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Category: ' + category, items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* Load a new video stream and naviagte to the give position in time.
	*/
	handleNewStream : function(params){ 
		var _this = this;
		var seek = params.time === undefined ? 0 : params.time.split(/:/)[1];
  	if( params.stream != vi2.observer.current_stream ){ 
    	$(vi2.dom).empty(); 
    	vi2.observer.setCurrentStream( params.stream, seek ); 
			vi2.observer.player.play(); 
			_this.loadWidgets();
		}else{
			vi2.observer.player.currentTime( seek );
		}	
	},
	
	
	
	/**
	*
	*/
	loadWidgets : function(){
	
		// Define some annotation widgets
	 	var toc = new Vi2.TableOfContents( { 
	 		hasTimelineMarker: true, 
	 		hasMenu: true, 
	 		menuSelector:'.toc' 
	 	} );
		
		// Synchronize some presentation slides as 
		var syncMedia = new Vi2.SyncronizeMedia( { 
			selector: '.syncMedia', 
			hasTimelineMarker: true, 
			hasMenu: true, 
			menuSelector:'.toc' 
		} );
		
		//var userNotes = new Vi2.UserNotes();
		
		// With these widgets we make use of the video database
		
		var relatedVideos = new Vi2.RelatedVideos( { 
			resultSelector: '.related-videos', 
			criteria:[
				{ criterion: 'random-destructor', weight:0.1 },
				{ criterion: 'same-author', weight:0.8 }, 
				{ criterion: 'same-tags', weight:0.6 },
				{ criterion: 'incomming-links', weight:0.5 },
				{ criterion: 'outgoing-links', weight:0.5 }
				] 
		} );
		//relatedVideos.init();
		
		/*var inVideoSearch = new Vi2.Search( {
			resultSelector: '.search-results', 
			limit: 25
		} );*/
		//inVideoSearch.find('water basin');
		
		
		// add all the widgets
		vi2.observer.addWidget( toc );
		vi2.observer.addWidget( syncMedia );
		
			
		vi2.observer.addWidget( relatedVideos );
		//vi2.observer.addWidget( userNotes );
		//vi2.observer.addWidget( inVideoSearch );
	
	
	},



	/* buggy ... */
	listAllItems : function(){
			var template = $("#item_template").val();
			
		// list items of all categories		
		$.each(this.getCategoryTaxonomie(), function(i, cat_name){
			// cat name
			$(_this.content_selector).append($("<h2></h2>").addClass('cat'+i).text(cat_name)).append('<br>');
			$.each(_this.json_data.stream, function(i, stream){
				if(stream.metadata[0].category == cat_name){
					var item =$('<div></div>')
						.setTemplate(template)
						.processTemplate(stream)
						.appendTo($(_this.content_selector));
						//$('div.hyphenate').hyphenate({remoteloading:true,});//.css('color','red');
						//$('.text').hidetext();						
				}
			});		
		});
	
	}
	
	
	
}); // end class VideoManager		
/* 
* name: Vi2.Playbackspeed
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
* - show speed changes on video frame when they get changed with keyboard commands
* - delay drop down select
*/


Vi2.PlaybackSpeed = $.inherit(/** @lends Vi2.PlaybackSpeed# */{

	/** 
	*	@constructs 
	*	@param options {object}
	* @param options.selector {String} 
	* @param options.videoSelector {String} 	
	* @param options.speed_steps {Array} Float array with the available steps to increase or decrease the playback speed 
	*/
	__constructor : function(options) { 
			this.options = $.extend(this.options, options);
			this.video = document.getElementById( this.options.videoSelector );
	},
	
	name : 'playbackSpeed',
	type : 'player-widget',
	options : {
		selector: '.control-bar',
		videoSelector : 'video1',
		speed_steps: [0.3,0.5,0.7,1.0,1.5,1.7,2.0]//[0.3,0.5,0.8,1.0,1.5,2.0,3.0,4.0]	
	},
	speed : 1, // default speed
	video : '',	
	speedIndex : 3,
	

	/** 
	*	Initializes the playback speed controls 
	*/
	init : function(selector){  
		var _this = this;
		// clear selector
		$( this.options.selector + '> .vi2-speed-controls' ).remove();
		
		var container = $('<div></div>')
			.append($('<div></div>').text('1.0x').addClass('speed-label'))
			.addClass('vi2-speed-controls')
			.bind('mouseenter', function(e){
				$('.vi2-speed-controls > ul').css('display','block');
			})
			.bind('mouseleave', function(e){
				$('.vi2-speed-controls > ul').css('display','none');
			})
			/*.tooltip({
				delay: 0, 
				showURL: false, 
				bodyHandler: function() { 
					return $('<span></span>')
						.text('Wiedergabegeschwindigkeit');
				} 
			})*/
			.appendTo( this.options.selector );
			
		var options = $('<ul></ul>')
			.addClass('select-speed')
			.appendTo(container);
		
		$.each( this.options.speed_steps, function(i, val){ 
			var sel = $('<li></li>')
				.attr('speed', val)
				.text(val+'x')
				.click(function(e){
					_this.setCurrentSpeed( $(this).attr('speed') );
				})
				.appendTo(options);
				
		});
	},
	
	
	/** 
	* Shows the currently changed speed option inside the video frame. This indicator disappears after a few seconds
	*/
	displaySpeed : function(){
		// need to be implemented
	},
	
	
	/** 
	* Interface that returns the current playback speed
	*/
	getCurrentSpeed : function(){
		return this.speed;
	},
	
	
	/** 
	* Interface to sets the playback speed
	*	@param speed {Number} 	 
	*/ 
	setCurrentSpeed : function(speed){ 
		if( this.options.speed_steps.indexOf( parseFloat(speed) ) !== -1){
			// log event
			vi2.observer.log({context:'playbackSpeed', action:'change-speed', values:[this.speed, speed]});
			// set speed
			this.video.defaultPlaybackRate = 1.0; 
			this.video.playbackRate = speed; 
			this.speed = speed;
			this.speedIndex = this.options.speed_steps.indexOf( parseFloat(speed) );
			// set label
			$('.speed-label').text( speed + 'x');
			// close select menu
			$('.vi2-speed-controls > ul').css('display','none');
		}	
	},
	
	
	/**
	* Interface to increases the playback speed by one step in the index of the given values 
	*/
	increaseSpeed : function(){ 
		if( this.speedIndex < this.options.speed_steps.length ){
			this.setCurrentSpeed( this.options.speed_steps[ this.speedIndex + 1 ] );
		}	
	},
	
	
	/** 
	* Interface to decreases the playback speed by one step in the index of the given values 
	*/
	decreaseSpeed : function(){ 
		if( this.speedIndex > 1 ){
			this.setCurrentSpeed( this.options.speed_steps[ this.speedIndex -1 ] );
		}	
	}
	
	
}); // end class
	
/* 
* name: Vi2.Zoom
* author: niels.seidel@nise81.com
* license: MIT License
* description: Allows to zoom the video in and out.
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	 - jquery.panzoom.js
* todo:
*  - needs event logging
*/


Vi2.Zoom = $.inherit(/** @lends Vi2.Zoom# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'zoom',
		type : 'player-widget',
		options : {
			videoSelector : '#video1',
			controlSelector : '.control-bar',
			hasControls : true,
			hasReset : true,
			haseSlider : true,
			min : 1,
			max : 4,
			steps : 0.25
		},

		/**
		* Initializes the control elements including the plugin panzoom
		*/
		init : function(){
		
			// clear selector
			$( this.options.controlSelector + '> .zoom-controls' ).remove();
		
			// add controls
			var container = $('<div></div>')
				.addClass('zoom-controls')
				.appendTo( this.options.controlSelector );
			
			if( this.options.hasSlider ){
				var range = $('<input></input>')
					.attr('type','range')
					.addClass('vi2-zoom-range')
					.appendTo( container )
				;
			}
			
			if( this.options.hasControls ){
				var btn_out = $('<button></button>')
					.text('-')
					.addClass('vi2-zoom-out')
					.prependTo( container )
				;
				var btn_in = $('<button></button>')
					.text('+')
					.addClass('vi2-zoom-in')
					.appendTo( container )
				;
			}
			
			if( this.options.hasReset ){
				var btn_reset = $('<button></button>')
					.text('reset')
					.addClass('vi2-zoom-reset')
					.appendTo( container )
				;
			}
		
		  // start panzoom with the given options
			var panzoom = $( this.options.videoSelector ).panzoom({
				cursor: "move",
				increment: this.options.steps,
				minScale: this.options.min,
				maxScale: this.options.max,
				rangeStep: this.options.steps,
				transition: true,
				duration: 200,
				easing: "ease-in-out",
				$zoomIn: $('.vi2-zoom-in'),
				$zoomOut: $('.vi2-zoom-out'),
				$zoomRange: $('.vi2-zoom-range'),
				$reset: $('.vi2-zoom-reset'),
				focal: {
				    clientX: 108,
				    clientY: 132
				}
			});
		}
}); // end class  
/* 
* name: Vi2.Sharing
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - add sharing link for a popup
*	 - add sharing facilities for social media applications
*/


Vi2.Sharing = $.inherit(/** @lends Vi2.Sharing# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {String} options.selctor Selector to append the ahring button
		*		@param {boolean} options.shareLink 
		*		@param {boolean} options.shareEmbedLink 
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'sharing',
		type : 'player-plugin',
		options : {
			selector : '.control-bar',
			shareLink : true,
			shareEmbedLink: true,
			label: '</>'
		},
	
		/**
		* Creates an control element to allow users to share the video 
		*/
		init: function(){
			var _this = this;
			
			var url = window.location.href;//.slice(window.location.href.indexOf('#') + 1);
			
			// clear selector
			$( this.options.selector + '> .vi2-sharing-controls' ).remove();
		
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>').text( this.options.label )
				.addClass('sharing-label'))
				.addClass('vi2-sharing-controls')
				.bind('mouseenter', function(e){
					
				})/*
				.bind('mouseleave', function(e){
					$('.sharing-controls > .select-sharing').css('display','none');
				})*/
				.appendTo( this.options.selector );
			
			var options = $('<div></div>')
				//.append( browserSharing )			// xxx some bug
				.addClass('vi2-sharing-select')
				.appendTo( container );
			
			
			// share link
			if( _this.options.shareLink ){
				var input = $('<input type="text" />')
					.val( url )
					.attr('readonly',true)
					.attr('aria-describedby', 'URL to the current playback position of the video.')
					.focus(function() { 
						$(this).select(); 
					} )
					.appendTo( options );
			}
			
			// share embed link
			if( _this.options.shareEmbedLink ){
			}
			
			
			/*
			// create button		
			$('<a></a>')
				.addClass('vi2-video-sharing vi2-btn')
				.text('</>')
				.click(function(){ 
					$('.player-share')
						.appendTo('body')
						//.toggle()
						.css('top', '20px')
						.css('left', '250px');
						 
					var url = window.location.href.slice(window.location.href.indexOf('#') + 1);
					
						
					//$('.player-share-popup').val('<iframe src="http://www.iwrm-education.org/popup.html?id='+url+'" width="100" height="20"></iframe>') //also: title=bim&lecturer=sam
						//.bind("focus",function(e){ $(this).select(); })
						//.bind("mouseup",function(e){ return false; });	
					
					
					// share link
					if( _this.options.shareLink ){
						$('.player-share-link').val('http://www.iwrm-education.org/embed.html#'+url)
							.bind("focus",function(e){
									$(this).select();
							})
							.bind("mouseup",function(e){
									return false;
							});
					}
					
					// share embed link
					if( _this.options.shareEmbedLink ){
						$('.player-share-embed').val('<iframe src="http://www.iwrm-education.org/embed.html#'+url+'" width="935" height="610"></iframe>')
							.bind("focus",function(e){ 
								$(this).select(); 
							})
							.bind("mouseup",function(e){ 
								return false; 
							});
					}		
				})
				.appendTo( this.options.selector );
				//
				$('.player-share-close').button().click(function(){
					$('.player-share').hide();
				})
		*/
		},
		
		
		/**
		*/
		prepareEmbedMarkup : function(){
			var code = $();
			// add css
			var sc
			// add js
			var js = $('<script></script')
				.attr('type','text/javascript')
			// add html
			return code.html();
		}	
}); // end class
/* 
* name: Vi2.SkipBack
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - 
*/


Vi2.SkipBack = $.inherit(/** @lends Vi2.SkipBack# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'skipBack',
		type : 'player-widget',
		options : {
			selector : '.control-bar',
			label : '',
			step : 5 // in seconds
		},

		/**
		* Initializes the skip back button of content and handles options
		*/
		init : function(){  
			// clear selector
			$( this.options.selector + '> .vi2-skipback-controls' ).remove();
		
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>')
					.text( this.options.label )
					.addClass('vi2-skipback-label glyphicon glyphicon-step-backward')
				)
				.addClass('vi2-skipback-controls vi2-btn')
				.attr('title', this.options.step+'s zurückspringen')
				.bind('click', function(e){ 
					var current = vi2.observer.player.currentTime();
					var next = Number(Number(current) - Number(_this.options.step));
					
					vi2.observer.log({context:'skipBack',action:'skip-back',values: [current, String(next) ]});
					vi2.observer.player.currentTime( next ); 
				})
				.prependTo( this.options.selector );
		}
}); // end class  
