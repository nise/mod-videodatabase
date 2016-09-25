<?php

/**
 * videodatabase module admin settings and defaults
 *
 * @package    mod
 * @subpackage videodatabase
 * @copyright  2016 
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

if ($ADMIN->fulltree) {
    require_once("$CFG->libdir/resourcelib.php");

    $displayoptions = resourcelib_get_displayoptions(array(RESOURCELIB_DISPLAY_OPEN, RESOURCELIB_DISPLAY_POPUP));
    $defaultdisplayoptions = array(RESOURCELIB_DISPLAY_OPEN);

    //--- general settings -----------------------------------------------------------------------------------
    $settings->add(new admin_setting_configcheckbox('videodatabase/requiremodintro',
        get_string('requiremodintro', 'admin'), get_string('configrequiremodintro', 'admin'), 1));
    $settings->add(new admin_setting_configmultiselect('videodatabase/displayoptions',
        get_string('displayoptions', 'videodatabase'), get_string('configdisplayoptions', 'videodatabase'),
        $defaultdisplayoptions, $displayoptions));

    //--- modedit defaults -----------------------------------------------------------------------------------
    $settings->add(new admin_setting_heading('videodatabasemodeditdefaults', get_string('modeditdefaults', 'admin'), get_string('condifmodeditdefaults', 'admin')));

    $settings->add(new admin_setting_configcheckbox('videodatabase/printintro',
        get_string('printintro', 'videodatabase'), get_string('printintroexplain', 'videodatabase'), 0));
    $settings->add(new admin_setting_configselect('videodatabase/display',
        get_string('displayselect', 'videodatabase'), get_string('displayselectexplain', 'videodatabase'), RESOURCELIB_DISPLAY_OPEN, $displayoptions));
    $settings->add(new admin_setting_configtext('videodatabase/popupwidth',
        get_string('popupwidth', 'videodatabase'), get_string('popupwidthexplain', 'videodatabase'), 620, PARAM_INT, 7));
    $settings->add(new admin_setting_configtext('videodatabase/popupheight',
        get_string('popupheight', 'videodatabase'), get_string('popupheightexplain', 'videodatabase'), 450, PARAM_INT, 7));
}
