// Definition of the lobbies collection

import { Mongo } from 'meteor/mongo';
import { Quests } from '/imports/api/quests/quests.js';
//import { xyKey } from '/imports/configs/general.js';

export const Lobbies = new Mongo.Collection('lobbies');

Lobbies.helpers({
  full(){
    const quest = Quests.findOne(this.questId);
    return this.party.length >= quest.maxPlayers();
  },
  spacesOpen(){
    return !this.full();
  },
})
