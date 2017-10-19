<?php
/**
 * The video_open event.
 *
 * @package    mod_videodatabase
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace mod\videodatabase\event;
defined('MOODLE_INTERNAL') || die();
/**
 * The EVENTNAME event class.
 *
 * @property-read array $other {
 *      Extra information about event.
 *
 *      - PUT INFO HERE
 * }
 *
 * @since     Moodle MOODLEVERSION
 * @copyright 2017 Niels Seidel
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 **/
class video_open extends \core\event\base {
    protected function init() {
        $this->data['crud'] = 'r'; // c(reate), r(ead), u(pdate), d(elete)
        $this->data['edulevel'] = self::LEVEL_PARTICIPATING;
        $this->data['objecttable'] = 'page';
    }
 
    public static function get_name() {
        return get_string('eventVideoOpen', 'mod_videodatabase');
    }
 
    public function get_description() {
        return "The user with id {". $this->userid . "} created ... ... ... with id {". $this->objectid ."}.";
    }
 
    public function get_url() {
        //return new \moodle_url('....', array('parameter' => 'value', ...));
        return new moodle_url('/mod/videodatabase/vdb_player.php', array('id' => $this->context->instanceid));
    }
 
    protected function get_legacy_eventdata() {
        // Override if you migrating events_trigger() call.
        $data = new stdClass();
        $data->id = $this->objectid;
        $data->userid = $this->relateduserid;
        return $data;
    }

}