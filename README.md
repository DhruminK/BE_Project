# Knowledge-based Authentication

This repository is a showcase for our BE Project. This project also known as WALL-E is a small step towards an interactive knowledge based authentication application which uses a chatbot to authenticate the user. Basic idea is :
  - Gather information about the user, which done via facebook
  - From the data generated ask users questions about himself  
  - Merge the information, recieved via facebook and also the one recieved from the user
  - Using this information generate question to authenticate user on his subsequent logins

This project is a basic example of knowledge-based authentication process which can be used to avoid heavy computation based context authentication methods.

# Features!

  - Uses POS Tagger and Named Entity Recongnition to find name, date, etc
  - Uses Facebook to gather information about the user during SignUp process
  - Subsequent logins require the user to answer few questions that are based on information gathered


## Tech

Knowledge-Based Authentication uses technologies like 

* [Node.js] - Because Javascript all the way
* [Socket.io](https://github.com/socketio/socket.io) - because websockets are awesome
* [Express] - What will we do without it
* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [Webpack](https://github.com/webpack) - the bundling system, and whose gonna convert all that es6 code to es5 ?
* [nlp-compromise](https://github.com/nlp-compromise/compromise) - How will we find Parts-of-Speech, by ourself ?
* [lodash](https://github.com/lodash/lodash) - Provides amazing methods to loop through collections with blazing fast speeds
* [mongoose](https://github.com/Automattic/mongoose) - Document stores are amazing ,and so is mongodb
* [request](https://github.com/request/request) - To make http calls from node.js simpler
* [jQuery] - duh


### Installation

WALL-E requires [Node.js](https://nodejs.org/) v4+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd BE_Project
$ npm install 
$ npm start
```




### Todos

 - Using Angular to make front-end simpler
----

MIT License


**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
