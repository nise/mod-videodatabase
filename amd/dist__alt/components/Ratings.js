/**
 * Javascript Ratings for the Moodle videodatabase
 * 
 * The component takes user ratings for a video and calculated the Wilson coefficient by considering the previous positive and negative ratings. A user is only allowed to vote once on a video.
 * 
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Ratings
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 * @notes
 *  http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
 * http://julesjacobs.github.io/2015/08/17/bayesian-scoring-of-ratings.html
 * In your case calculating mean is simple. It is the mean of ratings itself. Assume p1 is the fraction of 1-star rating, p2,..., p5. p1+p2+...+p5 = 1. And assume you are calculating these stats using n samples. mean of your data is 1*p1+2*p2+...+5*p5.
 * The variance of your data is ( E(x^2)-(E(x))^2 )/n = ( (p1*1^2 + p2*2^2..+p5*5^2) - (1*p1+2*p2+..+5*p5)^2 )/n
 * Since std = sqrt(var), it is pretty straightforward to calculate Normal approximation interval. I will let you work on extending this to WCI.             
 * 
 */

define([
    'jquery',
    'core/log',
    'amd/src/lib/vue.js',
    'amd/src/components/Utils.js'
], function ($, log, Vue, Utils) {

    function Ratings(store, course, user) {

        const utils = new Utils();
        
        this.ratings = {
            template: '#rating',
            props: {
                value: { type: [Number, String] },
                name: { type: String, default: 'rate' },
                length: { type: Number },
                showcount: { type: Boolean, default: false },
                required: { type: Boolean },
                ratedesc: { type: Array, default() { return [] } },
                disabled: { type: Boolean, default: false },
                readonly: { type: Boolean, default: false },
                ov: { type: Number, default: 0 } // xxx remove
            },
            data: function () {
                return {
                    over: 0,
                    hover:0,
                    rate: 0
                };
            },
            computed: {
                currentvideo: function () {
                    return store.state.currentVideo;
                }
            },
            methods: { 
                /**
                 * Sets a vote given by the user 
                 * @param {*} index The rating on the given scale
                 */
                setRate(index) {
                    var _this = this;
                    if (index === undefined || index === null) { return; }

                    this.userHasRatedVideo(function(hasRated) {
                        this.disabled = hasRated;
                        this.readonly = hasRated;
                        if (!hasRated) {
                            //if (_this.rate !== index) {
                            _this.$emit('beforeRate', _this.rate);
                            //var data = store.getters.currentVideoData();
                            _this.storeRating(index, function (e) {
                                console.log('A rating was stored to WS: '+index);
                                //_this.$emit('readonly', true); // xxx bug // set readonly after giving a vote
                            });
                            _this.calcVideoRating();
                            //}
                            _this.rate = index;
                            _this.$emit('input', _this.rate);
                            _this.$emit('value', _this.rate);
                            _this.$emit('after-rate', _this.rate);
                        }
                    });

                },
                isFilled: function (index) {
                    return index <= this.rate;
                },
                isEmpty: function (index) {
                    return index > this.rate || !this.value && !this.rate;
                },
                /**
                 * Interface for the web service to fetch all existing ratings
                 */
                getRatingsOfVideo: function (videoid, callback) {
                    if(videoid === null){
                        videoid = this.currentvideo
                    }
                    utils.get_ws('videodatabase_ratings', "POST", {
                        'videoid': videoid,
                        'courseid': course.id,
                    }, function (e) {
                        callback(e);
                    }, function (err) {
                        console.error(err);
                    });
                },
                /**
                 * The function fetches the ratings for a particular video, course, and user from the web services. Then, it checks whether the current video has been rated by the user already. The result will be returned as a callback.
                 */
                userHasRatedVideo: function (callback) {
                    var _this = this;
                    utils.get_ws('videodatabase_ratings', "POST", {
                        'videoid': this.currentvideo,
                        'courseid': course.id,
                        'userid': user.id,
                    }, function (e) {
                        var 
                            data = JSON.parse(e.data),
                            hasRated = false
                            ;
                        for(var i in data){
                            if(data.hasOwnProperty(i)){
                                if (
                                    parseInt(data[i].courseid) === parseInt(course.id) && 
                                    parseInt(data[i].videoid) === parseInt(_this.currentvideo) && 
                                    parseInt(data[i].userid) === parseInt(user.id)
                                ){
                                    hasRated = true; 
                                    break;
                                }
                            }
                        } console.log('Has the user rated it already? '+hasRated);
                        callback(0); // xxx hasRated // user has not rated the current video
                    });
                },
                /**
                 * Interface for the web service
                 */
                storeRating: function (rating, callback) {
                    utils.get_ws('videodatabase_ratings', "POST", {
                        'videoid': this.currentvideo,
                        'courseid': course.id,
                        'userid': user.id,
                        'rating': rating
                    }, function (e) {
                        callback(e);
                    }, function (err) {
                        console.log(err);
                    });
                },
                /**
                 * Calculates the resulting rating including the user vote.
                 */
                calcVideoRating: function () {
                    var _this = this;
                    this.getRatingsOfVideo(null, function (e) {
                        //console.log(Object.values(JSON.parse(e.data)))
                        var data = Object.values(JSON.parse(e.data)).map(function (obj) {
                            return obj.rating;
                        });
                        if (data.length > 0) {
                            var positiveRatings = data.filter(function (obj) {
                                return obj > 2 ? true : false;
                            });
                            var avg = data.reduce(function (a, b) { 
                                return Number(a) + Number(b); 
                            }) / data.length;
                            var wilson = _this.wilsonScore(positiveRatings.length, data.length) * 5;
                            console.log(avg, wilson, positiveRatings.length, data.length);
                            store.commit('setCurrentVideoRating', Math.round(wilson));
                            /*
                            if (_this.value >= _this.length) {
                                _this.value = _this.length;
                            } else if (_this.value < 0) {
                                _this.value = 0;
                            }
                            _this.rate = avg;
                            */
                        } else { // xxx why this?
                            _this.rate = _this.value;
                            //_this.over = _this.value;
                        }

                    });
                },
                /**
                 * Calculates the resulting rating including the user vote for a given video.
                 */
                calcRatingOfVideo: function (videoid) {
                    var _this = this;
                    return this.getRatingsOfVideo(videoid, function (e) {
                        var data = Object.values(JSON.parse(e.data)).map(function (obj) {
                            return obj.rating;
                        });
                        if (data.length > 0) {
                            var positiveRatings = data.filter(function (obj) {
                                return obj > 2 ? true : false;
                            });
                            var avg = data.reduce(function (a, b) {
                                return Number(a) + Number(b);
                            }) / data.length;
                            var wilson = _this.wilsonScore(positiveRatings.length, data.length) * 5;
                           return wilson; 
                        } 
                    });
                },
                /**
                 * Algorithm for a balanced overall rating
                 */
                wilsonScore: function (positiveRatings, n) {
                    const z = 1.96; //Statistics2.pnormaldist(1 - (1 - confidence) / 2)
                    const z2 = Math.sqrt(2);
                    const phat = 1.0 * positiveRatings / n;
                    return (phat + z2 / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n)) / (1 + z2 / n);
                }
            },
            created: function () {
                this.calcVideoRating();
            },
            updated: function () {
                var d = store.getters.currentVideoData().rating;
                if (d === undefined) { d = 0; }
                this.rate = d;
                this.$emit('value', d);
            }
        };
    }
    return Ratings;
});