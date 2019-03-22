// Definition of the games collection

import { Mongo } from 'meteor/mongo';
import { xyKey } from '/imports/configs/general.js';

export const Games = new Mongo.Collection('games');

Games.helpers({
  characterLocation(id){
    let matchKey = '';
    _.find(this.map, function(tile, key) {
      if (tile.character && tile.character._id == id) {
        matchKey = key;
        return true;
      }
      return false
    })
    return {
      x: parseInt(matchKey.split('-')[0]),
      y: parseInt(matchKey.split('-')[1]),
    }
  },
  moveCharacterOnMap(oldLoc, newLoc) {
    const oldKey = xyKey(oldLoc.x, oldLoc.y);
    const newKey = xyKey(newLoc.x, newLoc.y);
    const character = this.map[oldKey].character;
    delete this.map[oldKey].character;
    this.map[newKey].character = character;
    return this.map;
  }
})
