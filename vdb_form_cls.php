<?php
/**
 * TODO
 * - filepicker
 * - queue files for conversion
 * - save form input
 * - form validation *
 */

require_once("$CFG->libdir/formslib.php");
 
class simplehtml_form extends moodleform {
    public $myData = array();
    static $videotarget = '/home/abb/Documents/www/vid/';
    static $videosource = '/home/abb/Documents/www/videos/';
    static $stillstarget = '/home/abb/Documents/www/moodle/mod/videodatabase/images/stills/';
    
    //Add elements to form
    public function definition() {
        global $CFG;
        
        $mform = $this->_form; // Don't forget the underscore! 
 
        // read json data
        $json_schema = json_decode(file_get_contents($CFG->wwwroot . '/mod/videodatabase/data/category-schema-de.json'), true);
        
        //
        $max = sizeof($json_schema['data']);
        echo $max; 
        $data = $this->_customdata;
        print_r($data);
        // convert multi-select values into arrays
        $data['activities'] = explode(', ',$data['activities']);
        $data['perspectives'] = explode(', ',$data['perspectives']);
        $data['group'] = explode(', ', $data['group']);
        
        $textfields = array(
            ['title', 'Titel'],
            ['description', 'Beschreibung'],
            ['subject', 'Fach'],
            ['tags', 'Schlüsselwörter'],
            ['Creator', 'Ersteller'],
            ['publisher', 'Herausgeber'],
            ['institution', 'Institution'],
            ['source', 'Quelle'],
            ['language', 'Sprache'],
            ['license', 'Lizenz'],
            ['rights', 'Urheberrechte'],
            ['relation', 'Relation'],
            ['coverage', 'Bereich']
        );

        for($i = 0; $i < sizeof($textfields); $i++){
            $this->createTextinput( $textfields[$i][0], $textfields[$i][1] );
        }
        //
        for($i = 0; $i < $max; $i++){
            if($json_schema['data'][$i]['type'] === 'single'){
                $sel = array_key_exists($json_schema['data'][$i]['id'], $data) ? $data[ $json_schema['data'][$i]['id'] ] : array();
                $this->createSingleSelect($json_schema['data'][$i]['id'], $json_schema['data'][$i]['name'], $json_schema['data'][$i]['items'], $sel);
            }else if($json_schema['data'][$i]['type'] === 'multi'){
                $this->createMultiSelect($json_schema['data'][$i]['name'], $json_schema['data'][$i]['items'], $data[ $json_schema['data'][$i]['id'] ]);
            }else{
            
            }
        }


        

        

        $mform->addElement('static', 'date', 'Erstellt am');
        $mform->addElement('static', 'timemodified', 'Letzte Änderung am');
        $mform->addElement('static', 'mimetype', 'Mimetypes');
        $mform->addElement('static', 'format', 'Formate');
        $mform->addElement('static', 'size', 'Dateigröße');
        $mform->addElement('static', 'length', 'Abspieldauer');
        $mform->addElement('static', 'filename', 'Dateiname');

        /*
        [poster] =>
        */

        // update
        $mform->setConstant('length', $this->getVideoDuration($this->_customdata['filename']));
        
        //
        $maxbytes = 22222200000;
        $this->set_upload_manager(new upload_manager('attachment', true, false, $COURSE, false, 0, true, true, false));
            $mform->addElement('file', 'attachment', 'upload mgm');
            $mform->addRule('attachment', null, 'required'); 
        $mform->addElement('file', 'attachments', 'Videodatei');
        //$lll =$mform->get_file_content('attachment');
        //print_r($lll);

        $buttonarray=array();
        $buttonarray[] = $mform->createElement('submit', 'submitbutton', get_string('savechanges'));
        $buttonarray[] = $mform->createElement('reset', 'resetbutton', get_string('revert'));
        $buttonarray[] = $mform->createElement('cancel');
        $mform->addGroup($buttonarray, 'buttonar', '', ' ', false);

                /*$mform->addElement('filepicker', 'userfile', get_string('file'), null,
                                array(
                                    'maxbytes' => $maxbytes, 
                                    'accepted_types' => '*'
                                    ));
        */

        /*
        $mform->addElement('filepicker', 'userfile', get_string('file'), null,
                        array('maxbytes' => $maxbytes, 'accepted_types' => '*'));

        $mform->addElement('filemanager', 'attachments', get_string('attachment', 'moodle'), null,
                            array(
                                'subdirs' => 0, 
                                'maxbytes' => $maxbytes, 
                                'areamaxbytes' => 10485760, 
                                'maxfiles' => 3,
                                'accepted_types' => array('mp4','webm')
        ));
                                //,'return_types'=> FILE_INTERNAL | FILE_EXTERNAL)
        */                   
            echo '<br>';              
            //echo $this->convertVideos('VIDEO02_1_Biathlon2_Erwaermung.mp4');      
            echo '<br>';

        // $mform->addElement('filepicker', 'userfile', get_string('file'), null, array('maxbytes' => $maxbytes, 'accepted_types' => '*'));
                //$content = $mform->get_file_content('attachments');
                //$name = $mform->get_new_filename('attachments');
                //echo 'File'.$name;
                //$success = $mform->save_file('userfile', $fullpath, $override);
                /*
            
                */
    }

    
    /***
     * Creates a simple text input field
     */
    function createTextinput($id, $label){
        $mform = $this->_form;
        $mform->addElement('text', $id, $label);
        //$mform->setType('email', PARAM_NOTAGS);             
        $mform->setDefault($id, '');  
    }


