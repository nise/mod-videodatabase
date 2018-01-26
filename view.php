<?php
/**
 * Single page plugin site containing a video manager, video player, and form for metadata.
 *
 * @package    mod
 * @subpackage page
 * @copyright  2018 Niels Seidel, social-machinables.com
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
/*require_once($CFG->libdir . '/completionlib.php');
$completion = new completion_info($course);
$completion->set_module_viewed($cm);
*/

/* begin header*/
//$PAGE->set_url('/mod/videodatabase/vdb_video-manager.php', array('id' => $cm->id));
$PAGE->navbar->add('Video Manager');// , new moodle_url('vdb_video-manager.php'.'?id='.$cm->id));

//$options = empty($videodatabase->displayoptions) ? array() : unserialize($videodatabase->displayoptions);

if ($inpopup and $videodatabase->display == RESOURCELIB_DISPLAY_POPUP) {
    $PAGE->set_pagelayout('popup');
    $PAGE->set_title($course->shortname.': '.$videodatabase->name);
    $PAGE->set_heading($course->fullname);
} else {
    $PAGE->set_title($course->shortname.': '.$videodatabase->name);
    $PAGE->set_heading($course->shortname.': '.$videodatabase->name);//$course->fullname);
    $PAGE->set_activity_record($videodatabase);
}
// custome CSS
$PAGE->requires->css( '/mod/videodatabase/css/bootstrap.min.css');
$PAGE->requires->css( '/mod/videodatabase/styles.css', true );
//$PAGE->requires->css( '/mod/videodatabase/css/animate.css', true );
$PAGE->requires->css( '/mod/videodatabase/css/vfg.css', true );
//$PAGE->requires->css( '/mod/videodatabase/css/vue2Dropzone.css', true );
$PAGE->requires->css( '/mod/videodatabase/css/vi-two.css', true );
echo $OUTPUT->header();
/* end header */


//echo $OUTPUT->heading(format_string($videodatabase->name), 2);

echo format_string($course->summary);

// don't Know wether this will be needed
if (!empty($options['printintro'])) {
    if (trim(strip_tags($videodatabase->intro))) {
        echo $OUTPUT->box_start('mod_introbox', 'videodatabaseintro');
        echo format_module_intro('videodatabase', $videodatabase, $cm->id);
        echo $OUTPUT->box_end();
    }
}
/*
$content = file_rewrite_pluginfile_urls($videodatabase->content, 'pluginfile.php', $context->id, 'mod_videodatabase', 'content', $videodatabase->revision);
$formatoptions = new stdClass;
$formatoptions->noclean = true;
$formatoptions->overflowdiv = true;
$formatoptions->context = $context;
$content = format_text($content, $videodatabase->contentformat, $formatoptions);
*/








// video player
echo '
<div id="app-video-template" v-cloak >
	<div class="page-item VIDEO">
		<!-- Storage -->
			<div style="display:none; visibility:hidden;" id="vi2"></div>
			<!-- End Storage -->
		<!-- Player -->
		<div id="wrapper">
			<div id="pagex" style="overflow:hidden;">
				<a href="#/videos" class="right large"><span class="fa fa-close video-close"></span></a>
				<!-- Main -->
				<div :id="vi2_player_id" class="container-fluid">
					<h2>{{ video.title }}</h2>
					<div class="row">
						<div id="videowrapper" class="col-lg-9 col-md-9 col-sm-12 col-xs-12">
							<div :id="video_selector"></div>
							<div :id="video_overlay_selector"></div>
							<div id="split" class="col-md-9"></div>
							<div id="screen" class="col-md-9"></div>
						</div>
						<div id="accordion-resizer" class="col-lg-3 col-md-3 col-sm-3 hidden-xs">
							<div id="accordion" class="video-metadata">
								<ul class="nav nav-tabs" role="tablist">
									<li class="nav-item">
										<a class="nav-link active" data-toggle="tab" :href="\'#comments\'" role="tab">Kommentare</a>
									</li>
									<li class="nav-item">
										<a class="nav-link" data-toggle="tab" :href="\'#info\'" role="tab">Informationen</a>
									</li>
								</ul>
								<div class="tab-content">
									<div class="tab-pane active" :id="\'comments\'" role="tabpanel">Comments?</div>
									<div class="tab-pane" :id="\'info\'" role="tabpanel">
										<h4>Info</h4>
										<div>
											<label>Beschreibung:</label> 
											<span>{{ video.description }}</span>
										</div>
										<div>
											<label>Kompetenzen:</label>
											<span>{{ video.competencies}}</span>
										</div>
										<div>
											<label>Sportart:</label>
											<span>{{ video.sports }}</span>
										</div>
										<div>
											<label>Bewegungsfelder:</label>
											<span>{{ video.movements }}</span>
										</div>
										<div>
											<label>Aktivitäten:</label>
											<span>{{ video.activities }}</span>
										</div>
										<div>
											<label>Perspektiven:</label>
											<span>{{ video.perspectives }}</span>
										</div>
										<div>
											<label>Ort:</label>
											<span>{{ video.location }}</span>
										</div>
										<div>
											<label>Klasse:</label>
											<span>{{ video.courselevel }}</span>
										</div>
										<div>
											<label>Produzent:</label>
											<span>{{ video.contributor }}</span>
										</div>
										<div>
											<label>Herausgeber:</label></span>
											<span>{{ video.publisher }}
										</div>
									</div>
								</div>		
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
						<div :class="\'control-bar\'">
							<div class="vi2-video-play-pause vi2-btn" title="Play/Pause">
								<span class="fa fa-play"></span>
								<span class="fa fa-pause"></span>
							</div>
							<div class="vi2-volume-controls right"></div>
							<div class="vi2-video-timer right"></div>
						</div>
					</div>
				</div>
				<!-- Modal -->
				<div hidden class="modal" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
					<div class="modal-dialog" role="document">
						<div class="modal-content modal-form">
							<div class="modal-header">
								<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">x</span></button>
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
	</div>	
