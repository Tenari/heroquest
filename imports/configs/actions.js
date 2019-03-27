import { adjacentLocations, adjacentBoundaryLocations, borderLocationIsClear, basicAttack, rollPercent, spacesInRoom, bordersOfRoom, makeTilesVisible, xyKey } from './general.js';

export const ACTIONS = {
  attack: {
    key: 'attack',
    label: 'Attack',
    selectsTarget: true,
    test: function(game, character) {
      // return true if you are adjacent to a monster
      const charLoc = game.characterLocation(character._id);
      const borders = adjacentBoundaryLocations(charLoc);
      return !game.turn.hasActed && _.find(adjacentLocations(charLoc), function(loc, cardinalDirection){
        const border = borders[cardinalDirection];
        const borderTile = game.map[border.key];
        return game.map[loc.key] && _.isNumber(game.map[loc.key].monster) && (!borderTile || borderLocationIsClear(borderTile, border.direction));
      });
    },
    perform: function(game, character, params, collections) {
      const charLoc = game.characterLocation(character._id);
      const key = xyKey(params.x, params.y);
      const adjacent = adjacentLocations(charLoc);
      let direction = 'north';
      _.find(adjacent, function(loc, cardinalDirection){
        direction = cardinalDirection;
        return loc.key == key;
      });
      const border = adjacentBoundaryLocations(charLoc)[direction];
      const borderTile = game.map[border.key];

      // only do the attack if the params they sent were valid
      if (!_.find(_.values(adjacent), function(loc){return loc.key == key})) return false; // attack key is not adjacent
      if (borderTile && !borderLocationIsClear(borderTile, border.direction)) return false; // attack key is blocked by wall
      // and there's a monster there
      if (!game.map[key] || !_.isNumber(game.map[key].monster)) return false;

      const monster = game.monsters[game.map[key].monster];
      // TODO track monster HP loss
      game.turn.hasActed = true;
      
      let dmg = basicAttack(character, monster).dmg;

      if (dmg <= 0) {
        collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'You missed the '+monster.name});
        return collections.Games.update(game._id, {$set: {turn: game.turn}});
      }

      // update stats
      collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'You killed the '+monster.name});
      game.monsters[game.map[key].monster] = undefined;
      game.map[key].monster = null;
      collections.Games.update(game._id, {$set: {monsters: game.monsters, map: game.map, turn: game.turn}});
    },
  },
  spell: {
    key: 'spell',
    label: 'Cast Spell',
    test: function(game, character) {
      // return true if you have spells remaining
      return false;
    },
  },
  treasure: {
    key: 'treasure',
    label: 'Search for treasure',
    test(game, character) {
      let canSearch = true;
      const charLoc = game.characterLocation(character._id);
      _.each(game.rooms, function(room, roomKey) {
        if (spacesInRoom(roomKey, game.map, game.width, game.height)[charLoc.key]) { // if the room we are looking at houses the character
          if (room.treasureSearched) {
            canSearch = false;
          }
        }
      })
      return canSearch;
    },
    perform(game, character, params, collections){
      const charLoc = game.characterLocation(character._id);
      _.each(game.rooms, function(room, roomKey) {
        if (spacesInRoom(roomKey, game.map, game.width, game.height)[charLoc.key]) { // if the room we are looking at houses the character
          if (room.treasure == 'random') {
            var luck = Math.random();
            // 20% chance of monster
            // 14% chance of trap
            // 66% chance of gold or item
            if (luck < 0.2) {
              // TODO wandering monster
              collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'TODO: You found a wandering monster!'});
            } else if (luck < 0.34) {
              // TODO trap
              collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'TODO: You found a trap!'});
            } else { // money!
              let amount = parseInt(game.randomTreasurePool / _.select(_.values(game.rooms), function(room){return room.treasure == 'random'}).length);
              luck = Math.random();
              if (luck < 0.33) {
                amount = parseInt(amount *2);
              } else if (luck < 0.66) {
                amount = parseInt(amount / 2);
              }
              collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'You found '+amount+' copper pieces!'});
              character.cp += amount;
            }
          } else {
            collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'You found '+room.treasure+' copper pieces!'});
            character.cp += room.treasure;
          }
          room.treasureSearched = true;
        }
      })
      collections.Characters.update(character._id, {$set: {cp: character.cp}});
      game.turn.hasActed = true;
      return collections.Games.update(game._id, {$set: {rooms: game.rooms, turn: game.turn}});
    },
  },
  secrets: {
    key: 'secrets',
    label: 'Search for doors/traps',
    test(game, character) {
      return true;
    },
    perform(game, character, params, collections) {
      const charLoc = game.characterLocation(character._id);
      let foundSomething = false;
      _.each(bordersOfRoom(charLoc, game), function(borderLoc){
        let tile = game.map[borderLoc.key];
        if (tile && tile[borderLoc.direction+'SecretDoor'] && !tile[borderLoc.direction+'SecretDoorOpen']) {
          collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'You found a secret door!'});
          foundSomething = true;
          game.map[borderLoc.key][borderLoc.direction+'SecretDoorOpen'] = true;
        }
      })
      if (!foundSomething) {
        collections.EventNotices.insert({gameId: game._id, userId: character.userId, message: 'You searched the area, but failed to find anything.'});
      }
      game.turn.hasActed = true;
      game.map = makeTilesVisible(game.map, game.height, game.width, [xyKey(charLoc.x, charLoc.y)]);
      collections.Games.update(game._id, {$set: {map: game.map, turn: game.turn}});
    },
  },
}

