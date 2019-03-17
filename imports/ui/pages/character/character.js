import { Characters } from '/imports/api/characters/characters.js';
import './character.html';

Template.character_sheet.onCreated(function(){
  this.cId = FlowRouter.getParam('cid');
  if (this.cId) {
    var characters = this.subscribe('characters.id', this.cId);
    this.character = new ReactiveVar(null);
    this.autorun(() => {
      if (characters.ready()) {
        if (!Characters.findOne(this.cId) || !Meteor.userId()) {
          FlowRouter.go('/');
        }
        this.character.set(Characters.findOne(this.cId));
      }
    })
  }
})

Template.character_sheet.helpers({
  character() {
    return Template.instance().character.get();
  },
})
