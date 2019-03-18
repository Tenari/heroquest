import { Characters } from '/imports/api/characters/characters.js';
import { Quests } from '/imports/api/quests/quests.js';
import { Meteor } from 'meteor/meteor';
import './home.html';
import './landing.html';


Template.App_home.onCreated(function () {
  this.subscribe('myCharacters');
  this.subscribe('myQuests');
});

Template.App_home.helpers({
  characters(){
    return Characters.find();
  },
  noCharacters() {
    return Characters.find().count() == 0;
  },
  quests(){
    return Quests.find();
  },
});
