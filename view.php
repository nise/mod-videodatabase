<?php
/**
 * Single page plugin site containing a video manager, video player, and form for metadata.
 *
 * @package    mod
 * @subpackage page
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');
require_once($CFG->dirroot.'/mod/videodatabase/locallib.php');
require_once($CFG->libdir.'/completionlib.php');
require_once('lib.php');

$id      = optional_param('id', 0, PARAM_INT); // Course Module ID
$p       = optional_param('p', 0, PARAM_INT);  // videodatabase instance ID
$inpopup = optional_param('inpopup', 0, PARAM_BOOL);

/* // other settings    
$mode        = optional_param('mode', 0, PARAM_INT);     // Display mode (for single forum)
    $showall     = optional_param('showall', '', PARAM_INT); // show all discussions on one page
    $changegroup = optional_param('group', -1, PARAM_INT);   // choose the current group
    $page        = optional_param('page', 0, PARAM_INT);     // which page to show
    $search      = optional_param('search', '', PARAM_CLEAN);// search string
*/

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

// Update 'viewed' state if required by completion system
/*require_once($CFG->libdir . '/completionlib.php');
$completion = new completion_info($course);
$completion->set_module_viewed($cm);
*/

/* begin header*/
$PAGE->set_url('/mod/videodatabase/view.php', array('id' => $cm->id));
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

$context = context_module::instance($cm->id);
$PAGE->set_context($context);
	
// custome CSS
$PAGE->requires->css( '/mod/videodatabase/css/bootstrap.min.css');
$PAGE->requires->css( '/mod/videodatabase/styles.css', true );
//$PAGE->requires->css( '/mod/videodatabase/css/animate.css', true );
$PAGE->requires->css( '/mod/videodatabase/css/vfg.css', true );
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


echo "<span hidden id='courseid'>$cm->course</span>";
echo "<span hidden id='moduleid'>$cm->id</span>";
echo "<span hidden id='token'>$videodatabase->token</span>";
echo "<div id='alert'></div>";



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
									<div class="tab-pane active" :id="\'comments\'" role="tabpanel">
										
									</div>
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
							<div id="annotation-form">
								<div id="annotationForm" v-show="showAnnotationForm">
									<textarea v-model="annotationContent" name="comments-entry" data-datatype="string" placeholder="" aria-describedby="comments-form1"></textarea>
									<br/>
									<div class="input-group">
										<span class="input-group-addon" id="comments-form1">Zeitpunkt (s)</span>
										<input v-model="annotationTime" type="text" class="form-control" value="" name="comments-entry-time" data-datatype="decimal-time" placeholder="" aria-describedby="comments-form1">
									</div>
									<div class="btn btn-primary" v-on:click="saveAnnotation">speichern</div>
								</div>
								<div class="btn btn-primary" v-on:click="toggle"><span class="fa fa-plus"></span> Kommentar</div>
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
							<rating class="right" ref="childRating" v-bind:value="video.rating" :length="5"></rating>
						</div>
					</div>
				</div>
				
				<!-- Modal 
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
				</div>-->
			</div>
		</div>
	</div>	
</div>
';

//echo '<button id="show-modal" class="btn btn-primary" @click="showModal = true">Kommentar hinzufügen</button>';
//echo '<modal v-if="showModal" @close="showModal = false">';
echo '<script type="text/x-template" id="modal-template"><!-- Modal -->
		<transition name="modal">
			<div class="modal-mask">
			<div class="modal-wrapper">
				<div class="modal-container">

				<div class="modal-header">
					<slot name="header">
					default header
					</slot>
				</div>

				<div class="modal-body">
					<slot name="body">
					default body
					</slot>
				</div>

				<div class="modal-footer">
					<slot name="footer">
					default footer
					<button class="modal-default-button" @click="$emit(\'close\')">
						OK
					</button>
					</slot>
				</div>
				</div>
			</div>
			</div>
		</transition>
	</script>';

