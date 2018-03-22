
# install

* Change directory to the moodle plugin folder: `cd to the moodle/mod`
* Clone the repository: `git clone https://github.com/nise/vi-moodle`
* Rename the plugin folder: `mv vi-moodle videodatabase`

# update from github

* cd to the moodle/mod/videodatabase
* Update the code: `git fetch --all && git reset --hard origin/master`


# Related Moodle plugins

* https://moodle.org/plugins/mod_mediagallery
* https://moodle.org/plugins/mod_videofile
* https://docs.moodle.org/26/en/mod/videofile/view#Download
* https://moodle.org/plugins/repository_ensemble
* https://moodle.org/plugins/mod_eduplayer


https://moodle.org/plugins/local_upgradedb
     Get last version of plugin in plugin entry.
    Unzip it into local/ folder in your Moodle.
    Be sure that the final name of the directory is: upgradedb, the full path in your Moodle installation will be local/upgradedb

# Apache2

/etc/php/7.0/apache2/php.ini

upload_max_filesize = 500M
post_max_size = 500M


