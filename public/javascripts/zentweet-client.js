$(function() {
	var makeTagLinks = function(str) {
		return str.replace(/(#\w+)/g, '<a class="tag" href="#">$1</a>')
	}
	
	var createTweet = function(tweet, callback) {
		$.post('/tweets',tweet, function() {
			console.log('created tweet', tweet)
			if(callback) callback()
		})
	}
	
	var listTweets = function(params, callback) {
		$.get('/tweets', params || {}, function(data) {
			console.log('list tweets', data)
			if(callback) callback(data)
		})
	}
	
	var updateTweetList = function(params) {
		listTweets(params, function(data) {
			var $ul = $('#tweets ul')
			$ul.children().remove()
			$.each(data, function(i, tweet) {
				$ul.append('<li><img src="/public/images/zengularity-logo-without-name.png" class="picture"/><a href="#" class="user">SGO</a>' + makeTagLinks(tweet.message) + '</div></li>')
			})
		})
	}
	
	$('#new-tweet form').submit(function() {
		createTweet(JSON.stringify({"message": $('#message').val()}), function() {
			updateTweetList()
		})
		return false
	})
	
	$('#search').submit(function() {
		updateTweetList({search: $('#search input').val()})
		return false
	})
	
	$('.tag').live('click', function() {
		$('#search input').val($(this).text())
		$('#search').submit()
		return false
	})
	
	updateTweetList()
})