(function(window){

	/**
	 * Creates a new YoutubeIframePlayer object
	 *
	 * @constructor
	 * @param {String} HTML id of the element containing the Youtube flash player
	 * @param {String} Youtube video id
	 * @param (Object) Optional options configuration data
	 *
	 * @returns {YoutubeIframePlayer} An object of YoutubeIframePlayer
	 */
	function YoutubeIframePlayer(elementId, videoId, options){
		this.id = elementId;
		this.videoId = videoId;
		this.listeners = {};
		this.width = '425';
		this.height = '356';
		this.playerVars = { autohide: 1, showinfo: 0 };
		
		if(options){
			if(options.width) this.width = options.width;
			if(options.height) this.height = options.height;
			if(options.playerVars) this.playerVars = options.playerVars;
		}

		YoutubeIframePlayer.register(this);
		
		if(!window.YT && !YoutubeIframePlayer.onIframeAPIReady){
			YoutubeIframePlayer.onIframeAPIReady = window.onYouTubeIframeAPIReady;
			window.onYouTubeIframeAPIReady = bind(window.onYouTubeIframeAPIReady, this, this.id);
			var tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		} else {
			YoutubeIframePlayer.onIframeAPIReady(this.id, true);
		}
	}

	/**
	 * Embeds the Youtube video on the page replacing the placeholder
	 * element whose id was passed in the constructor.
	 *
	 * The <object> element that replaces the placeholder gets the same
	 * id as that of the placeholder
	 *
	 * This relies on the SWFObject library.
	 * @requires swfobject See http://code.google.com/p/swfobject/wiki/hosted_library
	 *
	 * @private
	 *
	 */
	YoutubeIframePlayer.prototype.embed = function(){
		if(!window.YT) return;
		return new YT.Player(this.id, {
			events: { 'onStateChange': YoutubeIframePlayer.dispatchEvent(this.id) },
			playerVars: this.playerVars,
			videoId: this.videoId,
			height: this.height,
			width: this.width
		});
	};

	/**
	 * Add the given handler as a listener for the given event
	 *
	 * @param eventName {String} name of the event
	 * @param handler {Function} callback for the event
	 */
	YoutubeIframePlayer.prototype.on = function(events, handler){
		events = events.split(',');
		for(var i = 0; i < events.length; i++){
			this.listeners[events[i]] = this.listeners[events[i]] || [];
			this.listeners[events[i]].push(handler);
		}
	};

	/**
	 * Receives notification of player state changes
	 *
	 * @private
	 * @param eventId {String} Youtube player event id
	 *
	 */
	YoutubeIframePlayer.prototype.notifyEvent = function(eventId, target){
		var states = YoutubeIframePlayer.STATES;
		for(var eventName in states){
			if(states[eventName] == eventId){
				this.fireEvent(eventName, target);
			}
		}
	};

	/**
	 * Notify each registered subscriber of this event
	 *
	 * @param eventName {String} Name of the player event
	 */
	YoutubeIframePlayer.prototype.fireEvent = function(eventName, target){
		var listeners = this.listeners[eventName];
		if(!listeners){
			return;
		}
		for(var i = 0; i < listeners.length; i++){
			listeners[i](eventName, target);
		}
	};

	/**
	 * Holds instances of player objects to be able to
	 * dispatch events to them windowly
	 *
	 * @private
	 */
	YoutubeIframePlayer.instances = [];

	/**
	 * @private
	 */
	YoutubeIframePlayer.register = function(player){
		this.instances.push(player);
	};

	/**
	 * Search the player object by its HTML id.
	 * Useful when dispatching events to the player object
	 * sent from the Youtube flash player

	 * @param playerId {String} HTML id of the player object
	 * @returns {YoutubeIframePlayer} The object of YoutubeIframePlayer that wraps this player
	 *
	 * @private
	 */
	YoutubeIframePlayer.findById = function(playerId){
		var player = null;
		for(var i = 0; i < this.instances.length; i++){
			if(this.instances[i].id == playerId){
				player = this.instances[i];
			}
		}
		return player;
	};

	/**
	 * Central event dispatcher which receives all player
	 * events directly from the flash player and dispatches
	 * them to the player object for which the event occurred.
	 *
	 * @param playerId
	 *
	 * @private
	 */
	YoutubeIframePlayer.dispatchEvent = function(playerId){
		var player = YoutubeIframePlayer.findById(playerId);
		return function(state) {
			player.notifyEvent(state.data, state.target || YoutubeIframePlayer.STATES.ready);
		};
	};

	/**
	 * Various state change events that the Youtube flash player triggers
	 *
	 * @private
	 */
	YoutubeIframePlayer.STATES = {
		unstarted: -1,
		ended:      0,
		playing:    1,
		paused:     2,
		buffering:  3,
		cued:       5
	};

	/**
	 * Make the YoutubeIframePlayer available windowly
	 */
	window.YoutubeIframePlayer = YoutubeIframePlayer;

	/**
	 * Create a window handler that receives notification of when
	 * the Youtube flash player has been initialized
	 * on the page
	 *
	 * @param playerId {String}
	 */
	window.onYouTubeIframeAPIReady = function(playerId, alreadyLoaded){
		YoutubeIframePlayer.findById(playerId).embed();
		if(!alreadyLoaded){
			var instances = YoutubeIframePlayer.instances.slice();
			instances.shift();
			for(var i = 0; i < instances.length; i++){
				YoutubeIframePlayer.findById(instances[i].id).embed();
			}
		}
	};

	function bind(method){ 
		var args = Array.prototype.slice.call(arguments, 1), object = args.shift(); 
		return function(){ 
			return method.apply(object, args.concat(Array.prototype.slice.call(arguments))); 
		}; 
	}

})(this);