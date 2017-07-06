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

	//
	echo '<h2>Video: ' . $out['title'] . '</h2>';
	echo "<a class='button' href='./vdb_upload.php?id=". $cm->id ."&video_id=". $_GET['video_id'] ."' class='button'>Video Metadaten bearbeiten</a><br/><br/>";

	// init player
	//echo '<video id="video1" width="320" height="240" controls><source src="/videos/'.$out['filename'].'" type="video/mp4"><source src="movie.webm" type="video/webm">Your browser does not support the video tag.</video>';
	echo ' <video id="my-video" class="video-js" controls preload="auto" height="500"
  poster="/poster.png" data-setup="{}">
    <source src="/videos/'.$out['filename'].'" type="video/mp4">
    <!--<source src="/videos/'.$out['filename'].'" type="video/webm">-->
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a web browser that
      <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
  </video>';
  
     $js = 
<<<EOS
	<script type="text/javascript">
		require(['jquery'], function($) { 
				$('#bam').text('snj');
		});
	</script>
EOS;

}else{
	echo "No video_id provided";
}

echo '<div id="page">
		<div class="main">   
			<div id="seq"></div>
			<div id="overlay"></div>
			<div id="split"></div>
			<div id="accordion-resizer" class="ui-widget-content"></div>
		</div>
		<div id="video-controls" class="video-controls">
			<div class="timelines vi2-btn">
				<div class="vi2-video-seeklink vi2-btn"></div>
				<div class="vi2-video-seek vi2-btn"></div>
				<div class="vi2-video-progress vi2-btn"></div>
			</div>
			<div class="control-bar">
				<div class="vi2-video-play-pause vi2-btn" title="Play/Pause"></div>
				<div class="vi2-video-timer"></div>
				<div class="vi2-volume-box">
					<div class="vi2-volume-slider"></div>
					<a class="vi2-volume-button vi2-btn" title="Mute/Unmute"></a>
				</div>
			</div>
		</div>
	</div> <!-- end page -->
	<!-- video annotations -->
	<div style="display:none; visibility:hidden;" id="vi2"></div>';
	
//

echo '<div id="bam">xxx</div>';

echo $OUTPUT->footer();
//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/vi-two-lib.min.js') );
//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/test2.js') ); 
//$PAGE->requires->js_call_amd('mod_videodatabase/test','test', array());
//$PAGE->requires->js_call_amd('mod_videodatabase/video-js','f');
//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/test2.js') ); 

//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/vi-two.js') );

//$PAGE->requires->js_call_amd('mod_videodatabase/videodatabase_player','init');
echo $js;

?>
