// Methods related to games

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Games } from './games.js';
import { Characters } from '/imports/api/characters/characters.js';
import { Quests } from '/imports/api/quests/quests.js';
import { xyKey, makeTilesVisible } from '/imports/configs/general.js';

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

    let map = makeTilesVisible(quest.map, spawns);
    map = spawnCharacters(map, characters, spawns);

    gId = Games.insert({
      questId: qId,
      characterIds: party,
      map: map,
      height: quest.height,
      width: quest.width,
      start: new Date(),
    })
    _.each(party, function(cId, index){
      Characters.update(cId, {$set: {
        inGame: gId,
      }});
    })
    return gId;
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
