var
					vi2 = {}, // global variable				
					Vi2 = {}  // set the Namespace for the classes
					;

				function initVideo(db) { 
					vi2.db = db;
					vi2.dom = "#vi2";
					var videoData = vi2.db.getStreamById('test');
					
					var video = $('<div></div>')
						.attr('type', "video")
						.attr('starttime', 0)
						.attr('duration', 7)
						.attr('id', "myvideo")
						.text(videoData.video)
						.appendTo(vi2.dom);
					var viLog = new Vi2.Log({ logger_path: '/log' });
					$(this).bind('log', function (e, msg) { viLog.add(msg); });

					vi2.utils = new Vi2.Utils();
					var options = {
						id: 'test',
						embed: false,
						/*selector: phaseHasSlides === 0 ? '#seq' : '#screen',
						videoWidth: phaseHasSlides === 1 ? 28 : 900,  // video größe hängt nicht von den angeschalteten widgets, sondern von den anotierten ressourcen ab
						videoHeight: phaseHasSlides === 1 ? 15 : 450,*/
						markupType: 'html'
						//thumbnail: _this.db.getMetadataById(_this.currentVideo).thumbnail[2]
					};
					vi2.observer = new Vi2.Observer(options);
					vi2.observer.init(0);
					vi2.observer.parse(vi2.dom, 'html');
					vi2.observer.player.video.oncanplay = function (e) {
						vi2.observer.player.play();
					};
				}
		/*		
				var video_data = {
    "_id": "test",
    "id": "test",
    "progress": "",
    "video": "/videos/VIDEO01_1_Biathlon2_Begruessung.mp4",
    "updated_at": 1480970644530,
    "assessmentwriting": [],
    "assessmentfillin": [],
    "assessment": [],
    "comments": [],
    "slides": [],
    "assessmentanalysis": [],
    "highlight": [],
    "hyperlinks": [],
    "tags": [],
    "toc": [],
    "metadata": [
        {
            "author": "Thomas Borchert",
            "institution": "Universität Leipzig",
            "title": "Probe",
            "category": "Sportunterricht",
            "abstract": "...",
            "length": "2000",
            "date": null,
            "source": "UL",
            "thumbnail": [
                "img/placeholder.png"
            ],
            "tags": [
                "sport"
            ]
        }
    ],
    "__v": 0
};
*/

				$(document).ready(function () { 
					//vi2 = new ViLab(server, "<%= items[0]._id %>");
					vi2.db = new Vi2.DataBase({ modus: 'native', data: video_data, path: ''}, window, 'initVideo', undefined);//this.server_url+this.plugin_dir
					vi2.db.init();
					vi2.dom = "#vi2";
				

				});
