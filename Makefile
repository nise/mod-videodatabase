# This target aims to update a remote plugin from github
update: git fetch --all && git reset --hard origin/master
