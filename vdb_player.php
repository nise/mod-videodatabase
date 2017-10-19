<?php
/**
 * Page module version information
 *
 * @package    mod
 * @subpackage page
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');
require_once($CFG->dirroot.'/mod/videodatabase/locallib.php');
require_once($CFG->libdir.'/completionlib.php');
require_once($CFG->libdir.'/pagelib.php'); 
global $PAGE; 

$id      = optional_param('id', 0, PARAM_INT); // Course Module ID
$p       = optional_param('p', 0, PARAM_INT);  // videodatabase instance ID
$inpopup = optional_param('inpopup', 0, PARAM_BOOL);

if ($p) {
    if (!$videodatabase = $DB->get_record('videodatabase', array('id'=>$p))) {
        print_error('invalidaccessparameter');
    }
    $cm = get_coursemodule_from_instance('videodatabase', $videodatabase->id, $videodatabase->course, false, MUST_EXIST);

} else {
    if (!$cm = get_coursemodule_from_id('videodatabase', $id)) {
    		print_error('invalidcoursemodule');
    }
    $videodatabase = $DB->get_record('videodatabase', array('id'=>$cm->instance), '*', MUST_EXIST);
}

$course = $DB->get_record('course', array('id'=>$cm->course), '*', MUST_EXIST);

require_course_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability('mod/videodatabase:vdb_player', $context);

$PAGE->set_url('/mod/videodatabase/vdb_player.php', array('id' => $cm->id));
$PAGE->navbar->add('Video Manager', new moodle_url('vdb_video-manager.php?id='.$cm->id));
$PAGE->navbar->add('Video');

$options = empty($videodatabase->displayoptions) ? array() : unserialize($videodatabase->displayoptions);

if ($inpopup and $videodatabase->display == RESOURCELIB_DISPLAY_POPUP) {
    $PAGE->set_pagelayout('popup');
    $PAGE->set_title($course->shortname.': '.$videodatabase->name);
    $PAGE->set_heading($course->fullname);
} else {
    $PAGE->set_title($course->shortname.': '.$videodatabase->name);
    $PAGE->set_heading($course->fullname);
    $PAGE->set_activity_record($videodatabase);
}
$PAGE->requires->css( '/mod/videodatabase/styles.css', true );
$PAGE->requires->css( '/mod/videodatabase/css/vi-two.css', true );
//echo '<script language="JavaScript" type="text/javascript" src="/moodle/lib/jquery/jquery-3.1.0.min.js"></script>';
echo $OUTPUT->header();

/*************************************************/

//echo $OUTPUT->heading(format_string($videodatabase->name), 2);

if (!empty($options['printintro'])) {
    if (trim(strip_tags($videodatabase->intro))) {
        echo $OUTPUT->box_start('mod_introbox', 'videodatabaseintro');
        echo format_module_intro('videodatabase', $videodatabase, $cm->id);
        echo $OUTPUT->box_end();
    }
}

$content = file_rewrite_pluginfile_urls($videodatabase->content, 'pluginfile.php', $context->id, 'mod_videodatabase', 'content', $videodatabase->revision);
$formatoptions = new stdClass;
$formatoptions->noclean = true;
$formatoptions->overflowdiv = true;
$formatoptions->context = $context;
$content = format_text($content, $videodatabase->contentformat, $formatoptions);

