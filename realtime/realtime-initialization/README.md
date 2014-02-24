Realtime-initialization sample
===============================

To use this sample you have to:

* Create an account on the [Scoreflex platform](http://developer.scoreflex.com/
  "Scoreflex developer site") (if you don't have one already).
* Create a game -or modify an existing one- (check the **Web** option in the
  list of available platforms).
* Checkout this sample and copy the [Scoreflex Javascript
  SDK](https://github.com/scoreflex/scoreflex-javascript-sdk "Scoreflex
  Javascript SDK on GitHub") to the `SDK/` folder (sample tested with the
  realtime branch)
* Edit the *game.js* file and update the `clientId` and `clientSecret` variables
  with your game's identifiers.

------

The realtime-initialization sample focuses on the following Scoreflex SDK features:

* Manage lifecycle of the realtime session:
  - Manage Scoreflex SDK initialization/deinitialization
  - Handle player login/logout events
  - Manage realtime session initialization/deinitialization

Typical use-cases covered by this sample:

* Use Restart/Stop buttons to test initialization/deinitialization of the SDK
  and the realtime session.
* Use login/logout from the user's profile WebView to test the player changes.
