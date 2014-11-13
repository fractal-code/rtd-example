/*global Meteor, Players, Random */
Meteor.startup(function () {
    'use strict';
    var i, names;
    if (Players.find().count() === 0) {
        names = ["Ada Lovelace",
            "Grace Hopper",
            "Marie Curie",
            "Carl Friedrich Gauss",
            "Nikola Tesla",
            "Claude Shannon"];
        for (i = 0; i < names.length; i += 1) {
            Players.insert({name: names[i], score: Math.floor(Random.fraction() * 10) * 5});
        }
    }
});
