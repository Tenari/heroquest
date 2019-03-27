export function xyKey(x, y) {
  return ""+x+":"+y;
}

export function locationFromKey(key){
  return {
    x: xFromKey(key),
    y: yFromKey(key),
    key: key,
  }
}

export function xFromKey(key) {
  return parseInt(key.split(':')[0]);
}

export function yFromKey(key) {
  return parseInt(key.split(':')[1]);
}

export function borderKey(key, direction) {
  return key+":"+direction;
}

export function borderLocationFromKey(key){
  return {
    x: xFromKey(key),
    y: yFromKey(key),
    key: key,
    direction: key.split(":")[2],
  }
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

export function drawMap(map, width, height) {
  let result = "";
  for (let y = 0; y < height; y++) {
    result += "<div class='map-row'>";
      for (let x = 0; x < width; x++) {
        let key = xyKey(x, y);
        let classObj = {'map-tile': true, rubble: map[key] && map[key].rubble, exit: map[key] && map[key].exit};
        if (map[key] && map[key].monster) {
          classObj[map[key].monster] = true;
        }
        if (map[key] && map[key].trap) {
          classObj[map[key].trap] = true;
        }
        let classes = classNames(classObj);
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
};

export function drawPlayerViewOfMap(map, width, height, viewport, charLoc, monsters) {
  let html = "";
  const viewH = viewport.height;
  const viewW = viewport.width;
  let drawX = parseInt(viewport.width/2) -1;
  let drawY = parseInt(viewport.height/2) -1;

  // (s_x, s_y) represents (0,0) from character's point of view
  let s_x = charLoc.x - drawX;
  let s_y = charLoc.y - drawY;

  // However, we gotta do some edge detection:
  // normal (big) room cases
  // Check if too close to top edge.
  if (charLoc.y <= (drawY-1)) {
    drawY = charLoc.y;
    s_y = 0;
  }
  // Too close to bottom
  else if (charLoc.y > (height - (viewH - drawY-1))) { // rows visible below.
    drawY = viewH - (height - charLoc.y);
    s_y = charLoc.y - drawY;
  }

  // Check if too close to left edge
  if (charLoc.x < drawX) {
    s_x = 0;
    drawX = charLoc.x;
  }
  // right edge
  else if (charLoc.x > (width - (viewW - drawX))) {
    drawX = viewW - (width - charLoc.x);
    s_x = charLoc.x - drawX;
  }

  // small room cases
  if (width <= viewW){
    drawX = charLoc.x;
    s_x = 0;
  }
  if (height <= viewH){
    drawY = charLoc.y;
    s_y = 0;
  }

  var tile, visible;
  for(let i = 0; i < viewH; i++){
    html += "<div class='map-row'>";
      for (let j = 0; j < viewW; j++){
        let key = xyKey(j+s_x, i+s_y);
        tile = map[key];
        visible = tile && tile.visible;
        let visKey = xyKey(j+s_x+1, i+s_y);
        let wallVisible = visible || (map[visKey] && map[visKey].visible);
        let classObj = {
          'map-tile': true,
          rubble: visible && tile.rubble,
          exit: visible && tile.exit,
          'not-visible': !visible,
        };
        if (visible && _.isNumber(tile.monster)) {
          classObj[monsters[tile.monster].key] = true;
        }
        if (visible && tile.trap && tile.trapTriggered) {
          classObj[tile.trap] = true;
        }
        let classes = classNames(classObj);

        html += '<div class="'+classes+'" data-x="'+(j+s_x)+'" data-y="'+(i+s_y)+'">';
          if (visible && tile.character) {
            html += '<div class="character '+tile.character.key+'"></div>';
          }
        html += '</div>';
        html += '<div class="'+classNames({'map-border':true, wall: wallVisible && tile && tile.rightWall})+'">';
          if (wallVisible && tile && tile.rightDoor) {
            html += '<div class="right-door '+(tile.rightDoorOpen ? 'open-door' : '')+'"></div>';
          }
          if (wallVisible && tile && tile.rightSecretDoorOpen) {
            html += '<div class="right-secret-door"></div>';
          }
        html += '</div>';
      }
    html += "</div>";
    html += "<div class='map-border-row'>";
      for (let x = 0; x < viewW; x++) {
        let key = xyKey(x+s_x, i+s_y);
        let visKey = xyKey(x+s_x, i+s_y+1);
        visible = (map[visKey] && map[visKey].visible) || (map[key] && map[key].visible);
        html += '<div class="'+classNames({'map-border':true, wall: visible && map[key] && map[key].bottomWall})+'">';
          if (visible && map[key] && map[key].bottomDoor) {
            html += '<div class="bottom-door '+(map[key].bottomDoorOpen ? 'open-door' : '')+'"></div>';
          }
          if (visible && map[key] && map[key].bottomSecretDoorOpen) {
            html += '<div class="bottom-secret-door"></div>';
          }
        html += '</div>';
      }
    html += "</div>";
  }

  return html;
}

export function computeDifficulty(quest, MONSTERS) {
  let difficulty = 0;
  _.each(quest.map, function(tile, key){
    if (tile.monster) {
      const monster = MONSTERS[tile.monster];
      difficulty += ((2*(monster.attack + monster.defense)) + monster.move + monster.body + monster.mind);
    }
    if (tile.trap) {
      difficulty += 5;
    }
  })
  return difficulty;
}

// returns the total value of treasure for a quest in cp
export function computeTreasure(difficulty) {
  return (difficulty * 2) + 10;
}
export function computeRemainingRandomTreasurePool(map, rooms, MONSTERS) {
  if (!map) return 0;
  const diff = computeDifficulty({map}, MONSTERS);
  let treasure = computeTreasure(diff);
  _.each(rooms, function(room, key) {
    if (room.treasure == 'random') { // do nothing
    } else {
      treasure -= room.treasure;
    }
  })
  return treasure;
}

// locationKeys represent key xy pairs for characters
export function makeTilesVisible(map, height, width, locationKeys) {
  _.each(locationKeys, function(key){
    const x = xFromKey(key);
    const y = yFromKey(key);
    if(!map[key]) map[key] = {};
    map[key].visible = true;
    
    map = checkCardinalDirections(map, height, width, x, y, {});
  })
  return map;
}

function checkCardinalDirections(map, height, width, x, y, alreadyChecked) {
  if(alreadyChecked[xyKey(x,y)]) return map;
  alreadyChecked[xyKey(x,y)] = true;

  //check the 4 cardinal directions
  _.each([
    {checkX: x, checkY: y-1, newX: x, newY: y-1, direction: 'bottom'}, // north
    {checkX: x, checkY: y, newX: x, newY: y+1, direction: 'bottom'},   // south
    {checkX: x, checkY: y, newX: x+1, newY: y, direction: 'right'},    // east
    {checkX: x-1, checkY: y, newX: x-1, newY: y, direction: 'right'},  // west
  ], function(details){
    const checkKey = xyKey(details.checkX, details.checkY);
    const key = xyKey(details.newX, details.newY);
    if (!map[key]) map[key] = {};
    map[key].visible = map[key].visible || borderLocationIsClear(map[checkKey], details.direction);
    if (map[key].visible && details.newY < height && details.newY >= 0 && details.newX < width && details.newX >= 0) {
      map = checkCardinalDirections(map, height, width, details.newX, details.newY, alreadyChecked);
    }
  })

  return map;
}

//returns true if the given borderLocation is NOT blocking normal travel/sight
function borderLocationIsClear(tile, direction) {
  let clear = true;
  if (tile) {
    if (tile[direction+'Door'] && !tile[direction+'DoorOpen']) { // closed door
      clear = false;
    }
    if (tile[direction+'SecretDoor'] && !tile[direction+'SecretDoorOpen']){ // closed secretdoor
      clear = false;
    }
    if (tile[direction+'Wall'] && !tile[direction+'Door'] && !tile[direction+'SecretDoor']){ // wall without a door or secretdppr
      clear = false;
    }
  }
  return clear;
}

// returns a map of location objects that are adjacent to the passed in location or locationKey
export function adjacentLocations(loc){
  var x, y;
  if (_.isString(loc)) { // input is keys
    x = xFromKey(loc);
    y = yFromKey(loc);
  } else { // input is {x,y} objects
    x = loc.x;
    y = loc.y;
  }
  return {
    north: {x:x, y:y-1, key: xyKey(x, y-1)},
    south: {x:x, y:y+1, key: xyKey(x, y+1)},
    east:  {x:x+1, y:y, key: xyKey(x+1, y)},
    west:  {x:x-1, y:y, key: xyKey(x-1, y)}, 
  };
}

// returns a map of location objects that should be checked (for walls/doors/boundaries) from the given loc or locationKey
export function adjacentBoundaryLocations(loc){
  var x, y;
  if (_.isString(loc)) { // input is keys
    x = xFromKey(loc);
    y = yFromKey(loc);
  } else { // input is {x,y} objects
    x = loc.x;
    y = loc.y;
  }
  return {
    north: {x:x, y:y-1, direction: 'bottom', key: xyKey(x, y-1)},
    south: {x:x, y:y, direction: 'bottom', key: xyKey(x, y)}, 
    east:  {x:x, y:y, direction: 'right', key: xyKey(x, y)}, 
    west:  {x:x-1, y:y, direction: 'right', key: xyKey(x-1, y)}
  };
}

// returns a list of locationKeys which identify the unique rooms in the map. Will always at least return ["0-0"]
export function detectRooms(map, width, height) {
  let rooms = {}; // roomkey => borderstring
  let skippable = {};
  _.times(width, function(x) {
    _.times(height, function(y) {
      const currentKey = xyKey(x,y);
      if (skippable[currentKey]) return false;

      const borders = bordersOfRoom(currentKey, {map, width, height}, null, null, true);
      _.each(borders.checked.spaces, function(tru, key){
        skippable[key] = true;
      })
      const borderString = _.keys(borders).sort().join('');
      if (_.contains(_.values(rooms), borderString)) { // the room is already known
        // do nothing
      } else {
        rooms[currentKey] = borderString;
      }
    })
  })
  return _.keys(rooms);
}

export function spacesInRoom(key, map, width, height){
  const borders = bordersOfRoom(key, {map, width, height}, null, null, true);
  return borders.checked.spaces;
}

// returns a map of {borderKey: borderLocations} which makeup the walls+doors that define a room
// let borders = {}, checked = {};
export function bordersOfRoom(roomKey, game, borders, checked, alsoReturnChecked) {
  if (!borders) borders = {};
  if (!checked) checked = {spaces:{}};
  checked.spaces[roomKey] = true;
  const adjLocs = adjacentLocations(roomKey);
  _.each(adjacentBoundaryLocations(roomKey), function(loc, direction){
    const bKey = borderKey(loc.key, loc.direction);
    if (borders[bKey]) return false;
    if (checked[bKey]) return false;
    checked[bKey] = true;
    const adj = adjLocs[direction];

    let tile = game.map[loc.key];
    if (tile && (tile[loc.direction+'Wall'] || tile[loc.direction+'Door'])) {
      borders[bKey] = loc;
    } else if (adj.x < 0 || adj.x >= game.width || adj.y >= game.height || adj.y < 0) {
      // out of bounds, dont do anything more
      borders[bKey] = loc;
    } else {
      borders = bordersOfRoom(adj.key, game, borders, checked, alsoReturnChecked)
    }
  })
  if (alsoReturnChecked) {
    borders.checked = checked;
  }
  return borders;
}

export function rollPercent(prevalence) {
  return Math.random() < prevalence;
}

export function aStar(startLocation, endLocation, game) {
  let first = _.clone(startLocation);
  first.priority = 0;
  let open = [first];
  let costSoFar = {};
  costSoFar[startLocation.key] = 0;

  while (open[0] && open[0].key != endLocation.key) {
    open = _.sortBy(open, function(loc) {return loc.priority;});
    let current = open[0];
    if (current.key == endLocation.key)
      break;
    open = _.rest(open); // the list without the first one

    let validNextMoveDirections = [];
    _.each(adjacentBoundaryLocations(current), function(checkLocation, cardinalDirection){
      let tile = game.map[checkLocation.key]
      if (tile) { // the location has associated data
        if (borderLocationIsClear(tile, checkLocation.direction)) {
          validNextMoveDirections.push(cardinalDirection);
        }
      } else {
        validNextMoveDirections.push(cardinalDirection);
      }
    })
    let nextLocations = adjacentLocations(current);
    _.each(validNextMoveDirections, function(cardinalDirection){
      let next = nextLocations[cardinalDirection];
      let tile = game.map[next.key];
      let stillValid = true;

      // TODO: route around traps with another if condition making them NOT stillValid
      if (next.x < 0 || next.y < 0 || next.x >= game.width || next.y >= game.height) { // out of bounds, not stillValid
        stillValid = false;
      }

      if (stillValid) {
        let newCost = costSoFar[current.key] + 1;
        if (!costSoFar[next.key] || newCost < costSoFar[next.key]) {
          costSoFar[next.key] = newCost;
          next.priority = newCost + manhattanDistance(next, endLocation);
          next.previous = current;
          open.push(next);
        }
      }
    })
  }
  // return first if open[0] is falsy because that means we could not find a path
  return {finalNode: open[0] || first, costs: costSoFar};
}

export function manhattanDistance(startLocation, goalLocation) {
  const dx = Math.abs(startLocation.x - goalLocation.x);
  const dy = Math.abs(startLocation.y - goalLocation.y);
  return dx + dy;
}

export function moveAdjacentToLocationAndAttack(start, end, game, monster, character, move, collections, cb) {
  if (move <= 0) return false;
  if (_.contains(_.pluck(adjacentLocations(end), 'key'), start.key)) { //adjacent to opponent
    attackCharacter(character, monster, game, collections);
    cb();
    return false;
  }

  let aStarResults = aStar(start, end, game);
  let last = aStarResults.finalNode;
  while (last && last.previous && last.previous.previous) {
    last = last.previous;
  }
  Meteor.setTimeout(function(){
    collections.Games.update(game._id, {$set: {map: game.moveMonsterOnMap(start, last)}}, function(){
      if (_.contains(_.pluck(adjacentLocations(end), 'key'), last.key)) {
        attackCharacter(character, monster, game, collections);
        cb();
      } else {
        moveAdjacentToLocationAndAttack({x:last.x, y:last.y, key: last.key}, end, collections.Games.findOne(game._id), monster, character, move-1, collections, cb);
      }
    })
  }, 1000);
}

export function attackCharacter(character, monster, game, collections) {
  let result = basicAttack(monster, character);
  if (result.dmg > 0) {
    damageCharacter(character, result.dmg, collections.Characters);
    collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'The '+monster.name+' attacked and did '+result.dmg+' damage.'});
  } else {
    collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'The '+monster.name+' attacked, but missed.'});
  }
}

export function basicAttack(attacker, defender) {
  var result = {
    hits: 0,
    blocks: 0,
    dmg: 0,
  };
  // roll attacks
  _.times(attacker.attack, function(){
    if (rollPercent(attacker.accuracy)) { // you hit!
      result.hits += 1;
    }
  })
  // roll defenses
  _.times(defender.defense, function(){
    if (rollPercent(defender.deflection)) { // you hit!
      result.blocks += 1;
    }
  })
  result.dmg = result.hits - result.blocks;

  return result;
}

export function damageCharacter(character, dmg, Characters) {
  if (character.body - dmg <= 0) {
    // TODO handle character dying
  } else {
    character.body -= dmg;
    Characters.update(character._id, {$set: {body: character.body}})
  }
}
