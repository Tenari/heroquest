// Definition of the games collection

import { Mongo } from 'meteor/mongo';

export const Games = new Mongo.Collection('games');

Games.helpers({
  characterLocation(id){
    let matchKey = '';
    _.find(this.map, function(tile, key) {
      if (tile.character && tile.character._id == id) {
        matchKey = key;
        return true;
      }
      return false
    })
    return {
      x: parseInt(matchKey.split('-')[0]),
      y: parseInt(matchKey.split('-')[1]),
    }
  }
})
