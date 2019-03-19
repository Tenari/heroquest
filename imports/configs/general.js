export function xyKey(x, y) {
  return ""+x+"-"+y;
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
        let classes = classNames({'map-tile': true, rubble: map[key] && map[key].rubble, goblin: map[key] && map[key].goblin, exit: map[key] && map[key].exit});
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
