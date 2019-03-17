// All items-related publications

import { Meteor } from 'meteor/meteor';
import { Items } from './items.js';

Meteor.publish('items.all', function () {
  return Items.find();
});
