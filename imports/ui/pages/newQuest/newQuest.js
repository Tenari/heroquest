import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Quests } from '/imports/api/quests/quests.js';
import './newQuest.html';

Template.newQuest.onCreated(function(){
  this.name = new ReactiveVar(null);
  this.width = new ReactiveVar(26);
  this.height = new ReactiveVar(20);

  // format => {"x-y": {rightWall: true, bottomWall: true, spawn: true, rubble: true, rightDoor: true, bottomDoor: true}}
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
        $('textarea.description').val(quest.desc);
      }
    })
  }

  this.commandHistory = new ReactiveVar([]);
  this.commandHistoryLocation = new ReactiveVar(1);
  this.currentHoverLocation = new ReactiveVar(null);
  this.mode = new ReactiveVar(null);
  this.MODES = {
    'add wall': "adding walls (ctrl + mouseover to add)",
    'rm wall': "removing walls (ctrl + mouseover to remove)",
    'add spawn': 'adding spawn location (click on tile)',
    'rm spawn': 'removing spawn location (click on tile)',
    'add rubble': 'adding rubble (click tile)',
    'rm rubble': 'removing rubble (click tile)',
    'add goblin': 'adding goblin (click tile)',
    'rm goblin': 'removing goblin (click tile)',
    'add door': 'adding door (click border)',
    'rm door': 'removing door (click border)',
    'add secretdoor': 'adding secret door (click border)',
    'rm secretdoor': 'removing secret door (click border)',
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
  },
  currentHoverLocation(){
    const instance = Template.instance();
    const loc = instance && instance.currentHoverLocation.get();
    return loc && ("("+loc.x+","+loc.y+")");
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
  'mouseenter/click .map-border'(e, instance) {
    const mode = instance.mode.get();
    const add = mode.split(' ')[0] == 'add';
    const detail = mode.split(' ')[1];

    if (detail == 'wall' && e.ctrlKey) {
      const type = $(e.currentTarget).attr('data-type');
      setMapAttribute(e, instance, type+'Wall', add);
    }
    if (detail == 'door' && e.type == 'click') {
      const type = $(e.currentTarget).attr('data-type');
      setMapAttribute(e, instance, type+'Door', add);
    }
    if (detail == 'secretdoor' && e.type == 'click') {
      const type = $(e.currentTarget).attr('data-type');
      setMapAttribute(e, instance, type+'SecretDoor', add);
    }
  },
  'click .map-tile'(e, instance) {
    const mode = instance.mode.get();
    const add = mode.split(' ')[0] == 'add';
    const detail = mode.split(' ')[1];

    if (detail == 'spawn' || detail == 'rubble' || detail == 'goblin') {
      setMapAttribute(e, instance, detail, add);
    }
  },
  'mouseenter .map-tile'(e, instance) {
    const x = $(e.currentTarget).attr('data-x');
    const y = $(e.currentTarget).attr('data-y');
    instance.currentHoverLocation.set({x: x, y: y});
  },
  'click button.save'(e, instance) {
    let qId = FlowRouter.getQueryParam('qId');
    if (qId) {
      Meteor.call('quests.update', qId, {
        name: instance.name.get(),
        height: instance.height.get(),
        width: instance.width.get(),
        map: instance.map.get(),
        desc: $('textarea.description').val(),
      }, function(error) {
        console.log(error);
      });
    } else {
      Meteor.call('quests.insert', instance.name.get(), {
        height: instance.height.get(),
        width: instance.width.get(),
        map: instance.map.get(),
        desc: $('textarea.description').val(),
      }, function(error, result) {
        FlowRouter.setQueryParams({qId: result});
      });
    }
  },
})

function xyKey(x, y) {
  return ""+x+"-"+y;
}

function setMapAttribute(e, instance, attribute, value) {
  const x = $(e.currentTarget).attr('data-x');
  const y = $(e.currentTarget).attr('data-y');
  const key = xyKey(x, y);
  let map = instance.map.get();
  if (!map[key]) map[key] = {};
  map[key][attribute] = value;
  instance.map.set(map);
}

function drawMap(map, width, height) {
  let result = "";
  for (let y = 0; y < height; y++) {
    result += "<div class='map-row'>";
      for (let x = 0; x < width; x++) {
        let key = xyKey(x, y);
        let classes = classNames({'map-tile': true, rubble: map[key] && map[key].rubble, goblin: map[key] && map[key].goblin});
        result += '<div class="'+classes+'" data-x="'+x+'" data-y="'+y+'">';
          if (map[key] && map[key].spawn) {
            result += 'x';
          }
        result += '</div>';
        result += '<div class="'+classNames({'map-border':true, wall: map[key] && map[key].rightWall})+'" data-x="'+x+'" data-y="'+y+'" data-type="right">';
          if (map[key] && map[key].rightDoor) {
            result += '<div class="right-door"></div>';
          }
          if (map[key] && map[key].rightSecretDoor) {
            result += '<div class="right-secret-door"></div>';
          }
        result += '</div>';
      }
    result += "</div>";
    result += "<div class='map-border-row'>";
      for (let x = 0; x < width; x++) {
        let key = xyKey(x, y);
        result += '<div class="'+classNames({'map-border':true, wall: map[key] && map[key].bottomWall})+'" data-x="'+x+'" data-y="'+y+'" data-type="bottom">';
          if (map[key] && map[key].bottomDoor) {
            result += '<div class="bottom-door"></div>';
          }
          if (map[key] && map[key].bottomSecretDoor) {
            result += '<div class="bottom-secret-door"></div>';
          }
        result += '</div>';
      }
    result += "</div>";
  }
  return result;
}

function classNames(obj){
  let str = '';
  _.each(obj, function(val, className) {
    if (val) {
      str += (className + ' ');
    }
  })
  return str;
}
