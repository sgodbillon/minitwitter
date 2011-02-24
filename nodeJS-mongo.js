/***** HTTP layer *****/

var SYS = require('sys');
var HTTP = require('http');
var URL = require('url');
var FS = require('fs');
var PATH = require('path');

HTTP.createServer(function (request, response) {
	var parsedURL = URL.parse(request.url, true)
	console.log('->', parsedURL.pathname)	
	
	// list tweets
	if(parsedURL.pathname == '/tweets' && request.method == 'GET') {
		var search = {}
		if(parsedURL.query && parsedURL.query.search)
			search.message = parsedURL.query.search
		require('./mongo').listTweets(search, function(tweets) {
			var result = JSON.stringify(tweets)
			response.writeHead(200, {
				'Content-Length': result.length,
				'Content-Type': 'text/json'
			})
			response.end(result)
		})
	// create a tweet
	} else if(parsedURL.pathname == '/tweets' && request.method == 'POST') {
		var obj = undefined
		request.on('data', function(data) {
			try {
				data = data.toString().replace(/\n/g, '\\n')
				obj = JSON.parse(data)
				obj.date = new Date().getTime()
				require('./mongo').createTweet(obj, function() {
					response.writeHead(201)
					response.end()
				})
			} catch(e) {
				console.log('data were', typeof data, data, 'e=',e)
				response.writeHead(500, 'Wrong data: not JSON?')
				response.end()
			}
		})
		request.on('end', function() {
			if(!obj) {
				response.writeHead(500, 'No data?')
				response.end();	
			}
		})
	// index
	} else if(parsedURL.pathname == '/' && request.method == 'GET') {
		var view = FS.readFileSync(__dirname + '/index.html')
		response.writeHead(200, {
			'Content-Type': 'text/html'
		})
		response.write(view)
		response.end()
	// static files
	} else if(parsedURL.pathname.indexOf('/public/') == 0 && request.method == 'GET') { 
		var path = __dirname + parsedURL.pathname
		path = PATH.normalize(path)
		if(path.indexOf(__dirname) != 0) {
			response.writeHead(403, 'Forbidden')
			response.end()
		} else {
			PATH.exists(path, function(exists) {
				if(exists) {
					var head = {}
					if(/css$/.test(path)) {
						head['Content-Type'] = 'text/css'
					}
					if(/js$/.test(path)) {
						head['Content-Type'] = 'text/javascript'
					}
					if(/png$/.test(path)) {
						head['Content-Type'] = 'image/png'
					}
					if(/(jpg|jpeg)$/.test(path)) {
						head['Content-Type'] = 'image/jpeg'
					}
					console.log('served static file', path, 'with head', SYS.inspect(head))
					response.writeHead(200, head)
					response.write(FS.readFileSync(path))
					response.end()
				} else {
					response.writeHead(404)
					response.end()
				}
			})
		}
	// not found.
	} else {
		response.writeHead(404, 'Not Found!!')
		response.end()
	}
  
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');