
# Create the list of modules
modules =   lib/jquery-1.9.1.js\
			lib/jquery.ui.core.js\
			lib/jquery.ui.widget.js\
			lib/jquery.ui.mouse.js\
			lib/jquery.ui.position.js\
			lib/jquery.ui.accordion.js\
			lib/jquery.ui.draggable.js\
			lib/jquery.ui.resizable.js\
			lib/jquery.ui.slider.js\
			lib/jquery.ui.tooltip.js\
			lib/jquery.ui.spinner.js\
			lib/jquery.inherit-1.1.1.js\
			lib/jquery.tinysort.js\
			lib/jquery.tooltip.js\
			lib/jquery.spin.js\
			lib/jquery.panzoom.min.js\
			lib/moment.min.js\
			lib/init.js\
			src/vi2.core.observer.js\
			src/vi2.core.log.js\
			src/vi2.core.database.js\
			src/vi2.core.parser.js\
			src/vi2.core.videoplayer.js\
			src/vi2.core.annotated-timeline.js\
			src/vi2.core.clock.js\
			src/vi2.core.metadata.js\
			src/vi2.core.annotation.js\
			src/vi2.core.video-manager.js\
			src/vi2.core.utils.js\
			src/vi2.utils.maintanance.js\
			src/vi2.player.playback-speed.js\
			src/vi2.player.skip-back.js\
			src/vi2.annotation.comments.js\

style =   css/vi2.annotated-timeline.css\
			css/vi2.player.playback-speed.css\
			css/vi2.player.zoom.css\
			css/vi2.player.skip-back.css\
			css/vi2.comments.css\
			css/vi2.videoplayer.css\
							
        
# Bundle all of the modules into vi-two.js
bundle: ${modules}
		cat $^ > vi-two.js
		cp ./vi-two.js ~/Documents/www/moodle/mod/videodatabase/js

style: ${style}
		cat $^ > vi-two.css
		cp ./vi-two.css ~/Documents/www/moodle/mod/videodatabase/css

export: \
	bundle\


#	Compress al of the modules into vi-two.min.js
compress: ${modules}
		cat $^ > vi-two.js
	  java -jar /usr/bin/compiler.jar --js vi-two.js --js_output_file vi-two.min.js
	  

test:	${modules}
	jshint $^ 
	  
	  
		 

