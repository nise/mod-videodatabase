
# todo:
- player and observer interfaces


# General
system path: ~/Documents/www/moodle/mod/videodatabase
MOODLE version 3.3 !!
3818e7aa87466e01d5a14235b01dd221

d32db1e.online-server.cloud
217.160.28.237
Iz7iTZriBe

remote:
machinables
Wk*iud)l*34u78

db skUi*kGoqmPG87sr#ekl
moodle jksh78+jd-82KHGv

locale:
admin
Qwertz12*


thomas
Sp0rtpl4tz*


#backlog
https://huboard.com/nise/vi-moodle/
https://github.com/nise/vi-moodle/issues


# Thomas todo
- Nutzungsbedingungen
- Einwilligungserklärung
- Datenschutzerklärung


# how to update the plugin on the server
1. increase the version number @ version.php
2. open http://localhost/moodle/admin/index.php and select upgrade

# System setup



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


