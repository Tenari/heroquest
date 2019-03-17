// Methods related to eventNotices

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { EventNotices } from './eventNotices.js';

Meteor.methods({
  'eventNotice.viewed'(eId){
    EventNotices.remove(eId);
  }
});

