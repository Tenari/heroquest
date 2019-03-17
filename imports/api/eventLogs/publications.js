// All eventLogs-related publications

import { Meteor } from 'meteor/meteor';
import { EventLogs } from './eventLogs.js';

Meteor.publish('eventLogs.encounter', function (encounterId) {
  if (!this.userId) return this.ready();

  return EventLogs.find({encounterId});
});
