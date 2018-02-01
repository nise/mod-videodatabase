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
 * videodatabase module upgrade code
 *
 * This file keeps track of upgrades to
 * the resource module
 *
 * Sometimes, changes between versions involve
 * alterations to database structures and other
 * major things that may break installations.
 *
 * The upgrade function in this file will attempt
 * to perform all the necessary actions to upgrade
 * your older installation to the current version.
 *
 * If there's something it cannot do itself, it
 * will tell you what you need to do.
 *
 * The commands in here will all be database-neutral,
 * using the methods of database_manager class
 *
 * Please do not forget to use upgrade_set_timeout()
 * before any action that may take longer time to finish.
 *
 * @package    mod
 * @subpackage videodatabase
 * @copyright  2009 Petr Skoda (http://skodak.org)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

function xmldb_videodatabase_upgrade($oldversion) {
    global $CFG, $DB;

    $dbman = $DB->get_manager();


    //if ($oldversion < 2017064102) {

// Rename field compentencies on table videodatabase_videos to NEWNAMEGOESHERE.
        //$table = new xmldb_table('videodatabase_videos');
        //$field = new xmldb_field('compentencies', XMLDB_TYPE_CHAR, '255', null, null, null, null, 'timemodified');

        // Launch rename field compentencies.
        //$dbman->rename_field($table, $field, 'competencies');

        // Videodatabase savepoint reached.
        //upgrade_mod_savepoint(true, 2017064103, 'videodatabase');
    //}
       
       

/*
        $table = new xmldb_table('videodatabase_videos');
        $field = new xmldb_field('courseid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null, null);

        // Conditionally launch add field id.
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Videodatabase savepoint reached.
        upgrade_mod_savepoint(true, 2017064106, 'videodatabase');


 // Changing the default of field courseid on table videodatabase_videos to 2.
        $table = new xmldb_table('videodatabase_videos');
        $field = new xmldb_field('rating', XMLDB_TYPE_INTEGER, '10', null, null, null, 0);

        // Launch change of default for field courseid.
        $dbman->add_field($table, $field);
        // $dbman->change_field_default($table, $field);

        // Videodatabase savepoint reached.
        upgrade_mod_savepoint(true, 2017064107, 'videodatabase');

*/



/*
 // Define field rating to be added to videodatabase_videos.
        $table = new xmldb_table('videodatabase_videos');
        $field = new xmldb_field('rating', XMLDB_TYPE_INTEGER, '255', null, null, null, '0', 'status');

        // Conditionally launch add field rating.
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Videodatabase savepoint reached.
        //upgrade_mod_savepoint(true, 2017064113, 'videodatabase');

         // Define field status to be added to videodatabase_videos.
        $table = new xmldb_table('videodatabase_videos');
        $field = new xmldb_field('status', XMLDB_TYPE_INTEGER, '255', null, null, null, '0', 'courseid');

        // Conditionally launch add field status.
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Videodatabase savepoint reached.
        upgrade_mod_savepoint(true, 2017064113, 'videodatabase');
*/




    
      if ($oldversion < 0) {// 2017064101

        // Define field id to be added to videodatabase_annotations.
        $table = new xmldb_table('videodatabase_videos');
        $field = new xmldb_field('courseid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null, null);

        // Conditionally launch add field id.
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Videodatabase savepoint reached.
        upgrade_mod_savepoint(true, 2017064101, 'videodatabase');


        /*******************/
          
        // Define field id to be added to videodatabase_videos.
        $table = new xmldb_table('videodatabase_videos');
        $field = new xmldb_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null, null);

        // Conditionally launch add field id.
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Videodatabase savepoint reached.
        upgrade_mod_savepoint(true, 2017064101, 'videodatabase');
    }
  

    return true;
}
