<?php

/**
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


$functions = array(
        'mod_videodatabase_pluginname' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'name',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'get name',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'mod_videodatabase_videos' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'get_all_videos',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter for course-related videos',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'mod_videodatabase_video_pool' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'get_video_pool',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter pool of uploaded videos from the plugin videofiles',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'mod_videodatabase_video' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'get_video',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter for a video',
                'type'        => 'read',
                'ajax'        => true 
        ),
         'mod_videodatabase_store_video' => array( 
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'set_video',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Setter for a video',
                'type'        => 'write',
                'ajax'        => true 
        ),
          'mod_videodatabase_logging' => array( 
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'log',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Store log to DB',
                'type'        => 'write',
                'ajax'        => true 
        ),
          'mod_videodatabase_get_log' => array( 
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'get_log',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Obtains log data from the client',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'mod_videodatabase_comments' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'get_all_comments',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter for course-related comments',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'mod_videodatabase_annotations' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'annotations',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter for all comments related to a video',
                'type'        => 'write',
                'ajax'        => true 
        ),
        'mod_videodatabase_ratings' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'ratings',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter for video-related ratings',
                'type'        => 'write',
                'ajax'        => true 
        ),
      /*   'mod_hyperaudio_save_answer' => array(
        'classname'   => 'mod_hyperaudio_external',
        'methodname'  => 'save_answer',
        'classpath'   => 'mod/hyperaudio/classes/external.php',
        'description' => 'Save answer',
        'type'        => 'write'
    ),*/
         'mod_videodatabase_files' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'files',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Store files to moodle',
                'type'        => 'write',
                'ajax'        => true 
                
        )
);

// http://localhost/moodle/webservice/rest/server.php?wstoken=e321c48e338fc44830cda07824833944&wsfunction=local_wstemplate_hello_world
