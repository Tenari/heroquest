// Methods related to characters

import { Meteor } from 'meteor/meteor';
import { Characters } from './characters.js';
import { Games } from '/imports/api/games/games.js';
import { EventNotices } from '/imports/api/eventNotices/eventNotices.js';
import { CARICATURES } from '/imports/configs/caricatures.js';
import { MONSTERS } from '/imports/configs/monsters.js';
import { TRAPS } from '/imports/configs/traps.js';
import { makeTilesVisible, adjacentLocations, adjacentBoundaryLocations, xyKey } from '/imports/configs/general.js';
import { ACTIONS } from '/imports/configs/actions.js';

Meteor.methods({
  'characters.insert'(name, key) {
    const caricature = CARICATURES[key];
    if (!Meteor.userId() || !name || !_.isString(name) || !caricature) return false; // can only make a character if you are signed in, and submitted a name, and a valid key
    return Characters.insert({
      userId: Meteor.userId(),
      name,
      key,

      mind: caricature.mind,
      mindMax: caricature.mind,
      body: caricature.body,
      bodyMax: caricature.body,
      dead: false,

      baseAttack: caricature.attack,
      attack: caricature.attack,
      baseAccuracy: caricature.accuracy,
      accuracy: caricature.accuracy,
      baseDefense: caricature.defense,
      defense: caricature.defense,
      baseDeflection: caricature.deflection,
      deflection: caricature.deflection,
      baseMove: caricature.move,
      move: caricature.move,
      
      cp: 0,
      sp: 0,
      gp: 0,

      inGame: false,
      completedGames: [],
    });
  },
  'characters.move'(gId, direction) {
    let game = Games.findOne(gId);
    if (!game) throw 'invalid game id';
    if (new Date(game.lastMovedAt) >= (new Date() - 200)) return false; // too fast of moving. only one move per 200ms
    if (game.turn.moves < 1) return false; // no movement left

    const character = Characters.find({userId: Meteor.userId(), inGame: game._id}).fetch()[0];
    if (!character) throw 'no character to move exists, brah';
    if (game.currentTurn != character._id) return false; // not your turn

    const oldLoc = game.characterLocation(character._id);
    const newLoc = adjacentLocations(oldLoc)[direction];
    const newTile = game.map[newLoc.key];
    const nextBoundary = adjacentBoundaryLocations(oldLoc)[direction];
    const nextBoundaryTile = game.map[nextBoundary.key];
    if (nextBoundaryTile){
      // there is a door in the users way
      if (nextBoundaryTile[nextBoundary.direction+'Door']) {
        if (!nextBoundaryTile[nextBoundary.direction+'DoorOpen']) { // user is attempting to open a door
          return openDoor(oldLoc, nextBoundary, game, Games);
        }
      // there is an open SecretDoor in the user's way
      } else if (nextBoundaryTile[nextBoundary.direction+'SecretDoorOpen']) {
        // do nothing; you can pass through here
      // there is a wall in the user's way
      } else if (nextBoundaryTile[nextBoundary.direction+'Wall']) {
        return false;
      }
    }

    // if new newLoc is invalid for any number of other reasons, return false;
    if (newLoc.x < 0 ||newLoc.y < 0 ||
        newLoc.x >= game.width || newLoc.y >= game.height)  return false; // cant walk out of the boundaries
    if (newTile && _.isNumber(newTile.monster)) return false; // cant walk through monsters

    // if the user is stepping on the exit, this is different
    if (newTile && newTile.exit) {
      return exitGame(game, character, {Games, Characters, EventNotices});
    }

    let turn = game.turn;
    turn.moves -= 1;
    Games.update(gId, {$set: {map: game.moveCharacterOnMap(oldLoc, newLoc), turn: turn, lastMovedAt: new Date()}}, function(){
      // user is stepping on a trap! like a noob.
      if (newTile && newTile.trap) {
        return TRAPS[newTile.trap].trigger(newLoc, Games.findOne(gId), character, {Games, Characters, EventNotices});
      }
    });

  },
  'characters.action'(gId, actionKey, params) {
    const game = Games.findOne(gId);
    if (!game) throw 'invalid game id';
    const character = Characters.findOne({userId: Meteor.userId(), inGame: gId});
    if (!character) throw 'no character found, brah';
    const action = _.find(ACTIONS, function(action, key){
      return key == actionKey;
    })
    if (game.currentTurn == character._id && action.test(game, character)) {
      action.perform(game, character, params, {Games, Characters, MONSTERS, EventNotices});
    }

  },
});

function openDoor(charLoc, doorLoc, game, Games) {
  game.map[doorLoc.key][doorLoc.direction+'DoorOpen'] = true;
  game.map = makeTilesVisible(game.map, game.height, game.width, [xyKey(charLoc.x, charLoc.y)]);
  game.turn.moves -= 1;
  return Games.update(game._id, {$set: {map: game.map, turn: game.turn}});
}

function exitGame(game, character, collections) {
  collections.Characters.update(character._id, {$set: {
    mind: character.mindMax,
    body: character.bodyMax,
    inGame: false,
    cp: character.cp + (game.rewards.cp || 0),
    sp: character.sp + (game.rewards.sp || 0),
    gp: character.gp + (game.rewards.gp || 0),
  }, $push: {completedGames: game._id}});

  game.endTurn(collections.Characters, collections.EventNotices);
  const charLoc = game.characterLocation(character._id); 
  game.map[charLoc.key].character = null; //remove the character from the map
  collections.Games.update(game._id, {$set: {map: game.map}, $pull: {characterIds: character._id}});

  collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'You have exited the dungeon!', redirect: '/'});
}

