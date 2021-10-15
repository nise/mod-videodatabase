<?php

defined('MOODLE_INTERNAL') || die;

require_once $CFG->libdir . '/externallib.php';

/**
 * Very inefficient class. Needs to be refactored as an object of parameters and return objects.
 */
class mod_videodatabase_external extends external_api
{
    
    public static function name_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED 
        return new external_function_parameters(
            array('courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL))
        );
    }
    
    public static function name_is_allowed_from_ajax()
    {
        return true; 
    }

    public static function name_returns()
    {
        return new external_single_structure(
            array(
                    'data' => new external_value(PARAM_TEXT, 'username')
                )
        );
    }
    public static function name($data)
    {
        return array(
            'data' => 'video db'
        );
    }

    /**
     * Get the metadata of videos that are related to a course
     */    
    public static function get_all_videos_parameters()
    {
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
    public static function get_all_videos_returns()
    {
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
    public static function get_all_videos($data)
    {
        global $CFG, $DB, $USER;
        
        $transaction = $DB->start_delegated_transaction(); 
        $sql='
            SELECT * 
            FROM '.$CFG->prefix.'videodatabase_videos as d 
            JOIN '.$CFG->prefix.'videofile as f 
            WHERE d.videofileid = f.id';
        $res = $DB->get_records_sql($sql);
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
    //public static function get_all_videos_is_allowed_from_ajax() { return true; }
    

    /**
     * Get the metadata of videos that are related to a course
     */    
    public static function get_video_pool_parameters()
    {
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
    public static function get_video_pool_returns()
    {
        return new external_single_structure(
            array(
                    'data' => new external_value(PARAM_RAW, 'data')
                )
        );
    }
    public static function get_video_pool($data)
    {
        global $CFG, $DB, $USER;
        
        //$transaction = $DB->start_delegated_transaction(); 
        $table = "course";
        /* Default exception handler: 
        Can not find data record in database table external_functions. 
        Debug: SELECT * FROM {external_functions} WHERE name = ?\n[array (\n  0 => 'video_pool',\n)]\n
        Error code: invalidrecord\n* line 1533 of /lib/dml/moodle_database.php: dml_missing_record_exception thrown\n* line 1509 of /lib/dml/moodle_database.php: call to moodle_database->get_record_select()\n* line 73 of /lib/externallib.php: call to moodle_database->get_record()\n* line 185 of /lib/externallib.php: call to external_api::external_function_info()\n* line 59 of /lib/ajax/service.php: call to external_api::call_external_function()\n, referer: http://localhost/moodle/mod/videodatabase/view.php?id=1
        */
 
        //$res = $DB->get_records($table, array()); 
        //$res = $DB->get_records_sql('SELECT * FROM {table}');
        //$transaction->allow_commit();
        $context = context_course::instance((int)$data['courseid']);

        if (!has_capability('mod/videodatabase:view', $context)) {
            require_capability('mod/videodatabase:view', $context);
        }

        $sql='SELECT * FROM '.$CFG->prefix.'videofile;'; //WHERE course = 4 '.(int)$data['courseid']
        $res = $DB->get_records_sql($sql);
        // get url
        /* $filename = "test-video.mp4";
        $table_files = "files";
        $results = $DB->get_record($table_files, array('filename' => $filename, 'sortorder' => 1));
        $baseurl = "$CFG->wwwroot/pluginfile.php/$results->contextid/$results->component/$results->filearea/$results->itemid/$filename";
        */

        return array(
            'data' => json_encode($res)
        );
    }
    //public static function get_video_pool_is_allowed_from_ajax() { return true; }

    /**
     * Make video metadata persistent
     */
    public static function set_video_parameters()
    {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'course id', VALUE_OPTIONAL),
                            'videos' => new external_value(PARAM_TEXT, 'video ids', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }
    public static function set_video_returns()
    {
        return new external_single_structure(
            array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function set_video($data)
    {
        global $CFG, $DB;
        $table = "videodatabase_videos";
        $sql = 'DELETE FROM '.$CFG->prefix.'videodatabase_videos WHERE courseid='.(int)$data['courseid'];
        $res = $DB->execute($sql);
        $t = array();
        foreach ( $videos = explode(',', $data['videos']) as $video) {
            $r = new stdClass();
            $r->courseid = (int)$data['courseid'];
            $r->videofileid = (int)$video;
            array_push($t, $r);
        }
        $transaction = $DB->start_delegated_transaction(); 
        $res = $DB->insert_records($table, $t);
        $transaction->allow_commit();
        
        $transaction = $DB->start_delegated_transaction(); 
        $sql='
            SELECT * 
            FROM '.$CFG->prefix.'videodatabase_videos as d 
            JOIN '.$CFG->prefix.'videofile as f 
            WHERE d.videofileid = f.id;';
        $res = $DB->get_records_sql($sql);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));//'{ "status":"ok", "msg": "Successfully saved video id from the videofile pool.'.'."}');
    }

    /**
     * Takes video player log data form the client
     */
    public static function log_parameters() 
    {
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
    public static function log_returns() 
    {
        return new external_single_structure(
            array( 'response' => new external_value(PARAM_RAW, 'Server respons to the incomming log') )
        );
    }
    public static function log($data) 
    {
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
    //public static function log_is_allowed_from_ajax() { return true; }
    

    /**
     * Takes video player log data form the client
     */ 
    public static function get_log_parameters()
    {
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
    public static function get_log_returns()
    {
        return new external_single_structure(
            array( 'response' => new external_value(PARAM_RAW, 'Server respons to the incomming log') )
        );
    }
    public static function get_log($data)
    {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_logs";
        $res = $DB->get_records_list($table, 'courseid', array($data['courseid']));
        $transaction->allow_commit();
        
        return array('response'=> json_encode($res));
    } 
    //public static function get_log_is_allowed_from_ajax() { return true; }
    

    /**
     * Get the entiry log of the course
     */
    public static function get_all_comments_parameters()
    {
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
    public static function get_all_comments_returns()
    {
        return new external_single_structure(
            array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function get_all_comments()
    {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_videos";
        $res = $DB->get_records($table, $conditions = null, $sort = '', $fields = '*', $limitfrom = 0, $limitnum = 0);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));
    } 
    //public static function get_all_comments_is_allowed_from_ajax() { return true; }
       

    //
    public static function annotations_parameters()
    {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'operation' => new external_value(PARAM_TEXT, 'operation', VALUE_OPTIONAL),
                            'id' => new external_value(PARAM_INT, 'id of video', VALUE_OPTIONAL),
                            'courseid' => new external_value(PARAM_INT, 'id of course'),
                            'videoid' => new external_value(PARAM_INT, 'id of video', VALUE_OPTIONAL),
                            'userid' => new external_value(PARAM_TEXT, 'id of video', VALUE_OPTIONAL),
                            'content' => new external_value(PARAM_TEXT, 'id of video', VALUE_OPTIONAL),
                            'playbacktime' => new external_value(PARAM_FLOAT, 'id of video', VALUE_OPTIONAL),
                            'updated' => new external_value(PARAM_INT, 'id of video', VALUE_OPTIONAL),
                            'created' => new external_value(PARAM_INT, 'id of video', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }
    public static function annotations_returns()
    {
        return new external_single_structure(
            array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function annotations($data)
    {
        global $CFG, $DB;
        
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_annotations";
        
        if(array_key_exists('content', $data) && $data['operation'] === 'save') {
            // save
            $r = new stdClass();
            $r->type = 'comment';
            $r->content = $data['content'];
            //$r->posx = $data['posx'];
            //$r->posy = $data['posy'];
            //$r->width = $data['width'];
            //$r->height = $data['height'];
            $r->start = $data['playbacktime'];
            //$r->duration = $data['duration'];
            $r->author = $data['userid'];
            $r->created = $data['created'];
            $r->updated = $data['updated'];
            $r->videoid = $data['videoid'];
            $r->courseid = $data['courseid'];
            //  Modify    
            $res = $DB->insert_records($table, array($r));
        }else if(array_key_exists('videoid', $data) && array_key_exists('courseid', $data) && $data['operation'] === 'read') {
            // get records for a single video in a course
            $res = $DB->get_records($table, array('courseid' => $data['courseid'], 'videoid' => $data['videoid']));
        }else if($data['operation'] === 'remove') {//array_key_exists('operation', $data) && array_key_exists('id', $data) && 
            // delete a record
            $res = $DB->delete_records($table, array('courseid' => $data['courseid'], 'id' => $data['id']));
            //$transaction->allow_commit();
            //$transaction = $DB->start_delegated_transaction();
            // return remaining data
            //$res = $DB->get_records($table, array('courseid' => $data['courseid']));
        }else{
            // return all records for a given course
            $res = $DB->get_records($table, array('courseid' => $data['courseid']));
        }
        
        $transaction->allow_commit();
        return array('data'=> json_encode($res));
    }       
    //public static function annotations_is_allowed_from_ajax() { return true; }
     

    /**
     * Get or set video ratings
     */
    public static function ratings_parameters()
    {
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
    public static function ratings_returns()
    {
        return new external_single_structure(
            array( 
                    'data' => new external_value(PARAM_RAW, 'data'),
                    'info' => new external_value(PARAM_TEXT, 'data') 
                    )
        );
    }
    public static function ratings($data)
    {
        global $CFG, $DB;
        $transaction = $DB->start_delegated_transaction(); //If an exception is thrown in the below code, all DB queries in this code will be rollback.
        $table = "videodatabase_ratingss";
        $res = '';
        
        if(array_key_exists('rating', $data)) {
            // set value
            $r = new stdClass();
            $r->rating = $data['rating'];
            $r->videoid = $data['videoid'];
            $r->userid = $data['userid'];
            $r->courseid = $data['courseid'];
            $res = $DB->insert_records($table, array($r));
        }else if(array_key_exists('videoid', $data)) {
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
    //public static function ratings_is_allowed_from_ajax() { return true; }  


    /**
     * Store files in Moodle
     */
    public static function files_parameters()
    {
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
    public static function files_returns()
    {
        return new external_single_structure(
            array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function files($data)
    {
        global $CFG;
       
        $context = context_module::instance($data['moduleid']);
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
        
        if(! is_file($_SERVER['DOCUMENT_ROOT'] . $data['location'] . $data['filename'])) {
            $res['error'] .= 'Wrong tmp path to file: ' . $_SERVER['DOCUMENT_ROOT'] . $data['location'] . $data['filename'];
        }else{
            // create sha1
            $hash = sha1_file($_SERVER['DOCUMENT_ROOT'] . $data['location'] . $data['filename']);
            $data['contenthash'] = $hash;
            $path = $CFG->dataroot.'/filedir/'. substr($hash, 0, 2) . '/' . substr($hash, 2, 2) . '/';
            $res = array(
                'error'=>'',
                'hash'=>$hash,
                'filename'=>$data['filename'],
                'location'=>$path . $hash
            );
            if(is_dir($path)) {
                $res['error'] .= 'File already exists. ';
            }else{
                //$CFG->directorypermissions=00777;
                mkdir($path, $CFG->directorypermissions, true);
                if (is_dir($path) && is_writable($path)) {
                    $move = rename($_SERVER['DOCUMENT_ROOT'] . $data['location'] . $data['filename'], $path . $hash);
                    if($move == false) {
                        $res['error'] .= 'File move error ';
                    }
                }else{
                    $res['error'] .= 'Permission or path error. ';
                }
            }
        }
        //$fs->create_file_from_pathname($file_record, $data['location'] );
        if($res['error'] != '') {
            //error_log("FS create done? ".$res, 0);
        }
    
        return array('data'=> json_encode($res));
    }
    //public static function files_is_allowed_from_ajax() { return true; }   

}


?>