var nmnLocation = '/path/to/node-mongodb-native'

var	Db = require(nmnLocation).Db,
 	Server = require(nmnLocation).Server;

var host = 'localhost';
var port = 27017;

var getTweetsCollection = function(callback) {
	var db = new Db('minitwitter', new Server(host, port))
	db.open(function() {
		db.createCollection('tweets', function() {
			db.collection('tweets', function(error, collection) {
				console.log(error)
				callback(collection)
				db.close()	
			})	
		})	
	})
}

this.createTweet = function(tweet, callback) {
	getTweetsCollection(function(collection) {
		collection.insert(tweet)	
	})
}

this.listTweets = function(search, callback) {
	var filter = {}
	if(search.message) {
		filter.message = search.message.replace(/[^\w\s]/g, '')
		filter.message = new RegExp('.*' + filter.message + '.*')
	}
	getTweetsCollection(function(collection) {
		collection.find(filter, {sort: [['date', 'descending']]}, function(error, docs) {
			var result = []
			docs.each(function(i, doc) {
				if(doc == null)
					callback(result)
				else result.push(doc)
			})
		})	
	})	
} 