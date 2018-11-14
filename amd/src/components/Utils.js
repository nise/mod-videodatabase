/**
 * Javascript utils for the Moodle videodatabase
 *
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Utils
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 */
define(['jquery', 'core/ajax'], function ($, ajax) {

    Utils = function () {

        /**
         * Obtains data from a moodle webservice
         * @param {*} ws: Name of the web service 
         * @param {*} method: GET or POST 
         * @param {*} params: Parameter to transfer 
         * @param {*} cb: Callback function 
         */
        this.get_ws = function (ws, method, params, cb) {
            console.log('mod_' + ws)

            /*ajax.call([{
                methodname: 'mod_videodatabase_pluginname',
                args: { courseid:2 },
                done: function(e){ console.log(e); },
                fail: function (e) { console.log(e); }
            }]);*/
            ajax.call([{
                methodname: 'mod_' + ws,
                args: { data: params },
                done: function (msg) { 
                    if (msg.hasOwnProperty('exception')) {
                        $('#alert')
                            .html('Die Prozedur ' + ws + ' konnte nicht als Webservice geladen werden.<br>')
                            .append(JSON.stringify(msg));
                    } else {
                        cb(msg);
                    }
                 },
                fail: function (e) { console.log(888); console.log(e); }
            }]);
        };

    
        /**
         * 
         */
        this.siteBoundaries = function () {
            var overflowing = [];
            var createXPathFromElement = function (e) { for (var t = document.getElementsByTagName("*"), a = []; e && 1 == e.nodeType; e = e.parentNode) if (e.hasAttribute("id")) { for (var s = 0, l = 0; l < t.length && (t[l].hasAttribute("id") && t[l].id == e.id && s++ , !(s > 1)); l++); if (1 == s) return a.unshift('id("' + e.getAttribute("id") + '")'), a.join("/"); a.unshift(e.localName.toLowerCase() + '[@id="' + e.getAttribute("id") + '"]') } else if (e.hasAttribute("class")) a.unshift(e.localName.toLowerCase() + '[@class="' + e.getAttribute("class") + '"]'); else { for (i = 1, sib = e.previousSibling; sib; sib = sib.previousSibling)sib.localName == e.localName && i++; a.unshift(e.localName.toLowerCase() + "[" + i + "]") } return a.length ? "/" + a.join("/") : null };
            $(':not(script)').filter(function () {
                return $(this).width() > $(window).width();
            }).each(function () {
                overflowing.push({
                    'xpath': createXPathFromElement($(this).get(0)),
                    'width': $(this).width(),
                    'overflow': $(this).width() - $(window).width()
                });
            });
            console.table(overflowing);
        };
    };

    return Utils;
});