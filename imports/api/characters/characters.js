// Definition of the Characters collection
// a Character record stores the current state of a character. This includes stats, hp, items, effects, actions, etc. The game logic is responsible for mutating this data correctly. The character object does not know when to remove an effect like blindness. The character will remain blind until some other aspect of the game un-blinds it.
// monsters/npcs are just character objects without a userId set

import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { CARICATURES } from '/imports/configs/caricatures.js';

export const Characters = new Mongo.Collection('characters');

Characters.schema = new SimpleSchema({
  gameId: {type: String},
  userId: {type: String},
  name: {type: String},
  race: {type: String},
  klass: {type: String},
  str: {type: Number},
  con: {type: Number},
  dex: {type: Number},
  inte: {type: Number},
  wix: {type: Number},
  cha: {type: Number},
})

Characters.helpers({
  caricature() {
    return CARICATURES[this.key];
  },
  caricatureName() {
    return this.caricature().name;
  },
  freshTurn() {
    return {
      moves: this.baseMove,
      hasActed: false,
    }
  }
})
