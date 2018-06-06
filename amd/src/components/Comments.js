/**
 * Javascript Video for the Moodle videodatabase
 * 
 * The component lists all user comments
 * 
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Comments
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 * 
 * 
 */

define([
    'jquery',
    '/moodle/mod/videodatabase/amd/src/lib/vue.js',
    '/moodle/mod/videodatabase/amd/src/components/Utils.js',
    'js/moment-with-locales.min.js'
], function ($, Vue, Utils, moment) {
    
  

    function Comments(store, course, user, token, utils) {
        this.store = store;
        this.course = course;
        this.user = user;
console.log(utils);
        
        

        var _this = this;

        this.comments = {
            template: '#app-comments-template',
            data: function () {
                return {
                    all_comments: []
                };
            },
            methods: {
                moment : function(t){
                    return moment(Number(t), "x").fromNow();
                }
            },
            created: function () {
                var _this = this;
                utils.get_ws('videodatabase_annotations', 'POST', { courseid: course.id }, function (msg) {
                    try {
                        var d = JSON.parse(msg.data);
                        _this.all_comments = Object.keys(d).map(function (o) { return d[o]; });
                        console.log(_this.all_comments);
                    } catch (e) {
                        console.log('Could not parse comments from database');
                        console.log(msg);
                    }
                }); 
            }
            
        };
    }

    return Comments;
});   