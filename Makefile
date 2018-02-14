# This target aims to update a remote plugin from github
update: sudo git fetch --all && sudo git reset --hard origin/oldmaster
