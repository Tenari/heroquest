// Methods related to lobbies

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Lobbies } from './lobbies.js';
import { Quests } from '/imports/api/quests/quests.js';
import { Characters } from '/imports/api/characters/characters.js';

Meteor.methods({
  'lobbies.insert'(qId) {
    const quest = Quests.findOne(qId);
    if (!quest) throw 'wtf';
    const lobby = Lobbies.findOne({questId: qId, creatorId: Meteor.userId()});
    if (lobby) return lobby._id;

    return Lobbies.insert({ // returns lId
      questId: qId,
      creatorId: Meteor.userId(),
      party: [],
      createdAt: new Date(),
      name: 'unnamed party',
    })
  },
  'lobbies.rename'(lId, name){
    const lobby = Lobbies.findOne({_id: lId, creatorId: Meteor.userId()});
    if (!lobby) throw 'wtf no lobby found';

    return Lobbies.update(lId, {$set: {name: name}});
  },
  'lobbies.join'(lId, cId) {
    const lobby = Lobbies.findOne(lId);
    if (!lobby) throw 'wtf no lobby found';
    if (_.contains(lobby.party,cId)) throw 'wtf you\'re already in the party duude';
    if (lobby.full()) throw 'party full';
    const character = Characters.findOne({_id: cId, inGame: false, userId: Meteor.userId()});
    if (!character) throw 'invalid character';

    return Lobbies.update(lId, {$push: {party: cId}});
  },
  'lobbies.remove'(lId){
    const lobby = Lobbies.findOne({_id: lId, creatorId: Meteor.userId()});
    if (!lobby) throw 'wtf no lobby found';

    return Lobbies.remove(lId);
  },
})
