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
require_capability('mod/videodatabase:upload', $context);

$PAGE->set_url('/mod/videodatabase/vdb_upload.php');

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
// custome CSS
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


//https://docs.moodle.org/dev/Using_the_File_API_in_Moodle_forms

/*
 **/
require_once("$CFG->libdir/formslib.php");
class simplehtml_form extends moodleform {
    //Add elements to form
    public function definition() {
        global $CFG;
        $mform = $this->_form; // Don't forget the underscore!         
        $mform->addElement('text', 'title', "Titel");
        $mform->setType('title', PARAM_TEXT);
        $mform->addElement('text', 'subject', "Themenbereich");
        $mform->setType('subject', PARAM_TEXT);
        $mform->addElement('textarea', 'description', "Beschreibung", 'wrap="virtual" rows="5" cols="50"');
        $mform->addElement('text', 'tags', "Schlüsselwörter");
        $mform->setType('tags', PARAM_TEXT);
        $mform->addElement('text', 'coverage', "Umfang");
        $mform->setType('coverage', PARAM_TEXT);
        $mform->addElement('text', 'language', "Sprache");
        $mform->setType('language', PARAM_TEXT);
        //
        $maxbytes = 1000;
        $mform->addElement('filepicker', 'filename', get_string('file'), null, array('maxbytes' => $maxbytes, 'accepted_types' => array('mp4', 'webm', 'ogv')));
        //
        $mform->addElement('text', 'source', "Quelle/Herkunft");
        $mform->setType('source', PARAM_TEXT);
        $mform->addElement('text', 'publisher', "Herausgeber");
        $mform->setType('publisher', PARAM_TEXT);
        $mform->addElement('text', 'contributor', "Mitwirkende");
        $mform->setType('contributor', PARAM_TEXT);
        $mform->addElement('text', 'institution', "Institution");
        $mform->setType('institution', PARAM_TEXT);
        $mform->addElement('text', 'rights', "Rechteinhaber");
        $mform->setType('rights', PARAM_TEXT);
        $mform->addElement('text', 'license', "Lizenz");
        $mform->setType('license', PARAM_TEXT);
        $mform->addElement('text', 'relation', "Relation");
        $mform->setType('relation', PARAM_TEXT);
        //date
        //type
        //mimetype
        //format
        //filename
        //length
        //size
        //timemodified
				$compentencies=array();
				$compentencies[] = $mform->createElement('radio', 'compentencies', '', 'Bewegen und Handeln', 1, $attributes);
				$compentencies[] = $mform->createElement('radio', 'compentencies', '', 'Reflektieren und Urteilen', 0, $attributes);
				$compentencies[] = $mform->createElement('radio', 'compentencies', '', 'Interagieren', 0, $attributes);
				$compentencies[] = $mform->createElement('radio', 'compentencies', '', 'Methoden anwenden', 0, $attributes);
				$mform->addGroup($compentencies, 'compentencies', 'Fachbezogene Kompetenzen', array(' '), false);
      
        $movement=array();
				$movement[] = $mform->createElement('radio', 'movement', '', 'Laufen, Springen, Werfen, Stoßen', 1, $attributes);
				$movement[] = $mform->createElement('radio', 'movement', '', 'Spiele', 0, $attributes);
				$movement[] = $mform->createElement('radio', 'movement', '', 'Bewegung an Geräten', 0, $attributes);
				$movement[] = $mform->createElement('radio', 'movement', '', 'Kämpfen nach Regeln', 0, $attributes);
				$movement[] = $mform->createElement('radio', 'movement', '', 'Bewegungsfolgen gestalten und darstellen', 0, $attributes);
				$movement[] = $mform->createElement('radio', 'movement', '', 'Bewegen im Wasser', 0, $attributes);
				$movement[] = $mform->createElement('radio', 'movement', '', 'Fahren, Rollen, Gleiten', 0, $attributes);
				$mform->addGroup($movement, 'movement', 'Bewegungsfelder', array(' '), false);
      
        $actors=array();
				$actors[] = $mform->createElement('radio', 'actors', '', 'Lehrer/in', 1, $attributes);
				$actors[] = $mform->createElement('radio', 'actors', '', 'Schüler/in', 0, $attributes);
				$mform->addGroup($actors, 'radioar', 'Akteure', array(' '), false);
      
      	$location=array();
				$location[] = $mform->createElement('radio', 'location', '', 'Sporthalle', 1, $attributes);
				$location[] = $mform->createElement('radio', 'location', '', 'Schwimmhalle', 0, $attributes);
				$location[] = $mform->createElement('radio', 'location', '', 'Outdoor', 0, $attributes);
				$mform->addGroup($location, 'location', 'Ort', array(' '), false);
   
        $activities=array();
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Abbauen', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Aufbauen', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Begründen', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Beraten', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Beschreiben', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Besprechen', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Beurteilen', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Demonstrieren', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Disziplinieren', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Erklären', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Feedback, Korrektur', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Gesprächsrunde', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Gruppenbildung', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Helfen', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Kooperieren', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Medieneinsatz', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Motivieren', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Organisieren', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Präsentieren', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Sichern', 1, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Störung', 0, $attributes);
				$activities[] = $mform->createElement('checkbox', 'activities', '', 'Üben', 1, $attributes);
				$mform->addGroup($activities, 'activities', 'Aktivitäten', array(' '), false);
        
        $perspectives=array();
				$perspectives[] = $mform->createElement('checkbox', 'perspectives', '', 'Leistung', 0, $attributes);
				$perspectives[] = $mform->createElement('checkbox', 'perspectives', '', 'Wagnis', 1, $attributes);
				$perspectives[] = $mform->createElement('checkbox', 'perspectives', '', 'Gestaltung', 0, $attributes);
				$perspectives[] = $mform->createElement('checkbox', 'perspectives', '', 'Körpererfahrung', 1, $attributes);
				$perspectives[] = $mform->createElement('checkbox', 'perspectives', '', 'Kooperation', 0, $attributes);
				$perspectives[] = $mform->createElement('checkbox', 'perspectives
				', '', 'Gesundheit', 1, $attributes);
				$mform->addGroup($perspectives, 'group', 'Pädagogische Perspektiven', array(' '), false);
        
 				$group=array();
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 1', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 2', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 3', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 4', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 5', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 6', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 7', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 8', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 9', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 10', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 11', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 12', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Klassenstufe 13', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Eingangsstufe', 0, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Unterstufe', 1, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Mittelstufe', 0, $attributes);
				$group[] = $mform->createElement('checkbox', 'group', '', 'Werkstufe', 1, $attributes);
				$mform->addGroup($group, 'group', 'Lerngruppe', array(' '), false);
        
        
        $mform->addElement('submit', 'newcategory', 'speichern');
        
        // Cancel button.
        $mform->addElement('cancel','abbrechen','abbrechen');
        $mform->closeHeaderBefore('submit');
   
    }
    //Custom validation should be added here
    function validation($data, $files) {
       return array();
       /*
       $errors = parent::validation($fromform, $files);

        if (!empty($fromform['newcategory']) && trim($fromform['name']) == '') {
            $errors['name'] = get_string('categorynamecantbeblank', 'question');
        }

        return $errors;
       */ 
    }
}


