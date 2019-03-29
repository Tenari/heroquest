import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import { Quests } from '/imports/api/quests/quests.js';
import { Games } from '/imports/api/games/games.js';
import { Lobbies } from '/imports/api/lobbies/lobbies.js';
import { Characters } from '/imports/api/characters/characters.js';

import { xyKey } from '/imports/configs/general.js';
import { MONSTERS } from '/imports/configs/monsters.js';

import '/imports/ui/components/dropdown/dropdown.js';
import './playQuest.html';

// this template serves as the menu/lobby system for creating a party to do a quest
Template.Quest_play.onCreated(function() {
  const qId = FlowRouter.getParam('qId');
  this.quest = new ReactiveVar(null);
  this.mode = new ReactiveVar(null);
  this.lId = new ReactiveVar(null);
  this.subscribe('myCharacters');
  this.subscribe('games.all');
  if (qId) {
    var lobbies = this.subscribe('lobbies.quest', qId);
    var quests = this.subscribe('quest', qId);
    this.autorun(() => {
      if (quests.ready()) {
        let quest = Quests.findOne(qId);
        if (!quest || !Meteor.userId() || !quest.published) {
          FlowRouter.go('/');
        }
        this.quest.set(quest);
      }
      if (lobbies.ready()) {
        this.subscribe('characters.lobby', Lobbies.findOne(this.lId.get()));
        const myLobby = Lobbies.findOne({creatorId: Meteor.userId(), questId: qId})
        if (myLobby) {
          this.mode.set('new-party');
          this.lId.set(myLobby._id);
        }
        if (this.lId.get() && !Lobbies.findOne(this.lId.get())){
          const game = Games.findOne({originatingLobbyId: this.lId.get()});
          if (game) {
            FlowRouter.go('/game/'+game._id);
          }
        }
      }
    })
  }
})

Template.Quest_play.helpers({
  quest() {
    return Template.instance().quest.get();
  },
  mode(key){
    return Template.instance().mode.get() == key;
  },
  characterChoices() {
    return _.map(Characters.find({dead: false, inGame: false}).fetch(), function(character){
      return {value: character._id, label: character.name+' ('+character.caricatureName()+')'};
    });
  },
  partyCount() {
    const lobby = Lobbies.findOne(Template.instance().lId.get());
    return lobby && lobby.party.length;
  },
  party() {
    const lobby = Lobbies.findOne(Template.instance().lId.get());
    return lobby && Characters.find({_id: {$in: lobby.party}});
  },
  canStartQuest() {
    const instance = Template.instance();
    const lobby = Lobbies.findOne(instance.lId.get());
    const quest = instance.quest.get();
    return lobby && lobby.party.length > 0 && lobby.party.length <= quest.maxPlayers();
  },
  lobby(){
    return Lobbies.findOne(Template.instance().lId.get());
  },
  lobbies() {
    return Lobbies.find();
  }
})

Template.Quest_play.events({
  'click button.add-me'(e, instance) {
    Meteor.call('lobbies.join', instance.lId.curValue, $('.character-choice').val())
  },
  'click button.start-game'(e, instance) {
    const qId = FlowRouter.getParam('qId');
    Meteor.call('games.insert', qId, instance.lId.get(), function(error, result) {
      FlowRouter.go('/game/'+result);
    });
  },
  'click button.new-party'(e, instance){
    const qId = FlowRouter.getParam('qId');
    Meteor.call('lobbies.insert', qId, function(error, lId){
      if (!error) {
        instance.lId.set(lId);
        instance.mode.set('new-party');
      }
    })
  },
  'change/keyup input.party-name'(e, instance) {
    Meteor.call('lobbies.rename', instance.lId.curValue, $(e.currentTarget).val());
  },
  'click button.join-party'(e, instance) {
    instance.mode.set('join-party');
    Meteor.call('lobbies.remove', instance.lId.curValue); // this will fail if the lId is not owned by you, but that's okay
  },
  'click ul.parties>li'(e, instance){
    instance.lId.set($(e.currentTarget).attr('data-id'));
    instance.mode.set('party-details');
  },
})