if(isset($_GET['video_id'])){

	// get video data
	$table = "videodatabase_videos";
	$res = $DB->get_records($table,array('id'=>$_GET['video_id']));
	//print_r($res[27]);
	$out = (array)$res[$_GET['video_id']];//[2]
	/*
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
	*/
	
	// map database entry to internal structur eof vi-two
	$arr = (object)array();
	$arr->id = $out['id'];
	$arr->video = $out['filename'];
	$arr->metadata = array();
	$arr->metadata[0] = (object)array();
	$arr->metadata[0]->author = $out['contributor'];
	$arr->metadata[0]->title = $out['title'];
	
	$arr->metadata[0]->abstract = $out['description'];
	$arr->metadata[0]->thumbnail = "still-".str_replace('.mp4','_comp.jpg',$out['filename']);
	//print_r($out);
	//echo json_encode($arr);
	//
	
	
	$videoMetaData = '<label>Beschreibung:</label> ' . $out['description'];
	$videoMetaData .= '<br />';
	$videoMetaData .= '<label>Kompetenzen:</label> ' . $out['compentencies'];
	$videoMetaData .= '<br />';
	$videoMetaData .= '<label>Sportart:</label> ' . $out['sports'];
	$videoMetaData .= '<br />';
	$videoMetaData .= '<label>Bewegungsfelder:</label> ' . $out['movements'];
	$videoMetaData .= '<br />';
	$videoMetaData .= '<label>Aktivitäten:</label> ' . $out['activities'];
	$videoMetaData .= '<br />';
	$videoMetaData .= '<label>Perspektiven:</label> ' . $out['perspectives'];
	$videoMetaData .= '<br />';
	$videoMetaData .= '<label>Ort:</label> ' . $out['location'];
	$videoMetaData .= '<br />';
	$videoMetaData .= '<label>Klasse:</label> ' . $out['klasse'];
	$videoMetaData .= '<hr />';
	$videoMetaData .= '<label>Produzent:</label> ' . $out['contributor'];
	$videoMetaData .= '<br />';
	$videoMetaData .= '<label>Herausgeber:</label> ' . $out['publisher'];
	$videoMetaData .= '<br />';
	
	/*
<FIELD NAME="compentencies" TYPE="char" LENGTH="255" NOTNULL="false" SEQUENCE="false" COMMENT=""/>
				<FIELD NAME="klassenstufe" TYPE="char" LENGTH="255" NOTNULL="false" SEQUENCE="false" COMMENT=""/>
				<FIELD NAME="sports" TYPE="char" LENGTH="255" NOTNULL="false" SEQUENCE="false" COMMENT=""/>
				<FIELD NAME="movements" TYPE="char" LENGTH="255" NOTNULL="false" SEQUENCE="false" COMMENT=""/>
				<FIELD NAME="activities" TYPE="text" NOTNULL="false" SEQUENCE="false" COMMENT=""/>
				<FIELD NAME="actors" TYPE="char" LENGTH="255" NOTNULL="false" SEQUENCE="false" COMMENT=""/>
				<FIELD NAME="perspectives" TYPE="text" NOTNULL="false" SEQUENCE="false" COMMENT=""/>
				<FIELD NAME="location" TYPE="char" LENGTH="255" NOTNULL="false" SEQUENCE="false" COMMENT=""/>
				<FIELD NAME="klasse" TYPE="int" LENGTH="6" NOTNULL="false" DEFAULT="-1" COMMENT=""/>
        



	$event = \mod\videodatabase\event\video_open::create(array(
		'objectid' => $PAGE->cm->instance,
		'context' => $PAGE->context,
		'video' => $_GET['video_id']
	));
	$event->add_record_snapshot('course', $PAGE->course);
	// In the next line you can use $PAGE->activityrecord if you have set it, or skip this line if you don't have a record.
	$event->add_record_snapshot($PAGE->cm->modname, $activityrecord);
	$event->trigger();
	*/


	echo '
	<!-- Storage -->
	<div style="display:none; visibility:hidden;" id="vi2"></div>
	<!-- End Storage -->
	
	<!-- Player -->
	<div id="wrapper" style="overflow:hidden;">
		<div id="pagex" style="overflow:hidden;">
			
			<!-- Main -->
			<div class="container-fluid">
				<h2>' . $out['title'] . '</h2>
				<div class="row">
					<div id="videowrapper" class="col-lg-9 col-md-9 col-sm-12 col-xs-12">
						<div id="seq" class="col-md-12"></div>
						<div id="overlay" class=""></div>
						<div id="split" class="col-md-9"></div>
						<div id="screen" class="col-md-9"></div>
					</div>
					<div id="accordion-resizer" class="col-lg-3 col-md-3 col-sm-3 hidden-xs visible-sm-inline">
						<div id="accordion" class="video-metadata">
							'. $videoMetaData .'
						</div>
					</div>
				</div>
				<div id="video-controls" class="video-controls col-lg-9 col-md-9 col-sm-12 col-xs-12">
					<div class="timelines">
						<!--<div class="vi2-video-seeklink vi2-btn"></div>-->
						<div class="vi2-timeline-top"></div>
						<div class="vi2-timeline-main vi2-btn"></div>
						<div class="vi2-timeline-bottom"></div>
						<div class="vi2-video-progress vi2-btn"></div>
					</div>
					<div class="control-bar">
						<div class="vi2-video-play-pause vi2-btn" title="Play/Pause">
							<span class="fa fa-play"></span>
							<span class="fa fa-pause"></span>
						</div>
						<div class="vi2-volume-box">
							<div class="vi2-volume-slider"></div>
							<span class="vi2-volume-button vi2-btn" title="Mute/Unmute"></span>
						</div>
						<div class="vi2-video-timer right"></div>
					</div>
				</div>
			</div>
			<!-- Modal -->
			<div hidden class="modal" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
				<div class="modal-dialog" role="document">
					<div class="modal-content modal-form">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 class="modal-title" id="myModalLabel"></h4>
						</div>
						<div class="modal-body"></div>
						<div class="modal-validation"></div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default btn-remove-data"><span class="fa fa-trash"> </span> löschen</button>
							<button type="button" class="btn btn-default" data-dismiss="modal">abbrechen</button>
							<button type="button" class="btn btn-primary btn-sava-data">speichern</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>	
	';

}else{
	echo "No video_id provided";
}


	
echo $OUTPUT->footer();

// load video meta data into page
$jsondata = json_encode($arr);

// load vi2 code from file
$file=file_get_contents("js/vi-two.js");
$vi2 = <<<EOS
<script type="text/javascript">
require(['jquery'], function($) {
	var jQuery = $; 
	const video_data = $jsondata
	;
	video_data.video = '/videos/'+video_data.video.replace('.mp4','.webm');
	// $(document).ready(function () { 
	$file
	//});
});

</script>
EOS;
echo $vi2;

?>
