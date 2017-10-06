<?php

/*
 *
 * call: http://localhost/moodle/mod/videodatabase/upload.php?id=4
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
require_capability('mod/videodatabase:upload', $context);

$PAGE->set_url('/mod/videodatabase/upload.php');

//$PAGE->set_url('/mod/videodatabase/upload.php', array('id' => $cm->id));

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


echo "hello";

//https://docs.moodle.org/dev/Using_the_File_API_in_Moodle_forms





$mform->addElement('filepicker', 'userfile', get_string('file'), null, array('maxbytes' => $maxbytes, 'accepted_types' => '*'));

//Obtain the chosen file To get the contents of the file:

$content = $mform->get_file_content('userfile');

//To get the name of the chosen file:

$name = $mform->get_new_filename('userfile');

//To save the chosen file to the server filesystem (such as to moodledata folder):

$success = $mform->save_file('userfile', $fullpath, $override);

//To store the chosen file in the Moodle files pool:

//$storedfile = $mform->save_stored_file('userfile', ...);

$mform->display();

echo $OUTPUT->footer();

?>
