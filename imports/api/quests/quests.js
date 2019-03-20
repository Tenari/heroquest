// Definition of the encounters collection

import { computeDifficulty } from '/imports/configs/general.js';
import { MONSTERS } from '/imports/configs/monsters.js';
import { Mongo } from 'meteor/mongo';

export const Quests = new Mongo.Collection('quests');

Quests.helpers({
  difficulty() {
    return computeDifficulty(this, MONSTERS);
  },
  maxPlayers() {
    let count = 0;
    _.each(this.map, function(tile, key) {
      if (tile.spawn) {
        count += 1;
      }
    })
    return count;
  },
})