// filter
echo '<div id="debug" hidden class="alert alert-success" role="alert"></div>';



echo '
<div v-cloak id="form-upload-template">
	<div>
		<div class="col-md-12 col-sm-12  col-xs-12">
			<a href="#/videos" class="right large"><span class="fa fa-close"></span></a>	
			<h3>Video bearbeiten</h3>
		</div>
		<div class="row">	
			<div class="col-md-3 col-sm-12 col-xs-12">
				<!--INITIAL-->
				<form 
					enctype="multipart/form-data" 
					novalidate 
					v-if="isInitial || isSaving"
					class="dropbox"
					>
					<label class="file-label">
						<div class="">Videodatei auswählen</div>
						<input id="file" type="file" multiple :name="uploadFieldName"  @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length" accept="video/*" class="input-file" />
					</label>
				</form>
				<!--SUCCESS-->
				<div v-if="isSuccess" style="margin:0 20px;">
					<div v-cloak v-for="file in uploadedFiles">
						Für Upload ausgewählt:<br> {{ file.name }} ({{ Math.round( file.size / 1024 / 1024 ) }}MB)					
						<video width="100%" height="auto" controls preload="none">
							<source v-if="file.location" @change="file.location" :src="file.tmp_rel_location" :type="file.type" >
							Your browser does not support the video tag.
						</video>
					</div>
				</div>	
				<!--FAILED-->
				<div v-if="isFailed" class="dropbox">
					<label class="file-label">
						<b>Upload fehlgeschlagen.</b>
						<div hidden class="">Videodatei auswählen</div>
						<input hidden id="file" type="file" multiple :name="uploadFieldName"  @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length" accept="video/*" class="input-file" />
						<p style="font-weight:normal;">{{ error }}</p>
						<a href="javascript:void(0)" @click="reset()">Eine andere Datei hochladen.</a>
					</label>
				</div>
			</div>	
			<div class="col-md-3 col-sm-12 col-xs-12">
				<!--SUCCESS-->
				<div v-if="isSuccess">
					<ul hidden class="list-unstyled">
						<li v-for="item in uploadedFiles">
							<img :src="item.url" class="img-responsive img-thumbnail" :alt="item.originalName">
						</li>
					</ul>
					<span class="fa fa-check"></span> Upload von {{ uploadedFiles.length }} Datei(en)
					<div v-if="progthumbnail==100">
						<span class="fa fa-check"></span> Videovorschaubild erzeugt
					</div>
					<div v-if="proganimation==100">
						<span class="fa fa-check"></span> Videovorschauanimation erzeugt
					</div>
					<div v-if="progpreview<100" class="progress">
						<div class="progress">
							<div class="progress-bar my-progress" role="progressbar" :style="\'width:\'+progpreview+\'%;\'" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">Vorschaubilder generieren: {{ progpreview }}</div>
						</div>						
					</div>
					<div v-if="progpreview==100">
						<span class="fa fa-check"></span> Szenenvorschaubilder erzeugt
					</div>
					<div v-if="progtranscode<100" class="progress">
						<div class="progress">
							<div class="progress-bar my-progress" role="progressbar" :style="\'width:\'+progtranscode+\'%;\'" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">Video konvertieren: {{ progtranscode }}</div>
						</div>
					</div>
					<div v-if="progtranscode==100">
						<span class="fa fa-check"></span> Video konvertiert
					</div>
					<br>
					<p>
						<a class="red" href="javascript:void(0)" @click="reset()">Upload verwerfen</a>
					</p>
				</div>
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
		<a class="btn btn-link" href="#/videos">abbrechen</a>
		<a v-on:click="removeVideo" class="btn btn-link right red">Video löschen</a>
	</div>
</div>
';


// rating
echo '
<div id="rating" v-cloak>
  <div class="Rate" v-if="length > 0">
    <svg style="position: absolute; width: 0; height: 0;" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <symbol id="icon-star-empty" viewBox="0 0 32 32">
          <title>star-empty</title>
          <path d="M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8 7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798zM16 23.547l-6.983 3.671 1.334-7.776-5.65-5.507 7.808-1.134 3.492-7.075 3.492 7.075 7.807 1.134-5.65 5.507 1.334 7.776-6.983-3.671z"></path>
        </symbol>

        <symbol id="icon-star-full" viewBox="0 0 32 32">
          <title>star-full</title>
          <path d="M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8 7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798z"></path>
        </symbol>
      </defs>
    </svg>
    <input type="hidden" :name="name" v-model="rate" :required="required">
    <template v-for="n in length">
	  <button 
			@mouseenter="hover = n" 
			@mouseout="hover = rate" 
			type="button" :key="n" 
			:class="{\'Rate__star\': true, \'hover\': n <= hover, \'filled\': n <= rate}"  
			@click="setRate(n)" 
			@keyup="hover = n" 
			@keyup.enter="setRate(n)" 
			:disabled="disabled"
			>
        <svg class="icon" v-show="isFilled(n)">
          <use xlink:href="#icon-star-full"></use>
        </svg>
        <svg class="icon" v-show="isEmpty(n)">
          <use xlink:href="#icon-star-empty"></use>
        </svg>
      </button>
    </template>
    <div class="Rate__view" :class="{disabled: disabled}">
      <span class="count" v-if="showcount">{{ ov }} {{ rate }} {{ value }}</span>
      <span class="desc" v-if="ratedesc.length > 0">{{ratedesc[over - 1]}}</span>
    </div>
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
			<span title="Logdaten des Kurses herunterladen" v-if="isEditor" @click="downloadLogData()" title="" class="fa fa-download large right link"></span>
			<router-link v-if="isEditor" class="title" :to="{ path: \'/videos/new\'}">
				<span title="Video hinzufügen" class="fa fa-plus large right"></span>	
			</router-link>
			<span @click="setTableView()" title="Tabellenansicht" class="fa fa-th large right link"></span>
			<span @click="setListView()" title="Kachelansicht" class="fa fa-list large right link"></span>
		</div>
		<h1>Videos</h1>
		<div class="search-wrapper">
    		<input type="text" v-model="search" placeholder="Suche"/>
        </div>
		

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
								<tr v-for="video in filteredList">
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
							v-for="video in filteredList" 
							v-bind:class="\' col-xs-12 col-sm-5 col-md-2 video-item \'+ videoItemClass(video.id)"
							>
							<router-link class="title" :to="{ path: \'/videos/\' + video.id + \'/view\'}">
								<img
									:id="\'video-img-\'+video.id" 
									v-on:mouseover="mouseOverCheck = video.id" 
									v-on:mouseout="mouseOverCheck = \'\'" 
									class="still-images"
									@error="imageLoadError(video.id)" 
									v-bind:src="mouseOverCheck === video.id ? \'images/stills/still-\'+video.filename.replace(\'.mp4\',\'_comp.gif\') : \'images/stills/still-\'+video.filename.replace(\'.mp4\',\'_comp.jpg\') " />    
							</router-link>	
							<div class="meta">
								<router-link class="title" :to="{ path: \'/videos/\' + video.id + \'/view\'}">{{video.title}}</router-link>
								<div>
									<span v-for="star in videoRatings[video.id]"> 
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
	bulkVideoImport($PAGE, $cm->course);
}


/*
 * @name: 
 * Imports dataset with video metadate from csv-file and stores them in the database 
 * see: https://docs.moodle.org/dev/Data_manipulation_API#Example.28s.29
 **/
function bulkVideoImport($PAGE, $courseid) {
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
			$record->courseid = $courseid; 
			$record->status = 1;
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
	$r->course = $cm->course;
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
die();
/*********************************/


