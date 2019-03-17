import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { CARICATURES } from '/imports/configs/caricatures.js'
import './newCharacter.html';

import '/imports/ui/components/dropdown/dropdown.js';

Template.newCharacter.onCreated(function(){
  const that = this;

  this.name = new ReactiveVar(null);
  this.selection = new ReactiveVar(_.keys(CARICATURES)[0]);
  if (!Meteor.userId()) {
    FlowRouter.go('App.home');
  }
})

Template.newCharacter.helpers({
  canCreateCharacter(){
    const instance = Template.instance();
    const name = instance.name.get();
    return name.length > 0;
  },
  caricatures() {
    return _.values(CARICATURES);
  },
  selectedCharacter(){
    const instance = Template.instance();
    return CARICATURES[instance.selection.get()];
  },
  isSelected(key) {
    const instance = Template.instance();
    return instance.selection.get() == key ? 'selected' : false;
  },
})

Template.newCharacter.events({
  'keyup input.character-name'(e, instance){
    instance.name.set(e.currentTarget.value);
  },
  'mouseenter/click .character-option'(e,instance){
    instance.selection.set($(e.currentTarget).attr('data-key'));
  },
  'click button.submit-character'(e, instance) {
    e.preventDefault();
    Meteor.call('characters.insert', instance.name.get(), instance.selection.get(), (error) => {
      if (error) {
        alert(error.error);
      } else {
        FlowRouter.go('App.home');
      }
    });
  }
})
