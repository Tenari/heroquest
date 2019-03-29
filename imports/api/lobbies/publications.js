import { Meteor } from 'meteor/meteor';
import { Lobbies } from './lobbies.js';

Meteor.publish('lobbies.quest', function (qId) {
  return Lobbies.find({
    questId: qId
  });
});
