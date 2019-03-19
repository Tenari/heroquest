// All encounters-related publications

import { Meteor } from 'meteor/meteor';
import { Quests } from './quests.js';

Meteor.publish('quests', function () {
  return Quests.find({published: true});
});
Meteor.publish('myQuests', function () {
  return Quests.find({creatorId: this.userId});
});
Meteor.publish('quest', function (id) {
  return Quests.find({_id: id});
});

