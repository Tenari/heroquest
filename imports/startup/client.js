import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../ui/layouts/body/body.js';
import '../ui/pages/home/home.js';
import '../ui/pages/character/character.js';
import '../ui/pages/newCharacter/newCharacter.js';
import '../ui/pages/newQuest/newQuest.js';
import '../ui/pages/quest/quest.js';
import '../ui/pages/playQuest/playQuest.js';
import '../ui/pages/game/game.js';
import '../ui/pages/not-found/not-found.js';

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'App_home' });
  },
});
FlowRouter.route('/character/new', {
  name: 'Character.new',
  action() {
    BlazeLayout.render('App_body', { main: 'newCharacter' });
  },
});
FlowRouter.route('/character/:cid', {
  name: 'Character.show',
  action() {
    BlazeLayout.render('App_body', { main: 'character_sheet' });
  },
});
FlowRouter.route('/quest/new', {
  name: 'Quest.new',
  action() {
    BlazeLayout.render('App_body', { main: 'newQuest' });
  },
});
FlowRouter.route('/quest/:qId', {
  name: 'Quest.show',
  action() {
    BlazeLayout.render('App_body', { main: 'Quest_show' });
  },
});
FlowRouter.route('/quest/:qId/play', {
  name: 'Quest.play',
  action() {
    BlazeLayout.render('App_body', { main: 'Quest_play' });
  },
});
FlowRouter.route('/game/:gId', {
  name: 'Game.play',
  action() {
    BlazeLayout.render('App_body', { main: 'Game_play' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
