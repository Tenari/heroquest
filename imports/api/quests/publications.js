// All encounters-related publications

import { Meteor } from 'meteor/meteor';
import { Quests } from './quests.js';

Meteor.publish('quests', function () {
  return Quests.find({});
});

