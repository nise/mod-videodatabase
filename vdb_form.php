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
$PAGE->set_url('/mod/videodatabase/form-edit.php', array('id' => $cm->id));
$PAGE->navbar->add('Datenverwaltung');

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




//include simplehtml_form.php
require_once($CFG->dirroot.'/mod/videodatabase/vdb_form_cls.php');
 
//Instantiate simplehtml_form 
$mform = new simplehtml_form();
 
//Form processing and displaying is done here
if ($mform->is_cancelled()) {
    //Handle form cancel operation, if cancel button is present on form
} else if ($fromform = $mform->get_data()) {
  //In this case you process validated data. $mform->get_data() returns data posted in form.
} else {
  // this branch is executed if the form is submitted but the data doesn't validate and the form should be redisplayed
  // or on the first display of the form.
  
  if(isset($_GET['video_id'])){
    $table = "videodatabase_videos";
    $res = $DB->get_records($table, array( 'id' => $_GET['video_id'] ), $sort='', $fields='*', $limitfrom=0, $limitnum=0);
    $out = (array)$res[$_GET['video_id']];//[2]
    print_r($out);
  }
    
  //Set default data (if any)
  $mform->set_data($out);
  //displays the form
  $mform->display();
}
?>