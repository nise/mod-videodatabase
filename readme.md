Vi-moodle is a video database, player, and video annotation tool for moodle.

**System Features:**
* Upload and convert video files
* Browse and search a video collection
* Having multiple video databases in a course or course module
* Advanced video playback functionionalities (e.g. zoom, speed, loop, skip back)
* comprehensive meta data description of video files (dublin core, pedagogic metadata, technical descriptions)
* Video annotations (e.g. comments)
* User rating per video

# Installation
Tested with Moodle v3.x
## Install the plugin
* Change directory to the moodle plugin folder: `cd to the moodle/mod`
* Clone the repository: `git clone https://github.com/nise/vi-moodle`
* Rename the plugin folder: `mv vi-moodle videodatabase`

## Install depenencies
[Video Upload Manager](https://github.com/nise/php-video-upload-chain)

## Configure the webserver
**Apache2**
Open `/etc/php/7.0/apache2/php.ini` and increase `upload_max_filesize = 500M` and `post_max_size = 500M`

**nginx**
...

# Development
## Tools
Helpful tools for moode development: 
* adminer
* moodle plugin upgradedb (https://moodle.org/plugins/local_upgradedb)
    Unzip it into local/ folder in your Moodle.
    
## Update from github
* cd to the moodle/mod/videodatabase
* Update the code: `git fetch --all && git reset --hard origin/master`


# Related Moodle plugins
* https://moodle.org/plugins/mod_mediagallery
* https://moodle.org/plugins/mod_videofile
* https://docs.moodle.org/26/en/mod/videofile/view#Download
* https://moodle.org/plugins/repository_ensemble
* https://moodle.org/plugins/mod_eduplayer
