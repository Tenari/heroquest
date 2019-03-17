// All eventNotices-related publications

import { Meteor } from 'meteor/meteor';
import { EventNotices } from './eventNotices.js';

Meteor.publish('eventNotices.me', function (gameId) {
  if (!this.userId) return this.ready();

  return EventNotices.find({gameId, userId: this.userId});
});

Meteor.publish('eventNotices.game', function (gameId) {
  if (!this.userId) return this.ready();

  return EventNotices.find({gameId});
});
