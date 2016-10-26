
# General
system path: ~/Documents/www/moodle/mod/videodatabase


# todo

- Videomanager
 - display video records as table
 - select2 as filter: Mehrfachauswahl bei Lerngruppe/Klassen; Aktivitäten; Päd. Perspektiven;

- Upload
- Videoplayer
- Loging
- Videoannotation 

# tech
- templates, see https://docs.moodle.org/dev/Templates#Blocks_.28Moodle_3.0_onwards.29
 - in PHP: render_from_template($templatename, $context)
- js AMD, see https://docs.moodle.org/dev/Javascript_Modules#Embedding_AMD_code_in_a_page
- xmldb, see https://docs.moodle.org/dev/XMLDB_editor 


# how toupdate the plugin on the server
1. increase the version number @ version.php
2. open http://localhost/moodle/admin/index.php and select upgrade

# System setup
remote:
admin
Wk*iud)l*34

locale:
admin
Qwertz12*




thomas
Sp0rtpl4tz*







# plugins to extend
https://moodle.org/plugins/mod_mediagallery
https://moodle.org/plugins/mod_videofile
	https://docs.moodle.org/26/en/mod/videofile/view#Download
https://moodle.org/plugins/repository_ensemble
https://moodle.org/plugins/mod_eduplayer



# Server
## Setup
https://docs.moodle.org/26/en/Step-by-step_Installation_Guide_for_Ubuntu#Step_4:_Download_Moodle

**install mysql**
sudo apt-get install mysql-server
sudo mysql_secure_installation
mysqld --initialize


## Maintainance
**updates**
- install: `sudo apt-get install unattended-upgrades`
- configure type of update and blacklists: `sudo vi /etc/apt/apt.conf.d/50unattended-upgrades`
- set chron job `sudo vi /etc/apt/apt.conf.d/10periodic`

**backup**
- barcula
https://help.ubuntu.com/lts/serverguide/bacula.html
https://www.digitalocean.com/community/tutorials/how-to-back-up-an-ubuntu-14-04-server-with-bacula
- rsync, see https://help.ubuntu.com/community/rsync#Grsync
sudo rsync --dry-run --delete -azvv -e ssh /home/path/folder1/ remoteuser@remotehost.remotedomain:/home/path/folder2

**log watch**
- check for errors
- check for low disk space
- check for demaged applications







#Stundennachweis

hours	date	task
2	2016-04-06	Angebotserstellung & Kooperationsaushandlung
1 2016-04-17	Angebotsübearbeitung
1 2016-07-29	Planung
2 2016-08-12	Servereinrichtung, moodle Installation
2 2016-08-31	Systemeinrichtung Lokal; Projektmanagement, Plugin-Recherche
3 2016-09-23	Pluginaufbau und Tests für Javascript und CSS Integration
3 2016-09-24	Pluginaufbau und Tests für Javascript und CSS Integration
























# Trash / Backup

## Categories
### Fachbezogene Kompetenzen
Bewegen und Handeln
Reflektieren und Urteilen
Interagieren
Methoden anwenden

## Hauptkategorien
### Bewegungsfelder
Laufen, Springen, Werfen, Stoßen
Spiele
Bewegung an Geräten
Kämpfen nach Regeln
Bewegungsfolgen gestalten und darstellen
Bewegen im Wasser
Fahren, Rollen, Gleiten

### Aktivitäten:
Abbauen
Aufbauen
Begründen
Beraten
Beschreiben
Besprechen
Beurteilen
Demonstrieren
Disziplinieren
Erklären
Feedback, Korrektur
Gesprächsrunde
Gruppenbildung
Helfen
Kooperieren
Medieneinsatz
Motivieren
Organisieren
Präsentieren
Sichern
Störung
Üben

### Akteure:
Lehrer/in
Schüler/in

### Pädagogische Perspektiven
Leistung
Wagnis
Gestaltung
Körpererfahrung
Kooperation
Gesundheit

### Ort:
Sporthalle
Schwimmhalle
Outdoor

### Lerngruppe:
Klassenstufe 1
Klassenstufe 2
Klassenstufe 3
Klassenstufe 4
Klassenstufe 5
Klassenstufe 6
Klassenstufe 7
Klassenstufe 8
Klassenstufe 9
Klassenstufe 10
Klassenstufe 11
Klassenstufe 12
Klassenstufe 13 
Eingangsstufe
Unterstufe
Mittelstufe
Werkstufe


