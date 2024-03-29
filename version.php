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
 * videodatabase module version information
 *
 * @package    mod
 * @subpackage videodatabase
 * @copyright  2009 Petr Skoda (http://skodak.org)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$plugin->version   = 2018064243;
$plugin->requires  = 2018062500;
$plugin->component = 'mod_videodatabase';
$plugin->cron      = 0;
$plugin->dependencies = array(
    'mod_videofile' => ANY_VERSION//,   // The Foo activity must be present (any version).
    //'enrol_bar' => 2014020300, // The Bar enrolment plugin version 2014020300 or higher must be present.
);

