## About

YoutubePlayer is a JavaScript wrapper for Youtube's flash player and provides a simpler interface for listening to video playback events by the flash player. You can add multiple videos on the page by creating an object of YoutubePlayer for each video, and can subscribe to events on that object.
	
Thanks to James Coglan for coming up with some [great ideas](http://blog.jcoglan.com/2008/05/22/dispatching-youtube-api-events-to-individual-javascript-objects/) on overcoming the limited Flash-JavaScript communication offered by the Youtube APIs with a very well designed interface.

## Usage

Include `YoutubePlayer.js` and its dependency `SWFObject`.

	<script src="http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"></script>
	<script src="YoutubePlayer.js"></script>

For each video that is to be embedded on the page, add a placeholder div element on the page and give it an `id`.

	<div id="inception"></div>
	<div id="easyA"></div>

To replace the placeholder div with the actual flash player, simply instantiate an object of YoutubePlayer and pass it the id of the placeholder div and the id of the Youtube video.

	var inceptionTrailer = new YoutubePlayer('inception', '66TuSJo4dZM');
	var easyATrailer = new YoutubePlayer('easyA', 'DL7W6pEuAW0');

YoutubePlayer takes an optional 3rd object parameter to overload the default behavior:

	var inceptionTrailer = new YoutubePlayer('inception', '66TuSJo4dZM', {
		width: 640,
		height: 360,
		params: { allowFullScreen: 1 },
		attrs:  { class: 'ytembed' }
	});

	All fields are optional, the defaults will be used if not included.

To listen to playback events, add a handler to the above objects for the supported events.

	inceptionTrailer.on('paused', function() {
		alert("Paused Inception's trailer");
	});

	easyATrailer.on('playing', function() {
		alert("Started playing Easy-A's trailer");
	});

The full Youtube JS API is available via the 'ref' field:

	inceptionTrailer.on('playing', function() {
		easyATrailer.ref.pauseVideo();
	});
	
See a demo of the script at [http://jsfiddle.net/bhRCg/32/](http://jsfiddle.net/bhRCg/32/).

## List of Supported Events

	unstarted
	ended
	playing
	paused
	buffering
	cued

## Dependencies

This library depends on the SWFObject library for embedding videos on the page. See the [source code](http://code.google.com/p/swfobject/source/checkout) and [documentation](http://code.google.com/p/swfobject/wiki/documentation) for SWFObject. 

Google Code provides a [hosted version](http://code.google.com/p/swfobject/wiki/hosted_library) of the library which can be included (compressed)

	http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js
	
or (uncompressed)

	http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject_src.js