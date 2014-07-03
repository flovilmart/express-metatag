express-metatag
===============

ExpressJS metatag injection middleware

Middleware that injects metatags into your document <head>


##Installation

npm install --save express-metatag

#Usage


	var Meta = require('express-metatag');
	var middleware =  Meta(name, ignorePrefix)({
		tag: 'a'
	});
	app.use(middleware);
	/*
		You can also use with an array
		 middleware =  Meta(name, ignorePrefix)([{
			tag: 'a'
		}, {
			othertag: 'b'
		}]);
	
		or with a function
		
		middleware = Meta(name, ignorePrefix)(function(req, res, next){
			return {
				tag: req.params.myparam
			}
		});
	*/

	
##Examples

###Inject Facebook opengraph tags:


	var OG = require('express-metatag')('og')
	app.use(OG([{
		title: 'Hello World',
		description: 'Amazing module'
	}]));
	
Result:

	<head>
		...
		<meta property="og:title" content="Hello World">
		<meta property="og:decription" content="Amazing module">
	</head>
	

###Inject other tags:

	var ML = require('express-metatag')('tags', true)
	app.use(ML([{
		'twitter:title': 'Hello World',
		'twitter:description': 'Amazing module'
	}, {
		'og:title': 'Hello World',
		'og:description' : 'Amazing module'
	}]));
	
Result: 

	<head>
		<meta property="twitter:title" content="Hello World">
		<meta property="twitter:description" content="Amazing module">
		<meta property="og:title" content="Hello World">
		<meta property="og:description" content="Amazing module">
	</head>