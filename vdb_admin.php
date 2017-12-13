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
$PAGE->set_url('/mod/videodatabase/vdb_admen.php', array('id' => $cm->id));
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

/***************************/

//$context = {  title: "Cheese sandwich",  }
//$context = json_encode(array("title" => "hello world"));
//echo parent::render_from_template("test", array("title" => "hello world"));

//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/amd/src/videodatabase.js'), true);
//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/js/vi-db.js'));

//$PAGE->requires->js_call_amd('videodatabase','init');//, $functionname, $params);

// Link Nav
echo '<div class="navbar">';
echo '<a class="nav" href="vdb_admin_settings.php?id='. $id .'"><span class="fa fa-cog"></span> Einstellungen</a>	';
echo '</div>';

echo "
<a class='' role='button' data-toggle='collapse' href='#allfilter' aria-expanded='false' aria-controls='allfilter'>Filter anzeigen</a>
<div class='collapse' id='allfilter'>
	<div id='filter1'></div>
	<div id='filter2'></div>
</div><br>
";

$PAGE->requires->js_amd_inline(" 
require(['mod_videodatabase/tableFilter'], function(f) {});
");


	$table = "videodatabase_videos";

	$res = $DB->get_records($table, $conditions=null, $sort='', $fields='*', $limitfrom=0, $limitnum=0);

	echo '<div id="videotable" class="table-responsive">
			<table id="the_videotable" class="table display" cellspacing="0" width="100%">
			<thead>
		  <tr>
		    <th>Titel</th>
		    <th>Sportart</th>
		    <th>Stufe</th>
		    <th>Fachbezogene Kompetenzen</th>
		    <th>Bewegungsfelder</th>
		  	<th>Aktivitäten</th>
		  	<th>Akteure</th>
		  	<th>Pädagogische Perspektive</th>
		  	<th>Ort</th>
		  	<th>Lerngruppe</th>
		  </tr>
		</thead>
		<tbody>';
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
print_r($video);
	$competencies = '';
	echo "<tr class='
		actors-" . preg_replace("/\//", "", $video->actors ) . " 
		compentencies-" . preg_replace("/\ /", "", $video->compentencies ) . "
		movements-" . preg_replace("/,\s/", "", $video->movements ) . " 
		sports-" . preg_replace("/,\s/", "", $video->sports ) . " 
		location-" . $video->location . " 
		". $activities . "
		". $competencies . "  
		data-target='#demo".$row."'>";
	echo '	<td>
				<a href="vdb_player.php?id=' . $id .'&video_id=' . $video->id . '"><i class="fa fa-play" title="Video abspielen"></i> ' . $video->title .'</a> <br>
				<a href="vdb_form.php?id=' . $id .'&video_id=' . $video->id . '">
				<i class="fa fa-pencil" title="Metadaten bearbeiten"></i>
				</a>
			</td>';
	echo "<td>$video->sports</td>";
	echo "<td>$video->courselevel</td>";
	echo "<td>$video->compentencies</td>";
	echo "<td>$video->movements</td>";

	echo "<td>$video->activities</td>";
	echo "<td>$video->actors</td>";
	echo "<td>$video->perspectives</td>";
	echo "<td>$video->location</td>";
	echo "</tr>";

	/*  echo "<tr>";
	echo "<td colspan='8' class='hiddenRow'>";
	echo "<div class='accordian-body collapse' id='demo".$row."'>demo".$row."</div>";
	echo "</tr>";          */
	/*
	echo "<td>$video->creator</td>";
	echo "<td>$video->subject</td>";
	echo "<td>$video->description</td>";
	echo "<td>$video->tags</td>";
	echo "<td>$video->publisher</td>";
	echo "<td>$video->institution</td>";
	echo "<td>$video->contributer</td>";
	echo "<td>$video->date</td>";
	echo "<td>$video->type</td>";
	echo "<td>$video->mimetype</td>";
	echo "<td>$video->format</td>";
	echo "<td>$video->creator</td>";
	echo "<td>$video->source</td>";
	echo "<td>$video->language</td>";
	echo "<td>$video->relation</td>";
	echo "<td>$video->coverage</td>";
	echo "<td>$video->rights</td>";
	echo "<td>$video->license</td>";
	echo "<td>$video->filename</td>";
	echo "<td>$video->length</td>";
	echo "<td>$video->size</td>";
	echo "<td>$video->timemodified</td>";
	echo "<td>$video->creator</td>";
	*/

	}    
	echo '</tbody>
	</table></div>';



//$data = $DB->get_records_list($table, 'title', array( 'video2'));

//$data = json_encode($data);
//$data = json_decode($data, true);
//secho print_r($data);


//$PAGE->requires->js( new moodle_url($CFG->wwwroot . '/mod/videodatabase/amd/jquery.select2.js') );
//$string = file_get_contents($CFG->wwwroot . '/mod/videodatabase/data/category-schema-de.json');

//$json = array($data); // $json['data']
//$PAGE->requires->js_call_amd('mod_videodatabase/videodatabase','init', 'table');

//echo $OUTPUT->box($content, "generalbox center clearfix");

/*********************************/
//$strlastmodified = get_string("lastmodified");
//echo "<div class=\"modified\">$strlastmodified: ".userdate($videodatabase->timemodified)."</div>";

echo $OUTPUT->footer();

/*********************************/



