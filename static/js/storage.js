RemoteStorage.defineModule('clips', function(privateClient) {
  privateClient.declareType('clip', {
    type: 'object',
    required: ['url']
  });

  return {
    exports: {

      init: function(strategy) {
        privateClient.cache(strategy || "");
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
//RemoteStorage.config.disconnectClear = false;

remoteStorage.setApiKeys('googledrive', {
  client_id: '122384013929-st9tlnkl6di0b24iakvb803sugbb5tvf.apps.googleusercontent.com'
});

remoteStorage.setApiKeys('dropbox', {
  api_key: 'bc1lv16y9l8teil'
});

