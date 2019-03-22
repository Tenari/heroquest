import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Quests } from '/imports/api/quests/quests.js';
import { Characters } from '/imports/api/characters/characters.js';
import { Games } from '/imports/api/games/games.js';
import { drawPlayerViewOfMap, ACTIONS } from '/imports/configs/general.js';
import { MONSTERS } from '/imports/configs/monsters.js';
import './game.html';

Template.Game_play.onCreated(function() {
  this.selectingDirection = new ReactiveVar(false);
  this.directionResponse = function(){};
  const gId = FlowRouter.getParam('gId');

  $('body').on('keypress', keyMove(gId, this));
  var games = this.subscribe('game', gId);
  this.subscribe('characters.game', gId);

  this.autorun(() => {
    if (games.ready()) {
      let game = Games.findOne(gId);
      if (!game || !Meteor.userId()) {
        FlowRouter.go('/');
      }
      console.log(game);
    }
  })
})

Template.Game_play.onDestroyed(function(){
  const gId = FlowRouter.getParam('gId');
  $('body').off('keypress', keyMove(gId, this))
})

Template.Game_play.helpers({
  game() {
    const gId = FlowRouter.getParam('gId');
    return Games.findOne(gId);
  },
  mapHTML() {
    const gId = FlowRouter.getParam('gId');
    const character = Characters.findOne({userId: Meteor.userId(), inGame: gId});
    const game = Games.findOne(gId);
    const characterLocation = game && game.characterLocation(character._id);

    return game && character && drawPlayerViewOfMap(game.map, game.width, game.height, {height: 8, width: 14}, characterLocation);
  },
  myTurn(){
    const gId = FlowRouter.getParam('gId');
    const game = Games.findOne(gId);
    const character = Characters.find({userId: Meteor.userId(), inGame: gId}).fetch()[0];
    return game && character && game.currentTurn == character._id;
  },
  canAct() {
    const gId = FlowRouter.getParam('gId');
    const game = Games.findOne(gId);
    return game && !game.turn.hasActed;
  },
  availableActions(){
    const gId = FlowRouter.getParam('gId');
    const game = Games.findOne(gId);
    const character = Characters.find({userId: Meteor.userId(), inGame: gId}).fetch()[0];
    return _.select(ACTIONS, function(action, key){
      return action.test(game, character);
    });
  }
})

Template.Game_play.events({
  'click button.end-turn'(e, instance) {
    const gId = FlowRouter.getParam('gId');
    Meteor.call('games.endTurn', gId);
  },
  'click button.action'(e, instance) {
    const action = ACTIONS[$(e.currentTarget).attr('data-key')];
    const gId = FlowRouter.getParam('gId');
    const character = Characters.findOne({userId: Meteor.userId(), inGame: gId});
    if (action.selectsDirection) {
      instance.selectingDirection.set(action.directions);
      instance.directionResponse = function(direction) {
        instance.selectingDirection.set(false);
        Meteor.call('characters.action', character._id, action.key, {direction});
      }
    } else {
      Meteor.call('characters.action', character._id, action.key, null);
    }
  }
})

function keyMove(gId, instance){
  return function(e) {
    /*  key codes
        w = 119
        s = 115
        d = 100
        a = 97
    */
    const direction = {119: 'north', 115: 'south', 100: 'east', 97: 'west'}[e.keyCode];
    Meteor.call('characters.move', gId, direction);
    if (instance.selectingDirection.curValue) {
      instance.directionResponse(direction);
      instance.directionResponse = function(){};
    }
  }
}
