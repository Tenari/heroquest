import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Quests } from '/imports/api/quests/quests.js';
import './newQuest.html';

Template.newQuest.onCreated(function(){
  this.name = new ReactiveVar(null);
  this.width = new ReactiveVar(26);
  this.height = new ReactiveVar(20);

  // format => {"x-y": {walls:{right: true, bottom: true}}}
  this.map = new ReactiveVar({});

  let qId = FlowRouter.getQueryParam('qId');
  if (qId) {
    var quests = this.subscribe('quest', qId);
    this.autorun(() => {
      if (quests.ready()) {
        let quest = Quests.findOne(qId);
        if (!quest || !Meteor.userId() || Meteor.userId() != quest.creatorId) {
          FlowRouter.go('/');
        }
        console.log(quest);
        this.name.set(quest.name);
        this.width.set(quest.width);
        this.height.set(quest.height);
        this.map.set(quest.map);
      }
    })
  }

  this.commandHistory = new ReactiveVar([]);
  this.commandHistoryLocation = new ReactiveVar(1);
  this.mode = new ReactiveVar(null);
  this.MODES = {
    'add wall': "adding walls (ctrl + mouseover to add)",
    'rm wall': "removing walls (ctrl + mouseover to remove)",
  };
})

Template.newQuest.helpers({
  name(){
    return Template.instance().name.get();
  },
  height(){
    return Template.instance().height.get();
  },
  width(){
    return Template.instance().width.get();
  },
  mapHTML() {
    const instance = Template.instance();
    const map = instance.map.get();
    const width = instance.width.get();
    const height = instance.height.get();
    return drawMap(map, width, height);
  },
  mode(){
    const instance = Template.instance();
    return instance.MODES[instance.mode.get()];
  },
  canSave() {
    const name = Template.instance().name.get();
    return name && name.length > 0;
  }
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
        //Meteor.call('encounters.command', FlowRouter.getParam('eid'), command, function(error) {});
        instance.mode.set(command);
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
  'mouseenter .map-border'(e, instance) {
    if (instance.mode.get() == 'add wall' && e.ctrlKey) {
      setWall(e, instance, true);
    }
    if (instance.mode.get() == 'rm wall' && e.ctrlKey) {
      setWall(e, instance, false);
    }
  },
  'click button.save'(e, instance) {
    Meteor.call('quests.insert', instance.name.get(), {
      height: instance.height.get(),
      width: instance.width.get(),
      map: instance.map.get(),
      desc: $('textarea.description').val(),
    }, function(error) {
      console.log(arguments);
    });
  },
})

function xyKey(x, y) {
  return ""+x+"-"+y;
}

function setWall(e, instance, value) {
  const x = $(e.currentTarget).attr('data-x');
  const y = $(e.currentTarget).attr('data-y');
  const type = $(e.currentTarget).attr('data-type');
  const key = xyKey(x, y);
  let map = instance.map.get();
  if (!map[key]) map[key] = {};
  if (!map[key].walls) map[key].walls = {};
  map[key].walls[type] = value;

  instance.map.set(map);
}
function drawMap(map, width, height) {
  let result = "";
  for (let y = 0; y < height; y++) {
    result += "<div class='map-row'>";
      for (let x = 0; x < width; x++) {
        let key = xyKey(x, y);
        let tile = map[key];
        let wallRight = tile && tile.walls && tile.walls.right;
        result += "<div class='map-tile'></div>";
        result += '<div class="map-border '+wallRight+'" data-x="'+x+'" data-y="'+y+'" data-type="right"></div>';
      }
    result += "</div>";
    result += "<div class='map-border-row'>";
      for (let x = 0; x < width; x++) {
        let key = xyKey(x, y);
        let tile = map[key];
        let wallBottom = tile && tile.walls && tile.walls.bottom;
        result += '<div class="map-border '+wallBottom+'" data-x="'+x+'" data-y="'+y+'" data-type="bottom"></div>';
      }
    result += "</div>";
  }
  return result;
}
