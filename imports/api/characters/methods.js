// Methods related to characters

import { Meteor } from 'meteor/meteor';
import { Characters } from './characters.js';
import { Games } from '/imports/api/games/games.js';
import { CARICATURES } from '/imports/configs/caricatures.js';
import { xyKey, ACTIONS } from '/imports/configs/general.js';

Meteor.methods({
  'characters.insert'(name, key) {
    const caricature = CARICATURES[key];
    if (!Meteor.userId() || !name || !_.isString(name) || !caricature) return false; // can only make a character if you are signed in, and submitted a name, and a valid key
    return Characters.insert({
      userId: Meteor.userId(),
      name,
      key,

      sanity: caricature.sanity,
      sanityMax: caricature.sanity,
      health: caricature.health,
      healthMax: caricature.health,
      dead: false,

      baseAttack: caricature.attack,
      baseDefense: caricature.defense,
      baseMove: caricature.move,
      
      cp: 0,
      sp: 0,
      gp: 0,

      inGame: false,
    });
  },
  'characters.move'(gId, direction) {
    const game = Games.findOne(gId);
    if (!game) throw 'invalid game id';
    const character = Characters.find({userId: Meteor.userId(), inGame: game._id}).fetch()[0];
    if (!character) throw 'no character to move exists, brah';
    const oldLoc = game.characterLocation(character._id);
    let newLoc = {x: oldLoc.x, y: oldLoc.y};

    var tile;
    switch(direction) {
      case 'north':
        newLoc.y -= 1;
        tile = game.map[xyKey(newLoc.x, newLoc.y)];
        if (checkTileWallsAndDoors(tile, 'bottom')) return false;
        break;
      case 'south':
        newLoc.y += 1;
        tile = game.map[xyKey(newLoc.x, newLoc.y-1)];
        if (checkTileWallsAndDoors(tile, 'bottom')) return false;
        break;
      case 'east':
        newLoc.x += 1;
        tile = game.map[xyKey(newLoc.x-1, newLoc.y)];
        if (checkTileWallsAndDoors(tile, 'right')) return false;
        break;
      case 'west':
        newLoc.x -= 1;
        tile = game.map[xyKey(newLoc.x, newLoc.y)];
        if (checkTileWallsAndDoors(tile, 'right')) return false;
        break;
      default:
        // code block
    }

    // if new newLoc is invalid for any number of other reasons, return false;
    if (newLoc.x < 0 ||newLoc.y < 0 ||
        newLoc.x >= game.width || newLoc.y >= game.height)  return false; // cant walk out of the boundaries
    if (game.currentTurn != character._id) return false; // not your turn
    if (game.turn.moves < 1) return false; // no movement left

    let turn = game.turn;
    turn.moves -= 1;
    Games.update(gId, {$set: {map: game.moveCharacterOnMap(oldLoc, newLoc), turn: turn}});
  },
  'characters.action'(cId, actionKey, params) {
    const character = Characters.findOne({userId: Meteor.userId(), _id: cId});
    if (!character) throw 'no character found, brah';
    const game = Games.findOne(character.inGame);
    if (!game) throw 'invalid game id';
    const action = _.find(ACTIONS, function(action, key){
      return key == actionKey;
    })
    if (action.test(game, character)) {
      action.perform(game,character, params, {Games, Characters});
    }

  },
});

// returns true if walls or doors WERE blocking your move
function checkTileWallsAndDoors(tile, direction) {
  if (tile) {
    if (tile[direction+'Door']) {
      if (!tile[direction+'DoorOpen']) return true;
    } else if (tile[direction+'Wall']) {
      return true;
    }
  }
  return false;
}
