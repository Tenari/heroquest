// Methods related to characters

import { Meteor } from 'meteor/meteor';
import { Characters } from './characters.js';
import { CARICATURES } from '/imports/configs/caricatures.js';

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
  'characters.move'(cId, direction) {
    const character = Characters.findOne(cId);
    if (!character.userId == Meteor.userId()) throw 'you cant move this character';
    //TODO move the character
  }
});
