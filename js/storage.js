RemoteStorage.defineModule('clips', function(privateClient) {
  privateClient.declareType('clip', {
    type: 'object',
    required: ['url']
  });

  return {
    exports: {

      init: function() {
        privateClient.cache('');
      },

      on: privateClient.on,

      add: function(data) {
        data.key = privateClient.uuid();
        return privateClient.storeObject('clip', data.key, data);
      },

      remove: privateClient.remove.bind(privateClient),

      get: function(id) {
        return privateClient.getObject(id, false);
      },

      list: function() {
        return privateClient.getAll('');
      }

    }
  };

});

RemoteStorage.config.logging = true;
RemoteStorage.config.changeEvents = {
  local: true,
  window: true,
  remote: true,
  conflict: true
};

remoteStorage.setApiKeys('dropbox', {
  //see https://www.dropbox.com/developers/apps/info/cybbbiarf4dkrce
  api_key: 'lmpf6k4v40la9ld'
});

remoteStorage.access.claim('clips', 'rw');
remoteStorage.displayWidget();
remoteStorage.clips.init();
remoteStorage.clips.on('change', function(event) {
  console.log('change from '+event.origin, event);
});