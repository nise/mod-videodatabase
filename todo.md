
# General
system path: ~/Documents/www/moodle/mod/videodatabase
MOODLE version 3.1.3 !!


#backlog
https://github.com/nise/vi-moodle/issues

# nth

- collaps/expand form groups



# Thomas todo
- Nutzungsbedingungen
- Einwilligungserklärung

# LISIUM / HOST
http://lisum.berlin-brandenburg.de/lisum/

# Fragen zum Server
- Auf was für einem Server ist moodle installiert (Linux / Windows, Version)?
- Wie sieht die Server-Architektur aus (z.B. Load Balancing, Datenbankserver, Firewall)?
- Wie leistungsstark sind die / ist der Server (RAM, CPU)?
- Welche Datenvolumen werden aktuell übertragen bzw. können künftig aufkommen (Videostreaming)?

# Fragen zu moodle
- Welche moodle Version wird verwendet?
- Welches theme ist derzeit installiert?
- Wie intensiv wird das System aktuell genutzt (Anzahl Kurse, Anzahl Nutzer, Logins pro Monat)

# Fragen zur Integration des plugins 'videodatabase'
- Gibt es bereits Erfahrungen mit der Inbetriebnahme von moodle-plugins?
- Besteht derzeit ein Testsystem auf dem Updates, neue themes und plugins vor dem Produktiveinsatz getestet werden können?
- Wie sieht das Verfahren aus, um ein neues plugin zum Einsatz im Produktivsystem zu überführen (Tests, Anforderungen, ...)?
- Wer ist Ansprechpartner für technische Fragen (Administration, Server, Updates) zum moodle-System? 




# bugs


# tech
- templates, see https://docs.moodle.org/dev/Templates#Blocks_.28Moodle_3.0_onwards.29
 - in PHP: render_from_template($templatename, $context)
- js AMD, see https://docs.moodle.org/dev/Javascript_Modules#Embedding_AMD_code_in_a_page
- xmldb, see https://docs.moodle.org/dev/XMLDB_editor 


# how to update the plugin on the server
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


# todo server
https://docs.moodle.org/31/en/MySQL_full_unicode_support


#Kommentarfunktion


1. Zeitlicher Bezug
**done**	- Zeitpunkt
	- Zeitabschnitt

2. Repräsentation im Videobild
**done**	- nicht sichtbar (nur auf der Zeitachse abgetragen —> z.B. mit einem kleinen gelben Strich auf einer roten Zeitleiste; ähnlich YouTube?)
**done**	- Punkt (x,y), i.d.R. mit Icon
**done(Rechteck)** 	- Fläche beliebiger Form und Farbe (z.B. Rechtecke, Pfeile, Rahmen, …) —> hier sind Pfeile ausreichend

3. Zeitleiste im Player
	- keine Darstellung der Kommentare (nicht zu empfehlen)
	- Darstellung je Klassifikation
**done**	- allgemeine Darstellung ohne Klassifikation

4. Klassifikation der Kommentare
**done, sofern Klassifizierung vorliegt**	- nach Kommentartypen (z.B. Bemerkung, Frage, …)
	- Titel des Kommentars (z.B. Störung des Unterrichts)
	- nach Relevanz / Dringlichkeit / …

5. Kommentardarstellung
**done**	- im Videobild an der betreffenden Position, falls vorhanden
**done**	- neben dem Videobild ohne Referenz auf die Position im Videobild mit teilweisen Inhalt
**done**- auf der Zeitleiste als Tooltip mit vollständigen oder teilweisen Inhalt

6. Kommentarinhalte
**done**	- reiner Text
**nth:**	- Hypertext (inkl. Links, Bilder, Formatierung) als WYSIWYG-Editor
	- reiner Text + Links + minimale Formatierungen (z.B. mit Markdown)
**nth:**	- weitere Medien
**nth:**	- Promts ~ Vorgabe von Satzanfängen, um die Diskussion zu lenken

7. Kommentarfunktion
**done**	- Verknüpfung des Kommentars mit Zeitpunkt im Video und Möglichkeit, über das Kommentar direkt in die Stelle im Video springen zu können

8. Berechtigung
	- persönlicher Kommentar
**nth:**	- Gruppen-interner Kommentar
**done**	- Kommentar für alle registrierten Nutzer

9. Diskussion
**done**	- Antwortkommentare zulassen
	- up / down voting von Kommentaren mit Einfluss auf die Sortierung
	- rating (1-5 Sterne)

10. Moderation
**done**	- Kommentare werden sofort freigegeben (mit der Option, Kommentare melden zu können)
	- Kommentare werden durch Moderator freigegeben (mit einer Mitteilung an den Moderator, dass eine Kommentierung vorgenommen wurde)	
**nth:**	- nur die Kommentare von positiv bewerteten Nutzern werden sofort freigegeben

11. Ansichten für Admin
	- Liste der Kommentare je Video / Kategorie / User / Datum / Typ von Video

12. Aufgabenstellungen für die einzelnen Videosequenzen im Video
	- Darstellung vordefinierter Arbeitsaufgaben zur Arbeit mit den Videos (ähnlich Edubreak) 







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


