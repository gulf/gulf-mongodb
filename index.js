/**
 * gulf-mongodb
 * Copyright (C) 2015 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
 
module.exports = Adapter

var Document = module.exports.Document = {
  firstSnapshot: String
, latestSnapshot: String
}

var Snapshot = module.exports.Snapshot = {
  document: Schema.ObjectId
, creationDate: Date
, contents: String
, edit: String
, id: String
}

function Adapter(mongooseConnection) {
  this.Document = mongooseConnection.model('Document', new Schema(Document))
  this.Snapshot = mongooseConnection.model('Snapshot', new Schema(Snapshot))
}

Adapter.prototype.createDocument = function(initialSnapshot, cb) {
  var document = new this.Document()
  document.firstSnapshot = initialSnapshot.id
  document.latestSnapshot = initialSnapshot.id
  document.save(function(er, document) {
    if(er) return cb(er)
    this.storeSnapshot(document._id, initialSnapshot, function(er) {
      if(er) return cb(er)
      cb(null, document._id)
    })
  }.bind(this))
}

Adapter.prototype.getFirstSnapshot = function(documentId, cb) {
  this.Document.findById(documentId, function(er, doc) {
    if(er) return cb(er)
    this.Snapshot.findById({document: documentId, id: doc.firstSnapshot}, function(er, snapshot) {
      if(er) return cb(er)
      cb(null, snapshot)
    })
  }.bind(this))
}

Adapter.prototype.getLatestSnapshot = function(documentId, cb) {
  this.Document.findById(documentId, function(er, doc) {
    if(er) return cb(er)
    if(!doc) return cb(new Error('Document '+this.documentId+' not found'))
    this.Snapshot.findOne({document: documentId, id: doc.latestSnapshot}, function(er, snapshot) {
      if(er) return cb(er)
      cb(null, snapshot)
    })
  }.bind(this))
}

Adapter.prototype.storeSnapshot = function(documentId, snapshot, cb) {
  var snapshotId = snapshot.id
  snapshot.document = documentId
  snapshot = new this.Snapshot(snapshot)
  snapshot.save(function(er) {
    if(er) return cb(er)
    this.Document.findById(documentId, function(er, doc) {
      if(er) return cb(er)
      doc.latestSnapshot = snapshotId
      doc.save(cb)
    }.bind(this))
  }.bind(this))
}

Adapter.prototype.existsSnapshot = function(documentId, editId, cb) {
  this.Snapshot.findOne({id: editId, document: documentId}, function(er, snapshot) {
    cb(null, !!snapshot)
  })
}

Adapter.prototype.getSnapshotsAfter = function(documentId, editId, cb) {
  var snapshots = []
  findAfter.call(this, null, {id: editId})
  function findAfter(er, snapshot) {
    if(er) return cb(er)
    if(!snapshot) return cb(null, snapshots)
    if(snapshot.id !== editId) snapshots.push(snapshot)
    findSnapshotAfter.call(this, snapshot.id, findAfter.bind(this))
  }
  function findSnapshotAfter(editId, cb) {
    this.Snapshot.findOne({document: documentId, parent: editId}
    , function(er, s) {
      if(er) return cb(er)
      cb(null, s)
    })
  }
}
