import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import './newQuest.html';

Template.newQuest.onCreated(function(){
  this.name = new ReactiveVar(null);
  this.width = new ReactiveVar(26);
  this.height = new ReactiveVar(20);
  this.mode = new ReactiveVar(null);
  this.commandHistory = new ReactiveVar([]);
  this.commandHistoryLocation = new ReactiveVar(1);
})

Template.newQuest.helpers({
  height(){
    return Template.instance().height.get();
  },
  width(){
    return Template.instance().width.get();
  },
  rows() {
    const width = Template.instance().width.get();
    let rows = [];
    _.times(Template.instance().height.get(), function(){
      let row = [];
      _.times(width, function(){
        row.push({})
      })
      rows.push(row);
    })
    return rows;
  },
  mode(){
    return Template.instance().mode.get();
  },
})

Template.newQuest.events({
  'change input.name'(e, instance) {
    instance.name.set(e.currentTarget.value);
  },
  'change input.width'(e, instance) {
    instance.width.set(parseInt(e.currentTarget.value));
  },
  'change input.height'(e, instance) {
    instance.height.set(parseInt(e.currentTarget.value));
  },
  'keyup input.cmd'(e, instance) {
    if (e.keyCode == 13) { // Enter
      const command = $(e.currentTarget).val();
      var history = instance.commandHistory.curValue;
      history.push(command);
      instance.commandHistory.set(history);
      instance.commandHistoryLocation.set(1);
      if (command.split(' ')[0] == 'ls') {
        instance.ls.set(command.split(' ')[1]);
      } else {
        Meteor.call('encounters.command', FlowRouter.getParam('eid'), command, function(error) {});
      }
      $(e.currentTarget).val('');
    } else if (e.keyCode == 38) { // ArrowUp
      const index = instance.commandHistory.curValue.length - instance.commandHistoryLocation.curValue;
      if(index < 0) return null;
      $(e.currentTarget).val(instance.commandHistory.curValue[index]);
      instance.commandHistoryLocation.set(instance.commandHistoryLocation.curValue + 1);
    } else if (e.keyCode == 40) { // ArrowDown
      const index = instance.commandHistory.curValue.length - instance.commandHistoryLocation.curValue + 2;
      if(index > instance.commandHistory.curValue.length) return null;
      $(e.currentTarget).val(instance.commandHistory.curValue[index]);
      instance.commandHistoryLocation.set(instance.commandHistoryLocation.curValue - 1);
    }
  },
})
