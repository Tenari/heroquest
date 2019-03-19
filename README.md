# Questing Heroes

The goal is to make a turn-based dungeon crawler Limited Multiplayer Online based off of the classic board game [HeroQuest](https://www.youtube.com/watch?v=Cx8sl2uC46A).

Read the original board game [rules](http://english.yeoldeinn.com/system.php).

Features:

- Accounts can make multiple characters
- Accounts can make "quests" (dungeon scenarios), which are automatically ranked by difficulty
- Quests can be ranked by accounts which have a character complete them
- when a Quest is completed by an account, the details (traps placement, etc) are forever visible to that account. Quest is "unlocked."
- Quests can be forked from an unlocked quest in order to make a new version for you to publish
- Every time a character completes a account-created Quest for the first time, the account which created that Quest is rewarded with gold/account USD balance
- characters persist between quests
- characters reset to full mind + body points at end of each quest they complete
- characters perma-die when their mind or body points go to zero during a quest.
- characters can form parties of up to 4 players to tackle a quest
- leaderboard of characters that have completed the most quests/the most dangerous quests
- intuitive WASD movement
- basic pokemon-ripped menus/combat options
- automatic DM, so no one has to play the monsters and trigger the traps, etc
- monsters, treasure, equipment, spells, traps, etc from board game
- turn timer to prevent AFK/disconnect

Pricing:

- Free to make one character per account, costs $0.25 per character created after that (minimum $2 purchase because of credit card fees)
- "buy the game" for $10, meaning your account has infinite of things that cost USD, whether I decide to make playing a quest cost money or not, etc.
- Cannot submit quests unless you have spent money

Screens:

- advertising/landing page
- account creation
- account home page (lists characters, quests created+unlocked, account balance, lets you refill account balance)
- character creation
- character details
- quest creation
  - quests lifecycle: new -> saved -> published. Can only be edited until published. After that, it's frozen.
- quest list page
- character leaderboard page
- quest ranking page
- equipment shop
- "start quest" page /quest/:id/start?character=id
- play quest page /quest/:id/play
  - movement view
  - attack view
  - status view

### To install

```
git clone
cd
meteor
```

that starts the server on localhost:3000

Meteor servers will automatically restart themselves whenever you make code changes+save the file.
