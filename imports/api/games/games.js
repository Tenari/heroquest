// Definition of the games collection

import { Mongo } from 'meteor/mongo';
import { moveAdjacentToLocationAndAttack, manhattanDistance, locationFromKey, xyKey } from '/imports/configs/general.js';

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
  moveMonsterOnMap(oldLoc, newLoc) {
    const oldKey = xyKey(oldLoc.x, oldLoc.y);
    const newKey = xyKey(newLoc.x, newLoc.y);
    const monster = this.map[oldKey].monster;
    delete this.map[oldKey].monster;
    this.map[newKey].monster = monster;
    return this.map;
  },
  endTurn(Characters, EventNotices){
    let game = this;
    let nextTurn = this.characterIds.indexOf(this.currentTurn) + 1;
    if (nextTurn >= this.characterIds.length) {
      nextTurn = 0;
      _.each(this.monsters, function(monster, index){
        if (!monster) return false;

        let myLoc = locationFromKey(_.find(_.keys(game.map),function(key){
          return game.map[key].monster == index;
        }));
        let myTile = game.map[myLoc.key];
        if (!myTile.visible) { // if this monster hasn't been discovered yet
          return false;
        }

        // find the nearest character
        let characterLocations = _.map(
          _.select(_.keys(game.map), function(key){
            return game.map[key].character;
          }), function (key){
            return locationFromKey(key);
          }
        );
        let target = _.sortBy(characterLocations, function(charLoc){ return manhattanDistance(myLoc, charLoc);})[0];
        moveAdjacentToLocationAndAttack(myLoc, target, game, monster, Characters.findOne(game.map[target.key].character._id), monster.move, {Games, Characters, EventNotices});

      })
    }
    Games.update(this._id, {$set: {
      currentTurn: this.characterIds[nextTurn],
      turn: Characters.findOne(this.characterIds[nextTurn]).freshTurn(),
    }});
  },
})
