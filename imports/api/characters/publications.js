// All characters-related publications

import { Meteor } from 'meteor/meteor';
import { Characters } from './characters.js';

Meteor.publish('myCharacters', function () {
  if (!this.userId) return this.ready();

  return Characters.find({userId: this.userId});
});
Meteor.publish('characters.id', function (id) {
  if (!this.userId) return this.ready();

  return Characters.find({userId: this.userId, _id: id});
});
Meteor.publish('characters.game', function (gId) {
  if (!this.userId) return this.ready();

  return Characters.find({inGame: gId});
});
