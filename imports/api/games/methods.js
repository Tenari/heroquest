// Methods related to games

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Games } from './games.js';
import { Characters } from '/imports/api/characters/characters.js';
import { Quests } from '/imports/api/quests/quests.js';
import { computeRemainingRandomTreasurePool, xyKey, makeTilesVisible } from '/imports/configs/general.js';
import { MONSTERS } from '/imports/configs/monsters.js';

Meteor.methods({
  'games.insert'(qId, party) {
    const quest = Quests.findOne(qId);
    if (!quest) throw 'wtf';
    _.each(party, function(id){check(id, String);});
    const characters = Characters.find({_id: {$in: party}}).fetch();
    const uid = Meteor.userId();
    if (!_.find(characters, function(character){ return character.userId == uid;})) throw 'wtf'; // one of the party has to belong to the noob who sent this request

    let spawns = [];
    _.each(quest.map, function(tile, key) {
      if (tile.spawn) {
        spawns.push(key);
      }
    })

    let map = makeTilesVisible(quest.map, quest.height, quest.width, spawns);
    map = spawnCharacters(map, characters, spawns);

    gId = Games.insert({
      questId: qId,
      characterIds: party,
      currentTurn: party[0],
      turn: _.find(characters, function(c){return c._id == party[0]}).freshTurn(),
      map: map,
      height: quest.height,
      width: quest.width,
      rooms: quest.rooms,
      randomTreasurePool: computeRemainingRandomTreasurePool(quest.map, quest.rooms, MONSTERS),
      start: new Date(),
      rewards: {},
    })
    _.each(party, function(cId, index){
      Characters.update(cId, {$set: {
        inGame: gId,
      }});
    })
    return gId;
  },
  'games.endTurn'(gId) {
    const game = Games.findOne(gId);
    if (!game) throw 'invalid game id';
    const character = Characters.find({userId: Meteor.userId(), inGame: game._id}).fetch()[0];
    if(!character || character._id != game.currentTurn) throw 'fuck off';
    game.endTurn(Characters);
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
