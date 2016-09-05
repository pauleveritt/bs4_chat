# bs4_chat

Simple Bootstrap 4 chat demo for Hadi.

## Installation

- npm install

## Running the frontend

- Run a backend on 9002 (see the next section for a demo server)

- npm start

- Go to http://localhost:3000/?#paul

- *Don't forget the #username !!*

This runs a local, livereload server on port 3000. It uses the
src directory as the root directory but also serves the
node_modules directory.

The client expects the websocket server to run on 9002.

The URL ends in a hash that provides the username, instead of
making a facility to choose, save, and change the username.

## Running the backend

- npm run server

This is a simple NodeJS implementation of a chat server. It has the
9002 port hooked up to it.

## About the Frontend

There are lots of comments in the code. Here are a few coding decisions:

- It uses Bootstrap 4 for CSS (though I couldn't get Flexbox without
  SASS) and font-awesome, both served from node_modules.

- It does *not* use jQuery, as it doesn't yet have any Bootstrap
  components like modal that need it.

- It uses a tiny (5K) library called bind.js as an alternative
  to a templating system. Everything for that is in ChatClient.model.
  Basically, you write to a value and DOM stuff updates.

- Lots of ES6 in this, but nothing that can't work natively in Chrome. No
  transpiling is needed.

Here's the basic programming flow:

- An event listener in app.js that listens for the document to load, then:

    * Make an instance of the ChatClient class

    * Wire up some DOM event handlers

- The ChatClient class:

    * Has a constructor that wires up the bind.js "model"

    * Makes a websocket instance

    * Delegates all the websocket handlers to methods on the class

    * The websocket onmessage handler dispatches incoming messages to
      ChatClient methods

## About the Backend

- It maintains a list of connected clients aka users. Only used currently
  for deciding who to send a message to.

- It has a default set of rooms with dummy posts, for debugging purposes

- The sendMessage function has a userId parameter that decides whether the
  websocket message should go to everyone, or just one user

- There's a message handler with a switch statement to do different actions
  based on incoming message types