</div>
';




// filter
echo '<div id="debug" hidden class="alert alert-success" role="alert"></div>';



echo '
<div v-cloak id="form-upload-template">
	<div>
		<div class="col-md-12 col-sm-12  col-xs-12">
			<a href="#/videos" class="right large"><span class="fa fa-close"></span></a>	
			<h3>Bearbeiten</h3>
				
		</div>	
		<div class="col-md-6 col-sm-12 col-xs-12">
			<form 
				enctype="multipart/form-data" 
				novalidate 
				v-if="isInitial || isSaving"
				class="dropbox"
				>
				<input id="file" type="file" multiple :name="uploadFieldName" :disabled="isSaving" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length" accept="video/*" class="input-file" />
				<label class="file-label" for="file">
					<p v-if="isInitial">
					Drag your file(s) here to begin<br> or click to browse
					</p>
					<p v-if="isFailed">{{ error }}</p>
					<p v-if="isSaving">
						Uploading {{ fileCount }} files
						<div class="row">
							<div v-cloak v-for="file in uploadedFiles" class="col-md-4">{{ file.name }} ({{ Math.round( file.size / 1024 / 1024 ) }}MB)					
								<video width="100%" height="auto" controls>
									<source v-bind:src="file.location" :type="file.type" >
									<!--<source src="movie.ogg" type="video/ogg">-->
									Your browser does not support the video tag.
								</video>
							</div> 
						</div>
					</p>
				</label>
			</form>
			<!--SUCCESS-->
			<div v-if="isSuccess">
				<h2>Uploaded {{ uploadedFiles.length }} file(s) successfully.</h2>
				<p>
				<a href="javascript:void(0)" @click="reset()">Upload again</a>
				</p>
				<ul class="list-unstyled">
				<li v-for="item in uploadedFiles">
					<img :src="item.url" class="img-responsive img-thumbnail" :alt="item.originalName">
				</li>
				</ul>
			</div>
			<!--FAILED-->
			<div v-if="isFailed">
				<h2>Uploaded failed.</h2>
				<p>
				<a href="javascript:void(0)" @click="reset()">Try again</a>
				</p>
				<pre>{{ uploadError }}</pre>
			</div>
		</div>		
	</div>
  </div>

<div v-cloak id="form-upload"></div>
';


echo '
<div v-cloak id="form-submit-template">
	<div class="col-md-12">
		<button v-on:click="submitForm" class="btn btn-primary">Speichern</button>
		<a class="btn btn-link" href="#/videos">cancel</a>
	</div>
</div>
';


// video manager
echo '
<div id="app-videomanager" v-cloak>
	<div class="page-item row">
		<router-view></router-view>
	</div>	
	<div class="page-item">
		<div class="page-controls">
			<router-link v-if="isEditor" class="title" :to="{ path: \'/videos/new\'}">
				<span title="Video hinzufügen" class="fa fa-plus large right"></span>	
			</router-link>
			<span @click="setTableView()" title="" class="fa fa-th large right link"></span>
			<span @click="setListView()" title="" class="fa fa-list large right link"></span>
		</div>
		<h1>Videos</h1>
		<div>
			<div id="videomanager" class="video-manager">
					<div v-if="listView">
						<table class="video-table table-sm table-striped table-hover table-responsive">
							<thead>
								<tr>
									<th></th>
									<th>Titel</th>
									<th>Sportart</th>
									<th>Klassenstufe</th>
									<th>Fachbezogene Kompetenzen</th>
									<th>Bewegungsfelder</th>
									<th>Aktivitäten</th>
									<th>Akteure</th>
									<th>Pädagogische Perspektive</th>
									<th>Ort</th>
									<!-- description, tags, <th>Lerngruppe</th> -->
								</tr>
							</thead>
							<tbody>
								<tr v-for="video in videos">
									<td>
										<div v-if="isEditor">
											<router-link v-if="isEditor" class="" :to="{ path: \'/videos/\' + video.id + \'/edit\'}">
												<span class="fa fa-pencil"></span>
											</router-link>
										</div>
									</td>
									<td>
										<router-link class="title" :to="{ path: \'/videos/\' + video.id + \'/view\'}">
											{{ video.title }}
										</router-link>	
									</td>
									<td>{{ video.sports }}</td>
									<td>{{ video.courselevel }}</td>
									<td>{{ video.competencies }}</td>
									<td>{{ video.movements }}</td>
									<td>{{ video.activities }}</td>
									<td>{{ video.actors }}</td>
									<td>{{ video.perspectives }}</td>
									<td>{{ video.location }}</td>
								</tr>
							</tbody>	
						</table>
					</div>
					<div v-else class="container-fluid">
						<transition name="filter">
							<div v-if="show" id="filter1" class="col-xs-12 col-sm-5 col-md-2 filter-box"></div>
						</transition>
						<div class="link" @click="show = !show">
							<span v-if="show">
								<span class="fa fa-angle-double-left"></span> Filter verbergen</span>
							</span>
							<span v-else>
								Filter anzeigen <span class="fa fa-angle-double-right"></span>
							</span>
						</div>
						<div 
							v-for="video in videos" 
							v-bind:class="\'col-xs-12 col-sm-5 col-md-2 video-item \'+ videoItemClass(video.id)"
							>
							<router-link class="title" :to="{ path: \'/videos/\' + video.id + \'/view\'}">
								<img 
									v-on:mouseover="mouseOverCheck = video.id" 
									v-on:mouseout="mouseOverCheck = \'\'" 
									class="still-images" 
									v-bind:src="mouseOverCheck === video.id ? \'images/stills/still-\'+video.filename.replace(\'.mp4\',\'_comp.gif\') : \'images/stills/still-\'+video.filename.replace(\'.mp4\',\'_comp.jpg\') " />    
							</router-link>	
							<div class="meta">
								<router-link class="title" :to="{ path: \'/videos/\' + video.id + \'/view\'}">{{video.title}}</router-link>
								<div>
									<span v-for="star in video.id%5+1"> 
										<span class="fa fa-star"></span>
									</span>
									<router-link v-if="isEditor" class="title" :to="{ path: \'/videos/\' + video.id + \'/edit\'}">
										<span class="fa fa-pencil right"></span>
									</router-link>
								</div>
							</div>
						</div>
					</div>
			</div>
		</div>	
	</div>
	<div class="page-item" v-if="isEditor">
		<a href="/moodle/mod/videodatabase/view.php?id='. $id .'&dummy=true">import dummy data</a>
	</div>
</div>';


echo ""; // end fluid container




// load the main Javascript including vue.js and vi-two.js
$PAGE->requires->js_amd_inline("require(['jquery', 'jqueryui', 'mod_videodatabase/videodatabase']);");


/*
 * 
 **/
