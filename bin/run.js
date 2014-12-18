// https://gist.github.com/rpflorence/701407
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.env.PORT || 9000,
    open = process.argv.indexOf('--open') != -1,
    useAuth = process.argv.indexOf('--auth') != -1;

var portArg = process.argv.indexOf('--port');
if (portArg != -1) {
  port = process.argv[portArg + 1];
}
 
http.createServer(function(req, res) {

  if (useAuth) {
    // get authorization data
    var header=req.headers['authorization'] ||'',
      token=header.split(/\s+/).pop()||'',
      auth=new Buffer(token, 'base64').toString(),
      parts=auth.split(/:/),
      username=parts[0],
      password=parts[1];
 
    // check username and password
    if (username != 'creuna' || password != 'harderwork') {
      res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="Engage"'
      });
      return res.end('401 Unauthorized');
    }
  }
 
  var uri = url.parse(req.url).pathname
    , filename = path.join(process.cwd(), uri);
  
  fs.exists(filename, function(exists) {
    if(!exists) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;
    }
 
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
      }
 
      res.writeHead(200);
      res.write(file, "binary");
      res.end();
    });
  });
}).listen(parseInt(port, 10));
 
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

// opn
var path = require('path');
var execFile = require('child_process').execFile;

var opn = function (target, app, cb) {
  if (typeof target !== 'string') {
    throw new Error('Expected a `target`');
  }

  if (typeof app === 'function') {
    cb = app;
    app = null;
  }

  var cmd;
  var args = [];

  if (process.platform === 'darwin') {
    cmd = 'open';

    if (cb) {
      args.push('-W');
    }

    if (app) {
      args.push('-a', app);
    }
  } else if (process.platform === 'win32') {
    cmd = 'cmd';
    args.push('/c', 'start');
    target = target.replace(/&/g, '^&');

    if (cb) {
      args.push('/wait');
    }

    if (app) {
      args.push(app);
    }
  } else {
    if (app) {
      cmd = app;
    } else {
      // http://portland.freedesktop.org/download/xdg-utils-1.1.0-rc1.tar.gz
      cmd = path.join(__dirname, 'xdg-open');
    }
  }

  args.push(target);

  // xdg-open will block the process unless stdio is ignored
  execFile(cmd, args, {stdio: 'ignore'}, cb);
};

if (open) {
  opn('http://localhost:9000/index.html');
}