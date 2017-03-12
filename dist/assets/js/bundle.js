(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Breakpoints for JavaScript. Works with the Deloitte Digital SCSS @bp mixin and Less .bp mixin
 *
 * @namespace bp
 * @memberof DD
 * @version 1.1.1
 * @copyright 2012-2017 Deloitte Digital Australia - http://www.deloittedigital.com/au
 * @author Deloitte Digital Australia deloittedigital@deloitte.com.au
 * @license BSD 3-Clause (http://opensource.org/licenses/BSD-3-Clause)
 */
(function (root, factory) {
    // UMD wrapper - Works with node, AMD and browser globals.
    // Using the returnExports pattern as a guide:
    // https://github.com/umdjs/umd/blob/master/templates/returnExports.js

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.DD = root.DD || {};

        root.DD.bp = factory();
    }
}(this, function () {

    var _minBreakpoints,
        _maxBreakpoints,
        _options = {
            isResponsive: true,
            baseFontSize: 16,
            breakpoints: [
                {
                    name: 'xxs',
                    px: 359
                },
                {
                    name: 'xs',
                    px: 480
                },
                {
                    name: 's',
                    px: 640
                },
                {
                    name: 'm',
                    px: 768
                },
                {
                    name: 'l',
                    px: 1024
                },
                {
                    name: 'xl',
                    px: 1244
                },
                {
                    name: 'xxl',
                    px: 1410
                }
            ],
            staticRange: {
                min: 0,
                max: 'xl'
            }
        },
        _initBreakpoints,
        _parseMinMaxInputs,
        _pxToEms,
        _bpToEms,
        _bpIsValidForStatic,
        _bpMin,
        _bpMax,
        _bpBetween,
        get,
        getHeight,
        is,
        isHeight,
        options;

    /**
     * Sorts the breakpoints and assigns them to an associative array for more efficient lookup.
     * Immediately invoked on initialisation
     *
     * @memberof DD.bp
     * @private
     */
    _initBreakpoints = function() {
        //sort the breakpoints into order of smallest to largest
        var sortedBreakpoints = _options.breakpoints.sort(function(a, b) {
            // only sort if the correct objects are present
            if (a.px < b.px) {
                return -1;
            }

            if (a.px > b.px) {
                return 1;
            }

            return 0;
        });

        // reset the breakpoints
        _minBreakpoints = {};
        _maxBreakpoints = {};

        // loop through sorted breakpoints to generate a quick lookup object using the name as a key
        for (var i = 0, len = sortedBreakpoints.length, last = len - 1; i < len; i += 1) {
            _minBreakpoints[sortedBreakpoints[i].name] = parseInt(sortedBreakpoints[i].px, 10);

            // skip the last item in the list as we assume there is no maximum for the last
            if (i < last) {
                // the max breakpoint of the current size is the next breakpoints
                // width minus 1px so there is no overlap between breakpoints
                _maxBreakpoints[sortedBreakpoints[i].name] = parseInt(sortedBreakpoints[i + 1].px - 1, 10);
            }
        }
    };
    _initBreakpoints();

    /**
     * Splits string syntax 'xs,m' into separate values 'xs' and 'm'
     * Converts string '5' to numeric 5
     *
     * @memberof DD.bp
     * @private
     * @param  {String|Number} min Number in pixels or string notation
     * @param  {String|Number} max Number in pixels or string notation
     * @return {Object} Object containing the min and max values parsed as a number
     */
    _parseMinMaxInputs = function(min, max) {
        var parseValue = function(val) {
                if (typeof (val) === 'string') {
                    // Strip whitespace
                    val = val.replace(/\s/g, '');

                    // If val only contains digits, convert it to a number
                    if (/^\d+$/.test(val)) {
                        val = parseInt(val, 10);
                    }
                }

                return val;
            },
            bpArray,
            resultMin = min,
            resultMax = max || 0;

        // check if it's using the string syntax, if so - split it
        if (typeof (min) === 'string' && min.indexOf(',') !== -1 && resultMax === 0) {
            bpArray = min.split(',');
            if (bpArray.length === 2) {
                resultMin = bpArray[0];
                resultMax = bpArray[1];
            }
        }

        return {
            min: parseValue(resultMin),
            max: parseValue(resultMax)
        };
    };

    /**
     * Converts a number of pixels into em
     *
     * @memberof DD.bp
     * @private
     * @param  {Number} px Number in pixels
     * @return {String} The converted number in em as a string
     */
    _pxToEms = function(px) {
        return px / _options.baseFontSize;
    };

    /**
     * Converts a breakpoint name/value (e.g. l) to the px variable then to ems
     *
     * @memberof DD.bp
     * @private
     * @param  {String|Number} breakpoint Breakpoint name as a string, or as a number in pixels
     * @param  {Boolean} [isMax=false] Flag to determine if the min or max of the breakpoint needs to be used
     * @return {String} The converted number in em as a string
     */
    _bpToEms = function(breakpoint, isMax) {
        if (typeof (breakpoint) === 'number') {
            return _pxToEms(breakpoint);
        }

        var list = (isMax === true) ? _maxBreakpoints : _minBreakpoints,
            ems = '0';

        for (var key in list) {
            if (list.hasOwnProperty(key)) {
                if (breakpoint === key.toLowerCase()) {
                    ems = _pxToEms(list[key]);
                }
            }
        }

        if (ems === '0') {
            console.warn('DD.bp: Breakpoint \'' + breakpoint + '\' doesn\'t exist - replacing with 0');
        }

        return ems;
    };

    /**
     * Checks if the breakpoint provided falls inside the valid static min/max region
     *
     * @memberof DD.bp
     * @private
     * @param  {String|Number} min Breakpoint name as a string, as a number in pixels, or as string notation containing both breakpoints
     * @param  {String|Number} max Breakpoint name as a string, or as a number in pixels
     * @param  {Boolean} [property='width'] which property to check for (e.g. width or height)
     * @return {Boolean} If the breakpoint fits inside the static range or not
     */
    _bpIsValidForStatic = function(min, max, property) {
        if (typeof (property) !== 'string') {
            property = 'width'; //default to width based media query
        }

        if (property !== 'width') {
            return false;
        }

        var bpValidMin = _bpToEms(_options.staticRange.min),
            bpValidMax = _bpToEms(_options.staticRange.max, true),
            parsed = _parseMinMaxInputs(min, max),
            bpMin = _bpToEms(parsed.min),
            bpMax = _bpToEms(parsed.max);

        // if max is 0 we have a min-and-above situation
        if (parsed.max === 0) {
            // need to check that the min is greater than the valid min,
            // AND also that the min is less than the valid maximum
            if (bpMin >= bpValidMin && bpMin < bpValidMax) {
                return true;
            }

            return false;
        }

        // if min is 0 we have a max-and-below situation
        if (parsed.min === 0) {
            if (bpMax >= bpValidMax) {
                return true;
            }

            return false;
        }

        // if the min is above the valid max, or the max is below the valid min
        if (bpMin > bpValidMax || bpMax < bpValidMin) {
            return false;
        }

        // if the breakpoint is a bp-between (assumed because $max and $min aren't 0)
        // don't show if the max isn't above the valid max
        if (bpMax < bpValidMax) {
            return false;
        }

        return true;
    };

    /**
     * Returns a min-width media query based on bp name or px
     *
     * @memberof DD.bp
     * @private
     * @param  {String|Number} min Breakpoint name as a string, or as a number in pixels
     * @param  {String} [property='width'] Property to check using a media query. e.g. width or height
     * @return {String} Media query string
     */
    _bpMin = function(min, property) {
        var bpMin = _bpToEms(min),
            bpType = (typeof (property) === 'string') ? property : 'width';

        return '(min-' + bpType + ': ' + bpMin + 'em)';
    };

    /**
     * Returns a max-width media query based on bp name or px
     *
     * @memberof DD.bp
     * @private
     * @param  {String|Number} max Breakpoint name as a string, or as a number in pixels
     * @param  {String} [property='width'] Property to check using a media query. e.g. width or height
     * @return {String} Media query string
     */
    _bpMax = function(max, property) {
        var bpMax = _bpToEms(max, true),
            bpType = (typeof (property) === 'string') ? property : 'width';

        return '(max-' + bpType + ': ' + bpMax + 'em)';
    };

    /**
     * Returns a min-width and max-width media query based on bp name (can be the same bp name) or px
     *
     * @memberof DD.bp
     * @private
     * @param  {String|Number} min Breakpoint name as a string, or as a number in pixels
     * @param  {String|Number} max Breakpoint name as a string, or as a number in pixels
     * @param  {String} [property='width'] Property to check using a media query. e.g. width or height
     * @return {String} Media query string
     */
    _bpBetween = function(min, max, property) {
        var bpMin = _bpToEms(min),
            bpMax = _bpToEms(max, true),
            bpType = (typeof (property) === 'string') ? property : 'width';

        return '(min-' + bpType + ': ' + bpMin + 'em) and (max-' + bpType + ': ' + bpMax + 'em)';
    };

    /**
     * Breakpoint function that can take the input of a min and max
     * breakpoint by name or number (in px) along with a property
     * (like width or height) and returns the media query as a string
     *
     * @memberof DD.bp
     * @example
     * // large and above
     * DD.bp.get('l');
     *
     * @example
     * // 300px and above
     * DD.bp.get(300);
     *
     * @example
     * // large and below
     * DD.bp.get(0, 'l');
     *
     * @example
     * // 300px and below
     * DD.bp.get(0, 300);
     *
     * @example
     * // Between small and large
     * DD.bp.get('s', 'l');
     *
     * @example
     * // Between 100px and 300px
     * DD.bp.get(100, 300);
     *
     * @example
     * // High resolution displays (can use 'hdpi' as well)
     * DD.bp.get('retina');
     *
     * @example
     * // Can mix and match names and numbers - between 200px and xlarge
     * DD.bp.get(200, 'xl');
     *
     * @example
     * // Between small and 960px
     * DD.bp.get('s', 960);
     *
     * @example
     * // Can use a single string (no spaces) - useful for passing through from HTML to JS
     * DD.bp.get('m,l');
     *
     * @example
     * // Can also mix names and numbers
     * DD.bp.get('xs,1000');
     *
     * @param  {String|Number} min Breakpoint name as a string, or as a number in pixels, or in comma separated string notation
     * @param  {String|Number} [max=0] Breakpoint name as a string, or as a number in pixels
     * @param  {String} [property='width'] Property to check using a media query. e.g. width or height
     * @return {String} Media query string
     */
    get = function(min, max, property) {
        var parsed = _parseMinMaxInputs(min, max),
            bpMin = parsed.min,
            bpMax = parsed.max;

        if (typeof (property) !== 'string') {
            property = 'width'; //default to width based media query
        }

        //check what type of bp it is
        if (bpMin === 'retina' || bpMin === 'hdpi') {
            return '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-device-pixel-ratio: 1.5)';
        } else if (bpMax === 0) {
            return _bpMin(bpMin, property);
        } else if (bpMin === 0) {
            return _bpMax(bpMax, property);
        } else {
            return _bpBetween(bpMin, bpMax, property);
        }
    };

    /**
     * Shortcut for the get() function that returns a height
     * based media query and returns the media query as a string
     *
     * @memberof DD.bp
     * @example
     * // Height of 300px and above
     * DD.bp.getHeight(300);
     *
     * @example
     * // Height of 300px and below
     * DD.bp.getHeight(0, 300);
     *
     * @example
     * // Between 100px and 300px high
     * DD.bp.getHeight(100, 300);
     *
     * @param  {String|Number} min Breakpoint name as a string, or as a number in pixels, or in comma separated string notation
     * @param  {String|Number} [max=0] Breakpoint name as a string, or as a number in pixels
     * @return {String} Media query string
     */
    getHeight = function(min, max) {
        return get(min, max, 'height');
    };

    /**
     * Breakpoint function that takes the same inputs as get() but
     * instead of returning the media query as a string returns
     * if the current page matches that query as a boolean using
     * window.matchMedia(mq).matches
     *
     * @memberof DD.bp
     * @example
     * // returns true if the page is between xs and s
     * DD.bp.is('xs,s');
     * DD.bp.is('xs','s');
     *
     * @example
     * // returns true if the page is between 0 and 300px wide
     * DD.bp.is('0,300');
     * DD.bp.is(0, 300);
     *
     * @param  {String|Number} min Breakpoint name as a string, or as a number in pixels, or in comma separated string notation
     * @param  {String|Number} [max=0] Breakpoint name as a string, or as a number in pixels
     * @param  {String} [property='width'] Property to check using a media query. e.g. width or height
     * @return {Boolean}
     */
    is = function(min, max, property) {
        if (_options.isResponsive === false) {
            return _bpIsValidForStatic(min, max, property);
        }

        if (window.matchMedia) {
            return window.matchMedia(get(min, max, property)).matches;
        }

        console.warn('DD.bp: Match Media not supported by this browser. Consider adding a polyfill.');

        return false;
    };

    /**
     * Shortcut for the is() function that returns a height
     * based media query and returns the media query as a boolean
     *
     * @memberof DD.bp
     * @example
     * // returns true if the page is between 0 and 300px high
     * DD.bp.isHeight('0,300');
     * DD.bp.isHeight(0, 300);
     *
     * @param  {String|Number} min Breakpoint name as a string, or as a number in pixels, or in comma separated string notation
     * @param  {String|Number} [max=0] Breakpoint name as a string, or as a number in pixels
     * @return {Boolean}
     */
    isHeight = function(min, max) {
        return is(min, max, 'height');
    };

    /**
     * Valid options for the Breakpoints array
     *
     * @typedef  {Object} DD.bp.BreakpointOptions
     * @property {String} name Name of the breakpoint e.g. 's', 'm', 'l'
     * @property {Number} px Number in px for the size of the breakpoint
     */

    /**
     * Valid options for the Breakpoints library
     *
     * @typedef  {Object} DD.bp.Options
     * @property {Number} [baseFontSize] Number in px to be used as a base font size in order to calculate em values
     * @property {DD.bp.BreakpointOptions[]} [breakpoints]
     */

    /**
     * User updatable options
     *
     * @memberof DD.bp
     * @example
     * // update the base font size only
     * DD.bp.options({
     *   baseFontSize: 14
     * });
     *
     * @example
     * // update the breakpoints
     * DD.bp.options({
     *   breakpoints: [
     *     { name: 'small', px: 400 },
     *     { name: 'medium', px: 800 },
     *     { name: 'large', px: 1200 }
     *   ]
     * });
     *
     * @param  {DD.bp.Options} opts Options inside the library to be updated
     * @return {Boolean}
     */
    options = function(opts) {
        if (typeof (opts.isResponsive) === 'boolean') {
            _options.isResponsive = opts.isResponsive;
        }

        if (typeof (opts.baseFontSize) === 'number') {
            _options.baseFontSize = opts.baseFontSize;
        }

        if (typeof (opts.breakpoints) === 'object' && opts.breakpoints.length > 0) {
            var isValid = true,
                bps = opts.breakpoints;

            // loop through the breakpoints to check validity
            for (var i = 0, len = bps.length; i < len; i += 1) {
                if ((bps[i].hasOwnProperty('name') && bps[i].hasOwnProperty('px')) === false) {
                    isValid = false;
                }
            }

            if (isValid) {
                _options.breakpoints = opts.breakpoints;
                _initBreakpoints();
            } else {
                console.warn('DD.bp: Invalid breakpoints array entered. Please use the format {name: \'string\', px: number}');
                return false;
            }
        }

        return true;
    };

    return {
        get: get,
        getHeight: getHeight,
        is: is,
        isHeight: isHeight,
        options: options
    };
}));

},{}],2:[function(require,module,exports){
'use strict';

// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function noop() {};
    var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'];
    var length = methods.length;
    var console = window.console = window.console || {};

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
})();

