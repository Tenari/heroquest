import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Quests } from '/imports/api/quests/quests.js';
import { xyKey } from '/imports/configs/general.js';
import { MONSTERS } from '/imports/configs/monsters.js';
import './quest.html';

Template.Quest_show.onCreated(function() {
  let qId = FlowRouter.getParam('qId');
  this.quest = new ReactiveVar(null);
  if (qId) {
    var quests = this.subscribe('quest', qId);
    this.autorun(() => {
      if (quests.ready()) {
        let quest = Quests.findOne(qId);
        if (!quest || !Meteor.userId() || !quest.published) {
          FlowRouter.go('/');
        }
        console.log(quest);
        this.quest.set(quest);
      }
    })
  }
})

Template.Quest_show.helpers({
  quest() {
    return Template.instance().quest.get();
  },
})
