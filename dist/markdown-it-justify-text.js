/*! markdown-it-justify-text 1.0.4 https://github.com/jay-hodgson/markdown-it-justify-text @license MIT */(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitjustifytext = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Process -> center text <-

'use strict';

var DASH_CODE = 45
var START_CODE = 33 /* ! */
var END_CODE = 33
module.exports = function centertext_plugin(md) {

  function tokenize(state, silent) {
    var token,
        max = state.posMax,
        start = state.pos,
        marker = state.src.charCodeAt(start);
    if (start + 1 > max) { return false; }
    if (silent) { return false; } // don't run any pairs in validation mode

    if (marker === DASH_CODE/* - */ &&
      state.src.charCodeAt(start + 1) === START_CODE/* > */
      ) {
      state.scanDelims(state.pos, true);
      token         = state.push('text', '', 0);
      token.content = '-!';
      state.delimiters.push({
        marker: token.content,
        jump:   0,
        token:  state.tokens.length - 1,
        level:  state.level,
        end:    -1,
        open:   true,
        close:  false
      });
    } else if (marker === END_CODE/* < */ &&
      state.src.charCodeAt(start + 1) === DASH_CODE/* - */
      ) {
      // found the close marker
      state.scanDelims(state.pos, true);
      token         = state.push('text', '', 0);
      token.content = '!-';
      state.delimiters.push({
        marker: token.content,
        jump:   0,
        token:  state.tokens.length - 1,
        level:  state.level,
        end:    -1,
        open:   false,
        close:  true
      });
    } else {
      // neither
      return false;
    }

    state.pos += 2;

    return true;
  }


  // Walk through delimiter list and replace text tokens with tags
  //
  function postProcess(state) {
    var i,
        foundStart = false,
        foundEnd = false,
        delim,
        token,
        delimiters = state.delimiters,
        max = state.delimiters.length;

    for (i = 0; i < max; i++) {
      delim = delimiters[i];
      if (delim.marker === '-!') {
        foundStart = true;
      } else if (delim.marker === '!-') {
        foundEnd = true;
      }
    }
    if (foundStart && foundEnd) {
      for (i = 0; i < max; i++) {
        delim = delimiters[i];

        if (delim.marker === '-!') {
          foundStart = true;
          token         = state.tokens[delim.token];
          token.type    = 'justifytext_open';
          token.tag     = 'div';
          token.nesting = 1;
          token.markup  = '-!';
          token.content = '';
          token.attrs = [ [ 'class', 'text-justify' ] ];
        } else if (delim.marker === '!-') {
          if (foundStart) {
            token         = state.tokens[delim.token];
            token.type    = 'justifytext_close';
            token.tag     = 'div';
            token.nesting = -1;
            token.markup  = '!-';
            token.content = '';
          }
        }
      }
    }
  }

  md.inline.ruler.before('emphasis', 'justifytext', tokenize);
  md.inline.ruler2.before('emphasis', 'justifytext', postProcess);
};

},{}]},{},[1])(1)
});
