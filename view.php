<?php

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Page module version information
 *
 * @package    mod
 * @subpackage page
 * @copyright  2009 Petr Skoda (http://skodak.org)
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


/*
 * @name: 
 * Imports dataset with video metadate from csv-file and stores them in the database 
 * see: https://docs.moodle.org/dev/Data_manipulation_API#Example.28s.29
 **/
function bulkVideoImport() {
	global $CFG, $DB;
	$DB->set_debug(true);
	$table = 'vi_db_videos';
	$row = 1;
	$video_arr = array();
	if (($handle = fopen($CFG->dirroot.'/mod/videodatabase/data/testdata.csv', "r")) !== FALSE) {
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		  $num = count($data);
		  echo "<p>imported $num fields in line $row: <br /></p>\n";
		  $row++;
			$record = array();//new stdClass();
			$record['id'] = (int)$row;
			//$record['video_db'] = $row;
			$record['title'] = $data[2];
			$record['creator'] = $data[3];
			$record['subject'] = $data[4];
			$record['description'] = $data[5];
			$record['publisher'] = $data[6];
			$record['contributor'] = $data[7];
			//$record['date'] = (int)$data[8];
			$record['type'] = $data[9];
			$record['mimetype'] = $data[10];
			$record['format'] = $data[11];
			$record['source'] = $data[12];
			$record['language'] = $data[13];
			$record['relation'] = $data[14];
			$record['coverage'] = $data[15];
			$record['rights'] = $data[16];
			$record['filename'] = $data[17];
			$record['length'] = (int)$data[18];
			$record['size'] = (int)$data[19];
			$record['license'] = $data[20];
			$record['institution'] = $data[21];
			$record['tags'] = $data[22];
		//	$record['timemodified'] = (int)$data[23];
			$record['compentencies'] = $data[24];
			$record['movements'] = $data[25];
			$record['activities'] = $data[26];
			$record['actors'] = $data[27];
			$record['perspectives'] = $data[28];
			$record['location'] = $data[29];
			$record['group'] = $data[30];
		/*	
			$record->id = (int)$row;
			//$record->video_db = $row;
			$record->title = $data[2];
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
			$record->group = $data[30];*/
			print_r($record);
			echo $DB->insert_record($table, (object) $record);
			//array_push($video_arr, $record);
		}
		fclose($handle);
	}
	// insert into database
//	$DB->insert_records($table, $video_arr);
	// test
//	return $DB->count_records($table); 
}



/**********/
// Upload page
//$PAGE->set_url('/mod/videodatabase/video-upload.php');



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

//$context = {  title: "Cheese sandwich",  }
//$context = json_encode(array("title" => "hello world"));
//echo parent::render_from_template("test", array("title" => "hello world"));

//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/jquery.min.js'), true);
//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/vi-db.js'));

$PAGE->requires->js_call_amd("mod_videodatabase/helloworld", "test");
//$PAGE->requires->css('/mod/videodatabase/css/style.css');

echo "<h4 class='hhh'>hello dude</h4>";
echo "<select class='js-example-basic-multiple' multiple='multiple'>
  <option value='AL'>Alabama</option>
  <option value='BL'>Blabama</option>
  <option value='WY'>Wyoming</option>
</select>";

echo bulkVideoImport();

   $js = 
<<<EOS
<script type="text/javascript">
		
</script>
EOS;
echo $js;

echo $OUTPUT->box($content, "generalbox center clearfix");

$strlastmodified = get_string("lastmodified");
echo "<div class=\"modified\">$strlastmodified: ".userdate($videodatabase->timemodified)."</div>";

echo $OUTPUT->footer();




