<?php

/**
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


$functions = array(
        'videodatabase_videos' => array(
                'classname'   => 'mod_videodatabase_videos_external',
                'methodname'  => 'get_all_videos',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter for course-related videos',
                'type'        => 'read',
                'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
        ),
        'videodatabase_video' => array(
                'classname'   => 'mod_videodatabase_get_video_external',
                'methodname'  => 'get_video',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter a video',
                'type'        => 'read',
                'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
        ),
         'videodatabase_store_video' => array( // store video metadata
                'classname'   => 'mod_videodatabase_set_video_external',
                'methodname'  => 'set_video',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Setter for a video',
                'type'        => 'write',
                'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
        ),
        'videodatabase_comments' => array(
                'classname'   => 'mod_videodatabase_comments_external',
                'methodname'  => 'get_all_comments',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter for course-related comments',
                'type'        => 'read',
                'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
        ),
        'videodatabase_video_comments' => array(
                'classname'   => 'mod_videodatabase_video_comment_external',
                'methodname'  => 'get_video_comments',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Getter for all comments related to a video',
                'type'        => 'read',
                'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
        )
);

// http://localhost/moodle/webservice/rest/server.php?wstoken=e321c48e338fc44830cda07824833944&wsfunction=local_wstemplate_hello_world
