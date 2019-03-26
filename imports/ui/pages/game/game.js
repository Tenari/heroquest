import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Quests } from '/imports/api/quests/quests.js';
import { Characters } from '/imports/api/characters/characters.js';
import { Games } from '/imports/api/games/games.js';
import { EventNotices } from '/imports/api/eventNotices/eventNotices.js';
import { drawPlayerViewOfMap} from '/imports/configs/general.js';
import { ACTIONS } from '/imports/configs/actions.js';
import { MONSTERS } from '/imports/configs/monsters.js';
import './game.html';

Template.Game_play.onCreated(function() {
  this.selectingTarget = new ReactiveVar(false);
  const gId = FlowRouter.getParam('gId');

  $('body').on('keypress', keyMove(gId, this));
  var games = this.subscribe('game', gId);
  this.subscribe('characters.game', gId);
  this.subscribe('eventNotices.me', gId);

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
  currentEventNotice() {
    return EventNotices.findOne();
  },
  game() {
    const gId = FlowRouter.getParam('gId');
    return Games.findOne(gId);
  },
  selectingTarget(){
    return Template.instance().selectingTarget.get() ? 'selecting-target' : '';
  },
  mapHTML() {
    const gId = FlowRouter.getParam('gId');
    const character = Characters.findOne({userId: Meteor.userId(), inGame: gId});
    const game = Games.findOne(gId);
    const characterLocation = game && game.characterLocation(character._id);

    return game && character && drawPlayerViewOfMap(game.map, game.width, game.height, {height: 8, width: 14}, characterLocation, game.monsters);
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
  },
  character() {
    const gId = FlowRouter.getParam('gId');
    const game = Games.findOne(gId);
    return Characters.findOne({userId: Meteor.userId(), inGame: gId});
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
    if (action.selectsTarget) {
      instance.selectingTarget.set(action.key);
    } else {
      Meteor.call('characters.action', gId, action.key, null);
    }
  },
  'click .event-notice>button'(e,instance) {
    const redirect = EventNotices.findOne().redirect;
    Meteor.call('eventNotice.viewed', $(e.currentTarget).attr('data-eid'), function(){
      if (redirect) {
        FlowRouter.go(redirect);
      }
    });
  },
  'click .selecting-target .map-tile'(e,instance) {
    const x = parseInt($(e.currentTarget).attr('data-x'));
    const y = parseInt($(e.currentTarget).attr('data-y'));
    const gId = FlowRouter.getParam('gId');
    Meteor.call('characters.action', gId, instance.selectingTarget.curValue, {x:x, y:y});
    instance.selectingTarget.set(false);
  },
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
  }
}
