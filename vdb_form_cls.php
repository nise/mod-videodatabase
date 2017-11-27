<?php
//moodleform is defined in formslib.php
require_once("$CFG->libdir/formslib.php");
 
class simplehtml_form extends moodleform {
    //Add elements to form
    public function definition() {
        global $CFG;
 
        $mform = $this->_form; // Don't forget the underscore! 
 
        $mform->addElement('text', 'email', get_string('email')); // Add elements to your form
        $mform->setType('email', PARAM_NOTAGS);                   //Set type of element
        $mform->setDefault('email', 'Please enter email');        //Default value
        
        $mform->addElement('text', 'title', 'Titel');
        $mform->setDefault('title', 'Titel');

        $mform->addElement('text', 'description', 'Beschreibung');
        $mform->setDefault('description', 'Beschreibung');
$maxbytes = 222222;
        
$mform->addElement('file', 'attachments', get_string('attachments', 'forum'));
        /*$mform->addElement('filepicker', 'userfile', get_string('file'), null,
                           array(
                               'maxbytes' => $maxbytes, 
                               'accepted_types' => '*'
                            ));
*/
 $mform->addElement('filemanager', 'attachments', get_string('attachment', 'moodle'), null,
                    array(
                        'subdirs' => 0, 
                        'maxbytes' => $maxbytes, 
                        'areamaxbytes' => 10485760, 
                        'maxfiles' => 3,
                        'accepted_types' => array('mp4','webm')
));
                        //,'return_types'=> FILE_INTERNAL | FILE_EXTERNAL)
                    
      echo '<br>';              
      echo $this->convertVideos('VIDEO02_1_Biathlon2_Erwaermung.mp4');      
      echo '<br>';

// $mform->addElement('filepicker', 'userfile', get_string('file'), null, array('maxbytes' => $maxbytes, 'accepted_types' => '*'));
        //$content = $mform->get_file_content('userfile');
        //$name = $mform->get_new_filename('userfile');
        //$success = $mform->save_file('userfile', $fullpath, $override);
        /*
       
        */


    }

    /**
     * Converts a given video file into an webm and mp4 file
     */
    function convertVideos($filename){
        require_once 'vendor/autoload.php';
        $ffmpeg = FFMpeg\FFMpeg::create(array(
            'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
            'ffprobe.binaries' => '/usr/bin/ffprobe',
            'timeout'          => 360000, // The timeout for the underlying process
            'ffmpeg.threads'   => 16,   // The number of threads that FFMpeg should use
        ));
        $ffprobe = FFMpeg\FFProbe::create();
         

        $videotarget = '/home/abb/Documents/www/vid/';
        $videosource = '/home/abb/Documents/www/videos/';
        $stillstarget = '/home/abb/Documents/www/moodle/mod/videodatabase/images/stills/';

        $video = $ffmpeg->open( $videosource . $filename );
        
        // extract still images
        $length = round($ffprobe->format( $videosource . $filename )->get('duration'));
        //$frame = $video->frame(FFMpeg\Coordinate\TimeCode::fromSeconds(2));
        //$frame->save('frame.jpg', $stillstarget);
        /*
        $video
            ->filters()
            ->extractMultipleFrames(FFMpeg\Filters\Video\ExtractMultipleFramesFilter::FRAMERATE_EVERY_60SEC, $stillstarget.'test/')
            ->synchronize();
        $video->save(new FFMpeg\Format\Video\X264(), 'new.jpg');
        */
        
        
            
        // convert video
        $webm = new FFMpeg\Format\Video\WebM(); 
        $mp4 = new FFMpeg\Format\Video\X264(); 
        
        // be called once at the beginning and after the job is done
        $webm->on('progress', function ($video, $webm, $percentage) {
            echo "$percentage % transcoded";
        });

        //$format->setAudioCodec("libfaac");
            //->setKiloBitrate(1000)
            //->setAudioChannels(2)
            //->setAudioKiloBitrate(256);
         $video
            //->save($webm, $videotarget . $filename . '.webm')
            //->save($mp4, $videotarget . $filename . '.mp4')
            ;
        return;
    }
    
    
    //Custom validation should be added here
    function validation($data, $files) {
        return array();
    }
}
?>