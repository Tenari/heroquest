// Methods related to quests

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Quests } from './quests.js';
import { Characters } from '../characters/characters.js';
import { EventNotices } from '../eventNotices/eventNotices.js';
import { EventLogs } from '../eventLogs/eventLogs.js';
//import { CR_TO_XP, roll, abilityModifier, advantageRoll } from '../../configs/general.js';


Meteor.methods({
  'quests.insert'(name, details) {
    const userId = Meteor.userId();
    if (!userId) throw 'wtf, log in bro'; //you gotta be logged in
    check(name, String);
    return Quests.insert({
      creatorId: userId,
      published: false,
      name,
      height: details.height,
      width: details.width,
      map: details.map,
      desc: details.desc,
      createdAt: new Date(),
    });
  },
  'quests.update'(id, details){
    const quest = Quests.findOne(id);
    if (quest.creatorId != Meteor.userId() || quest.published) throw 'can only edit your own stuff, man, and it has to be un-published';
    return Quests.update(id, {
      $set: {
        name: details.name,
        height: details.height,
        width: details.width,
        map: details.map,
        desc: details.desc,
      }
    });
  },
  'quests.command'(qId, command) {
    const quest = Quests.findOne(qId);
    var tokens = command.split(' ');
    /*
       A list of commands you might want to be able to do while creating a quest
    */
    if (tokens[0] == 'add') {
      if (tokens[1] == 'wall' && tokens[2] && tokens[3]) {
        var objects = encounter.objects || [];
        objects.push({type: 'wall', x: parseInt(tokens[2]), y: parseInt(tokens[3])})
        Encounters.update(eid, {$set: {objects: objects}});
      } else if (tokens[1] == 'character' && tokens[2] && tokens[3] && tokens[4]) {
        let character = Characters.findOne(tokens[2]);
        var characterLocations = _.reject(encounter.characterLocations || [], function(loc){ return loc.characterId == tokens[2];});
        characterLocations.push({characterId: tokens[2], x: parseInt(tokens[3]), y: parseInt(tokens[4]), type: 'character', img: character.klass});
        Encounters.update(eid, {$set: {characterLocations: characterLocations}});
      } else if (tokens[1] == 'monster' && tokens[2] && tokens[3] && tokens[4]) {
        let monsterTemplate = MonsterTemplates.findOne(tokens[2]);
        if (!monsterTemplate) throw 'wtf';
        let klass = monsterTemplate.name.toLowerCase().split(' ').join('-');
        let monsterCharacterId = Characters.insert({
          gameId: encounter.gameId,
          name: monsterTemplate.name,
          klass: klass,
          race: monsterTemplate.type,
          alignment: monsterTemplate.alignment,
          hp: monsterTemplate.hit_points,
          hp_max: monsterTemplate.hit_points,
          xp: CR_TO_XP[""+monsterTemplate.challenge_rating],
          str: monsterTemplate.strength,
          con: monsterTemplate.constitution,
          dex: monsterTemplate.dexterity,
          inte: monsterTemplate.intelligence,
          wis: monsterTemplate.wisdom,
          cha: monsterTemplate.charisma,
          inspiration: false,
          ac: monsterTemplate.armor_class,
          speed: parseInt(monsterTemplate.speed) / 5,
          gender: "male",
          wealth: 1,
          proficiencies: {},
          languages: [ "common" ],
          items: [ ],
          equippedItems: [],
          effects: [],
          monsterTemplateId: tokens[2],
        })
        var characterLocations = encounter.characterLocations || [];
        characterLocations.push({characterId: monsterCharacterId, x: parseInt(tokens[3]), y: parseInt(tokens[4]), type: 'character', img: klass});
        Encounters.update(eid, {$set: {characterLocations: characterLocations}});
      }
    } else if (tokens[0] == 'remove') {
      if (tokens[1] == 'wall' && tokens[2] && tokens[3]) {
        const x = parseInt(tokens[2]);
        const y = parseInt(tokens[3]);
        var objects = _.reject(encounter.objects || [], function(object) { return object.x == x && object.y == y && object.type == 'wall'});
        Encounters.update(eid, {$set: {objects: objects}});
      } else if (tokens[1] == 'character' && tokens[2] && tokens[3]) {
        const x = parseInt(tokens[2]);
        const y = parseInt(tokens[3]);
        var characterLocations = _.reject(encounter.characterLocations || [], function(loc) { return loc.x == x && loc.y == y});
        Encounters.update(eid, {$set: {characterLocations: characterLocations}});
      }
    } else if (tokens[0] == 'set') {
      if (tokens[1] == 'mode' && tokens[2]) {
        Encounters.update(eid, {$set: {mode: tokens[2]}});
      }
    } else if (tokens[0] == 'roll') {
      if (tokens[1] == 'initiative') {
        let turns = _.chain(encounter.characterLocations)
          .map(function(loc){ return Characters.findOne(loc.characterId)})
          .select(function(character) {return character;})
          .map(function(character){return {_id: character._id, roll: -1 * character.rollInitiative()}})
          .sortBy('roll')
          .pluck('_id')
          .value();
        let firstCharacter = Characters.findOne(turns[0]);
        Encounters.update(eid, {$set: {currentTurn: 0, turnOrder: turns, moveStats: {movesLeft: firstCharacter.speed, hasActed: false}}});
        Characters.find({_id: {$in: turns}, userId: {$exists: true}}).forEach(function(character){
          let index = _.indexOf(turns, character._id) + 1;
          if (index == 1) {
            index += 'st';
          } else if (index == 2) {
            index += 'nd';
          } else if (index == 3) {
            index += 'rd';
          } else {
            index += 'th';
          }
          EventNotices.insert({gameId: encounter.gameId, userId: character.userId, message: 'Initiative rolled, you are '+index+ ' to go.'});
        })
      }
    } else if (tokens[0] == 'attack') {
      const x = parseInt(tokens[1]);
      const y = parseInt(tokens[2]);
      const cid = encounter.turnOrder[encounter.currentTurn];
      const opponentId = _.find(encounter.characterLocations, function(loc){ return loc.x == x && loc.y == y}).characterId;

      meleeAttack(encounter._id, cid, opponentId);
    } else if (tokens[0] == 'npcaction') {
      const action = tokens[1];
      const cid = encounter.turnOrder[encounter.currentTurn];
      const monster = Characters.findOne(cid);
      const monsterTemplate = MonsterTemplates.findOne(monster.monsterTemplateId);

    } else if (tokens[0] == 'end' && tokens[1] == 'turn') {
      endTurn(eid);
    } else if (tokens[0] == 'move') {
      let currentLocation = encounter.currentCharacterLocation();
      currentLocation.x = parseInt(tokens[1]);
      currentLocation.y = parseInt(tokens[2]);
      let otherLocations = _.reject(encounter.characterLocations, function(loc){return loc.characterId == currentLocation.characterId});
      otherLocations.push(currentLocation);
      Encounters.update(eid, {$set: {characterLocations: otherLocations}});
    }
  },
});
