
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/pager/Router.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1 } = globals;

    function create_fragment$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const activeRoute = writable({});
    const routes = {};

    function register(route) {
    	routes[route.path] = route;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $activeRoute,
    		$$unsubscribe_activeRoute = noop;

    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, $$value => $$invalidate(2, $activeRoute = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_activeRoute());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);

    	const setupPage = () => {
    		for (let [path, route] of Object.entries(routes)) {
    			page(path, () => set_store_value(activeRoute, $activeRoute = route, $activeRoute));
    		}

    		// start page.js
    		page.start();
    	};

    	// wire up page.js when component mounts on the dom
    	onMount(setupPage);

    	// onMount(() => console.log(routes));
    	// remove page.js click handlers when component is destroyed
    	onDestroy(page.stop);

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		activeRoute,
    		routes,
    		register,
    		onMount,
    		onDestroy,
    		page,
    		setupPage,
    		$activeRoute
    	});

    	return [$$scope, slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/pager/Route.svelte generated by Svelte v3.44.2 */

    // (11:0) {#if $activeRoute.path === path}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*component*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*component*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, t.parentNode, t);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:0) {#if $activeRoute.path === path}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[2].path === /*path*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[2].path === /*path*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute, path*/ 5) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, $$value => $$invalidate(2, $activeRoute = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = '*' } = $$props;
    	let { component = null } = $$props;
    	register({ path, component });
    	const writable_props = ['path', 'component'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('component' in $$props) $$invalidate(1, component = $$props.component);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		register,
    		activeRoute,
    		path,
    		component,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('component' in $$props) $$invalidate(1, component = $$props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, component, $activeRoute, $$scope, slots];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { path: 0, component: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pager/NotFound.svelte generated by Svelte v3.44.2 */

    // (11:0) {#if $activeRoute.path === path}
    function create_if_block(ctx) {
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*component*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*component*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, t.parentNode, t);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(11:0) {#if $activeRoute.path === path}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[2].path === /*path*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[2].path === /*path*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute, path*/ 5) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, $$value => $$invalidate(2, $activeRoute = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, ['default']);
    	let { path = '*' } = $$props;
    	let { component = null } = $$props;
    	register({ path, component });
    	const writable_props = ['path', 'component'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('component' in $$props) $$invalidate(1, component = $$props.component);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		register,
    		activeRoute,
    		path,
    		component,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('component' in $$props) $$invalidate(1, component = $$props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, component, $activeRoute, $$scope, slots];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { path: 0, component: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get path() {
    		throw new Error("<NotFound>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<NotFound>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<NotFound>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<NotFound>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.44.2 */

    const file$2 = "src/pages/Home.svelte";

    function create_fragment$2(ctx) {
    	let div128;
    	let header;
    	let div34;
    	let div15;
    	let div0;
    	let a0;
    	let span0;
    	let t1;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let div1;
    	let button0;
    	let span1;
    	let t4;
    	let svg0;
    	let path0;
    	let t5;
    	let nav0;
    	let div13;
    	let button1;
    	let span2;
    	let t7;
    	let svg1;
    	let path1;
    	let t8;
    	let div12;
    	let div11;
    	let div10;
    	let a1;
    	let div2;
    	let svg2;
    	let path2;
    	let t9;
    	let div3;
    	let p0;
    	let t11;
    	let p1;
    	let t13;
    	let a2;
    	let div4;
    	let svg3;
    	let path3;
    	let t14;
    	let div5;
    	let p2;
    	let t16;
    	let p3;
    	let t18;
    	let a3;
    	let div6;
    	let svg4;
    	let path4;
    	let t19;
    	let div7;
    	let p4;
    	let t21;
    	let p5;
    	let t23;
    	let a4;
    	let div8;
    	let svg5;
    	let path5;
    	let t24;
    	let div9;
    	let p6;
    	let t26;
    	let p7;
    	let t28;
    	let a5;
    	let t30;
    	let a6;
    	let t32;
    	let a7;
    	let t34;
    	let div14;
    	let a8;
    	let t36;
    	let a9;
    	let t38;
    	let div33;
    	let div32;
    	let div28;
    	let div18;
    	let div16;
    	let img1;
    	let img1_src_value;
    	let t39;
    	let div17;
    	let button2;
    	let span3;
    	let t41;
    	let svg6;
    	let path6;
    	let t42;
    	let div27;
    	let nav1;
    	let a10;
    	let div19;
    	let svg7;
    	let path7;
    	let t43;
    	let div20;
    	let t45;
    	let a11;
    	let div21;
    	let svg8;
    	let path8;
    	let t46;
    	let div22;
    	let t48;
    	let a12;
    	let div23;
    	let svg9;
    	let path9;
    	let t49;
    	let div24;
    	let t51;
    	let a13;
    	let div25;
    	let svg10;
    	let path10;
    	let t52;
    	let div26;
    	let t54;
    	let div31;
    	let div29;
    	let a14;
    	let t56;
    	let a15;
    	let t58;
    	let a16;
    	let t60;
    	let div30;
    	let a17;
    	let t62;
    	let p8;
    	let t63;
    	let a18;
    	let t65;
    	let main;
    	let div43;
    	let div35;
    	let t66;
    	let div42;
    	let div41;
    	let div37;
    	let img2;
    	let img2_src_value;
    	let t67;
    	let div36;
    	let t68;
    	let div40;
    	let h1;
    	let span4;
    	let t70;
    	let span5;
    	let t72;
    	let p9;
    	let t74;
    	let div39;
    	let div38;
    	let a19;
    	let t76;
    	let a20;
    	let t78;
    	let div51;
    	let div50;
    	let p10;
    	let t80;
    	let div49;
    	let div44;
    	let img3;
    	let img3_src_value;
    	let t81;
    	let div45;
    	let img4;
    	let img4_src_value;
    	let t82;
    	let div46;
    	let img5;
    	let img5_src_value;
    	let t83;
    	let div47;
    	let img6;
    	let img6_src_value;
    	let t84;
    	let div48;
    	let img7;
    	let img7_src_value;
    	let t85;
    	let div76;
    	let div52;
    	let t86;
    	let div66;
    	let div65;
    	let div62;
    	let div56;
    	let div53;
    	let span6;
    	let svg11;
    	let path11;
    	let t87;
    	let div55;
    	let h20;
    	let t89;
    	let p11;
    	let t91;
    	let div54;
    	let a21;
    	let t93;
    	let div61;
    	let blockquote;
    	let div57;
    	let p12;
    	let t95;
    	let footer0;
    	let div60;
    	let div58;
    	let img8;
    	let img8_src_value;
    	let t96;
    	let div59;
    	let t98;
    	let div64;
    	let div63;
    	let img9;
    	let img9_src_value;
    	let t99;
    	let div75;
    	let div74;
    	let div71;
    	let div70;
    	let div67;
    	let span7;
    	let svg12;
    	let path12;
    	let t100;
    	let div69;
    	let h21;
    	let t102;
    	let p13;
    	let t104;
    	let div68;
    	let a22;
    	let t106;
    	let div73;
    	let div72;
    	let img10;
    	let img10_src_value;
    	let t107;
    	let div103;
    	let div102;
    	let h22;
    	let t109;
    	let p14;
    	let t111;
    	let div101;
    	let div79;
    	let div77;
    	let span8;
    	let svg13;
    	let path13;
    	let t112;
    	let div78;
    	let h30;
    	let t114;
    	let p15;
    	let t116;
    	let div82;
    	let div80;
    	let span9;
    	let svg14;
    	let path14;
    	let t117;
    	let div81;
    	let h31;
    	let t119;
    	let p16;
    	let t121;
    	let div85;
    	let div83;
    	let span10;
    	let svg15;
    	let path15;
    	let t122;
    	let div84;
    	let h32;
    	let t124;
    	let p17;
    	let t126;
    	let div88;
    	let div86;
    	let span11;
    	let svg16;
    	let path16;
    	let t127;
    	let div87;
    	let h33;
    	let t129;
    	let p18;
    	let t131;
    	let div91;
    	let div89;
    	let span12;
    	let svg17;
    	let path17;
    	let t132;
    	let div90;
    	let h34;
    	let t134;
    	let p19;
    	let t136;
    	let div94;
    	let div92;
    	let span13;
    	let svg18;
    	let path18;
    	let t137;
    	let div93;
    	let h35;
    	let t139;
    	let p20;
    	let t141;
    	let div97;
    	let div95;
    	let span14;
    	let svg19;
    	let path19;
    	let t142;
    	let div96;
    	let h36;
    	let t144;
    	let p21;
    	let t146;
    	let div100;
    	let div98;
    	let span15;
    	let svg20;
    	let path20;
    	let t147;
    	let div99;
    	let h37;
    	let t149;
    	let p22;
    	let t151;
    	let div111;
    	let div107;
    	let div106;
    	let div105;
    	let img11;
    	let img11_src_value;
    	let t152;
    	let div104;
    	let t153;
    	let div110;
    	let div109;
    	let h23;
    	let span16;
    	let t155;
    	let p23;
    	let t157;
    	let p24;
    	let t159;
    	let div108;
    	let p25;
    	let span17;
    	let t161;
    	let span19;
    	let span18;
    	let t163;
    	let t164;
    	let p26;
    	let span20;
    	let t166;
    	let span22;
    	let span21;
    	let t168;
    	let t169;
    	let p27;
    	let span23;
    	let t171;
    	let span25;
    	let span24;
    	let t173;
    	let t174;
    	let p28;
    	let span26;
    	let t176;
    	let span28;
    	let span27;
    	let t178;
    	let t179;
    	let div114;
    	let div113;
    	let h24;
    	let span29;
    	let t181;
    	let span30;
    	let t183;
    	let div112;
    	let a23;
    	let t185;
    	let a24;
    	let t187;
    	let footer1;
    	let h25;
    	let t189;
    	let div127;
    	let div124;
    	let div121;
    	let div117;
    	let div115;
    	let h38;
    	let t191;
    	let ul0;
    	let li0;
    	let a25;
    	let t193;
    	let li1;
    	let a26;
    	let t195;
    	let li2;
    	let a27;
    	let t197;
    	let li3;
    	let a28;
    	let t199;
    	let div116;
    	let h39;
    	let t201;
    	let ul1;
    	let li4;
    	let a29;
    	let t203;
    	let li5;
    	let a30;
    	let t205;
    	let li6;
    	let a31;
    	let t207;
    	let li7;
    	let a32;
    	let t209;
    	let div120;
    	let div118;
    	let h310;
    	let t211;
    	let ul2;
    	let li8;
    	let a33;
    	let t213;
    	let li9;
    	let a34;
    	let t215;
    	let li10;
    	let a35;
    	let t217;
    	let li11;
    	let a36;
    	let t219;
    	let li12;
    	let a37;
    	let t221;
    	let div119;
    	let h311;
    	let t223;
    	let ul3;
    	let li13;
    	let a38;
    	let t225;
    	let li14;
    	let a39;
    	let t227;
    	let li15;
    	let a40;
    	let t229;
    	let div123;
    	let h312;
    	let t231;
    	let p29;
    	let t233;
    	let form;
    	let label;
    	let t235;
    	let input;
    	let t236;
    	let div122;
    	let button3;
    	let t238;
    	let div126;
    	let div125;
    	let a41;
    	let span31;
    	let t240;
    	let svg21;
    	let path21;
    	let t241;
    	let a42;
    	let span32;
    	let t243;
    	let svg22;
    	let path22;
    	let t244;
    	let a43;
    	let span33;
    	let t246;
    	let svg23;
    	let path23;
    	let t247;
    	let a44;
    	let span34;
    	let t249;
    	let svg24;
    	let path24;
    	let t250;
    	let a45;
    	let span35;
    	let t252;
    	let svg25;
    	let path25;
    	let t253;
    	let p30;

    	const block = {
    		c: function create() {
    			div128 = element("div");
    			header = element("header");
    			div34 = element("div");
    			div15 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			span0 = element("span");
    			span0.textContent = "Workflow";
    			t1 = space();
    			img0 = element("img");
    			t2 = space();
    			div1 = element("div");
    			button0 = element("button");
    			span1 = element("span");
    			span1.textContent = "Open menu";
    			t4 = space();
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			nav0 = element("nav");
    			div13 = element("div");
    			button1 = element("button");
    			span2 = element("span");
    			span2.textContent = "Solutions";
    			t7 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t8 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			a1 = element("a");
    			div2 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t9 = space();
    			div3 = element("div");
    			p0 = element("p");
    			p0.textContent = "Inbox";
    			t11 = space();
    			p1 = element("p");
    			p1.textContent = "Get a better understanding of where your traffic is coming from.";
    			t13 = space();
    			a2 = element("a");
    			div4 = element("div");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t14 = space();
    			div5 = element("div");
    			p2 = element("p");
    			p2.textContent = "Messaging";
    			t16 = space();
    			p3 = element("p");
    			p3.textContent = "Speak directly to your customers in a more meaningful way.";
    			t18 = space();
    			a3 = element("a");
    			div6 = element("div");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			t19 = space();
    			div7 = element("div");
    			p4 = element("p");
    			p4.textContent = "Live Chat";
    			t21 = space();
    			p5 = element("p");
    			p5.textContent = "Your customers' data will be safe and secure.";
    			t23 = space();
    			a4 = element("a");
    			div8 = element("div");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			t24 = space();
    			div9 = element("div");
    			p6 = element("p");
    			p6.textContent = "Knowledge Base";
    			t26 = space();
    			p7 = element("p");
    			p7.textContent = "Connect with third-party tools that you're already using.";
    			t28 = space();
    			a5 = element("a");
    			a5.textContent = "Pricing";
    			t30 = space();
    			a6 = element("a");
    			a6.textContent = "Partners";
    			t32 = space();
    			a7 = element("a");
    			a7.textContent = "Company";
    			t34 = space();
    			div14 = element("div");
    			a8 = element("a");
    			a8.textContent = "Sign in";
    			t36 = space();
    			a9 = element("a");
    			a9.textContent = "Sign up";
    			t38 = space();
    			div33 = element("div");
    			div32 = element("div");
    			div28 = element("div");
    			div18 = element("div");
    			div16 = element("div");
    			img1 = element("img");
    			t39 = space();
    			div17 = element("div");
    			button2 = element("button");
    			span3 = element("span");
    			span3.textContent = "Close menu";
    			t41 = space();
    			svg6 = svg_element("svg");
    			path6 = svg_element("path");
    			t42 = space();
    			div27 = element("div");
    			nav1 = element("nav");
    			a10 = element("a");
    			div19 = element("div");
    			svg7 = svg_element("svg");
    			path7 = svg_element("path");
    			t43 = space();
    			div20 = element("div");
    			div20.textContent = "Inbox";
    			t45 = space();
    			a11 = element("a");
    			div21 = element("div");
    			svg8 = svg_element("svg");
    			path8 = svg_element("path");
    			t46 = space();
    			div22 = element("div");
    			div22.textContent = "Messaging";
    			t48 = space();
    			a12 = element("a");
    			div23 = element("div");
    			svg9 = svg_element("svg");
    			path9 = svg_element("path");
    			t49 = space();
    			div24 = element("div");
    			div24.textContent = "Live Chat";
    			t51 = space();
    			a13 = element("a");
    			div25 = element("div");
    			svg10 = svg_element("svg");
    			path10 = svg_element("path");
    			t52 = space();
    			div26 = element("div");
    			div26.textContent = "Knowledge Base";
    			t54 = space();
    			div31 = element("div");
    			div29 = element("div");
    			a14 = element("a");
    			a14.textContent = "Pricing";
    			t56 = space();
    			a15 = element("a");
    			a15.textContent = "Partners";
    			t58 = space();
    			a16 = element("a");
    			a16.textContent = "Company";
    			t60 = space();
    			div30 = element("div");
    			a17 = element("a");
    			a17.textContent = "Sign up";
    			t62 = space();
    			p8 = element("p");
    			t63 = text("Existing customer?\n                ");
    			a18 = element("a");
    			a18.textContent = "Sign in";
    			t65 = space();
    			main = element("main");
    			div43 = element("div");
    			div35 = element("div");
    			t66 = space();
    			div42 = element("div");
    			div41 = element("div");
    			div37 = element("div");
    			img2 = element("img");
    			t67 = space();
    			div36 = element("div");
    			t68 = space();
    			div40 = element("div");
    			h1 = element("h1");
    			span4 = element("span");
    			span4.textContent = "Take control of your";
    			t70 = space();
    			span5 = element("span");
    			span5.textContent = "customer support";
    			t72 = space();
    			p9 = element("p");
    			p9.textContent = "Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.";
    			t74 = space();
    			div39 = element("div");
    			div38 = element("div");
    			a19 = element("a");
    			a19.textContent = "Get started";
    			t76 = space();
    			a20 = element("a");
    			a20.textContent = "Live demo";
    			t78 = space();
    			div51 = element("div");
    			div50 = element("div");
    			p10 = element("p");
    			p10.textContent = "Trusted by over 5 very average small businesses";
    			t80 = space();
    			div49 = element("div");
    			div44 = element("div");
    			img3 = element("img");
    			t81 = space();
    			div45 = element("div");
    			img4 = element("img");
    			t82 = space();
    			div46 = element("div");
    			img5 = element("img");
    			t83 = space();
    			div47 = element("div");
    			img6 = element("img");
    			t84 = space();
    			div48 = element("div");
    			img7 = element("img");
    			t85 = space();
    			div76 = element("div");
    			div52 = element("div");
    			t86 = space();
    			div66 = element("div");
    			div65 = element("div");
    			div62 = element("div");
    			div56 = element("div");
    			div53 = element("div");
    			span6 = element("span");
    			svg11 = svg_element("svg");
    			path11 = svg_element("path");
    			t87 = space();
    			div55 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Stay on top of customer support";
    			t89 = space();
    			p11 = element("p");
    			p11.textContent = "Semper curabitur ullamcorper posuere nunc sed. Ornare iaculis bibendum malesuada faucibus lacinia porttitor. Pulvinar laoreet sagittis viverra duis. In venenatis sem arcu pretium pharetra at. Lectus viverra dui tellus ornare pharetra.";
    			t91 = space();
    			div54 = element("div");
    			a21 = element("a");
    			a21.textContent = "Get started";
    			t93 = space();
    			div61 = element("div");
    			blockquote = element("blockquote");
    			div57 = element("div");
    			p12 = element("p");
    			p12.textContent = "“Cras velit quis eros eget rhoncus lacus ultrices sed diam. Sit orci risus aenean curabitur donec aliquet. Mi venenatis in euismod ut.”";
    			t95 = space();
    			footer0 = element("footer");
    			div60 = element("div");
    			div58 = element("div");
    			img8 = element("img");
    			t96 = space();
    			div59 = element("div");
    			div59.textContent = "Marcia Hill, Digital Marketing Manager";
    			t98 = space();
    			div64 = element("div");
    			div63 = element("div");
    			img9 = element("img");
    			t99 = space();
    			div75 = element("div");
    			div74 = element("div");
    			div71 = element("div");
    			div70 = element("div");
    			div67 = element("div");
    			span7 = element("span");
    			svg12 = svg_element("svg");
    			path12 = svg_element("path");
    			t100 = space();
    			div69 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Better understand your customers";
    			t102 = space();
    			p13 = element("p");
    			p13.textContent = "Semper curabitur ullamcorper posuere nunc sed. Ornare iaculis bibendum malesuada faucibus lacinia porttitor. Pulvinar laoreet sagittis viverra duis. In venenatis sem arcu pretium pharetra at. Lectus viverra dui tellus ornare pharetra.";
    			t104 = space();
    			div68 = element("div");
    			a22 = element("a");
    			a22.textContent = "Get started";
    			t106 = space();
    			div73 = element("div");
    			div72 = element("div");
    			img10 = element("img");
    			t107 = space();
    			div103 = element("div");
    			div102 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Inbox support built for efficiency";
    			t109 = space();
    			p14 = element("p");
    			p14.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis. Blandit aliquam sit nisl euismod mattis in.";
    			t111 = space();
    			div101 = element("div");
    			div79 = element("div");
    			div77 = element("div");
    			span8 = element("span");
    			svg13 = svg_element("svg");
    			path13 = svg_element("path");
    			t112 = space();
    			div78 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Unlimited Inboxes";
    			t114 = space();
    			p15 = element("p");
    			p15.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.";
    			t116 = space();
    			div82 = element("div");
    			div80 = element("div");
    			span9 = element("span");
    			svg14 = svg_element("svg");
    			path14 = svg_element("path");
    			t117 = space();
    			div81 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Manage Team Members";
    			t119 = space();
    			p16 = element("p");
    			p16.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.";
    			t121 = space();
    			div85 = element("div");
    			div83 = element("div");
    			span10 = element("span");
    			svg15 = svg_element("svg");
    			path15 = svg_element("path");
    			t122 = space();
    			div84 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Spam Report";
    			t124 = space();
    			p17 = element("p");
    			p17.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.";
    			t126 = space();
    			div88 = element("div");
    			div86 = element("div");
    			span11 = element("span");
    			svg16 = svg_element("svg");
    			path16 = svg_element("path");
    			t127 = space();
    			div87 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Compose in Markdown";
    			t129 = space();
    			p18 = element("p");
    			p18.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.";
    			t131 = space();
    			div91 = element("div");
    			div89 = element("div");
    			span12 = element("span");
    			svg17 = svg_element("svg");
    			path17 = svg_element("path");
    			t132 = space();
    			div90 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Team Reporting";
    			t134 = space();
    			p19 = element("p");
    			p19.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.";
    			t136 = space();
    			div94 = element("div");
    			div92 = element("div");
    			span13 = element("span");
    			svg18 = svg_element("svg");
    			path18 = svg_element("path");
    			t137 = space();
    			div93 = element("div");
    			h35 = element("h3");
    			h35.textContent = "Saved Replies";
    			t139 = space();
    			p20 = element("p");
    			p20.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.";
    			t141 = space();
    			div97 = element("div");
    			div95 = element("div");
    			span14 = element("span");
    			svg19 = svg_element("svg");
    			path19 = svg_element("path");
    			t142 = space();
    			div96 = element("div");
    			h36 = element("h3");
    			h36.textContent = "Email Commenting";
    			t144 = space();
    			p21 = element("p");
    			p21.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.";
    			t146 = space();
    			div100 = element("div");
    			div98 = element("div");
    			span15 = element("span");
    			svg20 = svg_element("svg");
    			path20 = svg_element("path");
    			t147 = space();
    			div99 = element("div");
    			h37 = element("h3");
    			h37.textContent = "Connect with Customers";
    			t149 = space();
    			p22 = element("p");
    			p22.textContent = "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.";
    			t151 = space();
    			div111 = element("div");
    			div107 = element("div");
    			div106 = element("div");
    			div105 = element("div");
    			img11 = element("img");
    			t152 = space();
    			div104 = element("div");
    			t153 = space();
    			div110 = element("div");
    			div109 = element("div");
    			h23 = element("h2");
    			span16 = element("span");
    			span16.textContent = "Valuable Metrics";
    			t155 = space();
    			p23 = element("p");
    			p23.textContent = "Get actionable data that will help grow your business";
    			t157 = space();
    			p24 = element("p");
    			p24.textContent = "Rhoncus sagittis risus arcu erat lectus bibendum. Ut in adipiscing quis in viverra tristique sem. Ornare feugiat viverra eleifend fusce orci in quis amet. Sit in et vitae tortor, massa. Dapibus laoreet amet lacus nibh integer quis. Eu vulputate diam sit tellus quis at.";
    			t159 = space();
    			div108 = element("div");
    			p25 = element("p");
    			span17 = element("span");
    			span17.textContent = "8K+";
    			t161 = space();
    			span19 = element("span");
    			span18 = element("span");
    			span18.textContent = "Companies";
    			t163 = text(" use laoreet amet lacus nibh integer quis.");
    			t164 = space();
    			p26 = element("p");
    			span20 = element("span");
    			span20.textContent = "25K+";
    			t166 = space();
    			span22 = element("span");
    			span21 = element("span");
    			span21.textContent = "Countries around the globe";
    			t168 = text(" lacus nibh integer quis.");
    			t169 = space();
    			p27 = element("p");
    			span23 = element("span");
    			span23.textContent = "98%";
    			t171 = space();
    			span25 = element("span");
    			span24 = element("span");
    			span24.textContent = "Customer satisfaction";
    			t173 = text(" laoreet amet lacus nibh integer quis.");
    			t174 = space();
    			p28 = element("p");
    			span26 = element("span");
    			span26.textContent = "12M+";
    			t176 = space();
    			span28 = element("span");
    			span27 = element("span");
    			span27.textContent = "Issues resolved";
    			t178 = text(" lacus nibh integer quis.");
    			t179 = space();
    			div114 = element("div");
    			div113 = element("div");
    			h24 = element("h2");
    			span29 = element("span");
    			span29.textContent = "Ready to get started?";
    			t181 = space();
    			span30 = element("span");
    			span30.textContent = "Get in touch or create an account.";
    			t183 = space();
    			div112 = element("div");
    			a23 = element("a");
    			a23.textContent = "Learn more";
    			t185 = space();
    			a24 = element("a");
    			a24.textContent = "Get started";
    			t187 = space();
    			footer1 = element("footer");
    			h25 = element("h2");
    			h25.textContent = "Footer";
    			t189 = space();
    			div127 = element("div");
    			div124 = element("div");
    			div121 = element("div");
    			div117 = element("div");
    			div115 = element("div");
    			h38 = element("h3");
    			h38.textContent = "Solutions";
    			t191 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			a25 = element("a");
    			a25.textContent = "Marketing";
    			t193 = space();
    			li1 = element("li");
    			a26 = element("a");
    			a26.textContent = "Analytics";
    			t195 = space();
    			li2 = element("li");
    			a27 = element("a");
    			a27.textContent = "Commerce";
    			t197 = space();
    			li3 = element("li");
    			a28 = element("a");
    			a28.textContent = "Insights";
    			t199 = space();
    			div116 = element("div");
    			h39 = element("h3");
    			h39.textContent = "Support";
    			t201 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			a29 = element("a");
    			a29.textContent = "Pricing";
    			t203 = space();
    			li5 = element("li");
    			a30 = element("a");
    			a30.textContent = "Documentation";
    			t205 = space();
    			li6 = element("li");
    			a31 = element("a");
    			a31.textContent = "Guides";
    			t207 = space();
    			li7 = element("li");
    			a32 = element("a");
    			a32.textContent = "API Status";
    			t209 = space();
    			div120 = element("div");
    			div118 = element("div");
    			h310 = element("h3");
    			h310.textContent = "Company";
    			t211 = space();
    			ul2 = element("ul");
    			li8 = element("li");
    			a33 = element("a");
    			a33.textContent = "About";
    			t213 = space();
    			li9 = element("li");
    			a34 = element("a");
    			a34.textContent = "Blog";
    			t215 = space();
    			li10 = element("li");
    			a35 = element("a");
    			a35.textContent = "Jobs";
    			t217 = space();
    			li11 = element("li");
    			a36 = element("a");
    			a36.textContent = "Press";
    			t219 = space();
    			li12 = element("li");
    			a37 = element("a");
    			a37.textContent = "Partners";
    			t221 = space();
    			div119 = element("div");
    			h311 = element("h3");
    			h311.textContent = "Legal";
    			t223 = space();
    			ul3 = element("ul");
    			li13 = element("li");
    			a38 = element("a");
    			a38.textContent = "Claim";
    			t225 = space();
    			li14 = element("li");
    			a39 = element("a");
    			a39.textContent = "Privacy";
    			t227 = space();
    			li15 = element("li");
    			a40 = element("a");
    			a40.textContent = "Terms";
    			t229 = space();
    			div123 = element("div");
    			h312 = element("h3");
    			h312.textContent = "Subscribe to our newsletter";
    			t231 = space();
    			p29 = element("p");
    			p29.textContent = "The latest news, articles, and resources, sent to your inbox weekly.";
    			t233 = space();
    			form = element("form");
    			label = element("label");
    			label.textContent = "Email address";
    			t235 = space();
    			input = element("input");
    			t236 = space();
    			div122 = element("div");
    			button3 = element("button");
    			button3.textContent = "Subscribe";
    			t238 = space();
    			div126 = element("div");
    			div125 = element("div");
    			a41 = element("a");
    			span31 = element("span");
    			span31.textContent = "Facebook";
    			t240 = space();
    			svg21 = svg_element("svg");
    			path21 = svg_element("path");
    			t241 = space();
    			a42 = element("a");
    			span32 = element("span");
    			span32.textContent = "Instagram";
    			t243 = space();
    			svg22 = svg_element("svg");
    			path22 = svg_element("path");
    			t244 = space();
    			a43 = element("a");
    			span33 = element("span");
    			span33.textContent = "Twitter";
    			t246 = space();
    			svg23 = svg_element("svg");
    			path23 = svg_element("path");
    			t247 = space();
    			a44 = element("a");
    			span34 = element("span");
    			span34.textContent = "GitHub";
    			t249 = space();
    			svg24 = svg_element("svg");
    			path24 = svg_element("path");
    			t250 = space();
    			a45 = element("a");
    			span35 = element("span");
    			span35.textContent = "Dribbble";
    			t252 = space();
    			svg25 = svg_element("svg");
    			path25 = svg_element("path");
    			t253 = space();
    			p30 = element("p");
    			p30.textContent = "© 2020 Workflow, Inc. All rights reserved.";
    			attr_dev(span0, "class", "sr-only");
    			add_location(span0, file$2, 10, 12, 314);
    			attr_dev(img0, "class", "h-8 w-auto sm:h-10");
    			if (!src_url_equal(img0.src, img0_src_value = "https://tailwindui.com/img/logos/workflow-mark-purple-600-to-indigo-600.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$2, 11, 12, 364);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$2, 9, 10, 289);
    			attr_dev(div0, "class", "flex justify-start lg:w-0 lg:flex-1");
    			add_location(div0, file$2, 8, 8, 229);
    			attr_dev(span1, "class", "sr-only");
    			add_location(span1, file$2, 16, 12, 822);
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "d", "M4 6h16M4 12h16M4 18h16");
    			add_location(path0, file$2, 19, 14, 1066);
    			attr_dev(svg0, "class", "h-6 w-6");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "aria-hidden", "true");
    			add_location(svg0, file$2, 18, 12, 922);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500");
    			attr_dev(button0, "aria-expanded", "false");
    			add_location(button0, file$2, 15, 10, 570);
    			attr_dev(div1, "class", "-mr-2 -my-2 md:hidden");
    			add_location(div1, file$2, 14, 8, 524);
    			add_location(span2, file$2, 27, 14, 1644);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "d", "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z");
    			attr_dev(path1, "clip-rule", "evenodd");
    			add_location(path1, file$2, 34, 16, 2023);
    			attr_dev(svg1, "class", "text-gray-400 ml-2 h-5 w-5 group-hover:text-gray-500");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "aria-hidden", "true");
    			add_location(svg1, file$2, 33, 14, 1846);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "text-gray-500 group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500");
    			attr_dev(button1, "aria-expanded", "false");
    			add_location(button1, file$2, 26, 12, 1396);
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			attr_dev(path2, "stroke-width", "2");
    			attr_dev(path2, "d", "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4");
    			add_location(path2, file$2, 55, 24, 3489);
    			attr_dev(svg2, "class", "h-6 w-6");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "aria-hidden", "true");
    			add_location(svg2, file$2, 54, 22, 3335);
    			attr_dev(div2, "class", "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white sm:h-12 sm:w-12");
    			add_location(div2, file$2, 52, 20, 3097);
    			attr_dev(p0, "class", "text-base font-medium text-gray-900");
    			add_location(p0, file$2, 59, 22, 3879);
    			attr_dev(p1, "class", "mt-1 text-sm text-gray-500");
    			add_location(p1, file$2, 62, 22, 4006);
    			attr_dev(div3, "class", "ml-4");
    			add_location(div3, file$2, 58, 20, 3838);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50");
    			add_location(a1, file$2, 51, 18, 3002);
    			attr_dev(path3, "stroke-linecap", "round");
    			attr_dev(path3, "stroke-linejoin", "round");
    			attr_dev(path3, "stroke-width", "2");
    			attr_dev(path3, "d", "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z");
    			add_location(path3, file$2, 72, 24, 4722);
    			attr_dev(svg3, "class", "h-6 w-6");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "aria-hidden", "true");
    			add_location(svg3, file$2, 71, 22, 4568);
    			attr_dev(div4, "class", "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white sm:h-12 sm:w-12");
    			add_location(div4, file$2, 69, 20, 4325);
    			attr_dev(p2, "class", "text-base font-medium text-gray-900");
    			add_location(p2, file$2, 76, 22, 5008);
    			attr_dev(p3, "class", "mt-1 text-sm text-gray-500");
    			add_location(p3, file$2, 79, 22, 5139);
    			attr_dev(div5, "class", "ml-4");
    			add_location(div5, file$2, 75, 20, 4967);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50");
    			add_location(a2, file$2, 68, 18, 4230);
    			attr_dev(path4, "stroke-linecap", "round");
    			attr_dev(path4, "stroke-linejoin", "round");
    			attr_dev(path4, "stroke-width", "2");
    			attr_dev(path4, "d", "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z");
    			add_location(path4, file$2, 89, 24, 5849);
    			attr_dev(svg4, "class", "h-6 w-6");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "fill", "none");
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			attr_dev(svg4, "stroke", "currentColor");
    			attr_dev(svg4, "aria-hidden", "true");
    			add_location(svg4, file$2, 88, 22, 5695);
    			attr_dev(div6, "class", "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white sm:h-12 sm:w-12");
    			add_location(div6, file$2, 86, 20, 5452);
    			attr_dev(p4, "class", "text-base font-medium text-gray-900");
    			add_location(p4, file$2, 93, 22, 6201);
    			attr_dev(p5, "class", "mt-1 text-sm text-gray-500");
    			add_location(p5, file$2, 96, 22, 6332);
    			attr_dev(div7, "class", "ml-4");
    			add_location(div7, file$2, 92, 20, 6160);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50");
    			add_location(a3, file$2, 85, 18, 5357);
    			attr_dev(path5, "stroke-linecap", "round");
    			attr_dev(path5, "stroke-linejoin", "round");
    			attr_dev(path5, "stroke-width", "2");
    			attr_dev(path5, "d", "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path5, file$2, 106, 24, 7044);
    			attr_dev(svg5, "class", "h-6 w-6");
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "stroke", "currentColor");
    			attr_dev(svg5, "aria-hidden", "true");
    			add_location(svg5, file$2, 105, 22, 6890);
    			attr_dev(div8, "class", "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white sm:h-12 sm:w-12");
    			add_location(div8, file$2, 103, 20, 6637);
    			attr_dev(p6, "class", "text-base font-medium text-gray-900");
    			add_location(p6, file$2, 110, 22, 7392);
    			attr_dev(p7, "class", "mt-1 text-sm text-gray-500");
    			add_location(p7, file$2, 113, 22, 7528);
    			attr_dev(div9, "class", "ml-4");
    			add_location(div9, file$2, 109, 20, 7351);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50");
    			add_location(a4, file$2, 102, 18, 6542);
    			attr_dev(div10, "class", "relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-2");
    			add_location(div10, file$2, 50, 16, 2900);
    			attr_dev(div11, "class", "rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden");
    			add_location(div11, file$2, 49, 14, 2800);
    			attr_dev(div12, "class", "absolute z-10 -ml-4 mt-3 transform w-screen max-w-md lg:max-w-2xl lg:ml-0 lg:left-1/2 lg:-translate-x-1/2");
    			add_location(div12, file$2, 48, 12, 2666);
    			attr_dev(div13, "class", "relative");
    			add_location(div13, file$2, 24, 10, 1279);
    			attr_dev(a5, "href", "#");
    			attr_dev(a5, "class", "text-base font-medium text-gray-500 hover:text-gray-900");
    			add_location(a5, file$2, 123, 10, 7822);
    			attr_dev(a6, "href", "#");
    			attr_dev(a6, "class", "text-base font-medium text-gray-500 hover:text-gray-900");
    			add_location(a6, file$2, 126, 10, 7944);
    			attr_dev(a7, "href", "#");
    			attr_dev(a7, "class", "text-base font-medium text-gray-500 hover:text-gray-900");
    			add_location(a7, file$2, 129, 10, 8067);
    			attr_dev(nav0, "class", "hidden md:flex space-x-10");
    			add_location(nav0, file$2, 23, 8, 1229);
    			attr_dev(a8, "href", "#");
    			attr_dev(a8, "class", "whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900");
    			add_location(a8, file$2, 134, 10, 8283);
    			attr_dev(a9, "href", "#");
    			attr_dev(a9, "class", "ml-8 whitespace-nowrap inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:from-purple-700 hover:to-indigo-700");
    			add_location(a9, file$2, 137, 10, 8423);
    			attr_dev(div14, "class", "hidden md:flex items-center justify-end md:flex-1 lg:w-0");
    			add_location(div14, file$2, 133, 8, 8202);
    			attr_dev(div15, "class", "flex justify-between items-center max-w-7xl mx-auto px-4 py-6 sm:px-6 md:justify-start md:space-x-10 lg:px-8");
    			add_location(div15, file$2, 7, 6, 98);
    			attr_dev(img1, "class", "h-8 w-auto");
    			if (!src_url_equal(img1.src, img1_src_value = "https://tailwindui.com/img/logos/workflow-mark-purple-600-to-indigo-600.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Workflow");
    			add_location(img1, file$2, 158, 16, 9428);
    			add_location(div16, file$2, 157, 14, 9406);
    			attr_dev(span3, "class", "sr-only");
    			add_location(span3, file$2, 162, 18, 9857);
    			attr_dev(path6, "stroke-linecap", "round");
    			attr_dev(path6, "stroke-linejoin", "round");
    			attr_dev(path6, "stroke-width", "2");
    			attr_dev(path6, "d", "M6 18L18 6M6 6l12 12");
    			add_location(path6, file$2, 165, 20, 10117);
    			attr_dev(svg6, "class", "h-6 w-6");
    			attr_dev(svg6, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg6, "fill", "none");
    			attr_dev(svg6, "viewBox", "0 0 24 24");
    			attr_dev(svg6, "stroke", "currentColor");
    			attr_dev(svg6, "aria-hidden", "true");
    			add_location(svg6, file$2, 164, 18, 9967);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500");
    			add_location(button2, file$2, 161, 16, 9621);
    			attr_dev(div17, "class", "-mr-2");
    			add_location(div17, file$2, 160, 14, 9585);
    			attr_dev(div18, "class", "flex items-center justify-between");
    			add_location(div18, file$2, 156, 12, 9344);
    			attr_dev(path7, "stroke-linecap", "round");
    			attr_dev(path7, "stroke-linejoin", "round");
    			attr_dev(path7, "stroke-width", "2");
    			attr_dev(path7, "d", "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4");
    			add_location(path7, file$2, 176, 22, 10868);
    			attr_dev(svg7, "class", "h-6 w-6");
    			attr_dev(svg7, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg7, "fill", "none");
    			attr_dev(svg7, "viewBox", "0 0 24 24");
    			attr_dev(svg7, "stroke", "currentColor");
    			attr_dev(svg7, "aria-hidden", "true");
    			add_location(svg7, file$2, 175, 20, 10716);
    			attr_dev(div19, "class", "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white");
    			add_location(div19, file$2, 173, 18, 10498);
    			attr_dev(div20, "class", "ml-4 text-base font-medium text-gray-900");
    			add_location(div20, file$2, 179, 18, 11211);
    			attr_dev(a10, "href", "#");
    			attr_dev(a10, "class", "-m-3 p-3 flex items-center rounded-lg hover:bg-gray-50");
    			add_location(a10, file$2, 172, 16, 10404);
    			attr_dev(path8, "stroke-linecap", "round");
    			attr_dev(path8, "stroke-linejoin", "round");
    			attr_dev(path8, "stroke-width", "2");
    			attr_dev(path8, "d", "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z");
    			add_location(path8, file$2, 188, 22, 11824);
    			attr_dev(svg8, "class", "h-6 w-6");
    			attr_dev(svg8, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg8, "fill", "none");
    			attr_dev(svg8, "viewBox", "0 0 24 24");
    			attr_dev(svg8, "stroke", "currentColor");
    			attr_dev(svg8, "aria-hidden", "true");
    			add_location(svg8, file$2, 187, 20, 11672);
    			attr_dev(div21, "class", "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white");
    			add_location(div21, file$2, 185, 18, 11449);
    			attr_dev(div22, "class", "ml-4 text-base font-medium text-gray-900");
    			add_location(div22, file$2, 191, 18, 12063);
    			attr_dev(a11, "href", "#");
    			attr_dev(a11, "class", "-m-3 p-3 flex items-center rounded-lg hover:bg-gray-50");
    			add_location(a11, file$2, 184, 16, 11355);
    			attr_dev(path9, "stroke-linecap", "round");
    			attr_dev(path9, "stroke-linejoin", "round");
    			attr_dev(path9, "stroke-width", "2");
    			attr_dev(path9, "d", "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z");
    			add_location(path9, file$2, 200, 22, 12680);
    			attr_dev(svg9, "class", "h-6 w-6");
    			attr_dev(svg9, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg9, "fill", "none");
    			attr_dev(svg9, "viewBox", "0 0 24 24");
    			attr_dev(svg9, "stroke", "currentColor");
    			attr_dev(svg9, "aria-hidden", "true");
    			add_location(svg9, file$2, 199, 20, 12528);
    			attr_dev(div23, "class", "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white");
    			add_location(div23, file$2, 197, 18, 12305);
    			attr_dev(div24, "class", "ml-4 text-base font-medium text-gray-900");
    			add_location(div24, file$2, 203, 18, 12985);
    			attr_dev(a12, "href", "#");
    			attr_dev(a12, "class", "-m-3 p-3 flex items-center rounded-lg hover:bg-gray-50");
    			add_location(a12, file$2, 196, 16, 12211);
    			attr_dev(path10, "stroke-linecap", "round");
    			attr_dev(path10, "stroke-linejoin", "round");
    			attr_dev(path10, "stroke-width", "2");
    			attr_dev(path10, "d", "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path10, file$2, 212, 22, 13612);
    			attr_dev(svg10, "class", "h-6 w-6");
    			attr_dev(svg10, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg10, "fill", "none");
    			attr_dev(svg10, "viewBox", "0 0 24 24");
    			attr_dev(svg10, "stroke", "currentColor");
    			attr_dev(svg10, "aria-hidden", "true");
    			add_location(svg10, file$2, 211, 20, 13460);
    			attr_dev(div25, "class", "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white");
    			add_location(div25, file$2, 209, 18, 13227);
    			attr_dev(div26, "class", "ml-4 text-base font-medium text-gray-900");
    			add_location(div26, file$2, 215, 18, 13913);
    			attr_dev(a13, "href", "#");
    			attr_dev(a13, "class", "-m-3 p-3 flex items-center rounded-lg hover:bg-gray-50");
    			add_location(a13, file$2, 208, 16, 13133);
    			attr_dev(nav1, "class", "grid grid-cols-1 gap-7");
    			add_location(nav1, file$2, 171, 14, 10351);
    			attr_dev(div27, "class", "mt-6");
    			add_location(div27, file$2, 170, 12, 10318);
    			attr_dev(div28, "class", "pt-5 pb-6 px-5");
    			add_location(div28, file$2, 155, 10, 9303);
    			attr_dev(a14, "href", "#");
    			attr_dev(a14, "class", "text-base font-medium text-gray-900 hover:text-gray-700");
    			add_location(a14, file$2, 224, 14, 14203);
    			attr_dev(a15, "href", "#");
    			attr_dev(a15, "class", "text-base font-medium text-gray-900 hover:text-gray-700");
    			add_location(a15, file$2, 227, 14, 14337);
    			attr_dev(a16, "href", "#");
    			attr_dev(a16, "class", "text-base font-medium text-gray-900 hover:text-gray-700");
    			add_location(a16, file$2, 230, 14, 14472);
    			attr_dev(div29, "class", "grid grid-cols-2 gap-4");
    			add_location(div29, file$2, 223, 12, 14152);
    			attr_dev(a17, "href", "#");
    			attr_dev(a17, "class", "w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:from-purple-700 hover:to-indigo-700");
    			add_location(a17, file$2, 235, 14, 14656);
    			attr_dev(a18, "href", "#");
    			attr_dev(a18, "class", "text-gray-900");
    			add_location(a18, file$2, 240, 16, 15086);
    			attr_dev(p8, "class", "mt-6 text-center text-base font-medium text-gray-500");
    			add_location(p8, file$2, 238, 14, 14970);
    			attr_dev(div30, "class", "mt-6");
    			add_location(div30, file$2, 234, 12, 14623);
    			attr_dev(div31, "class", "py-6 px-5");
    			add_location(div31, file$2, 222, 10, 14116);
    			attr_dev(div32, "class", "rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50");
    			add_location(div32, file$2, 154, 8, 9190);
    			attr_dev(div33, "class", "absolute z-30 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden");
    			add_location(div33, file$2, 153, 6, 9086);
    			attr_dev(div34, "class", "relative bg-white");
    			add_location(div34, file$2, 6, 4, 60);
    			add_location(header, file$2, 5, 2, 47);
    			attr_dev(div35, "class", "absolute inset-x-0 bottom-0 h-1/2 bg-gray-100");
    			add_location(div35, file$2, 254, 6, 15343);
    			attr_dev(img2, "class", "h-full w-full object-cover");
    			if (!src_url_equal(img2.src, img2_src_value = "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "People working on laptops");
    			add_location(img2, file$2, 258, 12, 15591);
    			attr_dev(div36, "class", "absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-700 mix-blend-multiply");
    			add_location(div36, file$2, 259, 12, 15852);
    			attr_dev(div37, "class", "absolute inset-0");
    			add_location(div37, file$2, 257, 10, 15548);
    			attr_dev(span4, "class", "block text-white");
    			add_location(span4, file$2, 263, 14, 16164);
    			attr_dev(span5, "class", "block text-indigo-200");
    			add_location(span5, file$2, 264, 14, 16237);
    			attr_dev(h1, "class", "text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl");
    			add_location(h1, file$2, 262, 12, 16062);
    			attr_dev(p9, "class", "mt-6 max-w-lg mx-auto text-center text-xl text-indigo-200 sm:max-w-3xl");
    			add_location(p9, file$2, 266, 12, 16327);
    			attr_dev(a19, "href", "#");
    			attr_dev(a19, "class", "flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 sm:px-8");
    			add_location(a19, file$2, 271, 16, 16790);
    			attr_dev(a20, "href", "#");
    			attr_dev(a20, "class", "flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8");
    			add_location(a20, file$2, 274, 16, 17042);
    			attr_dev(div38, "class", "space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5");
    			add_location(div38, file$2, 270, 14, 16687);
    			attr_dev(div39, "class", "mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center");
    			add_location(div39, file$2, 269, 12, 16596);
    			attr_dev(div40, "class", "relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8");
    			add_location(div40, file$2, 261, 10, 15982);
    			attr_dev(div41, "class", "relative shadow-xl sm:rounded-2xl sm:overflow-hidden");
    			add_location(div41, file$2, 256, 8, 15471);
    			attr_dev(div42, "class", "max-w-7xl mx-auto sm:px-6 lg:px-8");
    			add_location(div42, file$2, 255, 6, 15415);
    			attr_dev(div43, "class", "relative");
    			add_location(div43, file$2, 253, 4, 15314);
    			attr_dev(p10, "class", "text-center text-sm font-semibold uppercase text-gray-500 tracking-wide");
    			add_location(p10, file$2, 287, 8, 17515);
    			attr_dev(img3, "class", "h-12");
    			if (!src_url_equal(img3.src, img3_src_value = "https://tailwindui.com/img/logos/tuple-logo-gray-400.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Tuple");
    			add_location(img3, file$2, 292, 12, 17845);
    			attr_dev(div44, "class", "col-span-1 flex justify-center md:col-span-2 lg:col-span-1");
    			add_location(div44, file$2, 291, 10, 17760);
    			attr_dev(img4, "class", "h-12");
    			if (!src_url_equal(img4.src, img4_src_value = "https://tailwindui.com/img/logos/mirage-logo-gray-400.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Mirage");
    			add_location(img4, file$2, 295, 12, 18051);
    			attr_dev(div45, "class", "col-span-1 flex justify-center md:col-span-2 lg:col-span-1");
    			add_location(div45, file$2, 294, 10, 17966);
    			attr_dev(img5, "class", "h-12");
    			if (!src_url_equal(img5.src, img5_src_value = "https://tailwindui.com/img/logos/statickit-logo-gray-400.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "StaticKit");
    			add_location(img5, file$2, 298, 12, 18259);
    			attr_dev(div46, "class", "col-span-1 flex justify-center md:col-span-2 lg:col-span-1");
    			add_location(div46, file$2, 297, 10, 18174);
    			attr_dev(img6, "class", "h-12");
    			if (!src_url_equal(img6.src, img6_src_value = "https://tailwindui.com/img/logos/transistor-logo-gray-400.svg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Transistor");
    			add_location(img6, file$2, 301, 12, 18488);
    			attr_dev(div47, "class", "col-span-1 flex justify-center md:col-span-2 md:col-start-2 lg:col-span-1");
    			add_location(div47, file$2, 300, 10, 18388);
    			attr_dev(img7, "class", "h-12");
    			if (!src_url_equal(img7.src, img7_src_value = "https://tailwindui.com/img/logos/workcation-logo-gray-400.svg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Workcation");
    			add_location(img7, file$2, 304, 12, 18719);
    			attr_dev(div48, "class", "col-span-2 flex justify-center md:col-span-2 md:col-start-4 lg:col-span-1");
    			add_location(div48, file$2, 303, 10, 18619);
    			attr_dev(div49, "class", "mt-6 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5");
    			add_location(div49, file$2, 290, 8, 17678);
    			attr_dev(div50, "class", "max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8");
    			add_location(div50, file$2, 286, 6, 17448);
    			attr_dev(div51, "class", "bg-gray-100");
    			add_location(div51, file$2, 285, 4, 17416);
    			attr_dev(div52, "aria-hidden", "true");
    			attr_dev(div52, "class", "absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-gray-100");
    			add_location(div52, file$2, 312, 6, 18983);
    			attr_dev(path11, "stroke-linecap", "round");
    			attr_dev(path11, "stroke-linejoin", "round");
    			attr_dev(path11, "stroke-width", "2");
    			attr_dev(path11, "d", "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4");
    			add_location(path11, file$2, 321, 20, 19720);
    			attr_dev(svg11, "class", "h-6 w-6 text-white");
    			attr_dev(svg11, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg11, "fill", "none");
    			attr_dev(svg11, "viewBox", "0 0 24 24");
    			attr_dev(svg11, "stroke", "currentColor");
    			attr_dev(svg11, "aria-hidden", "true");
    			add_location(svg11, file$2, 320, 18, 19559);
    			attr_dev(span6, "class", "h-12 w-12 rounded-md flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600");
    			add_location(span6, file$2, 318, 16, 19369);
    			add_location(div53, file$2, 317, 14, 19347);
    			attr_dev(h20, "class", "text-3xl font-extrabold tracking-tight text-gray-900");
    			add_location(h20, file$2, 326, 16, 20112);
    			attr_dev(p11, "class", "mt-4 text-lg text-gray-500");
    			add_location(p11, file$2, 329, 16, 20266);
    			attr_dev(a21, "href", "#");
    			attr_dev(a21, "class", "inline-flex bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white hover:from-purple-700 hover:to-indigo-700");
    			add_location(a21, file$2, 333, 18, 20632);
    			attr_dev(div54, "class", "mt-6");
    			add_location(div54, file$2, 332, 16, 20595);
    			attr_dev(div55, "class", "mt-6");
    			add_location(div55, file$2, 325, 14, 20077);
    			add_location(div56, file$2, 316, 12, 19327);
    			attr_dev(p12, "class", "text-base text-gray-500");
    			add_location(p12, file$2, 342, 18, 21107);
    			add_location(div57, file$2, 341, 16, 21083);
    			attr_dev(img8, "class", "h-6 w-6 rounded-full");
    			if (!src_url_equal(img8.src, img8_src_value = "https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$2, 349, 22, 21525);
    			attr_dev(div58, "class", "flex-shrink-0");
    			add_location(div58, file$2, 348, 20, 21475);
    			attr_dev(div59, "class", "text-base font-medium text-gray-700");
    			add_location(div59, file$2, 351, 20, 21766);
    			attr_dev(div60, "class", "flex items-center space-x-3");
    			add_location(div60, file$2, 347, 18, 21413);
    			attr_dev(footer0, "class", "mt-3");
    			add_location(footer0, file$2, 346, 16, 21373);
    			add_location(blockquote, file$2, 340, 14, 21054);
    			attr_dev(div61, "class", "mt-8 border-t border-gray-200 pt-6");
    			add_location(div61, file$2, 339, 12, 20991);
    			attr_dev(div62, "class", "px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0");
    			add_location(div62, file$2, 315, 10, 19232);
    			attr_dev(img9, "class", "w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none");
    			if (!src_url_equal(img9.src, img9_src_value = "https://tailwindui.com/img/component-images/inbox-app-screenshot-1.jpg")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "Inbox user interface");
    			add_location(img9, file$2, 361, 14, 22173);
    			attr_dev(div63, "class", "pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full");
    			add_location(div63, file$2, 360, 12, 22078);
    			attr_dev(div64, "class", "mt-12 sm:mt-16 lg:mt-0");
    			add_location(div64, file$2, 359, 10, 22029);
    			attr_dev(div65, "class", "lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24");
    			add_location(div65, file$2, 314, 8, 19120);
    			attr_dev(div66, "class", "relative");
    			add_location(div66, file$2, 313, 6, 19089);
    			attr_dev(path12, "stroke-linecap", "round");
    			attr_dev(path12, "stroke-linejoin", "round");
    			attr_dev(path12, "stroke-width", "2");
    			attr_dev(path12, "d", "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z");
    			add_location(path12, file$2, 374, 20, 23124);
    			attr_dev(svg12, "class", "h-6 w-6 text-white");
    			attr_dev(svg12, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg12, "fill", "none");
    			attr_dev(svg12, "viewBox", "0 0 24 24");
    			attr_dev(svg12, "stroke", "currentColor");
    			attr_dev(svg12, "aria-hidden", "true");
    			add_location(svg12, file$2, 373, 18, 22963);
    			attr_dev(span7, "class", "h-12 w-12 rounded-md flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600");
    			add_location(span7, file$2, 371, 16, 22770);
    			add_location(div67, file$2, 370, 14, 22748);
    			attr_dev(h21, "class", "text-3xl font-extrabold tracking-tight text-gray-900");
    			add_location(h21, file$2, 379, 16, 23425);
    			attr_dev(p13, "class", "mt-4 text-lg text-gray-500");
    			add_location(p13, file$2, 382, 16, 23580);
    			attr_dev(a22, "href", "#");
    			attr_dev(a22, "class", "inline-flex bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white hover:from-purple-700 hover:to-indigo-700");
    			add_location(a22, file$2, 386, 18, 23946);
    			attr_dev(div68, "class", "mt-6");
    			add_location(div68, file$2, 385, 16, 23909);
    			attr_dev(div69, "class", "mt-6");
    			add_location(div69, file$2, 378, 14, 23390);
    			add_location(div70, file$2, 369, 12, 22728);
    			attr_dev(div71, "class", "px-4 max-w-xl mx-auto sm:px-6 lg:py-32 lg:max-w-none lg:mx-0 lg:px-0 lg:col-start-2");
    			add_location(div71, file$2, 368, 10, 22618);
    			attr_dev(img10, "class", "w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none");
    			if (!src_url_equal(img10.src, img10_src_value = "https://tailwindui.com/img/component-images/inbox-app-screenshot-2.jpg")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Customer profile user interface");
    			add_location(img10, file$2, 395, 14, 24479);
    			attr_dev(div72, "class", "pr-4 -ml-48 sm:pr-6 md:-ml-16 lg:px-0 lg:m-0 lg:relative lg:h-full");
    			add_location(div72, file$2, 394, 12, 24384);
    			attr_dev(div73, "class", "mt-12 sm:mt-16 lg:mt-0 lg:col-start-1");
    			add_location(div73, file$2, 393, 10, 24320);
    			attr_dev(div74, "class", "lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24");
    			add_location(div74, file$2, 367, 8, 22506);
    			attr_dev(div75, "class", "mt-24");
    			add_location(div75, file$2, 366, 6, 22478);
    			attr_dev(div76, "class", "relative pt-16 pb-32 overflow-hidden");
    			add_location(div76, file$2, 311, 4, 18926);
    			attr_dev(h22, "class", "text-3xl font-extrabold text-white tracking-tight");
    			add_location(h22, file$2, 405, 8, 25018);
    			attr_dev(p14, "class", "mt-4 max-w-3xl text-lg text-purple-200");
    			add_location(p14, file$2, 408, 8, 25148);
    			attr_dev(path13, "stroke-linecap", "round");
    			attr_dev(path13, "stroke-linejoin", "round");
    			attr_dev(path13, "stroke-width", "2");
    			attr_dev(path13, "d", "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4");
    			add_location(path13, file$2, 417, 18, 25851);
    			attr_dev(svg13, "class", "h-6 w-6 text-white");
    			attr_dev(svg13, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg13, "fill", "none");
    			attr_dev(svg13, "viewBox", "0 0 24 24");
    			attr_dev(svg13, "stroke", "currentColor");
    			attr_dev(svg13, "aria-hidden", "true");
    			add_location(svg13, file$2, 416, 16, 25692);
    			attr_dev(span8, "class", "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10");
    			add_location(span8, file$2, 414, 14, 25530);
    			add_location(div77, file$2, 413, 12, 25510);
    			attr_dev(h30, "class", "text-lg font-medium text-white");
    			add_location(h30, file$2, 422, 14, 26233);
    			attr_dev(p15, "class", "mt-2 text-base text-purple-200");
    			add_location(p15, file$2, 423, 14, 26313);
    			attr_dev(div78, "class", "mt-6");
    			add_location(div78, file$2, 421, 12, 26200);
    			add_location(div79, file$2, 412, 10, 25492);
    			attr_dev(path14, "stroke-linecap", "round");
    			attr_dev(path14, "stroke-linejoin", "round");
    			attr_dev(path14, "stroke-width", "2");
    			attr_dev(path14, "d", "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z");
    			add_location(path14, file$2, 434, 18, 26889);
    			attr_dev(svg14, "class", "h-6 w-6 text-white");
    			attr_dev(svg14, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg14, "fill", "none");
    			attr_dev(svg14, "viewBox", "0 0 24 24");
    			attr_dev(svg14, "stroke", "currentColor");
    			attr_dev(svg14, "aria-hidden", "true");
    			add_location(svg14, file$2, 433, 16, 26730);
    			attr_dev(span9, "class", "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10");
    			add_location(span9, file$2, 431, 14, 26568);
    			add_location(div80, file$2, 430, 12, 26548);
    			attr_dev(h31, "class", "text-lg font-medium text-white");
    			add_location(h31, file$2, 439, 14, 27185);
    			attr_dev(p16, "class", "mt-2 text-base text-purple-200");
    			add_location(p16, file$2, 440, 14, 27267);
    			attr_dev(div81, "class", "mt-6");
    			add_location(div81, file$2, 438, 12, 27152);
    			add_location(div82, file$2, 429, 10, 26530);
    			attr_dev(path15, "stroke-linecap", "round");
    			attr_dev(path15, "stroke-linejoin", "round");
    			attr_dev(path15, "stroke-width", "2");
    			attr_dev(path15, "d", "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16");
    			add_location(path15, file$2, 451, 18, 27843);
    			attr_dev(svg15, "class", "h-6 w-6 text-white");
    			attr_dev(svg15, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg15, "fill", "none");
    			attr_dev(svg15, "viewBox", "0 0 24 24");
    			attr_dev(svg15, "stroke", "currentColor");
    			attr_dev(svg15, "aria-hidden", "true");
    			add_location(svg15, file$2, 450, 16, 27684);
    			attr_dev(span10, "class", "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10");
    			add_location(span10, file$2, 448, 14, 27522);
    			add_location(div83, file$2, 447, 12, 27502);
    			attr_dev(h32, "class", "text-lg font-medium text-white");
    			add_location(h32, file$2, 456, 14, 28154);
    			attr_dev(p17, "class", "mt-2 text-base text-purple-200");
    			add_location(p17, file$2, 457, 14, 28228);
    			attr_dev(div84, "class", "mt-6");
    			add_location(div84, file$2, 455, 12, 28121);
    			add_location(div85, file$2, 446, 10, 27484);
    			attr_dev(path16, "stroke-linecap", "round");
    			attr_dev(path16, "stroke-linejoin", "round");
    			attr_dev(path16, "stroke-width", "2");
    			attr_dev(path16, "d", "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z");
    			add_location(path16, file$2, 468, 18, 28809);
    			attr_dev(svg16, "class", "h-6 w-6 text-white");
    			attr_dev(svg16, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg16, "fill", "none");
    			attr_dev(svg16, "viewBox", "0 0 24 24");
    			attr_dev(svg16, "stroke", "currentColor");
    			attr_dev(svg16, "aria-hidden", "true");
    			add_location(svg16, file$2, 467, 16, 28650);
    			attr_dev(span11, "class", "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10");
    			add_location(span11, file$2, 465, 14, 28483);
    			add_location(div86, file$2, 464, 12, 28463);
    			attr_dev(h33, "class", "text-lg font-medium text-white");
    			add_location(h33, file$2, 473, 14, 29114);
    			attr_dev(p18, "class", "mt-2 text-base text-purple-200");
    			add_location(p18, file$2, 474, 14, 29196);
    			attr_dev(div87, "class", "mt-6");
    			add_location(div87, file$2, 472, 12, 29081);
    			add_location(div88, file$2, 463, 10, 28445);
    			attr_dev(path17, "stroke-linecap", "round");
    			attr_dev(path17, "stroke-linejoin", "round");
    			attr_dev(path17, "stroke-width", "2");
    			attr_dev(path17, "d", "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z");
    			add_location(path17, file$2, 485, 18, 29782);
    			attr_dev(svg17, "class", "h-6 w-6 text-white");
    			attr_dev(svg17, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg17, "fill", "none");
    			attr_dev(svg17, "viewBox", "0 0 24 24");
    			attr_dev(svg17, "stroke", "currentColor");
    			attr_dev(svg17, "aria-hidden", "true");
    			add_location(svg17, file$2, 484, 16, 29623);
    			attr_dev(span12, "class", "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10");
    			add_location(span12, file$2, 482, 14, 29451);
    			add_location(div89, file$2, 481, 12, 29431);
    			attr_dev(h34, "class", "text-lg font-medium text-white");
    			add_location(h34, file$2, 490, 14, 30094);
    			attr_dev(p19, "class", "mt-2 text-base text-purple-200");
    			add_location(p19, file$2, 491, 14, 30171);
    			attr_dev(div90, "class", "mt-6");
    			add_location(div90, file$2, 489, 12, 30061);
    			add_location(div91, file$2, 480, 10, 29413);
    			attr_dev(path18, "stroke-linecap", "round");
    			attr_dev(path18, "stroke-linejoin", "round");
    			attr_dev(path18, "stroke-width", "2");
    			attr_dev(path18, "d", "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6");
    			add_location(path18, file$2, 502, 18, 30747);
    			attr_dev(svg18, "class", "h-6 w-6 text-white");
    			attr_dev(svg18, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg18, "fill", "none");
    			attr_dev(svg18, "viewBox", "0 0 24 24");
    			attr_dev(svg18, "stroke", "currentColor");
    			attr_dev(svg18, "aria-hidden", "true");
    			add_location(svg18, file$2, 501, 16, 30588);
    			attr_dev(span13, "class", "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10");
    			add_location(span13, file$2, 499, 14, 30426);
    			add_location(div92, file$2, 498, 12, 30406);
    			attr_dev(h35, "class", "text-lg font-medium text-white");
    			add_location(h35, file$2, 507, 14, 30974);
    			attr_dev(p20, "class", "mt-2 text-base text-purple-200");
    			add_location(p20, file$2, 508, 14, 31050);
    			attr_dev(div93, "class", "mt-6");
    			add_location(div93, file$2, 506, 12, 30941);
    			add_location(div94, file$2, 497, 10, 30388);
    			attr_dev(path19, "stroke-linecap", "round");
    			attr_dev(path19, "stroke-linejoin", "round");
    			attr_dev(path19, "stroke-width", "2");
    			attr_dev(path19, "d", "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z");
    			add_location(path19, file$2, 519, 18, 31629);
    			attr_dev(svg19, "class", "h-6 w-6 text-white");
    			attr_dev(svg19, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg19, "fill", "none");
    			attr_dev(svg19, "viewBox", "0 0 24 24");
    			attr_dev(svg19, "stroke", "currentColor");
    			attr_dev(svg19, "aria-hidden", "true");
    			add_location(svg19, file$2, 518, 16, 31470);
    			attr_dev(span14, "class", "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10");
    			add_location(span14, file$2, 516, 14, 31305);
    			add_location(div95, file$2, 515, 12, 31285);
    			attr_dev(h36, "class", "text-lg font-medium text-white");
    			add_location(h36, file$2, 524, 14, 31921);
    			attr_dev(p21, "class", "mt-2 text-base text-purple-200");
    			add_location(p21, file$2, 525, 14, 32000);
    			attr_dev(div96, "class", "mt-6");
    			add_location(div96, file$2, 523, 12, 31888);
    			add_location(div97, file$2, 514, 10, 31267);
    			attr_dev(path20, "stroke-linecap", "round");
    			attr_dev(path20, "stroke-linejoin", "round");
    			attr_dev(path20, "stroke-width", "2");
    			attr_dev(path20, "d", "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z");
    			add_location(path20, file$2, 536, 18, 32576);
    			attr_dev(svg20, "class", "h-6 w-6 text-white");
    			attr_dev(svg20, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg20, "fill", "none");
    			attr_dev(svg20, "viewBox", "0 0 24 24");
    			attr_dev(svg20, "stroke", "currentColor");
    			attr_dev(svg20, "aria-hidden", "true");
    			add_location(svg20, file$2, 535, 16, 32417);
    			attr_dev(span15, "class", "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10");
    			add_location(span15, file$2, 533, 14, 32255);
    			add_location(div98, file$2, 532, 12, 32235);
    			attr_dev(h37, "class", "text-lg font-medium text-white");
    			add_location(h37, file$2, 541, 14, 32886);
    			attr_dev(p22, "class", "mt-2 text-base text-purple-200");
    			add_location(p22, file$2, 542, 14, 32971);
    			attr_dev(div99, "class", "mt-6");
    			add_location(div99, file$2, 540, 12, 32853);
    			add_location(div100, file$2, 531, 10, 32217);
    			attr_dev(div101, "class", "mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16");
    			add_location(div101, file$2, 411, 8, 25366);
    			attr_dev(div102, "class", "max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:pt-20 sm:pb-24 lg:max-w-7xl lg:pt-24 lg:px-8");
    			add_location(div102, file$2, 404, 6, 24911);
    			attr_dev(div103, "class", "bg-gradient-to-r from-purple-800 to-indigo-700");
    			add_location(div103, file$2, 403, 4, 24844);
    			attr_dev(img11, "class", "h-full w-full object-cover opacity-25 xl:absolute xl:inset-0");
    			if (!src_url_equal(img11.src, img11_src_value = "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "People working on laptops");
    			add_location(img11, file$2, 556, 12, 33484);
    			attr_dev(div104, "aria-hidden", "true");
    			attr_dev(div104, "class", "absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-900 xl:inset-y-0 xl:left-0 xl:h-full xl:w-32 xl:bg-gradient-to-r");
    			add_location(div104, file$2, 557, 12, 33779);
    			attr_dev(div105, "class", "h-full xl:relative xl:col-start-2");
    			add_location(div105, file$2, 555, 10, 33424);
    			attr_dev(div106, "class", "h-full w-full xl:grid xl:grid-cols-2");
    			add_location(div106, file$2, 554, 8, 33363);
    			attr_dev(div107, "class", "h-80 absolute inset-x-0 bottom-0 xl:top-0 xl:h-full");
    			add_location(div107, file$2, 553, 6, 33289);
    			attr_dev(span16, "class", "bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent");
    			add_location(span16, file$2, 564, 12, 34280);
    			attr_dev(h23, "class", "text-sm font-semibold tracking-wide uppercase");
    			add_location(h23, file$2, 563, 10, 34209);
    			attr_dev(p23, "class", "mt-3 text-3xl font-extrabold text-white");
    			add_location(p23, file$2, 566, 10, 34421);
    			attr_dev(p24, "class", "mt-5 text-lg text-gray-300");
    			add_location(p24, file$2, 567, 10, 34540);
    			attr_dev(span17, "class", "block text-2xl font-bold text-white");
    			add_location(span17, file$2, 570, 14, 34961);
    			attr_dev(span18, "class", "font-medium text-white");
    			add_location(span18, file$2, 571, 63, 35085);
    			attr_dev(span19, "class", "mt-1 block text-base text-gray-300");
    			add_location(span19, file$2, 571, 14, 35036);
    			add_location(p25, file$2, 569, 12, 34943);
    			attr_dev(span20, "class", "block text-2xl font-bold text-white");
    			add_location(span20, file$2, 575, 14, 35236);
    			attr_dev(span21, "class", "font-medium text-white");
    			add_location(span21, file$2, 576, 63, 35361);
    			attr_dev(span22, "class", "mt-1 block text-base text-gray-300");
    			add_location(span22, file$2, 576, 14, 35312);
    			add_location(p26, file$2, 574, 12, 35218);
    			attr_dev(span23, "class", "block text-2xl font-bold text-white");
    			add_location(span23, file$2, 580, 14, 35512);
    			attr_dev(span24, "class", "font-medium text-white");
    			add_location(span24, file$2, 581, 63, 35636);
    			attr_dev(span25, "class", "mt-1 block text-base text-gray-300");
    			add_location(span25, file$2, 581, 14, 35587);
    			add_location(p27, file$2, 579, 12, 35494);
    			attr_dev(span26, "class", "block text-2xl font-bold text-white");
    			add_location(span26, file$2, 585, 14, 35795);
    			attr_dev(span27, "class", "font-medium text-white");
    			add_location(span27, file$2, 586, 63, 35920);
    			attr_dev(span28, "class", "mt-1 block text-base text-gray-300");
    			add_location(span28, file$2, 586, 14, 35871);
    			add_location(p28, file$2, 584, 12, 35777);
    			attr_dev(div108, "class", "mt-12 grid grid-cols-1 gap-y-12 gap-x-6 sm:grid-cols-2");
    			add_location(div108, file$2, 568, 10, 34862);
    			attr_dev(div109, "class", "relative pt-12 pb-64 sm:pt-24 sm:pb-64 xl:col-start-1 xl:pb-24");
    			add_location(div109, file$2, 562, 8, 34122);
    			attr_dev(div110, "class", "max-w-4xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8 xl:grid xl:grid-cols-2 xl:grid-flow-col-dense xl:gap-x-8");
    			add_location(div110, file$2, 561, 6, 33991);
    			attr_dev(div111, "class", "relative bg-gray-900");
    			add_location(div111, file$2, 552, 4, 33248);
    			attr_dev(span29, "class", "block");
    			add_location(span29, file$2, 597, 10, 36364);
    			attr_dev(span30, "class", "block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent");
    			add_location(span30, file$2, 598, 10, 36423);
    			attr_dev(h24, "class", "text-4xl font-extrabold tracking-tight text-gray-900 sm:text-4xl");
    			add_location(h24, file$2, 596, 8, 36276);
    			attr_dev(a23, "href", "#");
    			attr_dev(a23, "class", "flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white hover:from-purple-700 hover:to-indigo-700");
    			add_location(a23, file$2, 601, 10, 36657);
    			attr_dev(a24, "href", "#");
    			attr_dev(a24, "class", "flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-800 bg-indigo-50 hover:bg-indigo-100");
    			add_location(a24, file$2, 604, 10, 36955);
    			attr_dev(div112, "class", "mt-6 space-y-4 sm:space-y-0 sm:flex sm:space-x-5");
    			add_location(div112, file$2, 600, 8, 36584);
    			attr_dev(div113, "class", "max-w-4xl mx-auto py-16 px-4 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8 lg:flex lg:items-center lg:justify-between");
    			add_location(div113, file$2, 595, 6, 36144);
    			attr_dev(div114, "class", "bg-white");
    			add_location(div114, file$2, 594, 4, 36115);
    			add_location(main, file$2, 251, 2, 15277);
    			attr_dev(h25, "id", "footer-heading");
    			attr_dev(h25, "class", "sr-only");
    			add_location(h25, file$2, 613, 4, 37293);
    			attr_dev(h38, "class", "text-sm font-semibold text-gray-400 tracking-wider uppercase");
    			add_location(h38, file$2, 619, 14, 37621);
    			attr_dev(a25, "href", "#");
    			attr_dev(a25, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a25, file$2, 624, 18, 37834);
    			add_location(li0, file$2, 623, 16, 37811);
    			attr_dev(a26, "href", "#");
    			attr_dev(a26, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a26, file$2, 630, 18, 38014);
    			add_location(li1, file$2, 629, 16, 37991);
    			attr_dev(a27, "href", "#");
    			attr_dev(a27, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a27, file$2, 636, 18, 38194);
    			add_location(li2, file$2, 635, 16, 38171);
    			attr_dev(a28, "href", "#");
    			attr_dev(a28, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a28, file$2, 642, 18, 38373);
    			add_location(li3, file$2, 641, 16, 38350);
    			attr_dev(ul0, "role", "list");
    			attr_dev(ul0, "class", "mt-4 space-y-4");
    			add_location(ul0, file$2, 622, 14, 37755);
    			add_location(div115, file$2, 618, 12, 37601);
    			attr_dev(h39, "class", "text-sm font-semibold text-gray-400 tracking-wider uppercase");
    			add_location(h39, file$2, 649, 14, 38605);
    			attr_dev(a29, "href", "#");
    			attr_dev(a29, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a29, file$2, 654, 18, 38816);
    			add_location(li4, file$2, 653, 16, 38793);
    			attr_dev(a30, "href", "#");
    			attr_dev(a30, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a30, file$2, 660, 18, 38994);
    			add_location(li5, file$2, 659, 16, 38971);
    			attr_dev(a31, "href", "#");
    			attr_dev(a31, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a31, file$2, 666, 18, 39178);
    			add_location(li6, file$2, 665, 16, 39155);
    			attr_dev(a32, "href", "#");
    			attr_dev(a32, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a32, file$2, 672, 18, 39355);
    			add_location(li7, file$2, 671, 16, 39332);
    			attr_dev(ul1, "role", "list");
    			attr_dev(ul1, "class", "mt-4 space-y-4");
    			add_location(ul1, file$2, 652, 14, 38737);
    			attr_dev(div116, "class", "mt-12 md:mt-0");
    			add_location(div116, file$2, 648, 12, 38563);
    			attr_dev(div117, "class", "md:grid md:grid-cols-2 md:gap-8");
    			add_location(div117, file$2, 617, 10, 37543);
    			attr_dev(h310, "class", "text-sm font-semibold text-gray-400 tracking-wider uppercase");
    			add_location(h310, file$2, 681, 14, 39640);
    			attr_dev(a33, "href", "#");
    			attr_dev(a33, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a33, file$2, 686, 18, 39851);
    			add_location(li8, file$2, 685, 16, 39828);
    			attr_dev(a34, "href", "#");
    			attr_dev(a34, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a34, file$2, 692, 18, 40027);
    			add_location(li9, file$2, 691, 16, 40004);
    			attr_dev(a35, "href", "#");
    			attr_dev(a35, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a35, file$2, 698, 18, 40202);
    			add_location(li10, file$2, 697, 16, 40179);
    			attr_dev(a36, "href", "#");
    			attr_dev(a36, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a36, file$2, 704, 18, 40377);
    			add_location(li11, file$2, 703, 16, 40354);
    			attr_dev(a37, "href", "#");
    			attr_dev(a37, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a37, file$2, 710, 18, 40553);
    			add_location(li12, file$2, 709, 16, 40530);
    			attr_dev(ul2, "role", "list");
    			attr_dev(ul2, "class", "mt-4 space-y-4");
    			add_location(ul2, file$2, 684, 14, 39772);
    			add_location(div118, file$2, 680, 12, 39620);
    			attr_dev(h311, "class", "text-sm font-semibold text-gray-400 tracking-wider uppercase");
    			add_location(h311, file$2, 717, 14, 40785);
    			attr_dev(a38, "href", "#");
    			attr_dev(a38, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a38, file$2, 722, 18, 40994);
    			add_location(li13, file$2, 721, 16, 40971);
    			attr_dev(a39, "href", "#");
    			attr_dev(a39, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a39, file$2, 728, 18, 41170);
    			add_location(li14, file$2, 727, 16, 41147);
    			attr_dev(a40, "href", "#");
    			attr_dev(a40, "class", "text-base text-gray-500 hover:text-gray-900");
    			add_location(a40, file$2, 734, 18, 41348);
    			add_location(li15, file$2, 733, 16, 41325);
    			attr_dev(ul3, "role", "list");
    			attr_dev(ul3, "class", "mt-4 space-y-4");
    			add_location(ul3, file$2, 720, 14, 40915);
    			attr_dev(div119, "class", "mt-12 md:mt-0");
    			add_location(div119, file$2, 716, 12, 40743);
    			attr_dev(div120, "class", "md:grid md:grid-cols-2 md:gap-8");
    			add_location(div120, file$2, 679, 10, 39562);
    			attr_dev(div121, "class", "grid grid-cols-2 gap-8 xl:col-span-2");
    			add_location(div121, file$2, 616, 8, 37482);
    			attr_dev(h312, "class", "text-sm font-semibold text-gray-400 tracking-wider uppercase");
    			add_location(h312, file$2, 743, 10, 41601);
    			attr_dev(p29, "class", "mt-4 text-base text-gray-500");
    			add_location(p29, file$2, 746, 10, 41741);
    			attr_dev(label, "for", "email-address");
    			attr_dev(label, "class", "sr-only");
    			add_location(label, file$2, 750, 12, 41940);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "name", "email-address");
    			attr_dev(input, "id", "email-address");
    			attr_dev(input, "autocomplete", "email");
    			input.required = true;
    			attr_dev(input, "class", "appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:placeholder-gray-400");
    			attr_dev(input, "placeholder", "Enter your email");
    			add_location(input, file$2, 751, 12, 42017);
    			attr_dev(button3, "type", "submit");
    			attr_dev(button3, "class", "w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white hover:from-purple-700 hover:to-indigo-700");
    			add_location(button3, file$2, 753, 14, 42467);
    			attr_dev(div122, "class", "mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0");
    			add_location(div122, file$2, 752, 12, 42390);
    			attr_dev(form, "class", "mt-4 sm:flex sm:max-w-md");
    			add_location(form, file$2, 749, 10, 41888);
    			attr_dev(div123, "class", "mt-12 xl:mt-0");
    			add_location(div123, file$2, 742, 8, 41563);
    			attr_dev(div124, "class", "xl:grid xl:grid-cols-3 xl:gap-8");
    			add_location(div124, file$2, 615, 6, 37428);
    			attr_dev(span31, "class", "sr-only");
    			add_location(span31, file$2, 763, 12, 43082);
    			attr_dev(path21, "fill-rule", "evenodd");
    			attr_dev(path21, "d", "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z");
    			attr_dev(path21, "clip-rule", "evenodd");
    			add_location(path21, file$2, 765, 14, 43227);
    			attr_dev(svg21, "class", "h-6 w-6");
    			attr_dev(svg21, "fill", "currentColor");
    			attr_dev(svg21, "viewBox", "0 0 24 24");
    			attr_dev(svg21, "aria-hidden", "true");
    			add_location(svg21, file$2, 764, 12, 43132);
    			attr_dev(a41, "href", "#");
    			attr_dev(a41, "class", "text-gray-400 hover:text-gray-500");
    			add_location(a41, file$2, 762, 10, 43015);
    			attr_dev(span32, "class", "sr-only");
    			add_location(span32, file$2, 770, 12, 43655);
    			attr_dev(path22, "fill-rule", "evenodd");
    			attr_dev(path22, "d", "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z");
    			attr_dev(path22, "clip-rule", "evenodd");
    			add_location(path22, file$2, 772, 14, 43801);
    			attr_dev(svg22, "class", "h-6 w-6");
    			attr_dev(svg22, "fill", "currentColor");
    			attr_dev(svg22, "viewBox", "0 0 24 24");
    			attr_dev(svg22, "aria-hidden", "true");
    			add_location(svg22, file$2, 771, 12, 43706);
    			attr_dev(a42, "href", "#");
    			attr_dev(a42, "class", "text-gray-400 hover:text-gray-500");
    			add_location(a42, file$2, 769, 10, 43588);
    			attr_dev(span33, "class", "sr-only");
    			add_location(span33, file$2, 777, 12, 45562);
    			attr_dev(path23, "d", "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84");
    			add_location(path23, file$2, 779, 14, 45706);
    			attr_dev(svg23, "class", "h-6 w-6");
    			attr_dev(svg23, "fill", "currentColor");
    			attr_dev(svg23, "viewBox", "0 0 24 24");
    			attr_dev(svg23, "aria-hidden", "true");
    			add_location(svg23, file$2, 778, 12, 45611);
    			attr_dev(a43, "href", "#");
    			attr_dev(a43, "class", "text-gray-400 hover:text-gray-500");
    			add_location(a43, file$2, 776, 10, 45495);
    			attr_dev(span34, "class", "sr-only");
    			add_location(span34, file$2, 784, 12, 46255);
    			attr_dev(path24, "fill-rule", "evenodd");
    			attr_dev(path24, "d", "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z");
    			attr_dev(path24, "clip-rule", "evenodd");
    			add_location(path24, file$2, 786, 14, 46398);
    			attr_dev(svg24, "class", "h-6 w-6");
    			attr_dev(svg24, "fill", "currentColor");
    			attr_dev(svg24, "viewBox", "0 0 24 24");
    			attr_dev(svg24, "aria-hidden", "true");
    			add_location(svg24, file$2, 785, 12, 46303);
    			attr_dev(a44, "href", "#");
    			attr_dev(a44, "class", "text-gray-400 hover:text-gray-500");
    			add_location(a44, file$2, 783, 10, 46188);
    			attr_dev(span35, "class", "sr-only");
    			add_location(span35, file$2, 791, 12, 47284);
    			attr_dev(path25, "fill-rule", "evenodd");
    			attr_dev(path25, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z");
    			attr_dev(path25, "clip-rule", "evenodd");
    			add_location(path25, file$2, 793, 14, 47429);
    			attr_dev(svg25, "class", "h-6 w-6");
    			attr_dev(svg25, "fill", "currentColor");
    			attr_dev(svg25, "viewBox", "0 0 24 24");
    			attr_dev(svg25, "aria-hidden", "true");
    			add_location(svg25, file$2, 792, 12, 47334);
    			attr_dev(a45, "href", "#");
    			attr_dev(a45, "class", "text-gray-400 hover:text-gray-500");
    			add_location(a45, file$2, 790, 10, 47217);
    			attr_dev(div125, "class", "flex space-x-6 md:order-2");
    			add_location(div125, file$2, 761, 8, 42965);
    			attr_dev(p30, "class", "mt-8 text-base text-gray-400 md:mt-0 md:order-1");
    			add_location(p30, file$2, 797, 8, 48427);
    			attr_dev(div126, "class", "mt-12 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between lg:mt-16");
    			add_location(div126, file$2, 760, 6, 42855);
    			attr_dev(div127, "class", "max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:pt-24 lg:px-8");
    			add_location(div127, file$2, 614, 4, 37349);
    			attr_dev(footer1, "class", "bg-gray-50");
    			attr_dev(footer1, "aria-labelledby", "footer-heading");
    			add_location(footer1, file$2, 612, 2, 37228);
    			attr_dev(div128, "class", "bg-white");
    			add_location(div128, file$2, 4, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div128, anchor);
    			append_dev(div128, header);
    			append_dev(header, div34);
    			append_dev(div34, div15);
    			append_dev(div15, div0);
    			append_dev(div0, a0);
    			append_dev(a0, span0);
    			append_dev(a0, t1);
    			append_dev(a0, img0);
    			append_dev(div15, t2);
    			append_dev(div15, div1);
    			append_dev(div1, button0);
    			append_dev(button0, span1);
    			append_dev(button0, t4);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div15, t5);
    			append_dev(div15, nav0);
    			append_dev(nav0, div13);
    			append_dev(div13, button1);
    			append_dev(button1, span2);
    			append_dev(button1, t7);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div13, t8);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, a1);
    			append_dev(a1, div2);
    			append_dev(div2, svg2);
    			append_dev(svg2, path2);
    			append_dev(a1, t9);
    			append_dev(a1, div3);
    			append_dev(div3, p0);
    			append_dev(div3, t11);
    			append_dev(div3, p1);
    			append_dev(div10, t13);
    			append_dev(div10, a2);
    			append_dev(a2, div4);
    			append_dev(div4, svg3);
    			append_dev(svg3, path3);
    			append_dev(a2, t14);
    			append_dev(a2, div5);
    			append_dev(div5, p2);
    			append_dev(div5, t16);
    			append_dev(div5, p3);
    			append_dev(div10, t18);
    			append_dev(div10, a3);
    			append_dev(a3, div6);
    			append_dev(div6, svg4);
    			append_dev(svg4, path4);
    			append_dev(a3, t19);
    			append_dev(a3, div7);
    			append_dev(div7, p4);
    			append_dev(div7, t21);
    			append_dev(div7, p5);
    			append_dev(div10, t23);
    			append_dev(div10, a4);
    			append_dev(a4, div8);
    			append_dev(div8, svg5);
    			append_dev(svg5, path5);
    			append_dev(a4, t24);
    			append_dev(a4, div9);
    			append_dev(div9, p6);
    			append_dev(div9, t26);
    			append_dev(div9, p7);
    			append_dev(nav0, t28);
    			append_dev(nav0, a5);
    			append_dev(nav0, t30);
    			append_dev(nav0, a6);
    			append_dev(nav0, t32);
    			append_dev(nav0, a7);
    			append_dev(div15, t34);
    			append_dev(div15, div14);
    			append_dev(div14, a8);
    			append_dev(div14, t36);
    			append_dev(div14, a9);
    			append_dev(div34, t38);
    			append_dev(div34, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div28);
    			append_dev(div28, div18);
    			append_dev(div18, div16);
    			append_dev(div16, img1);
    			append_dev(div18, t39);
    			append_dev(div18, div17);
    			append_dev(div17, button2);
    			append_dev(button2, span3);
    			append_dev(button2, t41);
    			append_dev(button2, svg6);
    			append_dev(svg6, path6);
    			append_dev(div28, t42);
    			append_dev(div28, div27);
    			append_dev(div27, nav1);
    			append_dev(nav1, a10);
    			append_dev(a10, div19);
    			append_dev(div19, svg7);
    			append_dev(svg7, path7);
    			append_dev(a10, t43);
    			append_dev(a10, div20);
    			append_dev(nav1, t45);
    			append_dev(nav1, a11);
    			append_dev(a11, div21);
    			append_dev(div21, svg8);
    			append_dev(svg8, path8);
    			append_dev(a11, t46);
    			append_dev(a11, div22);
    			append_dev(nav1, t48);
    			append_dev(nav1, a12);
    			append_dev(a12, div23);
    			append_dev(div23, svg9);
    			append_dev(svg9, path9);
    			append_dev(a12, t49);
    			append_dev(a12, div24);
    			append_dev(nav1, t51);
    			append_dev(nav1, a13);
    			append_dev(a13, div25);
    			append_dev(div25, svg10);
    			append_dev(svg10, path10);
    			append_dev(a13, t52);
    			append_dev(a13, div26);
    			append_dev(div32, t54);
    			append_dev(div32, div31);
    			append_dev(div31, div29);
    			append_dev(div29, a14);
    			append_dev(div29, t56);
    			append_dev(div29, a15);
    			append_dev(div29, t58);
    			append_dev(div29, a16);
    			append_dev(div31, t60);
    			append_dev(div31, div30);
    			append_dev(div30, a17);
    			append_dev(div30, t62);
    			append_dev(div30, p8);
    			append_dev(p8, t63);
    			append_dev(p8, a18);
    			append_dev(div128, t65);
    			append_dev(div128, main);
    			append_dev(main, div43);
    			append_dev(div43, div35);
    			append_dev(div43, t66);
    			append_dev(div43, div42);
    			append_dev(div42, div41);
    			append_dev(div41, div37);
    			append_dev(div37, img2);
    			append_dev(div37, t67);
    			append_dev(div37, div36);
    			append_dev(div41, t68);
    			append_dev(div41, div40);
    			append_dev(div40, h1);
    			append_dev(h1, span4);
    			append_dev(h1, t70);
    			append_dev(h1, span5);
    			append_dev(div40, t72);
    			append_dev(div40, p9);
    			append_dev(div40, t74);
    			append_dev(div40, div39);
    			append_dev(div39, div38);
    			append_dev(div38, a19);
    			append_dev(div38, t76);
    			append_dev(div38, a20);
    			append_dev(main, t78);
    			append_dev(main, div51);
    			append_dev(div51, div50);
    			append_dev(div50, p10);
    			append_dev(div50, t80);
    			append_dev(div50, div49);
    			append_dev(div49, div44);
    			append_dev(div44, img3);
    			append_dev(div49, t81);
    			append_dev(div49, div45);
    			append_dev(div45, img4);
    			append_dev(div49, t82);
    			append_dev(div49, div46);
    			append_dev(div46, img5);
    			append_dev(div49, t83);
    			append_dev(div49, div47);
    			append_dev(div47, img6);
    			append_dev(div49, t84);
    			append_dev(div49, div48);
    			append_dev(div48, img7);
    			append_dev(main, t85);
    			append_dev(main, div76);
    			append_dev(div76, div52);
    			append_dev(div76, t86);
    			append_dev(div76, div66);
    			append_dev(div66, div65);
    			append_dev(div65, div62);
    			append_dev(div62, div56);
    			append_dev(div56, div53);
    			append_dev(div53, span6);
    			append_dev(span6, svg11);
    			append_dev(svg11, path11);
    			append_dev(div56, t87);
    			append_dev(div56, div55);
    			append_dev(div55, h20);
    			append_dev(div55, t89);
    			append_dev(div55, p11);
    			append_dev(div55, t91);
    			append_dev(div55, div54);
    			append_dev(div54, a21);
    			append_dev(div62, t93);
    			append_dev(div62, div61);
    			append_dev(div61, blockquote);
    			append_dev(blockquote, div57);
    			append_dev(div57, p12);
    			append_dev(blockquote, t95);
    			append_dev(blockquote, footer0);
    			append_dev(footer0, div60);
    			append_dev(div60, div58);
    			append_dev(div58, img8);
    			append_dev(div60, t96);
    			append_dev(div60, div59);
    			append_dev(div65, t98);
    			append_dev(div65, div64);
    			append_dev(div64, div63);
    			append_dev(div63, img9);
    			append_dev(div76, t99);
    			append_dev(div76, div75);
    			append_dev(div75, div74);
    			append_dev(div74, div71);
    			append_dev(div71, div70);
    			append_dev(div70, div67);
    			append_dev(div67, span7);
    			append_dev(span7, svg12);
    			append_dev(svg12, path12);
    			append_dev(div70, t100);
    			append_dev(div70, div69);
    			append_dev(div69, h21);
    			append_dev(div69, t102);
    			append_dev(div69, p13);
    			append_dev(div69, t104);
    			append_dev(div69, div68);
    			append_dev(div68, a22);
    			append_dev(div74, t106);
    			append_dev(div74, div73);
    			append_dev(div73, div72);
    			append_dev(div72, img10);
    			append_dev(main, t107);
    			append_dev(main, div103);
    			append_dev(div103, div102);
    			append_dev(div102, h22);
    			append_dev(div102, t109);
    			append_dev(div102, p14);
    			append_dev(div102, t111);
    			append_dev(div102, div101);
    			append_dev(div101, div79);
    			append_dev(div79, div77);
    			append_dev(div77, span8);
    			append_dev(span8, svg13);
    			append_dev(svg13, path13);
    			append_dev(div79, t112);
    			append_dev(div79, div78);
    			append_dev(div78, h30);
    			append_dev(div78, t114);
    			append_dev(div78, p15);
    			append_dev(div101, t116);
    			append_dev(div101, div82);
    			append_dev(div82, div80);
    			append_dev(div80, span9);
    			append_dev(span9, svg14);
    			append_dev(svg14, path14);
    			append_dev(div82, t117);
    			append_dev(div82, div81);
    			append_dev(div81, h31);
    			append_dev(div81, t119);
    			append_dev(div81, p16);
    			append_dev(div101, t121);
    			append_dev(div101, div85);
    			append_dev(div85, div83);
    			append_dev(div83, span10);
    			append_dev(span10, svg15);
    			append_dev(svg15, path15);
    			append_dev(div85, t122);
    			append_dev(div85, div84);
    			append_dev(div84, h32);
    			append_dev(div84, t124);
    			append_dev(div84, p17);
    			append_dev(div101, t126);
    			append_dev(div101, div88);
    			append_dev(div88, div86);
    			append_dev(div86, span11);
    			append_dev(span11, svg16);
    			append_dev(svg16, path16);
    			append_dev(div88, t127);
    			append_dev(div88, div87);
    			append_dev(div87, h33);
    			append_dev(div87, t129);
    			append_dev(div87, p18);
    			append_dev(div101, t131);
    			append_dev(div101, div91);
    			append_dev(div91, div89);
    			append_dev(div89, span12);
    			append_dev(span12, svg17);
    			append_dev(svg17, path17);
    			append_dev(div91, t132);
    			append_dev(div91, div90);
    			append_dev(div90, h34);
    			append_dev(div90, t134);
    			append_dev(div90, p19);
    			append_dev(div101, t136);
    			append_dev(div101, div94);
    			append_dev(div94, div92);
    			append_dev(div92, span13);
    			append_dev(span13, svg18);
    			append_dev(svg18, path18);
    			append_dev(div94, t137);
    			append_dev(div94, div93);
    			append_dev(div93, h35);
    			append_dev(div93, t139);
    			append_dev(div93, p20);
    			append_dev(div101, t141);
    			append_dev(div101, div97);
    			append_dev(div97, div95);
    			append_dev(div95, span14);
    			append_dev(span14, svg19);
    			append_dev(svg19, path19);
    			append_dev(div97, t142);
    			append_dev(div97, div96);
    			append_dev(div96, h36);
    			append_dev(div96, t144);
    			append_dev(div96, p21);
    			append_dev(div101, t146);
    			append_dev(div101, div100);
    			append_dev(div100, div98);
    			append_dev(div98, span15);
    			append_dev(span15, svg20);
    			append_dev(svg20, path20);
    			append_dev(div100, t147);
    			append_dev(div100, div99);
    			append_dev(div99, h37);
    			append_dev(div99, t149);
    			append_dev(div99, p22);
    			append_dev(main, t151);
    			append_dev(main, div111);
    			append_dev(div111, div107);
    			append_dev(div107, div106);
    			append_dev(div106, div105);
    			append_dev(div105, img11);
    			append_dev(div105, t152);
    			append_dev(div105, div104);
    			append_dev(div111, t153);
    			append_dev(div111, div110);
    			append_dev(div110, div109);
    			append_dev(div109, h23);
    			append_dev(h23, span16);
    			append_dev(div109, t155);
    			append_dev(div109, p23);
    			append_dev(div109, t157);
    			append_dev(div109, p24);
    			append_dev(div109, t159);
    			append_dev(div109, div108);
    			append_dev(div108, p25);
    			append_dev(p25, span17);
    			append_dev(p25, t161);
    			append_dev(p25, span19);
    			append_dev(span19, span18);
    			append_dev(span19, t163);
    			append_dev(div108, t164);
    			append_dev(div108, p26);
    			append_dev(p26, span20);
    			append_dev(p26, t166);
    			append_dev(p26, span22);
    			append_dev(span22, span21);
    			append_dev(span22, t168);
    			append_dev(div108, t169);
    			append_dev(div108, p27);
    			append_dev(p27, span23);
    			append_dev(p27, t171);
    			append_dev(p27, span25);
    			append_dev(span25, span24);
    			append_dev(span25, t173);
    			append_dev(div108, t174);
    			append_dev(div108, p28);
    			append_dev(p28, span26);
    			append_dev(p28, t176);
    			append_dev(p28, span28);
    			append_dev(span28, span27);
    			append_dev(span28, t178);
    			append_dev(main, t179);
    			append_dev(main, div114);
    			append_dev(div114, div113);
    			append_dev(div113, h24);
    			append_dev(h24, span29);
    			append_dev(h24, t181);
    			append_dev(h24, span30);
    			append_dev(div113, t183);
    			append_dev(div113, div112);
    			append_dev(div112, a23);
    			append_dev(div112, t185);
    			append_dev(div112, a24);
    			append_dev(div128, t187);
    			append_dev(div128, footer1);
    			append_dev(footer1, h25);
    			append_dev(footer1, t189);
    			append_dev(footer1, div127);
    			append_dev(div127, div124);
    			append_dev(div124, div121);
    			append_dev(div121, div117);
    			append_dev(div117, div115);
    			append_dev(div115, h38);
    			append_dev(div115, t191);
    			append_dev(div115, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a25);
    			append_dev(ul0, t193);
    			append_dev(ul0, li1);
    			append_dev(li1, a26);
    			append_dev(ul0, t195);
    			append_dev(ul0, li2);
    			append_dev(li2, a27);
    			append_dev(ul0, t197);
    			append_dev(ul0, li3);
    			append_dev(li3, a28);
    			append_dev(div117, t199);
    			append_dev(div117, div116);
    			append_dev(div116, h39);
    			append_dev(div116, t201);
    			append_dev(div116, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a29);
    			append_dev(ul1, t203);
    			append_dev(ul1, li5);
    			append_dev(li5, a30);
    			append_dev(ul1, t205);
    			append_dev(ul1, li6);
    			append_dev(li6, a31);
    			append_dev(ul1, t207);
    			append_dev(ul1, li7);
    			append_dev(li7, a32);
    			append_dev(div121, t209);
    			append_dev(div121, div120);
    			append_dev(div120, div118);
    			append_dev(div118, h310);
    			append_dev(div118, t211);
    			append_dev(div118, ul2);
    			append_dev(ul2, li8);
    			append_dev(li8, a33);
    			append_dev(ul2, t213);
    			append_dev(ul2, li9);
    			append_dev(li9, a34);
    			append_dev(ul2, t215);
    			append_dev(ul2, li10);
    			append_dev(li10, a35);
    			append_dev(ul2, t217);
    			append_dev(ul2, li11);
    			append_dev(li11, a36);
    			append_dev(ul2, t219);
    			append_dev(ul2, li12);
    			append_dev(li12, a37);
    			append_dev(div120, t221);
    			append_dev(div120, div119);
    			append_dev(div119, h311);
    			append_dev(div119, t223);
    			append_dev(div119, ul3);
    			append_dev(ul3, li13);
    			append_dev(li13, a38);
    			append_dev(ul3, t225);
    			append_dev(ul3, li14);
    			append_dev(li14, a39);
    			append_dev(ul3, t227);
    			append_dev(ul3, li15);
    			append_dev(li15, a40);
    			append_dev(div124, t229);
    			append_dev(div124, div123);
    			append_dev(div123, h312);
    			append_dev(div123, t231);
    			append_dev(div123, p29);
    			append_dev(div123, t233);
    			append_dev(div123, form);
    			append_dev(form, label);
    			append_dev(form, t235);
    			append_dev(form, input);
    			append_dev(form, t236);
    			append_dev(form, div122);
    			append_dev(div122, button3);
    			append_dev(div127, t238);
    			append_dev(div127, div126);
    			append_dev(div126, div125);
    			append_dev(div125, a41);
    			append_dev(a41, span31);
    			append_dev(a41, t240);
    			append_dev(a41, svg21);
    			append_dev(svg21, path21);
    			append_dev(div125, t241);
    			append_dev(div125, a42);
    			append_dev(a42, span32);
    			append_dev(a42, t243);
    			append_dev(a42, svg22);
    			append_dev(svg22, path22);
    			append_dev(div125, t244);
    			append_dev(div125, a43);
    			append_dev(a43, span33);
    			append_dev(a43, t246);
    			append_dev(a43, svg23);
    			append_dev(svg23, path23);
    			append_dev(div125, t247);
    			append_dev(div125, a44);
    			append_dev(a44, span34);
    			append_dev(a44, t249);
    			append_dev(a44, svg24);
    			append_dev(svg24, path24);
    			append_dev(div125, t250);
    			append_dev(div125, a45);
    			append_dev(a45, span35);
    			append_dev(a45, t252);
    			append_dev(a45, svg25);
    			append_dev(svg25, path25);
    			append_dev(div126, t253);
    			append_dev(div126, p30);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div128);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/pages/Register.svelte generated by Svelte v3.44.2 */

    const file$1 = "src/pages/Register.svelte";

    function create_fragment$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "this is the registration page";
    			add_location(p, file$1, 4, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Register', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Register> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Register extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Register",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.2 */
    const file = "src/App.svelte";

    // (15:1) <NotFound>
    function create_default_slot_1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Sorry. Page not found.";
    			attr_dev(h2, "class", "svelte-c48go5");
    			add_location(h2, file, 15, 3, 395);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(15:1) <NotFound>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let notfound;
    	let current;

    	route0 = new Route({
    			props: { path: "/", component: Home },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "/register", component: Register },
    			$$inline: true
    		});

    	notfound = new NotFound({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(notfound.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(notfound, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notfound_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				notfound_changes.$$scope = { dirty, ctx };
    			}

    			notfound.$set(notfound_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(notfound.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(notfound.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(notfound, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		page,
    		Router,
    		Route,
    		NotFound,
    		Home,
    		Register
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
