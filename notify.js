/*!
 * jQuery Notify Plugin
 *
 * Copyright (c) 2012, 2013 David Persson
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($) {

  // Global configuration.
  var config = {
    // Selector of the container in which messages will be added.
    container: '#messages',
    element: '<div class="message hide"></div>',

    // Number of maximum pending messages, all other messages
    // will be discarded to prevent flooding.
    maxPending: 2,

    // Base timeout until a message will be removed after it's shown.
    timeout: 2100,

    // Show function used when a message should appear; must return a
    // promise which should be resolved when i.e. the show animation
    // finished.
    show: function($m) {
      var dfr = new $.Deferred();

      if (typeof Modernizr !== 'undefined' && Modernizr.csstransitions) {
        $m.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', dfr.resolve);
        $m.removeClass('hide');
      } else {
        $m.fadeIn(dfr.resolve);
      }
      return dfr.promise();
    },

    // Hide function used when a message should disappear; must return
    // a promise which should be resolved when i.e. the hide animation
    // finished.
    hide: function($m) {
      var dfr = new $.Deferred();

      if (typeof Modernizr !== 'undefined' && Modernizr.csstransitions) {
        $m.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', dfr.resolve);
        $m.addClass('hide');
      } else {
        $m.fadeOut(dfr.resolve);
      }
      return dfr.promise();
    }
  };

  // Our own personal queue.
  var queue = $({});

  // Renders a message and calls complete callback after doing that.
  var render = function(html, options, complete) {
    var $m = $(config.element).html(html);

    if (options.level) {
      $m.addClass(level);
    }
    if (options.sticky) {
      $m.addClass('sticky');
    }
    $(config.container).append($m);

    if (options.sticky) {
      $m.click(function(ev) {
        config.hide(m).done(function() {
          $m.remove();
          complete();
        });
      });
      return; // Do not continue and probably show next message.
    }

    // Multiply the timeout for complex messages, giving comprehension time.
    // Give 1s per 30 chars over the first 25 chars.
    options.timeout = 1000 * (($($.parseHTML(html)).text().length - 25) / 30);

    config.show($m).done(function() {
      setTimeout(function() {
        config.hide($m).done(function() {
          $m.remove();
          complete(); // Show next message in queue.
        });
      }, options.timeout);
    });
  };

  // Main plugin function. Allows for adding a notification and
  // configuring the plugin globally.
  $.notify = function(html, options) {
    // Allow setting global configuration for this plugin.
    if (typeof html === 'object') {
      config = $.extend(html, config);
      return;
    }
    options = $.extend(options || {}, {
      level: null,
      sticky: false,
      timeout: config.timeout
    });

    // Prevent flooding; no more than 2 pending messages. We start at
    // zero as this is called before the first item is queued.
    if (queue.queue().length >= config.maxPending) {
      return;
    }
    // Currently only one message at the time. Allowing showing multiple
    // message here will might need a more sophisticated method of managment.
    queue.queue(function(next) {
      render(html, options, next);
    });
  };

})(jQuery);
