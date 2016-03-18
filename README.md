# gulf-mongodb
[gulf](http://github.com/marcelklehr/gulf#readme) storage adapter for mongodb

## Install

```
npm install gulf-mongodb
```

(*gulf-mongodb* was written against mongoose@3.x)

## Usage

```
var gulf = require('gulf')
var mongoose = require('mongoose')
var MongoDBAdapter = require('gulf-mongodb')

var dbConnection = mongoose.createConnection('mongodb://localhost/my_database')
var mongoAdapter = new MongoDBAdapter(dbConnection)
gulf.Document.create(mongoAdapter, ottype, 'initial contents', function(er, doc) {
  if(er) throw er
  net.createServer(function(stream) {
    stream.pipe(doc.slaveLink()).pipe(stream)
  }).listen(5314)
})
```

Or, if the document already exists:

```
var gulf = require('gulf')
var mongoose = require('mongoose')
var MongoDBAdapter = require('gulf-mongodb')

var dbConnection = mongoose.createConnection('mongodb://localhost/my_database')
var mongoAdapter = new MongoDBAdapter(dbConnection)
gulf.Document.load(mongoAdapter, ottype, docId, function(er, doc) {
  if(er) throw er
  net.createServer(function(stream) {
    stream.pipe(doc.slaveLink()).pipe(stream)
  }).listen(5314)
})
```

## Legal
(c) 2015 by Marcel Klehr

GNU Lesser General Public License
