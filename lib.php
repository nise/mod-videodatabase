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
 * @package    mod
 * @subpackage videodatabase
 * @copyright  2009 Petr Skoda (http://skodak.org)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

/**
 * List of features supported in videodatabase module
 * @param string $feature FEATURE_xx constant for requested feature
 * @return mixed True if module supports feature, false if not, null if doesn't know
 */
function videodatabase_supports($feature) {
    switch($feature) {
        case FEATURE_MOD_ARCHETYPE:           return MOD_ARCHETYPE_RESOURCE;
        case FEATURE_GROUPS:                  return false;
        case FEATURE_GROUPINGS:               return false;
        case FEATURE_GROUPMEMBERSONLY:        return true;
        case FEATURE_MOD_INTRO:               return true;
        case FEATURE_COMPLETION_TRACKS_VIEWS: return true;
        case FEATURE_GRADE_HAS_GRADE:         return false;
        case FEATURE_GRADE_OUTCOMES:          return false;
        case FEATURE_BACKUP_MOODLE2:          return true;
        case FEATURE_SHOW_DESCRIPTION:        return true;

        default: return null;
    }
}

/**
 * Returns all other caps used in module
 * @return array
 */
function videodatabase_get_extra_capabilities() {
    return array('moodle/site:accessallgroups');
}

/**
 * This function is used by the reset_course_userdata function in moodlelib.
 * @param $data the data submitted from the reset course.
 * @return array status array
 */
function videodatabase_reset_userdata($data) {
    return array();
}

/**
 * List of view style log actions
 * @return array
 */
function videodatabase_get_view_actions() {
    return array('view','view all');
}

/**
 * List of update style log actions
 * @return array
 */
function videodatabase_get_post_actions() {
    return array('update', 'add');
}

/**
 * Add videodatabase instance.
 * @param stdClass $data
 * @param mod_videodatabase_mod_form $mform
 * @return int new videodatabase instance id
 */
function videodatabase_add_instance($data, $mform = null) {
    global $CFG, $DB;
    require_once("$CFG->libdir/resourcelib.php");

    $cmid = $data->coursemodule;
    $data->timemodified = time();
    
    if ($mform && isset($data->videodatabase)) {
        if(is_array($data->videodatabase)){
            $data->content       = $data->videodatabase['text'];
            $data->contentformat = $data->videodatabase['format'];
        }
    }else{
        $data->contentformat = 0;
    }
    
    $data->id = $DB->insert_record('videodatabase', $data);
    
    // we need to use context now, so we need to make sure all needed info is already in db
    $DB->set_field('course_modules', 'instance', $data->id, array('id'=>$cmid));
    $context = context_module::instance($cmid);

    return $data->id;
}

/**
 * Update videodatabase instance.
 * @param object $data
 * @param object $mform
 * @return bool true
 */
function videodatabase_update_instance($data, $mform) {
    global $CFG, $DB;
    require_once("$CFG->libdir/resourcelib.php");

    $cmid = $data->coursemodule;
    $data->timemodified = time();
    $data->id = $data->instance;
    $data->revision++;
    $DB->update_record('videodatabase', $data);

    return true;
}

/**
 * Delete videodatabase instance.
 * @param int $id
 * @return bool true
 */
function videodatabase_delete_instance($id) {
    global $DB;

    if (!$videodatabase = $DB->get_record('videodatabase', array('id'=>$id))) {
        return false;
    }

    // note: all context files are deleted automatically

    $DB->delete_records('videodatabase', array('id'=>$videodatabase->id));

    return true;
}

/**
 * Return use outline
 * @param object $course
 * @param object $user
 * @param object $mod
 * @param object $videodatabase
 * @return object|null
 */
function videodatabase_user_outline($course, $user, $mod, $videodatabase) {
    global $DB;

    if ($logs = $DB->get_records('log', array('userid'=>$user->id, 'module'=>'videodatabase',
                                              'action'=>'view', 'info'=>$videodatabase->id), 'time ASC')) {

        $numviews = count($logs);
        $lastlog = array_pop($logs);

        $result = new stdClass();
        $result->info = get_string('numviews', '', $numviews);
        $result->time = $lastlog->time;

        return $result;
    }
    return NULL;
}

/**
 * Return use complete
 * @param object $course
 * @param object $user
 * @param object $mod
 * @param object $videodatabase
 */
function videodatabase_user_complete($course, $user, $mod, $videodatabase) {
    global $CFG, $DB;

    if ($logs = $DB->get_records('log', array('userid'=>$user->id, 'module'=>'videodatabase',
                                              'action'=>'view', 'info'=>$videodatabase->id), 'time ASC')) {
        $numviews = count($logs);
        $lastlog = array_pop($logs);

        $strmostrecently = get_string('mostrecently');
        $strnumviews = get_string('numviews', '', $numviews);

        echo "$strnumviews - $strmostrecently ".userdate($lastlog->time);

    } else {
        print_string('neverseen', 'videodatabase');
    }
}

/**
 * Given a course_module object, this function returns any
 * "extra" information that may be needed when printing
 * this activity in a course listing.
 *
 * See {@link get_array_of_activities()} in course/lib.php
 *
 * @param stdClass $coursemodule
 * @return cached_cm_info Info to customise main videodatabase display
 */
function videodatabase_get_coursemodule_info($coursemodule) {
    global $CFG, $DB;
    require_once("$CFG->libdir/resourcelib.php");

    if (!$videodatabase = $DB->get_record('videodatabase', array('id'=>$coursemodule->instance),
            'id, name, display, displayoptions, intro, introformat')) {
        return NULL;
    }

    $info = new cached_cm_info();
    $info->name = $videodatabase->name;

    if ($coursemodule->showdescription) {
        // Convert intro to html. Do not filter cached version, filters run at display time.
        $info->content = format_module_intro('videodatabase', $videodatabase, $coursemodule->id, false);
    }

    if ($videodatabase->display != RESOURCELIB_DISPLAY_POPUP) {
        return $info;
    }

    $fullurl = "$CFG->wwwroot/mod/videodatabase/view.php?id=$coursemodule->id&amp;inpopup=1";
    $options = empty($videodatabase->displayoptions) ? array() : unserialize($videodatabase->displayoptions);
    $width  = empty($options['popupwidth'])  ? 620 : $options['popupwidth'];
    $height = empty($options['popupheight']) ? 450 : $options['popupheight'];
    $wh = "width=$width,height=$height,toolbar=no,location=no,menubar=no,copyhistory=no,status=no,directories=no,scrollbars=yes,resizable=yes";
    $info->onclick = "window.open('$fullurl', '', '$wh'); return false;";

    return $info;
}


/**
 * Lists all browsable file areas
 *
 * @package  mod_videodatabase
 * @category files
 * @param stdClass $course course object
 * @param stdClass $cm course module object
 * @param stdClass $context context object
 * @return array
 */
function videodatabase_get_file_areas($course, $cm, $context) {
    $areas = array();
    $areas['content'] = get_string('content', 'videodatabase');
    return $areas;
}

/**
 * File browsing support for videodatabase module content area.
 *
 * @package  mod_videodatabase
 * @category files
 * @param stdClass $browser file browser instance
 * @param stdClass $areas file areas
 * @param stdClass $course course object
 * @param stdClass $cm course module object
 * @param stdClass $context context object
 * @param string $filearea file area
 * @param int $itemid item ID
 * @param string $filepath file path
 * @param string $filename file name
 * @return file_info instance or null if not found
 */
function videodatabase_get_file_info($browser, $areas, $course, $cm, $context, $filearea, $itemid, $filepath, $filename) {
    global $CFG;

    if (!has_capability('moodle/course:managefiles', $context)) {
        // students can not peak here!
        return null;
    }

    $fs = get_file_storage();

    if ($filearea === 'content') {
        $filepath = is_null($filepath) ? '/' : $filepath;
        $filename = is_null($filename) ? '.' : $filename;

        $urlbase = $CFG->wwwroot.'/pluginfile.php';
        if (!$storedfile = $fs->get_file($context->id, 'mod_videodatabase', 'content', 0, $filepath, $filename)) {
            if ($filepath === '/' and $filename === '.') {
                $storedfile = new virtual_root_file($context->id, 'mod_videodatabase', 'content', 0);
            } else {
                // not found
                return null;
            }
        }
        require_once("$CFG->dirroot/mod/videodatabase/locallib.php");
        return new videodatabase_content_file_info($browser, $context, $storedfile, $urlbase, $areas[$filearea], true, true, true, false);
    }

    // note: videodatabase_intro handled in file_browser automatically

    return null;
}

/**
 * Serves the videodatabase files.
 *
 * @package  mod_videodatabase
 * @category files
 * @param stdClass $course course object
 * @param stdClass $cm course module object
 * @param stdClass $context context object
 * @param string $filearea file area
 * @param array $args extra arguments
 * @param bool $forcedownload whether or not force download
 * @param array $options additional options affecting the file serving
 * @return bool false if file not found, does not return if found - just send the file
 */
function videodatabase_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options=array()) {
    global $CFG, $DB;
    require_once("$CFG->libdir/resourcelib.php");

    if ($context->contextlevel != CONTEXT_MODULE) {
        return false;
    }

    require_course_login($course, true, $cm);
    if (!has_capability('mod/videodatabase:view', $context)) {
        return false;
    }

    if ($filearea !== 'content') {
        // intro is handled automatically in pluginfile.php
        return false;
    }

    // $arg could be revision number or index.html
    $arg = array_shift($args);
    if ($arg == 'index.html' || $arg == 'index.htm') {
        // serve videodatabase content
        $filename = $arg;

        if (!$videodatabase = $DB->get_record('videodatabase', array('id'=>$cm->instance), '*', MUST_EXIST)) {
            return false;
        }

        // remove @@PLUGINFILE@@/
        $content = str_replace('@@PLUGINFILE@@/', '', $videodatabase->content);

        $formatoptions = new stdClass;
        $formatoptions->noclean = true;
        $formatoptions->overflowdiv = true;
        $formatoptions->context = $context;
        $content = format_text($content, $videodatabase->contentformat, $formatoptions);

        send_file($content, $filename, 0, 0, true, true);
    } else {
        $fs = get_file_storage();
        $relativepath = implode('/', $args);
        $fullpath = "/$context->id/mod_videodatabase/$filearea/0/$relativepath";
        if (!$file = $fs->get_file_by_hash(sha1($fullpath)) or $file->is_directory()) {
            $videodatabase = $DB->get_record('videodatabase', array('id'=>$cm->instance), 'id, legacyfiles', MUST_EXIST);
            if ($videodatabase->legacyfiles != RESOURCELIB_LEGACYFILES_ACTIVE) {
                return false;
            }
            if (!$file = resourcelib_try_file_migration('/'.$relativepath, $cm->id, $cm->course, 'mod_videodatabase', 'content', 0)) {
                return false;
            }
            //file migrate - update flag
            $videodatabase->legacyfileslast = time();
            $DB->update_record('videodatabase', $videodatabase);
        }

        // finally send the file
        send_stored_file($file, null, 0, $forcedownload, $options);
    }
}

