import './monsterInfo.html';
import { abilityModifier, CR_TO_XP } from '/imports/configs/general.js';

Template.monsterInfo.helpers({
  abilityModifier(score) {return abilityModifier(score);},
  xpForCR(cr) {return CR_TO_XP[""+cr];},
})
