(function(window, document, undefined){
	'use strict';
	
	function YoutubeIframePlayer(elementId, options){
		this.defaults = {
			playerVars: { autohide: 1, showinfo: 0, rel:0, enablejsapi:1, modestbranding:1, html5:1 },
			videoId: '',
			width: '100%',
			height: '100%'
		};
		this.id = elementId;
		this.listeners = {};
		this.video = null;
		this.options = options || this.defaults;
		this.options.events = this.options.events || {}; 
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

	YoutubeIframePlayer.prototype.embed = function(){
		if(!window.YT) return;
		this.options.events['onReady'] = YoutubeIframePlayer.dispatchEvent(this.id);
		this.options.events['onStateChange'] = YoutubeIframePlayer.dispatchEvent(this.id);
		return new YT.Player(this.id, this.options);
	};

	YoutubeIframePlayer.prototype.on = function(events, handler){
		events = events.split(',');
		for(var i = 0; i < events.length; i++){
			this.listeners[events[i]] = this.listeners[events[i]] || [];
			this.listeners[events[i]].push(handler);
		}
	};

	YoutubeIframePlayer.prototype.off = function(events){
		events = events.split(',');
		for(var i = 0; i < events.length; i++){
			this.listeners[events[i]].pop();
		}
	};

	YoutubeIframePlayer.prototype.notifyEvent = function(eventId, target){
		var states = YoutubeIframePlayer.STATES;
		for(var eventName in states){
			if(states[eventName] == eventId){
				this.fireEvent(eventName, target);
			}
		}
	};

	YoutubeIframePlayer.prototype.fireEvent = function(eventName, target){
		var listeners = this.listeners[eventName];
		if(!listeners){
			return;
		}
		for(var i = 0; i < listeners.length; i++){
			listeners[i](eventName, target);
		}
	};

	YoutubeIframePlayer.instances = [];

	YoutubeIframePlayer.register = function(player){
		this.instances.push(player);
	};
	
	YoutubeIframePlayer.destroy = function(playerId){
		var player = null;
		for(var i = 0; i < this.instances.length; i++){
			if(this.instances[i].id == playerId){
				player = this.instances[i];
				player.video && player.video.destroy();
				instances.splice(i, 1);
			}
		}
	};

	YoutubeIframePlayer.findById = function(playerId){
		var player = null;
		for(var i = 0; i < this.instances.length; i++){
			if(this.instances[i].id == playerId){
				player = this.instances[i];
			}
		}
		return player;
	};

	YoutubeIframePlayer.dispatchEvent = function(playerId){
		var player = YoutubeIframePlayer.findById(playerId);
		return function(state) {
			player.notifyEvent(state.data !== null ? state.data : YoutubeIframePlayer.STATES.ready, player.video);
		};
	};

	YoutubeIframePlayer.STATES = {
		ready:'ready',
		unstarted: -1,
		ended:      0,
		playing:    1,
		paused:     2,
		buffering:  3,
		cued:       5
	};

	window.YoutubeIframePlayer = YoutubeIframePlayer;

	window.onYouTubeIframeAPIReady = function(playerId, alreadyLoaded){
		var firstPlayer = YoutubeIframePlayer.findById(playerId);
		firstPlayer.video = firstPlayer.embed();
		if(!alreadyLoaded){
			var instances = YoutubeIframePlayer.instances.slice();
			instances.shift();
			for(var i = 0; i < instances.length; i++){
				instances[i].video = YoutubeIframePlayer.findById(instances[i].id).embed();
			}
		}
	};

	function bind(method){ 
		var args = Array.prototype.slice.call(arguments, 1), object = args.shift(); 
		return function(){ 
			return method.apply(object, args.concat(Array.prototype.slice.call(arguments))); 
		}; 
	}

})(this, this.document);
