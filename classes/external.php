<?php

defined('MOODLE_INTERNAL') || die;

require_once($CFG->libdir . '/externallib.php');
//require_once($CFG->dirroot . '/mod/chat/lib.php');

  /**
     * Trigger the course module viewed event and update the module completion status.
     *
     * @return array of warnings and status result
     * @since Moodle 3.0
     * @throws moodle_exception
     */
class mod_videodatabase_external extends external_api {

    public static function hello_world() {
        //global $DB;

        
        $result = array();
        $result['messageid'] = 33333333333333;
        $result['warnings'] = array();
        return $result;
    }

    /**
     * Returns description of method result value
     *
     * @return external_description
     * @since Moodle 3.0
     */
    public static function hello_world_returns() {
        return new external_single_structure(
            array(
                'messageid' => new external_value(PARAM_INT, 'message sent id'),
                'warnings' => new external_warnings()
            )
        );
    }
}

    ?>