if(isset($_GET["dummy"]) && $_GET["dummy"] == 'true'){
	bulkVideoImport($PAGE);
}


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
	$timezone = date_default_timezone_get();
	date_default_timezone_set($timezone);

	$video_arr = array();
	if (($handle = fopen($CFG->dirroot.'/mod/videodatabase/data/testdata_20171213.csv', "r")) !== FALSE) {
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		  $num = count($data);
		 	$row++;
			$record = new stdClass();
			$record->id = (int)$row;
			//$record->video_db = $row;
			$record->courselevel = $data[0];  // multi
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
			$record->tags = $data[22];  // split

			
			//$date = date('m/d/Y h:i:s a', time());
			$record->timemodified = (int)$data[23];

			$record->competencies = $data[24]; // multi
			$record->movements = $data[25];
			$record->activities = $data[26]; // multi
			$record->actors = $data[27];
			$record->perspectives = $data[28]; // multi
			$record->location = $data[29];
			//echo $data[0];
			$record->sports = $data[31];
			// collect
			
			array_push($video_arr, $record);
		}
		fclose($handle);
	}else{
		echo 'not imported!!';
	}
	// delete all records
	$DB->delete_records($table);
	// insert into database
	$DB->insert_records($table, $video_arr);
}


function dummyComments(){
	
	global $CFG, $DB;
	$DB->set_debug(true);
	
	$annotations_arr = array();
	$r = new stdClass();
	$r->id =0;
	$r->video =1;
	$r->course =2;
	$r->type ='comment';
	//$r->created =;
	//$r->updated =;
	$r->author ='MAX';
	$r->start =20;
	$r->duration =0;
	//$r->posx =;
	//$r->posy =;
	//$r->width =;
	//$r->height =;
	$r->content ='hello world';
	
	array_push($annotations_arr, $r);
	
	$DB->insert_records('videodatabase_annotations', $annotations_arr);
}

//dummyComments();

/*********************************/



/*********************************/
echo $OUTPUT->footer();
/*********************************/


