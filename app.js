var chokidar = require('chokidar');
var nodegit = require('nodegit');
var path = require('path');

var watcher = chokidar.watch('shots/', {ignored: /^\./, persistent: true});

var repository;
var signature = nodegit.Signature.create("Kevin Coleman", "kevin.n.coleman@gmail.com", 123456789, 60);

watcher
  .on('add', function(screenShot) {

    // make sure temp write files aren’t added
    if (screenShot.indexOf(".Screen") == -1) {

      // commit newest file
      nodegit.Repository.open(path.resolve(__dirname, './.git'))
      .then(function(repo) {
        repository = repo;
        return repository.openIndex();
      })
      .then(function(index) {
        index.read(1);
        index.addByPath(screenShot);
        index.write();

        return index.writeTree();
      })

      // commit file(s) to repo
      .then(function(oid) {
        return repository.createCommit("HEAD", signature, signature,
          "screenshot added", oid, []);
      })
      .catch(function(err){
        console.log("Failed!", err);
      })

      // Get origin remote and push to it
      .then(function() {
        return nodegit.Remote.lookup(repository, "origin")
        .then(function(remoteResult) {
          remote = remoteResult;

          remote.setCallbacks({
            credentials: function(url, userName) {
              return nodegit.Cred.sshKeyFromAgent(userName);
            }
          });

          // Create the push object for this remote
          return remote.push(
            ["refs/heads/master:refs/heads/master"],
            null,
            repository.defaultSignature(),
            "new screenshot pushed");
        });
      })
      .done(function() {
        console.log('File', screenShot, 'has been added');
      });

    }

    })
  .on('change', function(screenShot) {console.log('File', screenShot, 'has been changed');})
  .on('unlink', function(screenShot) {console.log('File', screenShot, 'has been removed');})
  .on('error', function(error) {console.error('Error happened', error);});
