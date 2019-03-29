import { Characters } from '/imports/api/characters/characters.js';
import { Quests } from '/imports/api/quests/quests.js';
import { Meteor } from 'meteor/meteor';
import './home.html';
import './landing.html';


Template.App_home.onCreated(function () {
  this.subscribe('myCharacters');
  this.subscribe('myQuests');
  this.subscribe('quests');
});

Template.App_home.helpers({
  characters(){
    return Characters.find();
  },
  noCharacters() {
    return Characters.find().count() == 0;
  },
  newQuests(){
    return Quests.find({published: false});
  },
  publishedQuests(){
    return Quests.find({published: true});
  },
  characterLink(character){
    if (character.inGame) {
      return '/game/'+character.inGame;
    } else {
      return '/character/'+character._id;
    }
  },
});
