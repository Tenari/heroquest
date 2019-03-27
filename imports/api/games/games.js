// Definition of the games collection

import { Mongo } from 'meteor/mongo';
import { moveTowardsTarget, attackCharacter, adjacentLocations, manhattanDistance, locationFromKey, xyKey } from '/imports/configs/general.js';

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
      Games.update(this._id, {$set: {currentTurn: 'monsters'}}, function(){
        moveMonsters(game._id, 0, null, {Games, Characters, EventNotices}, function(){
          Games.update(game._id, {$set: {
            currentTurn: game.characterIds[0],
            turn: Characters.findOne(game.characterIds[0]).freshTurn(),
          }});
        });
      });
    } else {
      Games.update(this._id, {$set: {
        currentTurn: this.characterIds[nextTurn],
        turn: Characters.findOne(this.characterIds[nextTurn]).freshTurn(),
      }});
    }
  },
})

function moveMonsters(gId, index, movesLeft, collections, cb) {
  let game = collections.Games.findOne(gId);
  const monster = game.monsters[index];
  if (game.monsters.length <= index) return cb();
  if (!monster) return moveMonsters(gId, index+1, null, collections, cb);

  if (!_.isNumber(movesLeft)) movesLeft = monster.move;
  if (movesLeft <= 0) return moveMonsters(gId, index+1, null, collections, cb);

  let myLoc = locationFromKey(_.find(_.keys(game.map), function(key){
    return game.map[key].monster == index;
  }));
  let myTile = game.map[myLoc.key];
  if (!myTile.visible) { // if this monster hasn't been discovered yet
    return moveMonsters(gId, index+1, null, collections, cb);
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

  if (_.contains(_.pluck(_.values(adjacentLocations(target)), 'key'), myLoc.key)) { //adjacent to opponent
    const character = collections.Characters.findOne(game.map[target.key].character._id);
    attackCharacter(character, monster, game, collections, function(){
      moveMonsters(gId, index+1, null, collections, cb);
    });
  } else {
    moveTowardsTarget(myLoc, target, game, collections, function(){
      Meteor.setTimeout(function(){
        moveMonsters(gId, index, movesLeft-1, collections, cb);
      }, 200);
    });
  }
}
