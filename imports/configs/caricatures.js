export const CARICATURES = {
  barbarian: { // conan
    key: 'barbarian',
    name: "Barbarian",
    desc: "The Barbarian is the greatest warrior of all. But beware of magic for your sword is no defense against it.",
    attack: 3,
    accuracy: 0.5,
    defense: 2,
    deflection: 0.33,
    move: 7,
    mind: 2,
    body: 8,
    spells: 0,
  },
  dwarf: { // gimli
    key: 'dwarf',
    name: "Dwarf",
    desc: "The Dwarf is a good warrior and can always disarm traps that you find. You may remove any visible trap in the same room or passage.",
    attack: 2,
    accuracy: 0.5,
    defense: 2,
    deflection: 0.33,
    move: 6,
    mind: 3,
    body: 7,
    spells: 0,
  },
  wizard: { // merlin
    key: 'wizard',
    name: "Wizard",
    desc: "The Wizard has many spells that can aid you. However, in combat you are weak, so use your spells well and avoid combat.",
    attack: 1,
    accuracy: 0.5,
    defense: 2,
    deflection: 0.33,
    move: 7,
    mind: 6,
    body: 4,
    spells: 9,
  },
  elf: { // legolas
    key: 'elf',
    name: "Elf",
    desc: "The Elf is a master of both magic and the sword. You must use both well if you are to triumph.",
    attack: 2,
    accuracy: 0.5,
    defense: 2,
    deflection: 0.33,
    move: 8,
    mind: 4,
    body: 6,
    spells: 3,
  },
/*
  knight: { // sir lancelot
    key: 'knight',
    name: 'Knight',
    desc: "The Knight is a warrior who has become a master of defense. But magic poses its own challenge..."
    attack: 2,
    accuracy: 0.5,
    defense: 3,
    deflection: 0.39,
    move: 7,
    mind: 3,
    body: 7,
    spells: 0,
  },
  halfling: { // Bilbo
    key: 'halfling',
    name: "Halfling",
    // something about treasure
    desc: "The Halfling draws two treasure cards when he finds treasure in a search. But his small stature poses trouble in combat.",
    attack: 1,
    accuracy: 0.75,
    defense: 2,
    deflection: 0.375,
    move: 6,
    mind: 5,
    body: 5,
    spells: 3,
  },
  ent: { // Treebeard
    key: 'ent',
    name: "Ent",
    desc: "The Ent is tough and powerful due to his bark-skin. But though he is tall, motion does not come quikly to him.",
    attack: 3,
    accuracy: 0.45,
    defense: 3,
    deflection: 0.33,
    move: 4,
    mind: 4,
    body: 6,
    spells: 0,
  },

by attack power:    by defense power:
1.5   barb          1.17  knight
1.35  ent           0.99  ent
1     elf           0.75  halfling
1     dwarf         0.66  barb
1     knight        0.66  dwarf
0.75  halfling      0.66  elf
0.5   wizard        0.66  wizard         
*/
}
