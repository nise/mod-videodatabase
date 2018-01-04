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
class mod_videodatabase_videos_external extends external_api {


    // get all videos
    // get all comments
    // get comments of video
    // save comment
    // https://www.npmjs.com/package/require-vuejs

     public static function get_all_videos_parameters() {
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
    public static function get_all_videos_returns() {
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
    public static function get_all_videos() {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); 
        $table = "videodatabase_videos";
        $res = $DB->get_records($table, $conditions = null, $sort = '', $fields = '*', $limitfrom = 0, $limitnum = 0);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));
    }
}


class mod_videodatabase_get_video_external extends external_api {
    public static function get_video_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'videoid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL)
                        )
                )
            )
        );
    }
    public static function get_video_returns() {
        return new external_single_structure(
                array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function get_video() {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_videos";
        $res = $DB->get_records($table, array('id'=>165 ), $sort = '', $fields = '*', $limitfrom = 0, $limitnum = 0);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));
    } 
}


/**
 * Make video metadata persistent
 */
class mod_videodatabase_set_video_external extends external_api {
    public static function set_video_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'videoid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL)
                        )
                )
            )
        );
    }
    public static function set_video_returns() {
        return new external_single_structure(
                array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function set_video() {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_videos";
        $res = $DB->update_records($table, array('id'=>165 ), $sort = '', $fields = '*', $limitfrom = 0, $limitnum = 0);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));
    } 
}

class mod_videodatabase_comments_external extends external_api {
    public static function get_all_comments_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                        )
                )
            )
        );
    }
    public static function get_all_comments_returns() {
        return new external_single_structure(
                array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function get_all_comments() {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_videos";
        $res = $DB->get_records($table, $conditions = null, $sort = '', $fields = '*', $limitfrom = 0, $limitnum = 0);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));
    }    
}

class mod_videodatabase_video_comments_external extends external_api {
    public static function get_video_comments_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'videoid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                        )
                )
            )
        );
    }
    public static function get_video_comments_returns() {
        return new external_single_structure(
                array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function get_video_comments() {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_videos";
        $res = $DB->get_records($table, $conditions = null, $sort = '', $fields = '*', $limitfrom = 0, $limitnum = 0);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));
    }        
} 

?>