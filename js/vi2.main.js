
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
		Vi2.loadPlugins = function() {
			this.plugins = [
				{ path: 'js/vi2.core.player.volume.js' },
				{ path: 'js/vi2.player.skip.js', options: { step: -5 } },
				{ path: 'js/vi2.player.zoom.js' },
				{ path: 'js/vi2.player.playback-speed.js' },
				{ path: 'js/vi2.core.player.logger.js' },
				{ path: 'js/vi2.annotations.comments.js' }
			];

			for (var i = 0, len = this.plugins.length; i < len; i++) {
				require([this.plugins[i].path, this.plugins[i].options], function (Plugin, options) {
					var opt = options !== undefined ? options : {};
					var p = new Plugin(opt);
					vi2.observer.addWidget(p);
				});
			}
		}

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
					wstoken: 'e321c48e338fc44830cda07824833944',
					moodlewsrestformat: 'json',
					wsfunction: 'videodatabase_logging',
					data: {}
				}
			});
			vi2.observer.addWidget(viLog);
			Vi2.loadPlugins();
			vi2.observer.parse(videoData);

		};


		Vi2.start = function (video_data, user_data) {
			vi2.db = new Vi2.Database({ modus: 'native', data: video_data, path: '' }, 'window');
			vi2.db.currentUser(user_data);
			vi2.db.init(Vi2.initVideo);
		};

		Vi2.update = function (video_data) {
			vi2.db = new Vi2.Database({ modus: 'native', data: video_data, path: '' }, 'window');
			vi2.observer.parse(video_data);
		};




		return Vi2;
	});// end define
