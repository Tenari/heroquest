// Methods related to games

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Games } from './games.js';
import { Characters } from '/imports/api/characters/characters.js';
import { EventNotices } from '/imports/api/eventNotices/eventNotices.js';
import { Quests } from '/imports/api/quests/quests.js';
import { Lobbies } from '/imports/api/lobbies/lobbies.js';
import { computeRemainingRandomTreasurePool, xyKey, makeTilesVisible } from '/imports/configs/general.js';
import { MONSTERS } from '/imports/configs/monsters.js';

Meteor.methods({
  'games.insert'(qId, lId) {
    const quest = Quests.findOne(qId);
    if (!quest) throw 'wtf';

    const lobby = Lobbies.findOne(lId);
    const uid = Meteor.userId();
    if (!lobby || lobby.creatorId != uid) throw 'go away';

    const party = lobby.party;
    _.each(party, function(id){check(id, String);});
    const characters = Characters.find({_id: {$in: party}}).fetch();
    if (!_.find(characters, function(character){ return character.userId == uid;})) throw 'wtf'; // one of the party has to belong to the noob who sent this request

    let spawns = [];
    _.each(quest.map, function(tile, key) {
      if (tile.spawn) {
        spawns.push(key);
      }
    })
    const treasurePool = computeRemainingRandomTreasurePool(quest.map, quest.rooms, MONSTERS); // this has to be called b4 the monsters are translated from keys to indexes + objects

    let map = makeTilesVisible(quest.map, quest.height, quest.width, spawns);
    map = spawnCharacters(map, characters, spawns);

    // create objects to track monsters state individually
    let monsters = [];
    _.each(map, function(tile, key){
      if (tile.monster) {
        const index = monsters.length;
        monsters.push(MONSTERS[tile.monster]);
        tile.monster = index;
      }
    })

    const gId = Games.insert({
      questId: qId,
      start: new Date(),
      lastMovedAt: new Date(),
      characterIds: party,
      currentTurn: party[0],
      turn: _.find(characters, function(c){return c._id == party[0]}).freshTurn(),
      map: map,
      height: quest.height,
      width: quest.width,
      rooms: quest.rooms,
      randomTreasurePool: treasurePool,
      rewards: {},
      monsters: monsters,
      originatingLobbyId: lId,
    })
    _.each(party, function(cId, index){
      Characters.update(cId, {$set: {
        inGame: gId,
      }});
    })
    Lobbies.remove(lId);
    return gId;
  },
  'games.endTurn'(gId) {
    const game = Games.findOne(gId);
    if (!game) throw 'invalid game id';
    const character = Characters.findOne({userId: Meteor.userId(), inGame: game._id});
    if(!character || character._id != game.currentTurn) throw 'fuck off';
    game.endTurn(Characters, EventNotices);
  },
});

function spawnCharacters(map, characters, spawns){
  _.each(characters, function(character, index){
    const key = spawns[index];
    if (!map[key]) map[key] = {};
    map[key].character = {
      key: character.key,
      _id: character._id,
    };
  })
  return map;
}
