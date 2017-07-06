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
require_capability('mod/videodatabase:vdb_video-manager', $context);


// Update 'viewed' state if required by completion system
require_once($CFG->libdir . '/completionlib.php');
$completion = new completion_info($course);
$completion->set_module_viewed($cm);




/*********/
$PAGE->set_url('/mod/videodatabase/vdb_video-manager.php', array('id' => $cm->id));

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
// custome CSS
$PAGE->requires->css( '/mod/videodatabase/styles.css', true );
$PAGE->requires->css( '/mod/videodatabase/css/bootstrap.min.css');
//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/jquery.js'), true );

echo $OUTPUT->header();


/****************************************/
echo $OUTPUT->heading(format_string($videodatabase->name), 2);

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

echo "<div class='container'>";
echo "<label>Filter:</label>";
echo "<div id='filter1'></div>";
echo '<a class="btn btn-primary" role="button" data-toggle="collapse" href="#filter2" aria-expanded="false" aria-controls="filter2">Erweiterte Filter</a>';
echo "<div class='collapse' id='filter2'></div><br><br><br>";


// fetch data
$table = "videodatabase_videos";
$res = $DB->get_records($table, $conditions=null, $sort='', $fields='*', $limitfrom=0, $limitnum=0);


echo '<div id="the_videotable" class="video-manager row">';
   
$row = 0;
foreach($res as $video){ 
	$row++;
	// prep
	$activities = '';
	$act = preg_replace("/\ /", "", $video->activities);
	$arr = explode(',',$act);
	for($i=0; $i < sizeof($arr); $i++){
		$activities .= 'activities-'.$arr[$i].' ';
	}
	
	$competencies = '';
	echo "<div class='col-xs-6 col-md-2 video-item 
		actors-" . preg_replace("/\//", "", $video->actors ) . " 
		compentencies-" . preg_replace("/\ /", "", $video->compentencies ) . "
		movements-" . preg_replace("/,\s/", "", $video->movements ) . " 
		sports-" . preg_replace("/,\s/", "", $video->sports ) . " 
		location-" . $video->location . " 
		". $activities . "
		". $competencies ."'>";
	
	echo "
		<img style='width:100%;' src='/poster.png' />
		<div class='meta'>
			<a class='title' href='vdb_player.php?id=" . $id ."&video_id=" . $video->id ."'>".$video->title."</a>
			<div hidden >". substr($video->description, 0, 40)."</div>
			<div>".$video->group."</div>
			<div class=''>".$video->movements."</div>
			<div class=''>".$video->sports."</div>	
		</div>		
	</div>";
	
}    
echo '</div>';
echo "</div>";

//$data = $DB->get_records_list($table, 'title', array( 'video2'));

//$data = json_encode($data);
//$data = json_decode($data, true);
//secho print_r($data);


//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/amd/jquery.select2.js') );
$string = file_get_contents($CFG->wwwroot . '/mod/videodatabase/data/category-schema-de.json');

$json = array($data); // $json['data']

$PAGE->requires->js_call_amd('mod_videodatabase/videodatabase','init', array('div'));

echo $OUTPUT->box($content, "generalbox center clearfix");

/*********************************/
//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/bootstrap.min.js') ); 
echo $OUTPUT->footer();


/*********************************/



