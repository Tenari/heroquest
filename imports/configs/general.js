export function xyKey(x, y) {
  return ""+x+"-"+y;
}

export function xFromKey(key) {
  return parseInt(key.split('-')[0]);
}

export function yFromKey(key) {
  return parseInt(key.split('-')[1]);
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

export function drawPlayerViewOfMap(map, width, height, viewport, charLoc) {
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
  if (charLoc.y < (drawY-1)) {
    drawY = charLoc.y;
    s_y = 0;
  }
  // Too close to bottom
  else if (charLoc.y > (height - (viewH - drawY))) { // rows visible below.
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
        let classObj = {
          'map-tile': true,
          rubble: visible && tile.rubble,
          exit: visible && tile.exit,
          'not-visible': !visible,
        };
        if (visible && tile.monster) {
          classObj[tile.monster] = true;
        }
        let classes = classNames(classObj);

        html += '<div class="'+classes+'" data-x="'+(j+s_x)+'" data-y="'+(i+s_y)+'">';
          if (visible && tile.character) {
            html += '<div class="character '+tile.character.key+'"></div>';
          }
        html += '</div>';
        html += '<div class="'+classNames({'map-border':true, wall: visible && tile.rightWall})+'">';
          if (visible && tile.rightDoor) {
            html += '<div class="right-door"></div>';
          }
          if (false && visible && tile.rightSecretDoor) {
            html += '<div class="right-secret-door"></div>';
          }
        html += '</div>';
      }
    html += "</div>";
    html += "<div class='map-border-row'>";
      for (let x = 0; x < viewW; x++) {
        let key = xyKey(x+s_x, i+s_y);
        visible = map[key] && map[key].visible;
        html += '<div class="'+classNames({'map-border':true, wall: visible && map[key].bottomWall})+'">';
          if (visible && map[key].bottomDoor) {
            html += '<div class="bottom-door"></div>';
          }
          if (false && visible && map[key].bottomSecretDoor) {
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
      difficulty += ((2*(monster.attack + monster.defend)) + monster.move + monster.health + monster.sanity);
    }
  })
  return difficulty;
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
    map[key].visible = isTileVisible(map[checkKey], details.direction);
    if (map[key].visible && details.newY < height && details.newY >= 0 && details.newX < width && details.newX >= 0) {
      map = checkCardinalDirections(map, height, width, details.newX, details.newY, alreadyChecked);
    }
  })

  return map;
}

function isTileVisible(tile, direction) {
  let visible = true;
  if (tile) {
    if (tile[direction+'Door'] && !tile[direction+'DoorOpen']) { // closed door
      visible = false;
    }
    if (tile[direction+'Wall'] && !tile[direction+'Door']){ // wall without a door
      visible = false;
    }
  }
  return visible;
}
