import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Quests } from '/imports/api/quests/quests.js';
import { Characters } from '/imports/api/characters/characters.js';
import { xyKey } from '/imports/configs/general.js';
import { MONSTERS } from '/imports/configs/monsters.js';

import '/imports/ui/components/dropdown/dropdown.js';
import './playQuest.html';

// this template serves as the menu/lobby system for creating a party to do a quest
Template.Quest_play.onCreated(function() {
  let qId = FlowRouter.getParam('qId');
  this.quest = new ReactiveVar(null);
  this.party = new ReactiveVar([]);
  if (qId) {
    var quests = this.subscribe('quest', qId);
    var characters = this.subscribe('myCharacters');
    this.autorun(() => {
      if (quests.ready()) {
        let quest = Quests.findOne(qId);
        if (!quest || !Meteor.userId() || !quest.published) {
          FlowRouter.go('/');
        }
        console.log(quest);
        //window.q = quest;
        this.quest.set(quest);
      }
    })
  }
})

Template.Quest_play.helpers({
  quest() {
    return Template.instance().quest.get();
  },
  characterChoices() {
    return _.map(Characters.find({dead: false, inGame: false}).fetch(), function(character){
      return {value: character._id, label: character.name+' ('+character.caricatureName()+')'};
    });
  },
  partyCount() {
    return Template.instance().party.get().length;
  },
  party() {
    const party = Template.instance().party.get();
    return Characters.find({_id: {$in: party}});
  },
  canStartQuest() {
    const instance = Template.instance();
    const party = instance.party.get();
    const quest = instance.quest.get();
    return party && party.length > 0 && party.length <= quest.maxPlayers();
  },
})

Template.Quest_play.events({
  'click button.add-me'(e, instance) {
    let party = instance.party.curValue;
    party[0] = $('.character-choice').val();
    instance.party.set(party);
  },
  'click button.start-game'(e, instance) {
    const qId = FlowRouter.getParam('qId');
    Meteor.call('games.insert', qId, instance.party.get(), function(error, result) {
      FlowRouter.go('/game/'+result);
    });
  },
})
