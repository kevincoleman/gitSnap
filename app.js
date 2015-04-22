var chokidar = require('chokidar');
var nodegit = require('nodegit');
var path = require('path');

var watcher = chokidar.watch('shots/', {ignored: /^\./, persistent: true});

var repo;
var index;
var oid;
var parent;

watcher
  .on('add', function(screenShot) {

    if (screenShot.indexOf(".Screen") == -1) {
      console.log(screenShot);
      // commit newest file
      nodegit.Repository.open(path.resolve(__dirname, './.git'))
      .then(function(repo) {
        return repo.openIndex();
      })
      .then(function(indexResult) {
        index = indexResult;
        return index.read(1);
      })
      .then(function() {
        return index.addByPath(screenShot);
      })
      .then(function() {
        return index.write();
      })
      .done(function() {
        console.log('File', screenShot, 'has been added');
      });

    }

    })
  .on('change', function(screenShot) {console.log('File', screenShot, 'has been changed');})
  .on('unlink', function(screenShot) {console.log('File', screenShot, 'has been removed');})
  .on('error', function(error) {console.error('Error happened', error);});
