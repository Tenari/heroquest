// Register your apis here

import '../api/games/methods.js';
import '../api/games/publications.js';

import '../api/quests/methods.js';
import '../api/quests/publications.js';

import '../api/lobbies/methods.js';
import '../api/lobbies/publications.js';

import '../api/characters/methods.js';
import '../api/characters/publications.js';

import '../api/eventNotices/methods.js';
import '../api/eventNotices/publications.js';

import '../api/eventLogs/publications.js';

// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
});
