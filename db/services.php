<?php

/**
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// We defined the web service functions to install.
$functions = array(
        'local_wstemplate_hello_world' => array(
                'classname'   => 'mod_videodatabase_external',
                'methodname'  => 'hello_world',
                'classpath'   => 'mod/videodatabase/classes/external.php',
                'description' => 'Return Hello World FIRSTNAME. Can change the text (Hello World) sending a new text as parameter',
                'type'        => 'read',
                'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
        )
);

// http://localhost/moodle/webservice/rest/server.php?wstoken=e321c48e338fc44830cda07824833944&wsfunction=local_wstemplate_hello_world