    /**
     * Creates a single select form element
     */
    function createSingleSelect($id, $name, $values, $selected){
        $mform = $this->_form;
        $options = array();
        for($i=0;$i < sizeof($values);$i++){
            $options['val'.$i] = $values[$i]; 
        }   
        $select = $mform->addElement('select', $name, $name, $options);
        if( $select !== NULL){
            $select->setSelected(  array_search($selected, $options) );
        }    
    }

    
    /***
     * Creates a multi-select form element
     */
    function createMultiSelect($name, $values, $selected){
         $mform = $this->_form;
        $options = array();
        for($i=0;$i < sizeof($values);$i++){
            $options['val'.$i] = $values[$i]; 
        } 
        $mform->addElement('select', $name, $name, $options);
        $mform->getElement($name)->setMultiple(true);
        if(is_array($selected) && sizeof($selected) > 0){
            $sel = array();
            for($i=0;$i < sizeof($selected);$i++){
                if( array_search($selected[$i], $options) !== NULL){
                    array_push( $sel, array_search($selected[$i], $options));
                }
            }
            $mform->getElement($name)->setSelected( $sel );
        }
    }
    

    /**
     * Converts a given video file into an webm and mp4 file
     */
    function convertVideos($filename){
        // initialize
        require_once 'vendor/autoload.php';
        $ffmpeg = FFMpeg\FFMpeg::create(array(
            'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
            'ffprobe.binaries' => '/usr/bin/ffprobe',
            'timeout'          => 360000, // The timeout for the underlying process
            'ffmpeg.threads'   => 16,   // The number of threads that FFMpeg should use
        ));
        $ffprobe = FFMpeg\FFProbe::create();
        
        
        // open video
        $video = $ffmpeg->open( $videosource . $filename );
        
        // extract still images
        $duration = round( $ffprobe->format( $videosource . $filename )->get('duration'));
        $this->extractImages($video, $duration, 4);

        // run scheduler
        $sch = Crunz\Schedule;
        $schedule = new Schedule();
        $schedule
            ->run('/usr/bin/php script.php')
            ->dailyAt('13:30')
            ->description('Copying the project directory');
        //return $schedule;
        
        // bug: https://github.com/PHP-FFMpeg/PHP-FFMpeg/issues/453
        //$video->filters()->extractMultipleFrames(FFMpeg\Filters\Video\ExtractMultipleFramesFilter::FRAMERATE_EVERY_10SEC, $stillstarget.'test/')->synchronize()->save(new FFMpeg\Format\Video\X264(), 'new.jpg');
        
        
        
            
        // convert video
        /*
        $webm = new FFMpeg\Format\Video\WebM(); 
        $mp4 = new FFMpeg\Format\Video\X264(); 
        
        // be called once at the beginning and after the job is done
        $webm->on('progress', function ($video, $webm, $percentage) {
            echo "$percentage % transcoded";
        });
        */
        //$format->setAudioCodec("libfaac");
            //->setKiloBitrate(1000)
            //->setAudioChannels(2)
            //->setAudioKiloBitrate(256);
         //$video
            //->save($webm, $videotarget . $filename . '.webm')
            //->save($mp4, $videotarget . $filename . '.mp4')
            ;
        return;
    }


    /**
     * Extracts a given number of still images from a video
     */
    function extractImages( $video, $duration, $n ){
        $interval = floor( $duration / $n );
        for($i = 0; $i < $n; $i++){
            $frame = $video->frame(FFMpeg\Coordinate\TimeCode::fromSeconds( $i * $interval ));
            $frame->save( '/home/abb/Documents/www/moodle/mod/videodatabase/images/stills/test/frame-' . $i . '.jpg');
        }
    }

    /**
     * Determines the video duration
     */
    function getVideoDuration($filename){
        require_once 'vendor/autoload.php';
        $ffprobe = FFMpeg\FFProbe::create(); 
        return round( $ffprobe->format( simplehtml_form::$videosource . $filename )->get('duration'));
    }
    
    
    //Custom validation should be added here // xxx unused
    function validation($data, $files) {
        return array();
    }
}
?>