
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

		Vi2.initVideo = function (db) {
			vi2.db = db;
			vi2.dom = "#vi2";
			var videoData = vi2.db.getStreamById('test');
			
			var viLog = new Vi2.Log({ logger_path: '/log' });
			$(this).bind('log', function (e, msg) { viLog.add(msg); });

			vi2.utils = new Vi2.Utils();
			
			vi2.observer = new Vi2.Observer( {
				id: 'test',
				embed: false,
				selector: 'seq'
			});
			vi2.observer.init(0);
			loadAnnotationPlugins()
			vi2.observer.parse( videoData );
			
		};


		Vi2.start = function (video_data) {
			vi2.db = new Vi2.Database({ modus: 'native', data: video_data, path: '' }, 'window');
			vi2.db.init(Vi2.initVideo);
		};

		Vi2.update = function (video_data) {
			vi2.db = new Vi2.Database({ modus: 'native', data: video_data, path: '' }, 'window');
			vi2.observer.parse(video_data);
		};


		function loadAnnotationPlugins() {
			var plugins = [
				{ path: 'js/vi2.annotations.comments.js' }

			];
			this.player_plugins = plugins;

			for (var i = 0, len = this.player_plugins.length; i < len; i++) {
				require([this.player_plugins[i].path], function (Plugin) {
					var options = {};//plugins[i]['options'] !== undefined ? plugins[i].options : {};
					var p = new Plugin();
					vi2.observer.addWidget(p);
				});
			}
		}

		return Vi2;
	});// end define
