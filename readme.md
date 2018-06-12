Vi-Moodle is a database, player, and annotation tool for video-based learning resources in moodle.

**System Features:**
* Upload and convert video files
* Comprehensive meta data description of video files (dublin core, pedagogic metadata, technical descriptions)
* Browse and search a video collection
* Having multiple video databases in a course or course module
* Advanced video playback functionionalities (e.g. zoom, speed, loop, skip back)
* Video annotations (e.g. comments)
* User rating per video

---
# Installation
Tested with Moodle v3.3

## Install depenencies
[Video Upload Manager](https://github.com/nise/php-video-upload-chain)

## Configure the webserver
**Apache2**
Open `/etc/php/7.0/apache2/php.ini` and set `upload_max_filesize = 500M` and `post_max_size = 500M`

**moodledata**
In order to support the file workflow the permissions of the moodledata folder need to be set as follow:
* `chown -R www-data:www-data /path/to/moodledata`
* `cmod -R 0750 /path/to/moodledata`

**nginx**
...


## Configure Moodle webservices
Please follow the instuction and substitute your domain or install location whenever `http://localhost/moodle` is mentioned.

1. Enable webservices (default: no): http://localhost/moodle/admin/search.php?query=enablewebservices
2. Enable REST protocol: http://localhost/moodle/admin/settings.php?section=webserviceprotocols
3. Enable the Moodle mobile webservice: http://localhost/moodle/admin/webservice/service.php?id=1
3. Create a token for you as a user for the "Moodle mobile webservice": http://localhost/moodle/admin/webservice/tokens.php?action=create
4. Copy the token (e.g. 877512a5499809b1925f83d6894bf998)
5. Install the plugin and paste the token when adding a new videodatabase to a course

## Install the plugin
* Change directory to the moodle plugin folder: `cd to the moodle/mod`
* Clone the repository: `git clone https://github.com/nise/vi-moodle`
* Rename the plugin folder: `mv vi-moodle videodatabase`
* Now you can add the videodatabase as an activity to your course. During this setup you are required to enter the Moodle webservice token.

---
# Development
## Tools
Helpful tools for moodle development: 
* adminer
* moodle plugin upgradedb (https://moodle.org/plugins/local_upgradedb)
    Unzip it into local/ folder in your Moodle.


## Update from github
* cd to moodle/mod/videodatabase
* Update the code: `git fetch --all && git reset --hard origin/master`


# Related Moodle plugins
* https://moodle.org/plugins/mod_mediagallery
* https://moodle.org/plugins/mod_videofile
* https://docs.moodle.org/26/en/mod/videofile/view#Download
* https://moodle.org/plugins/repository_ensemble
* https://moodle.org/plugins/mod_eduplayer
