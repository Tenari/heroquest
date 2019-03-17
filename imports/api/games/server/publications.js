// All games-related publications

import { Meteor } from 'meteor/meteor';
import { Games } from '../games.js';

Meteor.publish('games.all', function () {
  return Games.find();
});
