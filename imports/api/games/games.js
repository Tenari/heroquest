// Definition of the games collection

import { Mongo } from 'meteor/mongo';
import { locationFromKey, xyKey } from '/imports/configs/general.js';

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
    return locationFromKey(matchKey);
  },
  moveCharacterOnMap(oldLoc, newLoc) {
    const oldKey = xyKey(oldLoc.x, oldLoc.y);
    const newKey = xyKey(newLoc.x, newLoc.y);
    const character = this.map[oldKey].character;
    delete this.map[oldKey].character;
    this.map[newKey].character = character;
    return this.map;
  },
  endTurn(Characters){
    let nextTurn = this.characterIds.indexOf(this.currentTurn) + 1;
    if (nextTurn >= this.characterIds.length) {
      // TODO: monsters take a turn
      nextTurn = 0;
    }
    Games.update(this._id, {$set: {
      currentTurn: this.characterIds[nextTurn],
      turn: Characters.findOne(this.characterIds[nextTurn]).freshTurn(),
    }});
  },
})
