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


    // get all videos
    // get all comments
    // get comments of video
    // save comment
    // https://www.npmjs.com/package/require-vuejs

     public static function hello_world_parameters() {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED 
        return new external_function_parameters(
            array(
                'data' => //new external_multiple_structure(
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                           // 'name' => new external_value(PARAM_TEXT, 'multilang compatible name, course unique', VALUE_OPTIONAL),
                            //'description' => new external_value(PARAM_RAW, 'group description text', VALUE_OPTIONAL)
                        )
                    //)
                )
            )
        );
    }


    public static function hello_world_returns() {
        return //new external_multiple_structure(
            new external_single_structure(
                array(
                    //'id' => new external_value(PARAM_INT, 'group record id'),
                    //'courseid' => new external_value(PARAM_INT, 'id of course'),
                    //'name' => new external_value(PARAM_TEXT, 'multilang compatible name, course unique'),
                    'data' => new external_value(PARAM_RAW, 'data'),
                    //'enrolmentkey' => new external_value(PARAM_RAW, 'group enrol secret phrase'),
                )
            //)
        );
    }
    

    public static function hello_world() { //Don't forget to set it as static
        global $CFG, $DB;
        
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
 
        $table = "videodatabase_videos";
        $res = $DB->get_records($table, $conditions = null, $sort = '', $fields = '*', $limitfrom = 0, $limitnum = 0);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));
    }
} 
    ?>