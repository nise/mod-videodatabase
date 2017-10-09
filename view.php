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
require_capability('mod/videodatabase:view', $context);

// Trigger module viewed event.
/* xxx 
$event = \mod_videodatabase\event\course_module_viewed::create(array(
   'objectid' => $videodatabase->id,
   'context' => $context,
   'other' => array('content' => 'videodatabaseresourceview')
));
$event->add_record_snapshot('course_modules', $cm);
$event->add_record_snapshot('course', $course);
$event->add_record_snapshot('videodatabase', $videodatabase);
$event->trigger();

*/

// Update 'viewed' state if required by completion system
require_once($CFG->libdir . '/completionlib.php');
$completion = new completion_info($course);
$completion->set_module_viewed($cm);


/*********/
$PAGE->set_url('/mod/videodatabase/view.php', array('id' => $cm->id));

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
$PAGE->requires->css( '/mod/videodatabase/css/bootstrap.min.css');


echo $OUTPUT->header();
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

//
//
if(isset($_GET["dummy"]) && $_GET["dummy"] == 'true'){
	bulkVideoImport($PAGE);
} 

$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/amd/src/videodatabase.js'), true);

echo '
<div class="container"><br><br>
	<div id="alert" hidden class="alert alert-success" role="alert">
		<strong>Well done!</strong> You successfully important the dummy dataset.
	</div>
	<div class="row-fluid">
		<div class="col-xs-12 col-md-3 coll text-center">
			<div class="thumbnail">
				<a href="vdb_video-manager.php?id='. $id .'">
					<span class="fa fa-video-camera mega" aria-hidden="true"></span>
				</a>	
				<h4>
					<a href="vdb_video-manager.php?id='. $id .'">Videos</a>
				</h4>
			</div>
		</div>
		<div class="col-xs-12 col-md-3 text-center">
			<div class="thumbnail">
				<a href="vdb_comments.php?id='. $id .'">
					<span class="fa fa-comments mega"></span>
				</a>	
				<h4>
					<a href="vdb_comments.php?id='. $id .'">Kommentare</a>
				</h4>
			</div>
		</div>
		<div class="col-xs-12 col-md-3 text-center">
			<div class="thumbnail">
				<a href="vdb_admin.php?id='. $id .'">
					<span class="fa fa-cog mega"></span>
				</a>	
				<h4>
					<a href="vdb_admin.php?id='. $id .'">Datenverwaltung</a>
				</h4>
			</div>
		</div>
	</div>
	
</div>
<a href="/moodle/mod/videodatabase/view.php?id='. $id .'&dummy=true">import dummy data</a>
</div>
';


//echo $OUTPUT->box($content, "generalbox center clearfix");

/*********************************/
$strlastmodified = get_string("lastmodified");
//echo "<div class=\"modified\">$strlastmodified: ".userdate($videodatabase->timemodified)."</div>";



echo $OUTPUT->footer();



/*
 * @name: 
 * Imports dataset with video metadate from csv-file and stores them in the database 
 * see: https://docs.moodle.org/dev/Data_manipulation_API#Example.28s.29
 **/
function bulkVideoImport($PAGE) {
	global $CFG, $DB;
	//$DB->set_debug(true);
	$table = "videodatabase_videos";
	$row = 1;
	$video_arr = array();
	if (($handle = fopen($CFG->dirroot.'/mod/videodatabase/data/testdata.csv', "r")) !== FALSE) {
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		  $num = count($data);
		 	$row++;
			$record = new stdClass();
			$record->id = (int)$row;
			//$record->video_db = $row;
			$record->title = (string)$data[2];
			$record->creator = $data[3];
			$record->subject = $data[4];
			$record->description = $data[5];
			$record->publisher = $data[6];
			$record->contributor = $data[7];
			//$record->date = (int)$data[8];
			$record->type = $data[9];
			$record->mimetype = $data[10];
			$record->format = $data[11];
			$record->source = $data[12];
			$record->language = $data[13];
			$record->relation = $data[14];
			$record->coverage = $data[15];
			$record->rights = $data[16];
			$record->filename = $data[17];
			$record->length = (int)$data[18];
			$record->size = (int)$data[19];
			$record->license = $data[20];
			$record->institution = $data[21];
			$record->tags = $data[22];
		//	$record->timemodified = (int)$data[23];
			$record->compentencies = $data[24];
			$record->movements = $data[25];
			$record->activities = $data[26]; 
			$record->actors = $data[27];
			$record->perspectives = $data[28];
			$record->location = $data[29];
			$record->klasse = (int)$data[30];
			$record->klassenstufe = $data[31]; 
			$record->sports = $data[32];
			// collect
			array_push($video_arr, $record);
		}
		fclose($handle);
	}
	// delete all records
	$DB->delete_records($table, array('subject'=>'sport'));
	// insert into database
	$DB->insert_records($table, $video_arr);
	$PAGE->requires->js_amd_inline(" 
		require(['jquery'], function (jQuery) { 
			jQuery('#alert').show();
		});
	"); 
}

/*********************************/



