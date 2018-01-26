<?php

defined('MOODLE_INTERNAL') || die;

require_once($CFG->libdir . '/externallib.php');
//require_once($CFG->dirroot . '/mod/chat/lib.php');


/**
 * Get the metadata of videos that are related to a course
 */
class mod_videodatabase_videos_external extends external_api {
    
     public static function get_all_videos_parameters() {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED 
        return new external_function_parameters(
            array(
                'data' => new external_single_structure(
                    array(
                        'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                    )
                )
            )
        );
    }

    public static function get_all_videos_returns() {
        return new external_single_structure(
                array(
                    'data' => new external_value(PARAM_RAW, 'data'),
                    'username' => new external_value(PARAM_TEXT, 'username'),
                    'firstname' => new external_value(PARAM_TEXT, 'lastname'),
                    'lastname' => new external_value(PARAM_TEXT, 'lastname'),
                    'userimage' => new external_value(PARAM_TEXT, 'userimage')
                )
        );
    }

    public static function get_all_videos($data) {
        global $CFG, $DB, $USER;
        $transaction = $DB->start_delegated_transaction(); 
        $table = "videodatabase_videos";
        $res = $DB->get_records($table); 
        $transaction->allow_commit();
        return array(
            'data' => json_encode($res),
            'username' => $USER->username,
            'firstname' =>  $USER->firstname,
            'lastname' =>  $USER->lastname,
            'userid' =>  $USER->id,
            'userimage' => '/moodle/user/pix.php/'.$USER->id.'/f1.jpg' 
        );
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
                            //'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'id' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'data' => new external_value(PARAM_RAW, 'video data', VALUE_OPTIONAL)
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
    public static function set_video($data) {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_videos";
        $metadata = json_decode($data['data']);
        $res = $DB->update_record($table, $metadata);
        $transaction->allow_commit();
        return array('data'=> '{ "status":"ok", "msg":"Successfully saved meta data of video with id '.$metadata->id.'."}');
    } 
}


/**
 * Get or set video comments
 */
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





/**
 * NOT NEEDED ?
 */


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

?>