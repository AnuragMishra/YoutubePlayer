(function(global) {
    /**
     * Creates a new YoutubePlayer object
     *
     * @constructor
     * @param {String} HTML id of the element containing the Youtube flash player
     * @param {String} Youtube video id
     * @param (Object) Optional extra configuration data
     *
     * @returns {YoutubePlayer} An object of YoutubePlayer
     */
    function YoutubePlayer(elementId, videoId, extra) {
        this.id = elementId;
        this.videoId = videoId;
        this.handlers = {};
        this.ref = null;
        
        this.width = '425';
        this.height = '356';
        this.flashVersion = '8';
        this.params = { allowScriptAccess: 'always' };
        this.attrs = { id: this.id };
        
        var mergeExtras = function(from, into) {
            for( var key in from) {
                into[key] = from[key];
            }
        };
        if(extra) {
            if(extra.params)
                mergeExtras( extra.params, this.params );
            if(extra.attrs)
                mergeExtras( extra.attrs, this.attrs );
            if(extra.width)
                this.width = extra.width;
            if(extra.height)
                this.height = extra.height;
            if(extra.flashVersion)
                this.flashVersion = extra.flashVersion;
        }

        this.embed();

        YoutubePlayer.register(this);
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
    YoutubePlayer.prototype.embed = function() {
        var videoUrl = 'http://www.youtube.com/v/{videoId}?enablejsapi=1&playerapiid={playerId}';
        videoUrl = videoUrl.replace('{videoId}', this.videoId);
        videoUrl = videoUrl.replace('{playerId}', this.id);

        if(!swfobject) {
            throw new ReferenceError('YoutubePlayer depends on the SWFObject library but it is missing.');
        }

        var player = this;
        swfobject.embedSWF(videoUrl, this.id, this.width, this.height,
                           this.flashVersion, null, null, this.params,
                           this.attrs, function(e){
            player.ref = e.ref;
        });
        
    };

    /**
     * Add the given handler as a listener for the given event
     *
     * @param eventName {String} name of the event
     * @param handler {Function} callback for the event
     */
    YoutubePlayer.prototype.on = function(eventName, handler) {
        this.handlers[eventName] = this.handlers[eventName] || [];
        this.handlers[eventName].push(handler);
    };

    /**
     * Sets up event handlers for player state
     * changes once it's available.
     *
     * @private
     *
     */
    YoutubePlayer.prototype.onReady = function() {
        var player = document.getElementById(this.id);
        var callbackStr = 'YoutubePlayer.dispatchEvent("{id}")';
        var callback = callbackStr.replace("{id}", this.id);

        player.addEventListener('onStateChange', callback);
    };

    /**
     * Receives notification of player state changes
     *
     * @private
     * @param eventId {String} Youtube player event id
     *
     */
    YoutubePlayer.prototype.notifyEvent = function(eventId) {
        var states = YoutubePlayer.STATES;

        for(var eventName in states) {
            if(states[eventName] == eventId) {
                this.fireEvent(eventName);
            }
        }
    };

    /**
     * Notify each registered subscriber of this event
     *
     * @param eventName {String} Name of the player event
     */
    YoutubePlayer.prototype.fireEvent = function(eventName) {
        var handlers = this.handlers[eventName];
        if(!handlers) {
            return;
        }

        for(var i = 0; i < handlers.length; i++) {
            handlers[i](eventName);
        }
    };

    /**
     * Holds instances of player objects to be able to
     * dispatch events to them globally
     *
     * @private
     */
    YoutubePlayer.instances = [];

    /**
     * @private
     */
    YoutubePlayer.register = function(player) {
        this.instances.push(player);
    };

    /**
     * Search the player object by its HTML id.
     * Useful when dispatching events to the player object
     * sent from the Youtube flash player

     * @param playerId {String} HTML id of the player object
     * @returns {YoutubePlayer} The object of YoutubePlayer that wraps this player
     *
     * @private
     */
    YoutubePlayer.findById = function(playerId) {
        var player = null;

        for(var i = 0; i < this.instances.length; i++) {
            if(this.instances[i].id == playerId) {
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
    YoutubePlayer.dispatchEvent = function(playerId) {
        var player = YoutubePlayer.findById(playerId);
        return function(eventId) {
            player.notifyEvent(eventId);
        };
    };

    /**
     * Various state change events that the Youtube flash player triggers
     *
     * @private
     */
    YoutubePlayer.STATES = {
        unstarted:  -1,
        ended:      0,
        playing:    1,
        paused:     2,
        buffering:  3,
        cued:       5
    };

    /**
     * Make the YoutubePlayer available globally
     */
    global.YoutubePlayer = YoutubePlayer;

    /**
     * Create a global handler that receives notification of when
     * the Youtube flash player has been initialized
     * on the page
     *
     * @param playerId {String}
     */
    global.onYouTubePlayerReady = function(playerId) {
        YoutubePlayer.findById(playerId).onReady();
    };

})(window);