// Place any jQuery/helper plugins in here.

},{}],3:[function(require,module,exports){
'use strict';

var _ddbreakpoints = require('ddbreakpoints');

var _ddbreakpoints2 = _interopRequireDefault(_ddbreakpoints);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.info(_ddbreakpoints2.default.is('s'));
//
// import test from './modules/modules1';
//
// function component() {
// 	let element = document.createElement('div');
//
//
// 	element.innerHTML = 'asdfdsaf hey there';
//
// 	return element;
// }
//
// document.body.appendChild(component());
//
// test.aaa();
//
// const person = {
//   name: 'Ryan Christiani'
// };
//
// const testString = `My name is not ${person.name}`;
//
// document.write(testString);
//
// console.info(what);
// var ddbreakpoints = require('ddbreakpoints');
// console.info('ddbreakpoints', ddbreakpoints);

},{"ddbreakpoints":1}]},{},[2,3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGRicmVha3BvaW50cy9saWIvZGQuYnJlYWtwb2ludHMuanMiLCJzcmMvYXNzZXRzL2pzL3BsdWdpbnMuanMiLCJzcmMvYXNzZXRzL2pzL3NjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM2lCQTtBQUNDLGFBQVc7QUFDUixRQUFJLE1BQUo7QUFDQSxRQUFJLE9BQU8sU0FBUCxJQUFPLEdBQVksQ0FBRSxDQUF6QjtBQUNBLFFBQUksVUFBVSxDQUNWLFFBRFUsRUFDQSxPQURBLEVBQ1MsT0FEVCxFQUNrQixPQURsQixFQUMyQixLQUQzQixFQUNrQyxRQURsQyxFQUM0QyxPQUQ1QyxFQUVWLFdBRlUsRUFFRyxPQUZILEVBRVksZ0JBRlosRUFFOEIsVUFGOUIsRUFFMEMsTUFGMUMsRUFFa0QsS0FGbEQsRUFHVixjQUhVLEVBR00sU0FITixFQUdpQixZQUhqQixFQUcrQixPQUgvQixFQUd3QyxNQUh4QyxFQUdnRCxTQUhoRCxFQUlWLFVBSlUsRUFJRSxhQUpGLEVBSWlCLFdBSmpCLEVBSThCLE9BSjlCLEVBSXVDLE1BSnZDLENBQWQ7QUFNQSxRQUFJLFNBQVMsUUFBUSxNQUFyQjtBQUNBLFFBQUksVUFBVyxPQUFPLE9BQVAsR0FBaUIsT0FBTyxPQUFQLElBQWtCLEVBQWxEOztBQUVBLFdBQU8sUUFBUCxFQUFpQjtBQUNiLGlCQUFTLFFBQVEsTUFBUixDQUFUOztBQUVBO0FBQ0EsWUFBSSxDQUFDLFFBQVEsTUFBUixDQUFMLEVBQXNCO0FBQ2xCLG9CQUFRLE1BQVIsSUFBa0IsSUFBbEI7QUFDSDtBQUNKO0FBQ0osQ0FwQkEsR0FBRDs7QUFzQkE7Ozs7O0FDcEJBOzs7Ozs7QUFDQSxRQUFRLElBQVIsQ0FBYSx3QkFBRyxFQUFILENBQU0sR0FBTixDQUFiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE3QkE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEJyZWFrcG9pbnRzIGZvciBKYXZhU2NyaXB0LiBXb3JrcyB3aXRoIHRoZSBEZWxvaXR0ZSBEaWdpdGFsIFNDU1MgQGJwIG1peGluIGFuZCBMZXNzIC5icCBtaXhpblxuICpcbiAqIEBuYW1lc3BhY2UgYnBcbiAqIEBtZW1iZXJvZiBERFxuICogQHZlcnNpb24gMS4xLjFcbiAqIEBjb3B5cmlnaHQgMjAxMi0yMDE3IERlbG9pdHRlIERpZ2l0YWwgQXVzdHJhbGlhIC0gaHR0cDovL3d3dy5kZWxvaXR0ZWRpZ2l0YWwuY29tL2F1XG4gKiBAYXV0aG9yIERlbG9pdHRlIERpZ2l0YWwgQXVzdHJhbGlhIGRlbG9pdHRlZGlnaXRhbEBkZWxvaXR0ZS5jb20uYXVcbiAqIEBsaWNlbnNlIEJTRCAzLUNsYXVzZSAoaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZSlcbiAqL1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgLy8gVU1EIHdyYXBwZXIgLSBXb3JrcyB3aXRoIG5vZGUsIEFNRCBhbmQgYnJvd3NlciBnbG9iYWxzLlxuICAgIC8vIFVzaW5nIHRoZSByZXR1cm5FeHBvcnRzIHBhdHRlcm4gYXMgYSBndWlkZTpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3RlbXBsYXRlcy9yZXR1cm5FeHBvcnRzLmpzXG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgICAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgICAgICByb290LkREID0gcm9vdC5ERCB8fCB7fTtcblxuICAgICAgICByb290LkRELmJwID0gZmFjdG9yeSgpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIF9taW5CcmVha3BvaW50cyxcbiAgICAgICAgX21heEJyZWFrcG9pbnRzLFxuICAgICAgICBfb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGlzUmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGJhc2VGb250U2l6ZTogMTYsXG4gICAgICAgICAgICBicmVha3BvaW50czogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3h4cycsXG4gICAgICAgICAgICAgICAgICAgIHB4OiAzNTlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3hzJyxcbiAgICAgICAgICAgICAgICAgICAgcHg6IDQ4MFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAncycsXG4gICAgICAgICAgICAgICAgICAgIHB4OiA2NDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ20nLFxuICAgICAgICAgICAgICAgICAgICBweDogNzY4XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdsJyxcbiAgICAgICAgICAgICAgICAgICAgcHg6IDEwMjRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3hsJyxcbiAgICAgICAgICAgICAgICAgICAgcHg6IDEyNDRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3h4bCcsXG4gICAgICAgICAgICAgICAgICAgIHB4OiAxNDEwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHN0YXRpY1JhbmdlOiB7XG4gICAgICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgICAgIG1heDogJ3hsJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfaW5pdEJyZWFrcG9pbnRzLFxuICAgICAgICBfcGFyc2VNaW5NYXhJbnB1dHMsXG4gICAgICAgIF9weFRvRW1zLFxuICAgICAgICBfYnBUb0VtcyxcbiAgICAgICAgX2JwSXNWYWxpZEZvclN0YXRpYyxcbiAgICAgICAgX2JwTWluLFxuICAgICAgICBfYnBNYXgsXG4gICAgICAgIF9icEJldHdlZW4sXG4gICAgICAgIGdldCxcbiAgICAgICAgZ2V0SGVpZ2h0LFxuICAgICAgICBpcyxcbiAgICAgICAgaXNIZWlnaHQsXG4gICAgICAgIG9wdGlvbnM7XG5cbiAgICAvKipcbiAgICAgKiBTb3J0cyB0aGUgYnJlYWtwb2ludHMgYW5kIGFzc2lnbnMgdGhlbSB0byBhbiBhc3NvY2lhdGl2ZSBhcnJheSBmb3IgbW9yZSBlZmZpY2llbnQgbG9va3VwLlxuICAgICAqIEltbWVkaWF0ZWx5IGludm9rZWQgb24gaW5pdGlhbGlzYXRpb25cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBERC5icFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRCcmVha3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL3NvcnQgdGhlIGJyZWFrcG9pbnRzIGludG8gb3JkZXIgb2Ygc21hbGxlc3QgdG8gbGFyZ2VzdFxuICAgICAgICB2YXIgc29ydGVkQnJlYWtwb2ludHMgPSBfb3B0aW9ucy5icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIC8vIG9ubHkgc29ydCBpZiB0aGUgY29ycmVjdCBvYmplY3RzIGFyZSBwcmVzZW50XG4gICAgICAgICAgICBpZiAoYS5weCA8IGIucHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhLnB4ID4gYi5weCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmVzZXQgdGhlIGJyZWFrcG9pbnRzXG4gICAgICAgIF9taW5CcmVha3BvaW50cyA9IHt9O1xuICAgICAgICBfbWF4QnJlYWtwb2ludHMgPSB7fTtcblxuICAgICAgICAvLyBsb29wIHRocm91Z2ggc29ydGVkIGJyZWFrcG9pbnRzIHRvIGdlbmVyYXRlIGEgcXVpY2sgbG9va3VwIG9iamVjdCB1c2luZyB0aGUgbmFtZSBhcyBhIGtleVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc29ydGVkQnJlYWtwb2ludHMubGVuZ3RoLCBsYXN0ID0gbGVuIC0gMTsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICBfbWluQnJlYWtwb2ludHNbc29ydGVkQnJlYWtwb2ludHNbaV0ubmFtZV0gPSBwYXJzZUludChzb3J0ZWRCcmVha3BvaW50c1tpXS5weCwgMTApO1xuXG4gICAgICAgICAgICAvLyBza2lwIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGxpc3QgYXMgd2UgYXNzdW1lIHRoZXJlIGlzIG5vIG1heGltdW0gZm9yIHRoZSBsYXN0XG4gICAgICAgICAgICBpZiAoaSA8IGxhc3QpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgbWF4IGJyZWFrcG9pbnQgb2YgdGhlIGN1cnJlbnQgc2l6ZSBpcyB0aGUgbmV4dCBicmVha3BvaW50c1xuICAgICAgICAgICAgICAgIC8vIHdpZHRoIG1pbnVzIDFweCBzbyB0aGVyZSBpcyBubyBvdmVybGFwIGJldHdlZW4gYnJlYWtwb2ludHNcbiAgICAgICAgICAgICAgICBfbWF4QnJlYWtwb2ludHNbc29ydGVkQnJlYWtwb2ludHNbaV0ubmFtZV0gPSBwYXJzZUludChzb3J0ZWRCcmVha3BvaW50c1tpICsgMV0ucHggLSAxLCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIF9pbml0QnJlYWtwb2ludHMoKTtcblxuICAgIC8qKlxuICAgICAqIFNwbGl0cyBzdHJpbmcgc3ludGF4ICd4cyxtJyBpbnRvIHNlcGFyYXRlIHZhbHVlcyAneHMnIGFuZCAnbSdcbiAgICAgKiBDb252ZXJ0cyBzdHJpbmcgJzUnIHRvIG51bWVyaWMgNVxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIERELmJwXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBtaW4gTnVtYmVyIGluIHBpeGVscyBvciBzdHJpbmcgbm90YXRpb25cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBtYXggTnVtYmVyIGluIHBpeGVscyBvciBzdHJpbmcgbm90YXRpb25cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IE9iamVjdCBjb250YWluaW5nIHRoZSBtaW4gYW5kIG1heCB2YWx1ZXMgcGFyc2VkIGFzIGEgbnVtYmVyXG4gICAgICovXG4gICAgX3BhcnNlTWluTWF4SW5wdXRzID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgdmFyIHBhcnNlVmFsdWUgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mICh2YWwpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBTdHJpcCB3aGl0ZXNwYWNlXG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IHZhbC5yZXBsYWNlKC9cXHMvZywgJycpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHZhbCBvbmx5IGNvbnRhaW5zIGRpZ2l0cywgY29udmVydCBpdCB0byBhIG51bWJlclxuICAgICAgICAgICAgICAgICAgICBpZiAoL15cXGQrJC8udGVzdCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBwYXJzZUludCh2YWwsIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYnBBcnJheSxcbiAgICAgICAgICAgIHJlc3VsdE1pbiA9IG1pbixcbiAgICAgICAgICAgIHJlc3VsdE1heCA9IG1heCB8fCAwO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIGl0J3MgdXNpbmcgdGhlIHN0cmluZyBzeW50YXgsIGlmIHNvIC0gc3BsaXQgaXRcbiAgICAgICAgaWYgKHR5cGVvZiAobWluKSA9PT0gJ3N0cmluZycgJiYgbWluLmluZGV4T2YoJywnKSAhPT0gLTEgJiYgcmVzdWx0TWF4ID09PSAwKSB7XG4gICAgICAgICAgICBicEFycmF5ID0gbWluLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICBpZiAoYnBBcnJheS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRNaW4gPSBicEFycmF5WzBdO1xuICAgICAgICAgICAgICAgIHJlc3VsdE1heCA9IGJwQXJyYXlbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWluOiBwYXJzZVZhbHVlKHJlc3VsdE1pbiksXG4gICAgICAgICAgICBtYXg6IHBhcnNlVmFsdWUocmVzdWx0TWF4KVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhIG51bWJlciBvZiBwaXhlbHMgaW50byBlbVxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIERELmJwXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHB4IE51bWJlciBpbiBwaXhlbHNcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBjb252ZXJ0ZWQgbnVtYmVyIGluIGVtIGFzIGEgc3RyaW5nXG4gICAgICovXG4gICAgX3B4VG9FbXMgPSBmdW5jdGlvbihweCkge1xuICAgICAgICByZXR1cm4gcHggLyBfb3B0aW9ucy5iYXNlRm9udFNpemU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGEgYnJlYWtwb2ludCBuYW1lL3ZhbHVlIChlLmcuIGwpIHRvIHRoZSBweCB2YXJpYWJsZSB0aGVuIHRvIGVtc1xuICAgICAqXG4gICAgICogQG1lbWJlcm9mIERELmJwXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBicmVha3BvaW50IEJyZWFrcG9pbnQgbmFtZSBhcyBhIHN0cmluZywgb3IgYXMgYSBudW1iZXIgaW4gcGl4ZWxzXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gW2lzTWF4PWZhbHNlXSBGbGFnIHRvIGRldGVybWluZSBpZiB0aGUgbWluIG9yIG1heCBvZiB0aGUgYnJlYWtwb2ludCBuZWVkcyB0byBiZSB1c2VkXG4gICAgICogQHJldHVybiB7U3RyaW5nfSBUaGUgY29udmVydGVkIG51bWJlciBpbiBlbSBhcyBhIHN0cmluZ1xuICAgICAqL1xuICAgIF9icFRvRW1zID0gZnVuY3Rpb24oYnJlYWtwb2ludCwgaXNNYXgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiAoYnJlYWtwb2ludCkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gX3B4VG9FbXMoYnJlYWtwb2ludCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGlzdCA9IChpc01heCA9PT0gdHJ1ZSkgPyBfbWF4QnJlYWtwb2ludHMgOiBfbWluQnJlYWtwb2ludHMsXG4gICAgICAgICAgICBlbXMgPSAnMCc7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGxpc3QpIHtcbiAgICAgICAgICAgIGlmIChsaXN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoYnJlYWtwb2ludCA9PT0ga2V5LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW1zID0gX3B4VG9FbXMobGlzdFtrZXldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW1zID09PSAnMCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignREQuYnA6IEJyZWFrcG9pbnQgXFwnJyArIGJyZWFrcG9pbnQgKyAnXFwnIGRvZXNuXFwndCBleGlzdCAtIHJlcGxhY2luZyB3aXRoIDAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgYnJlYWtwb2ludCBwcm92aWRlZCBmYWxscyBpbnNpZGUgdGhlIHZhbGlkIHN0YXRpYyBtaW4vbWF4IHJlZ2lvblxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIERELmJwXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBtaW4gQnJlYWtwb2ludCBuYW1lIGFzIGEgc3RyaW5nLCBhcyBhIG51bWJlciBpbiBwaXhlbHMsIG9yIGFzIHN0cmluZyBub3RhdGlvbiBjb250YWluaW5nIGJvdGggYnJlYWtwb2ludHNcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBtYXggQnJlYWtwb2ludCBuYW1lIGFzIGEgc3RyaW5nLCBvciBhcyBhIG51bWJlciBpbiBwaXhlbHNcbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBbcHJvcGVydHk9J3dpZHRoJ10gd2hpY2ggcHJvcGVydHkgdG8gY2hlY2sgZm9yIChlLmcuIHdpZHRoIG9yIGhlaWdodClcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBJZiB0aGUgYnJlYWtwb2ludCBmaXRzIGluc2lkZSB0aGUgc3RhdGljIHJhbmdlIG9yIG5vdFxuICAgICAqL1xuICAgIF9icElzVmFsaWRGb3JTdGF0aWMgPSBmdW5jdGlvbihtaW4sIG1heCwgcHJvcGVydHkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiAocHJvcGVydHkpICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcHJvcGVydHkgPSAnd2lkdGgnOyAvL2RlZmF1bHQgdG8gd2lkdGggYmFzZWQgbWVkaWEgcXVlcnlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9wZXJ0eSAhPT0gJ3dpZHRoJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJwVmFsaWRNaW4gPSBfYnBUb0Vtcyhfb3B0aW9ucy5zdGF0aWNSYW5nZS5taW4pLFxuICAgICAgICAgICAgYnBWYWxpZE1heCA9IF9icFRvRW1zKF9vcHRpb25zLnN0YXRpY1JhbmdlLm1heCwgdHJ1ZSksXG4gICAgICAgICAgICBwYXJzZWQgPSBfcGFyc2VNaW5NYXhJbnB1dHMobWluLCBtYXgpLFxuICAgICAgICAgICAgYnBNaW4gPSBfYnBUb0VtcyhwYXJzZWQubWluKSxcbiAgICAgICAgICAgIGJwTWF4ID0gX2JwVG9FbXMocGFyc2VkLm1heCk7XG5cbiAgICAgICAgLy8gaWYgbWF4IGlzIDAgd2UgaGF2ZSBhIG1pbi1hbmQtYWJvdmUgc2l0dWF0aW9uXG4gICAgICAgIGlmIChwYXJzZWQubWF4ID09PSAwKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGNoZWNrIHRoYXQgdGhlIG1pbiBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbGlkIG1pbixcbiAgICAgICAgICAgIC8vIEFORCBhbHNvIHRoYXQgdGhlIG1pbiBpcyBsZXNzIHRoYW4gdGhlIHZhbGlkIG1heGltdW1cbiAgICAgICAgICAgIGlmIChicE1pbiA+PSBicFZhbGlkTWluICYmIGJwTWluIDwgYnBWYWxpZE1heCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBtaW4gaXMgMCB3ZSBoYXZlIGEgbWF4LWFuZC1iZWxvdyBzaXR1YXRpb25cbiAgICAgICAgaWYgKHBhcnNlZC5taW4gPT09IDApIHtcbiAgICAgICAgICAgIGlmIChicE1heCA+PSBicFZhbGlkTWF4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZSBtaW4gaXMgYWJvdmUgdGhlIHZhbGlkIG1heCwgb3IgdGhlIG1heCBpcyBiZWxvdyB0aGUgdmFsaWQgbWluXG4gICAgICAgIGlmIChicE1pbiA+IGJwVmFsaWRNYXggfHwgYnBNYXggPCBicFZhbGlkTWluKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGUgYnJlYWtwb2ludCBpcyBhIGJwLWJldHdlZW4gKGFzc3VtZWQgYmVjYXVzZSAkbWF4IGFuZCAkbWluIGFyZW4ndCAwKVxuICAgICAgICAvLyBkb24ndCBzaG93IGlmIHRoZSBtYXggaXNuJ3QgYWJvdmUgdGhlIHZhbGlkIG1heFxuICAgICAgICBpZiAoYnBNYXggPCBicFZhbGlkTWF4KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG1pbi13aWR0aCBtZWRpYSBxdWVyeSBiYXNlZCBvbiBicCBuYW1lIG9yIHB4XG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgREQuYnBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xOdW1iZXJ9IG1pbiBCcmVha3BvaW50IG5hbWUgYXMgYSBzdHJpbmcsIG9yIGFzIGEgbnVtYmVyIGluIHBpeGVsc1xuICAgICAqIEBwYXJhbSAge1N0cmluZ30gW3Byb3BlcnR5PSd3aWR0aCddIFByb3BlcnR5IHRvIGNoZWNrIHVzaW5nIGEgbWVkaWEgcXVlcnkuIGUuZy4gd2lkdGggb3IgaGVpZ2h0XG4gICAgICogQHJldHVybiB7U3RyaW5nfSBNZWRpYSBxdWVyeSBzdHJpbmdcbiAgICAgKi9cbiAgICBfYnBNaW4gPSBmdW5jdGlvbihtaW4sIHByb3BlcnR5KSB7XG4gICAgICAgIHZhciBicE1pbiA9IF9icFRvRW1zKG1pbiksXG4gICAgICAgICAgICBicFR5cGUgPSAodHlwZW9mIChwcm9wZXJ0eSkgPT09ICdzdHJpbmcnKSA/IHByb3BlcnR5IDogJ3dpZHRoJztcblxuICAgICAgICByZXR1cm4gJyhtaW4tJyArIGJwVHlwZSArICc6ICcgKyBicE1pbiArICdlbSknO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbWF4LXdpZHRoIG1lZGlhIHF1ZXJ5IGJhc2VkIG9uIGJwIG5hbWUgb3IgcHhcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBERC5icFxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtICB7U3RyaW5nfE51bWJlcn0gbWF4IEJyZWFrcG9pbnQgbmFtZSBhcyBhIHN0cmluZywgb3IgYXMgYSBudW1iZXIgaW4gcGl4ZWxzXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBbcHJvcGVydHk9J3dpZHRoJ10gUHJvcGVydHkgdG8gY2hlY2sgdXNpbmcgYSBtZWRpYSBxdWVyeS4gZS5nLiB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IE1lZGlhIHF1ZXJ5IHN0cmluZ1xuICAgICAqL1xuICAgIF9icE1heCA9IGZ1bmN0aW9uKG1heCwgcHJvcGVydHkpIHtcbiAgICAgICAgdmFyIGJwTWF4ID0gX2JwVG9FbXMobWF4LCB0cnVlKSxcbiAgICAgICAgICAgIGJwVHlwZSA9ICh0eXBlb2YgKHByb3BlcnR5KSA9PT0gJ3N0cmluZycpID8gcHJvcGVydHkgOiAnd2lkdGgnO1xuXG4gICAgICAgIHJldHVybiAnKG1heC0nICsgYnBUeXBlICsgJzogJyArIGJwTWF4ICsgJ2VtKSc7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBtaW4td2lkdGggYW5kIG1heC13aWR0aCBtZWRpYSBxdWVyeSBiYXNlZCBvbiBicCBuYW1lIChjYW4gYmUgdGhlIHNhbWUgYnAgbmFtZSkgb3IgcHhcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBERC5icFxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtICB7U3RyaW5nfE51bWJlcn0gbWluIEJyZWFrcG9pbnQgbmFtZSBhcyBhIHN0cmluZywgb3IgYXMgYSBudW1iZXIgaW4gcGl4ZWxzXG4gICAgICogQHBhcmFtICB7U3RyaW5nfE51bWJlcn0gbWF4IEJyZWFrcG9pbnQgbmFtZSBhcyBhIHN0cmluZywgb3IgYXMgYSBudW1iZXIgaW4gcGl4ZWxzXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBbcHJvcGVydHk9J3dpZHRoJ10gUHJvcGVydHkgdG8gY2hlY2sgdXNpbmcgYSBtZWRpYSBxdWVyeS4gZS5nLiB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IE1lZGlhIHF1ZXJ5IHN0cmluZ1xuICAgICAqL1xuICAgIF9icEJldHdlZW4gPSBmdW5jdGlvbihtaW4sIG1heCwgcHJvcGVydHkpIHtcbiAgICAgICAgdmFyIGJwTWluID0gX2JwVG9FbXMobWluKSxcbiAgICAgICAgICAgIGJwTWF4ID0gX2JwVG9FbXMobWF4LCB0cnVlKSxcbiAgICAgICAgICAgIGJwVHlwZSA9ICh0eXBlb2YgKHByb3BlcnR5KSA9PT0gJ3N0cmluZycpID8gcHJvcGVydHkgOiAnd2lkdGgnO1xuXG4gICAgICAgIHJldHVybiAnKG1pbi0nICsgYnBUeXBlICsgJzogJyArIGJwTWluICsgJ2VtKSBhbmQgKG1heC0nICsgYnBUeXBlICsgJzogJyArIGJwTWF4ICsgJ2VtKSc7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEJyZWFrcG9pbnQgZnVuY3Rpb24gdGhhdCBjYW4gdGFrZSB0aGUgaW5wdXQgb2YgYSBtaW4gYW5kIG1heFxuICAgICAqIGJyZWFrcG9pbnQgYnkgbmFtZSBvciBudW1iZXIgKGluIHB4KSBhbG9uZyB3aXRoIGEgcHJvcGVydHlcbiAgICAgKiAobGlrZSB3aWR0aCBvciBoZWlnaHQpIGFuZCByZXR1cm5zIHRoZSBtZWRpYSBxdWVyeSBhcyBhIHN0cmluZ1xuICAgICAqXG4gICAgICogQG1lbWJlcm9mIERELmJwXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBsYXJnZSBhbmQgYWJvdmVcbiAgICAgKiBERC5icC5nZXQoJ2wnKTtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gMzAwcHggYW5kIGFib3ZlXG4gICAgICogREQuYnAuZ2V0KDMwMCk7XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIGxhcmdlIGFuZCBiZWxvd1xuICAgICAqIERELmJwLmdldCgwLCAnbCcpO1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyAzMDBweCBhbmQgYmVsb3dcbiAgICAgKiBERC5icC5nZXQoMCwgMzAwKTtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gQmV0d2VlbiBzbWFsbCBhbmQgbGFyZ2VcbiAgICAgKiBERC5icC5nZXQoJ3MnLCAnbCcpO1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBCZXR3ZWVuIDEwMHB4IGFuZCAzMDBweFxuICAgICAqIERELmJwLmdldCgxMDAsIDMwMCk7XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIEhpZ2ggcmVzb2x1dGlvbiBkaXNwbGF5cyAoY2FuIHVzZSAnaGRwaScgYXMgd2VsbClcbiAgICAgKiBERC5icC5nZXQoJ3JldGluYScpO1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBDYW4gbWl4IGFuZCBtYXRjaCBuYW1lcyBhbmQgbnVtYmVycyAtIGJldHdlZW4gMjAwcHggYW5kIHhsYXJnZVxuICAgICAqIERELmJwLmdldCgyMDAsICd4bCcpO1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBCZXR3ZWVuIHNtYWxsIGFuZCA5NjBweFxuICAgICAqIERELmJwLmdldCgncycsIDk2MCk7XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIENhbiB1c2UgYSBzaW5nbGUgc3RyaW5nIChubyBzcGFjZXMpIC0gdXNlZnVsIGZvciBwYXNzaW5nIHRocm91Z2ggZnJvbSBIVE1MIHRvIEpTXG4gICAgICogREQuYnAuZ2V0KCdtLGwnKTtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gQ2FuIGFsc28gbWl4IG5hbWVzIGFuZCBudW1iZXJzXG4gICAgICogREQuYnAuZ2V0KCd4cywxMDAwJyk7XG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBtaW4gQnJlYWtwb2ludCBuYW1lIGFzIGEgc3RyaW5nLCBvciBhcyBhIG51bWJlciBpbiBwaXhlbHMsIG9yIGluIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgbm90YXRpb25cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBbbWF4PTBdIEJyZWFrcG9pbnQgbmFtZSBhcyBhIHN0cmluZywgb3IgYXMgYSBudW1iZXIgaW4gcGl4ZWxzXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBbcHJvcGVydHk9J3dpZHRoJ10gUHJvcGVydHkgdG8gY2hlY2sgdXNpbmcgYSBtZWRpYSBxdWVyeS4gZS5nLiB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IE1lZGlhIHF1ZXJ5IHN0cmluZ1xuICAgICAqL1xuICAgIGdldCA9IGZ1bmN0aW9uKG1pbiwgbWF4LCBwcm9wZXJ0eSkge1xuICAgICAgICB2YXIgcGFyc2VkID0gX3BhcnNlTWluTWF4SW5wdXRzKG1pbiwgbWF4KSxcbiAgICAgICAgICAgIGJwTWluID0gcGFyc2VkLm1pbixcbiAgICAgICAgICAgIGJwTWF4ID0gcGFyc2VkLm1heDtcblxuICAgICAgICBpZiAodHlwZW9mIChwcm9wZXJ0eSkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwcm9wZXJ0eSA9ICd3aWR0aCc7IC8vZGVmYXVsdCB0byB3aWR0aCBiYXNlZCBtZWRpYSBxdWVyeVxuICAgICAgICB9XG5cbiAgICAgICAgLy9jaGVjayB3aGF0IHR5cGUgb2YgYnAgaXQgaXNcbiAgICAgICAgaWYgKGJwTWluID09PSAncmV0aW5hJyB8fCBicE1pbiA9PT0gJ2hkcGknKSB7XG4gICAgICAgICAgICByZXR1cm4gJygtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAzLzIpLCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMS41KSc7XG4gICAgICAgIH0gZWxzZSBpZiAoYnBNYXggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBfYnBNaW4oYnBNaW4sIHByb3BlcnR5KTtcbiAgICAgICAgfSBlbHNlIGlmIChicE1pbiA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIF9icE1heChicE1heCwgcHJvcGVydHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF9icEJldHdlZW4oYnBNaW4sIGJwTWF4LCBwcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2hvcnRjdXQgZm9yIHRoZSBnZXQoKSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBoZWlnaHRcbiAgICAgKiBiYXNlZCBtZWRpYSBxdWVyeSBhbmQgcmV0dXJucyB0aGUgbWVkaWEgcXVlcnkgYXMgYSBzdHJpbmdcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBERC5icFxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gSGVpZ2h0IG9mIDMwMHB4IGFuZCBhYm92ZVxuICAgICAqIERELmJwLmdldEhlaWdodCgzMDApO1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBIZWlnaHQgb2YgMzAwcHggYW5kIGJlbG93XG4gICAgICogREQuYnAuZ2V0SGVpZ2h0KDAsIDMwMCk7XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIEJldHdlZW4gMTAwcHggYW5kIDMwMHB4IGhpZ2hcbiAgICAgKiBERC5icC5nZXRIZWlnaHQoMTAwLCAzMDApO1xuICAgICAqXG4gICAgICogQHBhcmFtICB7U3RyaW5nfE51bWJlcn0gbWluIEJyZWFrcG9pbnQgbmFtZSBhcyBhIHN0cmluZywgb3IgYXMgYSBudW1iZXIgaW4gcGl4ZWxzLCBvciBpbiBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG5vdGF0aW9uXG4gICAgICogQHBhcmFtICB7U3RyaW5nfE51bWJlcn0gW21heD0wXSBCcmVha3BvaW50IG5hbWUgYXMgYSBzdHJpbmcsIG9yIGFzIGEgbnVtYmVyIGluIHBpeGVsc1xuICAgICAqIEByZXR1cm4ge1N0cmluZ30gTWVkaWEgcXVlcnkgc3RyaW5nXG4gICAgICovXG4gICAgZ2V0SGVpZ2h0ID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIGdldChtaW4sIG1heCwgJ2hlaWdodCcpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBCcmVha3BvaW50IGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIHNhbWUgaW5wdXRzIGFzIGdldCgpIGJ1dFxuICAgICAqIGluc3RlYWQgb2YgcmV0dXJuaW5nIHRoZSBtZWRpYSBxdWVyeSBhcyBhIHN0cmluZyByZXR1cm5zXG4gICAgICogaWYgdGhlIGN1cnJlbnQgcGFnZSBtYXRjaGVzIHRoYXQgcXVlcnkgYXMgYSBib29sZWFuIHVzaW5nXG4gICAgICogd2luZG93Lm1hdGNoTWVkaWEobXEpLm1hdGNoZXNcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBERC5icFxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gcmV0dXJucyB0cnVlIGlmIHRoZSBwYWdlIGlzIGJldHdlZW4geHMgYW5kIHNcbiAgICAgKiBERC5icC5pcygneHMscycpO1xuICAgICAqIERELmJwLmlzKCd4cycsJ3MnKTtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gcmV0dXJucyB0cnVlIGlmIHRoZSBwYWdlIGlzIGJldHdlZW4gMCBhbmQgMzAwcHggd2lkZVxuICAgICAqIERELmJwLmlzKCcwLDMwMCcpO1xuICAgICAqIERELmJwLmlzKDAsIDMwMCk7XG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBtaW4gQnJlYWtwb2ludCBuYW1lIGFzIGEgc3RyaW5nLCBvciBhcyBhIG51bWJlciBpbiBwaXhlbHMsIG9yIGluIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgbm90YXRpb25cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8TnVtYmVyfSBbbWF4PTBdIEJyZWFrcG9pbnQgbmFtZSBhcyBhIHN0cmluZywgb3IgYXMgYSBudW1iZXIgaW4gcGl4ZWxzXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBbcHJvcGVydHk9J3dpZHRoJ10gUHJvcGVydHkgdG8gY2hlY2sgdXNpbmcgYSBtZWRpYSBxdWVyeS4gZS5nLiB3aWR0aCBvciBoZWlnaHRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzID0gZnVuY3Rpb24obWluLCBtYXgsIHByb3BlcnR5KSB7XG4gICAgICAgIGlmIChfb3B0aW9ucy5pc1Jlc3BvbnNpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gX2JwSXNWYWxpZEZvclN0YXRpYyhtaW4sIG1heCwgcHJvcGVydHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoZ2V0KG1pbiwgbWF4LCBwcm9wZXJ0eSkpLm1hdGNoZXM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLndhcm4oJ0RELmJwOiBNYXRjaCBNZWRpYSBub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgYnJvd3Nlci4gQ29uc2lkZXIgYWRkaW5nIGEgcG9seWZpbGwuJyk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTaG9ydGN1dCBmb3IgdGhlIGlzKCkgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgaGVpZ2h0XG4gICAgICogYmFzZWQgbWVkaWEgcXVlcnkgYW5kIHJldHVybnMgdGhlIG1lZGlhIHF1ZXJ5IGFzIGEgYm9vbGVhblxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIERELmJwXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyByZXR1cm5zIHRydWUgaWYgdGhlIHBhZ2UgaXMgYmV0d2VlbiAwIGFuZCAzMDBweCBoaWdoXG4gICAgICogREQuYnAuaXNIZWlnaHQoJzAsMzAwJyk7XG4gICAgICogREQuYnAuaXNIZWlnaHQoMCwgMzAwKTtcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xOdW1iZXJ9IG1pbiBCcmVha3BvaW50IG5hbWUgYXMgYSBzdHJpbmcsIG9yIGFzIGEgbnVtYmVyIGluIHBpeGVscywgb3IgaW4gY29tbWEgc2VwYXJhdGVkIHN0cmluZyBub3RhdGlvblxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xOdW1iZXJ9IFttYXg9MF0gQnJlYWtwb2ludCBuYW1lIGFzIGEgc3RyaW5nLCBvciBhcyBhIG51bWJlciBpbiBwaXhlbHNcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzSGVpZ2h0ID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIGlzKG1pbiwgbWF4LCAnaGVpZ2h0Jyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFZhbGlkIG9wdGlvbnMgZm9yIHRoZSBCcmVha3BvaW50cyBhcnJheVxuICAgICAqXG4gICAgICogQHR5cGVkZWYgIHtPYmplY3R9IERELmJwLkJyZWFrcG9pbnRPcHRpb25zXG4gICAgICogQHByb3BlcnR5IHtTdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGUgYnJlYWtwb2ludCBlLmcuICdzJywgJ20nLCAnbCdcbiAgICAgKiBAcHJvcGVydHkge051bWJlcn0gcHggTnVtYmVyIGluIHB4IGZvciB0aGUgc2l6ZSBvZiB0aGUgYnJlYWtwb2ludFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVmFsaWQgb3B0aW9ucyBmb3IgdGhlIEJyZWFrcG9pbnRzIGxpYnJhcnlcbiAgICAgKlxuICAgICAqIEB0eXBlZGVmICB7T2JqZWN0fSBERC5icC5PcHRpb25zXG4gICAgICogQHByb3BlcnR5IHtOdW1iZXJ9IFtiYXNlRm9udFNpemVdIE51bWJlciBpbiBweCB0byBiZSB1c2VkIGFzIGEgYmFzZSBmb250IHNpemUgaW4gb3JkZXIgdG8gY2FsY3VsYXRlIGVtIHZhbHVlc1xuICAgICAqIEBwcm9wZXJ0eSB7REQuYnAuQnJlYWtwb2ludE9wdGlvbnNbXX0gW2JyZWFrcG9pbnRzXVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVXNlciB1cGRhdGFibGUgb3B0aW9uc1xuICAgICAqXG4gICAgICogQG1lbWJlcm9mIERELmJwXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyB1cGRhdGUgdGhlIGJhc2UgZm9udCBzaXplIG9ubHlcbiAgICAgKiBERC5icC5vcHRpb25zKHtcbiAgICAgKiAgIGJhc2VGb250U2l6ZTogMTRcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gdXBkYXRlIHRoZSBicmVha3BvaW50c1xuICAgICAqIERELmJwLm9wdGlvbnMoe1xuICAgICAqICAgYnJlYWtwb2ludHM6IFtcbiAgICAgKiAgICAgeyBuYW1lOiAnc21hbGwnLCBweDogNDAwIH0sXG4gICAgICogICAgIHsgbmFtZTogJ21lZGl1bScsIHB4OiA4MDAgfSxcbiAgICAgKiAgICAgeyBuYW1lOiAnbGFyZ2UnLCBweDogMTIwMCB9XG4gICAgICogICBdXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtERC5icC5PcHRpb25zfSBvcHRzIE9wdGlvbnMgaW5zaWRlIHRoZSBsaWJyYXJ5IHRvIGJlIHVwZGF0ZWRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIG9wdGlvbnMgPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgKG9wdHMuaXNSZXNwb25zaXZlKSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBfb3B0aW9ucy5pc1Jlc3BvbnNpdmUgPSBvcHRzLmlzUmVzcG9uc2l2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgKG9wdHMuYmFzZUZvbnRTaXplKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIF9vcHRpb25zLmJhc2VGb250U2l6ZSA9IG9wdHMuYmFzZUZvbnRTaXplO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiAob3B0cy5icmVha3BvaW50cykgPT09ICdvYmplY3QnICYmIG9wdHMuYnJlYWtwb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIGlzVmFsaWQgPSB0cnVlLFxuICAgICAgICAgICAgICAgIGJwcyA9IG9wdHMuYnJlYWtwb2ludHM7XG5cbiAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgYnJlYWtwb2ludHMgdG8gY2hlY2sgdmFsaWRpdHlcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBicHMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGJwc1tpXS5oYXNPd25Qcm9wZXJ0eSgnbmFtZScpICYmIGJwc1tpXS5oYXNPd25Qcm9wZXJ0eSgncHgnKSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgX29wdGlvbnMuYnJlYWtwb2ludHMgPSBvcHRzLmJyZWFrcG9pbnRzO1xuICAgICAgICAgICAgICAgIF9pbml0QnJlYWtwb2ludHMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdERC5icDogSW52YWxpZCBicmVha3BvaW50cyBhcnJheSBlbnRlcmVkLiBQbGVhc2UgdXNlIHRoZSBmb3JtYXQge25hbWU6IFxcJ3N0cmluZ1xcJywgcHg6IG51bWJlcn0nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0OiBnZXQsXG4gICAgICAgIGdldEhlaWdodDogZ2V0SGVpZ2h0LFxuICAgICAgICBpczogaXMsXG4gICAgICAgIGlzSGVpZ2h0OiBpc0hlaWdodCxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH07XG59KSk7XG4iLCIvLyBBdm9pZCBgY29uc29sZWAgZXJyb3JzIGluIGJyb3dzZXJzIHRoYXQgbGFjayBhIGNvbnNvbGUuXG4oZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1ldGhvZDtcbiAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIHZhciBtZXRob2RzID0gW1xuICAgICAgICAnYXNzZXJ0JywgJ2NsZWFyJywgJ2NvdW50JywgJ2RlYnVnJywgJ2RpcicsICdkaXJ4bWwnLCAnZXJyb3InLFxuICAgICAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAgICAgJ21hcmtUaW1lbGluZScsICdwcm9maWxlJywgJ3Byb2ZpbGVFbmQnLCAndGFibGUnLCAndGltZScsICd0aW1lRW5kJyxcbiAgICAgICAgJ3RpbWVsaW5lJywgJ3RpbWVsaW5lRW5kJywgJ3RpbWVTdGFtcCcsICd0cmFjZScsICd3YXJuJ1xuICAgIF07XG4gICAgdmFyIGxlbmd0aCA9IG1ldGhvZHMubGVuZ3RoO1xuICAgIHZhciBjb25zb2xlID0gKHdpbmRvdy5jb25zb2xlID0gd2luZG93LmNvbnNvbGUgfHwge30pO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIG1ldGhvZCA9IG1ldGhvZHNbbGVuZ3RoXTtcblxuICAgICAgICAvLyBPbmx5IHN0dWIgdW5kZWZpbmVkIG1ldGhvZHMuXG4gICAgICAgIGlmICghY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgICAgICBjb25zb2xlW21ldGhvZF0gPSBub29wO1xuICAgICAgICB9XG4gICAgfVxufSgpKTtcblxuLy8gUGxhY2UgYW55IGpRdWVyeS9oZWxwZXIgcGx1Z2lucyBpbiBoZXJlLlxuIiwiLy8gdmFyIGRkYnJlYWtwb2ludHMgPSByZXF1aXJlKCdkZGJyZWFrcG9pbnRzJyk7XG4vLyBjb25zb2xlLmluZm8oJ2RkYnJlYWtwb2ludHMnLCBkZGJyZWFrcG9pbnRzKTtcblxuaW1wb3J0IGJwIGZyb20gJ2RkYnJlYWtwb2ludHMnO1xuY29uc29sZS5pbmZvKGJwLmlzKCdzJykpO1xuLy9cbi8vIGltcG9ydCB0ZXN0IGZyb20gJy4vbW9kdWxlcy9tb2R1bGVzMSc7XG4vL1xuLy8gZnVuY3Rpb24gY29tcG9uZW50KCkge1xuLy8gXHRsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuLy9cbi8vXG4vLyBcdGVsZW1lbnQuaW5uZXJIVE1MID0gJ2FzZGZkc2FmIGhleSB0aGVyZSc7XG4vL1xuLy8gXHRyZXR1cm4gZWxlbWVudDtcbi8vIH1cbi8vXG4vLyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbXBvbmVudCgpKTtcbi8vXG4vLyB0ZXN0LmFhYSgpO1xuLy9cbi8vIGNvbnN0IHBlcnNvbiA9IHtcbi8vICAgbmFtZTogJ1J5YW4gQ2hyaXN0aWFuaSdcbi8vIH07XG4vL1xuLy8gY29uc3QgdGVzdFN0cmluZyA9IGBNeSBuYW1lIGlzIG5vdCAke3BlcnNvbi5uYW1lfWA7XG4vL1xuLy8gZG9jdW1lbnQud3JpdGUodGVzdFN0cmluZyk7XG4vL1xuLy8gY29uc29sZS5pbmZvKHdoYXQpO1xuIl19