//Instantiate simplehtml_form 
$mform = new simplehtml_form();
 
//Form processing and displaying is done here
if ($mform->is_cancelled()) {
    //Handle form cancel operation, if cancel button is present on form
} else if ($fromform = $mform->get_data()) {
  //In this case you process validated data. $mform->get_data() returns data posted in form.
  			//$content = $mform->get_file_content('userfile');
				//To get the name of the chosen file:
				//$name = $mform->get_new_filename('userfile');
				//To save the chosen file to the server filesystem (such as to moodledata folder):
				//$success = $mform->save_file('userfile', $fullpath, $override);
				//To store the chosen file in the Moodle files pool:
				//$storedfile = $mform->save_stored_file('userfile', ...);
} else {
  // this branch is executed if the form is submitted but the data doesn't validate and the form should be redisplayed
  // or on the first display of the form.

	// edit existing video
	if(isset($_GET['video_id']) && isset($_GET['id']) ){
		// get video data
		$table = "videodatabase_videos";
		$res = $DB->get_records($table,array('id'=>$_GET['video_id']));
		//print_r($res[27]);
		$out = (array)$res[$_GET['video_id']];//[2]
	 	echo "<h2>Video ".$out['title']." bearbeiten</h2>";
	 	echo "<a href='vdb_player.php?id=".$_GET['id']."&video_id=" . $out['id'] . "'>Video abspielen</a>";
		//$res = $DB->get_records($table, $conditions=null, $sort='', $fields='*', $limitfrom=0, $limitnum=0);
		//print_r($res);
		// (object)(array)$res;
		//$formdata = (object)array('title' => $out['title'], 'subject' => $out['subject']);
		$mform->set_data((object)$out);
	}else{
		// empty form for adding a new video
		echo "<h2>Neues Video anlegen</h2>";
	}  
  $mform->display();
}


/*


$mform->display();
*/

echo $OUTPUT->footer();

?>