/**
 * Return a list of videodatabase types
 * @param string $videodatabasetype current videodatabase type
 * @param stdClass $parentcontext Block's parent context
 * @param stdClass $currentcontext Current context of block
 */
function videodatabase_videodatabase_type_list($videodatabasetype, $parentcontext, $currentcontext) {
    $module_videodatabasetype = array('mod-videodatabase-*'=>get_string('videodatabase-mod-videodatabase-x', 'videodatabase'));
    return $module_videodatabasetype;
}

/**
 * Export videodatabase resource contents
 *
 * @return array of file content
 */
function videodatabase_export_contents($cm, $baseurl) {
    global $CFG, $DB;
    $contents = array();
    $context = context_module::instance($cm->id);

    $videodatabase = $DB->get_record('videodatabase', array('id'=>$cm->instance), '*', MUST_EXIST);

    // videodatabase contents
    $fs = get_file_storage();
    $files = $fs->get_area_files($context->id, 'mod_videodatabase', 'content', 0, 'sortorder DESC, id ASC', false);
    foreach ($files as $fileinfo) {
        $file = array();
        $file['type']         = 'file';
        $file['filename']     = $fileinfo->get_filename();
        $file['filepath']     = $fileinfo->get_filepath();
        $file['filesize']     = $fileinfo->get_filesize();
        $file['fileurl']      = file_encode_url("$CFG->wwwroot/" . $baseurl, '/'.$context->id.'/mod_videodatabase/content/'.$videodatabase->revision.$fileinfo->get_filepath().$fileinfo->get_filename(), true);
        $file['timecreated']  = $fileinfo->get_timecreated();
        $file['timemodified'] = $fileinfo->get_timemodified();
        $file['sortorder']    = $fileinfo->get_sortorder();
        $file['userid']       = $fileinfo->get_userid();
        $file['author']       = $fileinfo->get_author();
        $file['license']      = $fileinfo->get_license();
        $contents[] = $file;
    }

    // videodatabase html conent
    $filename = 'index.html';
    $videodatabasefile = array();
    $videodatabasefile['type']         = 'file';
    $videodatabasefile['filename']     = $filename;
    $videodatabasefile['filepath']     = '/';
    $videodatabasefile['filesize']     = 0;
    $videodatabasefile['fileurl']      = file_encode_url("$CFG->wwwroot/" . $baseurl, '/'.$context->id.'/mod_videodatabase/content/' . $filename, true);
    $videodatabasefile['timecreated']  = null;
    $videodatabasefile['timemodified'] = $videodatabase->timemodified;
    // make this file as main file
    $videodatabasefile['sortorder']    = 1;
    $videodatabasefile['userid']       = null;
    $videodatabasefile['author']       = null;
    $videodatabasefile['license']      = null;
    $contents[] = $videodatabasefile;

    return $contents;
}

