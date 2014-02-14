snakeflex sample game
=====================

To use this sample you have to:

- Create an account on the [Scoreflex platform](http://developer.scoreflex.com/ "Scoreflex developer site") (if you don't have one already).
- Create a game -or modify an existing one- (check the **Web** option in the list of available platforms).
- Configure a **leaderboard** and a **challenge** for your game (see configurations below).
- Checkout the sample files and copy the [Scoreflex Javascript SDK](https://github.com/scoreflex/scoreflex-javascript-sdk "Scoreflex Javascript SDK on GitHub")
to the `SDK/` folder (sample tested with SDK v1.1.0.0)
- Edit the `social.js` file and update the `clientId` and `clientSecret` variables
with your game's identifiers.

------

The Snakeflex javascript sample focuses on the following Scoreflex SDK usages:

* Basic usage to display a web view
* Play with a leaderboard
    - send scores to a leaderboard
    - catch events to play the game for a given leaderboard 
* Play a simple challenge (use 2 different browsers to play a challenge).
    - catch events to play the game in "challenge mode"
    - send score for a challenge
    - example of a 1 try confrontation challenge (both players can play at the same time)

Configurations
--------------

**Set up a leaderboard**

Id: *highscores*

Raw JSON configuration:

    {
      "collapsingMode": "best",
      "forceMeta": false,
      "geoScopes": ["*"],
      "label": {
          "en": "High Scores"
      },
      "locationMode": "playerHomeNearby",
      "maxScore": 100,
      "minScore": 0,
      "order": "score:desc,time:desc",
      "sameRankScoreEq": true,
      "scoreFormatter": {
          "type": "integer",
          "unit": {
              "compact": {
                  "plural": [],
                  "singular": []
              },
              "full": {
                  "plural": [],
                  "singular": []
              }
          }
      },
      "scoreMode": "best",
      "timePolicy": "anytime"
  }


**Set up a challenge**

Id: *snake* (actually you can choose whatever you want) 

Raw JSON configuration:

    {
      "challengeEndConditions": {
          "duration": 3600000,
          "maxTurnsPerPlayer": 1,
          "scoreToBeatLimits": [
              "time",
              "playingTime"
          ]
      },
      "displayDescription": {
          "en": "Challenge a player to make the best score"
      },
      "displayName": {
          "en": "Snake 1 vs 1"
      },
      "maxSeedValue": 10000,
      "outcomeConfig": {
          "sameRankScoreEq": true,
          "scoreAggregation": "best",
          "scoreFormatter": {
              "type": "integer",
              "unit": {
                  "compact": {
                      "plural": [],
                      "singular": []
                  },
                  "full": {
                      "plural": [],
                      "singular": []
                  }
              }
          },
          "scoreOrder": "score:desc,time:asc",
          "showScoresPolicy": "atEnd",
          "winnersCount": 1
      },
      "participantsConfig": {
          "improveParticipantCountTimeout": 5000,
          "invitationTimeout": 86400000,
          "validParticipantCounts": [2]
      },
      "replayable": true,
      "turnConfig": {
          "initialTurnStrategy": "all",
          "turnStrategy": "allAlways",
          "turnTimeout": 300000
      }
    }
  
  