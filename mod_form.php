<?php

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * videodatabase configuration form
 *
 * @package    mod
 * @subpackage videodatabase
 * @copyright  Niels Seidel, niels.seidel@nise81.com
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * 
 * 
 * BUG: 
 * Function moodleform_mod::add_intro_editor() is deprecated, use moodleform_mod::standard_intro_elements() instead.

    line 879 of /course/moodleform_mod.php: call to debugging()
    line 61 of /mod/videodatabase/mod_form.php: call to moodleform_mod->add_intro_editor()
    line 204 of /lib/formslib.php: call to mod_videodatabase_mod_form->definition()
    line 95 of /course/moodleform_mod.php: call to moodleform->__construct()
    line 255 of /course/modedit.php: call to moodleform_mod->__construct()
 */

defined('MOODLE_INTERNAL') || die;

require_once($CFG->dirroot.'/course/moodleform_mod.php');
require_once($CFG->dirroot.'/mod/videodatabase/locallib.php');
require_once($CFG->libdir.'/filelib.php');

class mod_videodatabase_mod_form extends moodleform_mod {
    function definition() {
        global $CFG, $DB;

        $mform = $this->_form;

        $config = get_config('videodatabase');

        $mform->addElement('header', 'general', get_string('general', 'form'));
        $mform->addElement('text', 'name', get_string('name'), array('size'=>'48'));
        if (!empty($CFG->formatstringstriptags)) {
            $mform->setType('name', PARAM_TEXT);
        } else {
            $mform->setType('name', PARAM_CLEANHTML);
        }
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 255), 'maxlength', 255, 'client');

        $this->standard_intro_elements(false);

          
        //-------------------------------------------------------
        //$mform->addElement('header', 'contentsection', get_string('contentheader', 'videodatabase'));
        
        //$mform->addElement('text', 'videodatabase', get_string('content', 'videodatabase'));//, null, videodatabase_get_editor_options($this->context));
        //$mform->setType('videodatabase', PARAM_TEXT);
        
        //$mform->addRule('videodatabase', get_string('required'), 'required', null, 'client');

        //-------------------------------------------------------
        $mform->addElement('header', 'appearancehdr', get_string('appearance'));

        if ($this->current->instance) {
            $options = resourcelib_get_displayoptions(explode(',', $config->displayoptions), $this->current->display);
        } else {
            $options = resourcelib_get_displayoptions(explode(',', $config->displayoptions));
        }
        if (count($options) == 1) {
            $mform->addElement('hidden', 'display');
            $mform->setType('display', PARAM_INT);
            reset($options);
            $mform->setDefault('display', key($options));
        } else {
            $mform->addElement('select', 'display', get_string('displayselect', 'videodatabase'), $options);
            $mform->setDefault('display', $config->display);
        }

        if (array_key_exists(RESOURCELIB_DISPLAY_POPUP, $options)) {
            $mform->addElement('text', 'popupwidth', get_string('popupwidth', 'videodatabase'), array('size'=>3));
            if (count($options) > 1) {
                $mform->disabledIf('popupwidth', 'display', 'noteq', RESOURCELIB_DISPLAY_POPUP);
            }
            $mform->setType('popupwidth', PARAM_INT);
            $mform->setDefault('popupwidth', $config->popupwidth);

            $mform->addElement('text', 'popupheight', get_string('popupheight', 'videodatabase'), array('size'=>3));
            if (count($options) > 1) {
                $mform->disabledIf('popupheight', 'display', 'noteq', RESOURCELIB_DISPLAY_POPUP);
            }
            $mform->setType('popupheight', PARAM_INT);
            $mform->setDefault('popupheight', $config->popupheight);
        }

        $mform->addElement('advcheckbox', 'printintro', get_string('printintro', 'videodatabase'));
        $mform->setDefault('printintro', $config->printintro);

        // add legacy files flag only if used
        if (isset($this->current->legacyfiles) and $this->current->legacyfiles != RESOURCELIB_LEGACYFILES_NO) {
            $options = array(RESOURCELIB_LEGACYFILES_DONE   => get_string('legacyfilesdone', 'videodatabase'),
                             RESOURCELIB_LEGACYFILES_ACTIVE => get_string('legacyfilesactive', 'videodatabase'));
            $mform->addElement('select', 'legacyfiles', get_string('legacyfiles', 'videodatabase'), $options);
            $mform->setAdvanced('legacyfiles', 1);
        }

        //-------------------------------------------------------
        $this->standard_coursemodule_elements();

        //-------------------------------------------------------
        $this->add_action_buttons();

        //-------------------------------------------------------
        $mform->addElement('hidden', 'revision');
        $mform->setType('revision', PARAM_INT);
        $mform->setDefault('revision', 1);

        $mform->addElement('hidden', 'format');
        $mform->setType('format', PARAM_INT);
        $mform->setDefault('format', 0);


    }

    function data_preprocessing(&$default_values) {
      return;
        
        if ($this->current->instance) {
            file_put_contents('php://stderr', 'aaaaaaaaaaa');
            $draftitemid = file_get_submitted_draft_itemid('videodatabase');
            $default_values['videodatabase']['format'] = $default_values['contentformat'];
            $default_values['videodatabase']['text']   = file_prepare_draft_area($draftitemid, $this->context->id, 'mod_videodatabase', 'content', 0, videodatabase_get_editor_options($this->context), $default_values['content']);
            $default_values['videodatabase']['itemid'] = $draftitemid;
        }
        if (!empty($default_values['displayoptions'])) {
            file_put_contents('php://stderr', 'bbbbbbbbbbbb');
            $displayoptions = unserialize($default_values['displayoptions']);
            $default_values['videodatabase']['format'] = 0;
            if (isset($displayoptions['printintro'])) {
                $default_values['printintro'] = $displayoptions['printintro'];
            }
            if (!empty($displayoptions['popupwidth'])) {
                $default_values['popupwidth'] = $displayoptions['popupwidth'];
            }
            if (!empty($displayoptions['popupheight'])) {
                $default_values['popupheight'] = $displayoptions['popupheight'];
            }
        }
    }
}
