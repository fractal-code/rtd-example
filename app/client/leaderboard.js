/*global Template, Players, Session */

Template.leaderboard.helpers({
    players: function () {
        'use strict';
        return Players.find({}, {sort: {score: -1, name: 1}});
    },
    selected_name: function () {
        'use strict';
        var player = Players.findOne(Session.get("selected_player"));
        return player && player.name;
    }
});

Template.player.helpers({
    selected: function () {
        'use strict';
        return Session.equals("selected_player", this._id) ? "selected" : '';
    }
});

Template.leaderboard.events({
    'click input.inc': function () {
        'use strict';
        Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
});

Template.player.events({
    'click': function () {
        'use strict';
        Session.set("selected_player", this._id);
    }
});