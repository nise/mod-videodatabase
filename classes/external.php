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
                    'userid' => new external_value(PARAM_INT, 'user id'),
                    'userimage' => new external_value(PARAM_TEXT, 'userimage')
                )
        );
    }

    public static function get_all_videos($data) {
        global $CFG, $DB, $USER;
        
        $transaction = $DB->start_delegated_transaction(); 
        $table = "videodatabase_videos";
        $res = $DB->get_records($table, array('courseid'=> (int)$data['courseid'] )); 
        $transaction->allow_commit();
        return array(
            'data' => json_encode($res),
            'username' => $USER->username,
            'firstname' =>  $USER->firstname,
            'lastname' =>  $USER->lastname,
            'userid' =>  $USER->id, // or idnumber
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
                            'nu' => new external_value(PARAM_INT, 'is it a new video', VALUE_OPTIONAL),
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
        if($data['nu'] == 1 ){
            $res = $DB->insert_record($table, (object)json_decode($data['data']));
        }else{
            $res = $DB->update_record($table,  json_decode($data['data']));
        }
        $transaction->allow_commit();
        return array('data'=> '{ "status":"ok", "msg":"Successfully saved meta data of video with id '.'."}');
    } 
}


/**
 * Takes video player log data form the client
 */
class mod_videodatabase_logging extends external_api {
    
    public static function log_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'entry' => new external_value(PARAM_RAW, 'video data', VALUE_OPTIONAL)
                        )
                )
            )
        );
    }
    
    public static function log_returns() {
        return new external_single_structure(
                array( 'response' => new external_value(PARAM_RAW, 'Server respons to the incomming log') )
        );
    }

    public static function log($data) {
        global $CFG, $DB;
        /*
        $logfile= '/home/abb/Documents/www/videodb.log';//$CFG->dirroot.'/mod/videodatabase/videodatabase.log';
        // Append to the log file
        if($fd = @fopen($logfile, "a")) {
            $message = $data['data'];//json_decode($data['data']);
            // convert json to csv
            // xxx
            $result = fputs($fd, $messsage);
            fclose($fd);
        
            if($result > 0){
                return array('response'=> 'Wrote log to file');
            }else{                
                return array('response'=> 'Unable to write to '.$logfile.'!');
            } 
        }
        else {
             return array('response'=> 'Unable to open logfile '.$logfile.'!');
        }
        */

        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $r = new stdClass();
        $r->courseid = (int)$data['courseid'];
        $r->entry = $data['entry'];
        $res = $DB->insert_records("videodatabase_logs", array($r));
        $transaction->allow_commit();
        
        return array('response'=> json_encode($res));
    } 
}


/**
 * Takes video player log data form the client
 */
class mod_videodatabase_get_log extends external_api {
    
    public static function get_log_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL)
                        )
                )
            )
        );
    }
    
    public static function get_log_returns() {
        return new external_single_structure(
                array( 'response' => new external_value(PARAM_RAW, 'Server respons to the incomming log') )
        );
    }

    public static function get_log($data) {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_logs";
        $res = $DB->get_records_list($table, 'courseid', array($data['courseid']));
        $transaction->allow_commit();
        
        return array('response'=> json_encode($res));
    } 
}


/**
 * Get the entiry log of the course
 */
class mod_videodatabase_comments_external extends external_api {
    public static function get_all_comments_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL)
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
 * Get or set video ratings
 */
class mod_videodatabase_ratings_external extends external_api {
    public static function ratings_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of the course', VALUE_OPTIONAL),
                            'videoid' => new external_value(PARAM_INT, 'id of the video', VALUE_OPTIONAL),
                            'userid' => new external_value(PARAM_INT, 'id of the user', VALUE_OPTIONAL),
                            'rating' => new external_value(PARAM_INT, 'user rating', VALUE_OPTIONAL),
                        )
                )
            )
        );
    }
    public static function ratings_returns() {
        return new external_single_structure(
                array( 'data' => new external_value(PARAM_RAW, 'data'),
                'info' => new external_value(PARAM_TEXT, 'data') )
        );
    }
    public static function ratings($data) {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_ratingss";
        $res = '';
        
        if(array_key_exists('rating', $data)){
            // set value
            $r = new stdClass();
            $r->rating = $data['rating'];
            $r->videoid = $data['videoid'];
            $r->userid = $data['userid'];
            $r->courseid = $data['courseid'];
            $res = $DB->insert_records($table, array($r));
        }else if(array_key_exists('videoid', $data)){
            // get value for a video
            $res = $DB->get_records($table, array('courseid'=>$data['courseid'], 'videoid'=>$data['videoid']));
        }else{
            // get all values
            $res = $DB->get_records($table, array('courseid'=>$data['courseid']));
        }
        $transaction->allow_commit();
        return array(
            'data'=> json_encode($res), 
            'info'=> sizeof($res)
        );
    }    
}


/**
 * Store files in Moodle
 */
class mod_videodatabase_files_external extends external_api {
    public static function files_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of the course', VALUE_OPTIONAL),
                            'moduleid' => new external_value(PARAM_INT, 'id of the module'),
                            'filename' => new external_value(PARAM_TEXT, 'filename'),
                            'location' => new external_value(PARAM_TEXT, 'file location'),
                            'filearea' => new external_value(PARAM_TEXT, 'file area')
                        )
                )
            )
        );
    }
    public static function files_returns() {
        return new external_single_structure(
            array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function files($data) {
        global $CFG;
       
        $context = context_module::instance( $data['moduleid'] );
        $fs = get_file_storage();
        $file_record = array(
            'contextid'=>$context->id, 
            'component'=>'mod_videodatabase', 
            'filearea'=>$data['filearea'],
            'itemid'=>0, 
            'filepath'=>'/', 
            'filename'=>$data['filename'],
            'timecreated'=>time(), 
            'timemodified'=>time()
        );
        
        // create sha1
        $hash = sha1_file( $_SERVER['DOCUMENT_ROOT'] . $data['location'] . $data['filename'] );
        $data['contenthash'] = $hash;
        $path = $CFG->dataroot.'/filedir/'. substr( $hash, 0, 2) . '/' . substr( $hash, 2, 2) . '/';
        $res = array(
            'error'=>'',
            'hash'=>$hash,
            'filename'=>$data['filename'],
            'location'=>$path . $hash
        );
        if(is_dir( $path )){
            $res['error'] .= 'File already exists. ';
        }else{
            //$CFG->directorypermissions=00777;
            mkdir($path, $CFG->directorypermissions, true);
            if (is_dir($path) && is_writable($path)) {
                $move = rename( $_SERVER['DOCUMENT_ROOT'] . $data['location'] . $data['filename'], $path . $hash );
                if($move == false){
                    $res['error'] .= 'File move error ';
                }
            }else{
                $res['error'] .= 'Permission or path error. ';
            }
        }
        //$fs->create_file_from_pathname($file_record, $data['location'] );
        if($res['error'] != ''){
            //error_log("FS create done? ".$res, 0);
        }
    
        return array('data'=> json_encode($res));
    }    
}




/*
 
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
*/


?>