/**
 * Register the ability to handle drag and drop file uploads
 * @return array containing details of the files / types the mod can handle
 */
function videodatabase_dndupload_register() {
    return array('types' => array(
                     array('identifier' => 'text/html', 'message' => get_string('createvideodatabase', 'videodatabase')),
                     array('identifier' => 'text', 'message' => get_string('createvideodatabase', 'videodatabase'))
                 ));
}

/**
 * Handle a file that has been uploaded
 * @param object $uploadinfo details of the file / content that has been uploaded
 * @return int instance id of the newly created mod
 */
function videodatabase_dndupload_handle($uploadinfo) {
    // Gather the required info.
    $data = new stdClass();
    $data->course = $uploadinfo->course->id;
    $data->name = $uploadinfo->displayname;
    $data->intro = '<p>'.$uploadinfo->displayname.'</p>';
    $data->introformat = FORMAT_HTML;
    if ($uploadinfo->type == 'text/html') {
        $data->contentformat = FORMAT_HTML;
        $data->content = clean_param($uploadinfo->content, PARAM_CLEANHTML);
    } else {
        $data->contentformat = FORMAT_PLAIN;
        $data->content = clean_param($uploadinfo->content, PARAM_TEXT);
    }
    $data->coursemodule = $uploadinfo->coursemodule;

    // Set the display options to the site defaults.
    $config = get_config('videodatabase');
    $data->display = $config->display;
    $data->popupheight = $config->popupheight;
    $data->popupwidth = $config->popupwidth;
    $data->printintro = $config->printintro;

    return videodatabase_add_instance($data, null);
}
