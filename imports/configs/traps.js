import { damageCharacter } from './general.js';

function commonToAllTraps(trapLocation, game, collections) {
  game.map[trapLocation.key].trapTriggered = true;
  let turn = game.turn;
  turn.moves = 0;
  turn.hasActed = true;
  collections.Games.update(game._id, {$set: {map: game.map, turn: turn}})
}
export const TRAPS = {
  'pit-trap': {
    key: 'pit-trap',
    label: 'Pit trap',
    trigger: function(trapLocation, game, character, collections) {
      commonToAllTraps(trapLocation, game, collections);
      damageCharacter(character, 1, collections.Characters);
    },
  },
  'spear-trap': {
    key: 'spear-trap',
    label: 'Spear trap',
    trigger: function(trapLocation, game, character, collections) {
      commonToAllTraps(trapLocation, game, collections);
    },
  },
  'falling-block-trap': {
    key: 'falling-block-trap',
    label: 'Falling block',
    trigger: function(trapLocation, game, character, collections) {
      commonToAllTraps(trapLocation, game, collections);
    },
  },
};
