
define([
	'jquery',
	'js/jquery.inherit.js',
	'js/vi2.core.observer.js',
	'js/vi2.core.database.js',
	'js/vi2.core.log.js',
	'js/vi2.core.utils.js'
], function (
	$,
	inherit,
	Observer,
	Database,
	Log,
	Utils
) {

		var
			vi2 = {}, // global variable				
			Vi2 = {}  // set the Namespace for the classes
			;
		Vi2.Observer = Observer;
		Vi2.Database = Database;
		Vi2.Log = Log;
		Vi2.Utils = Utils;

		/**
		 * Loads player and annotation plugins
		 *   
		 * todo:
			var temporalBookmarks = new Vi2.TemporalBookmarks();
			var sharing = new Vi2.Sharing();
			*/
		Vi2.loadPlugins = function () {
			this.plugins = {
				volume: { path: 'js/vi2.core.player.volume.js', options: {} },
				skip: {
					path: 'js/vi2.player.skip.js', options: {
						step: -5
					}
				},
				zoom: { path: 'js/vi2.player.zoom.js', options: { /*observer: Vi2.observer*/ } },
				playbackSpeed: { path: 'js/vi2.player.playback-speed.js', options: {} },
				logger: { path: 'js/vi2.core.player.logger.js', options: {} },
				comments: {
					path: 'js/vi2.annotations.comments.js', options: {
						annotation_service_url: '/moodle/webservice/rest/server.php',
						annotation_service_params: {
							wstoken: Vi2.token,
							moodlewsrestformat: 'json',
							wsfunction: 'videodatabase_annotations',
							data: { courseid: Vi2.courseid, videoid: Vi2.videoid }
						}
					}
				}
			};

			vi2.plugins = this.plugins;

			for (var i in this.plugins) {
				if (this.plugins.hasOwnProperty(i)) {
					require([this.plugins[i].path], function (Plugin) {
						var p = new Plugin();
						if (vi2.plugins[p.name] !== undefined && Object.keys(vi2.plugins[p.name]).length > 0 && vi2.plugins[p.name].constructor === Object) {
							p.options = Object.assign(p.options, vi2.plugins[p.name].options);
							vi2.observer.addWidget(p);
						} else {
							console.log('Error could not load and configure plugin:' + p.name);
						}
					});
				}
			}
		};

		Vi2.initVideo = function (db) {
			vi2.db = db;
			vi2.dom = "#vi2";
			var videoData = vi2.db.getStreamById('test');

			vi2.utils = new Vi2.Utils();

			vi2.observer = new Vi2.Observer({
				id: 'test',
				embed: false,
				selector: 'seq'
			});
			vi2.observer.init(0);
			var viLog = new Vi2.Log({
				output_type: -1, // 0: console log: 1: server log
				logger_service_url: '/moodle/webservice/rest/server.php',
				logger_service_params: {
					wstoken: Vi2.token,
					moodlewsrestformat: 'json',
					wsfunction: 'videodatabase_logging',
					data: { courseid: Vi2.courseid }
				}
			});
			vi2.observer.addWidget(viLog);
			Vi2.loadPlugins();
			vi2.observer.parse(videoData);
		};


		Vi2.start = function (video_data, user_data, token, courseid, videoid) {
			Vi2.token = token;
			Vi2.courseid = courseid;
			vi2.wp_user = user_data.username;
			localStorage.setItem('videoid', parseInt(videoid, 10));
			vi2.db = new Vi2.Database({ modus: 'native', data: video_data, path: '' }, 'window');
			vi2.db.currentUser(user_data);
			vi2.db.init(Vi2.initVideo);
			
		};


		Vi2.update = function (video_data, courseid, videoid) {
			Vi2.courseid = courseid;
			localStorage.setItem('videoid', parseInt(videoid, 10));
			vi2.db = new Vi2.Database({ modus: 'native', data: video_data, path: '' }, 'window');
			vi2.observer.parse(video_data);
			vi2.observer.setAnnotations();
		};

		/**
		 * Interface for propagating updates of annotations
		 * @param {String} type 
		 */
		Vi2.updateAnnotations = function(type){
			if (vi2.observer.isWidget(type)){
				vi2.observer.widget_list[type].init();
			}
		};

		/**
		 * Interface for the observer
		 * @param {String} type 
		 */
		Vi2.getObserver = function () {
			return vi2.observer;
		};
		return Vi2;
	});// end define
