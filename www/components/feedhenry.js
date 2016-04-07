!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.feedhenry=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
;__browserify_shim_require__=_dereq_;(function browserifyShim(module, exports, _dereq_, define, browserify_shim__define__module__export__) {
/*
 CryptoJS v3.1.2
 core.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
  /**
   * CryptoJS namespace.
   */
  var C = {};

  /**
   * Library namespace.
   */
  var C_lib = C.lib = {};

  /**
   * Base object for prototypal inheritance.
   */
  var Base = C_lib.Base = (function () {
    function F() {}

    return {
      /**
       * Creates a new object that inherits from this object.
       *
       * @param {Object} overrides Properties to copy into the new object.
       *
       * @return {Object} The new object.
       *
       * @static
       *
       * @example
       *
       *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
       */
      extend: function (overrides) {
        // Spawn
        F.prototype = this;
        var subtype = new F();

        // Augment
        if (overrides) {
          subtype.mixIn(overrides);
        }

        // Create default initializer
        if (!subtype.hasOwnProperty('init')) {
          subtype.init = function () {
            subtype.$super.init.apply(this, arguments);
          };
        }

        // Initializer's prototype is the subtype object
        subtype.init.prototype = subtype;

        // Reference supertype
        subtype.$super = this;

        return subtype;
      },

      /**
       * Extends this object and runs the init method.
       * Arguments to create() will be passed to init().
       *
       * @return {Object} The new object.
       *
       * @static
       *
       * @example
       *
       *     var instance = MyType.create();
       */
      create: function () {
        var instance = this.extend();
        instance.init.apply(instance, arguments);

        return instance;
      },

      /**
       * Initializes a newly created object.
       * Override this method to add some logic when your objects are created.
       *
       * @example
       *
       *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
       */
      init: function () {
      },

      /**
       * Copies properties into this object.
       *
       * @param {Object} properties The properties to mix in.
       *
       * @example
       *
       *     MyType.mixIn({
             *         field: 'value'
             *     });
       */
      mixIn: function (properties) {
        for (var propertyName in properties) {
          if (properties.hasOwnProperty(propertyName)) {
            this[propertyName] = properties[propertyName];
          }
        }

        // IE won't copy toString using the loop above
        if (properties.hasOwnProperty('toString')) {
          this.toString = properties.toString;
        }
      },

      /**
       * Creates a copy of this object.
       *
       * @return {Object} The clone.
       *
       * @example
       *
       *     var clone = instance.clone();
       */
      clone: function () {
        return this.init.prototype.extend(this);
      }
    };
  }());

  /**
   * An array of 32-bit words.
   *
   * @property {Array} words The array of 32-bit words.
   * @property {number} sigBytes The number of significant bytes in this word array.
   */
  var WordArray = C_lib.WordArray = Base.extend({
    /**
     * Initializes a newly created word array.
     *
     * @param {Array} words (Optional) An array of 32-bit words.
     * @param {number} sigBytes (Optional) The number of significant bytes in the words.
     *
     * @example
     *
     *     var wordArray = CryptoJS.lib.WordArray.create();
     *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
     *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
     */
    init: function (words, sigBytes) {
      words = this.words = words || [];

      if (sigBytes != undefined) {
        this.sigBytes = sigBytes;
      } else {
        this.sigBytes = words.length * 4;
      }
    },

    /**
     * Converts this word array to a string.
     *
     * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
     *
     * @return {string} The stringified word array.
     *
     * @example
     *
     *     var string = wordArray + '';
     *     var string = wordArray.toString();
     *     var string = wordArray.toString(CryptoJS.enc.Utf8);
     */
    toString: function (encoder) {
      return (encoder || Hex).stringify(this);
    },

    /**
     * Concatenates a word array to this word array.
     *
     * @param {WordArray} wordArray The word array to append.
     *
     * @return {WordArray} This word array.
     *
     * @example
     *
     *     wordArray1.concat(wordArray2);
     */
    concat: function (wordArray) {
      // Shortcuts
      var thisWords = this.words;
      var thatWords = wordArray.words;
      var thisSigBytes = this.sigBytes;
      var thatSigBytes = wordArray.sigBytes;

      // Clamp excess bits
      this.clamp();

      // Concat
      if (thisSigBytes % 4) {
        // Copy one byte at a time
        for (var i = 0; i < thatSigBytes; i++) {
          var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
          thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
        }
      } else if (thatWords.length > 0xffff) {
        // Copy one word at a time
        for (var i = 0; i < thatSigBytes; i += 4) {
          thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
        }
      } else {
        // Copy all words at once
        thisWords.push.apply(thisWords, thatWords);
      }
      this.sigBytes += thatSigBytes;

      // Chainable
      return this;
    },

    /**
     * Removes insignificant bits.
     *
     * @example
     *
     *     wordArray.clamp();
     */
    clamp: function () {
      // Shortcuts
      var words = this.words;
      var sigBytes = this.sigBytes;

      // Clamp
      words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
      words.length = Math.ceil(sigBytes / 4);
    },

    /**
     * Creates a copy of this word array.
     *
     * @return {WordArray} The clone.
     *
     * @example
     *
     *     var clone = wordArray.clone();
     */
    clone: function () {
      var clone = Base.clone.call(this);
      clone.words = this.words.slice(0);

      return clone;
    },

    /**
     * Creates a word array filled with random bytes.
     *
     * @param {number} nBytes The number of random bytes to generate.
     *
     * @return {WordArray} The random word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.lib.WordArray.random(16);
     */
    random: function (nBytes) {
      var words = [];
      for (var i = 0; i < nBytes; i += 4) {
        words.push((Math.random() * 0x100000000) | 0);
      }

      return new WordArray.init(words, nBytes);
    }
  });

  /**
   * Encoder namespace.
   */
  var C_enc = C.enc = {};

  /**
   * Hex encoding strategy.
   */
  var Hex = C_enc.Hex = {
    /**
     * Converts a word array to a hex string.
     *
     * @param {WordArray} wordArray The word array.
     *
     * @return {string} The hex string.
     *
     * @static
     *
     * @example
     *
     *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
     */
    stringify: function (wordArray) {
      // Shortcuts
      var words = wordArray.words;
      var sigBytes = wordArray.sigBytes;

      // Convert
      var hexChars = [];
      for (var i = 0; i < sigBytes; i++) {
        var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        hexChars.push((bite >>> 4).toString(16));
        hexChars.push((bite & 0x0f).toString(16));
      }

      return hexChars.join('');
    },

    /**
     * Converts a hex string to a word array.
     *
     * @param {string} hexStr The hex string.
     *
     * @return {WordArray} The word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
     */
    parse: function (hexStr) {
      // Shortcut
      var hexStrLength = hexStr.length;

      // Convert
      var words = [];
      for (var i = 0; i < hexStrLength; i += 2) {
        words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
      }

      return new WordArray.init(words, hexStrLength / 2);
    }
  };

  /**
   * Latin1 encoding strategy.
   */
  var Latin1 = C_enc.Latin1 = {
    /**
     * Converts a word array to a Latin1 string.
     *
     * @param {WordArray} wordArray The word array.
     *
     * @return {string} The Latin1 string.
     *
     * @static
     *
     * @example
     *
     *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
     */
    stringify: function (wordArray) {
      // Shortcuts
      var words = wordArray.words;
      var sigBytes = wordArray.sigBytes;

      // Convert
      var latin1Chars = [];
      for (var i = 0; i < sigBytes; i++) {
        var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        latin1Chars.push(String.fromCharCode(bite));
      }

      return latin1Chars.join('');
    },

    /**
     * Converts a Latin1 string to a word array.
     *
     * @param {string} latin1Str The Latin1 string.
     *
     * @return {WordArray} The word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
     */
    parse: function (latin1Str) {
      // Shortcut
      var latin1StrLength = latin1Str.length;

      // Convert
      var words = [];
      for (var i = 0; i < latin1StrLength; i++) {
        words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
      }

      return new WordArray.init(words, latin1StrLength);
    }
  };

  /**
   * UTF-8 encoding strategy.
   */
  var Utf8 = C_enc.Utf8 = {
    /**
     * Converts a word array to a UTF-8 string.
     *
     * @param {WordArray} wordArray The word array.
     *
     * @return {string} The UTF-8 string.
     *
     * @static
     *
     * @example
     *
     *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
     */
    stringify: function (wordArray) {
      try {
        return decodeURIComponent(escape(Latin1.stringify(wordArray)));
      } catch (e) {
        throw new Error('Malformed UTF-8 data');
      }
    },

    /**
     * Converts a UTF-8 string to a word array.
     *
     * @param {string} utf8Str The UTF-8 string.
     *
     * @return {WordArray} The word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
     */
    parse: function (utf8Str) {
      return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
    }
  };

  /**
   * Abstract buffered block algorithm template.
   *
   * The property blockSize must be implemented in a concrete subtype.
   *
   * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
   */
  var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
    /**
     * Resets this block algorithm's data buffer to its initial state.
     *
     * @example
     *
     *     bufferedBlockAlgorithm.reset();
     */
    reset: function () {
      // Initial values
      this._data = new WordArray.init();
      this._nDataBytes = 0;
    },

    /**
     * Adds new data to this block algorithm's buffer.
     *
     * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
     *
     * @example
     *
     *     bufferedBlockAlgorithm._append('data');
     *     bufferedBlockAlgorithm._append(wordArray);
     */
    _append: function (data) {
      // Convert string to WordArray, else assume WordArray already
      if (typeof data == 'string') {
        data = Utf8.parse(data);
      }

      // Append
      this._data.concat(data);
      this._nDataBytes += data.sigBytes;
    },

    /**
     * Processes available data blocks.
     *
     * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
     *
     * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
     *
     * @return {WordArray} The processed data.
     *
     * @example
     *
     *     var processedData = bufferedBlockAlgorithm._process();
     *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
     */
    _process: function (doFlush) {
      // Shortcuts
      var data = this._data;
      var dataWords = data.words;
      var dataSigBytes = data.sigBytes;
      var blockSize = this.blockSize;
      var blockSizeBytes = blockSize * 4;

      // Count blocks ready
      var nBlocksReady = dataSigBytes / blockSizeBytes;
      if (doFlush) {
        // Round up to include partial blocks
        nBlocksReady = Math.ceil(nBlocksReady);
      } else {
        // Round down to include only full blocks,
        // less the number of blocks that must remain in the buffer
        nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
      }

      // Count words ready
      var nWordsReady = nBlocksReady * blockSize;

      // Count bytes ready
      var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

      // Process blocks
      if (nWordsReady) {
        for (var offset = 0; offset < nWordsReady; offset += blockSize) {
          // Perform concrete-algorithm logic
          this._doProcessBlock(dataWords, offset);
        }

        // Remove processed words
        var processedWords = dataWords.splice(0, nWordsReady);
        data.sigBytes -= nBytesReady;
      }

      // Return processed words
      return new WordArray.init(processedWords, nBytesReady);
    },

    /**
     * Creates a copy of this object.
     *
     * @return {Object} The clone.
     *
     * @example
     *
     *     var clone = bufferedBlockAlgorithm.clone();
     */
    clone: function () {
      var clone = Base.clone.call(this);
      clone._data = this._data.clone();

      return clone;
    },

    _minBufferSize: 0
  });

  /**
   * Abstract hasher template.
   *
   * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
   */
  var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
    /**
     * Configuration options.
     */
    cfg: Base.extend(),

    /**
     * Initializes a newly created hasher.
     *
     * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
     *
     * @example
     *
     *     var hasher = CryptoJS.algo.SHA256.create();
     */
    init: function (cfg) {
      // Apply config defaults
      this.cfg = this.cfg.extend(cfg);

      // Set initial values
      this.reset();
    },

    /**
     * Resets this hasher to its initial state.
     *
     * @example
     *
     *     hasher.reset();
     */
    reset: function () {
      // Reset data buffer
      BufferedBlockAlgorithm.reset.call(this);

      // Perform concrete-hasher logic
      this._doReset();
    },

    /**
     * Updates this hasher with a message.
     *
     * @param {WordArray|string} messageUpdate The message to append.
     *
     * @return {Hasher} This hasher.
     *
     * @example
     *
     *     hasher.update('message');
     *     hasher.update(wordArray);
     */
    update: function (messageUpdate) {
      // Append
      this._append(messageUpdate);

      // Update the hash
      this._process();

      // Chainable
      return this;
    },

    /**
     * Finalizes the hash computation.
     * Note that the finalize operation is effectively a destructive, read-once operation.
     *
     * @param {WordArray|string} messageUpdate (Optional) A final message update.
     *
     * @return {WordArray} The hash.
     *
     * @example
     *
     *     var hash = hasher.finalize();
     *     var hash = hasher.finalize('message');
     *     var hash = hasher.finalize(wordArray);
     */
    finalize: function (messageUpdate) {
      // Final message update
      if (messageUpdate) {
        this._append(messageUpdate);
      }

      // Perform concrete-hasher logic
      var hash = this._doFinalize();

      return hash;
    },

    blockSize: 512/32,

    /**
     * Creates a shortcut function to a hasher's object interface.
     *
     * @param {Hasher} hasher The hasher to create a helper for.
     *
     * @return {Function} The shortcut function.
     *
     * @static
     *
     * @example
     *
     *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
     */
    _createHelper: function (hasher) {
      return function (message, cfg) {
        return new hasher.init(cfg).finalize(message);
      };
    },

    /**
     * Creates a shortcut function to the HMAC's object interface.
     *
     * @param {Hasher} hasher The hasher to use in this HMAC helper.
     *
     * @return {Function} The shortcut function.
     *
     * @static
     *
     * @example
     *
     *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
     */
    _createHmacHelper: function (hasher) {
      return function (message, key) {
        return new C_algo.HMAC.init(hasher, key).finalize(message);
      };
    }
  });

  /**
   * Algorithm namespace.
   */
  var C_algo = C.algo = {};

  return C;
}(Math));
/*
 CryptoJS v3.1.2
 enc-base64.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function () {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var WordArray = C_lib.WordArray;
  var C_enc = C.enc;

  /**
   * Base64 encoding strategy.
   */
  var Base64 = C_enc.Base64 = {
    /**
     * Converts a word array to a Base64 string.
     *
     * @param {WordArray} wordArray The word array.
     *
     * @return {string} The Base64 string.
     *
     * @static
     *
     * @example
     *
     *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
     */
    stringify: function (wordArray) {
      // Shortcuts
      var words = wordArray.words;
      var sigBytes = wordArray.sigBytes;
      var map = this._map;

      // Clamp excess bits
      wordArray.clamp();

      // Convert
      var base64Chars = [];
      for (var i = 0; i < sigBytes; i += 3) {
        var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
        var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
        var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

        var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

        for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
          base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
        }
      }

      // Add padding
      var paddingChar = map.charAt(64);
      if (paddingChar) {
        while (base64Chars.length % 4) {
          base64Chars.push(paddingChar);
        }
      }

      return base64Chars.join('');
    },

    /**
     * Converts a Base64 string to a word array.
     *
     * @param {string} base64Str The Base64 string.
     *
     * @return {WordArray} The word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
     */
    parse: function (base64Str) {
      // Shortcuts
      var base64StrLength = base64Str.length;
      var map = this._map;

      // Ignore padding
      var paddingChar = map.charAt(64);
      if (paddingChar) {
        var paddingIndex = base64Str.indexOf(paddingChar);
        if (paddingIndex != -1) {
          base64StrLength = paddingIndex;
        }
      }

      // Convert
      var words = [];
      var nBytes = 0;
      for (var i = 0; i < base64StrLength; i++) {
        if (i % 4) {
          var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
          var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
          words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
          nBytes++;
        }
      }

      return WordArray.create(words, nBytes);
    },

    _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  };
}());
/*
 CryptoJS v3.1.2
 cipher-core
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
/**
 * Cipher core components.
 */
CryptoJS.lib.Cipher || (function (undefined) {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var Base = C_lib.Base;
  var WordArray = C_lib.WordArray;
  var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
  var C_enc = C.enc;
  var Utf8 = C_enc.Utf8;
  var Base64 = C_enc.Base64;
  var C_algo = C.algo;
  var EvpKDF = C_algo.EvpKDF;

  /**
   * Abstract base cipher template.
   *
   * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
   * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
   * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
   * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
   */
  var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
    /**
     * Configuration options.
     *
     * @property {WordArray} iv The IV to use for this operation.
     */
    cfg: Base.extend(),

    /**
     * Creates this cipher in encryption mode.
     *
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {Cipher} A cipher instance.
     *
     * @static
     *
     * @example
     *
     *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
     */
    createEncryptor: function (key, cfg) {
      return this.create(this._ENC_XFORM_MODE, key, cfg);
    },

    /**
     * Creates this cipher in decryption mode.
     *
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {Cipher} A cipher instance.
     *
     * @static
     *
     * @example
     *
     *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
     */
    createDecryptor: function (key, cfg) {
      return this.create(this._DEC_XFORM_MODE, key, cfg);
    },

    /**
     * Initializes a newly created cipher.
     *
     * @param {number} xformMode Either the encryption or decryption transormation mode constant.
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @example
     *
     *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
     */
    init: function (xformMode, key, cfg) {
      // Apply config defaults
      this.cfg = this.cfg.extend(cfg);

      // Store transform mode and key
      this._xformMode = xformMode;
      this._key = key;

      // Set initial values
      this.reset();
    },

    /**
     * Resets this cipher to its initial state.
     *
     * @example
     *
     *     cipher.reset();
     */
    reset: function () {
      // Reset data buffer
      BufferedBlockAlgorithm.reset.call(this);

      // Perform concrete-cipher logic
      this._doReset();
    },

    /**
     * Adds data to be encrypted or decrypted.
     *
     * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
     *
     * @return {WordArray} The data after processing.
     *
     * @example
     *
     *     var encrypted = cipher.process('data');
     *     var encrypted = cipher.process(wordArray);
     */
    process: function (dataUpdate) {
      // Append
      this._append(dataUpdate);

      // Process available blocks
      return this._process();
    },

    /**
     * Finalizes the encryption or decryption process.
     * Note that the finalize operation is effectively a destructive, read-once operation.
     *
     * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
     *
     * @return {WordArray} The data after final processing.
     *
     * @example
     *
     *     var encrypted = cipher.finalize();
     *     var encrypted = cipher.finalize('data');
     *     var encrypted = cipher.finalize(wordArray);
     */
    finalize: function (dataUpdate) {
      // Final data update
      if (dataUpdate) {
        this._append(dataUpdate);
      }

      // Perform concrete-cipher logic
      var finalProcessedData = this._doFinalize();

      return finalProcessedData;
    },

    keySize: 128/32,

    ivSize: 128/32,

    _ENC_XFORM_MODE: 1,

    _DEC_XFORM_MODE: 2,

    /**
     * Creates shortcut functions to a cipher's object interface.
     *
     * @param {Cipher} cipher The cipher to create a helper for.
     *
     * @return {Object} An object with encrypt and decrypt shortcut functions.
     *
     * @static
     *
     * @example
     *
     *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
     */
    _createHelper: (function () {
      function selectCipherStrategy(key) {
        if (typeof key == 'string') {
          return PasswordBasedCipher;
        } else {
          return SerializableCipher;
        }
      }

      return function (cipher) {
        return {
          encrypt: function (message, key, cfg) {
            return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
          },

          decrypt: function (ciphertext, key, cfg) {
            return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
          }
        };
      };
    }())
  });

  /**
   * Abstract base stream cipher template.
   *
   * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
   */
  var StreamCipher = C_lib.StreamCipher = Cipher.extend({
    _doFinalize: function () {
      // Process partial blocks
      var finalProcessedBlocks = this._process(!!'flush');

      return finalProcessedBlocks;
    },

    blockSize: 1
  });

  /**
   * Mode namespace.
   */
  var C_mode = C.mode = {};

  /**
   * Abstract base block cipher mode template.
   */
  var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
    /**
     * Creates this mode for encryption.
     *
     * @param {Cipher} cipher A block cipher instance.
     * @param {Array} iv The IV words.
     *
     * @static
     *
     * @example
     *
     *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
     */
    createEncryptor: function (cipher, iv) {
      return this.Encryptor.create(cipher, iv);
    },

    /**
     * Creates this mode for decryption.
     *
     * @param {Cipher} cipher A block cipher instance.
     * @param {Array} iv The IV words.
     *
     * @static
     *
     * @example
     *
     *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
     */
    createDecryptor: function (cipher, iv) {
      return this.Decryptor.create(cipher, iv);
    },

    /**
     * Initializes a newly created mode.
     *
     * @param {Cipher} cipher A block cipher instance.
     * @param {Array} iv The IV words.
     *
     * @example
     *
     *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
     */
    init: function (cipher, iv) {
      this._cipher = cipher;
      this._iv = iv;
    }
  });

  /**
   * Cipher Block Chaining mode.
   */
  var CBC = C_mode.CBC = (function () {
    /**
     * Abstract base CBC mode.
     */
    var CBC = BlockCipherMode.extend();

    /**
     * CBC encryptor.
     */
    CBC.Encryptor = CBC.extend({
      /**
       * Processes the data block at offset.
       *
       * @param {Array} words The data words to operate on.
       * @param {number} offset The offset where the block starts.
       *
       * @example
       *
       *     mode.processBlock(data.words, offset);
       */
      processBlock: function (words, offset) {
        // Shortcuts
        var cipher = this._cipher;
        var blockSize = cipher.blockSize;

        // XOR and encrypt
        xorBlock.call(this, words, offset, blockSize);
        cipher.encryptBlock(words, offset);

        // Remember this block to use with next block
        this._prevBlock = words.slice(offset, offset + blockSize);
      }
    });

    /**
     * CBC decryptor.
     */
    CBC.Decryptor = CBC.extend({
      /**
       * Processes the data block at offset.
       *
       * @param {Array} words The data words to operate on.
       * @param {number} offset The offset where the block starts.
       *
       * @example
       *
       *     mode.processBlock(data.words, offset);
       */
      processBlock: function (words, offset) {
        // Shortcuts
        var cipher = this._cipher;
        var blockSize = cipher.blockSize;

        // Remember this block to use with next block
        var thisBlock = words.slice(offset, offset + blockSize);

        // Decrypt and XOR
        cipher.decryptBlock(words, offset);
        xorBlock.call(this, words, offset, blockSize);

        // This block becomes the previous block
        this._prevBlock = thisBlock;
      }
    });

    function xorBlock(words, offset, blockSize) {
      // Shortcut
      var iv = this._iv;

      // Choose mixing block
      if (iv) {
        var block = iv;

        // Remove IV for subsequent blocks
        this._iv = undefined;
      } else {
        var block = this._prevBlock;
      }

      // XOR blocks
      for (var i = 0; i < blockSize; i++) {
        words[offset + i] ^= block[i];
      }
    }

    return CBC;
  }());

  /**
   * Padding namespace.
   */
  var C_pad = C.pad = {};

  /**
   * PKCS #5/7 padding strategy.
   */
  var Pkcs7 = C_pad.Pkcs7 = {
    /**
     * Pads data using the algorithm defined in PKCS #5/7.
     *
     * @param {WordArray} data The data to pad.
     * @param {number} blockSize The multiple that the data should be padded to.
     *
     * @static
     *
     * @example
     *
     *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
     */
    pad: function (data, blockSize) {
      // Shortcut
      var blockSizeBytes = blockSize * 4;

      // Count padding bytes
      var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

      // Create padding word
      var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

      // Create padding
      var paddingWords = [];
      for (var i = 0; i < nPaddingBytes; i += 4) {
        paddingWords.push(paddingWord);
      }
      var padding = WordArray.create(paddingWords, nPaddingBytes);

      // Add padding
      data.concat(padding);
    },

    /**
     * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
     *
     * @param {WordArray} data The data to unpad.
     *
     * @static
     *
     * @example
     *
     *     CryptoJS.pad.Pkcs7.unpad(wordArray);
     */
    unpad: function (data) {
      // Get number of padding bytes from last byte
      var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

      // Remove padding
      data.sigBytes -= nPaddingBytes;
    }
  };

  /**
   * Abstract base block cipher template.
   *
   * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
   */
  var BlockCipher = C_lib.BlockCipher = Cipher.extend({
    /**
     * Configuration options.
     *
     * @property {Mode} mode The block mode to use. Default: CBC
     * @property {Padding} padding The padding strategy to use. Default: Pkcs7
     */
    cfg: Cipher.cfg.extend({
      mode: CBC,
      padding: Pkcs7
    }),

    reset: function () {
      // Reset cipher
      Cipher.reset.call(this);

      // Shortcuts
      var cfg = this.cfg;
      var iv = cfg.iv;
      var mode = cfg.mode;

      // Reset block mode
      if (this._xformMode == this._ENC_XFORM_MODE) {
        var modeCreator = mode.createEncryptor;
      } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
        var modeCreator = mode.createDecryptor;

        // Keep at least one block in the buffer for unpadding
        this._minBufferSize = 1;
      }
      this._mode = modeCreator.call(mode, this, iv && iv.words);
    },

    _doProcessBlock: function (words, offset) {
      this._mode.processBlock(words, offset);
    },

    _doFinalize: function () {
      // Shortcut
      var padding = this.cfg.padding;

      // Finalize
      if (this._xformMode == this._ENC_XFORM_MODE) {
        // Pad data
        padding.pad(this._data, this.blockSize);

        // Process final blocks
        var finalProcessedBlocks = this._process(!!'flush');
      } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
        // Process final blocks
        var finalProcessedBlocks = this._process(!!'flush');

        // Unpad data
        padding.unpad(finalProcessedBlocks);
      }

      return finalProcessedBlocks;
    },

    blockSize: 128/32
  });

  /**
   * A collection of cipher parameters.
   *
   * @property {WordArray} ciphertext The raw ciphertext.
   * @property {WordArray} key The key to this ciphertext.
   * @property {WordArray} iv The IV used in the ciphering operation.
   * @property {WordArray} salt The salt used with a key derivation function.
   * @property {Cipher} algorithm The cipher algorithm.
   * @property {Mode} mode The block mode used in the ciphering operation.
   * @property {Padding} padding The padding scheme used in the ciphering operation.
   * @property {number} blockSize The block size of the cipher.
   * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
   */
  var CipherParams = C_lib.CipherParams = Base.extend({
    /**
     * Initializes a newly created cipher params object.
     *
     * @param {Object} cipherParams An object with any of the possible cipher parameters.
     *
     * @example
     *
     *     var cipherParams = CryptoJS.lib.CipherParams.create({
         *         ciphertext: ciphertextWordArray,
         *         key: keyWordArray,
         *         iv: ivWordArray,
         *         salt: saltWordArray,
         *         algorithm: CryptoJS.algo.AES,
         *         mode: CryptoJS.mode.CBC,
         *         padding: CryptoJS.pad.PKCS7,
         *         blockSize: 4,
         *         formatter: CryptoJS.format.OpenSSL
         *     });
     */
    init: function (cipherParams) {
      this.mixIn(cipherParams);
    },

    /**
     * Converts this cipher params object to a string.
     *
     * @param {Format} formatter (Optional) The formatting strategy to use.
     *
     * @return {string} The stringified cipher params.
     *
     * @throws Error If neither the formatter nor the default formatter is set.
     *
     * @example
     *
     *     var string = cipherParams + '';
     *     var string = cipherParams.toString();
     *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
     */
    toString: function (formatter) {
      return (formatter || this.formatter).stringify(this);
    }
  });

  /**
   * Format namespace.
   */
  var C_format = C.format = {};

  /**
   * OpenSSL formatting strategy.
   */
  var OpenSSLFormatter = C_format.OpenSSL = {
    /**
     * Converts a cipher params object to an OpenSSL-compatible string.
     *
     * @param {CipherParams} cipherParams The cipher params object.
     *
     * @return {string} The OpenSSL-compatible string.
     *
     * @static
     *
     * @example
     *
     *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
     */
    stringify: function (cipherParams) {
      // Shortcuts
      var ciphertext = cipherParams.ciphertext;
      var salt = cipherParams.salt;

      // Format
      if (salt) {
        var wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
      } else {
        var wordArray = ciphertext;
      }

      return wordArray.toString(Base64);
    },

    /**
     * Converts an OpenSSL-compatible string to a cipher params object.
     *
     * @param {string} openSSLStr The OpenSSL-compatible string.
     *
     * @return {CipherParams} The cipher params object.
     *
     * @static
     *
     * @example
     *
     *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
     */
    parse: function (openSSLStr) {
      // Parse base64
      var ciphertext = Base64.parse(openSSLStr);

      // Shortcut
      var ciphertextWords = ciphertext.words;

      // Test for salt
      if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
        // Extract salt
        var salt = WordArray.create(ciphertextWords.slice(2, 4));

        // Remove salt from ciphertext
        ciphertextWords.splice(0, 4);
        ciphertext.sigBytes -= 16;
      }

      return CipherParams.create({ ciphertext: ciphertext, salt: salt });
    }
  };

  /**
   * A cipher wrapper that returns ciphertext as a serializable cipher params object.
   */
  var SerializableCipher = C_lib.SerializableCipher = Base.extend({
    /**
     * Configuration options.
     *
     * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
     */
    cfg: Base.extend({
      format: OpenSSLFormatter
    }),

    /**
     * Encrypts a message.
     *
     * @param {Cipher} cipher The cipher algorithm to use.
     * @param {WordArray|string} message The message to encrypt.
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {CipherParams} A cipher params object.
     *
     * @static
     *
     * @example
     *
     *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
     *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
     *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
     */
    encrypt: function (cipher, message, key, cfg) {
      // Apply config defaults
      cfg = this.cfg.extend(cfg);

      // Encrypt
      var encryptor = cipher.createEncryptor(key, cfg);
      var ciphertext = encryptor.finalize(message);

      // Shortcut
      var cipherCfg = encryptor.cfg;

      // Create and return serializable cipher params
      return CipherParams.create({
        ciphertext: ciphertext,
        key: key,
        iv: cipherCfg.iv,
        algorithm: cipher,
        mode: cipherCfg.mode,
        padding: cipherCfg.padding,
        blockSize: cipher.blockSize,
        formatter: cfg.format
      });
    },

    /**
     * Decrypts serialized ciphertext.
     *
     * @param {Cipher} cipher The cipher algorithm to use.
     * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {WordArray} The plaintext.
     *
     * @static
     *
     * @example
     *
     *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
     *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
     */
    decrypt: function (cipher, ciphertext, key, cfg) {
      // Apply config defaults
      cfg = this.cfg.extend(cfg);

      // Convert string to CipherParams
      ciphertext = this._parse(ciphertext, cfg.format);

      // Decrypt
      var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

      return plaintext;
    },

    /**
     * Converts serialized ciphertext to CipherParams,
     * else assumed CipherParams already and returns ciphertext unchanged.
     *
     * @param {CipherParams|string} ciphertext The ciphertext.
     * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
     *
     * @return {CipherParams} The unserialized ciphertext.
     *
     * @static
     *
     * @example
     *
     *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
     */
    _parse: function (ciphertext, format) {
      if (typeof ciphertext == 'string') {
        return format.parse(ciphertext, this);
      } else {
        return ciphertext;
      }
    }
  });

  /**
   * Key derivation function namespace.
   */
  var C_kdf = C.kdf = {};

  /**
   * OpenSSL key derivation function.
   */
  var OpenSSLKdf = C_kdf.OpenSSL = {
    /**
     * Derives a key and IV from a password.
     *
     * @param {string} password The password to derive from.
     * @param {number} keySize The size in words of the key to generate.
     * @param {number} ivSize The size in words of the IV to generate.
     * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
     *
     * @return {CipherParams} A cipher params object with the key, IV, and salt.
     *
     * @static
     *
     * @example
     *
     *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
     *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
     */
    execute: function (password, keySize, ivSize, salt) {
      // Generate random salt
      if (!salt) {
        salt = WordArray.random(64/8);
      }

      // Derive key and IV
      var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);

      // Separate key and IV
      var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
      key.sigBytes = keySize * 4;

      // Return params
      return CipherParams.create({ key: key, iv: iv, salt: salt });
    }
  };

  /**
   * A serializable cipher wrapper that derives the key from a password,
   * and returns ciphertext as a serializable cipher params object.
   */
  var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
    /**
     * Configuration options.
     *
     * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
     */
    cfg: SerializableCipher.cfg.extend({
      kdf: OpenSSLKdf
    }),

    /**
     * Encrypts a message using a password.
     *
     * @param {Cipher} cipher The cipher algorithm to use.
     * @param {WordArray|string} message The message to encrypt.
     * @param {string} password The password.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {CipherParams} A cipher params object.
     *
     * @static
     *
     * @example
     *
     *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
     *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
     */
    encrypt: function (cipher, message, password, cfg) {
      // Apply config defaults
      cfg = this.cfg.extend(cfg);

      // Derive key and other params
      var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize);

      // Add IV to config
      cfg.iv = derivedParams.iv;

      // Encrypt
      var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

      // Mix in derived params
      ciphertext.mixIn(derivedParams);

      return ciphertext;
    },

    /**
     * Decrypts serialized ciphertext using a password.
     *
     * @param {Cipher} cipher The cipher algorithm to use.
     * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
     * @param {string} password The password.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {WordArray} The plaintext.
     *
     * @static
     *
     * @example
     *
     *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
     *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
     */
    decrypt: function (cipher, ciphertext, password, cfg) {
      // Apply config defaults
      cfg = this.cfg.extend(cfg);

      // Convert string to CipherParams
      ciphertext = this._parse(ciphertext, cfg.format);

      // Derive key and other params
      var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);

      // Add IV to config
      cfg.iv = derivedParams.iv;

      // Decrypt
      var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

      return plaintext;
    }
  });
}());
/*
 CryptoJS v3.1.2
 aes.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function () {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var BlockCipher = C_lib.BlockCipher;
  var C_algo = C.algo;

  // Lookup tables
  var SBOX = [];
  var INV_SBOX = [];
  var SUB_MIX_0 = [];
  var SUB_MIX_1 = [];
  var SUB_MIX_2 = [];
  var SUB_MIX_3 = [];
  var INV_SUB_MIX_0 = [];
  var INV_SUB_MIX_1 = [];
  var INV_SUB_MIX_2 = [];
  var INV_SUB_MIX_3 = [];

  // Compute lookup tables
  (function () {
    // Compute double table
    var d = [];
    for (var i = 0; i < 256; i++) {
      if (i < 128) {
        d[i] = i << 1;
      } else {
        d[i] = (i << 1) ^ 0x11b;
      }
    }

    // Walk GF(2^8)
    var x = 0;
    var xi = 0;
    for (var i = 0; i < 256; i++) {
      // Compute sbox
      var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
      sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
      SBOX[x] = sx;
      INV_SBOX[sx] = x;

      // Compute multiplication
      var x2 = d[x];
      var x4 = d[x2];
      var x8 = d[x4];

      // Compute sub bytes, mix columns tables
      var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
      SUB_MIX_0[x] = (t << 24) | (t >>> 8);
      SUB_MIX_1[x] = (t << 16) | (t >>> 16);
      SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
      SUB_MIX_3[x] = t;

      // Compute inv sub bytes, inv mix columns tables
      var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
      INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
      INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
      INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
      INV_SUB_MIX_3[sx] = t;

      // Compute next counter
      if (!x) {
        x = xi = 1;
      } else {
        x = x2 ^ d[d[d[x8 ^ x2]]];
        xi ^= d[d[xi]];
      }
    }
  }());

  // Precomputed Rcon lookup
  var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

  /**
   * AES block cipher algorithm.
   */
  var AES = C_algo.AES = BlockCipher.extend({
    _doReset: function () {
      // Shortcuts
      var key = this._key;
      var keyWords = key.words;
      var keySize = key.sigBytes / 4;

      // Compute number of rounds
      var nRounds = this._nRounds = keySize + 6

      // Compute number of key schedule rows
      var ksRows = (nRounds + 1) * 4;

      // Compute key schedule
      var keySchedule = this._keySchedule = [];
      for (var ksRow = 0; ksRow < ksRows; ksRow++) {
        if (ksRow < keySize) {
          keySchedule[ksRow] = keyWords[ksRow];
        } else {
          var t = keySchedule[ksRow - 1];

          if (!(ksRow % keySize)) {
            // Rot word
            t = (t << 8) | (t >>> 24);

            // Sub word
            t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

            // Mix Rcon
            t ^= RCON[(ksRow / keySize) | 0] << 24;
          } else if (keySize > 6 && ksRow % keySize == 4) {
            // Sub word
            t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
          }

          keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
        }
      }

      // Compute inv key schedule
      var invKeySchedule = this._invKeySchedule = [];
      for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
        var ksRow = ksRows - invKsRow;

        if (invKsRow % 4) {
          var t = keySchedule[ksRow];
        } else {
          var t = keySchedule[ksRow - 4];
        }

        if (invKsRow < 4 || ksRow <= 4) {
          invKeySchedule[invKsRow] = t;
        } else {
          invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
              INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
        }
      }
    },

    encryptBlock: function (M, offset) {
      this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
    },

    decryptBlock: function (M, offset) {
      // Swap 2nd and 4th rows
      var t = M[offset + 1];
      M[offset + 1] = M[offset + 3];
      M[offset + 3] = t;

      this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

      // Inv swap 2nd and 4th rows
      var t = M[offset + 1];
      M[offset + 1] = M[offset + 3];
      M[offset + 3] = t;
    },

    _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
      // Shortcut
      var nRounds = this._nRounds;

      // Get input, add round key
      var s0 = M[offset]     ^ keySchedule[0];
      var s1 = M[offset + 1] ^ keySchedule[1];
      var s2 = M[offset + 2] ^ keySchedule[2];
      var s3 = M[offset + 3] ^ keySchedule[3];

      // Key schedule row counter
      var ksRow = 4;

      // Rounds
      for (var round = 1; round < nRounds; round++) {
        // Shift rows, sub bytes, mix columns, add round key
        var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
        var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
        var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
        var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

        // Update state
        s0 = t0;
        s1 = t1;
        s2 = t2;
        s3 = t3;
      }

      // Shift rows, sub bytes, add round key
      var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
      var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
      var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
      var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

      // Set output
      M[offset]     = t0;
      M[offset + 1] = t1;
      M[offset + 2] = t2;
      M[offset + 3] = t3;
    },

    keySize: 256/32
  });

  /**
   * Shortcut functions to the cipher's object interface.
   *
   * @example
   *
   *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
   *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
   */
  C.AES = BlockCipher._createHelper(AES);
}());
/*
 CryptoJS v3.1.2
 md5.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function (Math) {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var WordArray = C_lib.WordArray;
  var Hasher = C_lib.Hasher;
  var C_algo = C.algo;

  // Constants table
  var T = [];

  // Compute constants
  (function () {
    for (var i = 0; i < 64; i++) {
      T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
    }
  }());

  /**
   * MD5 hash algorithm.
   */
  var MD5 = C_algo.MD5 = Hasher.extend({
    _doReset: function () {
      this._hash = new WordArray.init([
        0x67452301, 0xefcdab89,
        0x98badcfe, 0x10325476
      ]);
    },

    _doProcessBlock: function (M, offset) {
      // Swap endian
      for (var i = 0; i < 16; i++) {
        // Shortcuts
        var offset_i = offset + i;
        var M_offset_i = M[offset_i];

        M[offset_i] = (
            (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
                (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
            );
      }

      // Shortcuts
      var H = this._hash.words;

      var M_offset_0  = M[offset + 0];
      var M_offset_1  = M[offset + 1];
      var M_offset_2  = M[offset + 2];
      var M_offset_3  = M[offset + 3];
      var M_offset_4  = M[offset + 4];
      var M_offset_5  = M[offset + 5];
      var M_offset_6  = M[offset + 6];
      var M_offset_7  = M[offset + 7];
      var M_offset_8  = M[offset + 8];
      var M_offset_9  = M[offset + 9];
      var M_offset_10 = M[offset + 10];
      var M_offset_11 = M[offset + 11];
      var M_offset_12 = M[offset + 12];
      var M_offset_13 = M[offset + 13];
      var M_offset_14 = M[offset + 14];
      var M_offset_15 = M[offset + 15];

      // Working varialbes
      var a = H[0];
      var b = H[1];
      var c = H[2];
      var d = H[3];

      // Computation
      a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
      d = FF(d, a, b, c, M_offset_1,  12, T[1]);
      c = FF(c, d, a, b, M_offset_2,  17, T[2]);
      b = FF(b, c, d, a, M_offset_3,  22, T[3]);
      a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
      d = FF(d, a, b, c, M_offset_5,  12, T[5]);
      c = FF(c, d, a, b, M_offset_6,  17, T[6]);
      b = FF(b, c, d, a, M_offset_7,  22, T[7]);
      a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
      d = FF(d, a, b, c, M_offset_9,  12, T[9]);
      c = FF(c, d, a, b, M_offset_10, 17, T[10]);
      b = FF(b, c, d, a, M_offset_11, 22, T[11]);
      a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
      d = FF(d, a, b, c, M_offset_13, 12, T[13]);
      c = FF(c, d, a, b, M_offset_14, 17, T[14]);
      b = FF(b, c, d, a, M_offset_15, 22, T[15]);

      a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
      d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
      c = GG(c, d, a, b, M_offset_11, 14, T[18]);
      b = GG(b, c, d, a, M_offset_0,  20, T[19]);
      a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
      d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
      c = GG(c, d, a, b, M_offset_15, 14, T[22]);
      b = GG(b, c, d, a, M_offset_4,  20, T[23]);
      a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
      d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
      c = GG(c, d, a, b, M_offset_3,  14, T[26]);
      b = GG(b, c, d, a, M_offset_8,  20, T[27]);
      a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
      d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
      c = GG(c, d, a, b, M_offset_7,  14, T[30]);
      b = GG(b, c, d, a, M_offset_12, 20, T[31]);

      a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
      d = HH(d, a, b, c, M_offset_8,  11, T[33]);
      c = HH(c, d, a, b, M_offset_11, 16, T[34]);
      b = HH(b, c, d, a, M_offset_14, 23, T[35]);
      a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
      d = HH(d, a, b, c, M_offset_4,  11, T[37]);
      c = HH(c, d, a, b, M_offset_7,  16, T[38]);
      b = HH(b, c, d, a, M_offset_10, 23, T[39]);
      a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
      d = HH(d, a, b, c, M_offset_0,  11, T[41]);
      c = HH(c, d, a, b, M_offset_3,  16, T[42]);
      b = HH(b, c, d, a, M_offset_6,  23, T[43]);
      a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
      d = HH(d, a, b, c, M_offset_12, 11, T[45]);
      c = HH(c, d, a, b, M_offset_15, 16, T[46]);
      b = HH(b, c, d, a, M_offset_2,  23, T[47]);

      a = II(a, b, c, d, M_offset_0,  6,  T[48]);
      d = II(d, a, b, c, M_offset_7,  10, T[49]);
      c = II(c, d, a, b, M_offset_14, 15, T[50]);
      b = II(b, c, d, a, M_offset_5,  21, T[51]);
      a = II(a, b, c, d, M_offset_12, 6,  T[52]);
      d = II(d, a, b, c, M_offset_3,  10, T[53]);
      c = II(c, d, a, b, M_offset_10, 15, T[54]);
      b = II(b, c, d, a, M_offset_1,  21, T[55]);
      a = II(a, b, c, d, M_offset_8,  6,  T[56]);
      d = II(d, a, b, c, M_offset_15, 10, T[57]);
      c = II(c, d, a, b, M_offset_6,  15, T[58]);
      b = II(b, c, d, a, M_offset_13, 21, T[59]);
      a = II(a, b, c, d, M_offset_4,  6,  T[60]);
      d = II(d, a, b, c, M_offset_11, 10, T[61]);
      c = II(c, d, a, b, M_offset_2,  15, T[62]);
      b = II(b, c, d, a, M_offset_9,  21, T[63]);

      // Intermediate hash value
      H[0] = (H[0] + a) | 0;
      H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0;
    },

    _doFinalize: function () {
      // Shortcuts
      var data = this._data;
      var dataWords = data.words;

      var nBitsTotal = this._nDataBytes * 8;
      var nBitsLeft = data.sigBytes * 8;

      // Add padding
      dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

      var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
      var nBitsTotalL = nBitsTotal;
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
          (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
              (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
          );
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
          (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
              (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
          );

      data.sigBytes = (dataWords.length + 1) * 4;

      // Hash final blocks
      this._process();

      // Shortcuts
      var hash = this._hash;
      var H = hash.words;

      // Swap endian
      for (var i = 0; i < 4; i++) {
        // Shortcut
        var H_i = H[i];

        H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
            (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
      }

      // Return final computed hash
      return hash;
    },

    clone: function () {
      var clone = Hasher.clone.call(this);
      clone._hash = this._hash.clone();

      return clone;
    }
  });

  function FF(a, b, c, d, x, s, t) {
    var n = a + ((b & c) | (~b & d)) + x + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  }

  function GG(a, b, c, d, x, s, t) {
    var n = a + ((b & d) | (c & ~d)) + x + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  }

  function HH(a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + x + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  }

  function II(a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + x + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  }

  /**
   * Shortcut function to the hasher's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   *
   * @return {WordArray} The hash.
   *
   * @static
   *
   * @example
   *
   *     var hash = CryptoJS.MD5('message');
   *     var hash = CryptoJS.MD5(wordArray);
   */
  C.MD5 = Hasher._createHelper(MD5);

  /**
   * Shortcut function to the HMAC's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   * @param {WordArray|string} key The secret key.
   *
   * @return {WordArray} The HMAC.
   *
   * @static
   *
   * @example
   *
   *     var hmac = CryptoJS.HmacMD5(message, key);
   */
  C.HmacMD5 = Hasher._createHmacHelper(MD5);
}(Math));
/*
 CryptoJS v3.1.2
 sha1.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function () {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var WordArray = C_lib.WordArray;
  var Hasher = C_lib.Hasher;
  var C_algo = C.algo;

  // Reusable object
  var W = [];

  /**
   * SHA-1 hash algorithm.
   */
  var SHA1 = C_algo.SHA1 = Hasher.extend({
    _doReset: function () {
      this._hash = new WordArray.init([
        0x67452301, 0xefcdab89,
        0x98badcfe, 0x10325476,
        0xc3d2e1f0
      ]);
    },

    _doProcessBlock: function (M, offset) {
      // Shortcut
      var H = this._hash.words;

      // Working variables
      var a = H[0];
      var b = H[1];
      var c = H[2];
      var d = H[3];
      var e = H[4];

      // Computation
      for (var i = 0; i < 80; i++) {
        if (i < 16) {
          W[i] = M[offset + i] | 0;
        } else {
          var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
          W[i] = (n << 1) | (n >>> 31);
        }

        var t = ((a << 5) | (a >>> 27)) + e + W[i];
        if (i < 20) {
          t += ((b & c) | (~b & d)) + 0x5a827999;
        } else if (i < 40) {
          t += (b ^ c ^ d) + 0x6ed9eba1;
        } else if (i < 60) {
          t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
        } else /* if (i < 80) */ {
          t += (b ^ c ^ d) - 0x359d3e2a;
        }

        e = d;
        d = c;
        c = (b << 30) | (b >>> 2);
        b = a;
        a = t;
      }

      // Intermediate hash value
      H[0] = (H[0] + a) | 0;
      H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0;
    },

    _doFinalize: function () {
      // Shortcuts
      var data = this._data;
      var dataWords = data.words;

      var nBitsTotal = this._nDataBytes * 8;
      var nBitsLeft = data.sigBytes * 8;

      // Add padding
      dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
      data.sigBytes = dataWords.length * 4;

      // Hash final blocks
      this._process();

      // Return final computed hash
      return this._hash;
    },

    clone: function () {
      var clone = Hasher.clone.call(this);
      clone._hash = this._hash.clone();

      return clone;
    }
  });

  /**
   * Shortcut function to the hasher's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   *
   * @return {WordArray} The hash.
   *
   * @static
   *
   * @example
   *
   *     var hash = CryptoJS.SHA1('message');
   *     var hash = CryptoJS.SHA1(wordArray);
   */
  C.SHA1 = Hasher._createHelper(SHA1);

  /**
   * Shortcut function to the HMAC's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   * @param {WordArray|string} key The secret key.
   *
   * @return {WordArray} The HMAC.
   *
   * @static
   *
   * @example
   *
   *     var hmac = CryptoJS.HmacSHA1(message, key);
   */
  C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
}());
/*
 CryptoJS v3.1.2
 x64-core.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function (undefined) {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var Base = C_lib.Base;
  var X32WordArray = C_lib.WordArray;

  /**
   * x64 namespace.
   */
  var C_x64 = C.x64 = {};

  /**
   * A 64-bit word.
   */
  var X64Word = C_x64.Word = Base.extend({
    /**
     * Initializes a newly created 64-bit word.
     *
     * @param {number} high The high 32 bits.
     * @param {number} low The low 32 bits.
     *
     * @example
     *
     *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
     */
    init: function (high, low) {
      this.high = high;
      this.low = low;
    }

    /**
     * Bitwise NOTs this word.
     *
     * @return {X64Word} A new x64-Word object after negating.
     *
     * @example
     *
     *     var negated = x64Word.not();
     */
    // not: function () {
    // var high = ~this.high;
    // var low = ~this.low;

    // return X64Word.create(high, low);
    // },

    /**
     * Bitwise ANDs this word with the passed word.
     *
     * @param {X64Word} word The x64-Word to AND with this word.
     *
     * @return {X64Word} A new x64-Word object after ANDing.
     *
     * @example
     *
     *     var anded = x64Word.and(anotherX64Word);
     */
    // and: function (word) {
    // var high = this.high & word.high;
    // var low = this.low & word.low;

    // return X64Word.create(high, low);
    // },

    /**
     * Bitwise ORs this word with the passed word.
     *
     * @param {X64Word} word The x64-Word to OR with this word.
     *
     * @return {X64Word} A new x64-Word object after ORing.
     *
     * @example
     *
     *     var ored = x64Word.or(anotherX64Word);
     */
    // or: function (word) {
    // var high = this.high | word.high;
    // var low = this.low | word.low;

    // return X64Word.create(high, low);
    // },

    /**
     * Bitwise XORs this word with the passed word.
     *
     * @param {X64Word} word The x64-Word to XOR with this word.
     *
     * @return {X64Word} A new x64-Word object after XORing.
     *
     * @example
     *
     *     var xored = x64Word.xor(anotherX64Word);
     */
    // xor: function (word) {
    // var high = this.high ^ word.high;
    // var low = this.low ^ word.low;

    // return X64Word.create(high, low);
    // },

    /**
     * Shifts this word n bits to the left.
     *
     * @param {number} n The number of bits to shift.
     *
     * @return {X64Word} A new x64-Word object after shifting.
     *
     * @example
     *
     *     var shifted = x64Word.shiftL(25);
     */
    // shiftL: function (n) {
    // if (n < 32) {
    // var high = (this.high << n) | (this.low >>> (32 - n));
    // var low = this.low << n;
    // } else {
    // var high = this.low << (n - 32);
    // var low = 0;
    // }

    // return X64Word.create(high, low);
    // },

    /**
     * Shifts this word n bits to the right.
     *
     * @param {number} n The number of bits to shift.
     *
     * @return {X64Word} A new x64-Word object after shifting.
     *
     * @example
     *
     *     var shifted = x64Word.shiftR(7);
     */
    // shiftR: function (n) {
    // if (n < 32) {
    // var low = (this.low >>> n) | (this.high << (32 - n));
    // var high = this.high >>> n;
    // } else {
    // var low = this.high >>> (n - 32);
    // var high = 0;
    // }

    // return X64Word.create(high, low);
    // },

    /**
     * Rotates this word n bits to the left.
     *
     * @param {number} n The number of bits to rotate.
     *
     * @return {X64Word} A new x64-Word object after rotating.
     *
     * @example
     *
     *     var rotated = x64Word.rotL(25);
     */
    // rotL: function (n) {
    // return this.shiftL(n).or(this.shiftR(64 - n));
    // },

    /**
     * Rotates this word n bits to the right.
     *
     * @param {number} n The number of bits to rotate.
     *
     * @return {X64Word} A new x64-Word object after rotating.
     *
     * @example
     *
     *     var rotated = x64Word.rotR(7);
     */
    // rotR: function (n) {
    // return this.shiftR(n).or(this.shiftL(64 - n));
    // },

    /**
     * Adds this word with the passed word.
     *
     * @param {X64Word} word The x64-Word to add with this word.
     *
     * @return {X64Word} A new x64-Word object after adding.
     *
     * @example
     *
     *     var added = x64Word.add(anotherX64Word);
     */
    // add: function (word) {
    // var low = (this.low + word.low) | 0;
    // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
    // var high = (this.high + word.high + carry) | 0;

    // return X64Word.create(high, low);
    // }
  });

  /**
   * An array of 64-bit words.
   *
   * @property {Array} words The array of CryptoJS.x64.Word objects.
   * @property {number} sigBytes The number of significant bytes in this word array.
   */
  var X64WordArray = C_x64.WordArray = Base.extend({
    /**
     * Initializes a newly created word array.
     *
     * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
     * @param {number} sigBytes (Optional) The number of significant bytes in the words.
     *
     * @example
     *
     *     var wordArray = CryptoJS.x64.WordArray.create();
     *
     *     var wordArray = CryptoJS.x64.WordArray.create([
     *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
     *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
     *     ]);
     *
     *     var wordArray = CryptoJS.x64.WordArray.create([
     *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
     *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
     *     ], 10);
     */
    init: function (words, sigBytes) {
      words = this.words = words || [];

      if (sigBytes != undefined) {
        this.sigBytes = sigBytes;
      } else {
        this.sigBytes = words.length * 8;
      }
    },

    /**
     * Converts this 64-bit word array to a 32-bit word array.
     *
     * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
     *
     * @example
     *
     *     var x32WordArray = x64WordArray.toX32();
     */
    toX32: function () {
      // Shortcuts
      var x64Words = this.words;
      var x64WordsLength = x64Words.length;

      // Convert
      var x32Words = [];
      for (var i = 0; i < x64WordsLength; i++) {
        var x64Word = x64Words[i];
        x32Words.push(x64Word.high);
        x32Words.push(x64Word.low);
      }

      return X32WordArray.create(x32Words, this.sigBytes);
    },

    /**
     * Creates a copy of this word array.
     *
     * @return {X64WordArray} The clone.
     *
     * @example
     *
     *     var clone = x64WordArray.clone();
     */
    clone: function () {
      var clone = Base.clone.call(this);

      // Clone "words" array
      var words = clone.words = this.words.slice(0);

      // Clone each X64Word object
      var wordsLength = words.length;
      for (var i = 0; i < wordsLength; i++) {
        words[i] = words[i].clone();
      }

      return clone;
    }
  });
}());
/*
 CryptoJS v3.1.2
 sha256.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function (Math) {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var WordArray = C_lib.WordArray;
  var Hasher = C_lib.Hasher;
  var C_algo = C.algo;

  // Initialization and round constants tables
  var H = [];
  var K = [];

  // Compute constants
  (function () {
    function isPrime(n) {
      var sqrtN = Math.sqrt(n);
      for (var factor = 2; factor <= sqrtN; factor++) {
        if (!(n % factor)) {
          return false;
        }
      }

      return true;
    }

    function getFractionalBits(n) {
      return ((n - (n | 0)) * 0x100000000) | 0;
    }

    var n = 2;
    var nPrime = 0;
    while (nPrime < 64) {
      if (isPrime(n)) {
        if (nPrime < 8) {
          H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
        }
        K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

        nPrime++;
      }

      n++;
    }
  }());

  // Reusable object
  var W = [];

  /**
   * SHA-256 hash algorithm.
   */
  var SHA256 = C_algo.SHA256 = Hasher.extend({
    _doReset: function () {
      this._hash = new WordArray.init(H.slice(0));
    },

    _doProcessBlock: function (M, offset) {
      // Shortcut
      var H = this._hash.words;

      // Working variables
      var a = H[0];
      var b = H[1];
      var c = H[2];
      var d = H[3];
      var e = H[4];
      var f = H[5];
      var g = H[6];
      var h = H[7];

      // Computation
      for (var i = 0; i < 64; i++) {
        if (i < 16) {
          W[i] = M[offset + i] | 0;
        } else {
          var gamma0x = W[i - 15];
          var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
              ((gamma0x << 14) | (gamma0x >>> 18)) ^
              (gamma0x >>> 3);

          var gamma1x = W[i - 2];
          var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
              ((gamma1x << 13) | (gamma1x >>> 19)) ^
              (gamma1x >>> 10);

          W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
        }

        var ch  = (e & f) ^ (~e & g);
        var maj = (a & b) ^ (a & c) ^ (b & c);

        var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
        var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

        var t1 = h + sigma1 + ch + K[i] + W[i];
        var t2 = sigma0 + maj;

        h = g;
        g = f;
        f = e;
        e = (d + t1) | 0;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) | 0;
      }

      // Intermediate hash value
      H[0] = (H[0] + a) | 0;
      H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0;
      H[5] = (H[5] + f) | 0;
      H[6] = (H[6] + g) | 0;
      H[7] = (H[7] + h) | 0;
    },

    _doFinalize: function () {
      // Shortcuts
      var data = this._data;
      var dataWords = data.words;

      var nBitsTotal = this._nDataBytes * 8;
      var nBitsLeft = data.sigBytes * 8;

      // Add padding
      dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
      data.sigBytes = dataWords.length * 4;

      // Hash final blocks
      this._process();

      // Return final computed hash
      return this._hash;
    },

    clone: function () {
      var clone = Hasher.clone.call(this);
      clone._hash = this._hash.clone();

      return clone;
    }
  });

  /**
   * Shortcut function to the hasher's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   *
   * @return {WordArray} The hash.
   *
   * @static
   *
   * @example
   *
   *     var hash = CryptoJS.SHA256('message');
   *     var hash = CryptoJS.SHA256(wordArray);
   */
  C.SHA256 = Hasher._createHelper(SHA256);

  /**
   * Shortcut function to the HMAC's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   * @param {WordArray|string} key The secret key.
   *
   * @return {WordArray} The HMAC.
   *
   * @static
   *
   * @example
   *
   *     var hmac = CryptoJS.HmacSHA256(message, key);
   */
  C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));
/*
 CryptoJS v3.1.2
 sha512.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function () {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var Hasher = C_lib.Hasher;
  var C_x64 = C.x64;
  var X64Word = C_x64.Word;
  var X64WordArray = C_x64.WordArray;
  var C_algo = C.algo;

  function X64Word_create() {
    return X64Word.create.apply(X64Word, arguments);
  }

  // Constants
  var K = [
    X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
    X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
    X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
    X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
    X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
    X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
    X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
    X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
    X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
    X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
    X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
    X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
    X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
    X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
    X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
    X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
    X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
    X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
    X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
    X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
    X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
    X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
    X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
    X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
    X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
    X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
    X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
    X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
    X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
    X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
    X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
    X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
    X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
    X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
    X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
    X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
    X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
    X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
    X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
    X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
  ];

  // Reusable objects
  var W = [];
  (function () {
    for (var i = 0; i < 80; i++) {
      W[i] = X64Word_create();
    }
  }());

  /**
   * SHA-512 hash algorithm.
   */
  var SHA512 = C_algo.SHA512 = Hasher.extend({
    _doReset: function () {
      this._hash = new X64WordArray.init([
        new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
        new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
        new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
        new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
      ]);
    },

    _doProcessBlock: function (M, offset) {
      // Shortcuts
      var H = this._hash.words;

      var H0 = H[0];
      var H1 = H[1];
      var H2 = H[2];
      var H3 = H[3];
      var H4 = H[4];
      var H5 = H[5];
      var H6 = H[6];
      var H7 = H[7];

      var H0h = H0.high;
      var H0l = H0.low;
      var H1h = H1.high;
      var H1l = H1.low;
      var H2h = H2.high;
      var H2l = H2.low;
      var H3h = H3.high;
      var H3l = H3.low;
      var H4h = H4.high;
      var H4l = H4.low;
      var H5h = H5.high;
      var H5l = H5.low;
      var H6h = H6.high;
      var H6l = H6.low;
      var H7h = H7.high;
      var H7l = H7.low;

      // Working variables
      var ah = H0h;
      var al = H0l;
      var bh = H1h;
      var bl = H1l;
      var ch = H2h;
      var cl = H2l;
      var dh = H3h;
      var dl = H3l;
      var eh = H4h;
      var el = H4l;
      var fh = H5h;
      var fl = H5l;
      var gh = H6h;
      var gl = H6l;
      var hh = H7h;
      var hl = H7l;

      // Rounds
      for (var i = 0; i < 80; i++) {
        // Shortcut
        var Wi = W[i];

        // Extend message
        if (i < 16) {
          var Wih = Wi.high = M[offset + i * 2]     | 0;
          var Wil = Wi.low  = M[offset + i * 2 + 1] | 0;
        } else {
          // Gamma0
          var gamma0x  = W[i - 15];
          var gamma0xh = gamma0x.high;
          var gamma0xl = gamma0x.low;
          var gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
          var gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

          // Gamma1
          var gamma1x  = W[i - 2];
          var gamma1xh = gamma1x.high;
          var gamma1xl = gamma1x.low;
          var gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
          var gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

          // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
          var Wi7  = W[i - 7];
          var Wi7h = Wi7.high;
          var Wi7l = Wi7.low;

          var Wi16  = W[i - 16];
          var Wi16h = Wi16.high;
          var Wi16l = Wi16.low;

          var Wil = gamma0l + Wi7l;
          var Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
          var Wil = Wil + gamma1l;
          var Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
          var Wil = Wil + Wi16l;
          var Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

          Wi.high = Wih;
          Wi.low  = Wil;
        }

        var chh  = (eh & fh) ^ (~eh & gh);
        var chl  = (el & fl) ^ (~el & gl);
        var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
        var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

        var sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
        var sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
        var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
        var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

        // t1 = h + sigma1 + ch + K[i] + W[i]
        var Ki  = K[i];
        var Kih = Ki.high;
        var Kil = Ki.low;

        var t1l = hl + sigma1l;
        var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
        var t1l = t1l + chl;
        var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
        var t1l = t1l + Kil;
        var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
        var t1l = t1l + Wil;
        var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

        // t2 = sigma0 + maj
        var t2l = sigma0l + majl;
        var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

        // Update working variables
        hh = gh;
        hl = gl;
        gh = fh;
        gl = fl;
        fh = eh;
        fl = el;
        el = (dl + t1l) | 0;
        eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
        dh = ch;
        dl = cl;
        ch = bh;
        cl = bl;
        bh = ah;
        bl = al;
        al = (t1l + t2l) | 0;
        ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
      }

      // Intermediate hash value
      H0l = H0.low  = (H0l + al);
      H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
      H1l = H1.low  = (H1l + bl);
      H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
      H2l = H2.low  = (H2l + cl);
      H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
      H3l = H3.low  = (H3l + dl);
      H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
      H4l = H4.low  = (H4l + el);
      H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
      H5l = H5.low  = (H5l + fl);
      H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
      H6l = H6.low  = (H6l + gl);
      H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
      H7l = H7.low  = (H7l + hl);
      H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
    },

    _doFinalize: function () {
      // Shortcuts
      var data = this._data;
      var dataWords = data.words;

      var nBitsTotal = this._nDataBytes * 8;
      var nBitsLeft = data.sigBytes * 8;

      // Add padding
      dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
      dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
      dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
      data.sigBytes = dataWords.length * 4;

      // Hash final blocks
      this._process();

      // Convert hash to 32-bit word array before returning
      var hash = this._hash.toX32();

      // Return final computed hash
      return hash;
    },

    clone: function () {
      var clone = Hasher.clone.call(this);
      clone._hash = this._hash.clone();

      return clone;
    },

    blockSize: 1024/32
  });

  /**
   * Shortcut function to the hasher's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   *
   * @return {WordArray} The hash.
   *
   * @static
   *
   * @example
   *
   *     var hash = CryptoJS.SHA512('message');
   *     var hash = CryptoJS.SHA512(wordArray);
   */
  C.SHA512 = Hasher._createHelper(SHA512);

  /**
   * Shortcut function to the HMAC's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   * @param {WordArray|string} key The secret key.
   *
   * @return {WordArray} The HMAC.
   *
   * @static
   *
   * @example
   *
   *     var hmac = CryptoJS.HmacSHA512(message, key);
   */
  C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
}());
/*
 CryptoJS v3.1.2
 sha3.js
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function (Math) {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var WordArray = C_lib.WordArray;
  var Hasher = C_lib.Hasher;
  var C_x64 = C.x64;
  var X64Word = C_x64.Word;
  var C_algo = C.algo;

  // Constants tables
  var RHO_OFFSETS = [];
  var PI_INDEXES  = [];
  var ROUND_CONSTANTS = [];

  // Compute Constants
  (function () {
    // Compute rho offset constants
    var x = 1, y = 0;
    for (var t = 0; t < 24; t++) {
      RHO_OFFSETS[x + 5 * y] = ((t + 1) * (t + 2) / 2) % 64;

      var newX = y % 5;
      var newY = (2 * x + 3 * y) % 5;
      x = newX;
      y = newY;
    }

    // Compute pi index constants
    for (var x = 0; x < 5; x++) {
      for (var y = 0; y < 5; y++) {
        PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5;
      }
    }

    // Compute round constants
    var LFSR = 0x01;
    for (var i = 0; i < 24; i++) {
      var roundConstantMsw = 0;
      var roundConstantLsw = 0;

      for (var j = 0; j < 7; j++) {
        if (LFSR & 0x01) {
          var bitPosition = (1 << j) - 1;
          if (bitPosition < 32) {
            roundConstantLsw ^= 1 << bitPosition;
          } else /* if (bitPosition >= 32) */ {
            roundConstantMsw ^= 1 << (bitPosition - 32);
          }
        }

        // Compute next LFSR
        if (LFSR & 0x80) {
          // Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
          LFSR = (LFSR << 1) ^ 0x71;
        } else {
          LFSR <<= 1;
        }
      }

      ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
    }
  }());

  // Reusable objects for temporary values
  var T = [];
  (function () {
    for (var i = 0; i < 25; i++) {
      T[i] = X64Word.create();
    }
  }());

  /**
   * SHA-3 hash algorithm.
   */
  var SHA3 = C_algo.SHA3 = Hasher.extend({
    /**
     * Configuration options.
     *
     * @property {number} outputLength
     *   The desired number of bits in the output hash.
     *   Only values permitted are: 224, 256, 384, 512.
     *   Default: 512
     */
    cfg: Hasher.cfg.extend({
      outputLength: 512
    }),

    _doReset: function () {
      var state = this._state = []
      for (var i = 0; i < 25; i++) {
        state[i] = new X64Word.init();
      }

      this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
    },

    _doProcessBlock: function (M, offset) {
      // Shortcuts
      var state = this._state;
      var nBlockSizeLanes = this.blockSize / 2;

      // Absorb
      for (var i = 0; i < nBlockSizeLanes; i++) {
        // Shortcuts
        var M2i  = M[offset + 2 * i];
        var M2i1 = M[offset + 2 * i + 1];

        // Swap endian
        M2i = (
            (((M2i << 8)  | (M2i >>> 24)) & 0x00ff00ff) |
                (((M2i << 24) | (M2i >>> 8))  & 0xff00ff00)
            );
        M2i1 = (
            (((M2i1 << 8)  | (M2i1 >>> 24)) & 0x00ff00ff) |
                (((M2i1 << 24) | (M2i1 >>> 8))  & 0xff00ff00)
            );

        // Absorb message into state
        var lane = state[i];
        lane.high ^= M2i1;
        lane.low  ^= M2i;
      }

      // Rounds
      for (var round = 0; round < 24; round++) {
        // Theta
        for (var x = 0; x < 5; x++) {
          // Mix column lanes
          var tMsw = 0, tLsw = 0;
          for (var y = 0; y < 5; y++) {
            var lane = state[x + 5 * y];
            tMsw ^= lane.high;
            tLsw ^= lane.low;
          }

          // Temporary values
          var Tx = T[x];
          Tx.high = tMsw;
          Tx.low  = tLsw;
        }
        for (var x = 0; x < 5; x++) {
          // Shortcuts
          var Tx4 = T[(x + 4) % 5];
          var Tx1 = T[(x + 1) % 5];
          var Tx1Msw = Tx1.high;
          var Tx1Lsw = Tx1.low;

          // Mix surrounding columns
          var tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31));
          var tLsw = Tx4.low  ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31));
          for (var y = 0; y < 5; y++) {
            var lane = state[x + 5 * y];
            lane.high ^= tMsw;
            lane.low  ^= tLsw;
          }
        }

        // Rho Pi
        for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
          // Shortcuts
          var lane = state[laneIndex];
          var laneMsw = lane.high;
          var laneLsw = lane.low;
          var rhoOffset = RHO_OFFSETS[laneIndex];

          // Rotate lanes
          if (rhoOffset < 32) {
            var tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset));
            var tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset));
          } else /* if (rhoOffset >= 32) */ {
            var tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset));
            var tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset));
          }

          // Transpose lanes
          var TPiLane = T[PI_INDEXES[laneIndex]];
          TPiLane.high = tMsw;
          TPiLane.low  = tLsw;
        }

        // Rho pi at x = y = 0
        var T0 = T[0];
        var state0 = state[0];
        T0.high = state0.high;
        T0.low  = state0.low;

        // Chi
        for (var x = 0; x < 5; x++) {
          for (var y = 0; y < 5; y++) {
            // Shortcuts
            var laneIndex = x + 5 * y;
            var lane = state[laneIndex];
            var TLane = T[laneIndex];
            var Tx1Lane = T[((x + 1) % 5) + 5 * y];
            var Tx2Lane = T[((x + 2) % 5) + 5 * y];

            // Mix rows
            lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high);
            lane.low  = TLane.low  ^ (~Tx1Lane.low  & Tx2Lane.low);
          }
        }

        // Iota
        var lane = state[0];
        var roundConstant = ROUND_CONSTANTS[round];
        lane.high ^= roundConstant.high;
        lane.low  ^= roundConstant.low;;
      }
    },

    _doFinalize: function () {
      // Shortcuts
      var data = this._data;
      var dataWords = data.words;
      var nBitsTotal = this._nDataBytes * 8;
      var nBitsLeft = data.sigBytes * 8;
      var blockSizeBits = this.blockSize * 32;

      // Add padding
      dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - nBitsLeft % 32);
      dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80;
      data.sigBytes = dataWords.length * 4;

      // Hash final blocks
      this._process();

      // Shortcuts
      var state = this._state;
      var outputLengthBytes = this.cfg.outputLength / 8;
      var outputLengthLanes = outputLengthBytes / 8;

      // Squeeze
      var hashWords = [];
      for (var i = 0; i < outputLengthLanes; i++) {
        // Shortcuts
        var lane = state[i];
        var laneMsw = lane.high;
        var laneLsw = lane.low;

        // Swap endian
        laneMsw = (
            (((laneMsw << 8)  | (laneMsw >>> 24)) & 0x00ff00ff) |
                (((laneMsw << 24) | (laneMsw >>> 8))  & 0xff00ff00)
            );
        laneLsw = (
            (((laneLsw << 8)  | (laneLsw >>> 24)) & 0x00ff00ff) |
                (((laneLsw << 24) | (laneLsw >>> 8))  & 0xff00ff00)
            );

        // Squeeze state to retrieve hash
        hashWords.push(laneLsw);
        hashWords.push(laneMsw);
      }

      // Return final computed hash
      return new WordArray.init(hashWords, outputLengthBytes);
    },

    clone: function () {
      var clone = Hasher.clone.call(this);

      var state = clone._state = this._state.slice(0);
      for (var i = 0; i < 25; i++) {
        state[i] = state[i].clone();
      }

      return clone;
    }
  });

  /**
   * Shortcut function to the hasher's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   *
   * @return {WordArray} The hash.
   *
   * @static
   *
   * @example
   *
   *     var hash = CryptoJS.SHA3('message');
   *     var hash = CryptoJS.SHA3(wordArray);
   */
  C.SHA3 = Hasher._createHelper(SHA3);

  /**
   * Shortcut function to the HMAC's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   * @param {WordArray|string} key The secret key.
   *
   * @return {WordArray} The HMAC.
   *
   * @static
   *
   * @example
   *
   *     var hmac = CryptoJS.HmacSHA3(message, key);
   */
  C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
}(Math));

; browserify_shim__define__module__export__(typeof CryptoJS != "undefined" ? CryptoJS : window.CryptoJS);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
(function (global){
;__browserify_shim_require__=_dereq_;(function browserifyShim(module, exports, _dereq_, define, browserify_shim__define__module__export__) {
/**
 * Lawnchair!
 * ---
 * clientside json store
 *
 */
var Lawnchair = function (options, callback) {
  // ensure Lawnchair was called as a constructor
  if (!(this instanceof Lawnchair)) return new Lawnchair(options, callback);

  // lawnchair requires json
  if (!JSON) throw 'JSON unavailable! Include http://www.json.org/json2.js to fix.'
  // options are optional; callback is not
  if (arguments.length <= 2 && arguments.length > 0) {
    callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1];
    options  = (typeof arguments[0] === 'function') ? {} : arguments[0];
  } else {
    throw 'Incorrect # of ctor args!'
  }
  // TODO perhaps allow for pub/sub instead?
  if (typeof callback !== 'function') throw 'No callback was provided';

  // default configuration
  this.record = options.record || 'record'  // default for records
  this.name   = options.name   || 'records' // default name for underlying store

  // mixin first valid  adapter
  var adapter
  // if the adapter is passed in we try to load that only
  if (options.adapter) {

    // the argument passed should be an array of prefered adapters
    // if it is not, we convert it
    if(typeof(options.adapter) === 'string'){
      options.adapter = [options.adapter];
    }

    // iterates over the array of passed adapters
    for(var j = 0, k = options.adapter.length; j < k; j++){

      // itirates over the array of available adapters
      for (var i = Lawnchair.adapters.length-1; i >= 0; i--) {
        if (Lawnchair.adapters[i].adapter === options.adapter[j]) {
          adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined;
          if (adapter) break
        }
      }
      if (adapter) break
    }

    // otherwise find the first valid adapter for this env
  }
  else {
    for (var i = 0, l = Lawnchair.adapters.length; i < l; i++) {
      adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined
      if (adapter) break
    }
  }

  // we have failed
  if (!adapter) throw 'No valid adapter.'

  // yay! mixin the adapter
  for (var j in adapter)
    this[j] = adapter[j]

  // call init for each mixed in plugin
  for (var i = 0, l = Lawnchair.plugins.length; i < l; i++)
    Lawnchair.plugins[i].call(this)

  // init the adapter
  this.init(options, callback)
}

Lawnchair.adapters = []

/**
 * queues an adapter for mixin
 * ===
 * - ensures an adapter conforms to a specific interface
 *
 */
Lawnchair.adapter = function (id, obj) {
  // add the adapter id to the adapter obj
  // ugly here for a  cleaner dsl for implementing adapters
  obj['adapter'] = id
  // methods required to implement a lawnchair adapter
  var implementing = 'adapter valid init keys save batch get exists all remove nuke'.split(' ')
    ,   indexOf = this.prototype.indexOf
  // mix in the adapter
  for (var i in obj) {
    if (indexOf(implementing, i) === -1) throw 'Invalid adapter! Nonstandard method: ' + i
  }
  // if we made it this far the adapter interface is valid
  // insert the new adapter as the preferred adapter
  Lawnchair.adapters.splice(0,0,obj)
}

Lawnchair.plugins = []

/**
 * generic shallow extension for plugins
 * ===
 * - if an init method is found it registers it to be called when the lawnchair is inited
 * - yes we could use hasOwnProp but nobody here is an asshole
 */
Lawnchair.plugin = function (obj) {
  for (var i in obj)
    i === 'init' ? Lawnchair.plugins.push(obj[i]) : this.prototype[i] = obj[i]
}

/**
 * helpers
 *
 */
Lawnchair.prototype = {

  isArray: Array.isArray || function(o) { return Object.prototype.toString.call(o) === '[object Array]' },

  /**
   * this code exists for ie8... for more background see:
   * http://www.flickr.com/photos/westcoastlogic/5955365742/in/photostream
   */
  indexOf: function(ary, item, i, l) {
    if (ary.indexOf) return ary.indexOf(item)
    for (i = 0, l = ary.length; i < l; i++) if (ary[i] === item) return i
    return -1
  },

  // awesome shorthand callbacks as strings. this is shameless theft from dojo.
  lambda: function (callback) {
    return this.fn(this.record, callback)
  },

  // first stab at named parameters for terse callbacks; dojo: first != best // ;D
  fn: function (name, callback) {
    return typeof callback == 'string' ? new Function(name, callback) : callback
  },

  // returns a unique identifier (by way of Backbone.localStorage.js)
  // TODO investigate smaller UUIDs to cut on storage cost
  uuid: function () {
    var S4 = function () {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  },

  // a classic iterator
  each: function (callback) {
    var cb = this.lambda(callback)
    // iterate from chain
    if (this.__results) {
      for (var i = 0, l = this.__results.length; i < l; i++) cb.call(this, this.__results[i], i)
    }
    // otherwise iterate the entire collection
    else {
      this.all(function(r) {
        for (var i = 0, l = r.length; i < l; i++) cb.call(this, r[i], i)
      })
    }
    return this
  }
// --
};
// window.name code courtesy Remy Sharp: http://24ways.org/2009/breaking-out-the-edges-of-the-browser
Lawnchair.adapter('window-name', (function() {
  if (typeof window==='undefined') {
    window = { top: { } }; // node/optimizer compatibility
  }

  // edited from the original here by elsigh
  // Some sites store JSON data in window.top.name, but some folks (twitter on iPad)
  // put simple strings in there - we should make sure not to cause a SyntaxError.
  var data = {}
  try {
    data = JSON.parse(window.top.name)
  } catch (e) {}


  return {

    valid: function () {
      return typeof window.top.name != 'undefined'
    },

    init: function (options, callback) {
      data[this.name] = data[this.name] || {index:[],store:{}}
      this.index = data[this.name].index
      this.store = data[this.name].store
      this.fn(this.name, callback).call(this, this)
      return this
    },

    keys: function (callback) {
      this.fn('keys', callback).call(this, this.index)
      return this
    },

    save: function (obj, cb) {
      // data[key] = value + ''; // force to string
      // window.top.name = JSON.stringify(data);
      var key = obj.key || this.uuid()
      this.exists(key, function(exists) {
        if (!exists) {
          if (obj.key) delete obj.key
          this.index.push(key)
        }
        this.store[key] = obj

        try {
          window.top.name = JSON.stringify(data) // TODO wow, this is the only diff from the memory adapter
        } catch(e) {
          // restore index/store to previous value before JSON exception
          if (!exists) {
            this.index.pop();
            delete this.store[key];
          }
          throw e;
        }

        if (cb) {
          obj.key = key
          this.lambda(cb).call(this, obj)
        }
      })
      return this
    },

    batch: function (objs, cb) {
      var r = []
      for (var i = 0, l = objs.length; i < l; i++) {
        this.save(objs[i], function(record) {
          r.push(record)
        })
      }
      if (cb) this.lambda(cb).call(this, r)
      return this
    },

    get: function (keyOrArray, cb) {
      var r;
      if (this.isArray(keyOrArray)) {
        r = []
        for (var i = 0, l = keyOrArray.length; i < l; i++) {
          r.push(this.store[keyOrArray[i]])
        }
      } else {
        r = this.store[keyOrArray]
        if (r) r.key = keyOrArray
      }
      if (cb) this.lambda(cb).call(this, r)
      return this
    },

    exists: function (key, cb) {
      this.lambda(cb).call(this, !!(this.store[key]))
      return this
    },

    all: function (cb) {
      var r = []
      for (var i = 0, l = this.index.length; i < l; i++) {
        var obj = this.store[this.index[i]]
        obj.key = this.index[i]
        r.push(obj)
      }
      this.fn(this.name, cb).call(this, r)
      return this
    },

    remove: function (keyOrArray, cb) {
      var del = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray]
      for (var i = 0, l = del.length; i < l; i++) {
        var key = del[i].key ? del[i].key : del[i]
        var where = this.indexOf(this.index, key)
        if (where < 0) continue /* key not present */
        delete this.store[key]
        this.index.splice(where, 1)
      }
      window.top.name = JSON.stringify(data)
      if (cb) this.lambda(cb).call(this)
      return this
    },

    nuke: function (cb) {
      this.store = data[this.name].store = {}
      this.index = data[this.name].index = []
      window.top.name = JSON.stringify(data)
      if (cb) this.lambda(cb).call(this)
      return this
    }
  }
/////
})())
/**
 * dom storage adapter
 * ===
 * - originally authored by Joseph Pecoraro
 *
 */
//
// TODO does it make sense to be chainable all over the place?
// chainable: nuke, remove, all, get, save, all    
// not chainable: valid, keys
//
Lawnchair.adapter('dom', (function() {
  var storage = null;
  try{
    storage = window.localStorage;
  }catch(e){

  }
  // the indexer is an encapsulation of the helpers needed to keep an ordered index of the keys
  var indexer = function(name) {
    return {
      // the key
      key: name + '._index_',
      // returns the index
      all: function() {
        var a  = storage.getItem(this.key)
        if (a) {
          a = JSON.parse(a)
        }
        if (a === null) storage.setItem(this.key, JSON.stringify([])) // lazy init
        return JSON.parse(storage.getItem(this.key))
      },
      // adds a key to the index
      add: function (key) {
        var a = this.all()
        a.push(key)
        storage.setItem(this.key, JSON.stringify(a))
      },
      // deletes a key from the index
      del: function (key) {
        var a = this.all(), r = []
        // FIXME this is crazy inefficient but I'm in a strata meeting and half concentrating
        for (var i = 0, l = a.length; i < l; i++) {
          if (a[i] != key) r.push(a[i])
        }
        storage.setItem(this.key, JSON.stringify(r))
      },
      // returns index for a key
      find: function (key) {
        var a = this.all()
        for (var i = 0, l = a.length; i < l; i++) {
          if (key === a[i]) return i
        }
        return false
      }
    }
  }

  // adapter api
  return {

    // ensure we are in an env with localStorage
    valid: function () {
      return !!storage && function() {
        // in mobile safari if safe browsing is enabled, window.storage
        // is defined but setItem calls throw exceptions.
        var success = true
        var value = Math.random()
        try {
          storage.setItem(value, value)
        } catch (e) {
          success = false
        }
        storage.removeItem(value)
        return success
      }()
    },

    init: function (options, callback) {
      this.indexer = indexer(this.name)
      if (callback) this.fn(this.name, callback).call(this, this)
    },

    save: function (obj, callback) {
      var key = obj.key ? this.name + '.' + obj.key : this.name + '.' + this.uuid()
      // now we kil the key and use it in the store colleciton
      delete obj.key;
      storage.setItem(key, JSON.stringify(obj))
      // if the key is not in the index push it on
      if (this.indexer.find(key) === false) this.indexer.add(key)
      obj.key = key.slice(this.name.length + 1)
      if (callback) {
        this.lambda(callback).call(this, obj)
      }
      return this
    },

    batch: function (ary, callback) {
      var saved = []
      // not particularily efficient but this is more for sqlite situations
      for (var i = 0, l = ary.length; i < l; i++) {
        this.save(ary[i], function(r){
          saved.push(r)
        })
      }
      if (callback) this.lambda(callback).call(this, saved)
      return this
    },

    // accepts [options], callback
    keys: function(callback) {
      if (callback) {
        var name = this.name
        var indices = this.indexer.all();
        var keys = [];
        //Checking for the support of map.
        if(Array.prototype.map) {
          keys = indices.map(function(r){ return r.replace(name + '.', '') })
        } else {
          for (var key in indices) {
            keys.push(key.replace(name + '.', ''));
          }
        }
        this.fn('keys', callback).call(this, keys)
      }
      return this // TODO options for limit/offset, return promise
    },

    get: function (key, callback) {
      if (this.isArray(key)) {
        var r = []
        for (var i = 0, l = key.length; i < l; i++) {
          var k = this.name + '.' + key[i]
          var obj = storage.getItem(k)
          if (obj) {
            obj = JSON.parse(obj)
            obj.key = key[i]
          }
          r.push(obj)
        }
        if (callback) this.lambda(callback).call(this, r)
      } else {
        var k = this.name + '.' + key
        var  obj = storage.getItem(k)
        if (obj) {
          obj = JSON.parse(obj)
          obj.key = key
        }
        if (callback) this.lambda(callback).call(this, obj)
      }
      return this
    },

    exists: function (key, cb) {
      var exists = this.indexer.find(this.name+'.'+key) === false ? false : true ;
      this.lambda(cb).call(this, exists);
      return this;
    },
    // NOTE adapters cannot set this.__results but plugins do
    // this probably should be reviewed
    all: function (callback) {
      var idx = this.indexer.all()
        ,   r   = []
        ,   o
        ,   k
      for (var i = 0, l = idx.length; i < l; i++) {
        k     = idx[i] //v
        o     = JSON.parse(storage.getItem(k))
        o.key = k.replace(this.name + '.', '')
        r.push(o)
      }
      if (callback) this.fn(this.name, callback).call(this, r)
      return this
    },

    remove: function (keyOrArray, callback) {
      var self = this;
      if (this.isArray(keyOrArray)) {
        // batch remove
        var i, done = keyOrArray.length;
        var removeOne = function(i) {
          self.remove(keyOrArray[i], function() {
            if ((--done) > 0) { return; }
            if (callback) {
              self.lambda(callback).call(self);
            }
          });
        };
        for (i=0; i < keyOrArray.length; i++)
          removeOne(i);
        return this;
      }
      var key = this.name + '.' +
        ((keyOrArray.key) ? keyOrArray.key : keyOrArray)
      this.indexer.del(key)
      storage.removeItem(key)
      if (callback) this.lambda(callback).call(this)
      return this
    },

    nuke: function (callback) {
      this.all(function(r) {
        for (var i = 0, l = r.length; i < l; i++) {
          this.remove(r[i]);
        }
        if (callback) this.lambda(callback).call(this)
      })
      return this
    }
  }})());
Lawnchair.adapter('webkit-sqlite', (function() {
  // private methods
  var fail = function(e, i) {
    if (console) {
      console.log('error in sqlite adaptor!', e, i)
    }
  }, now = function() {
      return new Date()
    } // FIXME need to use better date fn
    // not entirely sure if this is needed...

  // public methods
  return {

    valid: function() {
      return !!(window.openDatabase)
    },

    init: function(options, callback) {
      var that = this,
        cb = that.fn(that.name, callback),
        create = "CREATE TABLE IF NOT EXISTS " + this.record + " (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)",
        win = function() {
          return cb.call(that, that);
        }
        // open a connection and create the db if it doesn't exist
        //FEEDHENRY CHANGE TO ALLOW ERROR CALLBACK
      if (options && 'function' === typeof options.fail) fail = options.fail
        //END CHANGE
      this.db = openDatabase(this.name, '1.0.0', this.name, 65536)
      this.db.transaction(function(t) {
        t.executeSql(create, [], win, fail)
      })
    },

    keys: function(callback) {
      var cb = this.lambda(callback),
        that = this,
        keys = "SELECT id FROM " + this.record + " ORDER BY timestamp DESC"

      this.db.readTransaction(function(t) {
        var win = function(xxx, results) {
          if (results.rows.length == 0) {
            cb.call(that, [])
          } else {
            var r = [];
            for (var i = 0, l = results.rows.length; i < l; i++) {
              r.push(results.rows.item(i).id);
            }
            cb.call(that, r)
          }
        }
        t.executeSql(keys, [], win, fail)
      })
      return this
    },
    // you think thats air you're breathing now?
    save: function(obj, callback, error) {
      var that = this
      objs = (this.isArray(obj) ? obj : [obj]).map(function(o) {
        if (!o.key) {
          o.key = that.uuid()
        }
        return o
      }),
        ins = "INSERT OR REPLACE INTO " + this.record + " (value, timestamp, id) VALUES (?,?,?)",
        win = function() {
          if (callback) {
            that.lambda(callback).call(that, that.isArray(obj) ? objs : objs[0])
          }
        }, error = error || function() {}, insvals = [],
        ts = now()

        try {
          for (var i = 0, l = objs.length; i < l; i++) {
            insvals[i] = [JSON.stringify(objs[i]), ts, objs[i].key];
          }
        } catch (e) {
          fail(e)
          throw e;
        }

      that.db.transaction(function(t) {
        for (var i = 0, l = objs.length; i < l; i++)
          t.executeSql(ins, insvals[i])
      }, function(e, i) {
        fail(e, i)
      }, win)

      return this
    },


    batch: function(objs, callback) {
      return this.save(objs, callback)
    },

    get: function(keyOrArray, cb) {
      var that = this,
        sql = '',
        args = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray];
      // batch selects support
      sql = 'SELECT id, value FROM ' + this.record + " WHERE id IN (" +
        args.map(function() {
        return '?'
      }).join(",") + ")"
      // FIXME
      // will always loop the results but cleans it up if not a batch return at the end..
      // in other words, this could be faster
      var win = function(xxx, results) {
        var o, r, lookup = {}
          // map from results to keys
        for (var i = 0, l = results.rows.length; i < l; i++) {
          o = JSON.parse(results.rows.item(i).value)
          o.key = results.rows.item(i).id
          lookup[o.key] = o;
        }
        r = args.map(function(key) {
          return lookup[key];
        });
        if (!that.isArray(keyOrArray)) r = r.length ? r[0] : null
        if (cb) that.lambda(cb).call(that, r)
      }
      this.db.readTransaction(function(t) {
        t.executeSql(sql, args, win, fail)
      })
      return this
    },

    exists: function(key, cb) {
      var is = "SELECT * FROM " + this.record + " WHERE id = ?",
        that = this,
        win = function(xxx, results) {
          if (cb) that.fn('exists', cb).call(that, (results.rows.length > 0))
        }
      this.db.readTransaction(function(t) {
        t.executeSql(is, [key], win, fail)
      })
      return this
    },

    all: function(callback) {
      var that = this,
        all = "SELECT * FROM " + this.record,
        r = [],
        cb = this.fn(this.name, callback) || undefined,
        win = function(xxx, results) {
          if (results.rows.length != 0) {
            for (var i = 0, l = results.rows.length; i < l; i++) {
              var obj = JSON.parse(results.rows.item(i).value)
              obj.key = results.rows.item(i).id
              r.push(obj)
            }
          }
          if (cb) cb.call(that, r)
        }

      this.db.readTransaction(function(t) {
        t.executeSql(all, [], win, fail)
      })
      return this
    },

    remove: function(keyOrArray, cb) {
      var that = this,
        args, sql = "DELETE FROM " + this.record + " WHERE id ",
        win = function() {
          if (cb) that.lambda(cb).call(that)
        }
      if (!this.isArray(keyOrArray)) {
        sql += '= ?';
        args = [keyOrArray];
      } else {
        args = keyOrArray;
        sql += "IN (" +
          args.map(function() {
          return '?'
        }).join(',') +
          ")";
      }
      args = args.map(function(obj) {
        return obj.key ? obj.key : obj;
      });

      this.db.transaction(function(t) {
        t.executeSql(sql, args, win, fail);
      });

      return this;
    },

    nuke: function(cb) {
      var nuke = "DELETE FROM " + this.record,
        that = this,
        win = cb ? function() {
        that.lambda(cb).call(that)
      } : function() {}
      this.db.transaction(function(t) {
        t.executeSql(nuke, [], win, fail)
      })
      return this
    }
  }
})());
Lawnchair.adapter('indexed-db', (function(){

  function fail(e, i) {
    if(console) { console.log('error in indexed-db adapter!' + e.message, e, i); debugger;}
  } ;

  function getIDB(){
    return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
  };



  return {

    valid: function() { return !!getIDB(); },

    init:function(options, callback) {
      this.idb = getIDB();
      this.waiting = [];
      var request = this.idb.open(this.name, 2);
      var self = this;
      var cb = self.fn(self.name, callback);
      var win = function(){ return cb.call(self, self); }
      //FEEDHENRY CHANGE TO ALLOW ERROR CALLBACK
      if(options && 'function' === typeof options.fail) fail = options.fail
      //END CHANGE
      request.onupgradeneeded = function(event){
        self.store = request.result.createObjectStore("teststore", { autoIncrement: true} );
        for (var i = 0; i < self.waiting.length; i++) {
          self.waiting[i].call(self);
        }
        self.waiting = [];
        win();
      }

      request.onsuccess = function(event) {
        self.db = request.result;


        if(self.db.version != "2.0") {
          if(typeof self.db.setVersion == 'function'){

            var setVrequest = self.db.setVersion("2.0");
            // onsuccess is the only place we can create Object Stores
            setVrequest.onsuccess = function(e) {
              self.store = self.db.createObjectStore("teststore", { autoIncrement: true} );
              for (var i = 0; i < self.waiting.length; i++) {
                self.waiting[i].call(self);
              }
              self.waiting = [];
              win();
            };
            setVrequest.onerror = function(e) {
             // console.log("Failed to create objectstore " + e);
              fail(e);
            }

          }
        } else {
          self.store = {};
          for (var i = 0; i < self.waiting.length; i++) {
            self.waiting[i].call(self);
          }
          self.waiting = [];
          win();
        }
      }
      request.onerror = fail;
    },

    save:function(obj, callback) {
      if(!this.store) {
        this.waiting.push(function() {
          this.save(obj, callback);
        });
        return;
      }

      var self = this;
      var win  = function (e) { if (callback) { obj.key = e.target.result; self.lambda(callback).call(self, obj) }};
      var accessType = "readwrite";
      var trans = this.db.transaction(["teststore"],accessType);
      var store = trans.objectStore("teststore");
      var request = obj.key ? store.put(obj, obj.key) : store.put(obj);

      request.onsuccess = win;
      request.onerror = fail;

      return this;
    },

    // FIXME this should be a batch insert / just getting the test to pass...
    batch: function (objs, cb) {

      var results = []
        ,   done = false
        ,   self = this

      var updateProgress = function(obj) {
        results.push(obj)
        done = results.length === objs.length
      }

      var checkProgress = setInterval(function() {
        if (done) {
          if (cb) self.lambda(cb).call(self, results)
          clearInterval(checkProgress)
        }
      }, 200)

      for (var i = 0, l = objs.length; i < l; i++)
        this.save(objs[i], updateProgress)

      return this
    },


    get:function(key, callback) {
      if(!this.store || !this.db) {
        this.waiting.push(function() {
          this.get(key, callback);
        });
        return;
      }


      var self = this;
      var win  = function (e) { if (callback) { self.lambda(callback).call(self, e.target.result) }};


      if (!this.isArray(key)){
        var req = this.db.transaction("teststore").objectStore("teststore").get(key);

        req.onsuccess = win;
        req.onerror = function(event) {
          //console.log("Failed to find " + key);
          fail(event);
        };

        // FIXME: again the setInterval solution to async callbacks..
      } else {

        // note: these are hosted.
        var results = []
          ,   done = false
          ,   keys = key

        var updateProgress = function(obj) {
          results.push(obj)
          done = results.length === keys.length
        }

        var checkProgress = setInterval(function() {
          if (done) {
            if (callback) self.lambda(callback).call(self, results)
            clearInterval(checkProgress)
          }
        }, 200)

        for (var i = 0, l = keys.length; i < l; i++)
          this.get(keys[i], updateProgress)

      }

      return this;
    },

    all:function(callback) {
      if(!this.store) {
        this.waiting.push(function() {
          this.all(callback);
        });
        return;
      }
      var cb = this.fn(this.name, callback) || undefined;
      var self = this;
      var objectStore = this.db.transaction("teststore").objectStore("teststore");
      var toReturn = [];
      objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          toReturn.push(cursor.value);
          cursor.continue();
        }
        else {
          if (cb) cb.call(self, toReturn);
        }
      };
      return this;
    },

    remove:function(keyOrObj, callback) {
      if(!this.store) {
        this.waiting.push(function() {
          this.remove(keyOrObj, callback);
        });
        return;
      }
      if (typeof keyOrObj == "object") {
        keyOrObj = keyOrObj.key;
      }
      var self = this;
      var win  = function () { if (callback) self.lambda(callback).call(self) };

      var request = this.db.transaction(["teststore"], "readwrite").objectStore("teststore").delete(keyOrObj);
      request.onsuccess = win;
      request.onerror = fail;
      return this;
    },

    nuke:function(callback) {
      if(!this.store) {
        this.waiting.push(function() {
          this.nuke(callback);
        });
        return;
      }

      var self = this
        ,   win  = callback ? function() { self.lambda(callback).call(self) } : function(){};

      try {
        this.db
          .transaction(["teststore"], "readwrite")
          .objectStore("teststore").clear().onsuccess = win;

      } catch(e) {
        fail();
      }
      return this;
    }

  };

})());
Lawnchair.adapter('html5-filesystem', (function(global){

  var FileError = global.FileError;

  var fail = function( e ) {
    var msg;
    var show = true;
    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        show = false;
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    };
    if ( console && show ) console.error( e, msg );
  };

  var ls = function( reader, callback, entries ) {
    var result = entries || [];
    reader.readEntries(function( results ) {
      if ( !results.length ) {
        if ( callback ) callback( result.map(function(entry) { return entry.name; }) );
      } else {
        ls( reader, callback, result.concat( Array.prototype.slice.call( results ) ) );
      }
    }, fail );
  };

  var filesystems = {};

  var root = function( store, callback ) {
    var directory = filesystems[store.name];
    if ( directory ) {
      callback( directory );
    } else {
      setTimeout(function() {
        root( store, callback );
      }, 10 );
    }
  };

  var isPhoneGap = function() {
    //http://stackoverflow.com/questions/10347539/detect-between-a-mobile-browser-or-a-phonegap-application
    //may break.
    var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    if (app) {
      return true;
    } else {
      return false;
    }
  }

  var createBlobOrString = function(contentstr) {
    var retVal;
    if (isPhoneGap()) {  // phonegap filewriter works with strings, later versions also work with binary arrays, and if passed a blob will just convert to binary array anyway
      retVal = contentstr;
    } else {
      var targetContentType = 'application/json';
      try {
        retVal = new Blob( [contentstr], { type: targetContentType });  // Blob doesn't exist on all androids
      }
      catch (e){
        // TypeError old chrome and FF
        var blobBuilder = window.BlobBuilder ||
          window.WebKitBlobBuilder ||
          window.MozBlobBuilder ||
          window.MSBlobBuilder;
        if (e.name == 'TypeError' && blobBuilder) {
          var bb = new blobBuilder();
          bb.append([contentstr.buffer]);
          retVal = bb.getBlob(targetContentType);
        } else {
          // We can't make a Blob, so just return the stringified content
          retVal = contentstr;
        }
      }
    }
    return retVal;
  }

  return {
    // boolean; true if the adapter is valid for the current environment
    valid: function() {
      var fs = global.requestFileSystem || global.webkitRequestFileSystem || global.moz_requestFileSystem;
      return !!fs;
    },

    // constructor call and callback. 'name' is the most common option
    init: function( options, callback ) {
      var me = this;
      var error = function(e) { fail(e); if ( callback ) me.fn( me.name, callback ).call( me, me ); };
      var size = options.size || 100*1024*1024;
      var name = this.name;
      //disable file backup to icloud
      me.backup = false;
      if(typeof options.backup !== 'undefined'){
        me.backup = options.backup;
      }

      function requestFileSystem(amount) {
//        console.log('in requestFileSystem');
        var fs = global.requestFileSystem || global.webkitRequestFileSystem || global.moz_requestFileSystem;
        var mode = window.PERSISTENT;
        if(typeof LocalFileSystem !== "undefined" && typeof LocalFileSystem.PERSISTENT !== "undefined"){
          mode = LocalFileSystem.PERSISTENT;
        }      
        fs(mode, amount, function(fs) {
//          console.log('got FS ', fs);
          fs.root.getDirectory( name, {create:true}, function( directory ) {
//            console.log('got DIR ', directory);
            filesystems[name] = directory;
            if ( callback ) me.fn( me.name, callback ).call( me, me );
          }, function( e ) {
//            console.log('error getting dir :: ', e);
            error(e);
          });
        }, function( e ) {
//          console.log('error getting FS :: ', e);
          error(e);
        });
      };

      // When in the browser we need to use the html5 file system rather than
      // the one cordova supplies, but it needs to request a quota first.
      if (typeof navigator.webkitPersistentStorage !== 'undefined') {
        navigator.webkitPersistentStorage.requestQuota(size, requestFileSystem, function() {
          logger.warn('User declined file storage');
          error('User declined file storage');
        });
      } else {
        // Amount is 0 because we pretty much have free reign over the
        // amount of storage we use on an android device.
        requestFileSystem(0);
      }
    },

    // returns all the keys in the store
    keys: function( callback ) {
      var me = this;
      root( this, function( store ) {
        ls( store.createReader(), function( entries ) {
          if ( callback ) me.fn( 'keys', callback ).call( me, entries );
        });
      });
      return this;
    },

    // save an object
    save: function( obj, callback ) {
      var me = this;
      var key = obj.key || this.uuid();
      obj.key = key;
      var error = function(e) { fail(e); if ( callback ) me.lambda( callback ).call( me ); };
      root( this, function( store ) {
        var writeContent = function(file, error){
          file.createWriter(function( writer ) {
            writer.onerror = error;
            writer.onwriteend = function() {
              // Clear the onWriteEnd handler so the truncate does not call it and cause an infinite loop
              this.onwriteend = null;
              // Truncate the file at the end of the written contents. This ensures that if we are updating 
              // a file which was previously longer, we will not be left with old contents beyond the end of 
              // the current buffer.
              this.truncate(this.position);
              if ( callback ) me.lambda( callback ).call( me, obj );
            };
            var contentStr = JSON.stringify(obj);

            var writerContent = createBlobOrString(contentStr);
            writer.write(writerContent);
          }, error );
        }
        store.getFile( key, {create:true}, function( file ) {
          if(typeof file.setMetadata === 'function' && (me.backup === false || me.backup === 'false')){
            //set meta data on the file to make sure it won't be backed up by icloud
            file.setMetadata(function(){
              writeContent(file, error);
            }, function(){
              writeContent(file, error);
            }, {'com.apple.MobileBackup': 1});
          } else {
            writeContent(file, error);
          }
        }, error );
      });
      return this;
    },

    // batch save array of objs
    batch: function( objs, callback ) {
      var me = this;
      var saved = [];
      for ( var i = 0, il = objs.length; i < il; i++ ) {
        me.save( objs[i], function( obj ) {
          saved.push( obj );
          if ( saved.length === il && callback ) {
            me.lambda( callback ).call( me, saved );
          }
        });
      }
      return this;
    },

    // retrieve obj (or array of objs) and apply callback to each
    get: function( key /* or array */, callback ) {
      var me = this;
      if ( this.isArray( key ) ) {
        var values = [];
        for ( var i = 0, il = key.length; i < il; i++ ) {
          me.get( key[i], function( result ) {
            if ( result ) values.push( result );
            if ( values.length === il && callback ) {
              me.lambda( callback ).call( me, values );
            }
          });
        }
      } else {
        var error = function(e) {
          fail( e );
          if ( callback ) {
            me.lambda( callback ).call( me );
          }
        };
        root( this, function( store ) {
          store.getFile( key, {create:false}, function( entry ) {
            entry.file(function( file ) {
              var reader = new FileReader();

              reader.onerror = error;

              reader.onload = function(e) {
                var res = {};
                try {
                  res = JSON.parse( e.target.result);
                  res.key = key;
                } catch (e) {
                  res = {key:key};
                }
                if ( callback ) me.lambda( callback ).call( me, res );
              };

              reader.readAsText( file );
            }, error );
          }, error );
        });
      }
      return this;
    },

    // check if an obj exists in the collection
    exists: function( key, callback ) {
      var me = this;
      root( this, function( store ) {
        store.getFile( key, {create:false}, function() {
          if ( callback ) me.lambda( callback ).call( me, true );
        }, function() {
          if ( callback ) me.lambda( callback ).call( me, false );
        });
      });
      return this;
    },

    // returns all the objs to the callback as an array
    all: function( callback ) {
      var me = this;
      if ( callback ) {
        this.keys(function( keys ) {
          if ( !keys.length ) {
            me.fn( me.name, callback ).call( me, [] );
          } else {
            me.get( keys, function( values ) {
              me.fn( me.name, callback ).call( me, values );
            });
          }
        });
      }
      return this;
    },

    // remove a doc or collection of em
    remove: function( key /* or object */, callback ) {
      var me = this;
      var error = function(e) { fail( e ); if ( callback ) me.lambda( callback ).call( me ); };
      root( this, function( store ) {
        store.getFile( (typeof key === 'string' ? key : key.key ), {create:false}, function( file ) {
          file.remove(function() {
            if ( callback ) me.lambda( callback ).call( me );
          }, error );
        }, error );
      });
      return this;
    },

    // destroy everything
    nuke: function( callback ) {
      var me = this;
      var count = 0;
      this.keys(function( keys ) {
        if ( !keys.length ) {
          if ( callback ) me.lambda( callback ).call( me );
        } else {
          for ( var i = 0, il = keys.length; i < il; i++ ) {
            me.remove( keys[i], function() {
              count++;
              if ( count === il && callback ) {
                me.lambda( callback ).call( me );
              }
            });
          }
        }
      });
      return this;
    }
  };
}(this)));
Lawnchair.adapter('memory', (function(){

    var data = {}

    return {
        valid: function() { return true },

        init: function (options, callback) {
            data[this.name] = data[this.name] || {index:[],store:{}}
            this.index = data[this.name].index
            this.store = data[this.name].store
            var cb = this.fn(this.name, callback)
            if (cb) cb.call(this, this)
            return this
        },

        keys: function (callback) {
            this.fn('keys', callback).call(this, this.index)
            return this
        },

        save: function(obj, cb) {
            var key = obj.key || this.uuid()
            
            this.exists(key, function(exists) {
                if (!exists) {
                    if (obj.key) delete obj.key
                    this.index.push(key)
                }

                this.store[key] = obj
                
                if (cb) {
                    obj.key = key
                    this.lambda(cb).call(this, obj)
                }
            })

            return this
        },

        batch: function (objs, cb) {
            var r = []
            for (var i = 0, l = objs.length; i < l; i++) {
                this.save(objs[i], function(record) {
                    r.push(record)
                })
            }
            if (cb) this.lambda(cb).call(this, r)
            return this
        },

        get: function (keyOrArray, cb) {
            var r;
            if (this.isArray(keyOrArray)) {
                r = []
                for (var i = 0, l = keyOrArray.length; i < l; i++) {
                    r.push(this.store[keyOrArray[i]])
                }
            } else {
                r = this.store[keyOrArray]
                if (r) r.key = keyOrArray
            }
            if (cb) this.lambda(cb).call(this, r)
            return this 
        },

        exists: function (key, cb) {
            this.lambda(cb).call(this, !!(this.store[key]))
            return this
        },

        all: function (cb) {
            var r = []
            for (var i = 0, l = this.index.length; i < l; i++) {
                var obj = this.store[this.index[i]]
                obj.key = this.index[i]
                r.push(obj)
            }
            this.fn(this.name, cb).call(this, r)
            return this
        },

        remove: function (keyOrArray, cb) {
            var del = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray]
            for (var i = 0, l = del.length; i < l; i++) {
                var key = del[i].key ? del[i].key : del[i]
                var where = this.indexOf(this.index, key)
                if (where < 0) continue /* key not present */
                delete this.store[key]
                this.index.splice(where, 1)
            }
            if (cb) this.lambda(cb).call(this)
            return this
        },

        nuke: function (cb) {
            this.store = data[this.name].store = {}
            this.index = data[this.name].index = []
            if (cb) this.lambda(cb).call(this)
            return this
        }
    }
/////
})());
; browserify_shim__define__module__export__(typeof Lawnchair != "undefined" ? Lawnchair : window.Lawnchair);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Basic JavaScript BN library - subset useful for RSA encryption.

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this[i++]+w[j]+c;
    c = Math.floor(v/0x4000000);
    w[j++] = v&0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this[i]&0x7fff;
    var h = this[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this[i]&0x3fff;
    var h = this[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w[j++] = l&0xfffffff;
  }
  return c;
}
if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this[0] = x;
  else if(x < -1) this[0] = x+DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this[this.t++] = x;
    else if(sh+k > this.DB) {
      this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this[this.t++] = (x>>(this.DB-sh));
    }
    else
      this[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this[i]&((1<<p)-1))<<(k-p);
        d |= this[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
  for(i = n-1; i >= 0; --i) r[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r[i-n] = this[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r[i+ds+1] = (this[i]>>cbs)|c;
    c = (this[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r[0] = this[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r[i-ds-1] |= (this[i]&bm)<<cbs;
    r[i-ds] = this[i]>>bs;
  }
  if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]-a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r[i++] = this.DV+c;
  else if(c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x[i],r,2*i,0,1);
    if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r[i+x.t] -= x.DV;
      r[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm[pm.t-1]);  // normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y); // "negative" y so we can replace sub with am later
  while(y.t < ys) y[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
    if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {  // Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);  // Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this[0];
  if((x&1) == 0) return 0;
  var y = x&3;    // y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;  // y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;  // y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff; // y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;    // y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)  // pad x so am has enough room later
    x[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

// prng4.js - uses Arcfour as a PRNG

function Arcfour() {
  this.i = 0;
  this.j = 0;
  this.S = new Array();
}

// Initialize arcfour context from key, an array of ints, each from [0..255]
function ARC4init(key) {
  var i, j, t;
  for(i = 0; i < 256; ++i)
    this.S[i] = i;
  j = 0;
  for(i = 0; i < 256; ++i) {
    j = (j + this.S[i] + key[i % key.length]) & 255;
    t = this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = t;
  }
  this.i = 0;
  this.j = 0;
}

function ARC4next() {
  var t;
  this.i = (this.i + 1) & 255;
  this.j = (this.j + this.S[this.i]) & 255;
  t = this.S[this.i];
  this.S[this.i] = this.S[this.j];
  this.S[this.j] = t;
  return this.S[(t + this.S[this.i]) & 255];
}

Arcfour.prototype.init = ARC4init;
Arcfour.prototype.next = ARC4next;

// Plug in your RNG constructor here
function prng_newstate() {
  return new Arcfour();
}

// Pool size must be a multiple of 4 and greater than 32.
// An array of bytes the size of the pool will be passed to init()
var rng_psize = 256;
// Random number generator - requires a PRNG backend, e.g. prng4.js

// For best results, put code like
// <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
// in your main HTML document.

var rng_state;
var rng_pool;
var rng_pptr;

// Mix in a 32-bit integer into the pool
function rng_seed_int(x) {
  rng_pool[rng_pptr++] ^= x & 255;
  rng_pool[rng_pptr++] ^= (x >> 8) & 255;
  rng_pool[rng_pptr++] ^= (x >> 16) & 255;
  rng_pool[rng_pptr++] ^= (x >> 24) & 255;
  if(rng_pptr >= rng_psize) rng_pptr -= rng_psize;
}

// Mix in the current time (w/milliseconds) into the pool
function rng_seed_time() {
  rng_seed_int(new Date().getTime());
}

// Initialize the pool with junk if needed.
if(rng_pool == null) {
  rng_pool = new Array();
  rng_pptr = 0;
  var t;
  if(navigator.appName == "Netscape" && navigator.appVersion < "5" && window.crypto) {
    // Extract entropy (256 bits) from NS4 RNG if available
    var z = window.crypto.random(32);
    for(t = 0; t < z.length; ++t)
      rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
  }
  while(rng_pptr < rng_psize) {  // extract some randomness from Math.random()
    t = Math.floor(65536 * Math.random());
    rng_pool[rng_pptr++] = t >>> 8;
    rng_pool[rng_pptr++] = t & 255;
  }
  rng_pptr = 0;
  rng_seed_time();
  //rng_seed_int(window.screenX);
  //rng_seed_int(window.screenY);
}

function rng_get_byte() {
  if(rng_state == null) {
    rng_seed_time();
    rng_state = prng_newstate();
    rng_state.init(rng_pool);
    for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
      rng_pool[rng_pptr] = 0;
    rng_pptr = 0;
    //rng_pool = null;
  }
  // TODO: allow reseeding after first request
  return rng_state.next();
}

function rng_get_bytes(ba) {
  var i;
  for(i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
}

function SecureRandom() {}

SecureRandom.prototype.nextBytes = rng_get_bytes;

//Depends on jsbn.js and rng.js

//Version 1.1: support utf-8 encoding in pkcs1pad2

//convert a (hex) string to a bignum object
function parseBigInt(str,r) {
  return new BigInteger(str,r);
}

function linebrk(s,n) {
  var ret = "";
  var i = 0;
  while(i + n < s.length) {
    ret += s.substring(i,i+n) + "\n";
    i += n;
  }
  return ret + s.substring(i,s.length);
}

function byte2Hex(b) {
  if(b < 0x10)
    return "0" + b.toString(16);
  else
    return b.toString(16);
}

//PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
function pkcs1pad2(s,n) {
  if(n < s.length + 11) { // TODO: fix for utf-8
    alert("Message too long for RSA");
    return null;
  }
  var ba = new Array();
  var i = s.length - 1;
  while(i >= 0 && n > 0) {
    var c = s.charCodeAt(i--);
    if(c < 128) { // encode using utf-8
      ba[--n] = c;
    }
    else if((c > 127) && (c < 2048)) {
      ba[--n] = (c & 63) | 128;
      ba[--n] = (c >> 6) | 192;
    }
    else {
      ba[--n] = (c & 63) | 128;
      ba[--n] = ((c >> 6) & 63) | 128;
      ba[--n] = (c >> 12) | 224;
    }
  }
  ba[--n] = 0;
  var rng = new SecureRandom();
  var x = new Array();
  while(n > 2) { // random non-zero pad
    x[0] = 0;
    while(x[0] == 0) rng.nextBytes(x);
    ba[--n] = x[0];
  }
  ba[--n] = 2;
  ba[--n] = 0;
  return new BigInteger(ba);
}

//"empty" RSA key constructor
function RSAKey() {
  this.n = null;
  this.e = 0;
  this.d = null;
  this.p = null;
  this.q = null;
  this.dmp1 = null;
  this.dmq1 = null;
  this.coeff = null;
}

//Set the public key fields N and e from hex strings
function RSASetPublic(N,E) {
  if(N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N,16);
    this.e = parseInt(E,16);
  }
  else
    alert("Invalid RSA public key");
}

//Perform raw public operation on "x": return x^e (mod n)
function RSADoPublic(x) {
  return x.modPowInt(this.e, this.n);
}

//Return the PKCS#1 RSA encryption of "text" as an even-length hex string
function RSAEncrypt(text) {
  var m = pkcs1pad2(text,(this.n.bitLength()+7)>>3);
  if(m == null) return null;
  var c = this.doPublic(m);
  if(c == null) return null;
  var h = c.toString(16);
  if((h.length & 1) == 0) return h; else return "0" + h;
}

//Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
//function RSAEncryptB64(text) {
//var h = this.encrypt(text);
//if(h) return hex2b64(h); else return null;
//}

//protected
RSAKey.prototype.doPublic = RSADoPublic;

//public
RSAKey.prototype.setPublic = RSASetPublic;
RSAKey.prototype.encrypt = RSAEncrypt;
//RSAKey.prototype.encrypt_b64 = RSAEncryptB64;

module.exports = {
  SecureRandom: SecureRandom,
  byte2Hex: byte2Hex,
  RSAKey: RSAKey
}
},{}],4:[function(_dereq_,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":15}],5:[function(_dereq_,module,exports){
(function (global){
/*global window, global*/
var util = _dereq_("util")
var assert = _dereq_("assert")

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = {}
}

var functions = [
    [log, "log"]
    , [info, "info"]
    , [warn, "warn"]
    , [error, "error"]
    , [time, "time"]
    , [timeEnd, "timeEnd"]
    , [trace, "trace"]
    , [dir, "dir"]
    , [assert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = Date.now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    var duration = Date.now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function assert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"assert":4,"util":15}],6:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],8:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],9:[function(_dereq_,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],11:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],12:[function(_dereq_,module,exports){
'use strict';

exports.decode = exports.parse = _dereq_('./decode');
exports.encode = exports.stringify = _dereq_('./encode');

},{"./decode":10,"./encode":11}],13:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = _dereq_('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = _dereq_('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":9,"querystring":12}],14:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],15:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":14,"FWaASH":8,"inherits":7}],16:[function(_dereq_,module,exports){
/*
 * loglevel - https://github.com/pimterry/loglevel
 *
 * Copyright (c) 2013 Tim Perry
 * Licensed under the MIT license.
 */

;(function (undefined) {
    var undefinedType = "undefined";

    (function (name, definition) {
        if (typeof module !== 'undefined') {
            module.exports = definition();
        } else if (typeof define === 'function' && typeof define.amd === 'object') {
            define(definition);
        } else {
            this[name] = definition();
        }
    }('log', function () {
        var self = {};
        var noop = function() {};

        function realMethod(methodName) {
            if (typeof console === undefinedType) {
                return noop;
            } else if (console[methodName] === undefined) {
                if (console.log !== undefined) {
                    return boundToConsole(console, 'log');
                } else {
                    return noop;
                }
            } else {
                return boundToConsole(console, methodName);
            }
        }

        function boundToConsole(console, methodName) {
            var method = console[methodName];
            if (method.bind === undefined) {
                if (Function.prototype.bind === undefined) {
                    return functionBindingWrapper(method, console);
                } else {
                    try {
                        return Function.prototype.bind.call(console[methodName], console);
                    } catch (e) {
                        // In IE8 + Modernizr, the bind shim will reject the above, so we fall back to wrapping
                        return functionBindingWrapper(method, console);
                    }
                }
            } else {
                return console[methodName].bind(console);
            }
        }

        function functionBindingWrapper(f, context) {
            return function() {
                Function.prototype.apply.apply(f, [context, arguments]);
            };
        }

        var logMethods = [
            "trace",
            "debug",
            "info",
            "warn",
            "error"
        ];

        function replaceLoggingMethods(methodFactory) {
            for (var ii = 0; ii < logMethods.length; ii++) {
                self[logMethods[ii]] = methodFactory(logMethods[ii]);
            }
        }

        function cookiesAvailable() {
            return (typeof window !== undefinedType &&
                    window.document !== undefined &&
                    window.document.cookie !== undefined);
        }

        function localStorageAvailable() {
            try {
                return (typeof window !== undefinedType &&
                        window.localStorage !== undefined);
            } catch (e) {
                return false;
            }
        }

        function persistLevelIfPossible(levelNum) {
            var localStorageFail = false,
                levelName;

            for (var key in self.levels) {
                if (self.levels.hasOwnProperty(key) && self.levels[key] === levelNum) {
                    levelName = key;
                    break;
                }
            }

            if (localStorageAvailable()) {
                /*
                 * Setting localStorage can create a DOM 22 Exception if running in Private mode
                 * in Safari, so even if it is available we need to catch any errors when trying
                 * to write to it
                 */
                try {
                    window.localStorage['loglevel'] = levelName;
                } catch (e) {
                    localStorageFail = true;
                }
            } else {
                localStorageFail = true;
            }

            if (localStorageFail && cookiesAvailable()) {
                window.document.cookie = "loglevel=" + levelName + ";";
            }
        }

        var cookieRegex = /loglevel=([^;]+)/;

        function loadPersistedLevel() {
            var storedLevel;

            if (localStorageAvailable()) {
                storedLevel = window.localStorage['loglevel'];
            }

            if (storedLevel === undefined && cookiesAvailable()) {
                var cookieMatch = cookieRegex.exec(window.document.cookie) || [];
                storedLevel = cookieMatch[1];
            }
            
            if (self.levels[storedLevel] === undefined) {
                storedLevel = "WARN";
            }

            self.setLevel(self.levels[storedLevel]);
        }

        /*
         *
         * Public API
         *
         */

        self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
            "ERROR": 4, "SILENT": 5};

        self.setLevel = function (level) {
            if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
                persistLevelIfPossible(level);

                if (level === self.levels.SILENT) {
                    replaceLoggingMethods(function () {
                        return noop;
                    });
                    return;
                } else if (typeof console === undefinedType) {
                    replaceLoggingMethods(function (methodName) {
                        return function () {
                            if (typeof console !== undefinedType) {
                                self.setLevel(level);
                                self[methodName].apply(self, arguments);
                            }
                        };
                    });
                    return "No console available for logging";
                } else {
                    replaceLoggingMethods(function (methodName) {
                        if (level <= self.levels[methodName.toUpperCase()]) {
                            return realMethod(methodName);
                        } else {
                            return noop;
                        }
                    });
                }
            } else if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
                self.setLevel(self.levels[level.toUpperCase()]);
            } else {
                throw "log.setLevel() called with invalid level: " + level;
            }
        };

        self.enableAll = function() {
            self.setLevel(self.levels.TRACE);
        };

        self.disableAll = function() {
            self.setLevel(self.levels.SILENT);
        };

        loadPersistedLevel();
        return self;
    }));
})();

},{}],17:[function(_dereq_,module,exports){
var toString = Object.prototype.toString

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function'
    case '[object Date]': return 'date'
    case '[object RegExp]': return 'regexp'
    case '[object Arguments]': return 'arguments'
    case '[object Array]': return 'array'
    case '[object String]': return 'string'
  }

  if (typeof val == 'object' && val && typeof val.length == 'number') {
    try {
      if (typeof val.callee == 'function') return 'arguments';
    } catch (ex) {
      if (ex instanceof TypeError) {
        return 'arguments';
      }
    }
  }

  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (val && val.nodeType === 1) return 'element'
  if (val === Object(val)) return 'object'

  return typeof val
}

},{}],18:[function(_dereq_,module,exports){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

},{}],19:[function(_dereq_,module,exports){
var constants = _dereq_("./modules/constants");
var events = _dereq_("./modules/events");
var logger = _dereq_("./modules/logger");
var ajax = _dereq_("./modules/ajax");
var events = _dereq_("./modules/events");
var cloud = _dereq_("./modules/waitForCloud");
var api_act = _dereq_("./modules/api_act");
var api_auth = _dereq_("./modules/api_auth");
var api_sec = _dereq_("./modules/api_sec");
var api_hash = _dereq_("./modules/api_hash");
var api_sync = _dereq_("./modules/sync-cli");
var api_mbaas = _dereq_("./modules/api_mbaas");
var api_cloud = _dereq_("./modules/api_cloud");
var api_push = _dereq_("./modules/api_push");
var fhparams = _dereq_("./modules/fhparams");
var appProps = _dereq_("./modules/appProps");
var device = _dereq_("./modules/device");

var defaultFail = function(msg, error) {
  logger.error(msg + ":" + JSON.stringify(error));
};

var addListener = function(type, listener) {
  events.addListener(type, listener);
  if (type === constants.INIT_EVENT) {
    //for fhinit event, need to check the status of cloud and may need to fire the listener immediately.
    if (cloud.isReady()) {
      listener(null, {
        host: cloud.getCloudHostUrl()
      });
    } else if (cloud.getInitError()) {
      listener(cloud.getInitError());
    }
  }
};

var once = function(type, listener) {
  if (type === constants.INIT_EVENT && cloud.isReady()) {
    listener(null, {
      host: cloud.getCloudHostUrl()
    });
  } else if (type === constants.INIT_EVENT && cloud.getInitError()) {
    listener(cloud.getInitError());
  } else {
    events.once(type, listener);
  }
};

//Legacy shim. Init hapens based on fhconfig.json or, for v2, global var called fh_app_props which is injected as part of the index.html wrapper
var init = function(opts, success, fail) {
  logger.warn("$fh.init will be deprecated soon");
  cloud.ready(function(err, host) {
    if (err) {
      if (typeof fail === "function") {
        return fail(err);
      }
    } else {
      if (typeof success === "function") {
        success(host.host);
      }
    }
  });
};

var fh = window.$fh || {};
fh.init = init;
fh.act = api_act;
fh.auth = api_auth;
fh.cloud = api_cloud;
fh.sec = api_sec;
fh.hash = api_hash;
fh.sync = api_sync;
fh.push = api_push;
fh.ajax = fh.__ajax = ajax;
fh.mbaas = api_mbaas;
fh._getDeviceId = device.getDeviceId;
fh.fh_timeout = 60000; //keep backward compatible

fh.getCloudURL = function() {
  return cloud.getCloudHostUrl();
};

fh.getFHParams = function() {
  return fhparams.buildFHParams();
};

fh.getFHHeaders = function() {
  return fhparams.getFHHeaders();
};

//events
fh.addListener = addListener;
fh.on = addListener;
fh.once = once;
var methods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners", "emit"];
for (var i = 0; i < methods.length; i++) {
  fh[methods[i]] = events[methods[i]];
}

//keep backward compatibility
fh.on(constants.INIT_EVENT, function(err, host) {
  if (err) {
    fh.cloud_props = {};
    fh.app_props = {};
  } else {
    fh.cloud_props = {
      hosts: {
        url: host.host
      }
    };
    fh.app_props = appProps.getAppProps();
  }
});

//keep backward compatibility
fh.on(constants.INTERNAL_CONFIG_LOADED_EVENT, function(err, host) {
  if (err) {
    fh.app_props = {};
  } else {
    fh.app_props = appProps.getAppProps();
  }

  // Emit config loaded event - appprops set at this point
  // V2 legacy SDK uses this to know when to fire $fh.ready (i.e. appprops is now set)
  events.emit(constants.CONFIG_LOADED_EVENT, null);
});

//for test
fh.reset = cloud.reset;
//we should really stop polluting global name space. Ideally we should ask browserify to use "$fh" when umd-fy the module. However, "$" is not allowed as the standard module name.
//So, we assign $fh to the window name space directly here. (otherwise, we have to fork the grunt browserify plugin, then fork browerify and the dependent umd module, really not worthing the effort).
window.$fh = fh;
module.exports = fh;
},{"./modules/ajax":21,"./modules/api_act":22,"./modules/api_auth":23,"./modules/api_cloud":24,"./modules/api_hash":25,"./modules/api_mbaas":26,"./modules/api_push":27,"./modules/api_sec":28,"./modules/appProps":29,"./modules/constants":31,"./modules/device":34,"./modules/events":35,"./modules/fhparams":36,"./modules/logger":42,"./modules/sync-cli":50,"./modules/waitForCloud":52}],20:[function(_dereq_,module,exports){
var urlparser = _dereq_('url');

var XDomainRequestWrapper = function(xdr){
  this.xdr = xdr;
  this.isWrapper = true;
  this.readyState = 0;
  this.onreadystatechange = null;
  this.status = 0;
  this.statusText = "";
  this.responseText = "";
  this.headers = {};
  var self = this;
  this.xdr.onload = function(){
      self.readyState = 4;
      self.status = 200;
      self.statusText = "";
      self.responseText = self.xdr.responseText;
      if(self.onreadystatechange){
          self.onreadystatechange();
      }
  };
  this.xdr.onerror = function(){
      if(self.onerror){
          self.onerror();
      }
      self.readyState = 4;
      self.status = 0;
      self.statusText = "";
      if(self.onreadystatechange){
          self.onreadystatechange();
      }
  };
  this.xdr.ontimeout = function(){
      self.readyState = 4;
      self.status = 408;
      self.statusText = "timeout";
      if(self.onreadystatechange){
          self.onreadystatechange();
      }
  };
};

XDomainRequestWrapper.prototype.open = function(method, url, asyn){
  var parsedUrl = urlparser.parse(url, true);
  parsedUrl.query = parsedUrl.query || {};
  parsedUrl.query.fh_headers = this.headers;
  this.xdr.open(method, urlparser.format(parsedUrl));
};

XDomainRequestWrapper.prototype.send = function(data){
  this.xdr.send(data);
};

XDomainRequestWrapper.prototype.abort = function(){
  this.xdr.abort();
};

XDomainRequestWrapper.prototype.setRequestHeader = function(n, v){
  //not supported by xdr
  //Good doc on limitations of XDomainRequest http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  //XDomainRequest doesn't allow setting custom request headers. But it is the only available option to do CORS requests in IE8 & 9. In IE10, they finally start to use standard XMLHttpRequest.
  //To support FH auth tokens in IE8&9, we will append them as query parameters, use the key "fh_headers"
  this.headers[n] = v;
};

XDomainRequestWrapper.prototype.getResponseHeader = function(n){
  //not supported by xdr
};

module.exports = XDomainRequestWrapper;

},{"url":13}],21:[function(_dereq_,module,exports){
//a shameless copy from https://github.com/ForbesLindesay/ajax/blob/master/index.js.
//it has the same methods and config options as jQuery/zeptojs but very light weight. see http://api.jquery.com/jQuery.ajax/
//a few small changes are made for supporting IE 8 and other features:
//1. use getXhr function to replace the default XMLHttpRequest implementation for supporting IE8
//2. Integrate with events emitter. So to subscribe ajax events, you can do $fh.on("ajaxStart", handler). See http://api.jquery.com/Ajax_Events/ for full list of events
//3. allow passing xhr factory method through options: e.g. $fh.ajax({xhr: function(){/*own implementation of xhr*/}});
//4. Use fh_timeout value as the default timeout
//5. an extra option called "tryJSONP" to allow try the same call with JSONP if normal CORS failed - should only be used internally
//6. for jsonp, allow to specify the callback query param name using the "jsonp" option

var eventsHandler = _dereq_("./events");
var XDomainRequestWrapper = _dereq_("./XDomainRequestWrapper");
var logger = _dereq_("./logger");

var type
try {
  type = _dereq_('type-of')
} catch (ex) {
  //hide from browserify
  var r = _dereq_
  type = r('type')
}

var jsonpID = 0,
  document = window.document,
  key,
  name,
  rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  scriptTypeRE = /^(?:text|application)\/javascript/i,
  xmlTypeRE = /^(?:text|application)\/xml/i,
  jsonType = 'application/json',
  htmlType = 'text/html',
  blankRE = /^\s*$/;

var ajax = module.exports = function (options) {
  var settings = extend({}, options || {})
  //keep backward compatibility
  if(window && window.$fh && typeof window.$fh.fh_timeout === "number"){
    ajax.settings.timeout = window.$fh.fh_timeout;
  }

  for (key in ajax.settings)
    if (settings[key] === undefined) settings[key] = ajax.settings[key]

  ajaxStart(settings)

  if (!settings.crossDomain) {
    settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && (RegExp.$1 != window.location.protocol || RegExp.$2 != window.location.host)
  } 

  var dataType = settings.dataType,
    hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) {
        settings.url = appendQuery(settings.url, (settings.jsonp? settings.jsonp: '_callback') + '=?');
      }
      return ajax.JSONP(settings)
    }

  if (!settings.url) settings.url = window.location.toString()
  serializeData(settings)

  var mime = settings.accepts[dataType],
    baseHeaders = {},
    protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
    xhr = settings.xhr(settings.crossDomain),
    abortTimeout = null;

  if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
  if (mime) {
    baseHeaders['Accept'] = mime
    if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
    xhr.overrideMimeType && xhr.overrideMimeType(mime)
  }
  if (settings.contentType || (settings.data && !settings.formdata && settings.type.toUpperCase() != 'GET'))
    baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
  settings.headers = extend(baseHeaders, settings.headers || {})

  if (typeof Titanium !== 'undefined') {
    xhr.onerror  = function(){
      if (!abortTimeout){
        return;
      }
      clearTimeout(abortTimeout);
      ajaxError(null, 'error', xhr, settings);
    };
  }

  xhr.onreadystatechange = function () {

    if (xhr.readyState == 4) {
      clearTimeout(abortTimeout)
      abortTimeout = undefined;
      var result, error = false
      if(settings.tryJSONP){
        //check if the request has fail. In some cases, we may want to try jsonp as well. Again, FH only...
        if(xhr.status === 0 && settings.crossDomain && !xhr.isTimeout &&  protocol != 'file:'){
          logger.debug("retry ajax call with jsonp")
          settings.type = "GET";
          settings.dataType = "jsonp";
          settings.data = "_jsonpdata=" + settings.data;
          return ajax(settings);
        }
      }
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
        dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
        result = xhr.responseText
        logger.debug("ajax response :: status = " + xhr.status + " :: body = " + result)

        try {
          if (dataType == 'script')(1, eval)(result)
          else if (dataType == 'xml') result = xhr.responseXML
          else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
        } catch (e) {
          error = e
        }

        if (error) {
          logger.debug("ajax error", error);
          ajaxError(error, 'parsererror', xhr, settings)
        }
        else ajaxSuccess(result, xhr, settings)
      } else {
        ajaxError(null, 'error', xhr, settings)
      }
    }
  }

  var async = 'async' in settings ? settings.async : true
  logger.debug("ajax call settings", settings)
  xhr.open(settings.type, settings.url, async)

  for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

  if (ajaxBeforeSend(xhr, settings) === false) {
    logger.debug("ajax call is aborted due to ajaxBeforeSend")
    xhr.abort()
    return false
  }

  if (settings.timeout > 0) abortTimeout = setTimeout(function () {
    logger.debug("ajax call timed out")
    xhr.onreadystatechange = empty
    xhr.abort()
    xhr.isTimeout = true
    ajaxError(null, 'timeout', xhr, settings)
  }, settings.timeout)

  // avoid sending empty string (#319)
  xhr.send(settings.data ? settings.data : null)
  return xhr
}


// trigger a custom event and return true
function triggerAndReturn(context, eventName, data) {
  eventsHandler.emit(eventName, data);
  return true;
}

// trigger an Ajax "global" event
function triggerGlobal(settings, context, eventName, data) {
  if (settings.global) return triggerAndReturn(context || document, eventName, data)
}

// Number of active Ajax requests
ajax.active = 0

function ajaxStart(settings) {
  if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
}

function ajaxStop(settings) {
  if (settings.global && !(--ajax.active)) triggerGlobal(settings, null, 'ajaxStop')
}

// triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
function ajaxBeforeSend(xhr, settings) {
  var context = settings.context
  if (settings.beforeSend.call(context, xhr, settings) === false)
    return false

  triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
}

function ajaxSuccess(data, xhr, settings) {
  var context = settings.context,
    status = 'success'
  settings.success.call(context, data, status, xhr)
  triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
  ajaxComplete(status, xhr, settings)
}
// type: "timeout", "error", "abort", "parsererror"
function ajaxError(error, type, xhr, settings) {
  var context = settings.context
  settings.error.call(context, xhr, type, error)
  triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
  ajaxComplete(type, xhr, settings)
}
// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
function ajaxComplete(status, xhr, settings) {
  var context = settings.context
  settings.complete.call(context, xhr, status)
  triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
  ajaxStop(settings)
}

// Empty function, used as default callback
function empty() {}

ajax.JSONP = function (options) {
  if (!('type' in options)) return ajax(options)

  var callbackName = 'jsonp' + (++jsonpID),
    script = document.createElement('script'),
    abort = function () {
      //todo: remove script
      //$(script).remove()
      if (callbackName in window) window[callbackName] = empty
      ajaxComplete('abort', xhr, options)
    },
    xhr = {
      abort: abort
    }, abortTimeout,
    head = document.getElementsByTagName("head")[0] || document.documentElement

  if (options.error) script.onerror = function () {
    xhr.abort()
    options.error()
  }

  window[callbackName] = function (data) {
    clearTimeout(abortTimeout)
    abortTimeout = undefined;
    //todo: remove script
    //$(script).remove()
    delete window[callbackName]
    ajaxSuccess(data, xhr, options)
  }

  serializeData(options)
  script.src = options.url.replace(/=\?/, '=' + callbackName)

  // Use insertBefore instead of appendChild to circumvent an IE6 bug.
  // This arises when a base node is used (see jQuery bugs #2709 and #4378).
  head.insertBefore(script, head.firstChild);

  if (options.timeout > 0) abortTimeout = setTimeout(function () {
    xhr.abort()
    ajaxComplete('timeout', xhr, options)
  }, options.timeout)

  return xhr
}

function isIE(){
  var ie = false;
  if(navigator.userAgent && navigator.userAgent.indexOf("MSIE") >=0 ){
    ie = true;
  }
  return ie;
}

function getXhr(crossDomain){
  var xhr = null;
  //always use XMLHttpRequest if available
  if(window.XMLHttpRequest){
    xhr = new XMLHttpRequest();
  }
  //for IE8 only. Need to make sure it's not used when running inside Cordova.
  if(isIE() && (crossDomain === true) && typeof window.XDomainRequest !== "undefined" && typeof window.cordova === "undefined"){
    xhr = new XDomainRequestWrapper(new XDomainRequest());
  }
  // For Titanium SDK
  if (typeof Titanium !== 'undefined'){
    var params = {};
    if(ajax.settings && ajax.settings.timeout){
      params.timeout = ajax.settings.timeout;
    }
    xhr = Titanium.Network.createHTTPClient(params);
  }

  return xhr;
}

ajax.settings = {
  // Default type of request
  type: 'GET',
  // Callback that is executed before request
  beforeSend: empty,
  // Callback that is executed if the request succeeds
  success: empty,
  // Callback that is executed the the server drops error
  error: empty,
  // Callback that is executed on request complete (both: error and success)
  complete: empty,
  // The context for the callbacks
  context: null,
  // Whether to trigger "global" Ajax events
  global: true,
  // Transport
  xhr: getXhr,
  // MIME types mapping
  accepts: {
    script: 'text/javascript, application/javascript',
    json: jsonType,
    xml: 'application/xml, text/xml',
    html: htmlType,
    text: 'text/plain'
  },
  // Whether the request is to another domain
  crossDomain: false
}

function mimeToDataType(mime) {
  return mime && (mime == htmlType ? 'html' :
    mime == jsonType ? 'json' :
    scriptTypeRE.test(mime) ? 'script' :
    xmlTypeRE.test(mime) && 'xml') || 'text'
}

function appendQuery(url, query) {
  return (url + '&' + query).replace(/[&?]{1,2}/, '?')
}

// serialize payload and append it to the URL for GET requests
function serializeData(options) {
  if (type(options.data) === 'object') {
    if(typeof options.data.append === "function"){
      //we are dealing with FormData, do not serialize
      options.formdata = true;
    } else {
      options.data = param(options.data)
    }
  }
  if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
    options.url = appendQuery(options.url, options.data)
}

ajax.get = function (url, success) {
  return ajax({
    url: url,
    success: success
  })
}

ajax.post = function (url, data, success, dataType) {
  if (type(data) === 'function') dataType = dataType || success, success = data, data = null
  return ajax({
    type: 'POST',
    url: url,
    data: data,
    success: success,
    dataType: dataType
  })
}

ajax.getJSON = function (url, success) {
  return ajax({
    url: url,
    success: success,
    dataType: 'json'
  })
}

var escape = encodeURIComponent;

function serialize(params, obj, traditional, scope) {
  var array = type(obj) === 'array';
  for (var key in obj) {
    var value = obj[key];

    if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
    // handle data in serializeArray() format
    if (!scope && array) params.add(value.name, value.value)
    // recurse into nested objects
    else if (traditional ? (type(value) === 'array') : (type(value) === 'object'))
      serialize(params, value, traditional, key)
    else params.add(key, value)
  }
}

function param(obj, traditional) {
  var params = []
  params.add = function (k, v) {
    this.push(escape(k) + '=' + escape(v))
  }
  serialize(params, obj, traditional)
  return params.join('&').replace('%20', '+')
}

function extend(target) {
  var slice = Array.prototype.slice;
  slice.call(arguments, 1).forEach(function (source) {
    for (key in source)
      if (source[key] !== undefined)
        target[key] = source[key]
  })
  return target
}

},{"./XDomainRequestWrapper":20,"./events":35,"./logger":42,"type-of":17}],22:[function(_dereq_,module,exports){
var logger =_dereq_("./logger");
var cloud = _dereq_("./waitForCloud");
var fhparams = _dereq_("./fhparams");
var ajax = _dereq_("./ajax");
var handleError = _dereq_("./handleError");
var appProps = _dereq_("./appProps");
var _ = _dereq_('underscore');

function doActCall(opts, success, fail){
  var cloud_host = cloud.getCloudHost();
  var url = cloud_host.getActUrl(opts.act);
  var params = opts.req || {};
  params = fhparams.addFHParams(params);
  var headers = fhparams.getFHHeaders();
  if (opts.headers) {
    headers = _.extend(headers, opts.headers);
  }
  return ajax({
    "url": url,
    "tryJSONP": typeof Titanium === 'undefined',
    "type": "POST",
    "dataType": "json",
    "data": JSON.stringify(params),
    "headers": headers,
    "contentType": "application/json",
    "timeout": opts.timeout || appProps.timeout,
    "success": success,
    "error": function(req, statusText, error){
      return handleError(fail, req, statusText, error);
    }
  });
}

module.exports = function(opts, success, fail){
  logger.debug("act is called");
  if(!fail){
    fail = function(msg, error){
      logger.debug(msg + ":" + JSON.stringify(error));
    };
  }

  if(!opts.act){
    return fail('act_no_action', {});
  }

  cloud.ready(function(err, cloudHost){
    logger.debug("Calling fhact now");
    if(err){
      return fail(err.message, err);
    } else {
      doActCall(opts, success, fail);
    }
  });
};
},{"./ajax":21,"./appProps":29,"./fhparams":36,"./handleError":37,"./logger":42,"./waitForCloud":52,"underscore":18}],23:[function(_dereq_,module,exports){
var logger = _dereq_("./logger");
var cloud = _dereq_("./waitForCloud");
var fhparams = _dereq_("./fhparams");
var ajax = _dereq_("./ajax");
var handleError = _dereq_("./handleError");
var device = _dereq_("./device");
var constants = _dereq_("./constants");
var checkAuth = _dereq_("./checkAuth");
var appProps = _dereq_("./appProps");
var data = _dereq_('./data');

function callAuthEndpoint(endpoint, data, opts, success, fail){
  var app_props = appProps.getAppProps();
  var path = app_props.host + constants.boxprefix + "admin/authpolicy/" + endpoint;

  if (app_props.local) {
    path = constants.boxprefix + "admin/authpolicy/" + endpoint;
  }

  ajax({
    "url": path,
    "type": "POST",
    "tryJSONP": typeof Titanium === 'undefined',
    "data": JSON.stringify(data),
    "dataType": "json",
    "contentType": "application/json",
    "timeout": opts.timeout || app_props.timeout,
    "headers": fhparams.getFHHeaders(),
    success: function(res){
      if(success){
        return success(res);
      }
    },
    error: function(req, statusText, error){
      logger.error('got error when calling ' + endpoint, req.responseText || req, error);
      if(fail){
        fail(req, statusText, error);
      }
    }
  });
}

var auth = function(opts, success, fail) {
  if (!fail) {
    fail = function(msg, error) {
      logger.debug(msg + ":" + JSON.stringify(error));
    };
  }
  if (!opts.policyId) {
    return fail('auth_no_policyId', {});
  }
  if (!opts.clientToken) {
    return fail('auth_no_clientToken', {});
  }

  cloud.ready(function(err, data) {
    if (err) {
      return fail(err.message, err);
    } else {
      var req = {};
      req.policyId = opts.policyId;
      req.clientToken = opts.clientToken;
      var cloudHost = cloud.getCloudHost();
      if(cloudHost.getEnv()){
        req.environment = cloudHost.getEnv(); 
      }
      if (opts.endRedirectUrl) {
        req.endRedirectUrl = opts.endRedirectUrl;
        if (opts.authCallback) {
          req.endRedirectUrl += (/\?/.test(req.endRedirectUrl) ? "&" : "?") + "_fhAuthCallback=" + opts.authCallback;
        }
      }
      req.params = {};
      if (opts.params) {
        req.params = opts.params;
      }
      var endurl = opts.endRedirectUrl || "status=complete";
      req.device = device.getDeviceId();
      req = fhparams.addFHParams(req);
      callAuthEndpoint('auth', req, opts, function(res){
        auth.authenticateHandler(endurl, res, success, fail);
      }, function(req, statusText, error){
        handleError(fail, req, statusText, error);
      });
    }
  });
};

auth.hasSession = function(cb){
  data.sessionManager.exists(cb);
};

auth.clearSession = function(cb){
  data.sessionManager.read(function(err, session){
    if(err){
      return cb(err);
    }
    if(session){
      //try the best to delete the remote session
      callAuthEndpoint('revokesession', session, {});
    }
    data.sessionManager.remove(cb);
    fhparams.setAuthSessionToken(undefined);
  });
};

auth.authenticateHandler = checkAuth.handleAuthResponse;

auth.verify = function(cb){
  data.sessionManager.read(function(err, session){
    if(err){
      return cb(err);
    }
    if(session){
      //try the best to delete the session in remote
      callAuthEndpoint('verifysession', session, {}, function(res){
        return cb(null, res.isValid);
      }, function(req, statusText, error){
        return cb('network_error');
      });
    } else {
      return cb('no_session');
    }
  });
};

module.exports = auth;
},{"./ajax":21,"./appProps":29,"./checkAuth":30,"./constants":31,"./data":33,"./device":34,"./fhparams":36,"./handleError":37,"./logger":42,"./waitForCloud":52}],24:[function(_dereq_,module,exports){
var logger =_dereq_("./logger");
var cloud = _dereq_("./waitForCloud");
var fhparams = _dereq_("./fhparams");
var ajax = _dereq_("./ajax");
var handleError = _dereq_("./handleError");
var appProps = _dereq_("./appProps");
var _ = _dereq_('underscore');

function doCloudCall(opts, success, fail){
  var cloud_host = cloud.getCloudHost();
  var url = cloud_host.getCloudUrl(opts.path);
  var params = opts.data || {};
  params = fhparams.addFHParams(params);
  var type = opts.method || "POST";
  var data;
  if (["POST", "PUT", "PATCH", "DELETE"].indexOf(type.toUpperCase()) !== -1) {
    data = JSON.stringify(params);
  } else {
    data = params;
  }

  var headers = fhparams.getFHHeaders();
  if (opts.headers) {
    headers = _.extend(headers, opts.headers);
  }

  return ajax({
    "url": url,
    "type": type,
    "dataType": opts.dataType || "json",
    "data": data,
    "contentType": opts.contentType || "application/json",
    "timeout": opts.timeout || appProps.timeout,
    "headers": headers,
    "success": success,
    "error": function(req, statusText, error){
      return handleError(fail, req, statusText, error);
    }
  });
}

module.exports = function(opts, success, fail){
  logger.debug("cloud is called");
  if(!fail){
    fail = function(msg, error){
      logger.debug(msg + ":" + JSON.stringify(error));
    };
  }

  cloud.ready(function(err, cloudHost){
    logger.debug("Calling fhact now");
    if(err){
      return fail(err.message, err);
    } else {
      doCloudCall(opts, success, fail);
    }
  });
};
},{"./ajax":21,"./appProps":29,"./fhparams":36,"./handleError":37,"./logger":42,"./waitForCloud":52,"underscore":18}],25:[function(_dereq_,module,exports){
var hashImpl = _dereq_("./security/hash");

module.exports = function(p, s, f){
  var params = {};
  if(typeof p.algorithm === "undefined"){
    p.algorithm = "MD5";
  }
  params.act = "hash";
  params.params = p;
  hashImpl(params, s, f);
};
},{"./security/hash":48}],26:[function(_dereq_,module,exports){
var logger =_dereq_("./logger");
var cloud = _dereq_("./waitForCloud");
var fhparams = _dereq_("./fhparams");
var ajax = _dereq_("./ajax");
var handleError = _dereq_("./handleError");
var consts = _dereq_("./constants");
var appProps = _dereq_("./appProps");

module.exports = function(opts, success, fail){
  logger.debug("mbaas is called.");
  if(!fail){
    fail = function(msg, error){
      console.debug(msg + ":" + JSON.stringify(error));
    };
  }

  var mbaas = opts.service;
  var params = opts.params;

  cloud.ready(function(err, cloudHost){
    logger.debug("Calling mbaas now");
    if(err){
      return fail(err.message, err);
    } else {
      var cloud_host = cloud.getCloudHost();
      var url = cloud_host.getMBAASUrl(mbaas);
      params = fhparams.addFHParams(params);
      return ajax({
        "url": url,
        "tryJSONP": typeof Titanium === 'undefined',
        "type": "POST",
        "dataType": "json",
        "data": JSON.stringify(params),
        "headers": fhparams.getFHHeaders(),
        "contentType": "application/json",
        "timeout": opts.timeout || appProps.timeout,
        "success": success,
        "error": function(req, statusText, error){
          return handleError(fail, req, statusText, error);
        }
      });
    }
  });
};
},{"./ajax":21,"./appProps":29,"./constants":31,"./fhparams":36,"./handleError":37,"./logger":42,"./waitForCloud":52}],27:[function(_dereq_,module,exports){
var logger = _dereq_("./logger");
var appProps = _dereq_("./appProps");
var cloud = _dereq_("./waitForCloud");

module.exports = function (onNotification, success, fail, config) {
  if (!fail) {
    fail = function (msg, error) {
      logger.debug(msg + ":" + JSON.stringify(error));
    };
  }

  cloud.ready(function(err, cloudHost){
    logger.debug("push is called");
    if(err){
      return fail(err.message, err);
    } else {
      if (window.push) {
        var props = appProps.getAppProps();
        props.pushServerURL = props.host + '/api/v2/ag-push';
        if (config) {
          for(var key in config) {
            props[key] = config[key];
          }
        }
        window.push.register(onNotification, success, fail, props);
      } else {
        fail('push plugin not installed');
      }
    }
  });
};

},{"./appProps":29,"./logger":42,"./waitForCloud":52}],28:[function(_dereq_,module,exports){
var keygen = _dereq_("./security/aes-keygen");
var aes = _dereq_("./security/aes-node");
var rsa = _dereq_("./security/rsa-node");
var hash = _dereq_("./security/hash");

module.exports = function(p, s, f){
  if (!p.act) {
    f('bad_act', {}, p);
    return;
  }
  if (!p.params) {
    f('no_params', {}, p);
    return;
  }
  if (!p.params.algorithm) {
    f('no_params_algorithm', {}, p);
    return;
  }
  p.params.algorithm = p.params.algorithm.toLowerCase();
  if(p.act === "hash"){
    return hash(p, s, f);
  } else if(p.act === "encrypt"){
    if(p.params.algorithm === "aes"){
      return aes.encrypt(p, s, f);
    } else if(p.params.algorithm === "rsa"){
      return rsa.encrypt(p, s, f);
    } else {
      return f('encrypt_bad_algorithm:' + p.params.algorithm, {}, p);
    }
  } else if(p.act === "decrypt"){
    if(p.params.algorithm === "aes"){
      return aes.decrypt(p, s, f);
    } else {
      return f('decrypt_bad_algorithm:' + p.params.algorithm, {}, p);
    }
  } else if(p.act === "keygen"){
    if(p.params.algorithm === "aes"){
      return keygen(p, s, f);
    } else {
      return f('keygen_bad_algorithm:' + p.params.algorithm, {}, p);
    }
  }
};
},{"./security/aes-keygen":46,"./security/aes-node":47,"./security/hash":48,"./security/rsa-node":49}],29:[function(_dereq_,module,exports){
var consts = _dereq_("./constants");
var ajax = _dereq_("./ajax");
var logger = _dereq_("./logger");
var qs = _dereq_("./queryMap");
var _ = _dereq_('underscore');

var app_props = null;

var load = function(cb) {
  var doc_url = document.location.href;
  var url_params = qs(doc_url.replace(/#.*?$/g, ''));
  var url_props = {};
  
  //only use fh_ prefixed params
  for(var key in url_params){
    if(url_params.hasOwnProperty(key) ){
      if(key.indexOf('fh_') === 0){
        url_props[key.substr(3)] = url_params[key]; 
      }
    }
  }
  
  //default properties
  app_props = {
    appid: "000000000000000000000000",
    appkey: "0000000000000000000000000000000000000000",
    projectid: "000000000000000000000000",
    connectiontag: "0.0.1"
  };
  
  function setProps(props){
    _.extend(app_props, props, url_props);
    
    if(typeof url_params.url !== 'undefined'){
     app_props.host = url_params.url; 
    }
    
    app_props.local = !!(url_props.host || url_params.url);
    cb(null, app_props);
  }

  var config_url = url_params.fhconfig || consts.config_js;
  ajax({
    url: config_url,
    dataType: "json",
    success: function(data) {
      logger.debug("fhconfig = " + JSON.stringify(data));
      //when load the config file on device, because file:// protocol is used, it will never call fail call back. The success callback will be called but the data value will be null.
      if (null == data) {
        //fh v2 only
        if(window.fh_app_props){
          return setProps(window.fh_app_props);
        }
        return cb(new Error("app_config_missing"));
      } else {

        setProps(data);
      }
    },
    error: function(req, statusText, error) {
      //fh v2 only
      if(window.fh_app_props){
        return setProps(window.fh_app_props);
      }
      logger.error(consts.config_js + " Not Found");
      cb(new Error("app_config_missing"));
    }
  });
};

var setAppProps = function(props) {
  app_props = props;
};

var getAppProps = function() {
  return app_props;
};

module.exports = {
  load: load,
  getAppProps: getAppProps,
  setAppProps: setAppProps
};

},{"./ajax":21,"./constants":31,"./logger":42,"./queryMap":44,"underscore":18}],30:[function(_dereq_,module,exports){
var logger = _dereq_("./logger");
var queryMap = _dereq_("./queryMap");
var fhparams = _dereq_("./fhparams");
var data = _dereq_('./data');

var checkAuth = function(url) {
  if (/\_fhAuthCallback/.test(url)) {
    var qmap = queryMap(url);
    if (qmap) {
      var fhCallback = qmap["_fhAuthCallback"];
      if (fhCallback) {
        if (qmap['result'] && qmap['result'] === 'success') {
          var sucRes = {'sessionToken': qmap['fh_auth_session'], 'authResponse' : JSON.parse(decodeURIComponent(decodeURIComponent(qmap['authResponse'])))};
          fhparams.setAuthSessionToken(qmap['fh_auth_session']);
          data.sessionManager.save(qmap['fh_auth_session']);
          window[fhCallback](null, sucRes);
        } else {
          window[fhCallback]({'message':qmap['message']});
        }
      }
    }
  }
};

var handleAuthResponse = function(endurl, res, success, fail){
  if(res.status && res.status === "ok"){

    var onComplete = function(res){
      if(res.sessionToken){
        fhparams.setAuthSessionToken(res.sessionToken);
        data.sessionManager.save(res.sessionToken, function(){
          return success(res);
        });
      } else {
        return success(res);
      }
    };
    //for OAuth, a url will be returned which means the user should be directed to that url to authenticate.
    //we try to use the ChildBrower plugin if it can be found. Otherwise send the url to the success function to allow developer to handle it.
    if(res.url){
      var inappBrowserWindow = null;
      var locationChange = function(new_url){
        if(new_url.indexOf(endurl) > -1){
          if(inappBrowserWindow){
            inappBrowserWindow.close();
          }
          var qmap = queryMap(new_url);
          if(qmap) {
            if(qmap['result'] && qmap['result'] === 'success'){
              var sucRes = {'sessionToken': qmap['fh_auth_session'], 'authResponse' : JSON.parse(decodeURIComponent(decodeURIComponent(qmap['authResponse'])))};
              onComplete(sucRes);
            } else {
              if(fail){
                fail("auth_failed", {'message':qmap['message']});
              }
            }
          } else {
            if(fail){
                fail("auth_failed", {'message':qmap['message']});
            }
          }
        }
      };
      if(window.PhoneGap || window.cordova){
        if(window.plugins && window.plugins.childBrowser){
          //found childbrowser plugin,add the event listener and load it
          //we need to know when the OAuth process is finished by checking for the presence of endurl. If the endurl is found, it means the authentication finished and we should find if it's successful.
          if(typeof window.plugins.childBrowser.showWebPage === "function"){
            window.plugins.childBrowser.onLocationChange = locationChange;
            window.plugins.childBrowser.showWebPage(res.url);
            inappBrowserWindow = window.plugins.childBrowser;
          }
        } else {
          try {
            inappBrowserWindow = window.open(res.url, "_blank", 'location=yes');
            inappBrowserWindow.addEventListener("loadstart", function(ev){
              locationChange(ev.url);
            });
          } catch(e){
            logger.info("InAppBrowser plugin is not intalled.");
            onComplete(res);
          }
        }
      } else {
       document.location.href = res.url;
      }
    } else {
      onComplete(res);
    }
  } else {
    if(fail){
      fail("auth_failed", res);
    }
  }
};

//This is mainly for using $fh.auth inside browsers. If the authentication method is OAuth, at the end of the process, the user will be re-directed to
//a url that we specified for checking if the auth is successful. So we always check the url to see if we are on the re-directed page.
if (window.addEventListener) {
  window.addEventListener('load', function(){
    checkAuth(window.location.href);
  }, false); //W3C
} else if (window.attachEvent) {
  window.attachEvent('onload', function(){
    checkAuth(window.location.href);
  }); //IE
}

module.exports = {
  "handleAuthResponse": handleAuthResponse
};

},{"./data":33,"./fhparams":36,"./logger":42,"./queryMap":44}],31:[function(_dereq_,module,exports){
module.exports = {
  "boxprefix": "/box/srv/1.1/",
  "sdk_version": "2.14.2-180",
  "config_js": "fhconfig.json",
  "INIT_EVENT": "fhinit",
  "INTERNAL_CONFIG_LOADED_EVENT": "internalfhconfigloaded",
  "CONFIG_LOADED_EVENT": "fhconfigloaded",
  "SESSION_TOKEN_STORAGE_NAME": "fh_session_token",
  "SESSION_TOKEN_KEY_NAME":"sessionToken"
};

},{}],32:[function(_dereq_,module,exports){
module.exports = {
  readCookieValue  : function (cookie_name) {
    var name_str = cookie_name + "=";
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(name_str) === 0) {
        return c.substring(name_str.length, c.length);
      }
    }
    return null;
  },

  createCookie : function (cookie_name, cookie_value) {
    var date = new Date();
    date.setTime(date.getTime() + 36500 * 24 * 60 * 60 * 1000); //100 years
    var expires = "; expires=" + date.toGMTString();
    document.cookie = cookie_name + "=" + cookie_value + expires + "; path = /";
  }
};

},{}],33:[function(_dereq_,module,exports){
var Lawnchair = _dereq_('../../libs/generated/lawnchair');
var lawnchairext = _dereq_('./lawnchair-ext');
var logger = _dereq_('./logger');
var constants = _dereq_("./constants");

var data = {
  //dom adapter doens't work on windows phone, so don't specify the adapter if the dom one failed
  //we specify the order of lawnchair adapters to use, lawnchair will find the right one to use, to keep backward compatibility, keep the order
  //as dom, webkit-sqlite, localFileStorage, window-name
  DEFAULT_ADAPTERS : ["dom", "webkit-sqlite", "window-name"],
  getStorage: function(name, adapters, fail){
    var adpts = data.DEFAULT_ADAPTERS;
    var errorHandler = fail || function(){};
    if(adapters && adapters.length > 0){
      adpts = (typeof adapters === 'string'?[adapters]: adapters);
    }
    var conf = {
      name: name,
      adapter: adpts,
      fail: function(msg, err){
        var error_message = 'read/save from/to local storage failed  msg:' + msg + ' err:' + err;
        logger.error(error_message, err);
        errorHandler(error_message, {});
      }
    };
    var store = Lawnchair(conf, function(){});
    return store;
  },
  addFileStorageAdapter: function(appProps, hashFunc){
    Lawnchair.adapter('localFileStorage', lawnchairext.fileStorageAdapter(appProps, hashFunc));
  },
  sessionManager: {
    read: function(cb){
      data.getStorage(constants.SESSION_TOKEN_STORAGE_NAME).get(constants.SESSION_TOKEN_KEY_NAME, function(session){
        if(cb){
          return cb(null, session);
        }
      });
    },
    exists: function(cb){
      data.getStorage(constants.SESSION_TOKEN_STORAGE_NAME).exists(constants.SESSION_TOKEN_KEY_NAME, function(exist){
        if(cb){
          return cb(null, exist);
        }
      });
    },
    remove: function(cb){
      data.getStorage(constants.SESSION_TOKEN_STORAGE_NAME).remove(constants.SESSION_TOKEN_KEY_NAME, function(){
        if(cb){
          return cb();
        }
      });
    },
    save: function(sessionToken, cb){
      data.getStorage(constants.SESSION_TOKEN_STORAGE_NAME).save({key: constants.SESSION_TOKEN_KEY_NAME, sessionToken: sessionToken}, function(obj){
        if(cb){
          return cb();
        }
      });
    }
  }
};

module.exports = data;
},{"../../libs/generated/lawnchair":2,"./constants":31,"./lawnchair-ext":40,"./logger":42}],34:[function(_dereq_,module,exports){
var cookies = _dereq_("./cookies");
var uuidModule = _dereq_("./uuid");
var logger = _dereq_("./logger");

module.exports = {
  //try to get the unique device identifier
  "getDeviceId": function(){
    //check for cordova/phonegap first
    if(typeof window.fhdevice !== "undefined" && typeof window.fhdevice.uuid !== "undefined"){
      return window.fhdevice.uuid;
    } else if(typeof window.device !== "undefined" && typeof window.device.uuid !== "undefined"){
      return window.device.uuid;
    }  else if(typeof navigator.device !== "undefined" && typeof navigator.device.uuid !== "undefined"){
      return navigator.device.uuid;
    } else {
      var _mock_uuid_cookie_name = "mock_uuid";
      var uuid = cookies.readCookieValue(_mock_uuid_cookie_name);
      if(null == uuid){
          uuid = uuidModule.createUUID();
          cookies.createCookie(_mock_uuid_cookie_name, uuid);
      }
      return uuid;
    }
  },

  //this is for fixing analytics issues when upgrading from io6 to ios7. Probably can be deprecated now
  "getCuidMap": function(){
    if(typeof window.fhdevice !== "undefined" && typeof window.fhdevice.cuidMap !== "undefined"){
      return window.fhdevice.cuidMap;
    } else if(typeof window.device !== "undefined" && typeof window.device.cuidMap !== "undefined"){
      return window.device.cuidMap;
    }  else if(typeof navigator.device !== "undefined" && typeof navigator.device.cuidMap !== "undefined"){
      return navigator.device.cuidMap;
    }

    return null;
  },

  "getDestination": function(){
    var destination = null;
    var platformsToTest = _dereq_("./platformsMap");


    var userAgent = navigator.userAgent;

    var dest_override = document.location.search.split("fh_destination_code=");
    if (dest_override.length > 1) {
     destination = dest_override[1];
    } else if (typeof window.fh_destination_code !== 'undefined') {
      destination = window.fh_destination_code;
    } else {
      platformsToTest.forEach(function(testDestination){
        testDestination.test.forEach(function(destinationTest){
          if(userAgent.indexOf(destinationTest) > -1){
            destination = testDestination.destination;
          }
        });
      });
    }

    if(destination == null){ //No user agents were found, set to default web
      destination = "web";
    }

    logger.debug("destination = " + destination);

    return destination;
  }
};
},{"./cookies":32,"./logger":42,"./platformsMap":43,"./uuid":51}],35:[function(_dereq_,module,exports){
var EventEmitter = _dereq_('events').EventEmitter;

var emitter = new EventEmitter();
emitter.setMaxListeners(0);

module.exports = emitter;
},{"events":6}],36:[function(_dereq_,module,exports){
var device = _dereq_("./device");
var sdkversion = _dereq_("./sdkversion");
var appProps = _dereq_("./appProps");
var logger = _dereq_("./logger");

var defaultParams = null;
var authSessionToken = null;
//TODO: review these options, we probably only needs all of them for init calls, but we shouldn't need all of them for act calls
var buildFHParams = function(){
  if(defaultParams){
    return defaultParams;
  }
  var fhparams = {};
  fhparams.cuid = device.getDeviceId();
  fhparams.cuidMap = device.getCuidMap();
  fhparams.destination = device.getDestination();
  
  if(window.device || navigator.device){
    fhparams.device = window.device || navigator.device;
  }

  //backward compatible
  if (typeof window.fh_app_version !== 'undefined'){
    fhparams.app_version = fh_app_version;
  }
  if (typeof window.fh_project_version !== 'undefined'){
    fhparams.project_version = fh_project_version;
  }
  if (typeof window.fh_project_app_version !== 'undefined'){
    fhparams.project_app_version = fh_project_app_version;
  }
  fhparams.sdk_version = sdkversion();
  if(authSessionToken){
    fhparams.sessionToken = authSessionToken;
  }

  var app_props = appProps.getAppProps();
  if(app_props){
    fhparams.appid = app_props.appid;
    fhparams.appkey = app_props.appkey;
    fhparams.projectid = app_props.projectid;
    fhparams.analyticsTag =  app_props.analyticsTag;
    fhparams.connectiontag = app_props.connectiontag;
    if(app_props.init){
      fhparams.init = typeof(app_props.init) === "string" ? JSON.parse(app_props.init) : app_props.init;
    }
  }
  
  defaultParams = fhparams;
  logger.debug("fhparams = ", defaultParams);
  return fhparams;
};

//TODO: deprecate this. Move to use headers instead
var addFHParams = function(params){
  var p = params || {};
  p.__fh = buildFHParams();
  return p;
};

var getFHHeaders = function(){
  var headers = {};
  var params = buildFHParams();
  for(var name in params){
    if(params.hasOwnProperty(name)){
      headers['X-FH-' + name] = params[name];
    }
  }
  return headers;
};

var setAuthSessionToken = function(sessionToken){
  authSessionToken = sessionToken;
  defaultParams = null;
};

module.exports = {
  "buildFHParams": buildFHParams,
  "addFHParams": addFHParams,
  "setAuthSessionToken":setAuthSessionToken,
  "getFHHeaders": getFHHeaders
};

},{"./appProps":29,"./device":34,"./logger":42,"./sdkversion":45}],37:[function(_dereq_,module,exports){
module.exports = function(fail, req, resStatus, error){
  var errraw;
  var statusCode = 0;
  if(req){
    try{
      statusCode = req.status;
      var res = JSON.parse(req.responseText);
      errraw = res.error || res.msg || res;
      if (errraw instanceof Array) {
        errraw = errraw.join('\n');
      }
    } catch(e){
      errraw = req.responseText;
    }
  }
  if(fail){
    fail(errraw, {
      status: statusCode,
      message: resStatus,
      error: error
    });
  }
};

},{}],38:[function(_dereq_,module,exports){
var constants = _dereq_("./constants");
var appProps = _dereq_("./appProps");

function removeEndSlash(input){
  var ret = input;
  if(ret.charAt(ret.length - 1) === "/"){
    ret = ret.substring(0, ret.length-1);
  }
  return ret;
}

function removeStartSlash(input){
  var ret = input;
  if(ret.length > 1 && ret.charAt(0) === "/"){
    ret = ret.substring(1, ret.length);
  }
  return ret;
}

function CloudHost(cloud_props){
  this.cloud_props = cloud_props;
  this.cloud_host = undefined;
  this.app_env = null;
  this.isLegacy = false;
}

CloudHost.prototype.getHost = function(appType){
  if(this.cloud_host){
    return this.cloud_host;
  } else {
    var url;
    var app_type;
    if(this.cloud_props && this.cloud_props.hosts){
      url = this.cloud_props.hosts.url;

      if (typeof url === 'undefined') {
        // resolve url the old way i.e. depending on
        // -burnt in app mode
        // -returned dev or live url
        // -returned dev or live type (node or fh(rhino or proxying))
        var cloud_host = this.cloud_props.hosts.releaseCloudUrl;
        app_type = this.cloud_props.hosts.releaseCloudType;

        if(typeof appType !== "undefined" && appType.indexOf("dev") > -1){
          cloud_host = this.cloud_props.hosts.debugCloudUrl;
          app_type = this.cloud_props.hosts.debugCloudType;
        }
        url = cloud_host;
      }
    }
    url = removeEndSlash(url);
    this.cloud_host = url;
    if(app_type === "fh"){
      this.isLegacy = true;
    }
    return url;
  }
};

CloudHost.prototype.getActUrl = function(act){
  var app_props = appProps.getAppProps() || {};
  if(typeof this.cloud_host === "undefined"){
    this.getHost(app_props.mode);
  }
  if(this.isLegacy){
    return this.cloud_host + constants.boxprefix + "act/" + this.cloud_props.domain + "/" + app_props.appid + "/" + act + "/" + app_props.appid;
  } else {
    return this.cloud_host + "/cloud/" + act;
  }
};

CloudHost.prototype.getMBAASUrl = function(service){
  var app_props = appProps.getAppProps() || {};
  if(typeof this.cloud_host === "undefined"){
    this.getHost(app_props.mode);
  }
  return this.cloud_host + "/mbaas/" + service;
};

CloudHost.prototype.getCloudUrl = function(path){
  var app_props = appProps.getAppProps() || {};
  if(typeof this.cloud_host === "undefined"){
    this.getHost(app_props.mode);
  }
  return this.cloud_host + "/" + removeStartSlash(path);
};

CloudHost.prototype.getEnv = function(){
  if(this.app_env){
    return this.app_env;
  } else {
    if(this.cloud_props && this.cloud_props.hosts){
      this.app_env = this.cloud_props.hosts.environment;
    }
  }
  return this.app_env;
};

module.exports = CloudHost;
},{"./appProps":29,"./constants":31}],39:[function(_dereq_,module,exports){
var loadScript = _dereq_("./loadScript");
var consts = _dereq_("./constants");
var fhparams = _dereq_("./fhparams");
var ajax = _dereq_("./ajax");
var handleError = _dereq_("./handleError");
var logger = _dereq_("./logger");
var hashFunc = _dereq_("./security/hash");
var appProps = _dereq_("./appProps");
var constants = _dereq_("./constants");
var events = _dereq_("./events");
var data = _dereq_('./data');

var init = function(cb) {
  appProps.load(function(err, data) {
    if (err) {
      return cb(err);
    }
    // Emit internal config loaded event - SDK will now set appprops
    events.emit(constants.INTERNAL_CONFIG_LOADED_EVENT, null, data);
    return loadCloudProps(data, cb);
  });
};

var loadCloudProps = function(app_props, callback) {
  if (app_props.loglevel) {
    logger.setLevel(app_props.loglevel);
  }
  // If local - shortcircuit the init - just return the host
  if (app_props.local) {
    var res = {
      "domain": "local",
      "firstTime": false,
      "hosts": {
        "debugCloudType": "node",
        "debugCloudUrl": app_props.host,
        "releaseCloudType": "node",
        "releaseCloudUrl": app_props.host,
        "type": "cloud_nodejs",
        "url": app_props.host
      },
      "init": {
        "trackId": "000000000000000000000000"
      },
      "status": "ok"
    };

    return callback(null, {
      cloud: res
    });
  }


  //now we have app props, add the fileStorageAdapter
  data.addFileStorageAdapter(app_props, hashFunc);
  var doInit = function(path, appProps, savedHost, storage) {
    var data = fhparams.buildFHParams();

    ajax({
      "url": path,
      "type": "POST",
      "tryJSONP": typeof Titanium === 'undefined',
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify(data),
      "timeout": appProps.timeout,
      "success": function(initRes) {
        if (storage) {
          storage.save({
            key: "fh_init",
            value: initRes
          }, function() {});
        }
        if (callback) {
          callback(null, {
            cloud: initRes
          });
        }
      },
      "error": function(req, statusText, error) {
        var errormsg = "unknown";
        if (req) {
          errormsg = req.status + " - " + req.responseText;
        }
        logger.error("App init returned error : " + errormsg);
        //use the cached host if we have a copy
        if (savedHost) {
          logger.info("Using cached host: " + JSON.stringify(savedHost));
          if (callback) {
            callback(null, {
              cloud: savedHost
            });
          }
        } else {
          logger.error("No cached host found. Init failed.");
          handleError(function(msg, err) {
            if (callback) {
              callback({
                error: err,
                message: msg
              });
            }
          }, req, statusText, error);
        }
      }
    });
  };

  var storage = null;
  var path = app_props.host + consts.boxprefix + "app/init";
  try {
    storage = data.getStorage("fh_init_storage", typeof Titanium !== "undefined"?['titanium']:null);
    storage.get('fh_init', function(storage_res) {
      var savedHost = null;
      if (storage_res && storage_res.value !== null && typeof(storage_res.value) !== "undefined" && storage_res !== "") {
        storage_res = typeof(storage_res) === "string" ? JSON.parse(storage_res) : storage_res;
        storage_res.value = typeof(storage_res.value) === "string" ? JSON.parse(storage_res.value) : storage_res.value;
        if (storage_res.value.init) {
          app_props.init = storage_res.value.init;
        } else {
          //keep it backward compatible.
          app_props.init = typeof(storage_res.value) === "string" ? JSON.parse(storage_res.value) : storage_res.value;
        }
        if (storage_res.value.hosts) {
          savedHost = storage_res.value;
        }
      }

      doInit(path, app_props, savedHost, storage);
    });
  } catch (e) {
    //for whatever reason (e.g. localStorage is disabled) Lawnchair is failed to init, just do the init
    doInit(path, app_props, null, null);
  }
};

module.exports = {
  "init": init,
  "loadCloudProps": loadCloudProps
};

},{"./ajax":21,"./appProps":29,"./constants":31,"./data":33,"./events":35,"./fhparams":36,"./handleError":37,"./loadScript":41,"./logger":42,"./security/hash":48}],40:[function(_dereq_,module,exports){
var fileStorageAdapter = function (app_props, hashFunc) {
  // private methods

  function doLog(mess){
    if(console){
      console.log(mess);
    }
  }

  var fail = function (e, i) {
    if(console) {
      console.log('error in file system adapter !', e, i);
    } else {
      throw e;
    }
  };


  function filenameForKey(key, cb) {
    key = app_props.appid + key;

    hashFunc({
      algorithm: "MD5",
      text: key
    }, function(result) {
      var filename = result.hashvalue + '.txt';
      if (typeof navigator.externalstorage !== "undefined") {
        navigator.externalstorage.enable(function handleSuccess(res){
          var path = filename;
          if(res.path ) {
            path = res.path;
            if(!path.match(/\/$/)) {
              path += '/';
            }
            path += filename;
          }
          filename = path;
          return cb(filename);
        },function handleError(err){
          return cb(filename);
        });
      } else {
        doLog('filenameForKey key=' + key+ ' , Filename: ' + filename);
        return cb(filename);
      }
    });
  }

  return {

    valid: function () { return !!(window.requestFileSystem); },

    init : function (options, callback){
      //calls the parent function fn and applies this scope
      if(options && 'function' === typeof options.fail ) {
        fail = options.fail;
      }
      if (callback) {
        this.fn(this.name, callback).call(this, this);
      }
    },

    keys: function (callback){
      throw "Currently not supported";
    },

    save : function (obj, callback){
      var key = obj.key;
      var value = obj.val||obj.value;
      filenameForKey(key, function(hash) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFS(fileSystem) {

          fileSystem.root.getFile(hash, {
            create: true
          }, function gotFileEntry(fileEntry) {
            fileEntry.createWriter(function gotFileWriter(writer) {
              writer.onwrite = function() {
                return callback({
                  key: key,
                  val: value
                });
              };
              writer.write(value);
            }, function() {
              fail('[save] Failed to create file writer');
            });
          }, function() {
            fail('[save] Failed to getFile');
          });
        }, function() {
          fail('[save] Failed to requestFileSystem');
        });
      });
    },

    batch : function (records, callback){
      throw "Currently not supported";
    },

    get : function (key, callback){
      filenameForKey(key, function(hash) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFS(fileSystem) {
          fileSystem.root.getFile(hash, {}, function gotFileEntry(fileEntry) {
            fileEntry.file(function gotFile(file) {
              var reader = new FileReader();
              reader.onloadend = function (evt) {
                var text = evt.target.result;
                // Check for URLencoded
                // PG 2.2 bug in readAsText()
                try {
                  text = decodeURIComponent(text);
                } catch (e) {
                  // Swallow exception if not URLencoded
                  // Just use the result
                }
                return callback({
                  key: key,
                  val: text
                });
              };
              reader.readAsText(file);
            }, function() {
              fail('[load] Failed to getFile');
            });
          }, function() {
            // Success callback on key load failure
            callback({
              key: key,
              val: null
            });
          });
        }, function() {
          fail('[load] Failed to get fileSystem');
        });
      });
    },

    exists : function (key, callback){
      filenameForKey(key,function (hash){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFS(fileSystem) {
          fileSystem.root.getFile(hash, {},
            function gotFileEntry(fileEntry) {
              return callback(true);
            }, function (err){
              return callback(false);
            });
        });
      });
    },

    all : function (callback){
      throw "Currently not supported";
    },

    remove : function (key, callback){
      filenameForKey(key, function(hash) {

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFS(fileSystem) {
          fileSystem.root.getFile(hash, {}, function gotFileEntry(fileEntry) {

            fileEntry.remove(function() {
              return callback({
                key: key,
                val: null
              });
            }, function() {
              fail('[remove] Failed to remove file');
            });
          }, function() {
            fail('[remove] Failed to getFile');
          });
        }, function() {
          fail('[remove] Failed to get fileSystem');
        });
      });
    },

    nuke : function (callback){
      throw "Currently not supported";
    }


  };
};

module.exports = {
  fileStorageAdapter: fileStorageAdapter
};
},{}],41:[function(_dereq_,module,exports){
module.exports = function (url, callback) {
  var script;
  var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
  script = document.createElement("script");
  script.async = "async";
  script.src = url;
  script.type = "text/javascript";
  script.onload = script.onreadystatechange = function () {
    if (!script.readyState || /loaded|complete/.test(script.readyState)) {
      script.onload = script.onreadystatechange = null;
      if (head && script.parentNode) {
        head.removeChild(script);
      }
      script = undefined;
      if (callback && typeof callback === "function") {
        callback();
      }
    }
  };
  head.insertBefore(script, head.firstChild);
};

},{}],42:[function(_dereq_,module,exports){
var console = _dereq_('console');
var log = _dereq_('loglevel');

log.setLevel('info');

/**
 * APIs:
 * see https://github.com/pimterry/loglevel.
 * In short, you can use:
 * log.setLevel(loglevel) - default to info
 * log.enableAll() - enable all log messages
 * log.disableAll() - disable all log messages
 *
 * log.trace(msg)
 * log.debug(msg)
 * log.info(msg)
 * log.warn(msg)
 * log.error(msg)
 *
 * Available levels: { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4, "SILENT": 5}
 * Use either string or integer value
 */
module.exports = log;
},{"console":5,"loglevel":16}],43:[function(_dereq_,module,exports){
module.exports = [
  {
    "destination" :"ipad",
    "test": ["iPad"]
  },
  {
    "destination" :"iphone",
    "test": ["iPhone"]
  },
  {
    "destination" :"android",
    "test": ["Android"]
  },
  {
    "destination" :"blackberry",
    "test": ["BlackBerry", "BB10", "RIM Tablet OS"]//Blackberry 10 does not contain "Blackberry"
  },
  {
    "destination" :"windowsphone",
    "test": ["Windows Phone 8"]
  },
  {
    "destination" :"windowsphone7",
    "test": ["Windows Phone OS 7"]
  }
];

},{}],44:[function(_dereq_,module,exports){
module.exports = function(url) {
  var qmap = {};
  var i = url.split("?");
  if (i.length === 2) {
    var queryString = i[1];
    var pairs = queryString.split("&");
    qmap = {};
    for (var p = 0; p < pairs.length; p++) {
      var q = pairs[p];
      var qp = q.split("=");
      qmap[qp[0]] = qp[1];
    }
  }
  return qmap;
};
},{}],45:[function(_dereq_,module,exports){
var constants = _dereq_("./constants");

module.exports = function() {
  var type = "FH_JS_SDK";
  if (typeof window.fh_destination_code !== 'undefined') {
    type = "FH_HYBRID_SDK";
  } else if(window.PhoneGap || window.cordova) {
    type = "FH_PHONEGAP_SDK";
  }
  return type + "/" + constants.sdk_version;
};

},{"./constants":31}],46:[function(_dereq_,module,exports){
var rsa = _dereq_("../../../libs/rsa");
var SecureRandom = rsa.SecureRandom;
var byte2Hex = rsa.byte2Hex;

var generateRandomKey = function(keysize){
  var r = new SecureRandom();
  var key = new Array(keysize);
  r.nextBytes(key);
  var result = "";
  for(var i=0;i<key.length;i++){
    result += byte2Hex(key[i]);
  }
  return result;
};

var aes_keygen = function(p, s, f){
  if (!p.params.keysize) {
    f('no_params_keysize', {}, p);
    return;
  }
  if (p.params.algorithm.toLowerCase() !== "aes") {
    f('keygen_bad_algorithm', {}, p);
    return;
  }
  var keysize = parseInt(p.params.keysize, 10);
  //keysize is in bit, need to convert to bytes to generate random key
  //but the legacy code has a bug, it doesn't do the convert, so if the keysize is less than 100, don't convert
  if(keysize > 100){
    keysize = keysize/8;
  }
  if(typeof SecureRandom === "undefined"){
    return f("security library is not loaded.");
  }
  return s({
    'algorithm': 'AES',
    'secretkey': generateRandomKey(keysize),
    'iv': generateRandomKey(keysize)
  });
};

module.exports = aes_keygen;
},{"../../../libs/rsa":3}],47:[function(_dereq_,module,exports){
var CryptoJS = _dereq_("../../../libs/generated/crypto");

var encrypt = function(p, s, f){
  var fields = ['key', 'plaintext', 'iv'];
  if(p.params.algorithm.toLowerCase() !== "aes"){
    return f('encrypt_bad_algorithm', {}, p);
  }
  for (var i = 0; i < fields; i++) {
    var field = fields[i];
    if (!p.params[field]) {
      return f('no_params_' + field, {}, p);
    }
  }
  var encrypted = CryptoJS.AES.encrypt(p.params.plaintext, CryptoJS.enc.Hex.parse(p.params.key), {iv: CryptoJS.enc.Hex.parse(p.params.iv)});
  cipher_text = CryptoJS.enc.Hex.stringify(encrypted.ciphertext);
  return s({ciphertext: cipher_text});
};

var decrypt = function(p, s, f){
  var fields = ['key', 'ciphertext', 'iv'];
  if(p.params.algorithm.toLowerCase() !== "aes"){
    return f('decrypt_bad_algorithm', {}, p);
  }
  for (var i = 0; i < fields; i++) {
    var field = fields[i];
    if (!p.params[field]) {
      return f('no_params_' + field, {}, p);
    }
  }
  var data = CryptoJS.enc.Hex.parse(p.params.ciphertext);
  var encodeData = CryptoJS.enc.Base64.stringify(data);
  var decrypted = CryptoJS.AES.decrypt(encodeData, CryptoJS.enc.Hex.parse(p.params.key), {iv: CryptoJS.enc.Hex.parse(p.params.iv)});
  
  try {
    return s({plaintext:decrypted.toString(CryptoJS.enc.Utf8)});
  } catch (e) {
    return f(e);
  }
};

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
};

},{"../../../libs/generated/crypto":1}],48:[function(_dereq_,module,exports){
var CryptoJS = _dereq_("../../../libs/generated/crypto");


var hash = function(p, s, f){
  if (!p.params.text) {
    f('hash_no_text', {}, p);
    return;
  }
  var hashValue;
  if (p.params.algorithm.toLowerCase() === "md5") {
    hashValue = CryptoJS.MD5(p.params.text).toString(CryptoJS.enc.Hex);
  } else if(p.params.algorithm.toLowerCase() === "sha1"){
    hashValue = CryptoJS.SHA1(p.params.text).toString(CryptoJS.enc.Hex);
  } else if(p.params.algorithm.toLowerCase() === "sha256"){
    hashValue = CryptoJS.SHA256(p.params.text).toString(CryptoJS.enc.Hex);
  } else if(p.params.algorithm.toLowerCase() === "sha512"){
    hashValue = CryptoJS.SHA512(p.params.text).toString(CryptoJS.enc.Hex);
  } else {
    return f("hash_unsupported_algorithm: " + p.params.algorithm);
  }
  return s({"hashvalue": hashValue});
};

module.exports = hash;
},{"../../../libs/generated/crypto":1}],49:[function(_dereq_,module,exports){
var rsa = _dereq_("../../../libs/rsa");
var RSAKey = rsa.RSAKey;

var encrypt = function(p, s, f){
  var fields = ['modulu', 'plaintext'];
  if(p.params.algorithm.toLowerCase() !== "rsa"){
    return f('encrypt_bad_algorithm', {}, p);
  }
  for (var i = 0; i < fields; i++) {
    var field = fields[i];
    if (!p.params[field]) {
      return f('no_params_' + field, {}, p);
    }
  }
  var key = new RSAKey();
  key.setPublic(p.params.modulu, "10001");
  var ori_text = p.params.plaintext;
  cipher_text = key.encrypt(ori_text);
  return s({ciphertext:cipher_text});
};

module.exports = {
  encrypt: encrypt
};
},{"../../../libs/rsa":3}],50:[function(_dereq_,module,exports){
var actAPI = _dereq_("./api_act");
var cloudAPI = _dereq_("./api_cloud");
var CryptoJS = _dereq_("../../libs/generated/crypto");
var Lawnchair = _dereq_('../../libs/generated/lawnchair');

var self = {

  // CONFIG
  defaults: {
    "sync_frequency": 10,
    // How often to synchronise data with the cloud in seconds.
    "auto_sync_local_updates": true,
    // Should local chages be syned to the cloud immediately, or should they wait for the next sync interval
    "notify_client_storage_failed": true,
    // Should a notification event be triggered when loading/saving to client storage fails
    "notify_sync_started": true,
    // Should a notification event be triggered when a sync cycle with the server has been started
    "notify_sync_complete": true,
    // Should a notification event be triggered when a sync cycle with the server has been completed
    "notify_offline_update": true,
    // Should a notification event be triggered when an attempt was made to update a record while offline
    "notify_collision_detected": true,
    // Should a notification event be triggered when an update failed due to data collision
    "notify_remote_update_failed": true,
    // Should a notification event be triggered when an update failed for a reason other than data collision
    "notify_local_update_applied": true,
    // Should a notification event be triggered when an update was applied to the local data store
    "notify_remote_update_applied": true,
    // Should a notification event be triggered when an update was applied to the remote data store
    "notify_delta_received": true,
    // Should a notification event be triggered when a delta was received from the remote data store for the dataset 
    "notify_record_delta_received": true,
    // Should a notification event be triggered when a delta was received from the remote data store for a record
    "notify_sync_failed": true,
    // Should a notification event be triggered when the sync loop failed to complete
    "do_console_log": false,
    // Should log statements be written to console.log
    "crashed_count_wait" : 10,
    // How many syncs should we check for updates on crashed in flight updates before we give up searching
    "resend_crashed_updates" : true,
    // If we have reached the crashed_count_wait limit, should we re-try sending the crashed in flight pending record
    "sync_active" : true,
    // Is the background sync with the cloud currently active
    "storage_strategy" : "html5-filesystem",
    // Storage strategy to use for Lawnchair - supported strategies are 'html5-filesystem' and 'dom'
    "file_system_quota" : 50 * 1024 * 1204,
    // Amount of space to request from the HTML5 filesystem API when running in browser
    "has_custom_sync" : null,
    //If the app has custom cloud sync function, it should be set to true. If set to false, the default mbaas sync implementation will be used. When set to null or undefined, 
    //a check will be performed to determine which implementation to use
    "icloud_backup" : false //ios only. If set to true, the file will be backed by icloud
  },

  notifications: {
    "CLIENT_STORAGE_FAILED": "client_storage_failed",
    // loading/saving to client storage failed
    "SYNC_STARTED": "sync_started",
    // A sync cycle with the server has been started
    "SYNC_COMPLETE": "sync_complete",
    // A sync cycle with the server has been completed
    "OFFLINE_UPDATE": "offline_update",
    // An attempt was made to update a record while offline
    "COLLISION_DETECTED": "collision_detected",
    //Update Failed due to data collision
    "REMOTE_UPDATE_FAILED": "remote_update_failed",
    // Update Failed for a reason other than data collision
    "REMOTE_UPDATE_APPLIED": "remote_update_applied",
    // An update was applied to the remote data store
    "LOCAL_UPDATE_APPLIED": "local_update_applied",
    // An update was applied to the local data store
    "DELTA_RECEIVED": "delta_received",
    // A delta was received from the remote data store for the dataset 
    "RECORD_DELTA_RECEIVED": "record_delta_received",
    // A delta was received from the remote data store for the record 
    "SYNC_FAILED": "sync_failed"
    // Sync loop failed to complete
  },

  datasets: {},

  // Initialise config to default values;
  config: undefined,

  //TODO: deprecate this
  notify_callback: undefined,

  notify_callback_map : {},

  init_is_called: false,

  //this is used to map the temp data uid (created on client) to the real uid (created in the cloud)
  uid_map: {},

  // PUBLIC FUNCTION IMPLEMENTATIONS
  init: function(options) {
    self.consoleLog('sync - init called');

    self.config = JSON.parse(JSON.stringify(self.defaults));
    for (var i in options) {
      self.config[i] = options[i];
    }

    //prevent multiple monitors from created if init is called multiple times
    if(!self.init_is_called){
      self.init_is_called = true;
      self.datasetMonitor();
    }
  },

  notify: function(datasetId, callback) {
    if(arguments.length === 1 && typeof datasetId === 'function'){
      self.notify_callback = datasetId;
    } else {
      self.notify_callback_map[datasetId] = callback;
    }
  },

  manage: function(dataset_id, opts, query_params, meta_data, cb) {
    self.consoleLog('manage - START');

    var options = opts || {};

    var doManage = function(dataset) {
      self.consoleLog('doManage dataset :: initialised = ' + dataset.initialised + " :: " + dataset_id + ' :: ' + JSON.stringify(options));

      var datasetConfig = self.setOptions(options);

      dataset.query_params = query_params || dataset.query_params || {};
      dataset.meta_data = meta_data || dataset.meta_data || {};
      dataset.config = datasetConfig;
      dataset.syncRunning = false;
      dataset.syncPending = true;
      dataset.initialised = true;
      if(typeof dataset.meta === "undefined"){
        dataset.meta = {};
      }

      self.saveDataSet(dataset_id, function() {

        if( cb ) {
          cb();
        }
      });
    };

    // Check if the dataset is already loaded
    self.getDataSet(dataset_id, function(dataset) {
      self.consoleLog('manage - dataset already loaded');
      doManage(dataset);
    }, function(err) {
      self.consoleLog('manage - dataset not loaded... trying to load');

      // Not already loaded, try to load from local storage
      self.loadDataSet(dataset_id, function(dataset) {
          self.consoleLog('manage - dataset loaded from local storage');

          // Loading from local storage worked

          // Fire the local update event to indicate that dataset was loaded from local storage
          self.doNotify(dataset_id, null, self.notifications.LOCAL_UPDATE_APPLIED, "load");

          // Put the dataet under the management of the sync service
          doManage(dataset);
        },
        function(err) {
          // No dataset in memory or local storage - create a new one and put it in memory
          self.consoleLog('manage - Creating new dataset for id ' + dataset_id);
          var dataset = {};
          dataset.data = {};
          dataset.pending = {};
          dataset.meta = {};
          self.datasets[dataset_id] = dataset;
          doManage(dataset);
        });
    });
  },

  setOptions: function(options) {
    // Make sure config is initialised
    if( ! self.config ) {
      self.config = JSON.parse(JSON.stringify(self.defaults));
    }

    var datasetConfig = JSON.parse(JSON.stringify(self.config));
    var optionsIn = JSON.parse(JSON.stringify(options));
    for (var k in optionsIn) {
      datasetConfig[k] = optionsIn[k];
    }

    return datasetConfig;
  },

  list: function(dataset_id, success, failure) {
    self.getDataSet(dataset_id, function(dataset) {
      if (dataset && dataset.data) {
        // Return a copy of the dataset so updates will not automatically make it back into the dataset
        var res = JSON.parse(JSON.stringify(dataset.data));
        success(res);
      } else {
        if(failure) {
          failure('no_data');
        }
      }
    }, function(code, msg) {
      if(failure) {
        failure(code, msg);
      }
    });
  },

  getUID: function(oldOrNewUid){
    var uid = self.uid_map[oldOrNewUid];
    if(uid){
      return uid;
    } else {
      return oldOrNewUid;
    }
  },

  create: function(dataset_id, data, success, failure) {
    if(data == null){
      if(failure){
        return failure("null_data");
      }
    }
    self.addPendingObj(dataset_id, null, data, "create", success, failure);
  },

  read: function(dataset_id, uid, success, failure) {
    self.getDataSet(dataset_id, function(dataset) {
      uid = self.getUID(uid);
      var rec = dataset.data[uid];
      if (!rec) {
        failure("unknown_uid");
      } else {
        // Return a copy of the record so updates will not automatically make it back into the dataset
        var res = JSON.parse(JSON.stringify(rec));
        success(res);
      }
    }, function(code, msg) {
      if(failure) {
        failure(code, msg);
      }
    });
  },

  update: function(dataset_id, uid, data, success, failure) {
    uid = self.getUID(uid);
    self.addPendingObj(dataset_id, uid, data, "update", success, failure);
  },

  'delete': function(dataset_id, uid, success, failure) {
    uid = self.getUID(uid);
    self.addPendingObj(dataset_id, uid, null, "delete", success, failure);
  },

  getPending: function(dataset_id, cb) {
    self.getDataSet(dataset_id, function(dataset) {
      var res;
      if( dataset ) {
        res = dataset.pending;
      }
      cb(res);
    }, function(err, datatset_id) {
        self.consoleLog(err);
    });
  },

  clearPending: function(dataset_id, cb) {
    self.getDataSet(dataset_id, function(dataset) {
      dataset.pending = {};
      self.saveDataSet(dataset_id, cb);
    });
  },

  listCollisions : function(dataset_id, success, failure){
    self.getDataSet(dataset_id, function(dataset) {
      self.doCloudCall({
        "dataset_id": dataset_id,
        "req": {
          "fn": "listCollisions",
          "meta_data" : dataset.meta_data
        }
      }, success, failure);
    }, failure);
  },

  removeCollision: function(dataset_id, colissionHash, success, failure) {
    self.getDataSet(dataset_id, function(dataset) {
      self.doCloudCall({
        "dataset_id" : dataset_id,
        "req": {
          "fn": "removeCollision",
          "hash": colissionHash,
          meta_data: dataset.meta_data
        }
      }, success, failure);
    });
  },


  // PRIVATE FUNCTIONS
  isOnline: function(callback) {
    var online = true;

    // first, check if navigator.online is available
    if(typeof navigator.onLine !== "undefined"){
      online = navigator.onLine;
    }

    // second, check if Phonegap is available and has online info
    if(online){
      //use phonegap to determin if the network is available
      if(typeof navigator.network !== "undefined" && typeof navigator.network.connection !== "undefined"){
        var networkType = navigator.network.connection.type;
        if(networkType === "none" || networkType === null) {
          online = false;
        }
      }
    }

    return callback(online);
  },

  doNotify: function(dataset_id, uid, code, message) {

    if( self.notify_callback || self.notify_callback_map[dataset_id]) {
      var notifyFunc = self.notify_callback_map[dataset_id] || self.notify_callback;
      if ( self.config['notify_' + code] ) {
        var notification = {
          "dataset_id" : dataset_id,
          "uid" : uid,
          "code" : code,
          "message" : message
        };
        // make sure user doesn't block
        setTimeout(function () {
          notifyFunc(notification);
        }, 0);
      }
    }
  },

  getDataSet: function(dataset_id, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      success(dataset);
    } else {
      if(failure){
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  getQueryParams: function(dataset_id, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      success(dataset.query_params);
    } else {
      if(failure){
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  setQueryParams: function(dataset_id, queryParams, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      dataset.query_params = queryParams;
      self.saveDataSet(dataset_id);
      if( success ) {
        success(dataset.query_params);
      }
    } else {
      if ( failure ) {
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  getMetaData: function(dataset_id, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      success(dataset.meta_data);
    } else {
      if(failure){
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  setMetaData: function(dataset_id, metaData, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      dataset.meta_data = metaData;
      self.saveDataSet(dataset_id);
      if( success ) {
        success(dataset.meta_data);
      }
    } else {
      if( failure ) {
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  getConfig: function(dataset_id, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      success(dataset.config);
    } else {
      if(failure){
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  setConfig: function(dataset_id, config, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      var fullConfig = self.setOptions(config);
      dataset.config = fullConfig;
      self.saveDataSet(dataset_id);
      if( success ) {
        success(dataset.config);
      }
    } else {
      if( failure ) {
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  stopSync: function(dataset_id, success, failure) {
    self.setConfig(dataset_id, {"sync_active" : false}, function() {
      if( success ) {
        success();
      }
    }, failure);
  },

  startSync: function(dataset_id, success, failure) {
    self.setConfig(dataset_id, {"sync_active" : true}, function() {
      if( success ) {
        success();
      }
    }, failure);
  },

  doSync: function(dataset_id, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      dataset.syncPending = true;
      self.saveDataSet(dataset_id);
      if( success ) {
        success();
      }
    } else {
      if( failure ) {
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  forceSync: function(dataset_id, success, failure) {
    var dataset = self.datasets[dataset_id];

    if (dataset) {
      dataset.syncForced = true;
      self.saveDataSet(dataset_id);
      if( success ) {
        success();
      }
    } else {
      if( failure ) {
        failure('unknown_dataset ' + dataset_id, dataset_id);
      }
    }
  },

  sortObject : function(object) {
    if (typeof object !== "object" || object === null) {
      return object;
    }

    var result = [];

    Object.keys(object).sort().forEach(function(key) {
      result.push({
        key: key,
        value: self.sortObject(object[key])
      });
    });

    return result;
  },

  sortedStringify : function(obj) {

    var str = '';

    try {
      str = JSON.stringify(self.sortObject(obj));
    } catch (e) {
      console.error('Error stringifying sorted object:' + e);
    }

    return str;
  },

  generateHash: function(object) {
    var hash = CryptoJS.SHA1(self.sortedStringify(object));
    return hash.toString();
  },

  addPendingObj: function(dataset_id, uid, data, action, success, failure) {
    self.isOnline(function (online) {
      if (!online) {
        self.doNotify(dataset_id, uid, self.notifications.OFFLINE_UPDATE, action);
      }
    });

    function storePendingObject(obj) {
      obj.hash = obj.hash || self.generateHash(obj);

      self.getDataSet(dataset_id, function(dataset) {

        dataset.pending[obj.hash] = obj;

        self.updateDatasetFromLocal(dataset, obj);

        if(self.config.auto_sync_local_updates) {
          dataset.syncPending = true;
        }
        self.saveDataSet(dataset_id);
        self.doNotify(dataset_id, uid, self.notifications.LOCAL_UPDATE_APPLIED, action);

        success(obj);
      }, function(code, msg) {
        if(failure) {
          failure(code, msg);
        }
      });
    }

    var pendingObj = {};
    pendingObj.inFlight = false;
    pendingObj.action = action;
    pendingObj.post = JSON.parse(JSON.stringify(data));
    pendingObj.postHash = self.generateHash(pendingObj.post);
    pendingObj.timestamp = new Date().getTime();
    if( "create" === action ) {
      //this hash value will be returned later on when the cloud returns updates. We can then link the old uid
      //with new uid
      pendingObj.hash = self.generateHash(pendingObj);
      pendingObj.uid = pendingObj.hash;
      storePendingObject(pendingObj);
    } else {
      self.read(dataset_id, uid, function(rec) {
        pendingObj.uid = uid;
        pendingObj.pre = rec.data;
        pendingObj.preHash = self.generateHash(rec.data);
        storePendingObject(pendingObj);
      }, function(code, msg) {
        if(failure){
          failure(code, msg);
        }
      });
    }
  },

  syncLoop: function(dataset_id) {
    self.getDataSet(dataset_id, function(dataSet) {
    
      // The sync loop is currently active
      dataSet.syncPending = false;
      dataSet.syncRunning = true;
      dataSet.syncLoopStart = new Date().getTime();
      self.doNotify(dataset_id, null, self.notifications.SYNC_STARTED, null);

      self.isOnline(function(online) {
        if (!online) {
          self.syncComplete(dataset_id, "offline", self.notifications.SYNC_FAILED);
        } else {
          self.checkHasCustomSync(dataset_id, function() {

            var syncLoopParams = {};
            syncLoopParams.fn = 'sync';
            syncLoopParams.dataset_id = dataset_id;
            syncLoopParams.query_params = dataSet.query_params;
            syncLoopParams.config = dataSet.config;
            syncLoopParams.meta_data = dataSet.meta_data;
            //var datasetHash = self.generateLocalDatasetHash(dataSet);
            syncLoopParams.dataset_hash = dataSet.hash;
            syncLoopParams.acknowledgements = dataSet.acknowledgements || [];

            var pending = dataSet.pending;
            var pendingArray = [];
            for(var i in pending ) {
              // Mark the pending records we are about to submit as inflight and add them to the array for submission
              // Don't re-add previous inFlight pending records who whave crashed - i.e. who's current state is unknown
              // Don't add delayed records
              if( !pending[i].inFlight && !pending[i].crashed && !pending[i].delayed) {
                pending[i].inFlight = true;
                pending[i].inFlightDate = new Date().getTime();
                pendingArray.push(pending[i]);
              }
            }
            syncLoopParams.pending = pendingArray;

            if( pendingArray.length > 0 ) {
              self.consoleLog('Starting sync loop - global hash = ' + dataSet.hash + ' :: params = ' + JSON.stringify(syncLoopParams, null, 2));
            }
            try {
              self.doCloudCall({
                'dataset_id': dataset_id,
                'req': syncLoopParams
              }, function(res) {
                var rec;

                function processUpdates(updates, notification, acknowledgements) {
                  if( updates ) {
                    for (var up in updates) {
                      rec = updates[up];
                      acknowledgements.push(rec);
                      if( dataSet.pending[up] && dataSet.pending[up].inFlight) {
                        delete dataSet.pending[up];
                        self.doNotify(dataset_id, rec.uid, notification, rec);
                      }
                    }
                  }
                }

                // Check to see if any previously crashed inflight records can now be resolved
                self.updateCrashedInFlightFromNewData(dataset_id, dataSet, res);

                //Check to see if any delayed pending records can now be set to ready
                self.updateDelayedFromNewData(dataset_id, dataSet, res);

                //Check meta data as well to make sure it contains the correct info
                self.updateMetaFromNewData(dataset_id, dataSet, res);


                if (res.updates) {
                  var acknowledgements = [];
                  self.checkUidChanges(dataSet, res.updates.applied);
                  processUpdates(res.updates.applied, self.notifications.REMOTE_UPDATE_APPLIED, acknowledgements);
                  processUpdates(res.updates.failed, self.notifications.REMOTE_UPDATE_FAILED, acknowledgements);
                  processUpdates(res.updates.collisions, self.notifications.COLLISION_DETECTED, acknowledgements);
                  dataSet.acknowledgements = acknowledgements;
                }

                if (res.hash && res.hash !== dataSet.hash) {
                  self.consoleLog("Local dataset stale - syncing records :: local hash= " + dataSet.hash + " - remoteHash=" + res.hash);
                  // Different hash value returned - Sync individual records
                  self.syncRecords(dataset_id);
                } else {
                  self.consoleLog("Local dataset up to date");
                  self.syncComplete(dataset_id,  "online", self.notifications.SYNC_COMPLETE);
                }
              }, function(msg, err) {
                // The AJAX call failed to complete succesfully, so the state of the current pending updates is unknown
                // Mark them as "crashed". The next time a syncLoop completets successfully, we will review the crashed
                // records to see if we can determine their current state.
                self.markInFlightAsCrashed(dataSet);
                self.consoleLog("syncLoop failed : msg=" + msg + " :: err = " + err);
                self.syncComplete(dataset_id, msg, self.notifications.SYNC_FAILED);
              });
            }
            catch (e) {
              self.consoleLog('Error performing sync - ' + e);
              self.syncComplete(dataset_id, e, self.notifications.SYNC_FAILED);
            }
          });
        }
      });
    });
  },

  syncRecords: function(dataset_id) {

    self.getDataSet(dataset_id, function(dataSet) {

      var localDataSet = dataSet.data || {};

      var clientRecs = {};
      for (var i in localDataSet) {
        var uid = i;
        var hash = localDataSet[i].hash;
        clientRecs[uid] = hash;
      }

      var syncRecParams = {};

      syncRecParams.fn = 'syncRecords';
      syncRecParams.dataset_id = dataset_id;
      syncRecParams.query_params = dataSet.query_params;
      syncRecParams.clientRecs = clientRecs;

      self.consoleLog("syncRecParams :: " + JSON.stringify(syncRecParams));

      self.doCloudCall({
        'dataset_id': dataset_id,
        'req': syncRecParams
      }, function(res) {
        self.consoleLog('syncRecords Res before applying pending changes :: ' + JSON.stringify(res));
        self.applyPendingChangesToRecords(dataSet, res);
        self.consoleLog('syncRecords Res after apply pending changes :: ' + JSON.stringify(res));

        var i;

        if (res.create) {
          for (i in res.create) {
            localDataSet[i] = {"hash" : res.create[i].hash, "data" : res.create[i].data};
            self.doNotify(dataset_id, i, self.notifications.RECORD_DELTA_RECEIVED, "create");
          }
        }
        
        if (res.update) {
          for (i in res.update) {
            localDataSet[i].hash = res.update[i].hash;
            localDataSet[i].data = res.update[i].data;
            self.doNotify(dataset_id, i, self.notifications.RECORD_DELTA_RECEIVED, "update");
          }
        }
        if (res['delete']) {
          for (i in res['delete']) {
            delete localDataSet[i];
            self.doNotify(dataset_id, i, self.notifications.RECORD_DELTA_RECEIVED, "delete");
          }
        }

        self.doNotify(dataset_id, res.hash, self.notifications.DELTA_RECEIVED, 'partial dataset');

        dataSet.data = localDataSet;
        if(res.hash) {
          dataSet.hash = res.hash;
        }
        self.syncComplete(dataset_id, "online", self.notifications.SYNC_COMPLETE);
      }, function(msg, err) {
        self.consoleLog("syncRecords failed : msg=" + msg + " :: err=" + err);
        self.syncComplete(dataset_id, msg, self.notifications.SYNC_FAILED);
      });
    });
  },

  syncComplete: function(dataset_id, status, notification) {

    self.getDataSet(dataset_id, function(dataset) {
      dataset.syncRunning = false;
      dataset.syncLoopEnd = new Date().getTime();
      self.saveDataSet(dataset_id);
      self.doNotify(dataset_id, dataset.hash, notification, status);
    });
  },

  applyPendingChangesToRecords: function(dataset, records){
    var pendings = dataset.pending;
    for(var pendingUid in pendings){
      if(pendings.hasOwnProperty(pendingUid)){
        var pendingObj = pendings[pendingUid];
        var uid = pendingObj.uid;
        //if the records contain any thing about the data records that are currently in pendings,
        //it means there are local changes that haven't been applied to the cloud yet,
        //so update the pre value of each pending record to relect the latest status from cloud
        //and remove them from the response
        if(records.create){
          var creates = records.create;
          if(creates && creates[uid]){
            delete creates[uid];
          }
        }
        if(records.update){
          var updates = records.update;
          if(updates && updates[uid]){
            delete updates[uid];
          }
        }
        if(records['delete']){
          var deletes = records['delete'];
          if(deletes && deletes[uid]){
            delete deletes[uid];
          }
        }
      }
    }
  },

  checkUidChanges: function(dataset, appliedUpdates){
    if(appliedUpdates){
      var new_uids = {};
      var changeUidsCount = 0;
      for(var update in appliedUpdates){
        if(appliedUpdates.hasOwnProperty(update)){
          var applied_update = appliedUpdates[update];
          var action = applied_update.action;
          if(action && action === 'create'){
            //we are receving the results of creations, at this point, we will have the old uid(the hash) and the real uid generated by the cloud
            var newUid = applied_update.uid;
            var oldUid = applied_update.hash;
            changeUidsCount++;
            //remember the mapping
            self.uid_map[oldUid] = newUid;
            new_uids[oldUid] = newUid;
            //update the data uid in the dataset
            var record = dataset.data[oldUid];
            if(record){
              dataset.data[newUid] = record;
              delete dataset.data[oldUid];
            }

            //update the old uid in meta data
            var metaData = dataset.meta[oldUid];
            if(metaData) {
              dataset.meta[newUid] = metaData;
              delete dataset.meta[oldUid];
            }
          }
        }
      }
      if(changeUidsCount > 0){
        //we need to check all existing pendingRecords and update their UIDs if they are still the old values
        for(var pending in dataset.pending){
          if(dataset.pending.hasOwnProperty(pending)){
            var pendingObj = dataset.pending[pending];
            var pendingRecordUid = pendingObj.uid;
            if(new_uids[pendingRecordUid]){
              pendingObj.uid = new_uids[pendingRecordUid];
            }
          }
        }
      }
    }
  },

  checkDatasets: function() {
    for( var dataset_id in self.datasets ) {
      if( self.datasets.hasOwnProperty(dataset_id) ) {
        var dataset = self.datasets[dataset_id];
        if(dataset && !dataset.syncRunning && (dataset.config.sync_active || dataset.syncForced)) {
          // Check to see if it is time for the sync loop to run again
          var lastSyncStart = dataset.syncLoopStart;
          var lastSyncCmp = dataset.syncLoopEnd;
          if(dataset.syncForced){
            dataset.syncPending = true;
          } else if( lastSyncStart == null ) {
            self.consoleLog(dataset_id +' - Performing initial sync');
            // Dataset has never been synced before - do initial sync
            dataset.syncPending = true;
          } else if (lastSyncCmp != null) {
            var timeSinceLastSync = new Date().getTime() - lastSyncCmp;
            var syncFrequency = dataset.config.sync_frequency * 1000;
            if( timeSinceLastSync > syncFrequency ) {
              // Time between sync loops has passed - do another sync
              dataset.syncPending = true;
            }
          }

          if( dataset.syncPending ) {
            // Reset syncForced in case it was what caused the sync cycle to run.
            dataset.syncForced = false;

            // If the dataset requres syncing, run the sync loop. This may be because the sync interval has passed
            // or because the sync_frequency has been changed or because a change was made to the dataset and the
            // immediate_sync flag set to true
            self.syncLoop(dataset_id);
          }
        }
      }
    }
  },

  checkHasCustomSync : function(dataset_id, cb) {
    var dataset = self.datasets[dataset_id];
    if(dataset && dataset.config){
      self.consoleLog("dataset.config.has_custom_sync = " + dataset.config.has_custom_sync);
      if(dataset.config.has_custom_sync != null) {
        return cb();
      }
      self.consoleLog('starting check has custom sync');

      actAPI({
        'act' : dataset_id,
        'req': {
          'fn': 'sync'
        }
      }, function(res) {
        //if the custom sync is defined in the cloud, this call should success.
        //if failed, we think this the custom sync is not defined
        self.consoleLog('check has_custom_sync - success - ', res);
        dataset.config.has_custom_sync = true;
        return cb();
      }, function(msg,err) {
        self.consoleLog('check has_custom_sync - failure - ', err);
        if(err.status && err.status === 500){
          //if we receive 500, it could be that there is an error occured due to missing parameters or similar,
          //but the endpoint is defined.
          self.consoleLog('check has_custom_sync - failed with 500, endpoint does exists');
          dataset.config.has_custom_sync = true;
        } else {
          dataset.config.has_custom_sync = false;
        }
        return cb();
      });
    } else {
      return cb();
    }
  },

  doCloudCall: function(params, success, failure) {
    var hasCustomSync = false;
    var dataset = self.datasets[params.dataset_id];
    if(dataset && dataset.config){
      hasCustomSync = dataset.config.has_custom_sync;
    }
    if( hasCustomSync === true ) {
      actAPI({
        'act' : params.dataset_id,
        'req' : params.req
      }, function(res) {
        success(res);
      }, function(msg, err) {
        failure(msg, err);
      });      
    } else {
      cloudAPI({
        'path' : '/mbaas/sync/' + params.dataset_id,
        'method' : 'post',
        'data' : params.req
      }, function(res) {
        success(res);
      }, function(msg, err) {
        failure(msg, err);
      });
    }
  },

  datasetMonitor: function() {
    self.checkDatasets();

    // Re-execute datasetMonitor every 500ms so we keep invoking checkDatasets();
    setTimeout(function() {
      self.datasetMonitor();
    }, 500);
  },

  getStorageAdapter: function(dataset_id, isSave, cb){
    var onFail = function(msg, err){
      var errMsg = (isSave?'save to': 'load from' ) + ' local storage failed msg: ' + msg + ' err: ' + err;
      self.doNotify(dataset_id, null, self.notifications.CLIENT_STORAGE_FAILED, errMsg);
      self.consoleLog(errMsg);
    };
    Lawnchair({fail:onFail, adapter: self.config.storage_strategy, size:self.config.file_system_quota, backup: self.config.icloud_backup}, function(){
      return cb(null, this);
    });
  },

  saveDataSet: function (dataset_id, cb) {
    self.getDataSet(dataset_id, function(dataset) {
      self.getStorageAdapter(dataset_id, true, function(err, storage){
        storage.save({key:"dataset_" + dataset_id, val:dataset}, function(){
          //save success
          if(cb) {
            return cb();
          }
        });
      });
    });
  },

  loadDataSet: function (dataset_id, success, failure) {
    self.getStorageAdapter(dataset_id, false, function(err, storage){
      storage.get( "dataset_" + dataset_id, function (data){
        if (data && data.val) {
          var dataset = data.val;
          if(typeof dataset === "string"){
            dataset = JSON.parse(dataset);
          }
          // Datasets should not be auto initialised when loaded - the mange function should be called for each dataset
          // the user wants sync
          dataset.initialised = false;
          self.datasets[dataset_id] = dataset; // TODO: do we need to handle binary data?
          self.consoleLog('load from local storage success for dataset_id :' + dataset_id);
          if(success) {
            return success(dataset);
          }
        } else {
          // no data yet, probably first time. failure calback should handle this
          if(failure) {
            return failure();
          }
        }
      });
    });
  },

  clearCache: function(dataset_id, cb){
    delete self.datasets[dataset_id];
    self.notify_callback_map[dataset_id] = null;
    self.getStorageAdapter(dataset_id, true, function(err, storage){
      storage.remove("dataset_" + dataset_id, function(){
        self.consoleLog('local cache is cleared for dataset : ' + dataset_id);
        if(cb){
          return cb();
        }
      });
    });
  },

  updateDatasetFromLocal: function(dataset, pendingRec) {
    var pending = dataset.pending;
    var previousPendingUid;
    var previousPending;

    var uid = pendingRec.uid;
    self.consoleLog('updating local dataset for uid ' + uid + ' - action = ' + pendingRec.action);

    dataset.meta[uid] = dataset.meta[uid] || {};

    // Creating a new record
    if( pendingRec.action === "create" ) {
      if( dataset.data[uid] ) {
        self.consoleLog('dataset already exists for uid in create :: ' + JSON.stringify(dataset.data[uid]));

        // We are trying to do a create using a uid which already exists
        if (dataset.meta[uid].fromPending) {
          // We are trying to create on top of an existing pending record
          // Remove the previous pending record and use this one instead
          previousPendingUid = dataset.meta[uid].pendingUid;
          delete pending[previousPendingUid];
        }
      }
      dataset.data[uid] = {};
    }

    if( pendingRec.action === "update" ) {
      if( dataset.data[uid] ) {
        if (dataset.meta[uid].fromPending) {
          self.consoleLog('updating an existing pending record for dataset :: ' + JSON.stringify(dataset.data[uid]));
          // We are trying to update an existing pending record
          previousPendingUid = dataset.meta[uid].pendingUid;
          previousPending = pending[previousPendingUid];
          if(previousPending) {
            if(!previousPending.inFlight){
              self.consoleLog('existing pre-flight pending record = ' + JSON.stringify(previousPending));
              // We are trying to perform an update on an existing pending record
              // modify the original record to have the latest value and delete the pending update
              previousPending.post = pendingRec.post;
              previousPending.postHash = pendingRec.postHash;
              delete pending[pendingRec.hash];
              // Update the pending record to have the hash of the previous record as this is what is now being
              // maintained in the pending array & is what we want in the meta record
              pendingRec.hash = previousPendingUid;
            } else {
              //we are performing changes to a pending record which is inFlight. Until the status of this pending record is resolved,
              //we should not submit this pending record to the cloud. Mark it as delayed.
              self.consoleLog('existing in-inflight pending record = ' + JSON.stringify(previousPending));
              pendingRec.delayed = true;
              pendingRec.waiting = previousPending.hash;
            }
          }
        }
      }
    }

    if( pendingRec.action === "delete" ) {
      if( dataset.data[uid] ) {
        if (dataset.meta[uid].fromPending) {
          self.consoleLog('Deleting an existing pending record for dataset :: ' + JSON.stringify(dataset.data[uid]));
          // We are trying to delete an existing pending record
          previousPendingUid = dataset.meta[uid].pendingUid;
          previousPending = pending[previousPendingUid];
          if( previousPending ) {
            if(!previousPending.inFlight){
              self.consoleLog('existing pending record = ' + JSON.stringify(previousPending));
              if( previousPending.action === "create" ) {
                // We are trying to perform a delete on an existing pending create
                // These cancel each other out so remove them both
                delete pending[pendingRec.hash];
                delete pending[previousPendingUid];
              }
              if( previousPending.action === "update" ) {
                // We are trying to perform a delete on an existing pending update
                // Use the pre value from the pending update for the delete and
                // get rid of the pending update
                pendingRec.pre = previousPending.pre;
                pendingRec.preHash = previousPending.preHash;
                pendingRec.inFlight = false;
                delete pending[previousPendingUid];
              }
            } else {
              self.consoleLog('existing in-inflight pending record = ' + JSON.stringify(previousPending));
              pendingRec.delayed = true;
              pendingRec.waiting = previousPending.hash;
            }
          }
        }
        delete dataset.data[uid];
      }
    }

    if( dataset.data[uid] ) {
      dataset.data[uid].data = pendingRec.post;
      dataset.data[uid].hash = pendingRec.postHash;
      dataset.meta[uid].fromPending = true;
      dataset.meta[uid].pendingUid = pendingRec.hash;
    }
  },

  updateCrashedInFlightFromNewData: function(dataset_id, dataset, newData) {
    var updateNotifications = {
      applied: self.notifications.REMOTE_UPDATE_APPLIED,
      failed: self.notifications.REMOTE_UPDATE_FAILED,
      collisions: self.notifications.COLLISION_DETECTED
    };

    var pending = dataset.pending;
    var resolvedCrashes = {};
    var pendingHash;
    var pendingRec;


    if( pending ) {
      for( pendingHash in pending ) {
        if( pending.hasOwnProperty(pendingHash) ) {
          pendingRec = pending[pendingHash];

          if( pendingRec.inFlight && pendingRec.crashed) {
            self.consoleLog('updateCrashedInFlightFromNewData - Found crashed inFlight pending record uid=' + pendingRec.uid + ' :: hash=' + pendingRec.hash );
            if( newData && newData.updates && newData.updates.hashes) {

              // Check if the updates received contain any info about the crashed in flight update
              var crashedUpdate = newData.updates.hashes[pendingHash];
              if( !crashedUpdate ) {
                //TODO: review this - why we need to wait?
                // No word on our crashed update - increment a counter to reflect another sync that did not give us
                // any update on our crashed record.
                if( pendingRec.crashedCount ) {
                  pendingRec.crashedCount++;
                }
                else {
                  pendingRec.crashedCount = 1;
                }
              }
            }
            else {
              // No word on our crashed update - increment a counter to reflect another sync that did not give us
              // any update on our crashed record.
              if( pendingRec.crashedCount ) {
                pendingRec.crashedCount++;
              }
              else {
                pendingRec.crashedCount = 1;
              }
            }
          }
        }
      }

      for( pendingHash in pending ) {
        if( pending.hasOwnProperty(pendingHash) ) {
          pendingRec = pending[pendingHash];

          if( pendingRec.inFlight && pendingRec.crashed) {
            if( pendingRec.crashedCount > dataset.config.crashed_count_wait ) {
              self.consoleLog('updateCrashedInFlightFromNewData - Crashed inflight pending record has reached crashed_count_wait limit : ' + JSON.stringify(pendingRec));
              self.consoleLog('updateCrashedInFlightFromNewData - Retryig crashed inflight pending record');
              pendingRec.crashed = false;
              pendingRec.inFlight = false;
            }
          }
        }
      }
    }
  },

  updateDelayedFromNewData: function(dataset_id, dataset, newData){
    var pending = dataset.pending;
    var pendingHash;
    var pendingRec;
    if(pending){
      for( pendingHash in pending ){
        if( pending.hasOwnProperty(pendingHash) ){
          pendingRec = pending[pendingHash];
          if( pendingRec.delayed && pendingRec.waiting ){
            self.consoleLog('updateDelayedFromNewData - Found delayed pending record uid=' + pendingRec.uid + ' :: hash=' + pendingRec.hash + ' :: waiting=' + pendingRec.waiting);
            if( newData && newData.updates && newData.updates.hashes ){
              var waitingRec = newData.updates.hashes[pendingRec.waiting];
              if(waitingRec){
                self.consoleLog('updateDelayedFromNewData - Waiting pending record is resolved rec=' + JSON.stringify(waitingRec));
                pendingRec.delayed = false;
                pendingRec.waiting = undefined;
              }
            }
          }
        }
      }
    }
  },

  updateMetaFromNewData: function(dataset_id, dataset, newData){
    var meta = dataset.meta;
    if(meta && newData && newData.updates && newData.updates.hashes){
      for(var uid in meta){
        if(meta.hasOwnProperty(uid)){
          var metadata = meta[uid];
          var pendingHash = metadata.pendingUid;
          self.consoleLog("updateMetaFromNewData - Found metadata with uid = " + uid + " :: pendingHash = " + pendingHash);
          var pendingResolved = true;
  
          if(pendingHash){
            //we have current pending in meta data, see if it's resolved
            pendingResolved = false;
            var hashresolved = newData.updates.hashes[pendingHash];
            if(hashresolved){
              self.consoleLog("updateMetaFromNewData - Found pendingUid in meta data resolved - resolved = " + JSON.stringify(hashresolved));
              //the current pending is resolved in the cloud
              metadata.pendingUid = undefined;
              pendingResolved = true;
            }
          }

          if(pendingResolved){
            self.consoleLog("updateMetaFromNewData - both previous and current pendings are resolved for meta data with uid " + uid + ". Delete it.");
            //all pendings are resolved, the entry can be removed from meta data
            delete meta[uid];
          }
        }
      }
    }
  },


  markInFlightAsCrashed : function(dataset) {
    var pending = dataset.pending;
    var pendingHash;
    var pendingRec;

    if( pending ) {
      var crashedRecords = {};
      for( pendingHash in pending ) {
        if( pending.hasOwnProperty(pendingHash) ) {
          pendingRec = pending[pendingHash];

          if( pendingRec.inFlight ) {
            self.consoleLog('Marking in flight pending record as crashed : ' + pendingHash);
            pendingRec.crashed = true;
            crashedRecords[pendingRec.uid] = pendingRec;
          }
        }
      }
    }
  },

  consoleLog: function(msg) {
    if( self.config.do_console_log ) {
      console.log(msg);
    }
  }
};

(function() {
  self.config = self.defaults;
  //Initialse the sync service with default config
  //self.init({});
})();

module.exports = {
  init: self.init,
  manage: self.manage,
  notify: self.notify,
  doList: self.list,
  doCreate: self.create,
  doRead: self.read,
  doUpdate: self.update,
  doDelete: self['delete'],
  listCollisions: self.listCollisions,
  removeCollision: self.removeCollision,
  getPending : self.getPending,
  clearPending : self.clearPending,
  getDataset : self.getDataSet,
  getQueryParams: self.getQueryParams,
  setQueryParams: self.setQueryParams,
  getMetaData: self.getMetaData,
  setMetaData: self.setMetaData,
  getConfig: self.getConfig,
  setConfig: self.setConfig,
  startSync: self.startSync,
  stopSync: self.stopSync,
  doSync: self.doSync,
  forceSync: self.forceSync,
  generateHash: self.generateHash,
  loadDataSet: self.loadDataSet,
  checkHasCustomSync: self.checkHasCustomSync,
  clearCache: self.clearCache
};
},{"../../libs/generated/crypto":1,"../../libs/generated/lawnchair":2,"./api_act":22,"./api_cloud":24}],51:[function(_dereq_,module,exports){
module.exports = {
  createUUID : function () {
    //from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    //based on RFC 4122, section 4.4 (Algorithms for creating UUID from truely random pr pseudo-random number)
    var s = [];
    var hexDigitals = "0123456789ABCDEF";
    for (var i = 0; i < 32; i++) {
      s[i] = hexDigitals.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[12] = "4";
    s[16] = hexDigitals.substr((s[16] & 0x3) | 0x8, 1);
    var uuid = s.join("");
    return uuid;
  }
};

},{}],52:[function(_dereq_,module,exports){
var initializer = _dereq_("./initializer");
var events = _dereq_("./events");
var CloudHost = _dereq_("./hosts");
var constants = _dereq_("./constants");
var logger = _dereq_("./logger");
var data = _dereq_('./data');
var fhparams = _dereq_('./fhparams');

//the cloud configurations
var cloud_host;

var is_initialising = false;
var is_cloud_ready = false;
var init_error = null;


var ready = function(cb){
  if(is_cloud_ready){
    return cb(null, {host: getCloudHostUrl()});
  } else {
    events.once(constants.INIT_EVENT, function(err, host){
      return cb(err, host);
    });
    if(!is_initialising){
      is_initialising = true;
      var fhinit = function(){
        data.sessionManager.read(function(err, session){
          //load the persisted sessionToken and set it for the session
          if(session && session.sessionToken){
            fhparams.setAuthSessionToken(session.sessionToken);
          }
          initializer.init(function(err, initRes){
            is_initialising = false;
            if(err){
              init_error = err;
              return events.emit(constants.INIT_EVENT, err);
            } else {
              init_error = null;
              is_cloud_ready = true;
              cloud_host = new CloudHost(initRes.cloud);
              return events.emit(constants.INIT_EVENT, null, {host: getCloudHostUrl()});
            }
          });
        });
      };
      if(typeof window.cordova !== "undefined" || typeof window.phonegap !== "undefined"){
        //if we are running inside cordova/phonegap, only init after device is ready to ensure the device id is the right one
        document.addEventListener("deviceready", fhinit, false);
      } else {
        fhinit();
      }
    }
  }
};

var getCloudHost = function(){
  return cloud_host;
};

var getCloudHostUrl = function(){
  if(typeof cloud_host !== "undefined"){
    var appProps = _dereq_("./appProps").getAppProps();
    return cloud_host.getHost(appProps.mode);
  } else {
    return undefined;
  }
};

var isReady = function(){
  return is_cloud_ready;
};

var getInitError = function(){
  return init_error;
};

//for test
var reset = function(){
  is_cloud_ready = false;
  is_initialising = false;
  cloud_host = undefined;
  init_error = undefined;
  ready(function(){
    
  });
};

ready(function(error, host){
  if(error){
    if(error.message !== "app_config_missing"){
      logger.error("Failed to initialise fh.");
    } else {
      logger.info("No fh config file");
    }
  } else {
    logger.info("fh cloud is ready");
  }
});

module.exports = {
  ready: ready,
  isReady: isReady,
  getCloudHost: getCloudHost,
  getCloudHostUrl: getCloudHostUrl,
  getInitError: getInitError,
  reset: reset
};
},{"./appProps":29,"./constants":31,"./data":33,"./events":35,"./fhparams":36,"./hosts":38,"./initializer":39,"./logger":42}]},{},[19])
(19)
});
;
(function(root) {

  //!!!lib start!!!
  /*
    json2.js
    2008-03-24

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing three methods: stringify,
    parse, and quote.


        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects without a toJSON
                        method. It can be a function or an array.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t'), it contains the
                        characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method with be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method will
            be passed the key associated with the value, and this will be bound
            to the object holding the key.

            This is the toJSON method added to Dates:

                function toJSON(key) {
                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                }

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If no replacer parameter is provided, then a default replacer
            will be used:

                function replacer(key, value) {
                    return Object.hasOwnProperty.call(this, key) ?
                        value : undefined;
                }

            The default replacer is passed the key and value for each item in
            the structure. It excludes inherited members.

            If the replacer parameter is an array, then it will be used to
            select the members to be serialized. It filters the results such
            that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representaions, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the value
            that is filled with line breaks and indentation to make it easier to
            read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            then indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });


        JSON.quote(text)
            This method wraps a string in quotes, escaping some characters
            as needed.


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD THIRD PARTY
    CODE INTO YOUR PAGES.
*/

  /*jslint regexp: true, forin: true, evil: true */

  /*global JSON */

  /*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, floor, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join, length,
    parse, propertyIsEnumerable, prototype, push, quote, replace, stringify,
    test, toJSON, toString
*/

  if (!JSON) {

    // Create a JSON object only if one does not already exist. We create the
    // object in a closure to avoid global variables.

    var JSON = function() {

      function f(n) { // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
      }

      Date.prototype.toJSON = function() {

        // Eventually, this method will be based on the date.toISOString method.

        return this.getUTCFullYear() + '-' +
          f(this.getUTCMonth() + 1) + '-' +
          f(this.getUTCDate()) + 'T' +
          f(this.getUTCHours()) + ':' +
          f(this.getUTCMinutes()) + ':' +
          f(this.getUTCSeconds()) + 'Z';
      };


      var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
        gap,
        indent,
        meta = { // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"': '\\"',
          '\\': '\\\\'
        },
        rep;


      function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        return escapeable.test(string) ?
          '"' + string.replace(escapeable, function(a) {
            var c = meta[a];
            if (typeof c === 'string') {
              return c;
            }
            c = a.charCodeAt();
            return '\\u00' + Math.floor(c / 16).toString(16) +
              (c % 16).toString(16);
          }) + '"' :
          '"' + string + '"';
      }


      function str(key, holder) {

        // Produce a string from holder[key].

        var i, // The loop counter.
          k, // The member key.
          v, // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
          typeof value.toJSON === 'function') {
          value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
          case 'string':
            return quote(value);

          case 'number':

            // JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

          case 'boolean':
          case 'null':

            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.

            return String(value);

            // If the type is 'object', we might be dealing with an object or an array or
            // null.

          case 'object':

            // Due to a specification blunder in ECMAScript, typeof null is 'object',
            // so watch out for that case.

            if (!value) {
              return 'null';
            }

            // Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

            // If the object has a dontEnum length property, we'll treat it as an array.

            if (typeof value.length === 'number' && !(value.propertyIsEnumerable('length'))) {

              // The object is an array. Stringify every element. Use null as a placeholder
              // for non-JSON values.

              length = value.length;
              for (i = 0; i < length; i += 1) {
                partial[i] = str(i, value) || 'null';
              }

              // Join all of the elements together, separated with commas, and wrap them in
              // brackets.

              v = partial.length === 0 ? '[]' :
                gap ? '[\n' + gap + partial.join(',\n' + gap) +
                '\n' + mind + ']' :
                '[' + partial.join(',') + ']';
              gap = mind;
              return v;
            }

            // If the replacer is an array, use it to select the members to be stringified.

            if (typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                k = rep[i];
                if (typeof k === 'string') {
                  v = str(k, value, rep);
                  if (v) {
                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                  }
                }
              }
            } else {

              // Otherwise, iterate through all of the keys in the object.

              for (k in value) {
                v = str(k, value, rep);
                if (v) {
                  partial.push(quote(k) + (gap ? ': ' : ':') + v);
                }
              }
            }

            // Join all of the member texts together, separated with commas,
            // and wrap them in braces.

            v = partial.length === 0 ? '{}' :
              gap ? '{\n' + gap + partial.join(',\n' + gap) +
              '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
      }


      // Return the JSON object containing the stringify, parse, and quote methods.

      return {
        stringify: function(value, replacer, space) {

          // The stringify method takes a value and an optional replacer, and an optional
          // space parameter, and returns a JSON text. The replacer can be a function
          // that can replace values, or an array of strings that will select the keys.
          // A default replacer method can be provided. Use of the space parameter can
          // produce text that is more easily readable.

          var i;
          gap = '';
          indent = '';
          if (space) {

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
              for (i = 0; i < space; i += 1) {
                indent += ' ';
              }

              // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
              indent = space;
            }
          }

          // If there is no replacer parameter, use the default replacer.

          if (!replacer) {
            rep = function(key, value) {
              if (!Object.hasOwnProperty.call(this, key)) {
                return undefined;
              }
              return value;
            };

            // The replacer can be a function or an array. Otherwise, throw an error.

          } else if (typeof replacer === 'function' ||
            (typeof replacer === 'object' &&
              typeof replacer.length === 'number')) {
            rep = replacer;
          } else {
            throw new Error('JSON.stringify');
          }

          // Make a fake root object containing our value under the key of ''.
          // Return the result of stringifying the value.

          return str('', {
            '': value
          });
        },


        parse: function(text, reviver) {

          // The parse method takes a text and an optional reviver function, and returns
          // a JavaScript value if the text is a valid JSON text.

          var j;

          function walk(holder, key) {

            // The walk method is used to recursively walk the resulting structure so
            // that modifications can be made.

            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
              for (k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                  v = walk(value, k);
                  if (v !== undefined) {
                    value[k] = v;
                  } else {
                    delete value[k];
                  }
                }
              }
            }
            return reviver.call(holder, key, value);
          }


          // Parsing happens in three stages. In the first stage, we run the text against
          // regular expressions that look for non-JSON patterns. We are especially
          // concerned with '()' and 'new' because they can cause invocation, and '='
          // because it can cause mutation. But just to be safe, we want to reject all
          // unexpected forms.

          // We split the first stage into 4 regexp operations in order to work around
          // crippling inefficiencies in IE's and Safari's regexp engines. First we
          // replace all backslash pairs with '@' (a non-JSON character). Second, we
          // replace all simple value tokens with ']' characters. Third, we delete all
          // open brackets that follow a colon or comma or that begin the text. Finally,
          // we look to see that the remaining characters are only whitespace or ']' or
          // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

          if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

            // In the second stage we use the eval function to compile the text into a
            // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
            // in JavaScript: it can begin a block or an object literal. We wrap the text
            // in parens to eliminate the ambiguity.

            j = eval('(' + text + ')');

            // In the optional third stage, we recursively walk the new structure, passing
            // each name/value pair to a reviver function for possible transformation.

            return typeof reviver === 'function' ?
              walk({
                '': j
              }, '') : j;
          }

          // If the text is not JSON parseable, then a SyntaxError is thrown.

          throw new SyntaxError('JSON.parse');
        },

        quote: quote
      };
    }();
  }

  //json end

  //persist-min start

  (function() {
    if (window.google && google.gears)
      return;
    var F = null;
    if (typeof GearsFactory != 'undefined') {
      F = new GearsFactory();
    } else {
      try {
        F = new ActiveXObject('Gears.Factory');
        if (F.getBuildInfo().indexOf('ie_mobile') != -1)
          F.privateSetGlobalObject(this);
      } catch (e) {
        if ((typeof navigator.mimeTypes != 'undefined') && navigator.mimeTypes["application/x-googlegears"]) {
          F = document.createElement("object");
          F.style.display = "none";
          F.width = 0;
          F.height = 0;
          F.type = "application/x-googlegears";
          document.documentElement.appendChild(F);
        }
      }
    }
    if (!F)
      return;
    if (!window.google)
      google = {};
    if (!google.gears)
      google.gears = {
        factory: F
      };
  })();
  Persist = (function() {
    var VERSION = '0.2.0',
      P, B, esc, init, empty, ec;
    ec = (function() {
      var EPOCH = 'Thu, 01-Jan-1970 00:00:01 GMT',
        RATIO = 1000 * 60 * 60 * 24,
        KEYS = ['expires', 'path', 'domain'],
        esc = escape,
        un = unescape,
        doc = document,
        me;
      var get_now = function() {
        var r = new Date();
        r.setTime(r.getTime());
        return r;
      }
      var cookify = function(c_key, c_val) {
        var i, key, val, r = [],
          opt = (arguments.length > 2) ? arguments[2] : {};
        r.push(esc(c_key) + '=' + esc(c_val));
        for (i = 0; i < KEYS.length; i++) {
          key = KEYS[i];
          if (val = opt[key])
            r.push(key + '=' + val);
        }
        if (opt.secure)
          r.push('secure');
        return r.join('; ');
      }
      var alive = function() {
        var k = '__EC_TEST__',
          v = new Date();
        v = v.toGMTString();
        this.set(k, v);
        this.enabled = (this.remove(k) == v);
        return this.enabled;
      }
      me = {
        set: function(key, val) {
          var opt = (arguments.length > 2) ? arguments[2] : {}, now = get_now(),
            expire_at, cfg = {};
          if (opt.expires) {
            opt.expires *= RATIO;
            cfg.expires = new Date(now.getTime() + opt.expires);
            cfg.expires = cfg.expires.toGMTString();
          }
          var keys = ['path', 'domain', 'secure'];
          for (i = 0; i < keys.length; i++)
            if (opt[keys[i]])
              cfg[keys[i]] = opt[keys[i]];
          var r = cookify(key, val, cfg);
          doc.cookie = r;
          return val;
        },
        has: function(key) {
          key = esc(key);
          var c = doc.cookie,
            ofs = c.indexOf(key + '='),
            len = ofs + key.length + 1,
            sub = c.substring(0, key.length);
          return ((!ofs && key != sub) || ofs < 0) ? false : true;
        },
        get: function(key) {
          key = esc(key);
          var c = doc.cookie,
            ofs = c.indexOf(key + '='),
            len = ofs + key.length + 1,
            sub = c.substring(0, key.length),
            end;
          if ((!ofs && key != sub) || ofs < 0)
            return null;
          end = c.indexOf(';', len);
          if (end < 0)
            end = c.length;
          return un(c.substring(len, end));
        },
        remove: function(k) {
          var r = me.get(k),
            opt = {
              expires: EPOCH
            };
          doc.cookie = cookify(k, '', opt);
          return r;
        },
        keys: function() {
          var c = doc.cookie,
            ps = c.split('; '),
            i, p, r = [];
          for (i = 0; i < ps.length; i++) {
            p = ps[i].split('=');
            r.push(un(p[0]));
          }
          return r;
        },
        all: function() {
          var c = doc.cookie,
            ps = c.split('; '),
            i, p, r = [];
          for (i = 0; i < ps.length; i++) {
            p = ps[i].split('=');
            r.push([un(p[0]), un(p[1])]);
          }
          return r;
        },
        version: '0.2.1',
        enabled: false
      };
      me.enabled = alive.call(me);
      return me;
    }());
    var index_of = (function() {
      if (Array.prototype.indexOf)
        return function(ary, val) {
          return Array.prototype.indexOf.call(ary, val);
        };
      else
        return function(ary, val) {
          var i, l;
          for (i = 0, l = ary.length; i < l; i++)
            if (ary[i] == val)
              return i;
          return -1;
        };
    })();
    empty = function() {};
    esc = function(str) {
      return 'PS' + str.replace(/_/g, '__').replace(/ /g, '_s');
    };
    C = {
      search_order: ['localstorage', 'whatwg_db', 'globalstorage', 'gears', 'ie', 'flash', 'cookie'],
      name_re: /^[a-z][a-z0-9_ -]+$/i,
      methods: ['init', 'get', 'set', 'remove', 'load', 'save'],
      sql: {
        version: '1',
        create: "CREATE TABLE IF NOT EXISTS persist_data (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)",
        get: "SELECT v FROM persist_data WHERE k = ?",
        set: "INSERT INTO persist_data(k, v) VALUES (?, ?)",
        remove: "DELETE FROM persist_data WHERE k = ?"
      },
      flash: {
        div_id: '_persist_flash_wrap',
        id: '_persist_flash',
        path: 'persist.swf',
        size: {
          w: 1,
          h: 1
        },
        args: {
          autostart: true
        }
      }
    };
    B = {
      gears: {
        size: -1,
        test: function() {
          try {
            return (window.google && window.google.gears) ? true : false;
          } catch (e) {
            return false;
          }

        },
        methods: {
          transaction: function(fn) {
            var db = this.db;
            db.execute('BEGIN').close();
            fn.call(this, db);
            db.execute('COMMIT').close();
          },
          init: function() {
            var db;
            db = this.db = google.gears.factory.create('beta.database');
            db.open(esc(this.name));
            db.execute(C.sql.create).close();
          },
          get: function(key, fn, scope) {
            var r, sql = C.sql.get;
            if (!fn)
              return;
            this.transaction(function(t) {
              var is_valid, val;
              r = t.execute(sql, [key]);
              is_valid = r.isValidRow();
              val = is_valid ? r.field(0) : null;
              r.close();
              fn.call(scope || this, is_valid, val);
            });
          },
          set: function(key, val, fn, scope) {
            var rm_sql = C.sql.remove,
              sql = C.sql.set,
              r;
            this.transaction(function(t) {
              t.execute(rm_sql, [key]).close();
              t.execute(sql, [key, val]).close();
              if (fn)
                fn.call(scope || this, true, val);
            });
          },
          remove: function(key, fn, scope) {
            var get_sql = C.sql.get;
            sql = C.sql.remove, r, val = null, is_valid = false;
            this.transaction(function(t) {
              if (fn) {
                r = t.execute(get_sql, [key]);
                is_valid = r.isValidRow();
                val = is_valid ? r.field(0) : null;
                r.close();
              }
              if (!fn || is_valid) {
                t.execute(sql, [key]).close();
              }
              if (fn)
                fn.call(scope || this, is_valid, val);
            });
          }
        }
      },
      whatwg_db: {
        size: 200 * 1024,
        test: function() {
          try {
            var name = 'PersistJS Test',
              desc = 'Persistent database test.';
            if (!window.openDatabase)
              return false;
            if (!window.openDatabase(name, C.sql.version, desc, B.whatwg_db.size))
              return false;
            return true;
          } catch (e) {
            return false;
          }

        },
        methods: {
          transaction: function(fn) {
            if (!this.db_created) {
              this.db.transaction(function(t) {
                t.executeSql(C.sql.create, [], function() {
                  this.db_created = true;
                });
              }, empty);
            }
            this.db.transaction(fn);
          },
          init: function() {
            this.db = openDatabase(this.name, C.sql.version, this.o.about || ("Persistent storage for " + this.name), this.o.size || B.whatwg_db.size);
          },
          get: function(key, fn, scope) {
            var sql = C.sql.get;
            if (!fn)
              return;
            scope = scope || this;
            this.transaction(function(t) {
              t.executeSql(sql, [key], function(t, r) {
                if (r.rows.length > 0)
                  fn.call(scope, true, r.rows.item(0)['v']);
                else
                  fn.call(scope, false, null);
              });
            });
          },
          set: function(key, val, fn, scope) {
            var rm_sql = C.sql.remove,
              sql = C.sql.set;
            this.transaction(function(t) {
              t.executeSql(rm_sql, [key], function() {
                t.executeSql(sql, [key, val], function(t, r) {
                  if (fn)
                    fn.call(scope || this, true, val);
                });
              });
            });
            return val;
          },
          remove: function(key, fn, scope) {
            var get_sql = C.sql.get;
            sql = C.sql.remove;
            this.transaction(function(t) {
              if (fn) {
                t.executeSql(get_sql, [key], function(t, r) {
                  if (r.rows.length > 0) {
                    var val = r.rows.item(0)['v'];
                    t.executeSql(sql, [key], function(t, r) {
                      fn.call(scope || this, true, val);
                    });
                  } else {
                    fn.call(scope || this, false, null);
                  }
                });
              } else {
                t.executeSql(sql, [key]);
              }
            });
          }
        }
      },
      globalstorage: {
        size: 5 * 1024 * 1024,
        test: function() {
          try {
            return window.globalStorage ? true : false;
          } catch (e) {
            return false;
          }
        },
        methods: {
          key: function(key) {
            return esc(this.name) + esc(key);
          },
          init: function() {
            alert('domain = ' + this.o.domain);
            this.store = globalStorage[this.o.domain];
          },
          get: function(key, fn, scope) {
            key = this.key(key);
            if (fn)
              fn.call(scope || this, true, this.store.getItem(key));
          },
          set: function(key, val, fn, scope) {
            key = this.key(key);
            this.store.setItem(key, val);
            if (fn)
              fn.call(scope || this, true, val);
          },
          remove: function(key, fn, scope) {
            var val;
            key = this.key(key);
            val = this.store[key];
            this.store.removeItem(key);
            if (fn)
              fn.call(scope || this, (val !== null), val);
          }
        }
      },
      localstorage: {
        size: -1,
        test: function() {
          try {
            return window.localStorage ? true : false;
          } catch (e) {
            return false;
          }

        },
        methods: {
          key: function(key) {
            return esc(this.name) + esc(key);
          },
          init: function() {
            this.store = localStorage;
          },
          get: function(key, fn, scope) {
            key = this.key(key);
            if (fn)
              fn.call(scope || this, true, this.store.getItem(key));
          },
          set: function(key, val, fn, scope) {
            key = this.key(key);
            this.store.setItem(key, val);
            if (fn)
              fn.call(scope || this, true, val);
          },
          remove: function(key, fn, scope) {
            var val;
            key = this.key(key);
            val = this.store.getItem(key);
            this.store.removeItem(key);
            if (fn)
              fn.call(scope || this, (val !== null), val);
          }
        }
      },
      ie: {
        prefix: '_persist_data-',
        size: 64 * 1024,
        test: function() {
          try {
            return window.ActiveXObject ? true : false;
          } catch (e) {
            return false;
          }

        },
        make_userdata: function(id) {
          var el = document.createElement('div');
          el.id = id;
          el.style.display = 'none';
          el.addBehavior('#default#userdata');
          document.body.appendChild(el);
          return el;
        },
        methods: {
          init: function() {
            var id = B.ie.prefix + esc(this.name);
            this.el = B.ie.make_userdata(id);
            if (this.o.defer)
              this.load();
          },
          get: function(key, fn, scope) {
            var val;
            key = esc(key);
            if (!this.o.defer)
              this.load();
            val = this.el.getAttribute(key);
            if (fn)
              fn.call(scope || this, val ? true : false, val);
          },
          set: function(key, val, fn, scope) {
            key = esc(key);
            this.el.setAttribute(key, val);
            if (!this.o.defer)
              this.save();
            if (fn)
              fn.call(scope || this, true, val);
          },
          remove: function(key, fn, scope) {
            var val;
            key = esc(key);
            if (!this.o.defer)
              this.load();
            val = this.el.getAttribute(key);
            this.el.removeAttribute(key);
            if (!this.o.defer)
              this.save();
            if (fn)
              fn.call(scope || this, val ? true : false, val);
          },
          load: function() {
            this.el.load(esc(this.name));
          },
          save: function() {
            this.el.save(esc(this.name));
          }
        }
      },
      cookie: {
        delim: ':',
        size: 4000,
        test: function() {
          try {
            return P.Cookie.enabled ? true : false;
          } catch (e) {
            return false;
          }

        },
        methods: {
          key: function(key) {
            return this.name + B.cookie.delim + key;
          },
          get: function(key, fn, scope) {
            var val;
            key = this.key(key);
            val = ec.get(key);
            if (fn)
              fn.call(scope || this, val != null, val);
          },
          set: function(key, val, fn, scope) {
            key = this.key(key);
            ec.set(key, val, this.o);
            if (fn)
              fn.call(scope || this, true, val);
          },
          remove: function(key, val, fn, scope) {
            var val;
            key = this.key(key);
            val = ec.remove(key)
            if (fn)
              fn.call(scope || this, val != null, val);
          }
        }
      },
      flash: {
        test: function() {
          try {
            if (!deconcept || !deconcept.SWFObjectUtil)
              return false;
            var major = deconcept.SWFObjectUtil.getPlayerVersion().major;
            return (major >= 8) ? true : false;
          } catch (e) {
            return false;
          }

        },
        methods: {
          init: function() {
            if (!B.flash.el) {
              var o, key, el, cfg = C.flash;
              el = document.createElement('div');
              el.id = cfg.div_id;
              document.body.appendChild(el);
              o = new deconcept.SWFObject(this.o.swf_path || cfg.path, cfg.id, cfg.size.w, cfg.size.h, '8');
              for (key in cfg.args)
                o.addVariable(key, cfg.args[key]);
              o.write(el);
              B.flash.el = document.getElementById(cfg.id);
            }
            this.el = B.flash.el;
          },
          get: function(key, fn, scope) {
            var val;
            key = esc(key);
            val = this.el.get(this.name, key);
            if (fn)
              fn.call(scope || this, val !== null, val);
          },
          set: function(key, val, fn, scope) {
            var old_val;
            key = esc(key);
            old_val = this.el.set(this.name, key, val);
            if (fn)
              fn.call(scope || this, true, val);
          },
          remove: function(key, fn, scope) {
            var val;
            key = esc(key);
            val = this.el.remove(this.name, key);
            if (fn)
              fn.call(scope || this, true, val);
          }
        }
      }
    };
    var init = function() {
      var i, l, b, key, fns = C.methods,
        keys = C.search_order;
      for (i = 0, l = fns.length; i < l; i++)
        P.Store.prototype[fns[i]] = empty;
      P.type = null;
      P.size = -1;
      for (i = 0, l = keys.length; !P.type && i < l; i++) {
        b = B[keys[i]];
        if (b.test()) {
          P.type = keys[i];
          P.size = b.size;
          for (key in b.methods)
            P.Store.prototype[key] = b.methods[key];
        }
      }
      P._init = true;
    };
    P = {
      VERSION: VERSION,
      type: null,
      size: 0,
      add: function(o) {
        B[o.id] = o;
        C.search_order = [o.id].concat(C.search_order);
        init();
      },
      remove: function(id) {
        var ofs = index_of(C.search_order, id);
        if (ofs < 0)
          return;
        C.search_order.splice(ofs, 1);
        delete B[id];
        init();
      },
      Cookie: ec,
      Store: function(name, o) {
        if (!C.name_re.exec(name))
          throw new Error("Invalid name");
        if (!P.type)
          throw new Error("No suitable storage found");
        o = o || {};
        this.name = name;
        o.domain = o.domain || location.host || 'localhost';
        o.domain = o.domain.replace(/:\d+$/, '')
        this.o = o;
        o.expires = o.expires || 365 * 2;
        o.path = o.path || '/';
        this.init();
      }
    };
    init();
    return P;
  })();
  //persist-min end

  //swfobject-min start

  if (typeof deconcept == "undefined") var deconcept = new Object();
  if (typeof deconcept.util == "undefined") deconcept.util = new Object();
  if (typeof deconcept.SWFObjectUtil == "undefined") deconcept.SWFObjectUtil = new Object();
  deconcept.SWFObject = function(swf, id, w, h, ver, c, quality, xiRedirectUrl, redirectUrl, detectKey) {
    if (!document.getElementById) {
      return;
    }
    this.DETECT_KEY = detectKey ? detectKey : 'detectflash';
    this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
    this.params = new Object();
    this.variables = new Object();
    this.attributes = new Array();
    if (swf) {
      this.setAttribute('swf', swf);
    }
    if (id) {
      this.setAttribute('id', id);
    }
    if (w) {
      this.setAttribute('width', w);
    }
    if (h) {
      this.setAttribute('height', h);
    }
    if (ver) {
      this.setAttribute('version', new deconcept.PlayerVersion(ver.toString().split(".")));
    }
    this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion();
    if (!window.opera && document.all && this.installedVer.major > 7) {
      deconcept.SWFObject.doPrepUnload = true;
    }
    if (c) {
      this.addParam('bgcolor', c);
    }
    var q = quality ? quality : 'high';
    this.addParam('quality', q);
    this.setAttribute('useExpressInstall', false);
    this.setAttribute('doExpressInstall', false);
    var xir = (xiRedirectUrl) ? xiRedirectUrl : window.location;
    this.setAttribute('xiRedirectUrl', xir);
    this.setAttribute('redirectUrl', '');
    if (redirectUrl) {
      this.setAttribute('redirectUrl', redirectUrl);
    }
  }
  deconcept.SWFObject.prototype = {
    useExpressInstall: function(path) {
      this.xiSWFPath = !path ? "expressinstall.swf" : path;
      this.setAttribute('useExpressInstall', true);
    },
    setAttribute: function(name, value) {
      this.attributes[name] = value;
    },
    getAttribute: function(name) {
      return this.attributes[name];
    },
    addParam: function(name, value) {
      this.params[name] = value;
    },
    getParams: function() {
      return this.params;
    },
    addVariable: function(name, value) {
      this.variables[name] = value;
    },
    getVariable: function(name) {
      return this.variables[name];
    },
    getVariables: function() {
      return this.variables;
    },
    getVariablePairs: function() {
      var variablePairs = new Array();
      var key;
      var variables = this.getVariables();
      for (key in variables) {
        variablePairs.push(key + "=" + variables[key]);
      }
      return variablePairs;
    },
    getSWFHTML: function() {
      var swfNode = "";
      if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
        if (this.getAttribute("doExpressInstall")) {
          this.addVariable("MMplayerType", "PlugIn");
          this.setAttribute('swf', this.xiSWFPath);
        }
        swfNode = '<embed type="application/x-shockwave-flash" src="' + this.getAttribute('swf') + '" width="' + this.getAttribute('width') + '" height="' + this.getAttribute('height') + '"';
        swfNode += ' id="' + this.getAttribute('id') + '" name="' + this.getAttribute('id') + '" ';
        var params = this.getParams();
        for (var key in params) {
          swfNode += [key] + '="' + params[key] + '" ';
        }
        var pairs = this.getVariablePairs().join("&");
        if (pairs.length > 0) {
          swfNode += 'flashvars="' + pairs + '"';
        }
        swfNode += '/>';
      } else {
        if (this.getAttribute("doExpressInstall")) {
          this.addVariable("MMplayerType", "ActiveX");
          this.setAttribute('swf', this.xiSWFPath);
        }
        swfNode = '<object id="' + this.getAttribute('id') + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + this.getAttribute('width') + '" height="' + this.getAttribute('height') + '">';
        swfNode += '<param name="movie" value="' + this.getAttribute('swf') + '" />';
        var params = this.getParams();
        for (var key in params) {
          swfNode += '<param name="' + key + '" value="' + params[key] + '" />';
        }
        var pairs = this.getVariablePairs().join("&");
        if (pairs.length > 0) {
          swfNode += '<param name="flashvars" value="' + pairs + '" />';
        }
        swfNode += "</object>";
      }
      return swfNode;
    },
    write: function(elementId) {
      if (this.getAttribute('useExpressInstall')) {
        var expressInstallReqVer = new deconcept.PlayerVersion([6, 0, 65]);
        if (this.installedVer.versionIsValid(expressInstallReqVer) && !this.installedVer.versionIsValid(this.getAttribute('version'))) {
          this.setAttribute('doExpressInstall', true);
          this.addVariable("MMredirectURL", escape(this.getAttribute('xiRedirectUrl')));
          document.title = document.title.slice(0, 47) + " - Flash Player Installation";
          this.addVariable("MMdoctitle", document.title);
        }
      }
      if (this.skipDetect || this.getAttribute('doExpressInstall') || this.installedVer.versionIsValid(this.getAttribute('version'))) {
        var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
        n.innerHTML = this.getSWFHTML();
        return true;
      } else {
        if (this.getAttribute('redirectUrl') != "") {
          document.location.replace(this.getAttribute('redirectUrl'));
        }
      }
      return false;
    }
  }
  deconcept.SWFObjectUtil.getPlayerVersion = function() {
    var PlayerVersion = new deconcept.PlayerVersion([0, 0, 0]);
    if (navigator.plugins && navigator.mimeTypes.length) {
      var x = navigator.plugins["Shockwave Flash"];
      if (x && x.description) {
        PlayerVersion = new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
      }
    } else {
      try {
        var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
      } catch (e) {
        try {
          var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
          PlayerVersion = new deconcept.PlayerVersion([6, 0, 21]);
          axo.AllowScriptAccess = "always";
        } catch (e) {
          if (PlayerVersion.major == 6) {
            return PlayerVersion;
          }
        }
        try {
          axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        } catch (e) {}
      }
      if (axo != null) {
        PlayerVersion = new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
      }
    }
    return PlayerVersion;
  }
  deconcept.PlayerVersion = function(arrVersion) {
    this.major = arrVersion[0] != null ? parseInt(arrVersion[0]) : 0;
    this.minor = arrVersion[1] != null ? parseInt(arrVersion[1]) : 0;
    this.rev = arrVersion[2] != null ? parseInt(arrVersion[2]) : 0;
  }
  deconcept.PlayerVersion.prototype.versionIsValid = function(fv) {
    if (this.major < fv.major) return false;
    if (this.major > fv.major) return true;
    if (this.minor < fv.minor) return false;
    if (this.minor > fv.minor) return true;
    if (this.rev < fv.rev) return false;
    return true;
  }
  deconcept.util = {
    getRequestParameter: function(param) {
      var q = document.location.search || document.location.hash;
      if (q) {
        var pairs = q.substring(1).split("&");
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
            return pairs[i].substring((pairs[i].indexOf("=") + 1));
          }
        }
      }
      return "";
    }
  }
  deconcept.SWFObjectUtil.cleanupSWFs = function() {
    var objects = document.getElementsByTagName("OBJECT");
    for (var i = 0; i < objects.length; i++) {
      objects[i].style.display = 'none';
      for (var x in objects[i]) {
        if (typeof objects[i][x] == 'function') {
          objects[i][x] = function() {};
        }
      }
    }
  }
  if (deconcept.SWFObject.doPrepUnload) {
    deconcept.SWFObjectUtil.prepUnload = function() {
      __flash_unloadHandler = function() {};
      __flash_savedUnloadHandler = function() {};
      window.attachEvent("onunload", deconcept.SWFObjectUtil.cleanupSWFs);
    }
    window.attachEvent("onbeforeunload", deconcept.SWFObjectUtil.prepUnload);
  }
  if (Array.prototype.push == null) {
    Array.prototype.push = function(item) {
      this[this.length] = item;
      return this.length;
    }
  }
  var getQueryParamValue = deconcept.util.getRequestParameter;
  var FlashObject = deconcept.SWFObject;
  var SWFObject = deconcept.SWFObject;
  //swfobject-min end

  //!!!lib end!!!

  var $fh = root.$fh || {};
  if (typeof fh_app_props === "object") {
    $fh.app_props = fh_app_props;
  }

  $fh.legacy = {};

  var defaultargs = {
    success: function() {},
    failure: function() {},
    params: {}
  };

  var handleargs = function(inargs, defaultparams, applyto) {
    var outargs = [null, null, null];
    var origargs = [null, null, null];
    var numargs = inargs.length;

    if (2 < numargs) {
      origargs[0] = inargs[numargs - 3];
      origargs[1] = inargs[numargs - 2];
      origargs[2] = inargs[numargs - 1];
    } else if (2 == numargs) {
      origargs[1] = inargs[0];
      origargs[2] = inargs[1];
    } else if (1 == numargs) {
      origargs[2] = inargs[0];
    }

    var i = 0,
      j = 0;
    for (; i < 3; i++) {
      var a = origargs[i];
      var ta = typeof a;
      //console.log('iter i:'+i+' j:'+j+' ta:'+ta);
      if (a && 0 == j && ('object' == ta || 'boolean' == ta)) {
        //console.log('object i:'+i+' j:'+j+' ta:'+ta);
        outargs[j++] = a;
      } else if (a && 'function' == ta) {
        j = 0 == j ? 1 : j;
        //console.log('function i:'+i+' j:'+j+' ta:'+ta);
        outargs[j++] = a;
      }
    }

    if (null == outargs[0]) {
      outargs[0] = defaultparams ? defaultparams : defaultargs.params;
    } else {
      var paramsarg = outargs[0];
      paramsarg._defaults = [];
      for (var n in defaultparams) {
        if (defaultparams.hasOwnProperty(n)) {
          if (typeof paramsarg[n] === "undefined") { //we don't want to use !paramsarg[n] here because the parameter could exists in the argument and it could be false
            paramsarg[n] = defaultparams[n];
            paramsarg._defaults.push(n);
          }
        }
      }
    }

    outargs[1] = null == outargs[1] ? defaultargs.success : outargs[1];
    outargs[2] = null == outargs[2] ? defaultargs.failure : outargs[2];

    applyto(outargs[0], outargs[1], outargs[2]);
  }

  var eventSupported = function(event) {
    var element = document.createElement('i');
    return event in element || element.setAttribute && element.setAttribute(event, "return;") || false;
  }

  var __is_ready = false;
  var __ready_list = [];
  var __ready_bound = false;
  var boxprefix = "/box/srv/1.1/";

  _getHostPrefix = function() {
    return $fh.app_props.host + boxprefix;
  }

  var __ready = function() {
    if (!__is_ready) {
      __is_ready = true;
      if (__ready_list) {
        try {
          while (__ready_list[0]) {
            __ready_list.shift().apply(document, []);
          }

        } finally {

        }
        __ready_list = null;
      }
    }
  };

  var __bind_ready = function() {
    if (__ready_bound) return;
    __ready_bound = true;

    // Mozilla, Opera and webkit nightlies currently support this event
    if (document.addEventListener) {
      // Use the handy event callback
      document.addEventListener("DOMContentLoaded", function() {
        document.removeEventListener("DOMContentLoaded", arguments.callee, false);
        __ready();
      }, false);

      window.addEventListener("load", __ready, false);

      // If IE event model is used
    } else if (document.attachEvent) {
      // ensure firing before onload,
      // maybe late but safe also for iframes
      document.attachEvent("onreadystatechange", function() {
        if (document.readyState === "complete") {
          document.detachEvent("onreadystatechange", arguments.callee);
          __ready();
        }
      });

      window.attachEvent("onload", __ready);

      // If IE and not an iframe
      // continually check to see if the document is ready
      if (document.documentElement.doScroll && window == window.top)(function() {
        if (__is_ready) return;

        try {
          // If IE is used, use the trick by Diego Perini
          // http://javascript.nwbox.com/IEContentLoaded/
          document.documentElement.doScroll("left");
        } catch (error) {
          setTimeout(arguments.callee, 0);
          return;
        }

        // and execute any waiting functions
        __ready();
      })();
    }
  };

  __bind_ready();

  // destination functions
  var _mapScriptLoaded = (typeof google != "undefined") && (typeof google.maps != "undefined") && (typeof google.maps.Map != "undefined");
  //Contains the target element and success function for $fh.map functions
  var _mapLoadSuccessParameters = [];
  //Flag to show if a map script is loading or not.
  var _mapScriptLoading = false; 
  var _loadMapScript = function() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    var protocol = document.location.protocol;
    protocol = (protocol === "http:" || protocol === "https:") ? protocol : "https:";
    script.src = protocol + "//maps.google.com/maps/api/js?sensor=true&callback=$fh._mapLoaded";
    document.body.appendChild(script);
  };

  var audio_obj = null;
  var audio_is_playing = false;

  $fh.__dest__ = {
    send: function(p, s, f) {
      f('send_nosupport');
    },
    notify: function(p, s, f) {
      f('notify_nosupport');
    },
    contacts: function(p, s, f) {
      f('contacts_nosupport');
    },
    acc: function(p, s, f) {
      f('acc_nosupport');
    },
    geo: function(p, s, f) {
      f('geo_nosupport');
    },
    cam: function(p, s, f) {
      f('cam_nosupport');
    },
    device: function(p, s, f) {
      f('device_nosupport');
    },
    listen: function(p, s, f) {
      f('listen_nosupport');
    },
    handlers: function(p, s, f) {
      f('handlers_no_support');
    },
    file: function(p, s, f) {
      f('file_nosupport');
    },
    env: function(p, s, f) {
      s({
        height: window.innerHeight,
        width: window.innerWidth
      });
    }

    ,
    data: function(p, s, f) {
      if (!$fh._persist) {
        $fh._persist = new Persist.Store('FH' + $fh.app_props.appid, {
          swf_path: '/static/c/start/swf/persist.swf'
        });
      }

      if (!p.key) {
        f('data_nokey');
        return;
      }

      var acts = {
        load: function() {
          $fh._persist.get(p.key, function(ok, val) {
            ok ? s({
              key: p.key,
              val: val
            }) : s({
              key: p.key,
              val: null
            });
          });
        },
        save: function() {
          if (!p.val) {
            f('data_noval');
            return;
          }
          try {
            $fh._persist.set(p.key, p.val);
          } catch (e) {
            f('data_error', {}, p);
            return;
          }
          s();
        },
        remove: function() {
          $fh._persist.remove(p.key, function(ok, val) {
            ok ? s({
              key: p.key,
              val: val
            }) : s({
              key: p.key,
              val: null
            });
          });
        }
      };

      acts[p.act] ? acts[p.act]() : f('data_badact', p);
    }

    ,
    log: function(p, s, f) {
      typeof console === "undefined" ? f('log_nosupport') : console.log(p.message);
    }

    ,
    ori: function(p, s, f) {
      if (typeof p.act == "undefined" || p.act == "listen") {
        if (eventSupported('onorientationchange')) {
          window.addEventListener('orientationchange', s, false);
        } else {
          f('ori_nosupport', {}, p);
        }
      } else if (p.act == "set") {
        if (!p.value) {
          f('ori_no_value', {}, p);
          return;
        }
        if (p.value == "portrait") {
          document.getElementsByTagName("body")[0].style['-moz-transform'] = "";
          document.getElementsByTagName("body")[0].style['-webkit-transform'] = "";
          s({
            orientation: 'portrait'
          });
        } else {
          document.getElementsByTagName("body")[0].style['-moz-transform'] = 'rotate(90deg)';
          document.getElementsByTagName("body")[0].style['-webkit-transform'] = 'rotate(90deg)';
          s({
            orientation: 'landscape'
          });
        }
      } else {
        f('ori_badact', {}, p);
      }
    },
    map: function(p, s, f) {
      if (!p.target) {
        f('map_notarget', {}, p);
        return;
      }
      if (!p.lat) {
        f('map_nolatitude', {}, p);
        return;
      }
      if (!p.lon) {
        f('map_nologitude', {}, p);
        return;
      }
      var target = p.target;
      if (typeof target === "string") {
        var target_dom = null;
        if (typeof jQuery != "undefined") {
          try {
            var jq_obj = jQuery(target);
            if (jq_obj.length > 0) {
              target_dom = jq_obj[0];
            }
          } catch (e) {
            target_dom = null;
          }
        }
        if (null == target_dom) {
          target_dom = document.getElementById(target);
        }
        target = target_dom;
      } else if (typeof target === "object") {
        if (target.nodeType === 1 && typeof target.nodeName === "string") {
          // A DOM Element, do nothing
        } else {
          //A jQuery node
          target = target[0];
        }
      } else {
        target = null;
      }

      if (!target) {
        f('map_nocontainer', {}, p);
        return;
      }




      if (!_mapScriptLoaded) {

        //Queue the success function
        if(typeof(s) === 'function'){
            _mapLoadSuccessParameters.push({target: target, successFunction: s, mOptions: p});    
        }
        

        $fh._mapLoaded = function() {
          _mapScriptLoaded = true;
          var mapLoadSuccessParameter = _mapLoadSuccessParameters.shift();

          while(typeof(mapLoadSuccessParameter) !== 'undefined'){
            var mOptions = mapLoadSuccessParameter.mOptions;
            var mapOptions = {};
            mapOptions.zoom = mOptions.zoom ? mOptions.zoom : 8;
            mapOptions.center = new google.maps.LatLng(mOptions.lat, mOptions.lon);
            mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;

            var map = new google.maps.Map(mapLoadSuccessParameter.target, mapOptions);
            mapLoadSuccessParameter.successFunction({map: map});  
            mapLoadSuccessParameter = _mapLoadSuccessParameters.shift();
          }
        };

        if(!_mapScriptLoading){
            _mapScriptLoading = true;
            _loadMapScript();    
        }
        
        //after 20 secs, if the map script is still not loaded, run the fail function
        setTimeout(function() {
          if (!_mapScriptLoaded) {
            f('map_timeout', {}, p);
          }
        }, 20000);
      } else {
        var mapOptions = {};
        mapOptions.zoom = p.zoom ? p.zoom : 8;
        mapOptions.center = new google.maps.LatLng(p.lat, p.lon);
        mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
        var map = new google.maps.Map(target, mapOptions);
        s({
          map: map
        });
      }
    }

    ,
    audio: function(p, s, f) {
      if (!audio_obj == null && p.act == "play" && (!p.path || p.path == "")) {
        f('no_audio_path');
        return;
      }
      var acts = {
        'play': function() {
          if (null == audio_obj) {
            audio_obj = document.createElement("audio");
            if (!((audio_obj.play) ? true : false)) {
              f('audio_not_support');
              return;
            }
            if (p.type) {
              var canplay = audio_obj.canPlayType(p.type);
              if (canplay == "no" || canplay == "") {
                f("audio_type_not_supported");
                return;
              }
            }
            audio_obj.src = p.path;
            if (p.controls) {
              audio_obj.controls = "controls";
            }
            if (p.autoplay) {
              audio_obj.autoplay = "autoplay";
            }
            if (p.loop) {
              audio_obj.loop = "loop";
            }
            document.body.appendChild(audio_obj);
            audio_obj.play();
            audio_is_playing = true;
            s();
          } else {
            //playing a new audio
            if (p.path && (p.path != audio_obj.src)) {
              if (audio_is_playing) {
                acts['stop'](true);
              }
              acts['play']();
            } else {
              //resume the existing audio
              if (!audio_is_playing) {
                audio_obj.play();
                audio_is_playing = true;
                s();
              }
            }
          }
        },

        'pause': function() {
          if (null != audio_obj && audio_is_playing) {
            if (typeof audio_obj.pause == "function") {
              audio_obj.pause();
            } else if (typeof audio_obj.stop == "function") {
              audio_obj.stop();
            }
            audio_is_playing = false;
            s();
          } else {
            f('no_audio_playing');
          }
        },

        'stop': function(nocallback) {
          if (null != audio_obj) {
            if (typeof audio_obj.stop == "function") {
              audio_obj.stop();
            } else if (typeof audio_obj.pause == "function") {
              audio_obj.pause();
            }
            document.body.removeChild(audio_obj);
            audio_obj = null;
            audio_is_playing = false;
            if (!nocallback) {
              s();
            }
          } else {
            f('no_audio');
          }
        }
      }

      acts[p.act] ? acts[p.act]() : f('data_badact', p);
    }

    ,
    webview: function(p, s, f) {
      f('webview_nosupport');
    },

    ready: function(p, s, f) {
      __bind_ready();
      if (__is_ready) {
        s.apply(document, []);
      } else {
        __ready_list.push(s);
      }
    }
  }

  $fh.send = function() {
    handleargs(arguments, {
      type: 'email'
    }, $fh.__dest__.send);
  }

  $fh.notify = function() {
    handleargs(arguments, {
      type: 'vibrate'
    }, $fh.__dest__.notify);
  }

  $fh.contacts = function() {
    handleargs(arguments, {
      act: 'list'
    }, $fh.__dest__.contacts);
  }

  $fh.acc = function() {
    handleargs(arguments, {
      act: 'register',
      interval: 0
    }, $fh.__dest__.acc);
  }

  $fh.geo = function() {
    handleargs(arguments, {
      act: 'register',
      interval: 0
    }, $fh.__dest__.geo);
  }

  $fh.cam = function() {
    handleargs(arguments, {
      act: 'picture'
    }, $fh.__dest__.cam);
  }

  $fh.data = function() {
    handleargs(arguments, {
      act: 'load'
    }, $fh.__dest__.data);
  }

  $fh.log = function() {
    handleargs(arguments, {
      message: 'none'
    }, $fh.__dest__.log);
  }

  $fh.device = function() {
    handleargs(arguments, {}, $fh.__dest__.device);
  }

  $fh.listen = function() {
    handleargs(arguments, {
      act: 'add'
    }, $fh.__dest__.listen);
  }

  $fh.ori = function() {
    handleargs(arguments, {}, $fh.__dest__.ori);
  }

  $fh.map = function() {
    handleargs(arguments, {}, $fh.__dest__.map);
  }

  $fh.audio = function() {
    handleargs(arguments, {}, $fh.__dest__.audio);
  }

  $fh.webview = function() {
    handleargs(arguments, {}, $fh.__dest__.webview);
  }

  $fh.ready = function() {
    handleargs(arguments, {}, $fh.__dest__.ready);
  };

  $fh.handlers = function() {
    handleargs(arguments, {
      type: 'back'
    }, $fh.__dest__.handlers);
  };

  $fh.file = function() {
    handleargs(arguments, {
      act: 'upload'
    }, $fh.__dest__.file);
  };

  // new functions
  $fh.env = function() {
    handleargs(arguments, {}, function(p, s, f) {
      // flat property set - no sub objects!
      $fh.__dest__.env({}, function(destEnv) {
        destEnv.application = $fh.app_props.appid;
        if ($fh._getDeviceId) {
          destEnv.uuid = $fh._getDeviceId();
        }
        destEnv.agent = navigator.userAgent || 'unknown';
        s(destEnv);
      });
    });
  }

  $fh.device = function() {
    handleargs(arguments, {}, function(p, s, f) {

    });
  }


  // defaults: 
  //    {act:'get'} -> {geoip:{...}}
  //  failures: geoip_badact
  //
  $fh.geoip = function() {
    handleargs(arguments, {
      act: 'get'
    }, function(p, s, f) {
      if ('get' == p.act) {
        var data = {
          instance: $fh.app_props.appid,
          domain: $fh.cloud_props.domain
        }
        $fh.__ajax({
          "url": _getHostPrefix() + "act/wid/geoip/resolve",
          "type": "POST",
          "data": JSON.stringify(data),
          "success": function(res) {
            // backwards compat
            for (var n in res.geoip) {
              res[n] = res['geoip'][n];
            }
            s(res);
          }
        });
      } else {
        f('geoip_badact', p);
      }
    });
  };

  $fh.web = function(p, s, f) {
    handleargs(arguments, {
      method: 'GET'
    }, function(p, s, f) {
      if (!p.url) {
        f('bad_url');
      }

      if (p.is_local) {
        $fh.__ajax({
          url: p.url,
          type: "GET",
          dataType: "html",
          //xhr: $fh.xhr,
          success: function(data) {
            var res = {};
            res.status = 200;
            res.body = data;
            s(res);
          },
          error: function() {
            f();
          }
        })
      } else {
        $fh.__ajax({
          "url": _getHostPrefix() + "act/wid/web",
          "type": "POST",
          "data": JSON.stringify(p),
          "success": function(res) {
            s(res);
          }
        });
      }
    });
  };

  $fh.__webview_win = undefined;
  $fh.__dest__.webview = function(p, s, f) {
    if (!('act' in p) || p.act === 'open') {
      if (!p.url) {
        f('no_url');
        return;
      }
      var old_url = p.url;
      $fh.__webview_win = window.open(p.url, '_blank');
      s("opened");
    } else {
      if (p.act === 'close') {
        if (typeof $fh.__webview_win != 'undefined') {
          $fh.__webview_win.close();
          $fh.__webview_win = undefined;
        }
        s("closed");
      }
    }
  };

  if (typeof(window.PhoneGap) !== 'undefined' || typeof(window.cordova) !== 'undefined') {
    $fh._readyCallbacks = [];
    $fh._readyState = false;
    $fh.__dest__.ready = function(p, s, f) {
      if ($fh._readyState) {
        try {
          s();
        } catch (e) {
          console.log("Error during $fh.ready. Skip. Error = " + e.message);
        }
      } else {
        $fh._readyCallbacks.push(s);
      }
    };
  }

  $fh.__dest__.geo = function(p, s, f) {
    if (typeof navigator.geolocation != 'undefined') {
      if (!p.act || p.act == "register") {
        if ($fh.__dest__._geoWatcher) {
          f('geo_inuse', {}, p);
          return;
        }
        if (p.interval == 0) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var coords = position.coords;
            var resdata = {
              lon: coords.longitude,
              lat: coords.latitude,
              alt: coords.altitude,
              acc: coords.accuracy,
              head: coords.heading,
              speed: coords.speed,
              when: position.timestamp
            };
            s(resdata);
          }, function() {
            f('error_geo', {}, p);
          })
        };
        if (p.interval > 0) {
          var internalWatcher = navigator.geolocation.watchPosition(function(position) {
            var coords = position.coords;
            var resdata = {
              lon: coords.longitude,
              lat: coords.latitude,
              alt: coords.altitude,
              acc: coords.accuracy,
              head: coords.heading,
              speed: coords.speed,
              when: position.timestamp
            };
            s(resdata);
          }, function() {
            f('error_geo', {}, p);
          }, {
            frequency: p.interval
          });
          $fh.__dest__._geoWatcher = internalWatcher;
        };
      } else if (p.act == "unregister") {
        if ($fh.__dest__._geoWatcher) {
          navigator.geolocation.clearWatch($fh.__dest__._geoWatcher);
          $fh.__dest__._geoWatcher = undefined;
        };
        s();
      } else {
        f('geo_badact', {}, p);
      }
    } else {
      f('geo_nosupport', {}, p);
    }
  };

  $fh.__dest__.acc = function(p, s, f) {
    s({
      x: (Math.random() * 4) - 2,
      y: (Math.random() * 4) - 2,
      z: (Math.random() * 4) - 2,
      when: new Date().getTime()
    });
  }

  root.$fh = $fh;

})(this);

/**
 * FeedHenry License
 */

//if (typeof window =="undefined"){
//    var window={};
//}
//this is a partial js file which defines the start of appform SDK closure
(function(_scope){
    //start module

var appForm = function(module) {
  module.init = init;

  function init(params, cb) {
    var def = {
      'updateForms': true
    };
    if (typeof cb === 'undefined') {
      cb = params;
    } else {
      for (var key in params) {
        def[key] = params[key];
      }
    }


    //init config module
    var config = def.config || {};
    appForm.config = appForm.models.config;
    appForm.config.init(config, function(err) {
      if (err) {
        $fh.forms.log.e("Form config loading error: ", err);
      }
      appForm.models.log.loadLocal(function(err) {
        if(err){
          console.error("Error loading config from local storage");
        }

        appForm.models.submissions.loadLocal(function(err){
          if(err){
            console.error("Error loading submissions");
          }

          //Loading the current state of the uploadManager for any upload tasks that are still in progress.
          appForm.models.uploadManager.loadLocal(function(err) {
            $fh.forms.log.d("Upload Manager loaded from memory.");
            if (err) {
              $fh.forms.log.e("Error loading upload manager from memory ", err);
            }

            //Starting any uploads that are queued
            appForm.models.uploadManager.start();
            //init forms module
            $fh.forms.log.l("Refreshing Theme.");
            appForm.models.theme.refresh(true, function(err) {
              if (err) {
                $fh.forms.log.e("Error refreshing theme ", err);
              }
              if (def.updateForms === true) {
                $fh.forms.log.l("Refreshing Forms.");
                appForm.models.forms.refresh(true, function(err) {
                  if (err) {
                    $fh.forms.log.e("Error refreshing forms: ", err);
                  }
                  cb();
                });
              } else {
                cb();
              }
            });
          });
        });

      });
    });
  }
  return module;
}(appForm || {});
appForm.utils = function(module) {
  module.extend = extend;
  module.localId = localId;
  module.md5 = md5;
  module.getTime = getTime;
  module.send=send;
  module.isPhoneGap = isPhoneGap;
  module.generateGlobalEventName = function(type, eventName){
    return "" + type + ":" + eventName;
  };

  function isPhoneGap() {
    return (typeof window.Phonegap !== "undefined" || typeof window.cordova !== "undefined");
  }

  function extend(child, parent) {

    if (parent.constructor && parent.constructor === Function) {
      for (var mkey in parent.prototype) {
        child.prototype[mkey] = parent.prototype[mkey];
      }
    } else {
      for (var key in parent) {
        child.prototype[key] = parent[key];
      }
    }
  }

  function getTime(timezoneOffset) {
    var now = new Date();
    if (timezoneOffset) {
      return now.getTimezoneOffset();
    } else {
      return now;
    }
  }

  function localId(model) {
    var props = model.getProps();
    var _id = props._id;
    var _type = props._type;
    var ts = getTime().getTime();
    if (_id && _type) {
      return _id + '_' + _type + '_' + ts;
    } else if (_id) {
      return _id + '_' + ts;
    } else if (_type) {
      return _type + '_' + ts;
    } else {
      return ts;
    }
  }
  /**
   * md5 hash a string
   * @param  {[type]}   str [description]
   * @param  {Function} cb  (err,md5str)
   * @return {[type]}       [description]
   */
  function md5(str, cb) {
    if (typeof $fh !== 'undefined' && $fh.hash) {
      $fh.hash({
        algorithm: 'MD5',
        text: str
      }, function(result) {
        if (result && result.hashvalue) {
          cb(null, result.hashvalue);
        } else {
          cb('Crypto failed.');
        }
      });
    } else {
      cb('Crypto not found');
    }
  }

  function send(params,cb){
    $fh.forms.log.d("Sending mail: ", params);
    $fh.send(params,function(){
      cb(null);
    },function(msg){
      cb(msg);
    });
  }
  return module;
}(appForm.utils || {});

appForm.utils = function(module) {
    module.fileSystem = {
        isFileSystemAvailable: isFileSystemAvailable,
        save: save,
        remove: remove,
        readAsText: readAsText,
        readAsBlob: readAsBlob,
        readAsBase64Encoded: readAsBase64Encoded,
        readAsFile: readAsFile,
        fileToBase64: fileToBase64,
        getBasePath: getBasePath,
        clearFileSystem: clearFileSystem
    };
    var fileSystemAvailable = false;
    var _requestFileSystem = function() {
        console.error("No file system available");
    };
    //placeholder
    var PERSISTENT = 1;
    //placeholder
    function isFileSystemAvailable() {
        _checkEnv();
        return fileSystemAvailable;
    }
    //convert a file object to base64 encoded.
    function fileToBase64(file, cb) {
        if (!file instanceof File) {
            return cb('Only file object can be used for converting');
        }
        var fileReader = new FileReader();
        fileReader.onloadend = function(evt) {
            var text = evt.target.result;
            return cb(null, text);
        };
        fileReader.readAsDataURL(file);
    }

    function _createBlobOrString(contentstr) {
        var retVal;
        if (appForm.utils.isPhoneGap()) { // phonegap filewriter works with strings, later versions also ork with binary arrays, and if passed a blob will just convert to binary array anyway
            retVal = contentstr;
        } else {
            var targetContentType = 'text/plain';
            try {
                retVal = new Blob([contentstr], {
                    type: targetContentType
                }); // Blob doesn't exist on all androids
            } catch (e) {
                // TypeError old chrome and FF
                var blobBuilder = window.BlobBuilder ||
                    window.WebKitBlobBuilder ||
                    window.MozBlobBuilder ||
                    window.MSBlobBuilder;
                if (e.name === 'TypeError' && blobBuilder) {
                    var bb = new blobBuilder();
                    bb.append([contentstr.buffer]);
                    retVal = bb.getBlob(targetContentType);
                } else {
                    // We can't make a Blob, so just return the stringified content
                    retVal = contentstr;
                }
            }
        }
        return retVal;
    }


    function getBasePath(cb) {
        save("dummy.txt", "TestContnet", function(err, fileEntry) {
            if (err) {
                return cb(err);
            }

            _getFileEntry("dummy.txt",0, {}, function(err, fileEntry){
              var sPath = fileEntry.fullPath.replace("dummy.txt", "");
              fileEntry.remove();
              return cb(null, sPath);
            });
        });
    }

    function _getSaveObject(content){
      var saveObj = null;
      if (typeof content === 'object' && content !== null) {
        if (content instanceof File || content instanceof Blob) {
          //File object
          saveObj = content;
        } else {
          //JSON object
          var contentstr = JSON.stringify(content);
          saveObj = _createBlobOrString(contentstr);
        }
      } else if (typeof content === 'string') {
        saveObj = _createBlobOrString(content);
      }

      return saveObj;
    }

    /**
     * Save a content to file system into a file
     *
     * In the case where the content is a File and PhoneGap is available, the function will attempt to use the "copyTo" function instead of writing the file.
     * This is because windows phone does not allow writing binary files with PhoneGap.
     * @param  {[type]} fileName file name to be stored.
     * @param  {[type]} content  json object / string /  file object / blob object
     * @param  {[type]} cb  (err, result)
     * @return {[type]}          [description]
     */
    function save(fileName, content, cb) {
      var self = this;
      var saveObj = _getSaveObject(content);
      if(saveObj === null){
        return cb("Invalid content type. Object was null");
      }
      var size = saveObj.size || saveObj.length;

      _getFileEntry(fileName, size, {
          create: true
      }, function(err, fileEntry) {
          if (err) {
              cb(err);
          } else {
            if(appForm.utils.isPhoneGap() && saveObj instanceof File){
              //Writing binary files is not possible in windows phone.
              //So if the thing to save is a file, and it is in phonegap, use the copyTo functions instead.
              fileEntry.getParent(function(parentDir){
                //Get the file entry for the file input
                _resolveFile(saveObj.fullPath, function(err, fileToCopy){
                  if(err){
                    return cb(err);
                  }
                  fileName = fileEntry.name;

                  fileEntry.remove(function(){
                    fileToCopy.copyTo(parentDir, fileName, function(copiedFile){
                      return cb(null, copiedFile);
                    }, function(err){
                      return cb(err);
                    });
                  }, function(err){
                    return cb(err);
                  });
                }, function(err){
                  return cb(err);
                });
              }, function(err){
                return cb(err);
              });
            }  else {
              //Otherwise, just write text
              fileEntry.createWriter(function(writer) {
                function _onFinished(evt) {
                  return cb(null, evt);
                }

                function _onTruncated() {
                  writer.onwriteend = _onFinished;
                  writer.write(saveObj); //write method can take a blob or file object according to html5 standard.
                }
                writer.onwriteend = _onTruncated;
                //truncate the file first.
                writer.truncate(0);
              }, function(e) {
                cb('Failed to create file write:' + e);
              });
            }

          }
      });
    }
    /**
     * Remove a file from file system
     * @param  {[type]}   fileName file name of file to be removed
     * @param  {Function} cb
     * @return {[type]}            [description]
     */
    function remove(fileName, cb) {
        _getFileEntry(fileName, 0, {}, function(err, fileEntry) {
            if (err) {
                if (!(err.name === 'NotFoundError' || err.code === 1)) {
                    return cb(err);
                } else {
                    return cb(null, null);
                }
            }
            fileEntry.remove(function() {
                cb(null, null);
            }, function(e) {
                cb('Failed to remove file' + e);
            });
        });
    }


    /**
     * clearFileSystem - Clearing All Of The Files In the file system.
     *
     * @param  {type} cb       description
     * @return {type}          description
     */
    function clearFileSystem(cb){
      function gotFS(fileSystem) {
          var reader = fileSystem.root.createReader();
          reader.readEntries(gotList, cb);
      }

      function gotList(entries) {
          async.forEachSeries(entries, function(entry, cb){
            if(entry.isDirectory){
              entry.removeRecursively(cb, cb);
            } else {
              entry.remove(cb, cb);
            }
          }, cb);
      }

      _requestFileSystem(PERSISTENT, 0, gotFS, cb);
    }

    /**
     * Read a file as text
     * @param  {[type]}   fileName [description]
     * @param  {Function} cb       (err,text)
     * @return {[type]}            [description]
     */
    function readAsText(fileName, cb) {
        _getFile(fileName, function(err, file) {
            if (err) {
                cb(err);
            } else {
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    var text = evt.target.result;
                    if (typeof text === "object") {
                      text = JSON.stringify(text);
                    }
                    // Check for URLencoded
                    // PG 2.2 bug in readAsText()
                    try {
                        text = decodeURIComponent(text);
                    } catch (e) {

                    }
                    return cb(null, text);
                };
                reader.readAsText(file);
            }
        });
    }
    /**
     * Read a file and return base64 encoded data
     * @param  {[type]}   fileName [description]
     * @param  {Function} cb       (err,base64Encoded)
     * @return {[type]}            [description]
     */
    function readAsBase64Encoded(fileName, cb) {
        _getFile(fileName, function(err, file) {
            if (err) {
                return cb(err);
            }
            var reader = new FileReader();
            reader.onloadend = function(evt) {
                var text = evt.target.result;
                return cb(null, text);
            };
            reader.readAsDataURL(file);
        });
    }
    /**
     * Read a file return blob object (which can be used for XHR uploading binary)
     * @param  {[type]}   fileName [description]
     * @param  {Function} cb       (err, blob)
     * @return {[type]}            [description]
     */
    function readAsBlob(fileName, cb) {
        _getFile(fileName, function(err, file) {
            if (err) {
                return cb(err);
            } else {
                var type = file.type;
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    var arrayBuffer = evt.target.result;
                    var blob = new Blob([arrayBuffer], {
                        'type': type
                    });
                    cb(null, blob);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    }

    function readAsFile(fileName, cb) {
        _getFile(fileName, cb);
    }
    /**
     * Retrieve a file object
     * @param  {[type]}   fileName [description]
     * @param  {Function} cb     (err,file)
     * @return {[type]}            [description]
     */
    function _getFile(fileName, cb) {
        _getFileEntry(fileName, 0, {}, function(err, fe) {
            if (err) {
                return cb(err);
            }
            fe.file(function(file) {
                //issue CB-9403 on file plugin of windows missing fullPath on File, copying it here from FileEntry
                if (window.device && window.device.platform === "windows" && typeof (file.fullPath) === "undefined") {
                    file.fullPath = fe.nativeURL;
                }
                cb(null, file);
            }, function(e) {
                cb(e);
            });
        });
    }

    function _resolveFile(fileName, cb){
      //This is necessary to get the correct uri for apple. The URI in a file object for iphone does not have the file:// prefix.
      //This gives invalid uri errors when trying to resolve.
      if(fileName.indexOf("file://") === -1 && window.device.platform !== "Win32NT" && window.device.platform !== "windows"){
        fileName = "file://" + fileName;
      }
      window.resolveLocalFileSystemURI(fileName, function(fileEntry){
        return cb(null, fileEntry);
      }, function(err){
        return cb(err);
      });
    }

    function _getFileEntry(fileName, size, params, cb) {
      var self = this;
      _checkEnv();
      if(typeof(fileName) === "string"){
        _requestFileSystem(PERSISTENT, size, function gotFS(fileSystem) {
          fileSystem.root.getFile(fileName, params, function gotFileEntry(fileEntry) {
            cb(null, fileEntry);
          }, function(err) {
            if (err.name === 'QuotaExceededError' || err.code === 10) {
              //this happens only on browser. request for 1 gb storage
              //TODO configurable from cloud
              var bigSize = 1024 * 1024 * 1024;
              _requestQuote(bigSize, function(err, bigSize) {
                _getFileEntry(fileName, size, params, cb);
              });
            } else {
              if(!appForm.utils.isPhoneGap()){
                return cb(err);
              } else {
                _resolveFile(fileName, cb);
              }
            }
          });
        }, function() {
          cb('Failed to requestFileSystem');
        });
      } else {
        if(typeof(cb) === "function"){
          cb("Expected file name to be a string but was " + fileName);
        }
      }
    }

    function _requestQuote(size, cb) {
        if (navigator.webkitPersistentStorage) {
            //webkit browser
            navigator.webkitPersistentStorage.requestQuota(size, function(size) {
                cb(null, size);
            }, function(err) {
                cb(err, 0);
            });
        } else {
            //PhoneGap does not need to do this.return directly.
            cb(null, size);
        }
    }

    function _checkEnv() {
        if (window.requestFileSystem) {
            _requestFileSystem = window.requestFileSystem;
            fileSystemAvailable = true;
        } else if (window.webkitRequestFileSystem) {
            _requestFileSystem = window.webkitRequestFileSystem;
            fileSystemAvailable = true;
        } else {
            fileSystemAvailable = false;
        }
        if (window.LocalFileSystem) {
            PERSISTENT = window.LocalFileSystem.PERSISTENT;
        } else if (window.PERSISTENT) {
            PERSISTENT = window.PERSISTENT;
        }
    }
    // debugger;
    _checkEnv();
    return module;
}(appForm.utils || {});

appForm.utils = function (module) {
  module.takePhoto = takePhoto;
  module.isPhoneGapCamAvailable = isPhoneGapAvailable;
  module.isHtml5CamAvailable = isHtml5CamAvailable;
  module.initHtml5Camera = initHtml5Camera;
  module.cancelHtml5Camera = cancelHtml5Camera;
  module.captureBarcode = captureBarcode;

  var isPhoneGap = false;
  var isHtml5 = false;
  var video = null;
  var canvas = null;
  var ctx = null;
  var localMediaStream = null;
  function isHtml5CamAvailable() {
    checkEnv();
    return isHtml5;
  }
  function isPhoneGapAvailable() {
    checkEnv();
    return isPhoneGap;
  }
  function initHtml5Camera(params, cb) {
    checkEnv();
    _html5Camera(params, cb);
  }

  function cancelHtml5Camera() {
    if (localMediaStream){
      if (localMediaStream.stop) {
        localMediaStream.stop();
      } else{
        var tracks = localMediaStream.getTracks();
        if(tracks && tracks.length!==0){
          tracks[0].stop();
        }
      }
      localMediaStream = null;
    }
  }
  function takePhoto(params, cb) {
    params = params || {};
    $fh.forms.log.d("Taking photo ", params, isPhoneGap);
    //use configuration
    var width =  params.targetWidth ? params.targetWidth : $fh.forms.config.get("targetWidth", 640);
    var height = params.targetHeight ? params.targetHeight : $fh.forms.config.get("targetHeight", 480);
    var quality= params.quality ? params.quality : $fh.forms.config.get("quality", 50);
    //For Safety, the default value of saving to photo album is true.
    var saveToPhotoAlbum = typeof(params.saveToPhotoAlbum) !== "undefined" ? params.saveToPhotoAlbum : $fh.forms.config.get("saveToPhotoAlbum");
    var encodingType = params.encodingType ? params.encodingType : $fh.forms.config.get("encodingType", 'jpeg');

    params.targetWidth = width;
    params.targetHeight = height;
    params.quality = quality;
    params.saveToPhotoAlbum = saveToPhotoAlbum;
    params.encodingType = encodingType;

    if ("undefined" === typeof(params.sourceType) && typeof(Camera) !== 'undefined') {
      params.sourceType = Camera.PictureSourceType.CAMERA;
    }

    if (isPhoneGap) {
      _phoneGapPhoto(params, cb);
    } else if (isHtml5) {
      snapshot(params, cb);
    } else {
      cb('Your device does not support camera.');
    }
  }
  function _phoneGapPhoto(params, cb){
    params.encodingType = params.encodingType === 'jpeg' ? Camera.EncodingType.JPEG : Camera.EncodingType.PNG;
    navigator.camera.getPicture(_phoneGapPhotoSuccess(cb), cb, {
      quality: params.quality,
      targetWidth: params.targetWidth,
      targetHeight: params.targetHeight,
      sourceType: params.sourceType,
      saveToPhotoAlbum: params.saveToPhotoAlbum,
      destinationType: Camera.DestinationType.FILE_URI,
      encodingType: params.encodingType
    });
  }
  function _phoneGapPhotoSuccess(cb) {
    return function (imageData) {
      var imageURI = imageData;
      cb(null, imageURI);
    };
  }
  function _html5Camera(params, cb) {
    $fh.forms.log.d("Taking photo _html5Camera", params, isPhoneGap);
    var width = params.targetWidth || $fh.forms.config.get("targetWidth");
    var height = params.targetHeight || $fh.forms.config.get("targetHeight");
    video.width = width;
    video.height = height;
    canvas.width = width;
    canvas.height = height;
    if (!localMediaStream) {
      navigator.getUserMedia({ video: true, audio:false }, function (stream) {
        video.src = window.URL.createObjectURL(stream);
        localMediaStream = stream;
        cb(null, video);
      }, cb);
    } else {
      $fh.forms.log.e('Media device was not released by browser.');
      cb('Media device occupied.');
    }
  }

  /**
   * Capturing a barcode using the PhoneGap barcode plugin
   */
  function _phoneGapBarcode(params, cb){
    //Checking for a cordova barcodeScanner plugin.
    if(window.cordova && window.cordova.plugins && window.cordova.plugins.barcodeScanner){
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          $fh.forms.log.d("Barcode Found: " + JSON.stringify(result));
          return cb(null, result);
        },
        function (error) {
          $fh.forms.log.e("Scanning failed: " + error);
          cb("Scanning failed: " + error);
        }
      );
    } else {
      return cb("Barcode plugin not installed");
    }
  }

  /**
   * Capturing a barcode using a webcam and image processors.
   * TODO Not complete yet.
   * @param params
   * @param cb
   * @private
   */
  function _webBarcode(params, cb){
    //TODO Web barcode decoding not supported yet.
    $fh.forms.log.e("Web Barcode Decoding not supported yet.");
    return cb("Web Barcode Decoding not supported yet.");
  }

  function captureBarcode(params, cb){
    if(isPhoneGapAvailable()){
      _phoneGapBarcode(params,cb);
    } else {
      _webBarcode(params, cb);
    }
  }
  function checkEnv() {
    $fh.forms.log.d("Checking env");
    if (navigator.camera && navigator.camera.getPicture) {
      // PhoneGap
      isPhoneGap = true;
    } else if (_browserWebSupport()) {
      isHtml5 = true;
      video = document.createElement('video');
      video.autoplay = 'autoplay';
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
    } else {
      console.error('Cannot detect usable media API. Camera will not run properly on this device.');
    }
  }
  function _browserWebSupport() {
    if (navigator.getUserMedia) {
      return true;
    }
    if (navigator.webkitGetUserMedia) {
      navigator.getUserMedia = navigator.webkitGetUserMedia;
      return true;
    }
    if (navigator.mozGetUserMedia) {
      navigator.getUserMedia = navigator.mozGetUserMedia;
      return true;
    }
    if (navigator.msGetUserMedia) {
      navigator.getUserMedia = navigator.msGetUserMedia;
      return true;
    }
    return false;
  }

  function snapshot(params, cb) {
    $fh.forms.log.d("Snapshot ", params);
    if (localMediaStream) {
      ctx.drawImage(video, 0, 0, params.targetWidth, params.targetHeight);
      // "image/webp" works in Chrome.
      // Other browsers will fall back to image/png.
      var base64 = canvas.toDataURL('image/png');
      var imageData = ctx.getImageData(0, 0, params.targetWidth, params.targetHeight);

      if(params.cancelHtml5Camera){
        cancelHtml5Camera();
      }

      //Deciding whether to return raw image data or a base64 image.
      //rawData is mainly used for scanning for barcodes.
      if(params.rawData){
        return cb(null, {imageData: imageData, width: params.targetWidth, height: params.targetHeight, base64: base64});
      } else {
        return cb(null, base64);
      }
    } else {
      $fh.forms.log.e('Media resource is not available');
      cb('Resource not available');
    }
  }
  return module;
}(appForm.utils || {});

appForm.web = function (module) {

  module.uploadFile = function(url, fileProps, cb){
    $fh.forms.log.d("Phonegap uploadFile ", url, fileProps);
    var filePath = fileProps.fullPath;

    if(!$fh.forms.config.isOnline()){
      $fh.forms.log.e("Phonegap uploadFile. Not Online.", url, fileProps);
      return cb("No Internet Connection Available.");
    }

    var success = function (r) {
      $fh.forms.log.d("upload to url ", url, " sucessful");
      r.response = r.response || {};
      if(typeof r.response === "string"){
        r.response = JSON.parse(r.response);
      }
      cb(null, r.response);
    };

    var fail = function (error) {
      $fh.forms.log.e("An error uploading a file has occurred: Code = " + error.code);
      $fh.forms.log.d("upload error source " + error.source);
      $fh.forms.log.d("upload error target " + error.target);
      cb(error);
    };

    var options = new FileUploadOptions();
    //important - empty fileName will cause file upload fail on WP!!
    options.fileName = (null == fileProps.name || "" === fileProps.name) ? "image.png" : fileProps.name;
    options.mimeType = fileProps.contentType ? fileProps.contentType : "application/octet-stream";
    options.httpMethod = "https";
    options.chunkedMode = true;
    options.fileKey = "file";

    //http://grandiz.com/phonegap-development/phonegap-file-transfer-error-code-3-solved/
    options.headers = {
      "Connection": "close"
    };

    $fh.forms.log.d("Beginning file upload ",url, options);
    var ft = new FileTransfer();
    ft.upload(filePath, encodeURI(url), success, fail, options);
  };

  module.downloadFile = function(url, fileMetaData, cb){
    $fh.forms.log.d("Phonegap downloadFile ", url, fileMetaData);
    var ft = new FileTransfer();

    if(!$fh.forms.config.isOnline()){
      $fh.forms.log.e("Phonegap downloadFile. Not Online.", url, fileMetaData);
      return cb("No Internet Connection Available.");
    }

    appForm.utils.fileSystem.getBasePath(function(err, basePath){
      if(err){
        $fh.forms.log.e("Error getting base path for file download: " + url);
        return cb(err);
      }

      function success(fileEntry){
        $fh.forms.log.d("File Download Completed Successfully. FilePath: " + fileEntry.fullPath);
        return cb(null, fileEntry.toURL());
      }

      function fail(error){
        $fh.forms.log.e("Error downloading file " + fileMetaData.fileName + " code: " + error.code);
        return cb("Error downloading file " + fileMetaData.fileName + " code: " + error.code);
      }

      if(fileMetaData.fileName){
        $fh.forms.log.d("File name for file " + fileMetaData.fileName + " found. Starting download");
        var fullPath = basePath + fileMetaData.fileName;
        ft.download(encodeURI(url), fullPath, success, fail, false, {headers: {
          "Connection": "close"
        }});
      } else {
        $fh.forms.log.e("No file name associated with the file to download");
        return cb("No file name associated with the file to download");
      }
    });
  };

  return module;
}(appForm.web || {});
appForm.web.ajax = function (module) {
  module = typeof $fh !== 'undefined' && $fh.__ajax ? $fh.__ajax : _myAjax;
  module.get = get;
  module.post = post;
  var _ajax = module;
  function _myAjax() {
  }
  function get(url, cb) {
    $fh.forms.log.d("Ajax get ", url);
    _ajax({
      'url': url,
      'type': 'GET',
      'dataType': 'json',
      'success': function (data, text) {
        $fh.forms.log.d("Ajax get", url, "Success");
        cb(null, data);
      },
      'error': function (xhr, status, err) {
        $fh.forms.log.e("Ajax get", url, "Fail", xhr, status, err);
        cb(xhr);
      }
    });
  }
  function post(url, body, cb) {
    $fh.forms.log.d("Ajax post ", url, body);
    var file = false;
    var formData;
    if (typeof body === 'object') {
      if (body instanceof File) {
        file = true;
        formData = new FormData();
        var name = body.name;
        formData.append(name, body);
        body = formData;
      } else {
        body = JSON.stringify(body);
      }
    }
    var param = {
        'url': url,
        'type': 'POST',
        'data': body,
        'dataType': 'json',
        'success': function (data, text) {
          $fh.forms.log.d("Ajax post ", url, " Success");
          cb(null, data);
        },
        'error': function (xhr, status, err) {
          $fh.forms.log.e("Ajax post ", url, " Fail ", xhr, status, err);
          cb(xhr);
        }
      };
    if (file === false) {
      param.contentType = 'application/json';
    }
    _ajax(param);
  }
  return module;
}(appForm.web.ajax || {});
appForm.stores = function (module) {
  module.Store = Store;
  function Store(name) {
    this.name = name;
  }
  Store.prototype.create = function (model, cb) {
    throw 'Create not implemented:' + this.name;
  };
  /**
     * Read a model data from store
     * @param  {[type]} model          [description]
     * @param  {[type]} cb(error, data);
     */
  Store.prototype.read = function (model, cb) {
    throw 'Read not implemented:' + this.name;
  };
  Store.prototype.update = function (model, cb) {
    throw 'Update not implemented:' + this.name;
  };
  Store.prototype.removeEntry = function (model, cb) {
    throw 'Delete not implemented:' + this.name;
  };
  Store.prototype.upsert = function (model, cb) {
    throw 'Upsert not implemented:' + this.name;
  };
  return module;
}(appForm.stores || {});
/**
 * Local storage stores a model's json definition persistently.
 */
appForm.stores = function(module) {
  //implementation
  var utils = appForm.utils;
  var fileSystem = utils.fileSystem;
  var _fileSystemAvailable = function() {};
  //placeholder
  function LocalStorage() {
    appForm.stores.Store.call(this, 'LocalStorage');
  }
  appForm.utils.extend(LocalStorage, appForm.stores.Store);
  //store a model to local storage
  LocalStorage.prototype.create = function(model, cb) {
    var key = utils.localId(model);
    model.setLocalId(key);
    this.update(model, cb);
  };
  //read a model from local storage
  LocalStorage.prototype.read = function(model, cb) {
    if(typeof(model) === "object"){
      if (model.get("_type") === "offlineTest"){
        return cb(null, {});
      }
    }

    var key = _getKey(model);
    if (key != null) {
      _fhData({
        'act': 'load',
        'key': key.toString()
      }, cb, cb);
    } else {
      //model does not exist in local storage if key is null.
      cb(null, null);
    }
  };
  //update a model
  LocalStorage.prototype.update = function(model, cb) {
    var key = _getKey(model);
    var data = model.getProps();
    var dataStr = JSON.stringify(data);
    _fhData({
      'act': 'save',
      'key': key.toString(),
      'val': dataStr
    }, cb, cb);
  };
  //delete a model
  LocalStorage.prototype.removeEntry = function(model, cb) {
    var key = _getKey(model);
    _fhData({
      'act': 'remove',
      'key': key.toString()
    }, cb, cb);
  };
  LocalStorage.prototype.upsert = function(model, cb) {
    var key = _getKey(model);
    if (key === null) {
      this.create(model, cb);
    } else {
      this.update(model, cb);
    }
  };
  LocalStorage.prototype.switchFileSystem = function(isOn) {
    _fileSystemAvailable = function() {
      return isOn;
    };
  };
  LocalStorage.prototype.defaultStorage = function() {
    _fileSystemAvailable = function() {
      return fileSystem.isFileSystemAvailable();
    };
  };
  LocalStorage.prototype.saveFile = function(fileName, fileToSave, cb){
    if(!_fileSystemAvailable()){
      return cb("File system not available");
    }

    _fhData({
      'act': 'save',
      'key': fileName,
      'val': fileToSave
    }, cb, cb);
  };
  LocalStorage.prototype.updateTextFile = function(key, dataStr, cb){
    _fhData({
      'act': 'save',
      'key': key,
      'val': dataStr
    }, cb, cb);
  };
  LocalStorage.prototype.readFile = function(fileName, cb){
    _fhData({
      'act': 'loadFile',
      'key': fileName
    }, cb, cb);
  };
  LocalStorage.prototype.readFileText = function(fileName, cb){
    _fhData({
      'act': 'load',
      'key': fileName
    }, cb, cb);
  };
  _fileSystemAvailable = function() {
    return fileSystem.isFileSystemAvailable();
  };

  function _getKey(key){
    return typeof(key.getLocalId) === "function" ? key.getLocalId() : key;
  }
  //use different local storage model according to environment
  function _fhData() {
    if (_fileSystemAvailable()) {
      _fhFileData.apply({}, arguments);
    } else {
      _fhLSData.apply({}, arguments);
    }
  }
  //use $fh data
  function _fhLSData(options, success, failure) {
    //allow for no $fh api in studio
    if(! $fh || ! $fh.data) {
      return success();
    }

    $fh.data(options, function (res) {
      if (typeof res === 'undefined') {
        res = {
          key: options.key,
          val: options.val
        };
      }
      //unify the interfaces
      if (options.act.toLowerCase() === 'remove') {
        return success(null, null);
      }
      success(null, res.val ? res.val : null);
    }, failure);
  }
  //use file system
  function _fhFileData(options, success, failure) {
    function fail(msg) {
      if (typeof failure !== 'undefined') {
        return failure(msg, {});
      } else {}
    }

    function filenameForKey(key, cb) {
      var appid = appForm.config.get("appId","unknownAppId");
      key = key + appid;
      utils.md5(key, function(err, hash) {
        if (err) {
          hash = key;
        }

        var filename = hash;

        if(key.indexOf("filePlaceHolder") === -1){
          filename += ".txt";
        }

        if (typeof navigator.externalstorage !== 'undefined') {
          navigator.externalstorage.enable(function handleSuccess(res) {
            var path = filename;
            if (res.path) {
              path = res.path;
              if (!path.match(/\/$/)) {
                path += '/';
              }
              path += filename;
            }
            filename = path;
            return cb(filename);
          }, function handleError(err) {
            return cb(filename);
          });
        } else {
          return cb(filename);
        }
      });
    }

    function save(key, value) {
      filenameForKey(key, function(hash) {
        fileSystem.save(hash, value, function(err, res) {
          if (err) {
            fail(err);
          } else {
            success(null, value);
          }
        });
      });
    }

    function remove(key) {
      filenameForKey(key, function(hash) {
        fileSystem.remove(hash, function(err) {
          if (err) {
            if (err.name === 'NotFoundError' || err.code === 1) {
              //same respons of $fh.data if key not found.
              success(null, null);
            } else {
              fail(err);
            }
          } else {
            success(null, null);
          }
        });
      });
    }

    function load(key) {
      filenameForKey(key, function(hash) {
        fileSystem.readAsText(hash, function(err, text) {
          if (err) {
            if (err.name === 'NotFoundError' || err.code === 1) {
              //same respons of $fh.data if key not found.
              success(null, null);
            } else {
              fail(err);
            }
          } else {
            success(null, text);
          }
        });
      });
    }

    function loadFile(key) {
      filenameForKey(key, function(hash) {
        fileSystem.readAsFile(hash, function(err, file) {
          if (err) {
            if (err.name === 'NotFoundError' || err.code === 1) {
              //same respons of $fh.data if key not found.
              success(null, null);
            } else {
              fail(err);
            }
          } else {
            success(null, file);
          }
        });
      });
    }

    if (typeof options.act === 'undefined') {
      return load(options.key);
    } else if (options.act === 'save') {
      return save(options.key, options.val);
    } else if (options.act === 'remove') {
      return remove(options.key);
    } else if (options.act === 'load') {
      return load(options.key);
    } else if (options.act === 'loadFile') {
      return loadFile(options.key);
    } else {
      if (typeof failure !== 'undefined') {
        return failure('Action [' + options.act + '] is not defined', {});
      }
    }
  }
  module.localStorage = new LocalStorage();
  return module;
}(appForm.stores || {});
appForm.stores = function(module) {
  var Store = appForm.stores.Store;
  module.mBaaS = new MBaaS();

  function MBaaS() {
    Store.call(this, 'MBaaS');
  }
  appForm.utils.extend(MBaaS, Store);
  MBaaS.prototype.checkStudio = function() {
    return appForm.config.get("studioMode");
  };
  MBaaS.prototype.create = function(model, cb) {
    var self = this;
    if (self.checkStudio()) {
      cb("Studio mode mbaas not supported");
    } else {
      var url = _getUrl(model);
      if(self.isFileAndPhoneGap(model)){
        appForm.web.uploadFile(url, model.getProps(), cb);
      } else {
        appForm.web.ajax.post(url, model.getProps(), cb);
      }
    }
  };
  MBaaS.prototype.isFileAndPhoneGap = function(model){
    var self = this;
    return self.isFileTransfer(model) && self.isPhoneGap();
  };
  MBaaS.prototype.isFileTransfer = function(model){
    return (model.get("_type") === "fileSubmission" || model.get("_type") === "base64fileSubmission" || model.get("_type") === "fileSubmissionDownload");
  };
  MBaaS.prototype.isPhoneGap = function(){
    return (typeof window.Phonegap !== "undefined" || typeof window.cordova !== "undefined");
  };
  MBaaS.prototype.read = function(model, cb) {
    var self = this;
    if (self.checkStudio()) {
      cb("Studio mode mbaas not supported");
    } else {
      if (model.get("_type") === "offlineTest") {
        cb("offlinetest. ignore");
      } else {
        var url = _getUrl(model);

        if(self.isFileTransfer(model) && self.isPhoneGap()){
          appForm.web.downloadFile(url, model.getFileMetaData(), cb);
        }
        else if(self.isFileTransfer(model)) {//Trying to download a file without phone. No need as the direct web urls can be used
          return cb(null, model.getRemoteFileURL());
        }
        else {
          appForm.web.ajax.get(url, cb);
        }
      }
    }
  };
  MBaaS.prototype.update = function(model, cb) {};
  MBaaS.prototype["delete"] = function(model, cb) {};
  //@Deprecated use create instead
  MBaaS.prototype.completeSubmission = function(submissionToComplete, cb) {
    if (this.checkStudio()) {
      return cb("Studio mode mbaas not supported");
    }
    var url = _getUrl(submissionToComplete);
    appForm.web.ajax.post(url, {}, cb);
  };
  MBaaS.prototype.submissionStatus = function(submission, cb) {
    if (this.checkStudio()) {
      return cb("Studio mode mbaas not supported");
    }
    var url = _getUrl(submission);
    appForm.web.ajax.get(url, cb);
  };
  MBaaS.prototype.isOnline = function(cb){
    var host = appForm.config.getCloudHost();
    var url = host + appForm.config.get('statusUrl', "/sys/info/ping");

    appForm.web.ajax.get(url, function(err){
      if(err){
        $fh.forms.log.e("Online status ajax ", err);
        return cb(false);
      } else {
        $fh.forms.log.d("Online status ajax success");
        return cb(true);
      }
    });
  };

  function _getUrl(model) {
    $fh.forms.log.d("_getUrl ", model);
    var type = model.get('_type');
    var host = appForm.config.getCloudHost();
    var mBaaSBaseUrl = appForm.config.get('mbaasBaseUrl');
    var formUrls = appForm.config.get('formUrls');
    var relativeUrl = "";
    if (formUrls[type]) {
      relativeUrl = formUrls[type];
    } else {
      $fh.forms.log.e('type not found to get url:' + type);
    }
    var url = host + mBaaSBaseUrl + relativeUrl;
    var props = {};
    props.appId = appForm.config.get('appId');
    //Theme and forms do not require any parameters that are not in _fh
    switch (type) {
      case 'config':
        props.appid = model.get("appId");
        props.deviceId = model.get("deviceId");
        break;
      case 'form':
        props.formId = model.get('_id');
        break;
      case 'formSubmission':
        props.formId = model.getFormId();
        break;
      case 'fileSubmission':
        props.submissionId = model.getSubmissionId();
        props.hashName = model.getHashName();
        props.fieldId = model.getFieldId();
        break;
      case 'base64fileSubmission':
        props.submissionId = model.getSubmissionId();
        props.hashName = model.getHashName();
        props.fieldId = model.getFieldId();
        break;
      case 'submissionStatus':
        props.submissionId = model.get('submissionId');
        break;
      case 'completeSubmission':
        props.submissionId = model.get('submissionId');
        break;
      case 'formSubmissionDownload':
        props.submissionId = model.getSubmissionId();
        break;
      case 'fileSubmissionDownload':
        props.submissionId = model.getSubmissionId();
        props.fileGroupId = model.getFileGroupId();
        break;
      case 'offlineTest':
        return "http://127.0.0.1:8453";
    }
    for (var key in props) {
      url = url.replace(':' + key, props[key]);
    }
    return url;
  }
  return module;
}(appForm.stores || {});
appForm.stores = function (module) {
  var Store = appForm.stores.Store;
  //DataAgent is read only store
  module.DataAgent = DataAgent;
  module.dataAgent = new DataAgent(appForm.stores.mBaaS, appForm.stores.localStorage);
  //default data agent uses mbaas as remote store, localstorage as local store
  function DataAgent(remoteStore, localStore) {
    Store.call(this, 'DataAgent');
    this.remoteStore = remoteStore;
    this.localStore = localStore;
  }
  appForm.utils.extend(DataAgent, Store);
  /**
     * Read from local store first, if not exists, read from remote store and store locally
     * @param  {[type]}   model [description]
     * @param  {Function} cb    (err,res,isFromRemote)
     * @return {[type]}         [description]
     */
  DataAgent.prototype.read = function (model, cb) {
    $fh.forms.log.d("DataAgent read ", model);
    var that = this;
    this.localStore.read(model, function (err, locRes) {
      if (err || !locRes) {
        //local loading failed

        $fh.forms.log.d("Error reading model from localStore ", model, err);

        that.refreshRead(model, cb);
      } else {
        //local loading succeed
        cb(null, locRes, false);
      }
    });
  };
  /**
     * Read from remote store and store the content locally.
     * @param  {[type]}   model [description]
     * @param  {Function} cb    [description]
     * @return {[type]}         [description]
     */
  DataAgent.prototype.refreshRead = function (model, cb) {
    $fh.forms.log.d("DataAgent refreshRead ", model);
    var that = this;
    this.remoteStore.read(model, function (err, res) {
      if (err) {
        $fh.forms.log.e("Error reading model from remoteStore ", model, err);
        cb(err);
      } else {
        $fh.forms.log.d("Model refresh successfull from remoteStore ", model, res);
        //update model from remote response
        model.fromJSON(res);
        //update local storage for the model
        that.localStore.upsert(model, function () {
          var args = Array.prototype.slice.call(arguments, 0);
          args.push(true);
          cb.apply({}, args);
        });
      }
    });
  };

  /**
   * Attempt to run refresh read first, if failed, run read.
   * @param  {[type]}   model [description]
   * @param  {Function} cb    [description]
   * @return {[type]}         [description]
   */
  DataAgent.prototype.attemptRead=function(model,cb){
    $fh.forms.log.d("DataAgent attemptRead ", model);
    var self=this;


    self.checkOnlineStatus(function(online){
      if($fh.forms.config.isOnline()){
        self.refreshRead(model,function(err){
          if (err){
            self.read(model,cb);
          }else{
            cb.apply({},arguments);
          }
        });
      } else {
        self.read(model,cb);
      }
    });
  };

  /**
   * Check online status of the remote store.
   * @param  {Function} cb    [description]
   * @return {[type]}         [description]
   */
  DataAgent.prototype.checkOnlineStatus=function(cb){
    $fh.forms.log.d("DataAgent check online status ");
    var self=this;

    if(appForm.utils.isPhoneGap()){
      if(navigator.connection){
        if(navigator.connection.type && navigator.connection.type === Connection.NONE){
          //No connection availabile, no need to ping.
          $fh.forms.config.offline();
          return cb(false);
        }
      }
    }


    self.remoteStore.isOnline(function(online){
      if(online === false){
        $fh.forms.config.offline();
      } else {
        $fh.forms.config.online();
      }

      cb(null, online);
    });
  };
  return module;
}(appForm.stores || {});
appForm.models = function (module) {
  function Model(opt) {
    this.props = {
      '_id': null,
      '_type': null,
      '_ludid': null
    };
    this.utils = appForm.utils;
    this.events = {};
    if (typeof opt !== 'undefined') {
      for (var key in opt) {
        this.props[key] = opt[key];
      }
    }
    this.touch();
  }
  Model.prototype.on = function (name, func) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    if (this.events[name].indexOf(func) < 0) {
      this.events[name].push(func);
    }
  };
  Model.prototype.off = function (name, func) {
    if (this.events[name]) {
      if (this.events[name].indexOf(func) >= 0) {
        this.events[name].splice(this.events[name].indexOf(func), 1);
      }
    }
  };

  Model.prototype.getType = function(){
    return this.get('_type');
  };

  Model.prototype.clearEvents = function(){
    this.events = {};
  };
  Model.prototype.emit = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var eventName = args.shift();
    var funcs = this.events[eventName];

    var globalArgs = args.slice(0);

    if (funcs && funcs.length > 0) {
      for (var i = 0; i < funcs.length; i++) {
        var func = funcs[i];
        func.apply(this, args);
        //Also emitting a global event if the
        var type = this.getType();
        if(type){
          var globalEmitName = this.utils.generateGlobalEventName(type, eventName);
          globalArgs.unshift(globalEmitName);
          $fh.forms.emit.apply(this, globalArgs);
        }

      }
    }
  };
  Model.prototype.getProps = function () {
    return this.props;
  };
  Model.prototype.get = function (key, def) {
    return typeof this.props[key] === 'undefined' ? def : this.props[key];
  };
  Model.prototype.set = function (key, val) {
    this.props[key] = val;
  };
  Model.prototype.setLocalId = function (localId) {
    this.set('_ludid', localId);
  };
  Model.prototype.getLocalId = function () {
    return this.get('_ludid');
  };
  Model.prototype.toJSON = function () {
    var retJSON = {};
    for (var key in this.props) {
      retJSON[key]= this.props[key];
    }
    return retJSON;
  };
  Model.prototype.fromJSON = function (json) {
    if (typeof json === 'string') {
      this.fromJSONStr(json);
    } else {
      for (var key in json) {
        this.set(key, json[key]);
      }
    }
    this.touch();
  };
  Model.prototype.fromJSONStr = function (jsonStr) {
    try {
      var json = JSON.parse(jsonStr);
      this.fromJSON(json);
    } catch (e) {
      console.error("Error parsing JSON", e);
    }
  };

  Model.prototype.touch = function () {
    this.set('_localLastUpdate', appForm.utils.getTime());
  };
  Model.prototype.getLocalUpdateTimeStamp = function () {
    return this.get('_localLastUpdate');
  };
  Model.prototype.genLocalId = function () {
    return appForm.utils.localId(this);
  };
  /**
     * retrieve model from local or remote with data agent store.
     * @param {boolean} fromRemote optional true--force from remote
     * @param  {Function} cb (err,currentModel)
     * @return {[type]}      [description]
     */
  Model.prototype.refresh = function (fromRemote, cb) {
    var dataAgent = this.getDataAgent();
    var that = this;
    if (typeof cb === 'undefined') {
      cb = fromRemote;
      fromRemote = false;
    }
    if (fromRemote) {
      dataAgent.attemptRead(this, _handler);
    } else {
      dataAgent.read(this, _handler);
    }
    function _handler(err, res) {
      if (!err && res) {
        that.fromJSON(res);
        cb(null, that);
      } else {
        cb(err, that);
      }
    }
  };
  Model.prototype.attemptRefresh=function(cb){
    var dataAgent = this.getDataAgent();
    var self=this;
    dataAgent.attemptRead(this,function(err,res){
      if (!err && res){
        self.fromJSON(res);
        cb(null,self);
      }else{
        cb(err,self);
      }
    });
  };
  /**
     * Retrieve model from local storage store
     * @param  {Function} cb (err, curModel)
     * @return {[type]}      [description]
     */
  Model.prototype.loadLocal = function (cb) {
    var localStorage = appForm.stores.localStorage;
    var that = this;
    localStorage.read(this, function (err, res) {
      if (err) {
        cb(err);
      } else {
        if (res) {
          that.fromJSON(res);
        }
        cb(err, that);
      }
    });
  };
  /**
     * save current model to local storage store
     * @param  {Function} cb [description]
     * @return {[type]}      [description]
     */
  Model.prototype.saveLocal = function (cb) {
    var localStorage = appForm.stores.localStorage;
    localStorage.upsert(this, cb);
  };
  /**
     * Remove current model from local storage store
     * @param  {Function} cb [description]
     * @return {[type]}      [description]
     */
  Model.prototype.clearLocal = function (cb) {
    var localStorage = appForm.stores.localStorage;
    localStorage.removeEntry(this, cb);
  };
  Model.prototype.getDataAgent = function () {
    if (!this.dataAgent) {
      this.setDataAgent(appForm.stores.dataAgent);
    }
    return this.dataAgent;
  };
  Model.prototype.setDataAgent = function (dataAgent) {
    this.dataAgent = dataAgent;
  };
  module.Model = Model;
  return module;
}(appForm.models || {});
appForm.models = function(module) {
  var Model = appForm.models.Model;
  var online = true;
  var cloudHost = "notset";

  function Config() {
    Model.call(this, {
      '_type': 'config',
      "_ludid": "config"
    });

  }
  appForm.utils.extend(Config, Model);
  //call in appForm.init
  Config.prototype.init = function(config, cb) {
    if (config.studioMode) { //running in studio
      this.set("studioMode", true);
      this.fromJSON(config);
      cb();
    } else {
      this.set("studioMode", false);
      //load hard coded static config first
      this.staticConfig(config);
      //attempt to load config from mbaas then local storage.
      this.refresh(true, cb); 
    }
  };
  Config.prototype.isStudioMode = function(){
    return this.get("studioMode");
  };
  Config.prototype.refresh = function (fromRemote, cb) {
    var dataAgent = this.getDataAgent();
    var self = this;
    if (typeof cb === 'undefined') {
      cb = fromRemote;
      fromRemote = false;
    }

    function _handler(err, res) {
      var configObj = {};

      if (!err && res) {
        if(typeof(res) === "string"){
          try{
            configObj = JSON.parse(res);
          } catch(error){
            $fh.forms.log.e("Invalid json config defintion from remote", error);
            configObj = {};
            return cb(error, null);
          }
        } else {
          configObj = res;
        }

        self.set("defaultConfigValues", configObj);
        self.saveLocal(function(err, updatedConfigJSON){
          cb(err, self);
        });
      } else {
        cb(err, self);
      }
    }
    self.loadLocal(function(err, localConfig){
      if(err) {
        $fh.forms.log.e("Config loadLocal ", err);
      }

      dataAgent.remoteStore.read(self, _handler);
    });
  };
  Config.prototype.getCloudHost = function(){
    return cloudHost;  
  };
  Config.prototype.staticConfig = function(config) {
    var self = this;
    var defaultConfig = {"defaultConfigValues": {}, "userConfigValues": {}};
    //If user already has set values, don't want to overwrite them
    if(self.get("userConfigValues")){
      defaultConfig.userConfigValues = self.get("userConfigValues");
    }
    var appid = $fh && $fh.app_props ? $fh.app_props.appid : config.appid;
    var mode = $fh && $fh.app_props ? $fh.app_props.mode : 'dev';
    self.set('appId', appid);
    self.set('env', mode);

    if($fh && $fh._getDeviceId){
      self.set('deviceId', $fh._getDeviceId());
    } else {
      self.set('deviceId', "notset");
    }


    self._initMBaaS(config);
    //Setting default retry attempts if not set in the config
    if (!config) {
      config = {};
    }

    //config_admin_user can not be set by the user.
    if(config.config_admin_user){
      delete config.config_admin_user;
    }

    defaultConfig.defaultConfigValues = config;
    var staticConfig = {
      "sent_save_min": 5,
      "sent_save_max": 1000,
      "targetWidth": 640,
      "targetHeight": 480,
      "quality": 50,
      "debug_mode": false,
      "logger": false,
      "max_retries": 3,
      "timeout": 7,
      "log_line_limit": 5000,
      "log_email": "test@example.com",
      "log_level": 3,
      "log_levels": ["error", "warning", "log", "debug"],
      "config_admin_user": true,
      "picture_source": "both",
      "saveToPhotoAlbum": true,
      "encodingType": "jpeg",
      "sent_items_to_keep_list": [5, 10, 20, 30, 40, 50, 100]
    };

    for(var key in staticConfig){
      defaultConfig.defaultConfigValues[key] = staticConfig[key];
    }

    self.fromJSON(defaultConfig);
  };
  Config.prototype._initMBaaS = function(config) {
    var self = this;
    config = config || {};
    var cloud_props = $fh.cloud_props;
    var app_props = $fh.app_props;
    var mode = 'dev';
    if (app_props) {
      cloudHost = app_props.host;
    }
    if (cloud_props && cloud_props.hosts) {
      cloudHost = cloud_props.hosts.url;
    }

    if(typeof(config.cloudHost) === 'string'){
      cloudHost = config.cloudHost;
    }

    
    self.set('mbaasBaseUrl', '/mbaas');
    var appId = self.get('appId');
    self.set('formUrls', {
      'forms': '/forms/:appId',
      'form': '/forms/:appId/:formId',
      'theme': '/forms/:appId/theme',
      'formSubmission': '/forms/:appId/:formId/submitFormData',
      'fileSubmission': '/forms/:appId/:submissionId/:fieldId/:hashName/submitFormFile',
      'base64fileSubmission': '/forms/:appId/:submissionId/:fieldId/:hashName/submitFormFileBase64',
      'submissionStatus': '/forms/:appId/:submissionId/status',
      'formSubmissionDownload': '/forms/:appId/submission/:submissionId',
      'fileSubmissionDownload': '/forms/:appId/submission/:submissionId/file/:fileGroupId',
      'completeSubmission': '/forms/:appId/:submissionId/completeSubmission',
      'config': '/forms/:appid/config/:deviceId'
    });
    self.set('statusUrl', '/sys/info/ping');
  };
  Config.prototype.setOnline = function(){
    var wasOnline = online;
    online = true;

    if(!wasOnline){
      this.emit('online');
    }
  };
  Config.prototype.setOffline = function(){
    var wasOnline = online;
    online = false;

    if(wasOnline){
      this.emit('offline');  
    }
  };
  Config.prototype.isOnline = function(){
    var self = this;
    if(appForm.utils.isPhoneGap()){
      if(navigator.connection && navigator.connection.type){
        return online === true && navigator.connection.type !== Connection.NONE;
      } else {
        return online === true;
      }
    } else {
      return online === true;
    }

  };
  Config.prototype.isStudioMode = function(){
    return this.get("studioMode", false);
  };

  module.config = new Config();
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  function Forms() {
    Model.call(this, {
      '_type': 'forms',
      '_ludid': 'forms_list',
      'loaded': false
    });
  }
  appForm.utils.extend(Forms, Model);

  Forms.prototype.isFormUpdated = function (formModel) {
    var id = formModel.get('_id');
    var formLastUpdate = formModel.getLastUpdate();
    var formMeta = this.getFormMetaById(id);
    if (formMeta) {
      return formLastUpdate !== formMeta.lastUpdatedTimestamp;
    } else {
      //could have been deleted. leave it for now
      return false;
    }
  };
  Forms.prototype.setLocalId = function(){
    $fh.forms.log.e("Forms setLocalId. Not Permitted for Forms.");
  };
  Forms.prototype.getFormMetaById = function (formId) {
    $fh.forms.log.d("Forms getFormMetaById ", formId);
    var forms = this.getFormsList();
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      if (form._id === formId) {
        return form;
      }
    }
    $fh.forms.log.e("Forms getFormMetaById: No form found for id: ", formId);
    return null;
  };
  Forms.prototype.size = function () {
    return this.get('forms').length;
  };
  Forms.prototype.getFormsList = function () {
    return this.get('forms', []);
  };
  Forms.prototype.getFormIdByIndex = function (index) {
    $fh.forms.log.d("Forms getFormIdByIndex: ", index);
    return this.getFormsList()[index]._id;
  };
  module.forms = new Forms();
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  module.Form = Form;
  var _forms = {};
  //cache of all forms. single instance for 1 formid
  /**
     * [Form description]
     * @param {[type]}   params  {formId: string, fromRemote:boolean(false), rawMode:false, rawData:JSON}
     * @param {Function} cb         [description]
     */
  function Form(params, cb) {
    var that = this;
    var rawMode = params.rawMode || false;
    var rawData = params.rawData || null;
    var formId = params.formId;
    var fromRemote = params.fromRemote;
    $fh.forms.log.d("Form: ", rawMode, rawData, formId, fromRemote);

    if (typeof fromRemote === 'function' || typeof cb === 'function') {
      if (typeof fromRemote === 'function') {
        cb = fromRemote;
        fromRemote = false;
      }
    } else {
      return $fh.forms.log.e('a callback function is required for initialising form data. new Form (formId, [isFromRemote], cb)');
    }

    if (!formId) {
      return cb('Cannot initialise a form object without an id. id:' + formId, null);
    }


    Model.call(that, {
      '_id': formId,
      '_type': 'form'
    });
    that.set('_id', formId);
    that.setLocalId(that.genLocalId(formId));


    function loadFromLocal(){
      $fh.forms.log.d("Form: loadFromLocal ", rawMode, rawData, formId, fromRemote);
      if (_forms[formId]) {
        //found form object in mem return it.
        cb(null, _forms[formId]);
        return _forms[formId];
      }

      function processRawFormJSON(){
        that.fromJSON(rawData);
        that.initialise();

        _forms[that.getFormId()] = that;
        return cb(null, that);
      }

      if(rawData){
        return processRawFormJSON();
      } else {

        /**
         * No Form JSON object to process into Models, load the form from local
         * storage.
         */
        that.refresh(false, function(err, form){
          if(err){
            return cb(err);
          }

          form.initialise();

          _forms[formId] = form;
          return cb(null, form);
        });
      }
    }


    function loadFromRemote(){
      $fh.forms.log.d("Form: loadFromRemote", rawMode, rawData, formId, fromRemote);
      function checkForUpdate(form){
        $fh.forms.log.d("Form: checkForUpdate", rawMode, rawData, formId, fromRemote);
        form.refresh(false, function (err, obj) {
          if(err){
             $fh.forms.log.e("Error refreshing form from local: ", err);
          }
          if (appForm.models.forms.isFormUpdated(form)) {
            form.refresh(true, function (err, obj1) {
              if(err){
                return cb(err, null);
              }
              form.initialise();

              _forms[formId] = obj1;
              return cb(err, obj1);
            });
          } else {
            form.initialise();
            _forms[formId] = obj;
            cb(err, obj);
          }
        });
      }

      if (_forms[formId]) {
        $fh.forms.log.d("Form: loaded from cache", rawMode, rawData, formId, fromRemote);
        //found form object in mem return it.
        if(!appForm.models.forms.isFormUpdated(_forms[formId])){
          cb(null, _forms[formId]);
          return _forms[formId];
        }
      }

      checkForUpdate(that);
    }

    //Raw mode is for avoiding interaction with the mbaas
    if(rawMode === true){
      loadFromLocal();
    } else {
      loadFromRemote();
    }
  }
  appForm.utils.extend(Form, Model);
  Form.prototype.getLastUpdate = function () {
    $fh.forms.log.d("Form: getLastUpdate");
    return this.get('lastUpdatedTimestamp');
  };
  Form.prototype.genLocalId = function (formId) {
    formId = typeof(formId) === 'string' ? formId : this.get("_id", "");
    return "form_" + formId;
  };
  /**
     * Initiliase form json to objects
     * @return {[type]} [description]
     */
  Form.prototype.initialise = function () {
    this.filterAdminFields();
    this.initialisePage();
    this.initialiseFields();
    this.initialiseRules();
  };
  /**
   * Admin fields should not be part of the form.
   */
  Form.prototype.filterAdminFields = function(){
    var pages = this.getPagesDef();
    var newFieldRef = {};


    for(var pageIndex = 0; pageIndex < pages.length; pageIndex++){
      var page = pages[pageIndex];
      var pageFields = page.fields;
      var filteredFields = [];
      var fieldInPageIndex = 0;

      for(var fieldIndex = 0; fieldIndex < pageFields.length; fieldIndex++){
        var field = pageFields[fieldIndex];

        if(!field.adminOnly){
          newFieldRef[field._id] = {page: pageIndex, field: fieldInPageIndex};
          fieldInPageIndex++;
          filteredFields.push(field);
        }
      }

      pages[pageIndex].fields = filteredFields;
    }

    this.set("pages", pages);
    this.set("fieldRef", newFieldRef);
  };

  Form.prototype.initialiseFields = function () {
    $fh.forms.log.d("Form: initialiseFields");
    var fieldsRef = this.getFieldRef();
    this.fields = {};
    for (var fieldId in fieldsRef) {
      var fieldRef = fieldsRef[fieldId];
      var pageIndex = fieldRef.page;
      var fieldIndex = fieldRef.field;
      if (pageIndex === undefined || fieldIndex === undefined) {
        throw 'Corruptted field reference';
      }
      var fieldDef = this.getFieldDefByIndex(pageIndex, fieldIndex);
      if (fieldDef) {
        this.fields[fieldId] = new appForm.models.Field(fieldDef, this);
      } else {
        throw 'Field def is not found.';
      }
    }
  };
  Form.prototype.initialiseRules = function () {
    $fh.forms.log.d("Form: initialiseRules");
    this.rules = {};
    var pageRules = this.getPageRules();
    var fieldRules = this.getFieldRules();
    var constructors = [];
    for (var i = 0; i<pageRules.length ; i++) {
      var pageRule = pageRules[i];
      constructors.push({
        'type': 'page',
        'definition': pageRule
      });
    }
    for (i = 0; i<fieldRules.length; i++) {
      var fieldRule = fieldRules[i];
      constructors.push({
        'type': 'field',
        'definition': fieldRule
      });
    }
    for (i = 0; i<constructors.length ; i++) {
      var constructor = constructors[i];
      var ruleObj = new appForm.models.Rule(constructor);
      var fieldIds = ruleObj.getRelatedFieldId();
      for (var j = 0; j<fieldIds.length; j++) {
        var  fieldId = fieldIds[j];
        if (!this.rules[fieldId]) {
          this.rules[fieldId] = [];
        }
        this.rules[fieldId].push(ruleObj);
      }
    }
  };
  Form.prototype.getRulesByFieldId = function (fieldId) {
    $fh.forms.log.d("Form: getRulesByFieldId");
    return this.rules[fieldId];
  };
  Form.prototype.initialisePage = function () {
    $fh.forms.log.d("Form: initialisePage");
    var pages = this.getPagesDef();
    this.pages = [];
    for (var i = 0; i < pages.length; i++) {
      var pageDef = pages[i];
      var pageModel = new appForm.models.Page(pageDef, this);
      this.pages.push(pageModel);
    }
  };
  Form.prototype.getPageNumberByFieldId = function(fieldId){
    if(fieldId){
      return this.getFieldRef()[fieldId].page;
    } else {
      return null;
    }
  };
  Form.prototype.getPageModelList = function () {
    return this.pages;
  };
  Form.prototype.getName = function () {
    return this.get('name', '');
  };
  Form.prototype.getDescription = function () {
    return this.get('description', '');
  };
  Form.prototype.getPageRules = function () {
    return this.get('pageRules', []);
  };
  Form.prototype.getFieldRules = function () {
    return this.get('fieldRules', []);
  };
  Form.prototype.getFieldRef = function () {
    return this.get('fieldRef', {});
  };
  Form.prototype.getPagesDef = function () {
    return this.get('pages', []);
  };
  Form.prototype.getPageRef = function () {
    return this.get('pageRef', {});
  };
  Form.prototype.getFieldModelById = function (fieldId) {
    return this.fields[fieldId];
  };
  /**
   * Finding a field model by the Field Code specified in the studio if it exists
   * Otherwise return null;
   * @param code - The code of the field that is being searched for
   */
  Form.prototype.getFieldModelByCode = function(code){
    var self = this;
    if(!code || typeof(code) !== "string"){
      return null;
    }

    for(var fieldId in self.fields){
      var field = self.fields[fieldId];
      if(field.getCode() !== null && field.getCode() === code){
        return field;
      }
    }

    return null;
  };
  Form.prototype.getFieldDefByIndex = function (pageIndex, fieldIndex) {
    $fh.forms.log.d("Form: getFieldDefByIndex: ", pageIndex, fieldIndex);
    var pages = this.getPagesDef();
    var page = pages[pageIndex];
    if (page) {
      var fields = page.fields ? page.fields : [];
      var field = fields[fieldIndex];
      if (field) {
        return field;
      }
    }
    $fh.forms.log.e("Form: getFieldDefByIndex: No field found for page and field index: ", pageIndex, fieldIndex);
    return null;
  };
  Form.prototype.getPageModelById = function (pageId) {
    $fh.forms.log.d("Form: getPageModelById: ", pageId);
    var index = this.getPageRef()[pageId];
    if (typeof index === 'undefined') {
      $fh.forms.log.e('page id is not found in pageRef: ' + pageId);
    } else {
      return this.pages[index];
    }
  };
  Form.prototype.newSubmission = function () {
    $fh.forms.log.d("Form: newSubmission");
    return appForm.models.submission.newInstance(this);
  };
  Form.prototype.getFormId = function () {
    return this.get('_id');
  };
  Form.prototype.removeFromCache = function () {
    $fh.forms.log.d("Form: removeFromCache");
    if (_forms[this.getFormId()]) {
      delete _forms[this.getFormId()];
    }
  };
  Form.prototype.getFileFieldsId = function () {
    $fh.forms.log.d("Form: getFileFieldsId");
    var fieldsId = [];
    for (var fieldId in this.fields) {
      var field = this.fields[fieldId];
      if (field.getType() === 'file' || field.getType() === 'photo' || field.getType() === 'signature') {
        fieldsId.push(fieldId);
      }
    }
    return fieldsId;
  };

  Form.prototype.getRuleEngine = function () {
    $fh.forms.log.d("Form: getRuleEngine");
    if (this.rulesEngine) {
      return this.rulesEngine;
    } else {
      var formDefinition = this.getProps();
      this.rulesEngine = new appForm.RulesEngine(formDefinition);
      return this.rulesEngine;
    }
  };
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  module.FileSubmission = FileSubmission;
  function FileSubmission(fileData) {
    $fh.forms.log.d("FileSubmission ", fileData);
    Model.call(this, {
      '_type': 'fileSubmission',
      'data': fileData
    });
  }
  appForm.utils.extend(FileSubmission, Model);
  FileSubmission.prototype.loadFile = function (cb) {
    $fh.forms.log.d("FileSubmission loadFile");
    var fileName = this.getHashName();
    var that = this;
    appForm.stores.localStorage.readFile(fileName, function (err, file) {
      if (err) {
        $fh.forms.log.e("FileSubmission loadFile. Error reading file", fileName, err);
        cb(err);
      } else {
        $fh.forms.log.d("FileSubmission loadFile. File read correctly", fileName, file);
        that.fileObj = file;
        cb(null);
      }
    });
  };
  FileSubmission.prototype.getProps = function () {
    if(this.fileObj){
      $fh.forms.log.d("FileSubmissionDownload: file object found");
      return this.fileObj;
    } else {
      $fh.forms.log.e("FileSubmissionDownload: no file object found");
    }
  };
  FileSubmission.prototype.setSubmissionId = function (submissionId) {
    $fh.forms.log.d("FileSubmission setSubmissionId.", submissionId);
    this.set('submissionId', submissionId);
  };
  FileSubmission.prototype.getSubmissionId = function () {
    return this.get('submissionId');
  };
  FileSubmission.prototype.getHashName = function () {
    return this.get('data').hashName;
  };
  FileSubmission.prototype.getFieldId = function () {
    return this.get('data').fieldId;
  };
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  module.FileSubmissionDownload = FileSubmissionDownload;
  function FileSubmissionDownload(fileData) {
    $fh.forms.log.d("FileSubmissionDownload ", fileData);
    Model.call(this, {
      '_type': 'fileSubmissionDownload',
      'data': fileData
    });
  }
  appForm.utils.extend(FileSubmissionDownload, Model);
  FileSubmissionDownload.prototype.setSubmissionId = function (submissionId) {
    $fh.forms.log.d("FileSubmission setSubmissionId.", submissionId);
    this.set('submissionId', submissionId);
  };
  FileSubmissionDownload.prototype.getSubmissionId = function () {
    $fh.forms.log.d("FileSubmission getSubmissionId: ", this.get('submissionId'));
    return this.get('submissionId', "");
  };
  FileSubmissionDownload.prototype.getHashName = function () {
    $fh.forms.log.d("FileSubmission getHashName: ", this.get('data').hashName);
    return this.get('data', {}).hashName;
  };
  FileSubmissionDownload.prototype.getFieldId = function () {
    $fh.forms.log.d("FileSubmission getFieldId: ", this.get('data').fieldId);
    return this.get('data', {}).fieldId;
  };
  FileSubmissionDownload.prototype.getFileMetaData = function(){
    $fh.forms.log.d("FileSubmission getFileMetaData: ", this.get('data'));
    if(this.get('data')){
      $fh.forms.log.d("FileSubmission getFileMetaData: data found", this.get('data'));
    } else {
      $fh.forms.log.e("FileSubmission getFileMetaData: No data found");
    }
    return this.get('data', {});
  };
  FileSubmissionDownload.prototype.getFileGroupId = function(){
    $fh.forms.log.d("FileSubmission getFileGroupId: ", this.get('data'));
    return this.get('data', {}).groupId || "notset";
  };
  FileSubmissionDownload.prototype.getRemoteFileURL = function(){
    var self = this;
    $fh.forms.log.d("FileSubmission getRemoteFileURL: ");

    //RemoteFileUrl = cloudHost + /mbaas/forms/submission/:submissionId/file/:fileGroupId
    //Returned by the mbaas.
    function buildRemoteFileUrl(){
      var submissionId = self.getSubmissionId();
      var fileGroupId = self.getFileGroupId();
      var urlTemplate =  appForm.config.get('formUrls', {}).fileSubmissionDownload;
      if(urlTemplate){
        urlTemplate = urlTemplate.replace(":submissionId", submissionId);
        urlTemplate = urlTemplate.replace(":fileGroupId", fileGroupId);
        urlTemplate = urlTemplate.replace(":appId", appForm.config.get('appId', "notSet"));
        return appForm.models.config.getCloudHost() + "/mbaas" + urlTemplate;
      } else {
        return  "notset";
      }
    }

    return buildRemoteFileUrl();
  };
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  module.FormSubmission = FormSubmission;
  function FormSubmission(submissionJSON) {
    Model.call(this, {
      '_type': 'formSubmission',
      'data': submissionJSON
    });
  }
  appForm.utils.extend(FormSubmission, Model);
  FormSubmission.prototype.getProps = function () {
    return this.get('data');
  };
  FormSubmission.prototype.getFormId = function () {
    if(!this.get('data')){
      $fh.forms.log.e("No form data for form submission");
    }

    return this.get('data').formId;
  };
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  module.FormSubmissionComplete = FormSubmissionComplete;
  function FormSubmissionComplete(submissionTask) {
    Model.call(this, {
      '_type': 'completeSubmission',
      'submissionId': submissionTask.get('submissionId'),
      'localSubmissionId': submissionTask.get('localSubmissionId')
    });
  }
  appForm.utils.extend(FormSubmissionComplete, Model);
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  module.FormSubmissionDownload = FormSubmissionDownload;
  function FormSubmissionDownload(uploadTask) {
    Model.call(this, {
      '_type': 'formSubmissionDownload',
      'data': uploadTask
    });
  }
  appForm.utils.extend(FormSubmissionDownload, Model);
  FormSubmissionDownload.prototype.getSubmissionId = function () {
    return this.get('data').get("submissionId", "not-set");
  };
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  module.FormSubmissionStatus = FormSubmissionStatus;
  function FormSubmissionStatus(submissionTask) {
    Model.call(this, {
      '_type': 'submissionStatus',
      'submissionId': submissionTask.get('submissionId'),
      'localSubmissionId': submissionTask.get('localSubmissionId')
    });
  }
  appForm.utils.extend(FormSubmissionStatus, Model);
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var FileSubmission = appForm.models.FileSubmission;
  module.Base64FileSubmission = Base64FileSubmission;
  function Base64FileSubmission(fileData) {
    FileSubmission.call(this, fileData);
    this.set('_type', 'base64fileSubmission');
  }
  appForm.utils.extend(Base64FileSubmission, FileSubmission);
  return module;
}(appForm.models || {});
appForm.models = function(module) {
    var Model = appForm.models.Model;

    function Submissions() {
        Model.call(this, {
            '_type': 'submissions',
            '_ludid': 'submissions_list',
            'submissions': []
        });
    }
    appForm.utils.extend(Submissions, Model);
    Submissions.prototype.setLocalId = function() {
        $fh.forms.log.e("Submissions setLocalId. Not Permitted for submissions.");
    };
    /**
     * save a submission to list and store it immediately
     * @param  {[type]}   submission [description]
     * @param  {Function} cb         [description]
     * @return {[type]}              [description]
     */
    Submissions.prototype.saveSubmission = function(submission, cb) {
        $fh.forms.log.d("Submissions saveSubmission");
        var self = this;
        this.updateSubmissionWithoutSaving(submission);
        this.clearSentSubmission(function() {
            self.saveLocal(cb);
        });
    };
    Submissions.prototype.updateSubmissionWithoutSaving = function(submission) {
        $fh.forms.log.d("Submissions updateSubmissionWithoutSaving");
        var pruneData = this.pruneSubmission(submission);
        var localId = pruneData._ludid;
        if (localId) {
            var meta = this.findMetaByLocalId(localId);
            var submissions = this.get('submissions');
            if (meta) {
                //existed, remove the old meta and save the new one.
                submissions.splice(submissions.indexOf(meta), 1);
                submissions.push(pruneData);
            } else {
                // not existed, insert to the tail.
                submissions.push(pruneData);
            }
        } else {
            // invalid local id.
            $fh.forms.log.e('Invalid submission for localId:', localId, JSON.stringify(submission));
        }
    };
    Submissions.prototype.clearSentSubmission = function(cb) {
        $fh.forms.log.d("Submissions clearSentSubmission");
        var self = this;
        var maxSent = $fh.forms.config.get("max_sent_saved") ? $fh.forms.config.get("max_sent_saved") : $fh.forms.config.get("sent_save_min");
        var submissions = this.get("submissions");
        var sentSubmissions = this.getSubmitted();


        if (sentSubmissions.length > maxSent) {
            $fh.forms.log.d("Submissions clearSentSubmission pruning sentSubmissions.length>maxSent");
            sentSubmissions = sentSubmissions.sort(function(a, b) {
                if (Date(a.submittedDate) < Date(b.submittedDate)) {
                    return 1;
                } else {
                    return -1;
                }
            });
            var toBeRemoved = [];
            while (sentSubmissions.length > maxSent) {
                toBeRemoved.push(sentSubmissions.pop());
            }
            var count = toBeRemoved.length;
            for (var i = 0; i < toBeRemoved.length; i++) {
                var subMeta = toBeRemoved[i];
                self.getSubmissionByMeta(subMeta, function(err, submission) {
                    submission.clearLocal(function(err) {
                        if (err) {
                            $fh.forms.log.e("Submissions clearSentSubmission submission clearLocal", err);
                        }
                        count--;
                        if (count === 0) {
                            cb(null, null);
                        }
                    });
                });
            }
        } else {
            cb(null, null);
        }
    };
    Submissions.prototype.findByFormId = function(formId) {
        $fh.forms.log.d("Submissions findByFormId", formId);
        var rtn = [];
        var submissions = this.get('submissions');
        for (var i = 0; i < submissions.length; i++) {
            var obj = submissions[i];
            if (submissions[i].formId === formId) {
                rtn.push(obj);
            }
        }
        return rtn;
    };
    Submissions.prototype.getSubmissions = function() {
        return this.get('submissions');
    };
    Submissions.prototype.getSubmissionMetaList = Submissions.prototype.getSubmissions;
    //function alias


    //Getting A Submission Model By Local ID
    Submissions.prototype.getSubmissionByLocalId = function(localId, cb){
        var self = this;
        $fh.forms.log.d("Submissions getSubmissionByLocalId", localId);
        var submissionMeta = self.findMetaByLocalId(localId);
        if(!submissionMeta){
            return cb("No submissions for localId: " + localId);
        }

        self.getSubmissionByMeta(submissionMeta, cb);
    };

    //Getting A Submission Model By Remote ID
    Submissions.prototype.getSubmissionByRemoteId = function(remoteId, cb){
        var self = this;
        $fh.forms.log.d("Submissions getSubmissionByRemoteId", remoteId);
        var submissionMeta = self.findMetaByRemoteId(remoteId);
        if(!submissionMeta){
            return cb("No submissions for remoteId: " + remoteId);
        }

        self.getSubmissionByMeta(submissionMeta, cb);
    };

    Submissions.prototype.findMetaByLocalId = function(localId) {
        $fh.forms.log.d("Submissions findMetaByLocalId", localId);
        var submissions = this.get('submissions');
        for (var i = 0; i < submissions.length; i++) {
            var obj = submissions[i];
            if (submissions[i]._ludid === localId) {
                return obj;
            }
        }

        $fh.forms.log.e("Submissions findMetaByLocalId: No submissions for localId: ", localId);
        return null;
    };

    /**
     * Finding a submission object by it's remote Id
     * @param remoteId
     * @returns {*}
     */
    Submissions.prototype.findMetaByRemoteId = function(remoteId) {
        remoteId = remoteId || "";

        $fh.forms.log.d("Submissions findMetaByRemoteId: " + remoteId);
        var submissions = this.get('submissions');
        for (var i = 0; i < submissions.length; i++) {
            var obj = submissions[i];
            if (submissions[i].submissionId) {
                if (submissions[i].submissionId === remoteId) {
                    return obj;
                }
            }
        }

        return null;
    };
    Submissions.prototype.pruneSubmission = function(submission) {
        $fh.forms.log.d("Submissions pruneSubmission");
        var fields = [
            '_id',
            '_ludid',
            'status',
            'formName',
            'formId',
            '_localLastUpdate',
            'createDate',
            'submitDate',
            'deviceFormTimestamp',
            'errorMessage',
            'submissionStartedTimestamp',
            'submittedDate',
            'submissionId',
            'saveDate',
            'uploadStartDate'
        ];
        var data = submission.getProps();
        var rtn = {};
        for (var i = 0; i < fields.length; i++) {
            var key = fields[i];
            rtn[key] = data[key];
        }
        return rtn;
    };

    Submissions.prototype.clear = function(cb) {
        $fh.forms.log.d("Submissions clear");
        var that = this;
        this.clearLocal(function(err) {
            if (err) {
                $fh.forms.log.e(err);
                cb(err);
            } else {
                that.set("submissions", []);
                cb(null, null);
            }
        });
    };
    Submissions.prototype.getDrafts = function(params) {
        $fh.forms.log.d("Submissions getDrafts: ", params);
        if (!params) {
            params = {};
        }
        params.status = "draft";
        return this.findByStatus(params);
    };
    Submissions.prototype.getPending = function(params) {
        $fh.forms.log.d("Submissions getPending: ", params);
        if (!params) {
            params = {};
        }
        params.status = "pending";
        return this.findByStatus(params);
    };
    Submissions.prototype.getSubmitted = function(params) {
        $fh.forms.log.d("Submissions getSubmitted: ", params);
        if (!params) {
            params = {};
        }
        params.status = "submitted";
        return this.findByStatus(params);
    };
    Submissions.prototype.getError = function(params) {
        $fh.forms.log.d("Submissions getError: ", params);
        if (!params) {
            params = {};
        }
        params.status = "error";
        return this.findByStatus(params);
    };
    Submissions.prototype.getInProgress = function(params) {
        $fh.forms.log.d("Submissions getInProgress: ", params);
        if (!params) {
            params = {};
        }
        params.status = "inprogress";
        return this.findByStatus(params);
    };
    Submissions.prototype.getDownloaded = function(params) {
        $fh.forms.log.d("Submissions getDownloaded: ", params);
        if (!params) {
            params = {};
        }
        params.status = "downloaded";
        return this.findByStatus(params);
    };
    Submissions.prototype.findByStatus = function(params) {
        $fh.forms.log.d("Submissions findByStatus: ", params);
        if (!params) {
            params = {};
        }
        if (typeof params === "string") {
            params = {
                status: params
            };
        }
        if (params.status === null) {
            return [];
        }

        var status = params.status;
        var formId = params.formId;
        var sortField = params.sortField || "createDate";

        var submissions = this.get("submissions", []);
        var rtn = [];
        for (var i = 0; i < submissions.length; i++) {
            if (status.indexOf(submissions[i].status) > -1) {
                if (formId != null) {
                    if (submissions[i].formId === formId) {
                        rtn.push(submissions[i]);
                    }
                } else {
                    rtn.push(submissions[i]);
                }

            }
        }

        rtn = rtn.sort(function(a, b) {
            if (Date(a[sortField]) < Date(b[sortField])) {
                return -1;
            } else {
                return 1;
            }
        });

        return rtn;
    };
    /**
     * return a submission model object by the meta data passed in.
     * @param  {[type]}   meta [description]
     * @param  {Function} cb   [description]
     * @return {[type]}        [description]
     */
    Submissions.prototype.getSubmissionByMeta = function(meta, cb) {
        $fh.forms.log.d("Submissions getSubmissionByMeta: ", meta);
        var localId = meta._ludid;
        if (localId) {
            appForm.models.submission.fromLocal(localId, cb);
        } else {
            $fh.forms.log.e("Submissions getSubmissionByMeta: local id not found for retrieving submission.", localId, meta);
            cb("local id not found for retrieving submission");
        }
    };
    Submissions.prototype.removeSubmission = function(localId, cb) {
        $fh.forms.log.d("Submissions removeSubmission: ", localId);
        var index = this.indexOf(localId);
        if (index > -1) {
            this.get('submissions').splice(index, 1);
        }
        this.saveLocal(cb);
    };
    Submissions.prototype.indexOf = function(localId, cb) {
        $fh.forms.log.d("Submissions indexOf: ", localId);
        var submissions = this.get('submissions');
        for (var i = 0; i < submissions.length; i++) {
            var obj = submissions[i];
            if (submissions[i]._ludid === localId) {
                return i;
            }
        }
        return -1;
    };
    module.submissions = new Submissions();
    return module;
}(appForm.models || {});
appForm.models = function(module) {
  module.submission = {
    newInstance: newInstance,
    fromLocal: fromLocal
  };
  //implmenetation
  var _submissions = {};
  //cache in mem for single reference usage.
  var Model = appForm.models.Model;
  var statusMachine = {
    'new': [
      'draft',
      'pending'
    ],
    'draft': [
      'pending',
      'draft'
    ],
    'pending': [
      'inprogress',
      'error',
      'draft'
    ],
    'inprogress': [
      'pending',
      'error',
      'inprogress',
      'downloaded',
      'queued'
    ],
    'submitted': [],
    'error': [
      'draft',
      'pending',
      'error'
    ],
    'downloaded' : [],
    'queued' : ['error', 'submitted']
  };

  function newInstance(form, params) {
    params = params ? params : {};
    var sub = new Submission(form, params);

    if(params.submissionId){
      appForm.models.submissions.updateSubmissionWithoutSaving(sub);
    }
    return sub;
  }

  function fromLocal(localId, cb) {
    $fh.forms.log.d("Submission fromLocal: ", localId);
    if (_submissions[localId]) {
      $fh.forms.log.d("Submission fromLocal from cache: ", localId);
      //already loaded
      cb(null, _submissions[localId]);
    } else {
      //load from storage
      $fh.forms.log.d("Submission fromLocal not in cache. Loading from local storage.: ", localId);
      var submissionObject = new Submission();
      submissionObject.setLocalId(localId);
      submissionObject.loadLocal(function(err, submission) {
        if (err) {
          $fh.forms.log.e("Submission fromLocal. Error loading from local: ", localId, err);
          cb(err);
        } else {
          $fh.forms.log.d("Submission fromLocal. Load from local sucessfull: ", localId);
          if(submission.isDownloadSubmission()){
            return cb(null, submission);
          } else {
            submission.reloadForm(function(err, res) {
              if (err) {
                $fh.forms.log.e("Submission fromLocal. reloadForm. Error re-loading form: ", localId, err);
                cb(err);
              } else {
                $fh.forms.log.d("Submission fromLocal. reloadForm. Re-loading form successfull: ", localId);
                _submissions[localId] = submission;
                cb(null, submission);
              }
            });
          }

        }
      });
    }
  }

  function Submission(form, params) {
    params = params || {};
    $fh.forms.log.d("Submission: ", params);
    Model.call(this, {
      '_type': 'submission'
    });
    if (typeof form !== 'undefined' && form) {
      this.set('formName', form.get('name'));
      this.set('formId', form.get('_id'));
      this.set('deviceFormTimestamp', form.getLastUpdate());
      this.set('createDate', appForm.utils.getTime());
      this.set('timezoneOffset', appForm.utils.getTime(true));
      this.set('appId', appForm.config.get('appId'));
      this.set('appEnvironment', appForm.config.get('env'));
      this.set('appCloudName', '');
      this.set('comments', []);
      this.set('formFields', []);
      this.set('saveDate', null);
      this.set('submitDate', null);
      this.set('uploadStartDate', null);
      this.set('submittedDate', null);
      this.set('userId', null);
      this.set('filesInSubmission', []);
      this.set('deviceId', appForm.config.get('deviceId'));
      this.transactionMode = false;
    } else {
      this.set('appId', appForm.config.get('appId'));
      if(params.submissionId){
        this.set('downloadSubmission', true);
        this.setRemoteSubmissionId(params.submissionId);
      } else {
        this.set('status', 'new');
      }
    }
    this.set('status', 'new');
    this.genLocalId();
    var localId = this.getLocalId();
    _submissions[localId] = this;
  }
  appForm.utils.extend(Submission, Model);
  /**
   * save current submission as draft
   * @return {[type]} [description]
   */
  Submission.prototype.saveDraft = function(cb) {
    $fh.forms.log.d("Submission saveDraft: ");
    var targetStatus = 'draft';
    var that = this;
    this.set('timezoneOffset', appForm.utils.getTime(true));
    this.set('saveDate', appForm.utils.getTime());
    this.changeStatus(targetStatus, function(err) {
      if (err) {
        return cb(err);
      } else {
        that.emit('savedraft');
        cb(null, null);
      }
    });
  };
  Submission.prototype.validateField = function(fieldId, cb) {
    $fh.forms.log.d("Submission validateField: ", fieldId);
    var that = this;
    this.getForm(function(err, form) {
      if (err) {
        cb(err);
      } else {
        var submissionData = that.getProps();
        var ruleEngine = form.getRuleEngine();
        ruleEngine.validateField(fieldId, submissionData, cb);
      }
    });
  };
  Submission.prototype.checkRules = function(cb) {
    $fh.forms.log.d("Submission checkRules: ");
    var self = this;
    this.getForm(function(err, form) {
      if (err) {
        cb(err);
      } else {
        var submission = self.getProps();
        var ruleEngine = form.getRuleEngine();
        ruleEngine.checkRules(submission, cb);
      }
    });
  };

  Submission.prototype.performValidation = function(cb){
    var self = this;
    self.getForm(function(err, form) {
      if (err) {
        $fh.forms.log.e("Submission submit: Error getting form ", err);
        return cb(err);
      }
      var ruleEngine = form.getRuleEngine();
      var submission = self.getProps();
      ruleEngine.validateForm(submission, cb);
    });
  };

  /**
   * Validate the submission only.
   */
  Submission.prototype.validateSubmission = function(cb){
    var self = this;

    self.performValidation(function(err, res){
      if(err){
        return cb(err);
      }
      var validation = res.validation;
      if (validation.valid) {
        return cb(null, validation.valid);
      } else {
        self.emit('validationerror', validation);
        cb(null, validation.valid);
      }
    });
  };

  /**
   * submit current submission to remote
   * @param  {Function} cb [description]
   * @return {[type]}      [description]
   */
  Submission.prototype.submit = function(cb) {
    var that = this;
    $fh.forms.log.d("Submission submit: ");
    var targetStatus = 'pending';
    var validateResult = true;

    this.set('timezoneOffset', appForm.utils.getTime(true));
    this.pruneNullValues();
    that.performValidation(function(err, res){
      if (err) {
        $fh.forms.log.e("Submission submit validateForm: Error validating form ", err);
        cb(err);
      } else {
        $fh.forms.log.d("Submission submit: validateForm. Completed result", res);
        var validation = res.validation;
        if (validation.valid) {
          $fh.forms.log.d("Submission submit: validateForm. Completed Form Valid", res);
          that.set('submitDate', new Date());
          that.changeStatus(targetStatus, function(error) {
            if (error) {
              cb(error);
            } else {
              that.emit('submit');
              cb(null, null);
            }
          });
        } else {
          $fh.forms.log.d("Submission submit: validateForm. Completed Validation error", res);
          that.emit('validationerror', validation);
          cb('Validation error');
        }
      }
    });
  };
  Submission.prototype.getUploadTask = function(cb) {
    var taskId = this.getUploadTaskId();
    if (taskId) {
      appForm.models.uploadManager.getTaskById(taskId, cb);
    } else {
      cb(null, null);
    }
  };
  Submission.prototype.getFormId = function(){
    return this.get("formId");
  };
  /**
   * If a submission is a download submission, the JSON definition of the form
   * that it was submitted against is contained in the submission.
   */
  Submission.prototype.getFormSubmittedAgainst = function(){
    return this.get("formSubmittedAgainst");
  };
  Submission.prototype.getDownloadTask = function(cb){
    var self = this;
    $fh.forms.log.d("getDownloadTask");
    if(self.isDownloadSubmission()){
      self.getUploadTask(cb);
    } else {
      if(cb && typeof(cb) === 'function'){
        $fh.forms.log.e("Submission is not a download submission");
        return cb("Submission is not a download submission");
      }
    }
  };
  Submission.prototype.cancelUploadTask = function(cb) {
    var targetStatus = 'submit';
    var that = this;
    appForm.models.uploadManager.cancelSubmission(this, function(err) {
      if (err) {
        $fh.forms.log.e(err);
      }
      that.changeStatus(targetStatus, cb);
    });
  };
  Submission.prototype.getUploadTaskId = function() {
    return this.get('uploadTaskId');
  };
  Submission.prototype.setUploadTaskId = function(utId) {
    this.set('uploadTaskId', utId);
  };
  Submission.prototype.isInProgress = function(){
    return this.get("status") === "inprogress";
  };
  Submission.prototype.isDownloaded = function(){
    return this.get("status") === "downloaded";
  };
  Submission.prototype.isSubmitted = function(){
    return this.get("status") === "submitted";
  };
  Submission.prototype.submitted = function(cb) {
    var self = this;
    if(self.isDownloadSubmission()){
      var errMsg = "Downloaded submissions should not call submitted function.";
      $fh.forms.log.e(errMsg);
      return cb(errMsg);
    }
    $fh.forms.log.d("Submission submitted called");

    var targetStatus = 'submitted';

    self.set('submittedDate', appForm.utils.getTime());
    self.changeStatus(targetStatus, function(err) {
      if (err) {
        $fh.forms.log.e("Error setting submitted status " + err);
        cb(err);
      } else {
        $fh.forms.log.d("Submitted status set for submission " + self.get('submissionId') + " with localId " + self.getLocalId());
        self.emit('submitted', self.get('submissionId'));
        cb(null, null);
      }
    });
  };
  Submission.prototype.queued = function(cb){
    var self = this;
    if(self.isDownloadSubmission()){
      var errMsg = "Downloaded submissions should not call queued function.";
      $fh.forms.log.e(errMsg);
      return cb(errMsg);
    }

     var targetStatus = 'queued';
     self.set('queuedDate', appForm.utils.getTime());
     self.changeStatus(targetStatus, function(err) {
      if (err) {
        $fh.forms.log.e("Error setting queued status " + err);
        cb(err);
      } else {
        $fh.forms.log.d("Queued status set for submission " + self.get('submissionId') + " with localId " + self.getLocalId());
        self.emit('queued', self.get('submissionId'));
        cb(null, self);
      }
    });
  };
  Submission.prototype.downloaded = function(cb){
    $fh.forms.log.d("Submission Downloaded called");
    var that = this;
    var targetStatus = 'downloaded';

    that.set('downloadedDate', appForm.utils.getTime());
    that.pruneNullValues();
    that.changeStatus(targetStatus, function(err) {
      if (err) {
        $fh.forms.log.e("Error setting downloaded status " + err);
        cb(err);
      } else {
        $fh.forms.log.d("Downloaded status set for submission " + that.get('submissionId') + " with localId " + that.getLocalId());
        that.emit('downloaded', that.get('submissionId'));
        cb(null, that);
      }
    });
  };


  /**
   * Submission.prototype.pruneNullValues - Pruning null values from the submission
   *
   * @return {type}  description
   */
  Submission.prototype.pruneNullValues = function(){
    var formFields = this.getFormFields();

    for(var formFieldIndex = 0; formFieldIndex < formFields.length; formFieldIndex++){
      formFields[formFieldIndex].fieldValues = formFields[formFieldIndex].fieldValues || [];
      formFields[formFieldIndex].fieldValues = formFields[formFieldIndex].fieldValues.filter(function(fieldValue){
        return fieldValue !== null && typeof(fieldValue) !== "undefined";
      });
    }

    this.setFormFields(formFields);
  };
  //joint form id and submissions timestamp.
  Submission.prototype.genLocalId = function() {
    var lid = appForm.utils.localId(this);
    var formId = this.get('formId') || Math.ceil(Math.random() * 100000);
    this.setLocalId(formId + '_' + lid);
  };
  /**
   * change status and save the submission locally and register to submissions list.
   * @param {[type]} status [description]
   */
  Submission.prototype.changeStatus = function(status, cb) {
    if (this.isStatusValid(status)) {
      var that = this;
      this.set('status', status);
      this.saveToList(function(err) {
        if (err) {
          $fh.forms.log.e(err);
        }
      });
      this.saveLocal(cb);
    } else {
      $fh.forms.log.e('Target status is not valid: ' + status);
      cb('Target status is not valid: ' + status);
    }
  };
  Submission.prototype.upload = function(cb) {
    var targetStatus = "inprogress";
    var self = this;
    if (this.isStatusValid(targetStatus)) {
      this.set("status", targetStatus);
      this.set("uploadStartDate", appForm.utils.getTime());
      appForm.models.submissions.updateSubmissionWithoutSaving(this);
      appForm.models.uploadManager.queueSubmission(self, function(err, ut) {
        if (err) {
          cb(err);
        } else {
          ut.set("error", null);
          ut.saveLocal(function(err) {
            if (err) {
              $fh.forms.log.e("Error saving upload task: " + err);
            }
          });
          self.emit("inprogress", ut);
          ut.on("progress", function(progress) {
            $fh.forms.log.d("Emitting upload progress for submission: " + self.getLocalId() + JSON.stringify(progress));
            self.emit("progress", progress);
          });
          cb(null, ut);
        }
      });
    } else {
      return cb("Invalid Status to upload a form submission.");
    }
  };
  Submission.prototype.download = function(cb){
    var that = this;
    $fh.forms.log.d("Starting download for submission: " + that.getLocalId());
    var targetStatus = "pending";
    if(this.isStatusValid(targetStatus)){
      this.set("status", targetStatus);
      targetStatus = "inprogress";
      if(this.isStatusValid(targetStatus)){
        this.set("status", targetStatus);
        //Status is valid, add the submission to the
        appForm.models.uploadManager.queueSubmission(that, function(err, downloadTask) {
          if(err){
            return cb(err);
          }
          downloadTask.set("error", null);
          downloadTask.saveLocal(function(err) {
            if (err) {
              $fh.forms.log.e("Error saving download task: " + err);
            }
          });
          that.emit("inprogress", downloadTask);
          downloadTask.on("progress", function(progress) {
            $fh.forms.log.d("Emitting download progress for submission: " + that.getLocalId() + JSON.stringify(progress));
            that.emit("progress", progress);
          });
          return cb(null, downloadTask);
        });
      } else {
        return cb("Invalid Status to dowload a form submission");
      }
    } else {
      return cb("Invalid Status to download a form submission.");
    }
  };
  Submission.prototype.saveToList = function(cb) {
    appForm.models.submissions.saveSubmission(this, cb);
  };
  Submission.prototype.error = function(errorMsg, cb) {
    this.set('errorMessage', errorMsg);
    var targetStatus = 'error';
    this.changeStatus(targetStatus, cb);
    this.emit('error', errorMsg);
  };
  Submission.prototype.getStatus = function() {
    return this.get('status');
  };
  Submission.prototype.getErrorMessage = function(){
    return this.get('errorMessage', 'No Error');
  };
  /**
   * check if a target status is valid
   * @param  {[type]}  targetStatus [description]
   * @return {Boolean}              [description]
   */
  Submission.prototype.isStatusValid = function(targetStatus) {
    $fh.forms.log.d("isStatusValid. Target Status: " + targetStatus + " Current Status: " + this.get('status').toLowerCase());
    var status = this.get('status').toLowerCase();
    var nextStatus = statusMachine[status];
    if (nextStatus.indexOf(targetStatus) > -1) {
      return true;
    } else {
      this.set('status', 'error');
      return false;
    }
  };
  Submission.prototype.addComment = function(msg, user) {
    var now = appForm.utils.getTime();
    var ts = now.getTime();
    var newComment = {
      'madeBy': typeof user === 'undefined' ? '' : user.toString(),
      'madeOn': now,
      'value': msg,
      'timeStamp': ts
    };
    this.getComments().push(newComment);
    return ts;
  };
  Submission.prototype.getComments = function() {
    return this.get('comments');
  };
  Submission.prototype.removeComment = function(timeStamp) {
    var comments = this.getComments();
    for (var i = 0; i < comments.length; i++) {
      var comment = comments[i];
      if (comment.timeStamp === timeStamp) {
        comments.splice(i, 1);
        return;
      }
    }
  };

  Submission.prototype.populateFilesInSubmission = function() {
    var self = this;
    var tmpFileNames = [];

    var submissionFiles = self.getSubmissionFiles();
    for (var fieldValIndex = 0; fieldValIndex < submissionFiles.length; fieldValIndex++) {
      if(submissionFiles[fieldValIndex].fileName){
        tmpFileNames.push(submissionFiles[fieldValIndex].fileName);
      } else if(submissionFiles[fieldValIndex].hashName){
        tmpFileNames.push(submissionFiles[fieldValIndex].hashName);
      }
    }

    self.set("filesInSubmission", submissionFiles);
  };

  Submission.prototype.getSubmissionFiles = function() {
    var self = this;
    $fh.forms.log.d("In getSubmissionFiles: " + self.getLocalId());
    var submissionFiles = [];

    var formFields = self.getFormFields();

    for (var formFieldIndex = 0; formFieldIndex < formFields.length; formFieldIndex++) {
      var tmpFieldValues = formFields[formFieldIndex].fieldValues || [];
      for (var fieldValIndex = 0; fieldValIndex < tmpFieldValues.length; fieldValIndex++) {
        if(tmpFieldValues[fieldValIndex] && tmpFieldValues[fieldValIndex].fileName){
          submissionFiles.push(tmpFieldValues[fieldValIndex]);
        } else if(tmpFieldValues[fieldValIndex] && tmpFieldValues[fieldValIndex].hashName){
          submissionFiles.push(tmpFieldValues[fieldValIndex]);
        }
      }

    }

    return submissionFiles;
  };

  /**
   * Add a value to submission.
   * This will not cause the field been validated.
   * Validation should happen:
   * 1. onblur (field value)
   * 2. onsubmit (whole submission json)
   *
   * @param {[type]} params   {"fieldId","value","index":optional}
   * @param {} cb(err,res) callback function when finished
   * @return true / error message
   */
  Submission.prototype.addInputValue = function(params, cb) {
    $fh.forms.log.d("Adding input value: ", JSON.stringify(params || {}));
    var that = this;
    var fieldId = params.fieldId;
    var inputValue = params.value;
    var index = params.index === undefined ? -1 : params.index;

    if(!fieldId){
      return cb("Invalid parameters. fieldId is required");
    }

    //Transaction entries are not saved to memory, they are only saved when the transaction has completed.
    function processTransaction(form, fieldModel){
      if (!that.tmpFields[fieldId]) {
        that.tmpFields[fieldId] = [];
      }

      params.isStore = false;//Don't store the files until the transaction is complete
      fieldModel.processInput(params, function(err, result) {
        if (err) {
          return cb(err);
        } else {
          if (index > -1) {
            that.tmpFields[fieldId][index] = result;
          } else {
            that.tmpFields[fieldId].push(result);
          }

          return cb(null, result);
        }
      });
    }

    //Direct entries are saved immediately to local storage when they are input.
    function processDirectStore(form, fieldModel){
      var target = that.getInputValueObjectById(fieldId);

      //File already exists for this input, overwrite rather than create a new file
      //If pushing the value to the end of the list, then there will be no previous value
      if(index > -1 && target.fieldValues[index]){
        if(typeof(target.fieldValues[index].hashName) === "string"){
          params.previousFile = target.fieldValues[index];
        } else {
          params.previousValue = target.fieldValues[index];
        }
      }

      fieldModel.processInput(params, function(err, result) {
        if (err) {
          return cb(err);
        } else {
          if (index > -1) {
            target.fieldValues[index] = result;
          } else {
            target.fieldValues.push(result);
          }

          if(result && typeof(result.hashName) === "string"){
            that.pushFile(result.hashName);
          }

          return cb(null, result);
        }
      });
    }

    function gotForm(err, form) {
      var fieldModel = form.getFieldModelById(fieldId);

      if(!fieldModel){
        return cb("No field model found for fieldId " + fieldId);
      }

      if (that.transactionMode) {
        processTransaction(form, fieldModel);
      } else {
        processDirectStore(form, fieldModel);
      }
    }

    this.getForm(gotForm);
  };
  Submission.prototype.pushFile = function(hashName){
    var subFiles = this.get('filesInSubmission', []);
    if(typeof(hashName) === "string"){
      if(subFiles.indexOf(hashName) === -1){
        subFiles.push(hashName);
        this.set('filesInSubmission', subFiles);
      }
    }
  };
  Submission.prototype.removeFileValue = function(hashName){
    var subFiles = this.get('filesInSubmission', []);
    if(typeof(hashName) === "string" && subFiles.indexOf(hashName) > -1){
      subFiles.splice(subFiles.indexOf(hashName),1);
      this.set('filesInSubmission', subFiles);
    }
  };
  Submission.prototype.getInputValueByFieldId = function(fieldId, cb) {
    var self = this;
    var values = this.getInputValueObjectById(fieldId).fieldValues;
    this.getForm(function(err, form) {
      var fieldModel = form.getFieldModelById(fieldId);
      fieldModel.convertSubmission(values, cb);
    });
  };
  /**
   * Reset submission
   * @return {[type]} [description]
   */
  Submission.prototype.reset = function() {
    var self = this;
    self.clearLocalSubmissionFiles(function(err){
      self.set('formFields', []);
    });
  };
  Submission.prototype.isDownloadSubmission = function(){
    return this.get("downloadSubmission") === true;
  };

  Submission.prototype.getSubmissionFile = function(fileName, cb){
    appForm.stores.localStorage.readFile(fileName, cb);
  };
  Submission.prototype.clearLocalSubmissionFiles = function(cb) {
    $fh.forms.log.d("In clearLocalSubmissionFiles");
    var self = this;
    var filesInSubmission = self.get("filesInSubmission", []);
    $fh.forms.log.d("Files to clear ", filesInSubmission);
    var localFileName = "";

    for (var fileMetaObject in filesInSubmission) {
      $fh.forms.log.d("Clearing file " + filesInSubmission[fileMetaObject]);
      appForm.stores.localStorage.removeEntry(filesInSubmission[fileMetaObject], function(err) {
        if (err) {
          $fh.forms.log.e("Error removing files from " + err);
        }
      });
    }
    cb();
  };
  Submission.prototype.startInputTransaction = function() {
    this.transactionMode = true;
    this.tmpFields = {};
  };
  Submission.prototype.endInputTransaction = function(succeed) {
    this.transactionMode = false;
    var tmpFields = {};
    var fieldId = "";
    var valIndex = 0;
    var valArr = [];
    var val = "";
    if (succeed) {
      tmpFields = this.tmpFields;
      for (fieldId in tmpFields) {
        var target = this.getInputValueObjectById(fieldId);
        valArr = tmpFields[fieldId];
        for (valIndex = 0; valIndex < valArr.length; valIndex++) {
          val = valArr[valIndex];
          target.fieldValues.push(val);
          if(typeof(val.hashName) === "string"){
            this.pushFile(val.hashName);
          }
        }
      }
      this.tmpFields = {};
    } else {
      //clear any files set as part of the transaction
      tmpFields = this.tmpFields;
      this.tmpFields = {};
      for (fieldId in tmpFields) {
        valArr = tmpFields[fieldId];
        for (valIndex = 0; valIndex < valArr.length; valIndex++) {
          val = valArr[valIndex];
          if(typeof(val.hashName) === "string"){
            //This is a file, needs to be removed
            appForm.stores.localStorage.removeEntry(val.hashName, function(err){
              $fh.forms.log.e("Error removing file from transaction ", err);
            });
          }
        }
      }
    }
  };
  /**
   * remove an input value from submission
   * @param  {[type]} fieldId field id
   * @param  {[type]} index (optional) the position of the value will be removed if it is repeated field.
   * @param  {function} [Optional callback]
   * @return {[type]}         [description]
   */
  Submission.prototype.removeFieldValue = function(fieldId, index, callback) {
    callback = callback || function(){};
    var self = this;
    var targetArr = [];
    var valsRemoved = {};
    if (this.transactionMode) {
      targetArr = this.tmpFields.fieldId;
    } else {
      targetArr = this.getInputValueObjectById(fieldId).fieldValues;
    }
    //If no index is supplied, all values are removed.
    if (typeof index === 'undefined') {
      valsRemoved = targetArr.splice(0, targetArr.length);
    } else {
      if (targetArr.length > index) {
        valsRemoved = targetArr.splice(index, 1, null);
      }
    }

    //Clearing up any files from local storage.
    async.forEach(valsRemoved, function(valRemoved, cb){
      if(valRemoved && valRemoved.hashName){
        appForm.stores.localStorage.removeEntry(valRemoved.hashName, function(err){
          if(err){
            $fh.forms.log.e("Error removing file: ", err, valRemoved);
          } else {
            self.removeFileValue(valRemoved.hashName);
          }
          return cb(null, valRemoved);
        });
      } else {
        return cb();
      }
    }, function(err){
      callback(err);
    });
  };
  Submission.prototype.getInputValueObjectById = function(fieldId) {
    var formFields = this.getFormFields();
    for (var i = 0; i < formFields.length; i++) {
      var formField = formFields[i];

      if(formField.fieldId._id){
        if (formField.fieldId._id === fieldId) {
          return formField;
        }
      } else {
        if (formField.fieldId === fieldId) {
          return formField;
        }
      }
    }
    var newField = {
      'fieldId': fieldId,
      'fieldValues': []
    };
    formFields.push(newField);
    return newField;
  };
  /**
   * get form model related to this submission.
   * @return {[type]} [description]
   */
  Submission.prototype.getForm = function(cb) {
    var Form = appForm.models.Form;
    var formId = this.get('formId');

    if(formId){
      $fh.forms.log.d("FormId found for getForm: " + formId);
      new Form({
        'formId': formId,
        'rawMode': true
      }, cb);
    } else {
      $fh.forms.log.e("No form Id specified for getForm");
      return cb("No form Id specified for getForm");
    }
  };
  Submission.prototype.reloadForm = function(cb) {
    $fh.forms.log.d("Submission reload form");
    var Form = appForm.models.Form;
    var formId = this.get('formId');
    var self = this;
    new Form({
      formId: formId,
      'rawMode': true
    }, function(err, form) {
      if (err) {
        cb(err);
      } else {
        self.form = form;
        if (!self.get('deviceFormTimestamp', null)) {
          self.set('deviceFormTimestamp', form.getLastUpdate());
        }
        cb(null, form);
      }
    });
  };
  /**
   * Retrieve all file fields related value
   * If the submission has been downloaded, there is no gurantee that the form is  on-device.
   * @return {[type]} [description]
   */
  Submission.prototype.getFileInputValues = function(cb) {
    var self = this;
    self.getFileFieldsId(function(err, fileFieldIds){
      if(err){
        return cb(err);
      }
      return cb(null, self.getInputValueArray(fileFieldIds));
    });
  };


  /**
   * Submission.prototype.getFormFields - Get the form field input values
   *
   * @return {type}                   description
   */
  Submission.prototype.getFormFields = function(){
    return this.get("formFields", []);
  };

  /**
   * Submission.prototype.getFormFields - Set the form field input values
   *
   * @param  {boolean} includeNullValues flag on whether to include null values or not.
   * @return {type}                   description
   */
  Submission.prototype.setFormFields = function(values){
    return this.get("formFields", values);
  };

  Submission.prototype.getFileFieldsId = function(cb){
    var self = this;
    var formFieldIds = [];

    if(self.isDownloadSubmission()){
      //For Submission downloads, there needs to be a scan through the formFields param
      var formFields = self.getFormFields();

      for(var formFieldIndex = 0; formFieldIndex < formFields.length; formFieldIndex++){
        var formFieldEntry = formFields[formFieldIndex].fieldId || {};
        if(formFieldEntry.type === 'file' || formFieldEntry.type === 'photo'  || formFieldEntry.type === 'signature'){
          if(formFieldEntry._id){
            formFieldIds.push(formFieldEntry._id);
          }
        }
      }
      return cb(null, formFieldIds);
    } else {
      self.getForm(function(err, form){
        if(err){
          $fh.forms.log.e("Error getting form for getFileFieldsId" + err);
          return cb(err);
        }
        return cb(err, form.getFileFieldsId());
      });
    }
  };

  Submission.prototype.updateFileLocalURI = function(fileDetails, newLocalFileURI, cb){
    $fh.forms.log.d("updateFileLocalURI: " + newLocalFileURI);
    var self = this;
    fileDetails = fileDetails || {};

    if(fileDetails.fileName && newLocalFileURI){
      //Search for the file placeholder name.
      self.findFilePlaceholderFieldId(fileDetails.fileName, function(err, fieldDetails){
        if(err){
          return cb(err);
        }
        if(fieldDetails.fieldId){
          var tmpObj = self.getInputValueObjectById(fieldDetails.fieldId).fieldValues[fieldDetails.valueIndex];
          tmpObj.localURI = newLocalFileURI;
          self.getInputValueObjectById(fieldDetails.fieldId).fieldValues[fieldDetails.valueIndex] = tmpObj;
          self.saveLocal(cb);
        } else {
          $fh.forms.log.e("No file field matches the placeholder name " + fileDetails.fileName);
          return cb("No file field matches the placeholder name " + fileDetails.fileName);
        }
      });
    } else {
      $fh.forms.log.e("Submission: updateFileLocalURI : No fileName for submissionId : "+ JSON.stringify(fileDetails));
      return cb("Submission: updateFileLocalURI : No fileName for submissionId : "+ JSON.stringify(fileDetails));
    }
  };

  Submission.prototype.findFilePlaceholderFieldId = function(filePlaceholderName, cb){
    var self = this;
    var fieldDetails = {};
    self.getFileFieldsId(function(err, fieldIds){
      for (var i = 0; i< fieldIds.length; i++) {
        var fieldId = fieldIds[i];
        var inputValue = self.getInputValueObjectById(fieldId);
        for (var j = 0; j < inputValue.fieldValues.length; j++) {
          var tmpObj = inputValue.fieldValues[j];
          if (tmpObj) {
            if(tmpObj.fileName !== null && tmpObj.fileName === filePlaceholderName){
              fieldDetails.fieldId = fieldId;
              fieldDetails.valueIndex = j;
            }
          }
        }
      }
      return cb(null, fieldDetails);
    });
  };

  Submission.prototype.getInputValueArray = function(fieldIds) {
    var rtn = [];
    for (var i = 0; i< fieldIds.length; i++) {
      var  fieldId = fieldIds[i];
      var inputValue = this.getInputValueObjectById(fieldId);
      for (var j = 0; j < inputValue.fieldValues.length; j++) {
        var tmpObj = inputValue.fieldValues[j];
        if (tmpObj) {
          tmpObj.fieldId = fieldId;
          rtn.push(tmpObj);
        }
      }
    }
    return rtn;
  };
  Submission.prototype.clearLocal = function(cb) {
    var self = this;
    //remove from uploading list
    appForm.models.uploadManager.cancelSubmission(self, function(err, uploadTask) {
      if (err) {
        $fh.forms.log.e(err);
        return cb(err);
      }
      //remove from submission list
      appForm.models.submissions.removeSubmission(self.getLocalId(), function(err) {
        if (err) {
          $fh.forms.log.e(err);
          return cb(err);
        }
        self.clearLocalSubmissionFiles(function() {
          Model.prototype.clearLocal.call(self, function(err) {
            if (err) {
              $fh.forms.log.e(err);
              return cb(err);
            }
            cb(null, null);
          });
        });
      });
    });
  };
  Submission.prototype.getRemoteSubmissionId = function() {
    return this.get("submissionId") || this.get('_id');
  };
  Submission.prototype.setRemoteSubmissionId = function(submissionId){
    if(submissionId){
      this.set("submissionId", submissionId);
      this.set("_id", submissionId);
    }
  };
  return module;
}(appForm.models || {});

/**
 * Field model for form
 * @param  {[type]} module [description]
 * @return {[type]}        [description]
 */
appForm.models = function (module) {
  var Model = appForm.models.Model;
  function Field(opt, form) {
    Model.call(this, { '_type': 'field' });
    if (opt) {
      this.fromJSON(opt);
      this.genLocalId();
    }
    if (form) {
      this.form = form;
    }
  }
  appForm.utils.extend(Field, Model);
  Field.prototype.isRequired = function () {
    return this.get('required');
  };
  Field.prototype.getFieldValidation = function () {
    return this.getFieldOptions().validation || {};
  };
  Field.prototype.getFieldDefinition = function () {
    return this.getFieldOptions().definition || {};
  };
  Field.prototype.getMinRepeat = function () {
    var def = this.getFieldDefinition();
    return def.minRepeat || 1;
  };
  Field.prototype.getMaxRepeat = function () {
    var def = this.getFieldDefinition();
    return def.maxRepeat || 1;
  };
  Field.prototype.getFieldOptions = function () {
    return this.get('fieldOptions', {
      'validation': {},
      'definition': {}
    });
  };
  Field.prototype.getPhotoOptions = function(){
    var photoOptions = {
      "targetWidth" : null,
      "targetHeight" : null,
      "quality" : null,
      "saveToPhotoAlbum": null,
      "pictureSource": null,
      "encodingType": null
    };

    var fieldDef = this.getFieldDefinition();
    photoOptions.targetWidth = fieldDef.photoWidth;
    photoOptions.targetHeight = fieldDef.photoHeight;
    photoOptions.quality = fieldDef.photoQuality;
    photoOptions.saveToPhotoAlbum = fieldDef.saveToPhotoAlbum;
    photoOptions.pictureSource = fieldDef.photoSource;
    photoOptions.encodingType = fieldDef.photoType;

    return photoOptions;
  };
  Field.prototype.isRepeating = function () {
    return this.get('repeating', false);
  };
  /**
     * retrieve field type.
     * @return {[type]} [description]
     */
  Field.prototype.getType = function () {
    return this.get('type', 'text');
  };
  Field.prototype.getFieldId = function () {
    return this.get('_id', '');
  };
  Field.prototype.getName = function () {
    return this.get('name', 'unknown');
  };
  /**
   * Function to return the Field Code specified in the studio if it exists
   * otherwise return null.
   */
  Field.prototype.getCode = function(){
    return this.get('fieldCode', null);
  };
  Field.prototype.getHelpText = function () {
    return this.get('helpText', '');
  };

  /**
     * return default value for a field
     *
  */
  Field.prototype.getDefaultValue = function () {
    var def = this.getFieldDefinition();
    if (def) {
      return def.defaultValue;
    }
    return "";
  };

  Field.prototype.isAdminField = function(){
    return this.get("adminOnly");
  };


  /**
     * Process an input value. convert to submission format. run field.validate before this
     * @param  {[type]} params {"value", "isStore":optional}
     * @param {cb} cb(err,res)
     * @return {[type]}           submission json used for fieldValues for the field
     */
  Field.prototype.processInput = function (params, cb) {
    var type = this.getType();
    var processorName = 'process_' + type;
    var inputValue = params.value;
    if (typeof inputValue === 'undefined' || inputValue === null) {
      //if user input is empty, keep going.
      return cb(null, inputValue);
    }
    // try to find specified processor
    if (this[processorName] && typeof this[processorName] === 'function') {
      this[processorName](params, cb);
    } else {
      cb(null, inputValue);
    }
  };
  /**
     * Convert the submission value back to input value.
     * @param  {[type]} submissionValue [description]
     * @param { function} cb callback
     * @return {[type]}                 [description]
     */
  Field.prototype.convertSubmission = function (submissionValue, cb) {
    var type = this.getType();
    var processorName = 'convert_' + type;
    // try to find specified processor
    if (this[processorName] && typeof this[processorName] === 'function') {
      this[processorName](submissionValue, cb);
    } else {
      cb(null, submissionValue);
    }
  };
  /**
     * validate an input with this field.
     * @param  {[type]} inputValue [description]
     * @return true / error message
     */
  Field.prototype.validate = function (inputValue, inputValueIndex, cb) {
    if(typeof(inputValueIndex) === 'function'){
      cb =inputValueIndex;
      inputValueIndex = 0;
    } 
    this.form.getRuleEngine().validateFieldValue(this.getFieldId(), inputValue,inputValueIndex, cb);
  };
  /**
     * return rule array attached to this field.
     * @return {[type]} [description]
     */
  Field.prototype.getRules = function () {
    var id = this.getFieldId();
    return this.form.getRulesByFieldId(id);
  };
  Field.prototype.setVisible = function (isVisible) {
    this.set('visible', isVisible);
    if (isVisible) {
      this.emit('visible');
    } else {
      this.emit('hidden');
    }
  };
  module.Field = Field;
  return module;
}(appForm.models || {});

/**
 * extension of Field class to support barcode field
 */
appForm.models.Field = function (module) {

  //Processing barcode values to the submission format
  //
  module.prototype.process_barcode = function (params, cb) {
    var inputValue = params.value || {};

    /**
     * Barcode value:
     *
     * {
     *   text: "<<Value of the scanned barcode>>",
     *   format: "<<Format of the scanned barcode>>"
     * }
     */
    if(typeof(inputValue.text) === "string" && typeof(inputValue.format) === "string"){
      return cb(null, {text: inputValue.text, format: inputValue.format});
    } else {
      return cb("Invalid barcode parameters.");
    }
  };
  return module;
}(appForm.models.Field || {});

/**
 * extension of Field class to support checkbox field
 */
appForm.models.Field = function (module) {
  module.prototype.getCheckBoxOptions = function () {
    var def = this.getFieldDefinition();
    if (def.options) {
      return def.options;
    } else {
      throw 'checkbox choice definition is not found in field definition';
    }
  };
  module.prototype.process_checkboxes = function (params, cb) {
    var inputValue = params.value;
    if (!inputValue || !inputValue.selections || !(inputValue.selections instanceof Array)){
      cb('the input value for processing checkbox field should be like {selections: [val1,val2]}');
    } else {
      cb(null, inputValue);
    }
  };
  module.prototype.convert_checkboxes = function (value, cb) {
    var rtn = [];
    for (var i = 0; i < value.length; i++) {
      rtn.push(value[i].selections);
    }
    cb(null, rtn);
  };
  return module;
}(appForm.models.Field || {});

/**
 * extension of Field class to support file field
 */
appForm.models.Field = function (module) {
  function checkFileObj(obj) {
    return obj.fileName && obj.fileType && obj.hashName;
  }
  module.prototype.process_file = function (params, cb) {
    var inputValue = params.value;
    var isStore = params.isStore === undefined ? true : params.isStore;
    var lastModDate = new Date().getTime();
    var previousFile = params.previousFile || {};
    var hashName = null;
    if (typeof inputValue === 'undefined' || inputValue === null) {
      return cb("No input value to process_file", null);
    }

    function getFileType(fileType, fileNameString){
      fileType = fileType || "";
      fileNameString = fileNameString || "";

      //The type if file is already known. No need to parse it out.
      if(fileType.length > 0){
        return fileType;
      }

      //Camera does not sent file type. Have to parse it from the file name.
      if(fileNameString.indexOf(".png") > -1){
        return "image/png";
      } else if(fileNameString.indexOf(".jpg") > -1){
        return "image/jpeg";
      } else {
        return "application/octet-stream";
      }
    }

    function getFileName(fileNameString, filePathString){
      fileNameString = fileNameString || "";
      if(fileNameString.length > 0){
        return fileNameString;
      } else {
        //Need to extract the name from the file path
        var indexOfName = filePathString.lastIndexOf("/");
        if(indexOfName > -1){
          return filePathString.slice(indexOfName);
        } else {
          return null;
        }
      }
    }

    var file = inputValue;
    if (inputValue instanceof HTMLInputElement) {
      file = inputValue.files[0] || {};  // 1st file only, not support many files yet.
    }

    if(typeof(file.lastModifiedDate) === 'undefined'){
      lastModDate = appForm.utils.getTime().getTime();
    }

    if(file.lastModifiedDate instanceof Date){
      lastModDate = file.lastModifiedDate.getTime();
    }

    var fileName = getFileName(file.name || file.fileName, file.fullPath);

    var fileType = getFileType(file.type || file.fileType, fileName);

    //Placeholder files do not have a file type. It inherits from previous types
    if(fileName === null && !previousFile.fileName){
      return cb("Expected picture to be PNG or JPEG but was null");
    }

    if(previousFile.hashName){
      if(fileName === previousFile.hashName || file.hashName === previousFile.hashName){
        //Submitting an existing file already saved, no need to save.
        return cb(null, previousFile);
      }
      //If the value has no extension and there is a previous, then it is the same file -- just the hashed version.
      if(fileType === "application/octet-stream"){
        return cb(null, previousFile);
      }
    }

    //The file to be submitted is new
    previousFile =  {
      'fileName': fileName,
      'fileSize': file.size,
      'fileType': fileType,
      'fileUpdateTime': lastModDate,
      'hashName': '',
      'imgHeader': '',
      'contentType': 'binary'
    };

    var name = fileName + new Date().getTime() + Math.ceil(Math.random() * 100000);
    appForm.utils.md5(name, function (err, res) {
      hashName = res;
      if (err) {
        hashName = name;
      }

      hashName = 'filePlaceHolder' + hashName;

      if(fileName.length === 0){
        previousFile.fileName = hashName;
      }

      previousFile.hashName = hashName;
      if (isStore) {
        appForm.stores.localStorage.saveFile(hashName, file, function (err, res) {
          if (err) {
            $fh.forms.log.e(err);
            cb(err);
          } else {
            cb(null, previousFile);
          }
        });
      } else {
        cb(null, previousFile);
      }
    });
  };
  return module;
}(appForm.models.Field || {});

/**
 * extension of Field class to support latitude longitude field
 */
appForm.models.Field = function (module) {
  /**
     * Format: [{lat: number, long: number}]
     * @param  {[type]} inputValues [description]
     * @return {[type]}             [description]
     */
  module.prototype.process_location = function (params, cb) {
    var inputValue = params.value;
    var def = this.getFieldDefinition();
    var obj={};
    switch (def.locationUnit) {
    case 'latlong':
      if (!inputValue.lat || !inputValue["long"]) {
        cb('the input values for latlong field is {lat: number, long: number}');
      } else {
        obj = {
            'lat': inputValue.lat,
            'long': inputValue["long"]
          };
        cb(null, obj);
      }
      break;
    case 'eastnorth':
      if (!inputValue.zone || !inputValue.eastings || !inputValue.northings) {
        cb('the input values for northeast field is {zone: text, eastings: text, northings:text}');
      } else {
        obj = {
            'zone': inputValue.zone,
            'eastings': inputValue.eastings,
            'northings': inputValue.northings
          };
        cb(null, obj);
      }
      break;
    default:
      cb('Invalid subtype type of location field, allowed types: latlong and eastnorth, was: ' + def.locationUnit);
      break;
    }
  };
  return module;
}(appForm.models.Field || {});
/**
 * extension of Field class to support matrix field
 */
appForm.models.Field = function (module) {
  module.prototype.getMatrixRows = function () {
    var def = this.getFieldDefinition();
    if (def.rows) {
      return def.rows;
    } else {
      throw 'matrix rows definition is not found in field definition';
    }
  };
  module.prototype.getMatrixCols = function () {
    var def = this.getFieldDefinition();
    if (def.columns) {
      return def.columns;
    } else {
      throw 'matrix columns definition is not found in field definition';
    }
  };
  return module;
}(appForm.models.Field || {});


/**
 * extension of Field class to support radio field
 */
appForm.models.Field = function (module) {
  module.prototype.getRadioOption = function () {
    var def = this.getFieldDefinition();
    if (def.options) {
      return def.options;
    } else {
      throw 'Radio options definition is not found in field definition';
    }
  };
  return module;
}(appForm.models.Field || {});
/**
 * extension of Field class to support file field
 */
appForm.models.Field = function (module) {
  function checkFileObj(obj) {
    return obj.fileName && obj.fileType && obj.hashName;
  }

  function imageProcess(params, cb) {
    var self = this;
    var inputValue = params.value;
    var isStore = params.isStore === undefined ? true : params.isStore;
    var previousFile = params.previousFile || {};
    if (typeof(inputValue) !== "string") {
      return cb("Expected base64 string image or file URI but parameter was not a string", null);
    }

    //Input value can be either a base64 String or file uri, the behaviour of upload will change accordingly.

    if(inputValue.length < 1){
      return cb("Expected base64 string or file uri but got string of lenght 0:  " + inputValue, null);
    }

    if(inputValue.indexOf(";base64,") > -1){
      var imgName = '';
      var dataArr = inputValue.split(';base64,');
      var imgType = dataArr[0].split(':')[1];
      var extension = imgType.split('/')[1];
      var size = inputValue.length;
      genImageName(function (err, n) {
        imgName = previousFile.hashName ? previousFile.hashName : 'filePlaceHolder' + n;
        //TODO Abstract this out
        var meta = {
          'fileName': imgName + '.' + extension,
          'hashName': imgName,
          'contentType': 'base64',
          'fileSize': size,
          'fileType': imgType,
          'imgHeader': 'data:' + imgType + ';base64,',
          'fileUpdateTime': new Date().getTime()
        };
        if (isStore) {
          appForm.stores.localStorage.updateTextFile(imgName, dataArr[1], function (err, res) {
            if (err) {
              $fh.forms.log.e(err);
              cb(err);
            } else {
              cb(null, meta);
            }
          });
        } else {
          cb(null, meta);
        }
      });
    } else {
      //Image is a file uri, the file needs to be saved as a file.
      //Can use the process_file function to do this.
      //Need to read the file as a file first
      appForm.utils.fileSystem.readAsFile(inputValue, function(err, file){
        if(err){
          return cb(err);
        }

        params.value = file;
        self.process_file(params, cb);
      });
    }
  }
  function genImageName(cb) {
    var name = new Date().getTime() + '' + Math.ceil(Math.random() * 100000);
    appForm.utils.md5(name, cb);
  }
  function convertImage(value, cb) {
    if (value.length === 0) {
      cb(null, value);
    } else {
      var count = value.length;
      for (var i = 0; i < value.length; i++) {
        var meta = value[i];
        _loadImage(meta, function () {
          count--;
          if (count === 0) {
            cb(null, value);
          }
        });
      }
    }
  }

  //An image can be either a base64 image or a binary image.
  //If base64, need to load the data as text.
  //If binary, just need to load the file uri.
  function _loadImage(meta, cb) {
    if (meta) {

      /**
       * If the file already contains a local uri, then no need to load it.
       */
      if(meta.localURI){
        return cb(null, meta);
      }

      var name = meta.hashName;
      if(meta.contentType === "base64"){
        appForm.stores.localStorage.readFileText(name, function (err, text) {
          if (err) {
            $fh.forms.log.e(err);
          }
          meta.data = text;
          cb(err, meta);
        });
      } else if(meta.contentType === "binary"){
        appForm.stores.localStorage.readFile(name, function(err, file){
          if(err){
            $fh.forms.log.e("Error reading file " + name, err);
          }

          if(file && file.fullPath){
            meta.data = file.fullPath;
          } else {
            meta.data = "file-not-found";
          }

          cb(err, meta);
        });
      } else {
        $fh.forms.log.e("Error load image with invalid meta" + meta.contentType);
      }
    } else {
      cb(null, meta);
    }
  }
  module.prototype.process_signature = imageProcess;
  module.prototype.convert_signature = convertImage;
  module.prototype.process_photo = imageProcess;
  module.prototype.convert_photo = convertImage;
  return module;
}(appForm.models.Field || {});

/**
 * One form contains multiple pages
 */
appForm.models = function (module) {
  var Model = appForm.models.Model;
  function Page(opt, parentForm) {
    if (typeof opt === 'undefined' || typeof parentForm === 'undefined') {
      throw 'Page initialise failed: new Page(pageDefinitionJSON, parentFormModel)';
    }
    Model.call(this, { '_type': 'page' });
    this.fromJSON(opt);
    this.form = parentForm;
    this.initialise();
  }
  appForm.utils.extend(Page, Model);
  Page.prototype.initialise = function () {
    var fieldsDef = this.getFieldDef();
    this.fieldsIds = [];
    for (var i = 0; i < fieldsDef.length; i++) {
      this.fieldsIds.push(fieldsDef[i]._id);
    }
  };
  Page.prototype.setVisible = function (isVisible) {
    this.set('visible', isVisible);
    if (isVisible) {
      this.emit('visible');
    } else {
      this.emit('hidden');
    }
  };
  Page.prototype.getFieldDef=function(){
    return this.get("fields",[]);
  };
  Page.prototype.getFieldDef=function(){
      return this.get("fields",[]);
  };
  Page.prototype.getFieldModelList=function(){
      var list=[];
      for (var i=0;i<this.fieldsIds.length;i++){
          list.push(this.form.getFieldModelById(this.fieldsIds[i]));
      }
      return list;
  };
  Page.prototype.checkForSectionBreaks=function(){ //Checking for any sections
    for (var i=0;i<this.fieldsIds.length;i++){
      var fieldModel = this.form.getFieldModelById(this.fieldsIds[i]);
      if(fieldModel && fieldModel.getType() === "sectionBreak"){
        return true;
      }
    }
    return false;
  };
  Page.prototype.getSections=function(){ //Checking for any sections
    var sectionList={};
    var currentSection = null;
    var sectionBreaksExist = this.checkForSectionBreaks();
    var insertSectionBreak = false;

    if(sectionBreaksExist){
      //If there are section breaks, the first field in the form must be a section break. If not, add a placeholder
      var firstField = this.form.getFieldModelById(this.fieldsIds[0]);

      if(firstField.getType() !== "sectionBreak"){
        insertSectionBreak = true;
      }
    } else {
      return null;
    }

    for (var i=0;i<this.fieldsIds.length;i++){
      var fieldModel = this.form.getFieldModelById(this.fieldsIds[i]);

      if(insertSectionBreak && i === 0){ //Adding a first section.
        currentSection = "sectionBreak" + i;
        sectionList[currentSection] = sectionList[currentSection] ? sectionList[currentSection] : {fields: []};
        sectionList[currentSection].title = "Section " + (i+1);
      }

      if(currentSection !== null && fieldModel.getType() !== "sectionBreak"){
        sectionList[currentSection].fields.push(fieldModel);
      }

      if(fieldModel.getType() === "sectionBreak"){
        currentSection = "sectionBreak" + i;
        sectionList[currentSection] = sectionList[currentSection] ? sectionList[currentSection] : {fields: []};
        sectionList[currentSection].title = fieldModel.get('name', "Section " + (i+1));
        sectionList[currentSection].fields.push(fieldModel);
      }
    }

    return sectionList;
  };
  Page.prototype.getFieldModelById=function(fieldId){
    return this.form.getFieldModelById(fieldId);
  };
  Page.prototype.getPageId=function(){
    return this.get("_id","");
  };
  Page.prototype.getName = function () {
    return this.get('name', '');
  };
  Page.prototype.getDescription = function () {
    return this.get('description', '');
  };
  Page.prototype.getFieldDef = function () {
    return this.get('fields', []);
  };
  Page.prototype.getFieldModelList = function () {
    var list = [];
    for (var i = 0; i < this.fieldsIds.length; i++) {
      list.push(this.form.getFieldModelById(this.fieldsIds[i]));
    }

    return list;
  };

    module.Page=Page;

    return module;
}(appForm.models || {});

/**
 * Manages submission uploading tasks
 */
appForm.models = function (module) {
  var Model = appForm.models.Model;
  function UploadManager() {
    var self = this;
    Model.call(self, {
      '_type': 'uploadManager',
      '_ludid': 'uploadManager_queue'
    });

    self.set('taskQueue', []);
    self.sending = false;
    self.timerInterval = 200;
    self.sendingStart = appForm.utils.getTime();
  }
  appForm.utils.extend(UploadManager, Model);

  /**
     * Queue a submission to uploading tasks queue
     * @param  {[type]} submissionModel [description]
     * @param {Function} cb callback once finished
     * @return {[type]}                 [description]
     */
  UploadManager.prototype.queueSubmission = function (submissionModel, cb) {
    $fh.forms.log.d("Queueing Submission for uploadManager");
    var utId;
    var uploadTask = null;
    var self = this;

    self.checkOnlineStatus(function(){
      if($fh.forms.config.isOnline()){
        if (submissionModel.getUploadTaskId()) {
          utId = submissionModel.getUploadTaskId();
        } else {
          uploadTask = appForm.models.uploadTask.newInstance(submissionModel);
          utId = uploadTask.getLocalId();
        }
        self.push(utId);
        if (!self.timer) {
          $fh.forms.log.d("Starting timer for uploadManager");
          self.start();
        }
        if (uploadTask) {
          uploadTask.saveLocal(function (err) {
            if (err) {
              $fh.forms.log.e(err);
            }
            self.saveLocal(function (err) {
              if (err) {
                $fh.forms.log.e("Error saving upload manager: " + err);
              }
              cb(null, uploadTask);
            });
          });
        } else {
          self.saveLocal(function (err) {
            if (err) {
              $fh.forms.log.e("Error saving upload manager: " + err);
            }
            self.getTaskById(utId, cb);
          });
        }
      } else {
        return cb("Working offline cannot submit form.");
      }
    });
  };

  /**
     * cancel a submission uploading
     * @param  {[type]}   submissionsModel [description]
     * @param  {Function} cb               [description]
     * @return {[type]}                    [description]
     */
  UploadManager.prototype.cancelSubmission = function (submissionsModel, cb) {
    var uploadTId = submissionsModel.getUploadTaskId();
    var queue = this.get('taskQueue');
    if (uploadTId) {
      var index = queue.indexOf(uploadTId);
      if (index > -1) {
        queue.splice(index, 1);
      }
      this.getTaskById(uploadTId, function (err, task) {
        if (err) {
          $fh.forms.log.e(err);
          cb(err, task);
        } else {
          if (task) {
            task.clearLocal(cb);
          } else {
            cb(null, null);
          }
        }
      });
      this.saveLocal(function (err) {
        if (err){
          $fh.forms.log.e(err);
        }
      });
    } else {
      cb(null, null);
    }
  };

  UploadManager.prototype.getTaskQueue = function () {
    return this.get('taskQueue', []);
  };
  /**
     * start a timer
     * @param  {} interval ms
     * @return {[type]}      [description]
     */
  UploadManager.prototype.start = function () {
    var that = this;
    that.stop();
    that.timer = setInterval(function () {
      that.tick();
    }, this.timerInterval);
  };
  /**
     * stop uploading
     * @return {[type]} [description]
     */
  UploadManager.prototype.stop = function () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };
  UploadManager.prototype.push = function (uploadTaskId) {
    this.get('taskQueue').push(uploadTaskId);
    this.saveLocal(function (err) {
      if (err){
        $fh.forms.log.e("Error saving local Upload manager", err);
      }
    });
  };
  UploadManager.prototype.shift = function () {
    var shiftedTask = this.get('taskQueue').shift();
    this.saveLocal(function (err) {
      if (err) {
        $fh.forms.log.e(err);
      }
    });
    return shiftedTask;
  };
  UploadManager.prototype.rollTask = function () {
    this.push(this.shift());
  };
  UploadManager.prototype.tick = function () {
    var self = this;
    if (self.sending) {
      var now = appForm.utils.getTime();
      var timePassed = now.getTime() - self.sendingStart.getTime();
      if (timePassed > $fh.forms.config.get("timeout") * 1000) {
        //time expired. roll current task to the end of queue
        $fh.forms.log.e('Uploading content timeout. it will try to reupload.');
        self.sending = false;
        self.rollTask();
      }
    } else {
      if (self.hasTask()) {
        self.sending = true;
        self.sendingStart = appForm.utils.getTime();

        self.getCurrentTask(function (err, task) {
          if (err || !task) {
            $fh.forms.log.e(err);
            self.sending = false;
          } else {
            if (task.isCompleted() || task.isError()) {
              //current task uploaded or aborted by error. shift it from queue
              self.shift();
              self.sending = false;
              self.saveLocal(function (err) {
                if(err){
                  $fh.forms.log.e("Error saving upload manager: ", err);
                }
              });
            } else {
              self.checkOnlineStatus(function(){
                if($fh.forms.config.isOnline()){
                  task.uploadTick(function (err) {
                    if(err){
                      $fh.forms.log.e("Error on upload tick: ", err, task);
                    }

                    //callback when finished. ready for next upload command
                    self.sending = false;
                  });
                } else {
                  $fh.forms.log.d("Upload Manager: Tick: Not online.");
                }
              });
            }
          }
        });
      } else {
        //no task . stop timer.
        self.stop();
      }
    }
  };
  UploadManager.prototype.hasTask = function () {
    return this.get('taskQueue').length > 0;
  };
  UploadManager.prototype.getCurrentTask = function (cb) {
    var taskId = this.getTaskQueue()[0];
    if (taskId) {
      this.getTaskById(taskId, cb);
    } else {
      cb(null, null);
    }
  };
  UploadManager.prototype.checkOnlineStatus = function (cb) {
    appForm.stores.dataAgent.checkOnlineStatus(cb);
  };
  UploadManager.prototype.getTaskById = function (taskId, cb) {
    appForm.models.uploadTask.fromLocal(taskId, cb);
  };
  module.uploadManager = new UploadManager();
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  /**
     * Describe rules associated to one field.
     * @param {[type]} param {"type":"page | field", "definition":defJson}
     */
  function Rule(param) {
    Model.call(this, { '_type': 'rule' });
    this.fromJSON(param);
  }
  appForm.utils.extend(Rule, Model);
  /**
     * Return source fields id required from input value for this rule
     * @return [fieldid1, fieldid2...] [description]
     */
  Rule.prototype.getRelatedFieldId = function () {
    var def = this.getDefinition();
    var statements = def.ruleConditionalStatements;
    var rtn = [];
    for (var i = 0; i<statements.length; i++) {
      var statement = statements[i];
      rtn.push(statement.sourceField);
    }
    return rtn;
  };
  /**
     * test if input value meet the condition
     * @param  {[type]} param {fieldId:value, fieldId2:value2}
     * @return {[type]}       true - meet rule  / false -  not meet rule
     */
  Rule.prototype.test = function (param) {
    var fields = this.getRelatedFieldId();
    var logic = this.getLogic();
    var res = logic === 'or' ? false : true;
    for (var i = 0; i< fields.length ; i++) {
      var fieldId = fields[i];
      var val = param[fieldId];
      if (val) {
        var tmpRes = this.testField(fieldId, val);
        if (logic === 'or') {
          res = res || tmpRes;
          if (res === true) {
            //break directly
            return true;
          }
        } else {
          res = res && tmpRes;
          if (res === false) {
            //break directly
            return false;
          }
        }
      } else {
        if (logic === 'or') {
          res = res || false;
        } else {
          return false;
        }
      }
    }
    return res;
  };
  /**
     * test a field if the value meets its conditon
     * @param  {[type]} fieldId [description]
     * @param  {[type]} val     [description]
     * @return {[type]}         [description]
     */
  Rule.prototype.testField = function (fieldId, val) {
    var statement = this.getRuleConditionStatement(fieldId);
    var condition = statement.restriction;
    var expectVal = statement.sourceValue;
    return appForm.models.checkRule(condition, expectVal, val);
  };
  Rule.prototype.getRuleConditionStatement = function (fieldId) {
    var statements = this.getDefinition().ruleConditionalStatements;
    for (var i = 0; i<statements.length; i++) {
      var statement = statements[i];
      if (statement.sourceField === fieldId) {
        return statement;
      }
    }
    return null;
  };
  Rule.prototype.getLogic = function () {
    var def = this.getDefinition();
    return def.ruleConditionalOperator.toLowerCase();
  };
  Rule.prototype.getDefinition = function () {
    return this.get('definition');
  };
  Rule.prototype.getAction = function () {
    var def = this.getDefinition();
    var target = {
        'action': def.type,
        'targetId': this.get('type') === 'page' ? def.targetPage : def.targetField,
        'targetType': this.get('type')
      };
    return target;
  };
  module.Rule = Rule;
  return module;
}(appForm.models || {});
/**
 * Uploading task for each submission
 */
appForm.models = function (module) {
  module.uploadTask = {
    'newInstance': newInstance,
    'fromLocal': fromLocal
  };


  var _uploadTasks = {};

  var Model = appForm.models.Model;

  function newInstance(submissionModel) {
    if(submissionModel){
      var utObj = new UploadTask();
      utObj.init(submissionModel);
      _uploadTasks[utObj.getLocalId()] = utObj;
      return utObj;
    } else {
      return {};
    }
  }


  function fromLocal(localId, cb) {
    if (_uploadTasks[localId]) {
      return cb(null, _uploadTasks[localId]);
    }
    var utObj = new UploadTask();
    utObj.setLocalId(localId);
    _uploadTasks[localId] = utObj;
    utObj.loadLocal(cb);
  }


  function UploadTask() {
    Model.call(this, { '_type': 'uploadTask' });
  }


  appForm.utils.extend(UploadTask, Model);
  UploadTask.prototype.init = function (submissionModel) {
    var self = this;
    var submissionLocalId = submissionModel.getLocalId();
    self.setLocalId(submissionLocalId + '_' + 'uploadTask');
    self.set('submissionLocalId', submissionLocalId);
    self.set('fileTasks', []);
    self.set('currentTask', null);
    self.set('completed', false);
    self.set('retryAttempts', 0);
    self.set('retryNeeded', false);
    self.set('mbaasCompleted', false);
    self.set('submissionTransferType', 'upload');
    submissionModel.setUploadTaskId(self.getLocalId());

    function initSubmissionUpload(){
      var json = submissionModel.getProps();
      self.set('jsonTask', json);
      self.set('formId', submissionModel.get('formId'));

    }

    function initSubmissionDownload(){
      self.set('submissionId', submissionModel.getRemoteSubmissionId());
      self.set('jsonTask', {});
      self.set('submissionTransferType', 'download');
    }

    if(submissionModel.isDownloadSubmission()){
      initSubmissionDownload();
    } else {
      initSubmissionUpload();
    }
  };
  UploadTask.prototype.getTotalSize = function () {
    var self = this;
    var jsonSize = JSON.stringify(self.get('jsonTask')).length;
    var fileTasks = self.get('fileTasks');
    var fileSize = 0;
    var fileTask;
    for (var i = 0; i<fileTasks.length ; i++) {
      fileTask = fileTasks[i];
      fileSize += fileTask.fileSize;
    }
    return jsonSize + fileSize;
  };
  UploadTask.prototype.getUploadedSize = function () {
    var currentTask = this.getCurrentTask();
    if (currentTask === null) {
      return 0;
    } else {
      var jsonSize = JSON.stringify(this.get('jsonTask')).length;
      var fileTasks = this.get('fileTasks');
      var fileSize = 0;
      for (var i = 0, fileTask; (fileTask = fileTasks[i]) && i < currentTask; i++) {
        fileSize += fileTask.fileSize;
      }
      return jsonSize + fileSize;
    }
  };
  UploadTask.prototype.getRemoteStore = function () {
    return appForm.stores.dataAgent.remoteStore;
  };
  UploadTask.prototype.addFileTasks = function(submissionModel, cb){
    var self = this;
    submissionModel.getFileInputValues(function(err, files){
      if(err){
        $fh.forms.log.e("Error getting file Input values: " + err);
        return cb(err);
      }
      for (var i = 0; i<files.length ; i++) {
        var file = files[i];
        self.addFileTask(file);
      }
      cb();
    });
  };
  UploadTask.prototype.addFileTask = function (fileDef) {
    this.get('fileTasks').push(fileDef);
  };
  /**
   * get current uploading task
   * @return {[type]} [description]
   */
  UploadTask.prototype.getCurrentTask = function () {
    return this.get('currentTask', null);
  };
  UploadTask.prototype.getRetryAttempts = function () {
    return this.get('retryAttempts');
  };
  UploadTask.prototype.increRetryAttempts = function () {
    this.set('retryAttempts', this.get('retryAttempts') + 1);
  };
  UploadTask.prototype.resetRetryAttempts = function () {
    this.set('retryAttempts', 0);
  };
  UploadTask.prototype.isStarted = function () {
    return this.getCurrentTask() === null ? false : true;
  };


  UploadTask.prototype.setSubmissionQueued = function(cb){
    var self = this;
    self.submissionModel(function(err, submission){
      if(err){
        return cb(err);
      }

      if(self.get("submissionId")){
        submission.setRemoteSubmissionId(self.get("submissionId"));
      }

      submission.queued(cb);
    });
  };
  /**
   * upload/download form submission
   * @param  {Function} cb [description]
   * @return {[type]}      [description]
   */
  UploadTask.prototype.uploadForm = function (cb) {
    var self = this;

    function processUploadDataResult(res){
      $fh.forms.log.d("In processUploadDataResult");
      var formSub = self.get("jsonTask");
      if(res.error){
        $fh.forms.log.e("Error submitting form " + res.error);
        return cb("Error submitting form " + res.error);
      } else {
        var submissionId = res.submissionId;
        // form data submitted successfully.
        formSub.lastUpdate = appForm.utils.getTime();
        self.set('submissionId', submissionId);

        self.setSubmissionQueued(function(err){
          self.increProgress();
          self.saveLocal(function (err) {
            if (err) {
              $fh.forms.log.e("Error saving uploadTask to local storage" + err);
            }
          });
          self.emit('progress', self.getProgress());
          return cb(null);
        });
      }
    }

    function processDownloadDataResult(err, res){
      $fh.forms.log.d("In processDownloadDataResult");
      if(err){
        $fh.forms.log.e("Error downloading submission data"+ err);
        return cb(err);
      }

      //Have the definition of the submission
      self.submissionModel(function(err, submissionModel){
        $fh.forms.log.d("Got SubmissionModel", err, submissionModel);
        if(err){
          return cb(err);
        }
        var JSONRes = {};

        //Instantiate the model from the json definition
        if(typeof(res) === "string"){
          try{
            JSONRes = JSON.parse(res);
          } catch (e){
            $fh.forms.log.e("processDownloadDataResult Invalid JSON Object Returned", res);
            return cb("Invalid JSON Object Returned");
          }
        } else {
          JSONRes = res;
        }

        if(JSONRes.status){
          delete JSONRes.status;
        }

        submissionModel.fromJSON(JSONRes);
        self.set('jsonTask', res);
        submissionModel.saveLocal(function(err){
          $fh.forms.log.d("Saved SubmissionModel", err, submissionModel);
          if(err){
            $fh.forms.log.e("Error saving updated submission from download submission: " + err);
          }

          //Submission Model is now populated with all the fields in the submission
          self.addFileTasks(submissionModel, function(err){
            $fh.forms.log.d("addFileTasks called", err, submissionModel);
            if(err){
              return cb(err);
            }
            self.increProgress();
            self.saveLocal(function (err) {
              if (err) {
                $fh.forms.log.e("Error saving downloadTask to local storage" + err);
              }

              self.emit('progress', self.getProgress());
              return cb();
            });
          });
        });
      });
    }

    function uploadSubmissionJSON(){
      $fh.forms.log.d("In uploadSubmissionJSON");
      var formSub = self.get('jsonTask');
      self.submissionModel(function(err, submissionModel){
        if(err){
          return cb(err);
        }
        self.addFileTasks(submissionModel, function(err){
          if(err){
            $fh.forms.log.e("Error adding file tasks for submission upload");
            return cb(err);
          }

          var formSubmissionModel = new appForm.models.FormSubmission(formSub);
          self.getRemoteStore().create(formSubmissionModel, function (err, res) {
            if (err) {
              return cb(err);
            } else {
              var updatedFormDefinition = res.updatedFormDefinition;
              if (updatedFormDefinition) {
                // remote form definition is updated
                self.refreshForm(updatedFormDefinition, function (err) {
                  //refresh form def in parallel. maybe not needed.
                  $fh.forms.log.d("Form Updated, refreshed");
                  if (err) {
                    $fh.forms.log.e(err);
                  }
                  processUploadDataResult(res);
                });
              } else {
                processUploadDataResult(res);
              }
            }
          });
        });
      });

    }

    function downloadSubmissionJSON(){
      var formSubmissionDownload = new appForm.models.FormSubmissionDownload(self);
      self.getRemoteStore().read(formSubmissionDownload, processDownloadDataResult);
    }

    if(self.isDownloadTask()){
      downloadSubmissionJSON();
    } else {
      uploadSubmissionJSON();
    }
  };

  /**
   * Handles the case where a call to completeSubmission returns a status other than "completed".
   * Will only ever get to this function when a call is made to the completeSubmission server.
   *
   *
   * @param err (String) Error message associated with the error returned
   * @param res {"status" : <pending/error>, "pendingFiles" : [<any pending files not yet uploaded>]}
   * @param cb Function callback
   */
  UploadTask.prototype.handleCompletionError = function (err, res, cb) {
    $fh.forms.log.d("handleCompletionError Called");
    var errorMessage = err;
    if (res.status === 'pending') {
      //The submission is not yet complete, there are files waiting to upload. This is an unexpected state as all of the files should have been uploaded.
      errorMessage = 'Submission Still Pending.';
    } else if (res.status === 'error') {
      //There was an error completing the submission.
      errorMessage = 'Error completing submission';
    } else {
      errorMessage = 'Invalid return type from complete submission';
    }
    cb(errorMessage);
  };

  /**
   * Handles the case where the current submission status is required from the server.
   * Based on the files waiting to be uploaded, the upload task is re-built with pendingFiles from the server.
   *
   * @param cb
   */
  UploadTask.prototype.handleIncompleteSubmission = function (cb) {
    var self = this;
    function processUploadIncompleteSubmission(){

      var remoteStore = self.getRemoteStore();
      var submissionStatus = new appForm.models.FormSubmissionStatus(self);

      remoteStore.submissionStatus(submissionStatus, function (err, res) {
        var errMessage="";
        if (err) {
          cb(err);
        } else if (res.status === 'error') {
          //The server had an error submitting the form, finish with an error
          errMessage= 'Error submitting form.';
          cb(errMessage);
        } else if (res.status === 'complete') {
          //Submission is complete, make uploading progress further
          self.increProgress();
          cb();
        } else if (res.status === 'pending') {
          //Submission is still pending, check for files not uploaded yet.
          var pendingFiles = res.pendingFiles || [];
          if (pendingFiles.length > 0) {
            self.resetUploadTask(pendingFiles, function () {
              cb();
            });
          } else {
            //No files pending on the server, make the progress further
            self.increProgress();
            cb();
          }
        } else {
          //Should not get to this point. Only valid status responses are error, pending and complete.
          errMessage = 'Invalid submission status response.';
          cb(errMessage);
        }
      });
    }

    function processDownloadIncompleteSubmission(){
      //No need to go the the server to get submission details -- The current progress status is valid locally
      cb();
    }

    if(self.isDownloadTask()){
      processDownloadIncompleteSubmission();
    } else {
      processUploadIncompleteSubmission();
    }
  };

  /**
   * Resetting the upload task based on the response from getSubmissionStatus
   * @param pendingFiles -- Array of files still waiting to upload
   * @param cb
   */
  UploadTask.prototype.resetUploadTask = function (pendingFiles, cb) {
    var filesToUpload = this.get('fileTasks');
    var resetFilesToUpload = [];
    var fileIndex;
    //Adding the already completed files to the reset array.
    for (fileIndex = 0; fileIndex < filesToUpload.length; fileIndex++) {
      if (pendingFiles.indexOf(filesToUpload[fileIndex].hashName) < 0) {
        resetFilesToUpload.push(filesToUpload[fileIndex]);
      }
    }
    //Adding the pending files to the end of the array.
    for (fileIndex = 0; fileIndex < filesToUpload.length; fileIndex++) {
      if (pendingFiles.indexOf(filesToUpload[fileIndex].hashName) > -1) {
        resetFilesToUpload.push(filesToUpload[fileIndex]);
      }
    }
    var resetFileIndex = filesToUpload.length - pendingFiles.length - 1;
    var resetCurrentTask = 0;
    if (resetFileIndex > 0) {
      resetCurrentTask = resetFileIndex;
    }
    //Reset current task
    this.set('currentTask', resetCurrentTask);
    this.set('fileTasks', resetFilesToUpload);
    this.saveLocal(cb);  //Saving the reset files list to local
  };
  UploadTask.prototype.uploadFile = function (cb) {
    var self = this;
    var progress = self.getCurrentTask();

    if (progress === null) {
      progress = 0;
      self.set('currentTask', progress);
    }
    var fileTask = self.get('fileTasks', [])[progress];
    var submissionId = self.get('submissionId');
    var fileSubmissionModel;
    if (!fileTask) {
      $fh.forms.log.e("No file task found when trying to transfer a file.");
      return cb('cannot find file task');
    }

    if(!submissionId){
      $fh.forms.log.e("No submission id found when trying to transfer a file.");
      return cb("No submission Id found");
    }

    function processUploadFile(){
      $fh.forms.log.d("processUploadFile for submissionId: ");
      if (fileTask.contentType === 'base64') {
        fileSubmissionModel = new appForm.models.Base64FileSubmission(fileTask);
      } else {
        fileSubmissionModel = new appForm.models.FileSubmission(fileTask);
      }
      fileSubmissionModel.setSubmissionId(submissionId);
      fileSubmissionModel.loadFile(function (err) {
        if (err) {
          $fh.forms.log.e("Error loading file for upload: " + err);
          return cb(err);
        } else {
          self.getRemoteStore().create(fileSubmissionModel, function (err, res) {
            if (err) {
              cb(err);
            } else {
              if (res.status === 'ok' || res.status === 200 || res.status === '200') {
                fileTask.updateDate = appForm.utils.getTime();
                self.increProgress();
                self.saveLocal(function (err) {
                  //save current status.
                  if (err) {
                    $fh.forms.log.e("Error saving upload task" + err);
                  }
                });
                self.emit('progress', self.getProgress());
                cb(null);
              } else {
                var errorMessage = 'File upload failed for file: ' + fileTask.fileName;
                cb(errorMessage);
              }
            }
          });
        }
      });
    }

    function processDownloadFile(){
      $fh.forms.log.d("processDownloadFile called");
      fileSubmissionModel = new appForm.models.FileSubmissionDownload(fileTask);
      fileSubmissionModel.setSubmissionId(submissionId);
      self.getRemoteStore().read(fileSubmissionModel, function (err, localFilePath) {
        if(err){
          $fh.forms.log.e("Error downloading a file from remote: " + err);
          return cb(err);
        }

        $fh.forms.log.d("processDownloadFile called. Local File Path: " + localFilePath);

        //Update the submission model to add local file uri to a file submission object
        self.submissionModel(function(err, submissionModel){
          if(err){
            $fh.forms.log.e("Error Loading submission model for processDownloadFile " + err);
            return cb(err);
          }

          submissionModel.updateFileLocalURI(fileTask, localFilePath, function(err){
            if(err){
              $fh.forms.log.e("Error updating file local url for fileTask " + JSON.stringify(fileTask));
              return cb(err);
            }

            self.increProgress();
            self.saveLocal(function (err) {
              //save current status.
              if (err) {
                $fh.forms.log.e("Error saving download task");
              }
            });
            self.emit('progress', self.getProgress());
            return cb();
          });
        });
      });
    }

    if(self.isDownloadTask()){
      processDownloadFile();
    } else {
      processUploadFile();
    }
  };
  UploadTask.prototype.isDownloadTask = function(){
    return this.get("submissionTransferType") === "download";
  };
  //The upload task needs to be retried
  UploadTask.prototype.setRetryNeeded = function (retryNeeded) {
    //If there is a submissionId, then a retry is needed. If not, then the current task should be set to null to retry the submission.
    if (this.get('submissionId', null) != null) {
      this.set('retryNeeded', retryNeeded);
    } else {
      this.set('retryNeeded', false);
      this.set('currentTask', null);
    }
  };
  UploadTask.prototype.retryNeeded = function () {
    return this.get('retryNeeded');
  };
  UploadTask.prototype.uploadTick = function (cb) {
    var self = this;
    function _handler(err) {
      if (err) {
        $fh.forms.log.d('Err, retrying transfer: ' + self.getLocalId());
        //If the upload has encountered an error -- flag the submission as needing a retry on the next tick -- User should be insulated from an error until the retries are finished.
        self.increRetryAttempts();
        if (self.getRetryAttempts() <= $fh.forms.config.get('max_retries')) {
          self.setRetryNeeded(true);
          self.saveLocal(function (err) {
            if (err){
              $fh.forms.log.e("Error saving upload taskL " + err);
            }

            cb();
          });
        } else {
          //The number of retry attempts exceeds the maximum number of retry attempts allowed, flag the upload as an error.
          self.setRetryNeeded(true);
          self.resetRetryAttempts();
          self.error(err, function () {
            cb(err);
          });
        }
      } else {
        //no error.
        self.setRetryNeeded(false);
        self.saveLocal(function (_err) {
          if (_err){
            $fh.forms.log.e("Error saving upload task to local memory" + _err);
          }
        });
        self.submissionModel(function (err, submission) {
          if (err) {
            cb(err);
          } else {
            var status = submission.get('status');
            if (status !== 'inprogress' && status !== 'submitted' && status !== 'downloaded' && status !== 'queued') {
              $fh.forms.log.e('Submission status is incorrect. Upload task should be started by submission object\'s upload method.' + status);
              cb('Submission status is incorrect. Upload task should be started by submission object\'s upload method.');
            } else {
              cb();
            }
          }
        });
      }
    }
    if (!this.isFormCompleted()) {
      // No current task, send the form json
      this.uploadForm(_handler);
    } else if (this.retryNeeded()) {
      //If a retry is needed, this tick gets the current status of the submission from the server and resets the submission.
      this.handleIncompleteSubmission(_handler);
    } else if (!this.isFileCompleted()) {
      //files to be uploaded
      this.uploadFile(_handler);
    } else if (!this.isMBaaSCompleted()) {
      //call mbaas to complete upload
      this.uploadComplete(_handler);
    } else if (!this.isCompleted()) {
      //complete the upload task
      this.success(_handler);
    } else {
      //task is already completed.
      _handler(null, null);
    }
  };
  UploadTask.prototype.increProgress = function () {
    var curTask = this.getCurrentTask();
    if (curTask === null) {
      curTask = 0;
    } else {
      curTask++;
    }
    this.set('currentTask', curTask);
  };
  UploadTask.prototype.uploadComplete = function (cb) {
    $fh.forms.log.d("UploadComplete Called");
    var self = this;
    var submissionId = self.get('submissionId', null);

    if (submissionId === null) {
      return cb('Failed to complete submission. Submission Id not found.');
    }

    function processDownloadComplete(){
      $fh.forms.log.d("processDownloadComplete Called");
      self.increProgress();
      cb(null);
    }

    function processUploadComplete(){
      $fh.forms.log.d("processUploadComplete Called");
      var remoteStore = self.getRemoteStore();
      var completeSubmission = new appForm.models.FormSubmissionComplete(self);
      remoteStore.create(completeSubmission, function (err, res) {
        //if status is not "completed", then handle the completion err
        res = res || {};
        if (res.status !== 'complete') {
          return self.handleCompletionError(err, res, cb);
        }
        //Completion is now completed sucessfully.. we can make the progress further.
        self.increProgress();
        cb(null);
      });
    }

    if(self.isDownloadTask()){
      processDownloadComplete();
    } else {
      processUploadComplete();
    }
  };
  /**
   * the upload task is successfully completed. This will be called when all uploading process finished successfully.
   * @return {[type]} [description]
   */
  UploadTask.prototype.success = function (cb) {
    $fh.forms.log.d("Transfer Sucessful. Success Called.");
    var self = this;
    var submissionId = self.get('submissionId', null);
    self.set('completed', true);
    

    function processUploadSuccess(cb){
      $fh.forms.log.d("processUploadSuccess Called");
      self.submissionModel(function (_err, model) {
        if(_err){
          return cb(_err);
        }
        model.setRemoteSubmissionId(submissionId);
        model.submitted(cb);
      });
    }

    function processDownloadSuccess(cb){
      $fh.forms.log.d("processDownloadSuccess Called");
      self.submissionModel(function (_err, model) {
        if(_err){
          return cb(_err);
        } else {
          model.populateFilesInSubmission();
          model.downloaded(cb);
        }
      });
    }

    self.saveLocal(function (err) {
      if (err) {
        $fh.forms.log.e("Error Clearing Upload Task");
      }

      if(self.isDownloadTask()){
        processDownloadSuccess(function(err){
          self.clearLocal(cb);
        });
      } else {
        processUploadSuccess(function(err){
          self.clearLocal(cb);
        });
      }
    });
  };
  /**
   * the upload task is failed. It will not complete the task but will set error with error returned.
   * @param  {[type]}   err [description]
   * @param  {Function} cb  [description]
   * @return {[type]}       [description]
   */
  UploadTask.prototype.error = function (uploadErrorMessage, cb) {
    var self = this;
    $fh.forms.log.e("Error uploading submission: ", uploadErrorMessage);
    self.set('error', uploadErrorMessage);
    self.saveLocal(function (err) {
      if (err) {
        $fh.forms.log.e('Upload task save failed: ' + err);
      }

      self.submissionModel(function (_err, model) {
        if (_err) {
          cb(_err);
        } else {
          model.setUploadTaskId(null);
          model.error(uploadErrorMessage, function (err) {
            if(err){
              $fh.forms.log.e("Error updating submission model to error status ", err);
            } 
            self.clearLocal(function(err){
              if(err){
                $fh.forms.log.e("Error clearing upload task local storage: ", err);
              }  
              cb(err);    
            });
          });
        }
      });
    });
  };
  UploadTask.prototype.isFormCompleted = function () {
    var curTask = this.getCurrentTask();
    if (curTask === null) {
      return false;
    } else {
      return true;
    }
  };
  UploadTask.prototype.isFileCompleted = function () {
    var curTask = this.getCurrentTask();
    if (curTask === null) {
      return false;
    } else if (curTask < this.get('fileTasks', []).length) {
      return false;
    } else {
      return true;
    }
  };
  UploadTask.prototype.isError = function () {
    var error = this.get('error', null);
    if (error) {
      return true;
    } else {
      return false;
    }
  };
  UploadTask.prototype.isCompleted = function () {
    return this.get('completed', false);
  };
  UploadTask.prototype.isMBaaSCompleted = function () {
    var self = this;
    if (!self.isFileCompleted()) {
      return false;
    } else {
      var curTask = self.getCurrentTask();
      if (curTask > self.get('fileTasks', []).length) {
        //change offset if completion bit is changed
        self.set("mbaasCompleted", true);
        self.saveLocal(function(err){
          if(err){
            $fh.forms.log.e("Error saving upload task: ", err);
          }
        });
        return true;
      } else {
        return false;
      }
    }
  };
  UploadTask.prototype.getProgress = function () {
    var self = this;
    var rtn = {
        'formJSON': false,
        'currentFileIndex': 0,
        'totalFiles': self.get('fileTasks').length,
        'totalSize': self.getTotalSize(),
        'uploaded': self.getUploadedSize(),
        'retryAttempts': self.getRetryAttempts(),
        'submissionTransferType': self.get('submissionTransferType'),
        'submissionRemoteId': self.get('submissionId'),
        'submissionLocalId': self.get('submissionLocalId')
      };
    var progress = self.getCurrentTask();
    if (progress === null) {
      return rtn;
    } else {
      //Boolean specifying if the submission JSON has been uploaded.
      rtn.formJSON = true;
      rtn.currentFileIndex = progress;
    }
    return rtn;
  };
  /**
   * Refresh related form definition.
   * @param  {Function} cb [description]
   * @return {[type]}      [description]
   */
  UploadTask.prototype.refreshForm = function (updatedForm, cb) {
    var formId = this.get('formId');
    new appForm.models.Form({'formId': formId, 'rawMode': true, 'rawData' : updatedForm }, function (err, form) {
      if (err) {
        $fh.forms.log.e(err);
      }

      $fh.forms.log.l('successfully updated form the form with id ' + updatedForm._id);
      cb();
    });
  };
  UploadTask.prototype.submissionModel = function (cb) {
    appForm.models.submission.fromLocal(this.get('submissionLocalId'), function (err, submission) {
      if (err) {
        $fh.forms.log.e("Error getting submission model from local memory " + err);
      }
      cb(err, submission);
    });
  };
  return module;
}(appForm.models || {});
appForm.models = function (module) {
  var Model = appForm.models.Model;
  function Theme() {
    Model.call(this, {
      '_type': 'theme',
      '_ludid': 'theme_object'
    });
  }
  Theme.prototype.getCSS = function () {
    return this.get('css', '');
  };
  appForm.utils.extend(Theme, Model);
  module.theme = new Theme();
  return module;
}(appForm.models || {});
/**
 * Async log module
 * @param  {[type]} module [description]
 * @return {[type]}        [description]
 */
appForm.models = (function(module) {
  var Model = appForm.models.Model;

  function Log() {
    Model.call(this, {
      '_type': 'log',
      "_ludid": "log"
    });
    this.set("logs", []);
    this.isWriting = false;
    this.moreToWrite = false;
    //    appForm.
    //    this.loadLocal(function() {});
  }
  appForm.utils.extend(Log, Model);

  Log.prototype.info = function(logLevel, msgs) {
      if ($fh.forms.config.get("logger") === true) {
        var levelString = "";
        var curLevel = $fh.forms.config.get("log_level");
        var log_levels = $fh.forms.config.get("log_levels");
        var self = this;
        if (typeof logLevel === "string") {
          levelString = logLevel;
          logLevel = log_levels.indexOf(logLevel.toLowerCase());
        } else {
          logLevel = 0;
        }

        curLevel = isNaN(parseInt(curLevel, 10)) ? curLevel : parseInt(curLevel, 10);
        logLevel = isNaN(parseInt(logLevel, 10)) ? logLevel : parseInt(logLevel, 10);

        if (curLevel < logLevel) {
          return;
        } else {
          var args = Array.prototype.splice.call(arguments, 0);
          var logs = self.get("logs");
          args.shift();
          var logStr = "";
          while (args.length > 0) {
            logStr += JSON.stringify(args.shift()) + " ";
          }
          logs.push(self.wrap(logStr, levelString));
          if (logs.length > $fh.forms.config.get("log_line_limit")) {
            logs.shift();
          }
          if (self.isWriting) {
            self.moreToWrite = true;
          } else {
            var _recursiveHandler = function() {
              if (self.moreToWrite) {
                self.moreToWrite = false;
                self.write(_recursiveHandler);
              }
            };
            self.write(_recursiveHandler);
          }
        }
      }
    };
  Log.prototype.wrap = function(msg, levelString) {
    var now = new Date();
    var dateStr = now.toISOString();
    if (typeof msg === "object") {
      msg = JSON.stringify(msg);
    }
    var finalMsg = dateStr + " " + levelString.toUpperCase() + " " + msg;
    return finalMsg;
  };
  
  Log.prototype.write = function(cb) {
    var self = this;
    self.isWriting = true;
    self.saveLocal(function() {
      self.isWriting = false;
      cb();
    });
  };
  Log.prototype.e = function() {
    var args = Array.prototype.splice.call(arguments, 0);
    args.unshift("error");
    this.info.apply(this, args);
  };
  Log.prototype.w = function() {
    var args = Array.prototype.splice.call(arguments, 0);
    args.unshift("warning");
    this.info.apply(this, args);
  };
  Log.prototype.l = function() {
    var args = Array.prototype.splice.call(arguments, 0);
    args.unshift("log");
    this.info.apply(this, args);
  };
  Log.prototype.d = function() {
    var args = Array.prototype.splice.call(arguments, 0);
    args.unshift("debug");
    this.info.apply(this, args);
  };
  Log.prototype.getLogs = function() {
    return this.get("logs");
  };
  Log.prototype.clearLogs = function(cb) {
    this.set("logs", []);
    this.saveLocal(function() {
      if (cb) {
        cb();
      }
    });
  };
  Log.prototype.sendLogs = function(cb) {
    var email = $fh.forms.config.get("log_email");
    var config = appForm.config.getProps();
    var logs = this.getLogs();
    var params = {
      "type": "email",
      "to": email,
      "subject": "App Forms App Logs",
      "body": "Configuration:\n" + JSON.stringify(config) + "\n\nApp Logs:\n" + logs.join("\n")
    };
    appForm.utils.send(params, cb);
  };
  module.log = new Log();
  appForm.log = module.log;
  return module;
})(appForm.models || {});
/**
 * FeedHenry License
 */
appForm.api = function (module) {
  module.getForms = getForms;
  module.getForm = getForm;
  module.getTheme = getTheme;
  module.submitForm = submitForm;
  module.getSubmissions = getSubmissions;
  module.downloadSubmission = downloadSubmission;
  module.init = appForm.init;
  module.log=appForm.models.log;
  module._events = {};

  //Registering For Global Events
  module.on = function(name, func, callOnce){
    if (!module._events[name]) {
      module._events[name] = [];
    }
    if (module._events[name].indexOf(func) < 0) {
      module._events[name].push({
        callOnce: callOnce,
        func: func
      });
    }
  };

  module.once = function(name, func){
    module.on(name, func, true);
  };

  //Emitting A Global Event
  module.emit = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var eventName = args.shift();
    var funcDetailsArray = module._events[eventName];
    if (funcDetailsArray && funcDetailsArray.length > 0) {
      for (var i = 0; i < funcDetailsArray.length; i++) {
        var functionDetails = funcDetailsArray[i];
        var functionToCall = funcDetailsArray[i].func;
        //If the function was not already called, or is not only set to call once, the call the function,
        //Otherwise, don't call it.
        if(!functionDetails.called || !functionDetails.callOnce){
          functionDetails.called = true;
          functionToCall.apply(this, args);
        }
      }
    }
  };

  var _submissions = null;
  var waitOnSubmission = {};
  var formConfig = appForm.models.config;
  var defaultFunction = function(err){
    err = err ? err : "";
    $fh.forms.log.w("Default Function Called " + err);
  };

  /**
   * Get and set config values. Can only set a config value if you are an config_admin_user
   */
  var configInterface = {
    "editAllowed" : function(){
      var defaultConfigValues = formConfig.get("defaultConfigValues", {});
      return defaultConfigValues["config_admin_user"] === true;
    },
    "get" : function(key){
      var self = this;
      if(key){
        var userConfigValues = formConfig.get("userConfigValues", {});
        var defaultConfigValues = formConfig.get("defaultConfigValues", {});


        if(userConfigValues[key]){
          return userConfigValues[key];
        } else {
          return defaultConfigValues[key];
        }

      }
    },
    "getDeviceId": function(){
      return formConfig.get("deviceId", "Not Set");
    },
    "set" : function(key, val){
      var self = this;
      if(typeof(key) !== "string" || typeof(val) === "undefined" || val === null){
        return;
      }

      if(self.editAllowed() || key === "max_sent_saved"){
        var userConfig = formConfig.get("userConfigValues", {});
        userConfig[key] = val;
        formConfig.set("userConfigValues", userConfig);
      }

    },
    "getConfig" : function(){
      var self = this;
      var defaultValues = formConfig.get("defaultConfigValues", {});
      var userConfigValues = formConfig.get("userConfigValues", {});
      var returnObj = {};

      if(self.editAllowed()){
        for(var defKey in defaultValues){
          if(userConfigValues[defKey]){
            returnObj[defKey] = userConfigValues[defKey];
          } else {
            returnObj[defKey] = defaultValues[defKey];
          }
        }
        return returnObj;
      } else {
        return defaultValues;
      }
    },
    "saveConfig": function(cb){
      var self = this;
      formConfig.saveLocal(function(err, configModel){
        if(err){
          $fh.forms.log.e("Error saving a form config: ", err);
        }else{
          $fh.forms.log.l("Form config saved sucessfully.");
        }

        if(typeof(cb) ==='function'){
          cb();
        }
      });
    },
    "offline": function(){
      formConfig.setOffline();
    },
    "online": function(){
      formConfig.setOnline();
    },
    "mbaasOnline": function(cb){
      if(typeof(cb) === "function"){
        formConfig.on('online', cb);
      }
    },
    "mbaasOffline": function(cb){
      if(typeof(cb) === "function"){
        formConfig.on('offline', cb);
      }
    },
    "isOnline": function(){
      return formConfig.isOnline();
    },
    "isStudioMode": function(){
      return formConfig.isStudioMode();
    },
    refresh: function(cb){
      formConfig.refresh(true, cb);
    }
  };

  module.config = configInterface;


  /**
     * Retrieve forms model. It contains forms list. check forms model usage
     * @param  {[type]}   params {fromRemote:boolean}
     * @param  {Function} cb    (err, formsModel)
     * @return {[type]}          [description]
     */
  function getForms(params, cb) {
    if(typeof(params) === 'function'){
      cb = params;
      params = {};
    }

    params = params ? params : {};
    cb = cb ? cb : defaultFunction;
    var fromRemote = params.fromRemote;
    if (fromRemote === undefined) {
      fromRemote = false;
    }
    appForm.models.forms.refresh(fromRemote, cb);
  }
  /**
     * Retrieve form model with specified form id.
     * @param  {[type]}   params {formId: string, fromRemote:boolean}
     * @param  {Function} cb     (err, formModel)
     * @return {[type]}          [description]
     */
  function getForm(params, cb) {
    if(typeof(params) === 'function'){
      cb = params;
      params = {};
    }

    params = params ? params : {};
    cb = cb ? cb : defaultFunction;
    new appForm.models.Form(params, cb);
  }
  /**
     * Find a theme definition for this app.
     * @param params {fromRemote:boolean(false)}
     * @param {Function} cb {err, themeData} . themeData = {"json" : {<theme json definition>}, "css" : "css" : "<css style definition for this app>"}
     */
  function getTheme(params, cb) {
    if(typeof(params) === 'function'){
      cb = params;
      params = {};
    }

    params = params ? params : {};
    cb = cb ? cb : defaultFunction;
    var theme = appForm.models.theme;
    if (!params.fromRemote) {
      params.fromRemote = false;
    }
    theme.refresh(params.fromRemote, function (err, updatedTheme) {
      if (err) {
        return cb(err);
      }
      if (updatedTheme === null) {
        return cb(new Error('No theme defined for this app'));
      }
      if (params.css === true) {
        return cb(null, theme.getCSS());
      } else {
        return cb(null, theme);
      }
    });
  }
  /**
     * Get submissions that are submitted. I.e. submitted and complete.
     * @param params {}
     * @param {Function} cb     (err, submittedArray)
     */
  function getSubmissions(params, cb) {
    if(typeof(params) === 'function'){
      cb = params;
      params = {};
    }

    params = params ? params : {};
    cb = cb ? cb : defaultFunction;

    //Getting submissions that have been completed.
    var submissions = appForm.models.submissions;
    if (_submissions === null) {
      appForm.models.submissions.loadLocal(function (err) {
        if (err) {
          $fh.forms.log.e(err);
          cb(err);
        } else {
          _submissions = appForm.models.submissions;
          cb(null, _submissions);
        }
      });
    } else {
      cb(null, _submissions);
    }
  }
  function submitForm(submission, cb) {
    if (submission) {
      submission.submit(function (err) {
        if (err){
          return cb(err);
        }

        //Submission finished and validated. Now upload the form
        submission.upload(cb);
      });
    } else {
      return cb('Invalid submission object.');
    }
  }

  /*
     * Function for downloading a submission stored on the remote server.
     *
     * @param params {}
     * @param {function} cb (err, downloadTask)
     * */
    function downloadSubmission(params, cb) {
      $fh.forms.log.d("downloadSubmission called", params);
      params = params ? params : {};
      var waitCallbackPassed = typeof(cb) === "function";
      cb = typeof(cb) === "function" ? cb : function(){};

      //There should be a submission id to download.
      if(!params.submissionId){
        $fh.forms.log.e("No submissionId passed to download a submission");
        return cb("No submissionId passed to download a submission");
      }

      var submissionToDownload = null;

      function finishSubmissionDownload(err) {
        err = typeof(err) === "string" && err.length === 24 ? null : err;
        $fh.forms.log.d("finishSubmissionDownload ", err, submissionToDownload);
        var subCBId = submissionToDownload.getRemoteSubmissionId();
        var subsCbsWatiting = waitOnSubmission[subCBId];
        if (subsCbsWatiting) {
          var subCB = subsCbsWatiting.pop();
          while (typeof(subCB) === 'function') {
            subCB(err, submissionToDownload);
            subCB = subsCbsWatiting.pop();
          }

          if (submissionToDownload.clearEvents) {
            submissionToDownload.clearEvents();
          }
        } else {
          submissionToDownload.clearEvents();
          return cb(err, submissionToDownload);
        }
      }

      $fh.forms.log.d("downloadSubmission SubmissionId exists" + params.submissionId);
      var submissionAlreadySaved = appForm.models.submissions.findMetaByRemoteId(params.submissionId);

      if (submissionAlreadySaved === null) {

        $fh.forms.log.d("downloadSubmission submission does not exist, downloading", params);
        submissionToDownload = new appForm.models.submission.newInstance(null, {
          submissionId: params.submissionId
        });

        submissionToDownload.on('error', finishSubmissionDownload);

        submissionToDownload.on('downloaded', finishSubmissionDownload);

        if (typeof(params.updateFunction) === 'function') {
          submissionToDownload.on('progress', params.updateFunction);
        }

        //If there is no callback function, then just trigger the download.
        //Users can register global listeners for submission downloads events now.
        if(typeof(cb) === "function"){
          if(waitOnSubmission[params.submissionId]){
            waitOnSubmission[params.submissionId].push(cb);
          } else {
            waitOnSubmission[params.submissionId] = [];
            waitOnSubmission[params.submissionId].push(cb);
          }
        }

        submissionToDownload.download(function(err) {
          if (err) {
            $fh.forms.log.e("Error queueing submission for download " + err);
            return cb(err);
          }
        });
      } else {
        $fh.forms.log.d("downloadSubmission submission exists", params);

        //Submission was created, but not finished downloading
        if (submissionAlreadySaved.status !== "downloaded" && submissionAlreadySaved.status !== "submitted") {
          if(typeof(cb) === "function"){
            if(waitOnSubmission[params.submissionId]){
              waitOnSubmission[params.submissionId].push(cb);
            } else {
              waitOnSubmission[params.submissionId] = [];
              waitOnSubmission[params.submissionId].push(cb);
            }
          }
        } else {
          appForm.models.submissions.getSubmissionByMeta(submissionAlreadySaved, function(err, submission){
            if(err){
              return cb(err);
            }

            //If the submission has already been downloaded - emit the downloaded event again
            submission.emit('downloaded', submission.getRemoteSubmissionId());
            return cb(undefined, submission);
          });
        }
      }
    }
  return module;
}(appForm.api || {});
//mockup $fh apis for Addons.
if (typeof $fh === 'undefined') {
  $fh = {};
}
if ($fh.forms === undefined) {
  $fh.forms = appForm.api;
}
/*! fh-forms - v1.3.0 -  */
/*! async - v0.2.9 -  */
/*! 2016-02-29 */
/* This is the prefix file */
if(appForm){
  appForm.RulesEngine=rulesEngine;
}

function rulesEngine (formDef) {
  var define = {};
  var module = {exports:{}}; // create a module.exports - async will load into it
/* jshint ignore:start */
/* End of prefix file */

/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = setImmediate;
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                }
            }));
        });
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (_keys(results).length === keys.length) {
                callback(null, results);
                callback = function () {};
            }
        });

        _each(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor !== Array) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (test()) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (!test()) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if(data.constructor !== Array) {
              data = [data];
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            }
        };
        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain) cargo.drain();
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.compose = function (/* functions... */) {
        var fns = Array.prototype.reverse.call(arguments);
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

/* This is the infix file */
/* jshint ignore:end */
  var asyncLoader = module.exports;  // async has updated this, now save in our var, to that it can be returned from our dummy require
  function require() {
    return asyncLoader;
  }

/* End of infix file */

(function () {

  var async = require('async');

  /*
   * Sample Usage
   *
   * var engine = formsRulesEngine(form-definition);
   *
   * engine.validateForms(form-submission, function(err, res) {});
   *      res:
   *      {
   *          "validation": {
   *              "fieldId": {
   *                  "fieldId": "",
   *                  "valid": true,
   *                  "errorMessages": [
   *                      "length should be 3 to 5",
   *                      "should not contain dammit",
   *                      "should repeat at least 2 times"
   *                  ]
   *              },
   *              "fieldId1": {
   *
   *              }
   *          }
   *      }
   *
   *
   * engine.validateField(fieldId, submissionJSON, function(err,res) {});
   *      // validate only field values on validation (no rules, no repeat checking)
   *      res:
   *      "validation":{
   *              "fieldId":{
   *                  "fieldId":"",
   *                  "valid":true,
   *                  "errorMessages":[
   *                      "length should be 3 to 5",
   *                      "should not contain dammit"
   *                  ]
   *              }
   *          }
   *
   * engine.checkRules(submissionJSON, unction(err, res) {})
   *      // check all rules actions
   *      res:
   *      {
   *          "actions": {
   *              "pages": {
   *                  "targetId": {
   *                      "targetId": "",
   *                      "action": "show|hide"
   *                  }
   *              },
   *              "fields": {
   *
   *              }
   *          }
   *      }
   *
   */

  var FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY = "date";
  var FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY = "time";
  var FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME = "datetime";

  var formsRulesEngine = function (formDef) {
    var initialised;

    var definition = formDef;
    var submission;

    var fieldMap = {};
    var adminFieldMap ={}; //Admin fields should not be part of a submission
    var requiredFieldMap = {};
    var submissionRequiredFieldsMap = {}; // map to hold the status of the required fields per submission
    var fieldRulePredicateMap = {};
    var fieldRuleSubjectMap = {};
    var pageRulePredicateMap = {};
    var pageRuleSubjectMap = {};
    var submissionFieldsMap = {};
    var validatorsMap = {
      "text": validatorString,
      "textarea": validatorString,
      "number": validatorNumericString,
      "emailAddress": validatorEmail,
      "dropdown": validatorDropDown,
      "radio": validatorDropDown,
      "checkboxes": validatorCheckboxes,
      "location": validatorLocation,
      "locationMap": validatorLocationMap,
      "photo": validatorFile,
      "signature": validatorFile,
      "file": validatorFile,
      "dateTime": validatorDateTime,
      "url": validatorString,
      "sectionBreak": validatorSection,
      "barcode": validatorBarcode,
      "sliderNumber": validatorNumericString,
      "readOnly": function(){
        //readonly fields need no validation. Values are ignored.
        return true;
      }
    };

    var validatorsClientMap = {
      "text": validatorString,
      "textarea": validatorString,
      "number": validatorNumericString,
      "emailAddress": validatorEmail,
      "dropdown": validatorDropDown,
      "radio": validatorDropDown,
      "checkboxes": validatorCheckboxes,
      "location": validatorLocation,
      "locationMap": validatorLocationMap,
      "photo": validatorAnyFile,
      "signature": validatorAnyFile,
      "file": validatorAnyFile,
      "dateTime": validatorDateTime,
      "url": validatorString,
      "sectionBreak": validatorSection,
      "barcode": validatorBarcode,
      "sliderNumber": validatorNumericString,
      "readOnly": function(){
        //readonly fields need no validation. Values are ignored.
        return true;
      }
    };

    var fieldValueComparison = {
      "text": function(fieldValue, testValue, condition){
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "textarea": function(fieldValue, testValue, condition){
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "number": function(fieldValue, testValue, condition){
        return this.numericalComparison(fieldValue, testValue, condition);
      },
      "emailAddress": function(fieldValue, testValue, condition){
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "dropdown": function(fieldValue, testValue, condition){
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "radio": function(fieldValue, testValue, condition){
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "checkboxes": function(fieldValue, testValue, condition){
        fieldValue = fieldValue || {};
        var valueFound = false;

        if(!(fieldValue.selections instanceof Array)){
          return false;
        }

        //Check if the testValue is contained in the selections
        for(var selectionIndex = 0; selectionIndex < fieldValue.selections.length; selectionIndex++ ){
          var selectionValue = fieldValue.selections[selectionIndex];
          //Note, here we are using the "is" string comparator to check if the testValue matches the current selectionValue
          if(this.comparisonString(selectionValue, testValue, "is")){
            valueFound = true;
          }
        }

        if(condition === "is"){
          return valueFound;
        } else {
          return !valueFound;
        }

      },
      "dateTime": function(fieldValue, testValue, condition, fieldOptions){
        var valid = false;

        fieldOptions = fieldOptions || {definition: {}};

        //dateNumVal is assigned an easily comparible number depending on the type of units used.
        var dateNumVal = null;
        var testNumVal = null;

        switch (fieldOptions.definition.datetimeUnit) {
          case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY:
            try {
              dateNumVal = new Date(new Date(fieldValue).toDateString()).getTime();
              testNumVal = new Date(new Date(testValue).toDateString()).getTime();
              valid = true;
            } catch (e) {
              dateNumVal = null;
              testNumVal = null;
              valid = false;
            }
            break;
          case FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY:
            var cvtTime = this.cvtTimeToSeconds(fieldValue);
            var cvtTestVal = this.cvtTimeToSeconds(testValue);
            dateNumVal = cvtTime.seconds;
            testNumVal = cvtTestVal.seconds;
            valid = cvtTime.valid && cvtTestVal.valid;
            break;
          case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME:
            try {
              dateNumVal = (new Date(fieldValue).getTime());
              testNumVal = (new Date(testValue).getTime());
              valid = true;
            } catch (e) {
              valid = false;
            }
            break;
          default:
            valid = false;
            break;
        }

        //The value is not valid, no point in comparing.
        if(!valid){
          return false;
        }

        if ("is at" === condition) {
          valid = dateNumVal === testNumVal;
        } else if ("is before" === condition) {
          valid = dateNumVal < testNumVal;
        } else if ("is after" === condition) {
          valid = dateNumVal > testNumVal;
        } else {
          valid = false;
        }

        return valid;
      },
      "url": function(fieldValue, testValue, condition){
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "barcode": function(fieldValue, testValue, condition){
        fieldValue = fieldValue || {};

        if(typeof(fieldValue.text) !== "string"){
          return false;
        }

        return this.comparisonString(fieldValue.text, testValue, condition);
      },
      "sliderNumber": function(fieldValue, testValue, condition){
        return this.numericalComparison(fieldValue, testValue, condition);
      },
      "comparisonString": function(fieldValue, testValue, condition){
        var valid = true;

        if ("is" === condition) {
          valid = fieldValue === testValue;
        } else if ("is not" === condition) {
          valid = fieldValue !== testValue;
        } else if ("contains" === condition) {
          valid = fieldValue.indexOf(testValue) !== -1;
        } else if ("does not contain" === condition) {
          valid = fieldValue.indexOf(testValue) === -1;
        } else if ("begins with" === condition) {
          valid = fieldValue.substring(0, testValue.length) === testValue;
        } else if ("ends with" === condition) {
          valid = fieldValue.substring(Math.max(0, (fieldValue.length - testValue.length)), fieldValue.length) === testValue;
        } else {
          valid = false;
        }

        return valid;
      },
      "numericalComparison": function(fieldValue, testValue, condition){
        var fieldValNum = parseInt(fieldValue, 10);
        var testValNum = parseInt(testValue, 10);

        if(isNaN(fieldValNum) || isNaN(testValNum)){
          return false;
        }

        if ("is equal to" === condition) {
          return fieldValNum === testValNum;
        } else if ("is less than" === condition) {
          return fieldValNum < testValNum;
        } else if ("is greater than" === condition) {
          return fieldValNum > testValNum;
        } else {
          return false;
        }
      },
      "cvtTimeToSeconds": function(fieldValue) {
        var valid = false;
        var seconds = 0;
        if (typeof fieldValue === "string") {
          var parts = fieldValue.split(':');
          valid = (parts.length === 2) || (parts.length === 3);
          if (valid) {
            valid = isNumberBetween(parts[0], 0, 23);
            seconds += (parseInt(parts[0], 10) * 60 * 60);
          }
          if (valid) {
            valid = isNumberBetween(parts[1], 0, 59);
            seconds += (parseInt(parts[1], 10) * 60);
          }
          if (valid && (parts.length === 3)) {
            valid = isNumberBetween(parts[2], 0, 59);
            seconds += parseInt(parts[2], 10);
          }
        }
        return {valid: valid, seconds: seconds};
      }
    };



    var isFieldRuleSubject = function (fieldId) {
      return !!fieldRuleSubjectMap[fieldId];
    };

    var isPageRuleSubject = function (pageId) {
      return !!pageRuleSubjectMap[pageId];
    };

    function buildFieldMap(cb) {
      // Iterate over all fields in form definition & build fieldMap
      async.each(definition.pages, function (page, cbPages) {
        async.each(page.fields, function (field, cbFields) {
          field.pageId = page._id;

          /**
           * If the field is an admin field, then it is not considered part of validation for a submission.
           */
          if(field.adminOnly){
            adminFieldMap[field._id] = field;
            return cbFields();
          }

          field.fieldOptions = field.fieldOptions ? field.fieldOptions : {};
          field.fieldOptions.definition = field.fieldOptions.definition ? field.fieldOptions.definition : {};
          field.fieldOptions.validation = field.fieldOptions.validation ? field.fieldOptions.validation : {};

          fieldMap[field._id] = field;
          if (field.required) {
            requiredFieldMap[field._id] = {
              field: field,
              submitted: false,
              validated: false
            };
          }
          return cbFields();
        }, function () {
          return cbPages();
        });
      }, cb);
    }

    function buildFieldRuleMaps(cb) {
      // Iterate over all rules in form definition & build ruleSubjectMap
      async.each(definition.fieldRules, function (rule, cbRules) {
        async.each(rule.ruleConditionalStatements, function (ruleConditionalStatement, cbRuleConditionalStatements) {
          var fieldId = ruleConditionalStatement.sourceField;
          fieldRulePredicateMap[fieldId] = fieldRulePredicateMap[fieldId] || [];
          fieldRulePredicateMap[fieldId].push(rule);
          return cbRuleConditionalStatements();
        }, function () {

          /**
           * Target fields are an array of fieldIds that can be targeted by a field rule
           * To maintain backwards compatibility, the case where the targetPage is not an array has to be considered
           * @type {*|Array}
           */
          if(Array.isArray(rule.targetField)){
            async.each(rule.targetField, function(targetField, cb){
              fieldRuleSubjectMap[targetField] = fieldRuleSubjectMap[targetField] || [];
              fieldRuleSubjectMap[targetField].push(rule);
              cb();
            }, cbRules);
          } else {
            fieldRuleSubjectMap[rule.targetField] = fieldRuleSubjectMap[rule.targetField] || [];
            fieldRuleSubjectMap[rule.targetField].push(rule);
            return cbRules();
          }
        });
      }, cb);
    }

    function buildPageRuleMap(cb) {
      // Iterate over all rules in form definition & build ruleSubjectMap
      async.each(definition.pageRules, function (rule, cbRules) {
        async.each(rule.ruleConditionalStatements, function (ruleConditionalStatement, cbRulePredicates) {
          var fieldId = ruleConditionalStatement.sourceField;
          pageRulePredicateMap[fieldId] = pageRulePredicateMap[fieldId] || [];
          pageRulePredicateMap[fieldId].push(rule);
          return cbRulePredicates();
        }, function () {

          /**
           * Target pages are an array of pageIds that can be targeted by a page rule
           * To maintain backwards compatibility, the case where the targetPage is not an array has to be considered
           * @type {*|Array}
           */
          if(Array.isArray(rule.targetPage)){
            async.each(rule.targetPage, function(targetPage, cb){
              pageRuleSubjectMap[targetPage] = pageRuleSubjectMap[targetPage] || [];
              pageRuleSubjectMap[targetPage].push(rule);
              cb();
            }, cbRules);
          } else {
            pageRuleSubjectMap[rule.targetPage] = pageRuleSubjectMap[rule.targetPage] || [];
            pageRuleSubjectMap[rule.targetPage].push(rule);
            return cbRules();
          }
        });
      }, cb);
    }

    function buildSubmissionFieldsMap(cb) {
      submissionRequiredFieldsMap = JSON.parse(JSON.stringify(requiredFieldMap)); // clone the map for use with this submission
      submissionFieldsMap = {}; // start with empty map, rulesEngine can be called with multiple submissions

      // iterate over all the fields in the submissions and build a map for easier lookup
      async.each(submission.formFields, function (formField, cb) {
        if (!formField.fieldId) return cb(new Error("No fieldId in this submission entry: " + JSON.stringify(formField)));

        /**
         * If the field passed in a submission is an admin field, then return an error.
         */
        if(adminFieldMap[formField.fieldId]){
          return cb("Submission " + formField.fieldId + " is an admin field. Admin fields cannot be passed to the rules engine.");
        }

        submissionFieldsMap[formField.fieldId] = formField;
        return cb();
      }, cb);
    }

    function init(cb) {
      if (initialised) return cb();
      async.parallel([
        buildFieldMap,
        buildFieldRuleMaps,
        buildPageRuleMap
      ], function (err) {
        if (err) return cb(err);
        initialised = true;
        return cb();
      });
    }

    function initSubmission(formSubmission, cb) {
      init(function (err) {
        if (err) return cb(err);

        submission = formSubmission;
        buildSubmissionFieldsMap(cb);
      });
    }

    function getPreviousFieldValues(submittedField, previousSubmission, cb) {
      if (previousSubmission && previousSubmission.formFields) {
        async.filter(previousSubmission.formFields, function (formField, cb) {
          return cb(formField.fieldId.toString() === submittedField.fieldId.toString());
        }, function (results) {
          var previousFieldValues = null;
          if (results && results[0] && results[0].fieldValues) {
            previousFieldValues = results[0].fieldValues;
          }
          return cb(undefined, previousFieldValues);
        });
      } else {
        return cb();
      }
    }

    function validateForm(submission, previousSubmission, cb) {
      if ("function" === typeof previousSubmission) {
        cb = previousSubmission;
        previousSubmission = null;
      }
      init(function (err) {
        if (err) return cb(err);

        initSubmission(submission, function (err) {
          if (err) return cb(err);

          async.waterfall([

            function (cb) {
              return cb(undefined, {
                validation: {
                  valid: true
                }
              }); // any invalid fields will set this to false
            },
            function (res, cb) {
              validateSubmittedFields(res, previousSubmission, cb);
            },
            checkIfRequiredFieldsNotSubmitted
          ], function (err, results) {
            if (err) return cb(err);

            return cb(undefined, results);
          });
        });
      });
    }

    function validateSubmittedFields(res, previousSubmission, cb) {
      // for each field, call validateField
      async.each(submission.formFields, function (submittedField, callback) {
        var fieldID = submittedField.fieldId;
        var fieldDef = fieldMap[fieldID];

        getPreviousFieldValues(submittedField, previousSubmission, function (err, previousFieldValues) {
          if (err) return callback(err);
          getFieldValidationStatus(submittedField, fieldDef, previousFieldValues, function (err, fieldRes) {
            if (err) return callback(err);

            if (!fieldRes.valid) {
              res.validation.valid = false; // indicate invalid form if any fields invalid
              res.validation[fieldID] = fieldRes; // add invalid field info to validate form result
            }

            return callback();
          });

        });
      }, function (err) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, res);
      });
    }

    function checkIfRequiredFieldsNotSubmitted(res, cb) {
      async.each(Object.keys(submissionRequiredFieldsMap), function (requiredFieldId, cb) {
        var resField = {};
        if (!submissionRequiredFieldsMap[requiredFieldId].submitted) {
          isFieldVisible(requiredFieldId, true, function (err, visible) {
            if (err) return cb(err);
            if (visible) { // we only care about required fields if they are visible
              resField.fieldId = requiredFieldId;
              resField.valid = false;
              resField.fieldErrorMessage = ["Required Field Not Submitted"];
              res.validation[requiredFieldId] = resField;
              res.validation.valid = false;
            }
            return cb();
          });
        } else { // was included in submission
          return cb();
        }
      }, function (err) {
        if (err) return cb(err);

        return cb(undefined, res);
      });
    }

    /*
     * validate only field values on validation (no rules, no repeat checking)
     *     res:
     *     "validation":{
     *             "fieldId":{
     *                 "fieldId":"",
     *                 "valid":true,
     *                 "errorMessages":[
     *                     "length should be 3 to 5",
     *                     "should not contain dammit"
     *                 ]
     *             }
     *         }
     */
    function validateField(fieldId, submission, cb) {
      init(function (err) {
        if (err) return cb(err);

        initSubmission(submission, function (err) {
          if (err) return cb(err);

          var submissionField = submissionFieldsMap[fieldId];
          var fieldDef = fieldMap[fieldId];
          getFieldValidationStatus(submissionField, fieldDef, null, function (err, res) {
            if (err) return cb(err);
            var ret = {
              validation: {}
            };
            ret.validation[fieldId] = res;
            return cb(undefined, ret);
          });
        });
      });
    }

    /*
     * validate only single field value (no rules, no repeat checking)
     * cb(err, result)
     * example of result:
     * "validation":{
     *         "fieldId":{
     *             "fieldId":"",
     *             "valid":true,
     *             "errorMessages":[
     *                 "length should be 3 to 5",
     *                 "should not contain dammit"
     *             ]
     *         }
     *     }
     */
    function validateFieldValue(fieldId, inputValue, valueIndex, cb) {
      if ("function" === typeof valueIndex) {
        cb = valueIndex;
        valueIndex = 0;
      }

      init(function (err) {
        if (err) return cb(err);
        var fieldDefinition = fieldMap[fieldId];

        var required = false;
        if (fieldDefinition.repeating &&
          fieldDefinition.fieldOptions &&
          fieldDefinition.fieldOptions.definition &&
          fieldDefinition.fieldOptions.definition.minRepeat) {
          required = (valueIndex < fieldDefinition.fieldOptions.definition.minRepeat);
        } else {
          required = fieldDefinition.required;
        }

        var validation = (fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) ? fieldDefinition.fieldOptions.validation : undefined;

        if (validation && false === validation.validateImmediately) {
          var ret = {
            validation: {}
          };
          ret.validation[fieldId] = {
            "valid": true
          };
          return cb(undefined, ret);
        }

        if (fieldEmpty(inputValue)) {
          if (required) {
            return formatResponse("No value specified for required input", cb);
          } else {
            return formatResponse(undefined, cb); // optional field not supplied is valid
          }
        }

        // not empty need to validate
        getClientValidatorFunction(fieldDefinition.type, function (err, validator) {
          if (err) return cb(err);

          validator(inputValue, fieldDefinition, undefined, function (err) {
            var message;
            if (err) {
              if (err.message) {
                message = err.message;
              } else {
                message = "Unknown error message";
              }
            }
            formatResponse(message, cb);
          });
        });
      });

      function formatResponse(msg, cb) {
        var messages = {
          errorMessages: []
        };
        if (msg) {
          messages.errorMessages.push(msg);
        }
        return createValidatorResponse(fieldId, messages, function (err, res) {
          if (err) return cb(err);
          var ret = {
            validation: {}
          };
          ret.validation[fieldId] = res;
          return cb(undefined, ret);
        });
      }
    }

    function createValidatorResponse(fieldId, messages, cb) {
      // intentionally not checking err here, used further down to get validation errors
      var res = {};
      res.fieldId = fieldId;
      res.errorMessages = messages.errorMessages || [];
      res.fieldErrorMessage = messages.fieldErrorMessage || [];
      async.some(res.errorMessages, function (item, cb) {
        return cb(item !== null);
      }, function (someErrors) {
        res.valid = !someErrors && (res.fieldErrorMessage.length < 1);

        return cb(undefined, res);
      });
    }

    function getFieldValidationStatus(submittedField, fieldDef, previousFieldValues, cb) {
      isFieldVisible(fieldDef._id, true, function(err, visible){
        if(err){
          return cb(err);
        }
        validateFieldInternal(submittedField, fieldDef, previousFieldValues, visible, function (err, messages) {
          if (err) return cb(err);
          createValidatorResponse(submittedField.fieldId, messages, cb);
        });
      });
    }

    function getMapFunction(key, map, cb) {
      var validator = map[key];
      if (!validator) {
        return cb(new Error("Invalid Field Type " + key));
      }

      return cb(undefined, validator);
    }

    function getValidatorFunction(fieldType, cb) {
      return getMapFunction(fieldType, validatorsMap, cb);
    }

    function getClientValidatorFunction(fieldType, cb) {
      return getMapFunction(fieldType, validatorsClientMap, cb);
    }

    function fieldEmpty(fieldValue) {
      return ('undefined' === typeof fieldValue || null === fieldValue || "" === fieldValue); // empty string also regarded as not specified
    }

    function validateFieldInternal(submittedField, fieldDef, previousFieldValues, visible, cb) {
      previousFieldValues = previousFieldValues || null;
      countSubmittedValues(submittedField, function (err, numSubmittedValues) {
        if (err) return cb(err);
        //Marking the visibility of the field on the definition.
        fieldDef.visible = visible;
        async.series({
          valuesSubmitted: async.apply(checkValueSubmitted, submittedField, fieldDef, visible),
          repeats: async.apply(checkRepeat, numSubmittedValues, fieldDef, visible),
          values: async.apply(checkValues, submittedField, fieldDef, previousFieldValues)
        }, function (err, results) {
          if (err) return cb(err);

          var fieldErrorMessages = [];
          if (results.valuesSubmitted) {
            fieldErrorMessages.push(results.valuesSubmitted);
          }
          if (results.repeats) {
            fieldErrorMessages.push(results.repeats);
          }
          return cb(undefined, {
            fieldErrorMessage: fieldErrorMessages,
            errorMessages: results.values
          });
        });
      });

      return; // just functions below this

      function checkValueSubmitted(submittedField, fieldDefinition, visible, cb) {
        if (!fieldDefinition.required) return cb(undefined, null);

        var valueSubmitted = submittedField && submittedField.fieldValues && (submittedField.fieldValues.length > 0);
        //No value submitted is only an error if the field is visible.
        if (!valueSubmitted && visible) {
          return cb(undefined, "No value submitted for field " + fieldDefinition.name);
        }
        return cb(undefined, null);

      }

      function countSubmittedValues(submittedField, cb) {
        var numSubmittedValues = 0;
        if (submittedField && submittedField.fieldValues && submittedField.fieldValues.length > 0) {
          for (var i = 0; i < submittedField.fieldValues.length; i += 1) {
            if (submittedField.fieldValues[i]) {
              numSubmittedValues += 1;
            }
          }
        }
        return cb(undefined, numSubmittedValues);
      }

      function checkRepeat(numSubmittedValues, fieldDefinition, visible, cb) {
        //If the field is not visible, then checking the repeating values of the field is not required
        if(!visible){
          return cb(undefined, null);
        }

        if (fieldDefinition.repeating && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.definition) {
          if (fieldDefinition.fieldOptions.definition.minRepeat) {
            if (numSubmittedValues < fieldDefinition.fieldOptions.definition.minRepeat) {
              return cb(undefined, "Expected min of " + fieldDefinition.fieldOptions.definition.minRepeat + " values for field " + fieldDefinition.name + " but got " + numSubmittedValues);
            }
          }

          if (fieldDefinition.fieldOptions.definition.maxRepeat) {
            if (numSubmittedValues > fieldDefinition.fieldOptions.definition.maxRepeat) {
              return cb(undefined, "Expected max of " + fieldDefinition.fieldOptions.definition.maxRepeat + " values for field " + fieldDefinition.name + " but got " + numSubmittedValues);
            }
          }
        } else {
          if (numSubmittedValues > 1) {
            return cb(undefined, "Should not have multiple values for non-repeating field");
          }
        }

        return cb(undefined, null);
      }

      function checkValues(submittedField, fieldDefinition, previousFieldValues, cb) {
        getValidatorFunction(fieldDefinition.type, function (err, validator) {
          if (err) return cb(err);
          async.map(submittedField.fieldValues, function (fieldValue, cb) {
            if (fieldEmpty(fieldValue)) {
              return cb(undefined, null);
            } else {
              validator(fieldValue, fieldDefinition, previousFieldValues, function (validationError) {
                var errorMessage;
                if (validationError) {
                  errorMessage = validationError.message || "Error during validation of field";
                } else {
                  errorMessage = null;
                }

                if (submissionRequiredFieldsMap[fieldDefinition._id]) { // set to true if at least one value
                  submissionRequiredFieldsMap[fieldDefinition._id].submitted = true;
                }

                return cb(undefined, errorMessage);
              });
            }
          }, function (err, results) {
            if (err) return cb(err);

            return cb(undefined, results);
          });
        });
      }
    }

    function convertSimpleFormatToRegex(field_format_string) {
      var regex = "^";
      var C = "c".charCodeAt(0);
      var N = "n".charCodeAt(0);

      var i;
      var ch;
      var match;
      var len = field_format_string.length;
      for (i = 0; i < len; i += 1) {
        ch = field_format_string.charCodeAt(i);
        switch (ch) {
          case C:
            match = "[a-zA-Z0-9]";
            break;
          case N:
            match = "[0-9]";
            break;
          default:
            var num = ch.toString(16).toUpperCase();
            match = "\\u" + ("0000" + num).substr(-4);
            break;
        }
        regex += match;
      }
      return regex + "$";
    }

    function validFormatRegex(fieldValue, field_format_string) {
      var pattern = new RegExp(field_format_string);
      return pattern.test(fieldValue);
    }

    function validFormat(fieldValue, field_format_mode, field_format_string) {
      var regex;
      if ("simple" === field_format_mode) {
        regex = convertSimpleFormatToRegex(field_format_string);
      } else if ("regex" === field_format_mode) {
        regex = field_format_string;
      } else { // should never be anything else, but if it is then default to simple format
        regex = convertSimpleFormatToRegex(field_format_string);
      }

      return validFormatRegex(fieldValue, regex);
    }

    function validatorString(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof fieldValue !== "string") {
        return cb(new Error("Expected string but got " + typeof(fieldValue)));
      }

      var validation = {};
      if (fieldDefinition && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) {
        validation = fieldDefinition.fieldOptions.validation;
      }

      var field_format_mode = validation.field_format_mode || "";
      field_format_mode = field_format_mode.trim();
      var field_format_string = validation.field_format_string || "";
      field_format_string = field_format_string.trim();

      if (field_format_string && (field_format_string.length > 0) && field_format_mode && (field_format_mode.length > 0)) {
        if (!validFormat(fieldValue, field_format_mode, field_format_string)) {
          return cb(new Error("field value in incorrect format, expected format: " + field_format_string + " but submission value is: " + fieldValue));
        }
      }

      if (fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.min) {
        if (fieldValue.length < fieldDefinition.fieldOptions.validation.min) {
          return cb(new Error("Expected minimum string length of " + fieldDefinition.fieldOptions.validation.min + " but submission is " + fieldValue.length + ". Submitted val: " + fieldValue));
        }
      }

      if (fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.max) {
        if (fieldValue.length > fieldDefinition.fieldOptions.validation.max) {
          return cb(new Error("Expected maximum string length of " + fieldDefinition.fieldOptions.validation.max + " but submission is " + fieldValue.length + ". Submitted val: " + fieldValue));
        }
      }

      return cb();
    }

    function validatorNumericString(fieldValue, fieldDefinition, previousFieldValues, cb) {
      var testVal = (fieldValue - 0); // coerce to number (or NaN)
      /*jshint eqeqeq:false */
      var numeric = (testVal == fieldValue); // testVal co-erced to numeric above, so numeric comparison and NaN != NaN

      if (!numeric) {
        return cb(new Error("Expected numeric but got: " + fieldValue));
      }

      return validatorNumber(testVal, fieldDefinition, previousFieldValues, cb);
    }

    function validatorNumber(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof fieldValue !== "number") {
        return cb(new Error("Expected number but got " + typeof(fieldValue)));
      }

      if (fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.min) {
        if (fieldValue < fieldDefinition.fieldOptions.validation.min) {
          return cb(new Error("Expected minimum Number " + fieldDefinition.fieldOptions.validation.min + " but submission is " + fieldValue + ". Submitted number: " + fieldValue));
        }
      }

      if (fieldDefinition.fieldOptions.validation.max) {
        if (fieldValue > fieldDefinition.fieldOptions.validation.max) {
          return cb(new Error("Expected maximum Number " + fieldDefinition.fieldOptions.validation.max + " but submission is " + fieldValue + ". Submitted number: " + fieldValue));
        }
      }

      return cb();
    }

    function validatorEmail(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof(fieldValue) !== "string") {
        return cb(new Error("Expected string but got " + typeof(fieldValue)));
      }

      if (fieldValue.match(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/g) === null) {
        return cb(new Error("Invalid email address format: " + fieldValue));
      } else {
        return cb();
      }
    }

    function validatorDropDown(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof(fieldValue) !== "string") {
        return cb(new Error("Expected submission to be string but got " + typeof(fieldValue)));
      }

      //Check value exists in the field definition
      if (!fieldDefinition.fieldOptions.definition.options) {
        return cb(new Error("No options exist for field " + fieldDefinition.name));
      }

      async.some(fieldDefinition.fieldOptions.definition.options, function (dropdownOption, cb) {
        return cb(dropdownOption.label === fieldValue);
      }, function (found) {
        if (!found) {
          return cb(new Error("Invalid option specified: " + fieldValue));
        } else {
          return cb();
        }
      });
    }

    function validatorCheckboxes(fieldValue, fieldDefinition, previousFieldValues, cb) {
      var minVal;

      if (fieldDefinition && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) {
        minVal = fieldDefinition.fieldOptions.validation.min;
      }
      var maxVal;
      if (fieldDefinition && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) {
        maxVal = fieldDefinition.fieldOptions.validation.max;
      }

      if (minVal) {
        if (fieldValue.selections === null || fieldValue.selections === undefined || fieldValue.selections.length < minVal && fieldDefinition.visible) {
          var len;
          if (fieldValue.selections) {
            len = fieldValue.selections.length;
          }
          return cb(new Error("Expected a minimum number of selections " + minVal + " but got " + len));
        }
      }

      if (maxVal) {
        if (fieldValue.selections) {
          if (fieldValue.selections.length > maxVal) {
            return cb(new Error("Expected a maximum number of selections " + maxVal + " but got " + fieldValue.selections.length));
          }
        }
      }

      var optionsInCheckbox = [];

      async.eachSeries(fieldDefinition.fieldOptions.definition.options, function (choice, cb) {
        for (var choiceName in choice) {
          optionsInCheckbox.push(choice[choiceName]);
        }
        return cb();
      }, function () {
        async.eachSeries(fieldValue.selections, function (selection, cb) {
          if (typeof(selection) !== "string") {
            return cb(new Error("Expected checkbox submission to be string but got " + typeof(selection)));
          }

          if (optionsInCheckbox.indexOf(selection) === -1) {
            return cb(new Error("Checkbox Option " + selection + " does not exist in the field."));
          }

          return cb();
        }, cb);
      });
    }

    function validatorLocationMap(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (fieldValue.lat && fieldValue["long"]) {
        if (isNaN(parseFloat(fieldValue.lat)) || isNaN(parseFloat(fieldValue["long"]))) {
          return cb(new Error("Invalid latitude and longitude values"));
        } else {
          return cb();
        }
      } else {
        return cb(new Error("Invalid object for locationMap submission"));
      }
    }


    function validatorLocation(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (fieldDefinition.fieldOptions.definition.locationUnit === "latlong") {
        if (fieldValue.lat && fieldValue["long"]) {
          if (isNaN(parseFloat(fieldValue.lat)) || isNaN(parseFloat(fieldValue["long"]))) {
            return cb(new Error("Invalid latitude and longitude values"));
          } else {
            return cb();
          }
        } else {
          return cb(new Error("Invalid object for latitude longitude submission"));
        }
      } else {
        if (fieldValue.zone && fieldValue.eastings && fieldValue.northings) {
          //Zone must be 3 characters, eastings 6 and northings 9
          return validateNorthingsEastings(fieldValue, cb);
        } else {
          return cb(new Error("Invalid object for northings easting submission. Zone, Eastings and Northings elemets are required"));
        }
      }

      function validateNorthingsEastings(fieldValue, cb) {
        if (typeof(fieldValue.zone) !== "string" || fieldValue.zone.length === 0) {
          return cb(new Error("Invalid zone definition for northings and eastings location. " + fieldValue.zone));
        }

        var east = parseInt(fieldValue.eastings, 10);
        if (isNaN(east)) {
          return cb(new Error("Invalid eastings definition for northings and eastings location. " + fieldValue.eastings));
        }

        var north = parseInt(fieldValue.northings, 10);
        if (isNaN(north)) {
          return cb(new Error("Invalid northings definition for northings and eastings location. " + fieldValue.northings));
        }

        return cb();
      }
    }

    function validatorAnyFile(fieldValue, fieldDefinition, previousFieldValues, cb) {
      // if any of the following validators return ok, then return ok.
      validatorBase64(fieldValue, fieldDefinition, previousFieldValues, function (err) {
        if (!err) {
          return cb();
        }
        validatorFile(fieldValue, fieldDefinition, previousFieldValues, function (err) {
          if (!err) {
            return cb();
          }
          validatorFileObj(fieldValue, fieldDefinition, previousFieldValues, function (err) {
            if (!err) {
              return cb();
            }
            return cb(err);
          });
        });
      });
    }

    /**
     * Function to validate a barcode submission
     *
     * Must be an object with the following contents
     *
     * {
     *   text: "<<content of barcode>>",
     *   format: "<<barcode content format>>"
     * }
     *
     * @param fieldValue
     * @param fieldDefinition
     * @param previousFieldValues
     * @param cb
     */
    function validatorBarcode(fieldValue, fieldDefinition, previousFieldValues, cb){
      if(typeof(fieldValue) !== "object" || fieldValue === null){
        return cb(new Error("Expected object but got " + typeof(fieldValue)));
      }

      if(typeof(fieldValue.text) !== "string" || fieldValue.text.length === 0){
        return cb(new Error("Expected text parameter."));
      }

      if(typeof(fieldValue.format) !== "string" || fieldValue.format.length === 0){
        return cb(new Error("Expected format parameter."));
      }

      return cb();
    }

    function checkFileSize(fieldDefinition, fieldValue, sizeKey, cb) {
      fieldDefinition = fieldDefinition || {};
      var fieldOptions = fieldDefinition.fieldOptions || {};
      var fieldOptionsDef = fieldOptions.definition || {};
      var fileSizeMax = fieldOptionsDef.file_size || null; //FileSizeMax will be in KB. File size is in bytes

      if (fileSizeMax !== null) {
        var fieldValueSize = fieldValue[sizeKey];
        var fieldValueSizeKB = 1;
        if (fieldValueSize > 1000) {
          fieldValueSizeKB = fieldValueSize / 1000;
        }
        if (fieldValueSize > (fileSizeMax * 1000)) {
          return cb(new Error("File size is too large. File can be a maximum of " + fileSizeMax + "KB. Size of file selected: " + fieldValueSizeKB + "KB"));
        } else {
          return cb();
        }
      } else {
        return cb();
      }
    }

    function validatorFile(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof fieldValue !== "object") {
        return cb(new Error("Expected object but got " + typeof(fieldValue)));
      }

      var keyTypes = [
        {
          keyName: "fileName",
          valueType: "string"
        },
        {
          keyName: "fileSize",
          valueType: "number"
        },
        {
          keyName: "fileType",
          valueType: "string"
        },
        {
          keyName: "fileUpdateTime",
          valueType: "number"
        },
        {
          keyName: "hashName",
          valueType: "string"
        }
      ];

      async.each(keyTypes, function (keyType, cb) {
        var actualType = typeof fieldValue[keyType.keyName];
        if (actualType !== keyType.valueType) {
          return cb(new Error("Expected " + keyType.valueType + " but got " + actualType));
        }
        if (keyType.keyName === "fileName" && fieldValue[keyType.keyName].length <= 0) {
          return cb(new Error("Expected value for " + keyType.keyName));
        }

        return cb();
      }, function (err) {
        if (err) return cb(err);

        checkFileSize(fieldDefinition, fieldValue, "fileSize", function (err) {
          if (err) {
            return cb(err);
          }

          if (fieldValue.hashName.indexOf("filePlaceHolder") > -1) { //TODO abstract out to config
            return cb();
          } else if (previousFieldValues && previousFieldValues.hashName && previousFieldValues.hashName.indexOf(fieldValue.hashName) > -1) {
            return cb();
          } else {
            return cb(new Error("Invalid file placeholder text" + fieldValue.hashName));
          }
        });
      });
    }

    function validatorFileObj(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if ((typeof File !== "function")) {
        return cb(new Error("Expected File object but got " + typeof(fieldValue)));
      }

      var keyTypes = [
        {
          keyName: "name",
          valueType: "string"
        },
        {
          keyName: "size",
          valueType: "number"
        }
      ];

      async.each(keyTypes, function (keyType, cb) {
        var actualType = typeof fieldValue[keyType.keyName];
        if (actualType !== keyType.valueType) {
          return cb(new Error("Expected " + keyType.valueType + " but got " + actualType));
        }
        if (actualType === "string" && fieldValue[keyType.keyName].length <= 0) {
          return cb(new Error("Expected value for " + keyType.keyName));
        }
        if (actualType === "number" && fieldValue[keyType.keyName] <= 0) {
          return cb(new Error("Expected > 0 value for " + keyType.keyName));
        }

        return cb();
      }, function (err) {
        if (err) return cb(err);


        checkFileSize(fieldDefinition, fieldValue, "size", function (err) {
          if (err) {
            return cb(err);
          }
          return cb();
        });
      });
    }

    function validatorBase64(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof fieldValue !== "string") {
        return cb(new Error("Expected base64 string but got " + typeof(fieldValue)));
      }

      if (fieldValue.length <= 0) {
        return cb(new Error("Expected base64 string but was empty"));
      }

      return cb();
    }

    function validatorDateTime(fieldValue, fieldDefinition, previousFieldValues, cb) {
      var testDate;
      var valid = false;
      var parts = [];

      if (typeof(fieldValue) !== "string") {
        return cb(new Error("Expected string but got " + typeof(fieldValue)));
      }

      switch (fieldDefinition.fieldOptions.definition.datetimeUnit) {
        case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY:

          parts = fieldValue.split("/");
          valid = parts.length === 3;

          if(valid){
            valid = isNumberBetween(parts[2], 1, 31);
          }

          if(valid){
            valid = isNumberBetween(parts[1], 1, 12);
          }

          if(valid){
            valid = isNumberBetween(parts[0], 1000, 9999);
          }

          try {
            if(valid){
              testDate = new Date(parts[3], parts[1], parts[0]);
            } else {
              testDate = new Date(fieldValue);
            }
            valid = (testDate.toString() !== "Invalid Date");
          } catch (e) {
            valid = false;
          }

          if (valid) {
            return cb();
          } else {
            return cb(new Error("Invalid date value " + fieldValue + ". Date format is YYYY/MM/DD"));
          }
          break;
        case FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY:
          parts = fieldValue.split(':');
          valid = (parts.length === 2) || (parts.length === 3);
          if (valid) {
            valid = isNumberBetween(parts[0], 0, 23);
          }
          if (valid) {
            valid = isNumberBetween(parts[1], 0, 59);
          }
          if (valid && (parts.length === 3)) {
            valid = isNumberBetween(parts[2], 0, 59);
          }
          if (valid) {
            return cb();
          } else {
            return cb(new Error("Invalid time value " + fieldValue + ". Time format is HH:MM:SS"));
          }
          break;
        case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME:
          parts = fieldValue.split(/[- :]/);

          valid = (parts.length === 6) || (parts.length === 5);

          if(valid){
            valid = isNumberBetween(parts[2], 1, 31);
          }

          if(valid){
            valid = isNumberBetween(parts[1], 1, 12);
          }

          if(valid){
            valid = isNumberBetween(parts[0], 1000, 9999);
          }

          if (valid) {
            valid = isNumberBetween(parts[3], 0, 23);
          }
          if (valid) {
            valid = isNumberBetween(parts[4], 0, 59);
          }
          if (valid && parts.length === 6) {
            valid = isNumberBetween(parts[5], 0, 59);
          } else {
            parts[5] = 0;
          }

          try {
            if(valid){
              testDate = new Date(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
            } else {
              testDate = new Date(fieldValue);
            }

            valid = (testDate.toString() !== "Invalid Date");
          } catch (e) {
            valid = false;
          }

          if(valid){
            return cb();
          } else {
            return cb(new Error("Invalid dateTime string " + fieldValue + ". dateTime format is YYYY/MM/DD HH:MM:SS"));
          }
          break;
        default:
          return cb(new Error("Invalid dateTime fieldtype " + fieldDefinition.fieldOptions.definition.datetimeUnit));
      }
    }

    function validatorSection(value, fieldDefinition, previousFieldValues, cb) {
      return cb(new Error("Should not submit section field: " + fieldDefinition.name));
    }

    function rulesResult(rules, cb) {
      var visible = true;

      // Itterate over each rule that this field is a predicate of
      async.each(rules, function (rule, cbRule) {
        // For each rule, itterate over the predicate fields and evaluate the rule
        var predicateMapQueries = [];
        var predicateMapPassed = [];
        async.each(rule.ruleConditionalStatements, function (ruleConditionalStatement, cbPredicates) {
          var field = fieldMap[ruleConditionalStatement.sourceField];
          var passed = false;
          var submissionValues = [];
          var condition;
          var testValue;
          if (submissionFieldsMap[ruleConditionalStatement.sourceField] && submissionFieldsMap[ruleConditionalStatement.sourceField].fieldValues) {
            submissionValues = submissionFieldsMap[ruleConditionalStatement.sourceField].fieldValues;
            condition = ruleConditionalStatement.restriction;
            testValue = ruleConditionalStatement.sourceValue;

            // Validate rule predictes on the first entry only.
            passed = isConditionActive(field, submissionValues[0], testValue, condition);
          }
          predicateMapQueries.push({
            "field": field,
            "submissionValues": submissionValues,
            "condition": condition,
            "testValue": testValue,
            "passed": passed
          });

          if (passed) {
            predicateMapPassed.push(field);
          }
          return cbPredicates();
        }, function (err) {
          if (err) cbRule(err);

          function rulesPassed(condition, passed, queries) {
            return ((condition === "and") && ((passed.length === queries.length))) || // "and" condition - all rules must pass
              ((condition === "or") && ((passed.length > 0))); // "or" condition - only one rule must pass
          }

          /**
           * If any rule condition that targets the field/page hides that field/page, then the page is hidden.
           * Hiding the field/page takes precedence over any show. This will maintain consistency.
           * E.g. if x is y then show p1,p2 takes precendence over if x is z then hide p1, p2
           */
          if (rulesPassed(rule.ruleConditionalOperator, predicateMapPassed, predicateMapQueries)) {
            visible = (rule.type === "show") && visible;
          } else {
            visible = (rule.type !== "show") && visible;
          }

          return cbRule();
        });
      }, function (err) {
        if (err) return cb(err);

        return cb(undefined, visible);
      });
    }

    function isPageVisible(pageId, cb) {
      init(function (err) {
        if (err) return cb(err);
        if (isPageRuleSubject(pageId)) { // if the page is the target of a rule
          return rulesResult(pageRuleSubjectMap[pageId], cb); // execute page rules
        } else {
          return cb(undefined, true); // if page is not subject of any rule then must be visible
        }
      });
    }

    function isFieldVisible(fieldId, checkContainingPage, cb) {
      /*
       * fieldId = Id of field to check for reule predeciate references
       * checkContainingPage = if true check page containing field, and return false if the page is hidden
       */
      init(function (err) {
        if (err) return cb(err);

        // Fields are visable by default
        var field = fieldMap[fieldId];

        /**
         * If the field is an admin field, the rules engine returns an error, as admin fields cannot be the subject of rules engine actions.
         */
        if(adminFieldMap[fieldId]){
          return cb(new Error("Submission " + fieldId + " is an admin field. Admin fields cannot be passed to the rules engine."));
        } else if(!field){
          return cb(new Error("Field does not exist in form"));
        }

        async.waterfall([

          function testPage(cb) {
            if (checkContainingPage) {
              isPageVisible(field.pageId, cb);
            } else {
              return cb(undefined, true);
            }
          },
          function testField(pageVisible, cb) {
            if (!pageVisible) { // if page containing field is not visible then don't need to check field
              return cb(undefined, false);
            }

            if (isFieldRuleSubject(fieldId)) { // If the field is the subject of a rule it may have been hidden
              return rulesResult(fieldRuleSubjectMap[fieldId], cb); // execute field rules
            } else {
              return cb(undefined, true); // if not subject of field rules then can't be hidden
            }
          }
        ], cb);
      });
    }

    /*
     * check all rules actions
     *      res:
     *      {
     *          "actions": {
     *              "pages": {
     *                  "targetId": {
     *                      "targetId": "",
     *                      "action": "show|hide"
     *                  }
     *              },
     *              "fields": {
     *              }
     *          }
     *      }
     */
    function checkRules(submissionJSON, cb) {
      init(function (err) {
        if (err) return cb(err);

        initSubmission(submissionJSON, function (err) {
          if (err) return cb(err);
          var actions = {};

          async.parallel([

            function (cb) {
              actions.fields = {};
              async.eachSeries(Object.keys(fieldRuleSubjectMap), function (fieldId, cb) {
                isFieldVisible(fieldId, false, function (err, fieldVisible) {
                  if (err) return cb(err);
                  actions.fields[fieldId] = {
                    targetId: fieldId,
                    action: (fieldVisible ? "show" : "hide")
                  };
                  return cb();
                });
              }, cb);
            },
            function (cb) {
              actions.pages = {};
              async.eachSeries(Object.keys(pageRuleSubjectMap), function (pageId, cb) {
                isPageVisible(pageId, function (err, pageVisible) {
                  if (err) return cb(err);
                  actions.pages[pageId] = {
                    targetId: pageId,
                    action: (pageVisible ? "show" : "hide")
                  };
                  return cb();
                });
              }, cb);
            }
          ], function (err) {
            if (err) return cb(err);

            return cb(undefined, {
              actions: actions
            });
          });
        });
      });
    }

    function isConditionActive(field, fieldValue, testValue, condition) {

      var fieldType = field.type;
      var fieldOptions = field.fieldOptions ? field.fieldOptions : {};

      if(typeof(fieldValue) === 'undefined' || fieldValue === null){
        return false;
      }

      if(typeof(fieldValueComparison[fieldType]) === "function"){
        return fieldValueComparison[fieldType](fieldValue, testValue, condition, fieldOptions);
      } else {
        return false;
      }

    }

    function isNumberBetween(num, min, max) {
      var numVal = parseInt(num, 10);
      return (!isNaN(numVal) && (numVal >= min) && (numVal <= max));
    }

    return {
      validateForm: validateForm,
      validateField: validateField,
      validateFieldValue: validateFieldValue,
      checkRules: checkRules,

      // The following are used internally, but exposed for tests
      validateFieldInternal: validateFieldInternal,
      initSubmission: initSubmission,
      isFieldVisible: isFieldVisible,
      isConditionActive: isConditionActive
    };
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = formsRulesEngine;
  }

}());

/* This is the suffix file */
  return module.exports(formDef);
}

/* End of suffix file */


//end  module;

//this is partial file which define the end of closure
})(window || module.exports);

