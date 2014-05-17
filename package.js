Package.describe({
  name: "http-proxy",
  summary: "Simple dynamic HTTP proxying"
});

Npm.depends({
  "http-proxy": "1.1.2"
});

Package.on_use(function (api) {
  api.use("mongo-livedata", 'server');
  
  api.export('HTTPProxy');

  api.add_files('proxy.js', 'server');

});
