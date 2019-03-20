import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Quests } from '/imports/api/quests/quests.js';
import { Characters } from '/imports/api/characters/characters.js';
import { Games } from '/imports/api/games/games.js';
import { xyKey, drawPlayerViewOfMap } from '/imports/configs/general.js';
import { MONSTERS } from '/imports/configs/monsters.js';
import './game.html';

Template.Game_play.onCreated(function() {
  const gId = FlowRouter.getParam('gId');
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

Template.Game_play.helpers({
  game() {
    const gId = FlowRouter.getParam('gId');
    return Games.findOne(gId);
  },
  mapHTML() {
    const gId = FlowRouter.getParam('gId');
    const character = Characters.find({userId: Meteor.userId(), inGame: gId}).fetch()[0];
    const game = Games.findOne(gId);
    const characterLocation = game.characterLocation(character._id);

    return game && character && drawPlayerViewOfMap(game.map, game.width, game.height, {height: 8, width: 14}, characterLocation);
  }
})
