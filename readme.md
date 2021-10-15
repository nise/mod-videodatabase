This plugin is not actively maintained anymore.

mod-videodatabase is a database, player, and annotation tool for video-based learning resources in moodle.

**System Features:**
* Select video files from a pool of videos
* Comprehensive meta data description of video files (dublin core, pedagogic metadata, technical descriptions)
* Browse and search a video collection
* Having multiple video databases in a course or course module
* Advanced video playback functionionalities (e.g. zoom, speed, loop, skip back)
* Video annotations (e.g. comments)
* User rating per video

---
# Installation
Tested with Moodle v3.5

## Install depenencies
[Moodle Video Pool](https://github.com/nise/moodle-video-pool)

## Geting started
1. After installing both plugin you can add the videodatabase as a activity to your course. 
2. Before loading videos into the database you need to create a video pool by using the [Moodle Video Pool](https://github.com/nise/moodle-video-pool) plugin. Therefore, stay in the edit mode and add as many videos to your pool as you want. For each video you are ask to define comprehensive meta data. This metadata is important in order to make use of the database.
3. Once you have uploaded at least one video in your course you can add it to your video database. Open the videodatabase an click on the little cog on the top right corner. The uploaded videos should appear. Selecte the ones you like and refresh the page.
 

## Configure the webserver
**Apache2**
Open `/etc/php/7.0/apache2/php.ini` and set `upload_max_filesize = 500M` and `post_max_size = 500M`

**moodledata**
In order to support the file workflow the permissions of the moodledata folder need to be set as follow:
* `chown -R www-data:www-data /path/to/moodledata`
* `cmod -R 0750 /path/to/moodledata`

**nginx**
(tba)


## Install the plugin
* Change directory to the moodle plugin folder: `cd to the moodle/mod`
* Clone the repository: `git clone https://github.com/nise/mod-videodatabase`
* Rename the plugin folder: `mv mod-videodatabase videodatabase`
* Open the Notification page in the Moodle Admin Panel and update the plugins

---
# Development
## Tools
Helpful tools for moodle development: 
* adminer
* moodle plugin upgradedb (https://moodle.org/plugins/local_upgradedb)
    Unzip it into local/ folder in your Moodle.
* grunt is the official moodle task runner used her for maintanance and deployment tasks
  - cd to the plugin folder
  - install grunt: `npm install`
  - run grunt: `grunt` 
* php compose
* install ffmpeg on server

## Update from github
* cd to moodle/mod/videodatabase
* Update the code: `git fetch --all && git reset --hard origin/master`

## Known issues
* Browser console error: "no define call ...": The amd/dist folder is empty or not up to date. In development mode javascript should be loaded from amd/src. Therefore, open config.php in the moodle root and add the line `$CFG->cachejs = false;` before `require_once(__DIR__ . '/lib/setup.php');`
* `grunt uglify` fails, because it doesn't support ES6. A replacement is needed.

# Related Moodle plugins
* https://moodle.org/plugins/mod_videofile
* https://moodle.org/plugins/mod_mediagallery
* https://docs.moodle.org/26/en/mod/videofile/view#Download
* https://moodle.org/plugins/repository_ensemble
* https://moodle.org/plugins/mod_eduplayer
