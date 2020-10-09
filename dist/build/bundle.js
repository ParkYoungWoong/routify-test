
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    /**
     * Hot module replacement for Svelte in the Wild
     *
     * @export
     * @param {object} Component Svelte component
     * @param {object} [options={ target: document.body }] Options for the Svelte component
     * @param {string} [id='hmr'] ID for the component container
     * @param {string} [eventName='app-loaded'] Name of the event that triggers replacement of previous component
     * @returns
     */
    function HMR(Component, options = { target: document.body }, id = 'hmr', eventName = 'app-loaded') {
        const oldContainer = document.getElementById(id);

        // Create the new (temporarily hidden) component container
        const appContainer = document.createElement("div");
        if (oldContainer) appContainer.style.visibility = 'hidden';
        else appContainer.setAttribute('id', id); //ssr doesn't get an event, so we set the id now

        // Attach it to the target element
        options.target.appendChild(appContainer);

        // Wait for the app to load before replacing the component
        addEventListener(eventName, replaceComponent);

        function replaceComponent() {
            if (oldContainer) oldContainer.remove();
            // Show our component and take over the ID of the old container
            appContainer.style.visibility = 'initial';
            // delete (appContainer.style.visibility)
            appContainer.setAttribute('id', id);
        }

        return new Component({
            ...options,
            target: appContainer
        });
    }

    function noop() { }
    const identity = x => x;
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
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function tick() {
        schedule_update();
        return resolved_promise;
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const MATCH_PARAM = RegExp(/\:([^/()]+)/g);

    function handleScroll (element) {
      if (navigator.userAgent.includes('jsdom')) return false
      scrollAncestorsToTop(element);
      handleHash();
    }

    function handleHash () {
      if (navigator.userAgent.includes('jsdom')) return false
      const { hash } = window.location;
      if (hash) {
        const validElementIdRegex = /^[A-Za-z]+[\w\-\:\.]*$/;
        if (validElementIdRegex.test(hash.substring(1))) {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView();
        }
      }
    }

    function scrollAncestorsToTop (element) {
      if (
        element &&
        element.scrollTo &&
        element.dataset.routify !== 'scroll-lock' &&
        element.dataset['routify-scroll'] !== 'lock'
      ) {
        element.style['scroll-behavior'] = 'auto';
        element.scrollTo({ top: 0, behavior: 'auto' });
        element.style['scroll-behavior'] = '';
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParamKeys = string => {
      const paramsKeys = [];
      let matches;
      while ((matches = MATCH_PARAM.exec(string))) paramsKeys.push(matches[1]);
      return paramsKeys
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/')
        .filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    let warningSuppressed = false;

    /* eslint no-console: 0 */
    function suppressWarnings () {
      if (warningSuppressed) return
      const consoleWarn = console.warn;
      console.warn = function (msg, ...msgs) {
        const ignores = [
          "was created with unknown prop 'scoped'",
          "was created with unknown prop 'scopedSync'",
        ];
        if (!ignores.find(iMsg => msg.includes(iMsg)))
          return consoleWarn(msg, ...msgs)
      };
      warningSuppressed = true;
    }

    function currentLocation () {
      const pathMatch = window.location.search.match(/__routify_path=([^&]+)/);
      const prefetchMatch = window.location.search.match(/__routify_prefetch=\d+/);
      window.routify = window.routify || {};
      window.routify.prefetched = prefetchMatch ? true : false;
      const path = pathMatch && pathMatch[1].replace(/[#?].+/, ''); // strip any thing after ? and #
      return path || window.location.pathname
    }

    window.routify = window.routify || {};

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const route = writable(null); // the actual route being rendered

    /** @type {import('svelte/store').Writable<RouteNode[]>} */
    const routes = writable([]); // all routes
    routes.subscribe(routes => (window.routify.routes = routes));

    let rootContext = writable({ component: { params: {} } });

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const urlRoute = writable(null);  // the route matching the url

    /** @type {import('svelte/store').Writable<String>} */
    const basepath = (() => {
        const { set, subscribe } = writable("");

        return {
            subscribe,
            set(value) {
                if (value.match(/^[/(]/))
                    set(value);
                else console.warn('Basepaths must start with / or (');
            },
            update() { console.warn('Use assignment or set to update basepaths.'); }
        }
    })();

    const location$1 = derived( // the part of the url matching the basepath
        [basepath, urlRoute],
        ([$basepath, $route]) => {
            const [, base, path] = currentLocation().match(`^(${$basepath})(${$route.regex})`) || [];
            return { base, path }
        }
    );

    const prefetchPath = writable("");

    function onAppLoaded({ path, metatags }) {
        metatags.update();
        const prefetchMatch = window.location.search.match(/__routify_prefetch=(\d+)/);
        const prefetchId = prefetchMatch && prefetchMatch[1];

        dispatchEvent(new CustomEvent('app-loaded'));
        parent.postMessage({
            msg: 'app-loaded',
            prefetched: window.routify.prefetched,
            path,
            prefetchId
        }, "*");
        window['routify'].appLoaded = true;
    }

    var defaultConfig = {
        queryHandler: {
            parse: search => fromEntries(new URLSearchParams(search)),
            stringify: params => '?' + (new URLSearchParams(params)).toString()
        }
    };


    function fromEntries(iterable) {
        return [...iterable].reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj
        }, {})
    }

    /**
     * @param {string} url 
     * @return {ClientNode}
     */
    function urlToRoute(url) {
        /** @type {RouteNode[]} */
        const routes$1 = get_store_value(routes);
        const basepath$1 = get_store_value(basepath);
        const route = routes$1.find(route => url.match(`^${basepath$1}${route.regex}`));
        if (!route)
            throw new Error(
                `Route could not be found for "${url}".`
            )

        const [, base] = url.match(`^(${basepath$1})${route.regex}`);
        const path = url.slice(base.length);

        if (defaultConfig.queryHandler)
            route.params = defaultConfig.queryHandler.parse(window.location.search);

        if (route.paramKeys) {
            const layouts = layoutByPos(route.layouts);
            const fragments = path.split('/').filter(Boolean);
            const routeProps = getRouteProps(route.path);

            routeProps.forEach((prop, i) => {
                if (prop) {
                    route.params[prop] = fragments[i];
                    if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
                    else route.param = { [prop]: fragments[i] };
                }
            });
        }

        route.leftover = url.replace(new RegExp(base + route.regex), '');

        return route
    }


    /**
     * @param {array} layouts
     */
    function layoutByPos(layouts) {
        const arr = [];
        layouts.forEach(layout => {
            arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
        });
        return arr
    }


    /**
     * @param {string} url
     */
    function getRouteProps(url) {
        return url
            .split('/')
            .filter(Boolean)
            .map(f => f.match(/\:(.+)/))
            .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Prefetcher.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1 } = globals;
    const file = "node_modules/@sveltech/routify/runtime/Prefetcher.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (93:2) {#each $actives as prefetch (prefetch.options.prefetch)}
    function create_each_block(key_1, ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			iframe = element("iframe");
    			if (iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "title", "routify prefetcher");
    			add_location(iframe, file, 93, 4, 2705);
    			this.first = iframe;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$actives*/ 1 && iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(93:2) {#each $actives as prefetch (prefetch.options.prefetch)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*$actives*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*prefetch*/ ctx[1].options.prefetch;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "__routify_iframes");
    			set_style(div, "display", "none");
    			add_location(div, file, 91, 0, 2591);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$actives*/ 1) {
    				const each_value = /*$actives*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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

    const iframeNum = 2;

    const defaults = {
    	validFor: 60,
    	timeout: 5000,
    	gracePeriod: 1000
    };

    /** stores and subscriptions */
    const queue = writable([]);

    const actives = derived(queue, q => q.slice(0, iframeNum));

    actives.subscribe(actives => actives.forEach(({ options }) => {
    	setTimeout(() => removeFromQueue(options.prefetch), options.timeout);
    }));

    function prefetch(path, options = {}) {
    	prefetch.id = prefetch.id || 1;

    	path = !path.href
    	? path
    	: path.href.replace(/^(?:\/\/|[^/]+)*\//, "/");

    	//replace first ? since were mixing user queries with routify queries
    	path = path.replace("?", "&");

    	options = { ...defaults, ...options, path };
    	options.prefetch = prefetch.id++;

    	//don't prefetch within prefetch or SSR
    	if (window.routify.prefetched || navigator.userAgent.match("jsdom")) return false;

    	// add to queue
    	queue.update(q => {
    		if (!q.some(e => e.options.path === path)) q.push({
    			url: `/__app.html?${optionsToQuery(options)}`,
    			options
    		});

    		return q;
    	});
    }

    /**
     * convert options to query string
     * {a:1,b:2} becomes __routify_a=1&routify_b=2
     * @param {defaults & {path: string, prefetch: number}} options
     */
    function optionsToQuery(options) {
    	return Object.entries(options).map(([key, val]) => `__routify_${key}=${val}`).join("&");
    }

    /**
     * @param {number|MessageEvent} idOrEvent
     */
    function removeFromQueue(idOrEvent) {
    	const id = idOrEvent.data ? idOrEvent.data.prefetchId : idOrEvent;
    	if (!id) return null;
    	const entry = get_store_value(queue).find(entry => entry && entry.options.prefetch == id);

    	// removeFromQueue is called by both eventListener and timeout,
    	// but we can only remove the item once
    	if (entry) {
    		const { gracePeriod } = entry.options;
    		const gracePromise = new Promise(resolve => setTimeout(resolve, gracePeriod));

    		const idlePromise = new Promise(resolve => {
    				window.requestIdleCallback
    				? window.requestIdleCallback(resolve)
    				: setTimeout(resolve, gracePeriod + 1000);
    			});

    		Promise.all([gracePromise, idlePromise]).then(() => {
    			queue.update(q => q.filter(q => q.options.prefetch != id));
    		});
    	}
    }

    // Listen to message from child window
    addEventListener("message", removeFromQueue, false);

    function instance($$self, $$props, $$invalidate) {
    	let $actives;
    	validate_store(actives, "actives");
    	component_subscribe($$self, actives, $$value => $$invalidate(0, $actives = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Prefetcher", slots, []);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prefetcher> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		writable,
    		derived,
    		get: get_store_value,
    		iframeNum,
    		defaults,
    		queue,
    		actives,
    		prefetch,
    		optionsToQuery,
    		removeFromQueue,
    		$actives
    	});

    	return [$actives];
    }

    class Prefetcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prefetcher",
    			options,
    			id: create_fragment.name
    		});
    	}
    }
    Prefetcher.$compile = {"vars":[{"name":"writable","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"derived","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"get","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"iframeNum","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"defaults","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"queue","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"actives","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"prefetch","export_name":"prefetch","injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"optionsToQuery","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"removeFromQueue","export_name":null,"injected":false,"module":true,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"$actives","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /// <reference path="../typedef.js" />

    /** @ts-check */
    /**
     * @typedef {Object} RoutifyContext
     * @prop {ClientNode} component
     * @prop {ClientNode} layout
     * @prop {any} componentFile 
     * 
     *  @returns {import('svelte/store').Readable<RoutifyContext>} */
    function getRoutifyContext() {
      return getContext('routify') || rootContext
    }

    /**
    * @typedef {{component: ClientNode}}  ContextHelper
    * @typedef {import('svelte/store').Readable<ContextHelper>} ContextHelperStore
    * @type {ContextHelperStore}
    */
    const context = {
      subscribe(run) {
        return getRoutifyContext().subscribe(run)
      }
    };

    /**
     * @typedef {function():void} ReadyHelper
     * @typedef {import('svelte/store').Readable<ReadyHelper>} ReadyHelperStore
     * @type {ReadyHelperStore}
    */
    const ready = {
      subscribe(run) {
        window['routify'].stopAutoReady = true;
        async function ready() {
          await tick();
          await onAppLoaded({ path: get_store_value(route).path, metatags });
        }
        run(ready);
        return () => { }
      }
    };

    /**
     * @callback AfterPageLoadHelper
     * @param {function} callback
     * 
     * @typedef {import('svelte/store').Readable<AfterPageLoadHelper> & {_hooks:Array<function>}} AfterPageLoadHelperStore
     * @type {AfterPageLoadHelperStore}
     */
    const afterPageLoad = {
      _hooks: [],
      subscribe: hookHandler
    };

    /** 
     * @callback BeforeUrlChangeHelper
     * @param {function} callback
     *
     * @typedef {import('svelte/store').Readable<BeforeUrlChangeHelper> & {_hooks:Array<function>}} BeforeUrlChangeHelperStore
     * @type {BeforeUrlChangeHelperStore}
     **/
    const beforeUrlChange = {
      _hooks: [],
      subscribe: hookHandler
    };

    function hookHandler(listener) {
      const hooks = this._hooks;
      const index = hooks.length;
      listener(callback => { hooks[index] = callback; });
      return () => delete hooks[index]
    }

    /**
     * We have to grab params and leftover from the context and not directly from the store.
     * Otherwise the context is updated before the component is destroyed. * 
     * @typedef {Object.<string, *>} ParamsHelper
     * @typedef {import('svelte/store').Readable<ParamsHelper>} ParamsHelperStore
     * @type {ParamsHelperStore}
     **/
    const params = {
      subscribe(run) {
        const ctx = getRoutifyContext();
        return derived(ctx, ctx => ctx.route.params).subscribe(run)
      }
    };

    /**
     * @typedef {string} LeftoverHelper
     * @typedef {import('svelte/store').Readable<string>} LeftoverHelperStore
     * @type {LeftoverHelperStore} 
     **/
    const leftover = {
      subscribe(listener) {
        return derived(
          route,
          route => route.leftover
        ).subscribe(listener)
      },
    };

    /**
     * @callback UrlHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @return {String}
     *
     * @typedef {import('svelte/store').Readable<UrlHelper>} UrlHelperStore
     * @type {UrlHelperStore} 
     * */
    const url = {
      subscribe(listener) {
        const ctx = getRoutifyContext();
        return derived(
          [ctx, route, routes, location$1],
          args => makeUrlHelper(...args)
        ).subscribe(
          listener
        )
      }
    };

    /** 
     * @param {{component: ClientNode}} $ctx 
     * @param {RouteNode} $oldRoute 
     * @param {RouteNode[]} $routes 
     * @param {{base: string, path: string}} $location
     * @returns {UrlHelper}
     */
    function makeUrlHelper($ctx, $oldRoute, $routes, $location) {
      return function url(path, params, options) {
        const { component } = $ctx;
        path = path || './';

        const strict = options && options.strict !== false;
        if (!strict) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          let [, breadcrumbs, relativePath] = path.match(/^([\.\/]+)(.*)/);
          let dir = component.path.replace(/\/$/, '');
          const traverse = breadcrumbs.match(/\.\.\//g) || [];
          traverse.forEach(() => dir = dir.replace(/\/[^\/]+\/?$/, ''));
          path = `${dir}/${relativePath}`.replace(/\/$/, '');

        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = $routes.find(route => route.meta.name === path);
          if (matchingRoute) path = matchingRoute.shortPath;
        }

        /** @type {Object<string, *>} Parameters */
        const allParams = Object.assign({}, $oldRoute.params, component.params, params);
        let pathWithParams = path;
        for (const [key, value] of Object.entries(allParams)) {
          pathWithParams = pathWithParams.replace(`:${key}`, value);
        }

        const fullPath = $location.base + pathWithParams + _getQueryString(path, params);
        return fullPath.replace(/\?$/, '')
      }
    }

    /**
     * 
     * @param {string} path 
     * @param {object} params 
     */
    function _getQueryString(path, params) {
      if (!defaultConfig.queryHandler) return ""
      const pathParamKeys = pathToParamKeys(path);
      const queryParams = {};
      if (params) Object.entries(params).forEach(([key, value]) => {
        if (!pathParamKeys.includes(key))
          queryParams[key] = value;
      });
      return defaultConfig.queryHandler.stringify(queryParams)
    }

    /**
    * @callback GotoHelper
    * @param {String=} path
    * @param {UrlParams=} params
    * @param {GotoOptions=} options
    *
    * @typedef {import('svelte/store').Readable<GotoHelper>}  GotoHelperStore
    * @type {GotoHelperStore} 
    * */
    const goto = {
      subscribe(listener) {
        return derived(url,
          url => function goto(path, params, _static, shallow) {
            const href = url(path, params);
            if (!_static) history.pushState({}, null, href);
            else getContext('routifyupdatepage')(href, shallow);
          }
        ).subscribe(
          listener
        )
      },
    };

    /**
     * @type {GotoHelperStore} 
     * */
    const redirect = {
      subscribe(listener) {
        return derived(url,
          url => function redirect(path, params, _static, shallow) {
            const href = url(path, params);
            if (!_static) history.replaceState({}, null, href);
            else getContext('routifyupdatepage')(href, shallow);
          }
        ).subscribe(
          listener
        )
      },
    };

    /**
     * @callback IsActiveHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @returns {Boolean}
     * 
     * @typedef {import('svelte/store').Readable<IsActiveHelper>} IsActiveHelperStore
     * @type {IsActiveHelperStore} 
     * */
    const isActive = {
      subscribe(run) {
        return derived(
          [url, route],
          ([url, route]) => function isActive(path = "", params = {}, { strict } = { strict: true }) {
            path = url(path, null, { strict });
            const currentPath = url(route.path, null, { strict });
            const re = new RegExp('^' + path + '($|/)');
            return !!currentPath.match(re)
          }
        ).subscribe(run)
      },
    };

    /**
     * @param {string|ClientNodeApi} path 
     * @param {*} options 
     */
    function prefetch$1(path, options) {
      prefetch(path, options);
    }

    /**
     * @typedef {[ClientNodeApi, ClientNodeApi, ClientNodeApi]} ConcestorReturn
     * @typedef {function(ClientNodeApi, ClientNodeApi):ConcestorReturn} GetConcestor
     * @type {GetConcestor}
     */
    function getConcestor(nodeApi1, nodeApi2) {
      const node1 = nodeApi1.__file;
      const node2 = nodeApi2.__file;

      // The route is the last piece of layout
      const lineage1 = [...node1.lineage, node1];
      const lineage2 = [...node2.lineage, node2];

      let concestor = lineage1[0]; //root
      let children = [lineage1[0].api, lineage2[0].api];
      // iterate through the layouts starting from the root
      lineage1.forEach((n1, i) => {
        const n2 = lineage2[i];
        if (n2 && n1.parent === n2.parent) {
          concestor = n1.parent;
          children = [n1.api, n2.api];
        }
      });
      return [concestor.api, children[0], children[1]]
    }



    const _metatags = {
      props: {},
      templates: {},
      services: {
        plain: { propField: 'name', valueField: 'content' },
        twitter: { propField: 'name', valueField: 'content' },
        og: { propField: 'property', valueField: 'content' },
      },
      plugins: [
        {
          name: 'applyTemplate',
          condition: () => true,
          action: (prop, value) => {
            const template = _metatags.getLongest(_metatags.templates, prop) || (x => x);
            return [prop, template(value)]
          }
        },
        {
          name: 'createMeta',
          condition: () => true,
          action(prop, value) {
            _metatags.writeMeta(prop, value);
          }
        },
        {
          name: 'createOG',
          condition: prop => !prop.match(':'),
          action(prop, value) {
            _metatags.writeMeta(`og:${prop}`, value);
          }
        },
        {
          name: 'createTitle',
          condition: prop => prop === 'title',
          action(prop, value) {
            document.title = value;
          }
        }
      ],
      getLongest(repo, name) {
        const providers = repo[name];
        if (providers) {
          const currentPath = get_store_value(route).path;
          const allPaths = Object.keys(repo[name]);
          const matchingPaths = allPaths.filter(path => currentPath.includes(path));

          const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

          return providers[longestKey]
        }
      },
      writeMeta(prop, value) {
        const head = document.getElementsByTagName('head')[0];
        const match = prop.match(/(.+)\:/);
        const serviceName = match && match[1] || 'plain';
        const { propField, valueField } = metatags.services[serviceName] || metatags.services.plain;
        const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
        if (oldElement) oldElement.remove();

        const newElement = document.createElement('meta');
        newElement.setAttribute(propField, prop);
        newElement.setAttribute(valueField, value);
        newElement.setAttribute('data-origin', 'routify');
        head.appendChild(newElement);
      },
      set(prop, value) {
        _metatags.plugins.forEach(plugin => {
          if (plugin.condition(prop, value))
            [prop, value] = plugin.action(prop, value) || [prop, value];
        });
      },
      clear() {
        const oldElement = document.querySelector(`meta`);
        if (oldElement) oldElement.remove();
      },
      template(name, fn) {
        const origin = _metatags.getOrigin();
        _metatags.templates[name] = _metatags.templates[name] || {};
        _metatags.templates[name][origin] = fn;
      },
      update() {
        Object.keys(_metatags.props).forEach((prop) => {
          let value = (_metatags.getLongest(_metatags.props, prop));
          _metatags.plugins.forEach(plugin => {
            if (plugin.condition(prop, value)) {
              [prop, value] = plugin.action(prop, value) || [prop, value];

            }
          });
        });
      },
      batchedUpdate() {
        if (!_metatags._pendingUpdate) {
          _metatags._pendingUpdate = true;
          setTimeout(() => {
            _metatags._pendingUpdate = false;
            this.update();
          });
        }
      },
      _updateQueued: false,
      getOrigin() {
        const routifyCtx = getRoutifyContext();
        return routifyCtx && get_store_value(routifyCtx).path || '/'
      },
      _pendingUpdate: false
    };


    /**
     * metatags
     * @prop {Object.<string, string>}
     */
    const metatags = new Proxy(_metatags, {
      set(target, name, value, receiver) {
        const { props, getOrigin } = target;

        if (Reflect.has(target, name))
          Reflect.set(target, name, value, receiver);
        else {
          props[name] = props[name] || {};
          props[name][getOrigin()] = value;
        }

        if (window['routify'].appLoaded)
          target.batchedUpdate();
        return true
      }
    });

    const isChangingPage = (function () {
      const store = writable(false);
      beforeUrlChange.subscribe(fn => fn(event => {
        store.set(true);
        return true
      }));
      
      afterPageLoad.subscribe(fn => fn(event => store.set(false)));

      return store
    })();

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.29.0 */
    const file$1 = "node_modules/@sveltech/routify/runtime/Route.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    // (120:0) {#if $context}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$context*/ ctx[6].component.isLayout === false) return 0;
    		if (/*remainingLayouts*/ ctx[5].length) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(120:0) {#if $context}",
    		ctx
    	});

    	return block;
    }

    // (132:36) 
    function create_if_block_3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout, remainingLayouts, decorator, Decorator, scopeToChild*/ 100663415) {
    				const each_value_1 = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(132:36) ",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if $context.component.isLayout === false}
    function create_if_block_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout*/ 85) {
    				const each_value = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(121:2) {#if $context.component.isLayout === false}",
    		ctx
    	});

    	return block;
    }

    // (134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>
    function create_default_slot(ctx) {
    	let route_1;
    	let t;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[5]],
    				Decorator: typeof /*decorator*/ ctx[26] !== "undefined"
    				? /*decorator*/ ctx[26]
    				: /*Decorator*/ ctx[1],
    				childOfDecorator: /*layout*/ ctx[4].isDecorator,
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[25]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 32) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[5]];

    			if (dirty & /*decorator, Decorator*/ 67108866) route_1_changes.Decorator = typeof /*decorator*/ ctx[26] !== "undefined"
    			? /*decorator*/ ctx[26]
    			: /*Decorator*/ ctx[1];

    			if (dirty & /*layout*/ 16) route_1_changes.childOfDecorator = /*layout*/ ctx[4].isDecorator;

    			if (dirty & /*scoped, scopeToChild*/ 33554433) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[25]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>",
    		ctx
    	});

    	return block;
    }

    // (133:4) {#each [$context] as { component, componentFile }
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 25: scopeToChild, 26: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 33554432 : 0) | (decorator ? 67108864 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, layout, scoped, scopeToChild*/ 234881075) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(133:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#each [$context] as { component, componentFile }
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(122:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (152:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$1, 152, 2, 4450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(setParent_action = /*setParent*/ ctx[8].call(null, span));
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(152:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*$context*/ ctx[6] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$context*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$context*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[3]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $route;
    	let $context;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(14, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, []);
    	let { layouts = [] } = $$props;
    	let { scoped = {} } = $$props;
    	let { Decorator = null } = $$props;
    	let { childOfDecorator = false } = $$props;
    	let { isRoot = false } = $$props;
    	let scopedSync = {};
    	let isDecorator = false;

    	/** @type {HTMLElement} */
    	let parentElement;

    	/** @type {LayoutOrDecorator} */
    	let layout = null;

    	/** @type {LayoutOrDecorator} */
    	let lastLayout = null;

    	/** @type {LayoutOrDecorator[]} */
    	let remainingLayouts = [];

    	const context = writable(null);
    	validate_store(context, "context");
    	component_subscribe($$self, context, value => $$invalidate(6, $context = value));

    	/** @type {import("svelte/store").Writable<Context>} */
    	const parentContextStore = getContext("routify");

    	isDecorator = Decorator && !childOfDecorator;
    	setContext("routify", context);

    	/** @param {HTMLElement} el */
    	function setParent(el) {
    		$$invalidate(3, parentElement = el.parentElement);
    	}

    	/** @param {SvelteComponent} componentFile */
    	function onComponentLoaded(componentFile) {
    		/** @type {Context} */
    		const parentContext = get_store_value(parentContextStore);

    		$$invalidate(2, scopedSync = { ...scoped });
    		lastLayout = layout;
    		if (remainingLayouts.length === 0) onLastComponentLoaded();

    		const ctx = {
    			layout: isDecorator ? parentContext.layout : layout,
    			component: layout,
    			route: $route,
    			componentFile,
    			child: isDecorator
    			? parentContext.child
    			: get_store_value(context) && get_store_value(context).child
    		};

    		context.set(ctx);
    		if (isRoot) rootContext.set(ctx);

    		if (parentContext && !isDecorator) parentContextStore.update(store => {
    			store.child = layout || store.child;
    			return store;
    		});
    	}

    	/**  @param {LayoutOrDecorator} layout */
    	function setComponent(layout) {
    		let PendingComponent = layout.component();
    		if (PendingComponent instanceof Promise) PendingComponent.then(onComponentLoaded); else onComponentLoaded(PendingComponent);
    	}

    	async function onLastComponentLoaded() {
    		afterPageLoad._hooks.forEach(hook => hook(layout.api));
    		await tick();
    		handleScroll(parentElement);

    		if (!window["routify"].appLoaded) {
    			const pagePath = $context.component.path;
    			const routePath = $route.path;
    			const isOnCurrentRoute = pagePath === routePath; //maybe we're getting redirected

    			// Let everyone know the last child has rendered
    			if (!window["routify"].stopAutoReady && isOnCurrentRoute) {
    				onAppLoaded({ path: pagePath, metatags });
    			}
    		}
    	}

    	const writable_props = ["layouts", "scoped", "Decorator", "childOfDecorator", "isRoot"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		get: get_store_value,
    		metatags,
    		afterPageLoad,
    		route,
    		routes,
    		rootContext,
    		handleScroll,
    		onAppLoaded,
    		layouts,
    		scoped,
    		Decorator,
    		childOfDecorator,
    		isRoot,
    		scopedSync,
    		isDecorator,
    		parentElement,
    		layout,
    		lastLayout,
    		remainingLayouts,
    		context,
    		parentContextStore,
    		setParent,
    		onComponentLoaded,
    		setComponent,
    		onLastComponentLoaded,
    		$route,
    		$context
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    		if ("scopedSync" in $$props) $$invalidate(2, scopedSync = $$props.scopedSync);
    		if ("isDecorator" in $$props) $$invalidate(12, isDecorator = $$props.isDecorator);
    		if ("parentElement" in $$props) $$invalidate(3, parentElement = $$props.parentElement);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    		if ("lastLayout" in $$props) lastLayout = $$props.lastLayout;
    		if ("remainingLayouts" in $$props) $$invalidate(5, remainingLayouts = $$props.remainingLayouts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isDecorator, Decorator, layouts*/ 4610) {
    			 if (isDecorator) {
    				const decoratorLayout = {
    					component: () => Decorator,
    					path: `${layouts[0].path}__decorator`,
    					isDecorator: true
    				};

    				$$invalidate(9, layouts = [decoratorLayout, ...layouts]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 512) {
    			 $$invalidate(4, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(5, remainingLayouts), $$invalidate(9, layouts)), $$invalidate(12, isDecorator)), $$invalidate(1, Decorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 16) {
    			 setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		scopedSync,
    		parentElement,
    		layout,
    		remainingLayouts,
    		$context,
    		context,
    		setParent,
    		layouts,
    		childOfDecorator,
    		isRoot
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			layouts: 9,
    			scoped: 0,
    			Decorator: 1,
    			childOfDecorator: 10,
    			isRoot: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childOfDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childOfDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRoot() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRoot(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Route.$compile = {"vars":[{"name":"getContext","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"setContext","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"onDestroy","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"onMount","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"tick","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"writable","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"get","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"metatags","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"afterPageLoad","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"route","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"routes","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"rootContext","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"handleScroll","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"onAppLoaded","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"layouts","export_name":"layouts","injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"scoped","export_name":"scoped","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"Decorator","export_name":"Decorator","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"childOfDecorator","export_name":"childOfDecorator","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"isRoot","export_name":"isRoot","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"scopedSync","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"isDecorator","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"parentElement","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"layout","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"lastLayout","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"remainingLayouts","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"context","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"parentContextStore","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"setParent","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"onComponentLoaded","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"setComponent","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"onLastComponentLoaded","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"$route","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$context","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    function init$1(routes, callback) {
      /** @type { ClientNode | false } */
      let lastRoute = false;

      function updatePage(proxyToUrl, shallow) {
        const url = proxyToUrl || currentLocation();
        const route$1 = urlToRoute(url);
        const currentRoute = shallow && urlToRoute(currentLocation());
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        if (lastRoute) delete lastRoute.last; //todo is a page component the right place for the previous route?
        route$1.last = lastRoute;
        lastRoute = route$1;

        //set the route in the store
        if (!proxyToUrl)
          urlRoute.set(route$1);
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      const destroy = createEventListeners(updatePage);

      return { updatePage, destroy }
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state = {}, title, url) {
          const { id, path, params } = get_store_value(route);
          state = { id, path, params, ...state };
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      let _ignoreNextPop = false;

      const listeners = {
        click: handleClick,
        pushstate: () => updatePage(),
        replacestate: () => updatePage(),
        popstate: async event => {
          if (_ignoreNextPop)
            _ignoreNextPop = false;
          else {
            if (await runHooksBeforeUrlChange(event)) {
              updatePage();
            } else {
              _ignoreNextPop = true;
              event.preventDefault();
              history.go(1);
            }
          }
        },
      };

      Object.entries(listeners).forEach(args => addEventListener(...args));

      const unregister = () => {
        Object.entries(listeners).forEach(args => removeEventListener(...args));
      };

      return unregister
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of beforeUrlChange._hooks.filter(Boolean)) {
        // return false if the hook returns false
        const result = await hook(event, route$1); //todo remove route from hook. Its API Can be accessed as $page
        if (!result) return false
      }
      return true
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1$1 } = globals;

    // (64:0) {#if layouts && $route !== null}
    function create_if_block$1(ctx) {
    	let route_1;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: /*layouts*/ ctx[0],
    				isRoot: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*layouts*/ 1) route_1_changes.layouts = /*layouts*/ ctx[0];
    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(64:0) {#if layouts && $route !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let prefetcher;
    	let current;
    	let if_block = /*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null && create_if_block$1(ctx);
    	prefetcher = new Prefetcher({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(prefetcher.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(prefetcher, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*layouts, $route*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
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
    			transition_in(prefetcher.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(prefetcher.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(prefetcher, detaching);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes: routes$1 } = $$props;
    	let { config = {} } = $$props;
    	let layouts;
    	let navigator;
    	window.routify = window.routify || {};
    	window.routify.inBrowser = !window.navigator.userAgent.match("jsdom");

    	Object.entries(config).forEach(([key, value]) => {
    		defaultConfig[key] = value;
    	});

    	suppressWarnings();
    	const updatePage = (...args) => navigator && navigator.updatePage(...args);
    	setContext("routifyupdatepage", updatePage);
    	const callback = res => $$invalidate(0, layouts = res);

    	const cleanup = () => {
    		if (!navigator) return;
    		navigator.destroy();
    		navigator = null;
    	};

    	let initTimeout = null;

    	// init is async to prevent a horrible bug that completely disable reactivity
    	// in the host component -- something like the component's update function is
    	// called before its fragment is created, and since the component is then seen
    	// as already dirty, it is never scheduled for update again, and remains dirty
    	// forever... I failed to isolate the precise conditions for the bug, but the
    	// faulty update is triggered by a change in the route store, and so offseting
    	// store initialization by one tick gives the host component some time to
    	// create its fragment. The root cause it probably a bug in Svelte with deeply
    	// intertwinned store and reactivity.
    	const doInit = () => {
    		clearTimeout(initTimeout);

    		initTimeout = setTimeout(() => {
    			cleanup();
    			navigator = init$1(routes$1, callback);
    			routes.set(routes$1);
    			navigator.updatePage();
    		});
    	};

    	onDestroy(cleanup);
    	const writable_props = ["routes", "config"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onDestroy,
    		Route,
    		Prefetcher,
    		init: init$1,
    		route,
    		routesStore: routes,
    		prefetchPath,
    		suppressWarnings,
    		defaultConfig,
    		routes: routes$1,
    		config,
    		layouts,
    		navigator,
    		updatePage,
    		callback,
    		cleanup,
    		initTimeout,
    		doInit,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ("navigator" in $$props) navigator = $$props.navigator;
    		if ("initTimeout" in $$props) initTimeout = $$props.initTimeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes*/ 4) {
    			 if (routes$1) doInit();
    		}
    	};

    	return [layouts, $route, routes$1, config];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { routes: 2, config: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[2] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Router.$compile = {"vars":[{"name":"setContext","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"onDestroy","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"Route","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Prefetcher","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"init","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"route","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"routesStore","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"prefetchPath","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"suppressWarnings","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"defaultConfig","export_name":null,"injected":false,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"routes","export_name":"routes","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"config","export_name":"config","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"layouts","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"navigator","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"updatePage","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"callback","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"cleanup","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"initTimeout","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"doInit","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"$route","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /** 
     * Node payload
     * @typedef {Object} NodePayload
     * @property {RouteNode=} file current node
     * @property {RouteNode=} parent parent of the current node
     * @property {StateObject=} state state shared by every node in the walker
     * @property {Object=} scope scope inherited by descendants in the scope
     *
     * State Object
     * @typedef {Object} StateObject
     * @prop {TreePayload=} treePayload payload from the tree
     * 
     * Node walker proxy
     * @callback NodeWalkerProxy
     * @param {NodePayload} NodePayload
     */


    /**
     * Node middleware
     * @description Walks through the nodes of a tree
     * @example middleware = createNodeMiddleware(payload => {payload.file.name = 'hello'})(treePayload))
     * @param {NodeWalkerProxy} fn 
     */
    function createNodeMiddleware(fn) {

        /**    
         * NodeMiddleware payload receiver
         * @param {TreePayload} payload
         */
        const inner = async function execute(payload) {
            return await nodeMiddleware(payload.tree, fn, { state: { treePayload: payload } })
        };

        /**    
         * NodeMiddleware sync payload receiver
         * @param {TreePayload} payload
         */
        inner.sync = function executeSync(payload) {
            return nodeMiddlewareSync(payload.tree, fn, { state: { treePayload: payload } })
        };

        return inner
    }

    /**
     * Node walker
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    async function nodeMiddleware(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        await fn(payload);

        if (file.children) {
            payload.parent = file;
            await Promise.all(file.children.map(_file => nodeMiddleware(_file, fn, payload)));
        }
        return payload
    }

    /**
     * Node walker (sync version)
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    function nodeMiddlewareSync(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        fn(payload);

        if (file.children) {
            payload.parent = file;
            file.children.map(_file => nodeMiddlewareSync(_file, fn, payload));
        }
        return payload
    }


    /**
     * Clone with JSON
     * @param {T} obj 
     * @returns {T} JSON cloned object
     * @template T
     */
    function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

    const setRegex = createNodeMiddleware(({ file }) => {
        if (file.isPage || file.isFallback)
            file.regex = pathToRegex(file.path, file.isFallback);
    });
    const setParamKeys = createNodeMiddleware(({ file }) => {
        file.paramKeys = pathToParamKeys(file.path);
    });

    const setShortPath = createNodeMiddleware(({ file }) => {
        if (file.isFallback || file.isIndex)
            file.shortPath = file.path.replace(/\/[^/]+$/, '');
        else file.shortPath = file.path;
    });
    const setRank = createNodeMiddleware(({ file }) => {
        file.ranking = pathToRank(file);
    });


    // todo delete?
    const addMetaChildren = createNodeMiddleware(({ file }) => {
        const node = file;
        const metaChildren = file.meta && file.meta.children || [];
        if (metaChildren.length) {
            node.children = node.children || [];
            node.children.push(...metaChildren.map(meta => ({ isMeta: true, ...meta, meta })));
        }
    });

    const setIsIndexable = createNodeMiddleware(payload => {
        const { file } = payload;
        const { isLayout, isFallback, meta } = file;
        file.isIndexable = !isLayout && !isFallback && meta.index !== false;
        file.isNonIndexable = !file.isIndexable;
    });


    const assignRelations = createNodeMiddleware(({ file, parent }) => {
        Object.defineProperty(file, 'parent', { get: () => parent });
        Object.defineProperty(file, 'nextSibling', { get: () => _getSibling(file, 1) });
        Object.defineProperty(file, 'prevSibling', { get: () => _getSibling(file, -1) });
        Object.defineProperty(file, 'lineage', { get: () => _getLineage(parent) });
    });

    function _getLineage(node, lineage = []){
        if(node){
            lineage.unshift(node);
            _getLineage(node.parent, lineage);
        }
        return lineage
    }

    /**
     * 
     * @param {RouteNode} file 
     * @param {Number} direction 
     */
    function _getSibling(file, direction) {
        if (!file.root) {
            const siblings = file.parent.children.filter(c => c.isIndexable);
            const index = siblings.indexOf(file);
            return siblings[index + direction]
        }
    }

    const assignIndex = createNodeMiddleware(({ file, parent }) => {
        if (file.isIndex) Object.defineProperty(parent, 'index', { get: () => file });
        if (file.isLayout)
            Object.defineProperty(parent, 'layout', { get: () => file });
    });

    const assignLayout = createNodeMiddleware(({ file, scope }) => {
        Object.defineProperty(file, 'layouts', { get: () => getLayouts(file) });
        function getLayouts(file) {
            const { parent } = file;
            const layout = parent && parent.layout;
            const isReset = layout && layout.isReset;
            const layouts = (parent && !isReset && getLayouts(parent)) || [];
            if (layout) layouts.push(layout);
            return layouts
        }
    });


    const createFlatList = treePayload => {
        createNodeMiddleware(payload => {
            if (payload.file.isPage || payload.file.isFallback)
            payload.state.treePayload.routes.push(payload.file);
        }).sync(treePayload);    
        treePayload.routes.sort((c, p) => (c.ranking >= p.ranking ? -1 : 1));
    };

    const setPrototype = createNodeMiddleware(({ file }) => {
        const Prototype = file.root
            ? Root
            : file.children
                ? file.isFile ? PageDir : Dir
                : file.isReset
                    ? Reset
                    : file.isLayout
                        ? Layout
                        : file.isFallback
                            ? Fallback
                            : Page;
        Object.setPrototypeOf(file, Prototype.prototype);

        function Layout() { }
        function Dir() { }
        function Fallback() { }
        function Page() { }
        function PageDir() { }
        function Reset() { }
        function Root() { }
    });

    var miscPlugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setRegex: setRegex,
        setParamKeys: setParamKeys,
        setShortPath: setShortPath,
        setRank: setRank,
        addMetaChildren: addMetaChildren,
        setIsIndexable: setIsIndexable,
        assignRelations: assignRelations,
        assignIndex: assignIndex,
        assignLayout: assignLayout,
        createFlatList: createFlatList,
        setPrototype: setPrototype
    });

    const assignAPI = createNodeMiddleware(({ file }) => {
        file.api = new ClientApi(file);
    });

    class ClientApi {
        constructor(file) {
            this.__file = file;
            Object.defineProperty(this, '__file', { enumerable: false });
            this.isMeta = !!file.isMeta;
            this.path = file.path;
            this.title = _prettyName(file);
            this.meta = file.meta;
        }

        get parent() { return !this.__file.root && this.__file.parent.api }
        get children() {
            return (this.__file.children || this.__file.isLayout && this.__file.parent.children || [])
                .filter(c => !c.isNonIndexable)
                .sort((a, b) => {
                    if(a.isMeta && b.isMeta) return 0
                    a = (a.meta.index || a.meta.title || a.path).toString();
                    b = (b.meta.index || b.meta.title || b.path).toString();
                    return a.localeCompare((b), undefined, { numeric: true, sensitivity: 'base' })
                })
                .map(({ api }) => api)
        }
        get next() { return _navigate(this, +1) }
        get prev() { return _navigate(this, -1) }
        preload() {
            this.__file.layouts.forEach(file => file.component());
            this.__file.component(); 
        }
    }

    function _navigate(node, direction) {
        if (!node.__file.root) {
            const siblings = node.parent.children;
            const index = siblings.indexOf(node);
            return node.parent.children[index + direction]
        }
    }


    function _prettyName(file) {
        if (typeof file.meta.title !== 'undefined') return file.meta.title
        else return (file.shortPath || file.path)
            .split('/')
            .pop()
            .replace(/-/g, ' ')
    }

    const plugins = {...miscPlugins, assignAPI};

    function buildClientTree(tree) {
      const order = [
        // pages
        "setParamKeys", //pages only
        "setRegex", //pages only
        "setShortPath", //pages only
        "setRank", //pages only
        "assignLayout", //pages only,
        // all
        "setPrototype",
        "addMetaChildren",
        "assignRelations", //all (except meta components?)
        "setIsIndexable", //all
        "assignIndex", //all
        "assignAPI", //all
        // routes
        "createFlatList"
      ];

      const payload = { tree, routes: [] };
      for (let name of order) {
        const syncFn = plugins[name].sync || plugins[name];
        syncFn(payload);
      }
      return payload
    }

    //tree
    const _tree = {
      "name": "root",
      "filepath": "/",
      "root": true,
      "ownMeta": {},
      "absolutePath": "src/pages",
      "children": [
        {
          "isFile": true,
          "isDir": false,
          "file": "_fallback.svelte",
          "filepath": "/_fallback.svelte",
          "name": "_fallback",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/_fallback.svelte",
          "importPath": "../src/pages/_fallback.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": true,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/_fallback",
          "id": "__fallback",
          "component": () => Promise.resolve().then(function () { return _fallback; }).then(m => m.default)
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "_layout.svelte",
          "filepath": "/_layout.svelte",
          "name": "_layout",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/_layout.svelte",
          "importPath": "../src/pages/_layout.svelte",
          "isLayout": true,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/",
          "id": "__layout",
          "component": () => Promise.resolve().then(function () { return _layout; }).then(m => m.default)
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "example",
          "filepath": "/example",
          "name": "example",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "_fallback.svelte",
              "filepath": "/example/_fallback.svelte",
              "name": "_fallback",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/_fallback.svelte",
              "importPath": "../src/pages/example/_fallback.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": true,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/_fallback",
              "id": "_example__fallback",
              "component": () => Promise.resolve().then(function () { return _fallback$1; }).then(m => m.default)
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "_reset.svelte",
              "filepath": "/example/_reset.svelte",
              "name": "_reset",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/_reset.svelte",
              "importPath": "../src/pages/example/_reset.svelte",
              "isLayout": true,
              "isReset": true,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example",
              "id": "_example__reset",
              "component": () => Promise.resolve().then(function () { return _reset; }).then(m => m.default)
            },
            {
              "isFile": false,
              "isDir": true,
              "file": "aliasing",
              "filepath": "/example/aliasing",
              "name": "aliasing",
              "ext": "",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_layout.svelte",
                  "filepath": "/example/aliasing/_layout.svelte",
                  "name": "_layout",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/_layout.svelte",
                  "importPath": "../src/pages/example/aliasing/_layout.svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing",
                  "id": "_example_aliasing__layout",
                  "component": () => Promise.resolve().then(function () { return _layout$1; }).then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "index.svelte",
                  "filepath": "/example/aliasing/index.svelte",
                  "name": "index",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/index.svelte",
                  "importPath": "../src/pages/example/aliasing/index.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/index",
                  "id": "_example_aliasing_index",
                  "component": () => Promise.resolve().then(function () { return index; }).then(m => m.default)
                },
                {
                  "isFile": false,
                  "isDir": true,
                  "file": "v1",
                  "filepath": "/example/aliasing/v1",
                  "name": "v1",
                  "ext": "",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "_layout.svelte",
                      "filepath": "/example/aliasing/v1/_layout.svelte",
                      "name": "_layout",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1/_layout.svelte",
                      "importPath": "../src/pages/example/aliasing/v1/_layout.svelte",
                      "isLayout": true,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1",
                      "id": "_example_aliasing_v1__layout",
                      "component": () => Promise.resolve().then(function () { return _layout$2; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "feature1.svelte",
                      "filepath": "/example/aliasing/v1/feature1.svelte",
                      "name": "feature1",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1/feature1.svelte",
                      "importPath": "../src/pages/example/aliasing/v1/feature1.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1/feature1",
                      "id": "_example_aliasing_v1_feature1",
                      "component": () => Promise.resolve().then(function () { return feature1; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "feature2.svelte",
                      "filepath": "/example/aliasing/v1/feature2.svelte",
                      "name": "feature2",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1/feature2.svelte",
                      "importPath": "../src/pages/example/aliasing/v1/feature2.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1/feature2",
                      "id": "_example_aliasing_v1_feature2",
                      "component": () => Promise.resolve().then(function () { return feature2; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "feature3.svelte",
                      "filepath": "/example/aliasing/v1/feature3.svelte",
                      "name": "feature3",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1/feature3.svelte",
                      "importPath": "../src/pages/example/aliasing/v1/feature3.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1/feature3",
                      "id": "_example_aliasing_v1_feature3",
                      "component": () => Promise.resolve().then(function () { return feature3; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "index.svelte",
                      "filepath": "/example/aliasing/v1/index.svelte",
                      "name": "index",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1/index.svelte",
                      "importPath": "../src/pages/example/aliasing/v1/index.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1/index",
                      "id": "_example_aliasing_v1_index",
                      "component": () => Promise.resolve().then(function () { return index$1; }).then(m => m.default)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1"
                },
                {
                  "isFile": false,
                  "isDir": true,
                  "file": "v1.1",
                  "filepath": "/example/aliasing/v1.1",
                  "name": "v1.1",
                  "ext": "",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1.1",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "_fallback.svelte",
                      "filepath": "/example/aliasing/v1.1/_fallback.svelte",
                      "name": "_fallback",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1.1/_fallback.svelte",
                      "importPath": "../src/pages/example/aliasing/v1.1/_fallback.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": true,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1.1/_fallback",
                      "id": "_example_aliasing_v1_1__fallback",
                      "component": () => Promise.resolve().then(function () { return _fallback$2; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "_layout.svelte",
                      "filepath": "/example/aliasing/v1.1/_layout.svelte",
                      "name": "_layout",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1.1/_layout.svelte",
                      "importPath": "../src/pages/example/aliasing/v1.1/_layout.svelte",
                      "isLayout": true,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1.1",
                      "id": "_example_aliasing_v1_1__layout",
                      "component": () => Promise.resolve().then(function () { return _layout$3; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "feature2.svelte",
                      "filepath": "/example/aliasing/v1.1/feature2.svelte",
                      "name": "feature2",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1.1/feature2.svelte",
                      "importPath": "../src/pages/example/aliasing/v1.1/feature2.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1.1/feature2",
                      "id": "_example_aliasing_v1_1_feature2",
                      "component": () => Promise.resolve().then(function () { return feature2$1; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "index.svelte",
                      "filepath": "/example/aliasing/v1.1/index.svelte",
                      "name": "index",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/aliasing/v1.1/index.svelte",
                      "importPath": "../src/pages/example/aliasing/v1.1/index.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/aliasing/v1.1/index",
                      "id": "_example_aliasing_v1_1_index",
                      "component": () => Promise.resolve().then(function () { return index$2; }).then(m => m.default)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/aliasing/v1.1"
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/aliasing"
            },
            {
              "isFile": false,
              "isDir": true,
              "file": "api",
              "filepath": "/example/api",
              "name": "api",
              "ext": "",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/api",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_layout.svelte",
                  "filepath": "/example/api/_layout.svelte",
                  "name": "_layout",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/api/_layout.svelte",
                  "importPath": "../src/pages/example/api/_layout.svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/api",
                  "id": "_example_api__layout",
                  "component": () => Promise.resolve().then(function () { return _layout$4; }).then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "[showId].svelte",
                  "filepath": "/example/api/[showId].svelte",
                  "name": "[showId]",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/api/[showId].svelte",
                  "importPath": "../src/pages/example/api/[showId].svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/api/:showId",
                  "id": "_example_api__showId",
                  "component": () => Promise.resolve().then(function () { return _showId_; }).then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "index.svelte",
                  "filepath": "/example/api/index.svelte",
                  "name": "index",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/api/index.svelte",
                  "importPath": "../src/pages/example/api/index.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/api/index",
                  "id": "_example_api_index",
                  "component": () => Promise.resolve().then(function () { return index$3; }).then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/api"
            },
            {
              "isFile": false,
              "isDir": true,
              "file": "app",
              "filepath": "/example/app",
              "name": "app",
              "ext": "",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/app",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_fallback.svelte",
                  "filepath": "/example/app/_fallback.svelte",
                  "name": "_fallback",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/app/_fallback.svelte",
                  "importPath": "../src/pages/example/app/_fallback.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": true,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/app/_fallback",
                  "id": "_example_app__fallback",
                  "component": () => Promise.resolve().then(function () { return _fallback$3; }).then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_reset.svelte",
                  "filepath": "/example/app/_reset.svelte",
                  "name": "_reset",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/app/_reset.svelte",
                  "importPath": "../src/pages/example/app/_reset.svelte",
                  "isLayout": true,
                  "isReset": true,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/app",
                  "id": "_example_app__reset",
                  "component": () => Promise.resolve().then(function () { return _reset$1; }).then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "index.svelte",
                  "filepath": "/example/app/index.svelte",
                  "name": "index",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/app/index.svelte",
                  "importPath": "../src/pages/example/app/index.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/app/index",
                  "id": "_example_app_index",
                  "component": () => Promise.resolve().then(function () { return index$4; }).then(m => m.default)
                },
                {
                  "isFile": false,
                  "isDir": true,
                  "file": "login",
                  "filepath": "/example/app/login",
                  "name": "login",
                  "ext": "",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/app/login",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "_reset.svelte",
                      "filepath": "/example/app/login/_reset.svelte",
                      "name": "_reset",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/app/login/_reset.svelte",
                      "importPath": "../src/pages/example/app/login/_reset.svelte",
                      "isLayout": true,
                      "isReset": true,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/app/login",
                      "id": "_example_app_login__reset",
                      "component": () => Promise.resolve().then(function () { return _reset$2; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "index.svelte",
                      "filepath": "/example/app/login/index.svelte",
                      "name": "index",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/app/login/index.svelte",
                      "importPath": "../src/pages/example/app/login/index.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/app/login/index",
                      "id": "_example_app_login_index",
                      "component": () => Promise.resolve().then(function () { return index$5; }).then(m => m.default)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/app/login"
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/app"
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/example/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/index.svelte",
              "importPath": "../src/pages/example/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/index",
              "id": "_example_index",
              "component": () => Promise.resolve().then(function () { return index$6; }).then(m => m.default)
            },
            {
              "isFile": false,
              "isDir": true,
              "file": "layouts",
              "filepath": "/example/layouts",
              "name": "layouts",
              "ext": "",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_layout.svelte",
                  "filepath": "/example/layouts/_layout.svelte",
                  "name": "_layout",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts/_layout.svelte",
                  "importPath": "../src/pages/example/layouts/_layout.svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/layouts",
                  "id": "_example_layouts__layout",
                  "component": () => Promise.resolve().then(function () { return _layout$5; }).then(m => m.default)
                },
                {
                  "isFile": false,
                  "isDir": true,
                  "file": "child",
                  "filepath": "/example/layouts/child",
                  "name": "child",
                  "ext": "",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts/child",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "_layout.svelte",
                      "filepath": "/example/layouts/child/_layout.svelte",
                      "name": "_layout",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts/child/_layout.svelte",
                      "importPath": "../src/pages/example/layouts/child/_layout.svelte",
                      "isLayout": true,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/layouts/child",
                      "id": "_example_layouts_child__layout",
                      "component": () => Promise.resolve().then(function () { return _layout$6; }).then(m => m.default)
                    },
                    {
                      "isFile": false,
                      "isDir": true,
                      "file": "grandchild",
                      "filepath": "/example/layouts/child/grandchild",
                      "name": "grandchild",
                      "ext": "",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts/child/grandchild",
                      "children": [
                        {
                          "isFile": true,
                          "isDir": false,
                          "file": "_layout.svelte",
                          "filepath": "/example/layouts/child/grandchild/_layout.svelte",
                          "name": "_layout",
                          "ext": "svelte",
                          "badExt": false,
                          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts/child/grandchild/_layout.svelte",
                          "importPath": "../src/pages/example/layouts/child/grandchild/_layout.svelte",
                          "isLayout": true,
                          "isReset": false,
                          "isIndex": false,
                          "isFallback": false,
                          "isPage": false,
                          "ownMeta": {},
                          "meta": {
                            "preload": false,
                            "prerender": true,
                            "precache-order": false,
                            "precache-proximity": true,
                            "recursive": true
                          },
                          "path": "/example/layouts/child/grandchild",
                          "id": "_example_layouts_child_grandchild__layout",
                          "component": () => Promise.resolve().then(function () { return _layout$7; }).then(m => m.default)
                        },
                        {
                          "isFile": true,
                          "isDir": false,
                          "file": "index.svelte",
                          "filepath": "/example/layouts/child/grandchild/index.svelte",
                          "name": "index",
                          "ext": "svelte",
                          "badExt": false,
                          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts/child/grandchild/index.svelte",
                          "importPath": "../src/pages/example/layouts/child/grandchild/index.svelte",
                          "isLayout": false,
                          "isReset": false,
                          "isIndex": true,
                          "isFallback": false,
                          "isPage": true,
                          "ownMeta": {},
                          "meta": {
                            "preload": false,
                            "prerender": true,
                            "precache-order": false,
                            "precache-proximity": true,
                            "recursive": true
                          },
                          "path": "/example/layouts/child/grandchild/index",
                          "id": "_example_layouts_child_grandchild_index",
                          "component": () => Promise.resolve().then(function () { return index$7; }).then(m => m.default)
                        }
                      ],
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/layouts/child/grandchild"
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "index.svelte",
                      "filepath": "/example/layouts/child/index.svelte",
                      "name": "index",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts/child/index.svelte",
                      "importPath": "../src/pages/example/layouts/child/index.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/layouts/child/index",
                      "id": "_example_layouts_child_index",
                      "component": () => Promise.resolve().then(function () { return index$8; }).then(m => m.default)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/layouts/child"
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "index.svelte",
                  "filepath": "/example/layouts/index.svelte",
                  "name": "index",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/layouts/index.svelte",
                  "importPath": "../src/pages/example/layouts/index.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/layouts/index",
                  "id": "_example_layouts_index",
                  "component": () => Promise.resolve().then(function () { return index$9; }).then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/layouts"
            },
            {
              "isFile": false,
              "isDir": true,
              "file": "modal",
              "filepath": "/example/modal",
              "name": "modal",
              "ext": "",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_layout.svelte",
                  "filepath": "/example/modal/_layout.svelte",
                  "name": "_layout",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/_layout.svelte",
                  "importPath": "../src/pages/example/modal/_layout.svelte",
                  "isLayout": true,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal",
                  "id": "_example_modal__layout",
                  "component": () => Promise.resolve().then(function () { return _layout$8; }).then(m => m.default)
                },
                {
                  "isFile": false,
                  "isDir": true,
                  "file": "animated",
                  "filepath": "/example/modal/animated",
                  "name": "animated",
                  "ext": "",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/animated",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "_layout.svelte",
                      "filepath": "/example/modal/animated/_layout.svelte",
                      "name": "_layout",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/animated/_layout.svelte",
                      "importPath": "../src/pages/example/modal/animated/_layout.svelte",
                      "isLayout": true,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/modal/animated",
                      "id": "_example_modal_animated__layout",
                      "component": () => Promise.resolve().then(function () { return _layout$9; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "[key].svelte",
                      "filepath": "/example/modal/animated/[key].svelte",
                      "name": "[key]",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/animated/[key].svelte",
                      "importPath": "../src/pages/example/modal/animated/[key].svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/modal/animated/:key",
                      "id": "_example_modal_animated__key",
                      "component": () => Promise.resolve().then(function () { return _key_; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "index.svelte",
                      "filepath": "/example/modal/animated/index.svelte",
                      "name": "index",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/animated/index.svelte",
                      "importPath": "../src/pages/example/modal/animated/index.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/modal/animated/index",
                      "id": "_example_modal_animated_index",
                      "component": () => Promise.resolve().then(function () { return index$a; }).then(m => m.default)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/animated"
                },
                {
                  "isFile": false,
                  "isDir": true,
                  "file": "basic",
                  "filepath": "/example/modal/basic",
                  "name": "basic",
                  "ext": "",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/basic",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "_layout.svelte",
                      "filepath": "/example/modal/basic/_layout.svelte",
                      "name": "_layout",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/basic/_layout.svelte",
                      "importPath": "../src/pages/example/modal/basic/_layout.svelte",
                      "isLayout": true,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/modal/basic",
                      "id": "_example_modal_basic__layout",
                      "component": () => Promise.resolve().then(function () { return _layout$a; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "[key].svelte",
                      "filepath": "/example/modal/basic/[key].svelte",
                      "name": "[key]",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/basic/[key].svelte",
                      "importPath": "../src/pages/example/modal/basic/[key].svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/modal/basic/:key",
                      "id": "_example_modal_basic__key",
                      "component": () => Promise.resolve().then(function () { return _key_$1; }).then(m => m.default)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "index.svelte",
                      "filepath": "/example/modal/basic/index.svelte",
                      "name": "index",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/basic/index.svelte",
                      "importPath": "../src/pages/example/modal/basic/index.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true
                      },
                      "path": "/example/modal/basic/index",
                      "id": "_example_modal_basic_index",
                      "component": () => Promise.resolve().then(function () { return index$b; }).then(m => m.default)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/basic"
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "index.svelte",
                  "filepath": "/example/modal/index.svelte",
                  "name": "index",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/modal/index.svelte",
                  "importPath": "../src/pages/example/modal/index.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/modal/index",
                  "id": "_example_modal_index",
                  "component": () => Promise.resolve().then(function () { return index$c; }).then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/modal"
            },
            {
              "isFile": false,
              "isDir": true,
              "file": "reset",
              "filepath": "/example/reset",
              "name": "reset",
              "ext": "",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/reset",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_fallback.svelte",
                  "filepath": "/example/reset/_fallback.svelte",
                  "name": "_fallback",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/reset/_fallback.svelte",
                  "importPath": "../src/pages/example/reset/_fallback.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": true,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/reset/_fallback",
                  "id": "_example_reset__fallback",
                  "component": () => Promise.resolve().then(function () { return _fallback$4; }).then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_reset.svelte",
                  "filepath": "/example/reset/_reset.svelte",
                  "name": "_reset",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/reset/_reset.svelte",
                  "importPath": "../src/pages/example/reset/_reset.svelte",
                  "isLayout": true,
                  "isReset": true,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/reset",
                  "id": "_example_reset__reset",
                  "component": () => Promise.resolve().then(function () { return _reset$3; }).then(m => m.default)
                },
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "index.svelte",
                  "filepath": "/example/reset/index.svelte",
                  "name": "index",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/reset/index.svelte",
                  "importPath": "../src/pages/example/reset/index.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": true,
                  "isFallback": false,
                  "isPage": true,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/reset/index",
                  "id": "_example_reset_index",
                  "component": () => Promise.resolve().then(function () { return index$d; }).then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/reset"
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "Splash.svelte",
              "filepath": "/example/Splash.svelte",
              "name": "Splash",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/Splash.svelte",
              "importPath": "../src/pages/example/Splash.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/Splash",
              "id": "_example_Splash",
              "component": () => Promise.resolve().then(function () { return Splash$1; }).then(m => m.default)
            },
            {
              "isFile": false,
              "isDir": true,
              "file": "transitions",
              "filepath": "/example/transitions",
              "name": "transitions",
              "ext": "",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions",
              "children": [
                {
                  "isFile": false,
                  "isDir": true,
                  "file": "tabs",
                  "filepath": "/example/transitions/tabs",
                  "name": "tabs",
                  "ext": "",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs",
                  "children": [
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "_reset.svelte",
                      "filepath": "/example/transitions/tabs/_reset.svelte",
                      "name": "_reset",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/_reset.svelte",
                      "importPath": "../src/pages/example/transitions/tabs/_reset.svelte",
                      "isLayout": true,
                      "isReset": true,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs",
                      "id": "_example_transitions_tabs__reset",
                      "component": () => Promise.resolve().then(function () { return _example_transitions_tabs; }).then(m => m._example_transitions_tabs__reset)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "home.svelte",
                      "filepath": "/example/transitions/tabs/home.svelte",
                      "name": "home",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/home.svelte",
                      "importPath": "../src/pages/example/transitions/tabs/home.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {
                        "index": 0
                      },
                      "meta": {
                        "index": 0,
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs/home",
                      "id": "_example_transitions_tabs_home",
                      "component": () => Promise.resolve().then(function () { return _example_transitions_tabs; }).then(m => m._example_transitions_tabs_home)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "index.svelte",
                      "filepath": "/example/transitions/tabs/index.svelte",
                      "name": "index",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/index.svelte",
                      "importPath": "../src/pages/example/transitions/tabs/index.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": true,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {},
                      "meta": {
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs/index",
                      "id": "_example_transitions_tabs_index",
                      "component": () => Promise.resolve().then(function () { return _example_transitions_tabs; }).then(m => m._example_transitions_tabs_index)
                    },
                    {
                      "isFile": false,
                      "isDir": true,
                      "file": "feed",
                      "filepath": "/example/transitions/tabs/feed",
                      "name": "feed",
                      "ext": "",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/feed",
                      "children": [
                        {
                          "isFile": true,
                          "isDir": false,
                          "file": "_layout.svelte",
                          "filepath": "/example/transitions/tabs/feed/_layout.svelte",
                          "name": "_layout",
                          "ext": "svelte",
                          "badExt": false,
                          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/feed/_layout.svelte",
                          "importPath": "../src/pages/example/transitions/tabs/feed/_layout.svelte",
                          "isLayout": true,
                          "isReset": false,
                          "isIndex": false,
                          "isFallback": false,
                          "isPage": false,
                          "ownMeta": {},
                          "meta": {
                            "preload": false,
                            "prerender": true,
                            "precache-order": false,
                            "precache-proximity": true,
                            "recursive": true,
                            "$$bundleId": "_example_transitions_tabs.js"
                          },
                          "path": "/example/transitions/tabs/feed",
                          "id": "_example_transitions_tabs_feed__layout",
                          "component": () => Promise.resolve().then(function () { return _example_transitions_tabs; }).then(m => m._example_transitions_tabs_feed__layout)
                        },
                        {
                          "isFile": false,
                          "isDir": true,
                          "file": "[id]",
                          "filepath": "/example/transitions/tabs/feed/[id]",
                          "name": "[id]",
                          "ext": "",
                          "badExt": false,
                          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/feed/[id]",
                          "children": [
                            {
                              "isFile": true,
                              "isDir": false,
                              "file": "index.svelte",
                              "filepath": "/example/transitions/tabs/feed/[id]/index.svelte",
                              "name": "index",
                              "ext": "svelte",
                              "badExt": false,
                              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/feed/[id]/index.svelte",
                              "importPath": "../src/pages/example/transitions/tabs/feed/[id]/index.svelte",
                              "isLayout": false,
                              "isReset": false,
                              "isIndex": true,
                              "isFallback": false,
                              "isPage": true,
                              "ownMeta": {},
                              "meta": {
                                "preload": false,
                                "prerender": true,
                                "precache-order": false,
                                "precache-proximity": true,
                                "recursive": true,
                                "$$bundleId": "_example_transitions_tabs.js"
                              },
                              "path": "/example/transitions/tabs/feed/:id/index",
                              "id": "_example_transitions_tabs_feed__id_index",
                              "component": () => Promise.resolve().then(function () { return _example_transitions_tabs; }).then(m => m._example_transitions_tabs_feed__id_index)
                            }
                          ],
                          "isLayout": false,
                          "isReset": false,
                          "isIndex": false,
                          "isFallback": false,
                          "isPage": false,
                          "ownMeta": {},
                          "meta": {
                            "preload": false,
                            "prerender": true,
                            "precache-order": false,
                            "precache-proximity": true,
                            "recursive": true,
                            "$$bundleId": "_example_transitions_tabs.js"
                          },
                          "path": "/example/transitions/tabs/feed/:id"
                        },
                        {
                          "isFile": true,
                          "isDir": false,
                          "file": "index.svelte",
                          "filepath": "/example/transitions/tabs/feed/index.svelte",
                          "name": "index",
                          "ext": "svelte",
                          "badExt": false,
                          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/feed/index.svelte",
                          "importPath": "../src/pages/example/transitions/tabs/feed/index.svelte",
                          "isLayout": false,
                          "isReset": false,
                          "isIndex": true,
                          "isFallback": false,
                          "isPage": true,
                          "ownMeta": {},
                          "meta": {
                            "preload": false,
                            "prerender": true,
                            "precache-order": false,
                            "precache-proximity": true,
                            "recursive": true,
                            "$$bundleId": "_example_transitions_tabs.js"
                          },
                          "path": "/example/transitions/tabs/feed/index",
                          "id": "_example_transitions_tabs_feed_index",
                          "component": () => Promise.resolve().then(function () { return _example_transitions_tabs; }).then(m => m._example_transitions_tabs_feed_index)
                        }
                      ],
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": false,
                      "ownMeta": {
                        "index": 1
                      },
                      "meta": {
                        "index": 1,
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs/feed"
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "updates.svelte",
                      "filepath": "/example/transitions/tabs/updates.svelte",
                      "name": "updates",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/updates.svelte",
                      "importPath": "../src/pages/example/transitions/tabs/updates.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {
                        "index": 2
                      },
                      "meta": {
                        "index": 2,
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs/updates",
                      "id": "_example_transitions_tabs_updates",
                      "component": () => Promise.resolve().then(function () { return _example_transitions_tabs; }).then(m => m._example_transitions_tabs_updates)
                    },
                    {
                      "isFile": true,
                      "isDir": false,
                      "file": "settings.svelte",
                      "filepath": "/example/transitions/tabs/settings.svelte",
                      "name": "settings",
                      "ext": "svelte",
                      "badExt": false,
                      "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/transitions/tabs/settings.svelte",
                      "importPath": "../src/pages/example/transitions/tabs/settings.svelte",
                      "isLayout": false,
                      "isReset": false,
                      "isIndex": false,
                      "isFallback": false,
                      "isPage": true,
                      "ownMeta": {
                        "index": 3
                      },
                      "meta": {
                        "index": 3,
                        "preload": false,
                        "prerender": true,
                        "precache-order": false,
                        "precache-proximity": true,
                        "recursive": true,
                        "$$bundleId": "_example_transitions_tabs.js"
                      },
                      "path": "/example/transitions/tabs/settings",
                      "id": "_example_transitions_tabs_settings",
                      "component": () => Promise.resolve().then(function () { return _example_transitions_tabs; }).then(m => m._example_transitions_tabs_settings)
                    }
                  ],
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": false,
                  "isPage": false,
                  "ownMeta": {
                    "bundle": true
                  },
                  "meta": {
                    "bundle": true,
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true,
                    "$$bundleId": "_example_transitions_tabs.js"
                  },
                  "path": "/example/transitions/tabs"
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/transitions"
            },
            {
              "isFile": false,
              "isDir": true,
              "file": "widget",
              "filepath": "/example/widget",
              "name": "widget",
              "ext": "",
              "badExt": false,
              "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/widget",
              "children": [
                {
                  "isFile": true,
                  "isDir": false,
                  "file": "_fallback.svelte",
                  "filepath": "/example/widget/_fallback.svelte",
                  "name": "_fallback",
                  "ext": "svelte",
                  "badExt": false,
                  "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/example/widget/_fallback.svelte",
                  "importPath": "../src/pages/example/widget/_fallback.svelte",
                  "isLayout": false,
                  "isReset": false,
                  "isIndex": false,
                  "isFallback": true,
                  "isPage": false,
                  "ownMeta": {},
                  "meta": {
                    "preload": false,
                    "prerender": true,
                    "precache-order": false,
                    "precache-proximity": true,
                    "recursive": true
                  },
                  "path": "/example/widget/_fallback",
                  "id": "_example_widget__fallback",
                  "component": () => Promise.resolve().then(function () { return _fallback$5; }).then(m => m.default)
                }
              ],
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": false,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/example/widget"
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/example"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "index.svelte",
          "filepath": "/index.svelte",
          "name": "index",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/bag-yeong-ung/Documents/projects/svelte-routify/src/pages/index.svelte",
          "importPath": "../src/pages/index.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/index",
          "id": "_index",
          "component": () => Promise.resolve().then(function () { return index$e; }).then(m => m.default)
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/"
    };


    const {tree, routes: routes$1} = buildClientTree(_tree);

    /* src/App.svelte generated by Svelte v3.29.0 */

    function create_fragment$3(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes: routes$1 }, $$inline: true });

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
    		p: noop,
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, routes: routes$1 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }
    App.$compile = {"vars":[{"name":"Router","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"routes","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    const app = HMR(App, { target: document.body }, 'routify-app');


    /** Service worker. Uncomment to use service worker */

    // if ('serviceWorker' in navigator) {
    //     import('workbox-window').then(async ({ Workbox }) => {
    //         const wb = new Workbox('/sw.js')
    //         const registration = await wb.register()
    //         wb.addEventListener('installed', () => (console.log('installed service worker')))
    //         wb.addEventListener('externalinstalled', () => (console.log('installed service worker')))  
    //     })
    // }

    /* src/pages/_fallback.svelte generated by Svelte v3.29.0 */
    const file$2 = "src/pages/_fallback.svelte";

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let a;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "4040404";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Page not found.\n    \n    ");
    			a = element("a");
    			t3 = text("Go back");
    			attr_dev(div0, "class", "huge svelte-ht28pc");
    			add_location(div0, file$2, 18, 2, 319);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("/"));
    			add_location(a, file$2, 22, 4, 454);
    			attr_dev(div1, "class", "big");
    			add_location(div1, file$2, 19, 2, 353);
    			attr_dev(div2, "class", "e404 svelte-ht28pc");
    			add_location(div2, file$2, 17, 0, 298);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("/"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Fallback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }
    Fallback.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _fallback = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Fallback
    });

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue$1 = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue$1 = currentQueue.concat(queue$1);
        } else {
            queueIndex = -1;
        }
        if (queue$1.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue$1.length;
        while(len) {
            currentQueue = queue$1;
            queue$1 = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue$1.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue$1.push(new Item(fun, args));
        if (queue$1.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
    var inited = false;
    function init$2 () {
      inited = true;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
    }

    function toByteArray (b64) {
      if (!inited) {
        init$2();
      }
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = (tmp >> 16) & 0xFF;
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      if (!inited) {
        init$2();
      }
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[(tmp << 4) & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
        output += lookup[tmp >> 10];
        output += lookup[(tmp >> 4) & 0x3F];
        output += lookup[(tmp << 2) & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('')
    }

    function read (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    function write (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    }

    var toString = {}.toString;

    var isArray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    var INSPECT_MAX_BYTES = 50;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.

     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
      ? global$1.TYPED_ARRAY_SUPPORT
      : true;

    /*
     * Export kMaxLength after typed array support is determined.
     */
    var _kMaxLength = kMaxLength();

    function kMaxLength () {
      return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }

    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length);
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer(length);
        }
        that.length = length;
      }

      return that
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer (arg, encodingOrOffset, length) {
      if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length)
      }

      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }

    Buffer.poolSize = 8192; // not used by this implementation

    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer._augment = function (arr) {
      arr.__proto__ = Buffer.prototype;
      return arr
    };

    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }

      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }

      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }

      return fromObject(that, value)
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    };

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;
    }

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }

    function alloc (that, size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    };

    function allocUnsafe (that, size) {
      assertSize(size);
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0;
        }
      }
      return that
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    };

    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }

      var length = byteLength(string, encoding) | 0;
      that = createBuffer(that, length);

      var actual = that.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual);
      }

      return that
    }

    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      that = createBuffer(that, length);
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
      }
      return that
    }

    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength; // this throws if `array` is not a valid ArrayBuffer

      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }

      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
      } else {
        array = new Uint8Array(array, byteOffset, length);
      }

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array;
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array);
      }
      return that
    }

    function fromObject (that, obj) {
      if (internalIsBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);

        if (that.length === 0) {
          return that
        }

        obj.copy(that, 0, 0, len);
        return that
      }

      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }

        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }

      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }

    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }

    function SlowBuffer (length) {
      if (+length != length) { // eslint-disable-line eqeqeq
        length = 0;
      }
      return Buffer.alloc(+length)
    }
    Buffer.isBuffer = isBuffer;
    function internalIsBuffer (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.compare = function compare (a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    };

    Buffer.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (internalIsBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string;
      }

      var len = string.length;
      if (len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer.prototype.toString = function toString () {
      var length = this.length | 0;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer.prototype.equals = function equals (b) {
      if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    };

    Buffer.prototype.inspect = function inspect () {
      var str = '';
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max) str += ' ... ';
      }
      return '<Buffer ' + str + '>'
    };

    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset;  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (internalIsBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break
            }
          }
          if (found) return i
        }
      }

      return -1
    }

    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    };

    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      // must be an even number of digits
      var strLen = string.length;
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }

    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }

    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }

    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
            return asciiWrite(this, string, offset, length)

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return fromByteArray(buf)
      } else {
        return fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res
    }

    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4)
    };

    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4)
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8)
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8;
      }
    }

    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
      }
    }

    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;
      var i;

      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val)
          ? val
          : utf8ToBytes(new Buffer(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }


    function base64ToBytes (str) {
      return toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }


    // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    function isBuffer(obj) {
      return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
    }

    function isFastBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
    }

    var bufferEs6 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        INSPECT_MAX_BYTES: INSPECT_MAX_BYTES,
        kMaxLength: _kMaxLength,
        Buffer: Buffer,
        SlowBuffer: SlowBuffer,
        isBuffer: isBuffer
    });

    var safeBuffer = createCommonjsModule(function (module, exports) {
    /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
    /* eslint-disable node/no-deprecated-api */

    var Buffer = bufferEs6.Buffer;

    // alternative to using Object.keys for old browsers
    function copyProps (src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
      module.exports = bufferEs6;
    } else {
      // Copy properties from require('buffer')
      copyProps(bufferEs6, exports);
      exports.Buffer = SafeBuffer;
    }

    function SafeBuffer (arg, encodingOrOffset, length) {
      return Buffer(arg, encodingOrOffset, length)
    }

    SafeBuffer.prototype = Object.create(Buffer.prototype);

    // Copy static methods from Buffer
    copyProps(Buffer, SafeBuffer);

    SafeBuffer.from = function (arg, encodingOrOffset, length) {
      if (typeof arg === 'number') {
        throw new TypeError('Argument must not be a number')
      }
      return Buffer(arg, encodingOrOffset, length)
    };

    SafeBuffer.alloc = function (size, fill, encoding) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      var buf = Buffer(size);
      if (fill !== undefined) {
        if (typeof encoding === 'string') {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf
    };

    SafeBuffer.allocUnsafe = function (size) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      return Buffer(size)
    };

    SafeBuffer.allocUnsafeSlow = function (size) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      return bufferEs6.SlowBuffer(size)
    };
    });

    var browser = createCommonjsModule(function (module) {

    // limit of Crypto.getRandomValues()
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    var MAX_BYTES = 65536;

    // Node supports requesting up to this number of bytes
    // https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
    var MAX_UINT32 = 4294967295;

    function oldBrowser () {
      throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
    }

    var Buffer = safeBuffer.Buffer;
    var crypto = commonjsGlobal.crypto || commonjsGlobal.msCrypto;

    if (crypto && crypto.getRandomValues) {
      module.exports = randomBytes;
    } else {
      module.exports = oldBrowser;
    }

    function randomBytes (size, cb) {
      // phantomjs needs to throw
      if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')

      var bytes = Buffer.allocUnsafe(size);

      if (size > 0) {  // getRandomValues fails on IE if size == 0
        if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
          // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
          for (var generated = 0; generated < size; generated += MAX_BYTES) {
            // buffer.slice automatically checks if the end is past the end of
            // the buffer so we don't have to here
            crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES));
          }
        } else {
          crypto.getRandomValues(bytes);
        }
      }

      if (typeof cb === 'function') {
        return nextTick(function () {
          cb(null, bytes);
        })
      }

      return bytes
    }
    });

    const urlSafeCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'.split('');
    const numericCharacters = '0123456789'.split('');
    const distinguishableCharacters = 'CDEHKMPRTUWXY012458'.split('');

    const generateForCustomCharacters = (length, characters) => {
    	// Generating entropy is faster than complex math operations, so we use the simplest way
    	const characterCount = characters.length;
    	const maxValidSelector = (Math.floor(0x10000 / characterCount) * characterCount) - 1; // Using values above this will ruin distribution when using modular division
    	const entropyLength = 2 * Math.ceil(1.1 * length); // Generating a bit more than required so chances we need more than one pass will be really low
    	let string = '';
    	let stringLength = 0;

    	while (stringLength < length) { // In case we had many bad values, which may happen for character sets of size above 0x8000 but close to it
    		const entropy = browser(entropyLength);
    		let entropyPosition = 0;

    		while (entropyPosition < entropyLength && stringLength < length) {
    			const entropyValue = entropy.readUInt16LE(entropyPosition);
    			entropyPosition += 2;
    			if (entropyValue > maxValidSelector) { // Skip values which will ruin distribution when using modular division
    				continue;
    			}

    			string += characters[entropyValue % characterCount];
    			stringLength++;
    		}
    	}

    	return string;
    };

    const allowedTypes = [
    	undefined,
    	'hex',
    	'base64',
    	'url-safe',
    	'numeric',
    	'distinguishable'
    ];

    var cryptoRandomString = ({length, type, characters}) => {
    	if (!(length >= 0 && Number.isFinite(length))) {
    		throw new TypeError('Expected a `length` to be a non-negative finite number');
    	}

    	if (type !== undefined && characters !== undefined) {
    		throw new TypeError('Expected either `type` or `characters`');
    	}

    	if (characters !== undefined && typeof characters !== 'string') {
    		throw new TypeError('Expected `characters` to be string');
    	}

    	if (!allowedTypes.includes(type)) {
    		throw new TypeError(`Unknown type: ${type}`);
    	}

    	if (type === undefined && characters === undefined) {
    		type = 'hex';
    	}

    	if (type === 'hex' || (type === undefined && characters === undefined)) {
    		return browser(Math.ceil(length * 0.5)).toString('hex').slice(0, length); // Need 0.5 byte entropy per character
    	}

    	if (type === 'base64') {
    		return browser(Math.ceil(length * 0.75)).toString('base64').slice(0, length); // Need 0.75 byte of entropy per character
    	}

    	if (type === 'url-safe') {
    		return generateForCustomCharacters(length, urlSafeCharacters);
    	}

    	if (type === 'numeric') {
    		return generateForCustomCharacters(length, numericCharacters);
    	}

    	if (type === 'distinguishable') {
    		return generateForCustomCharacters(length, distinguishableCharacters);
    	}

    	if (characters.length === 0) {
    		throw new TypeError('Expected `characters` string length to be greater than or equal to 1');
    	}

    	if (characters.length > 0x10000) {
    		throw new TypeError('Expected `characters` string length to be less or equal to 65536');
    	}

    	return generateForCustomCharacters(length, characters.split(''));
    };

    /* src/pages/_layout.svelte generated by Svelte v3.29.0 */
    const file$3 = "src/pages/_layout.svelte";

    function create_fragment$5(ctx) {
    	let t0;
    	let footer;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t0 = space();
    			footer = element("footer");
    			footer.textContent = `Random: ${cryptoRandomString({ length: 10 })}`;
    			attr_dev(footer, "class", "svelte-dtama1");
    			add_location(footer, file$3, 6, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, footer, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
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
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(footer);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ crypto: cryptoRandomString });
    	return [$$scope, slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }
    Layout.$compile = {"vars":[{"name":"crypto","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    var _layout = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout
    });

    /* src/pages/example/_fallback.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$4 = "src/pages/example/_fallback.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let a;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "404";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Page not found.\n  \n  ");
    			a = element("a");
    			t3 = text("Go back");
    			attr_dev(div0, "class", "huge svelte-ht28pc");
    			add_location(div0, file$4, 24, 2, 435);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("/"));
    			add_location(a, file$4, 27, 2, 557);
    			attr_dev(div1, "class", "big");
    			add_location(div1, file$4, 25, 2, 465);
    			attr_dev(div2, "class", "e404 svelte-ht28pc");
    			add_location(div2, file$4, 23, 0, 414);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("/"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $ready;
    	let $url;
    	validate_store(ready, "ready");
    	component_subscribe($$self, ready, $$value => $$invalidate(1, $ready = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", slots, []);

    	setTimeout(
    		() => {
    			console.log("before");
    			$ready();
    			console.log("after");
    		},
    		5000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ready, url, $ready, $url });
    	return [$url];
    }

    class Fallback$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }
    Fallback$1.$compile = {"vars":[{"name":"ready","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$ready","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _fallback$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Fallback$1
    });

    /* src/pages/example/_components/NavLinks.svelte generated by Svelte v3.29.0 */
    const file$5 = "src/pages/example/_components/NavLinks.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i][0];
    	child_ctx[7] = list[i][1];
    	return child_ctx;
    }

    // (98:4) {#each _links as [path, name]}
    function create_each_block$2(ctx) {
    	let a;
    	let t0_value = /*name*/ ctx[7] + "";
    	let t0;
    	let t1;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "link svelte-1jyfdgd");
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[2](/*path*/ ctx[6]));
    			toggle_class(a, "active", /*$isActive*/ ctx[1](/*path*/ ctx[6]));
    			add_location(a, file$5, 98, 6, 1931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$url*/ 4 && a_href_value !== (a_href_value = /*$url*/ ctx[2](/*path*/ ctx[6]))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*$isActive, _links*/ 10) {
    				toggle_class(a, "active", /*$isActive*/ ctx[1](/*path*/ ctx[6]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(98:4) {#each _links as [path, name]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let aside;
    	let nav0;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let span2;
    	let t4;
    	let nav1;
    	let mounted;
    	let dispose;
    	let each_value = /*_links*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			nav0 = element("nav");
    			span0 = element("span");
    			span0.textContent = "☰";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Routify Examples";
    			t3 = space();
    			span2 = element("span");
    			t4 = space();
    			nav1 = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span0, "class", "burger svelte-1jyfdgd");
    			add_location(span0, file$5, 92, 4, 1715);
    			attr_dev(span1, "class", "title svelte-1jyfdgd");
    			add_location(span1, file$5, 93, 4, 1773);
    			attr_dev(span2, "class", "svelte-1jyfdgd");
    			add_location(span2, file$5, 94, 4, 1821);
    			attr_dev(nav0, "class", "mobile-nav svelte-1jyfdgd");
    			add_location(nav0, file$5, 91, 2, 1686);
    			attr_dev(nav1, "class", "svelte-1jyfdgd");
    			toggle_class(nav1, "show", /*show*/ ctx[0]);
    			add_location(nav1, file$5, 96, 2, 1841);
    			attr_dev(aside, "class", "svelte-1jyfdgd");
    			add_location(aside, file$5, 90, 0, 1676);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, nav0);
    			append_dev(nav0, span0);
    			append_dev(nav0, t1);
    			append_dev(nav0, span1);
    			append_dev(nav0, t3);
    			append_dev(nav0, span2);
    			append_dev(aside, t4);
    			append_dev(aside, nav1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav1, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*handleBurger*/ ctx[4], false, false, false),
    					listen_dev(nav1, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url, _links, $isActive*/ 14) {
    				each_value = /*_links*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*show*/ 1) {
    				toggle_class(nav1, "show", /*show*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $isActive;
    	let $url;
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(1, $isActive = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(2, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavLinks", slots, []);
    	let show = false;

    	const _links = [
    		["/", "⯇ BACK TO APP"],
    		["./index", "Home"],
    		["./modal", "Modal"],
    		["./reset", "Reset"],
    		["./layouts", "Layouts"],
    		["./widget", "Widget"],
    		["./aliasing", "Aliasing"],
    		["./404", "404"],
    		["./api", "Api"],
    		["./app", "App"],
    		["./transitions/tabs", "Transitions"]
    	];

    	function handleBurger() {
    		$$invalidate(0, show = !show);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavLinks> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, show = false);

    	$$self.$capture_state = () => ({
    		url,
    		isActive,
    		show,
    		_links,
    		handleBurger,
    		$isActive,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [show, $isActive, $url, _links, handleBurger, click_handler];
    }

    class NavLinks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavLinks",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }
    NavLinks.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"isActive","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"show","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"_links","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"handleBurger","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$isActive","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut }) {
        const len = node.getTotalLength();
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    /* src/pages/example/_components/RenderStatus.svelte generated by Svelte v3.29.0 */
    const file$6 = "src/pages/example/_components/RenderStatus.svelte";

    // (32:0) {#if show}
    function create_if_block$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("source: ");
    			t1 = text(/*lastRender*/ ctx[1]);
    			attr_dev(div, "class", "box svelte-1ifkpvb");
    			add_location(div, file$6, 32, 2, 646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*lastRender*/ 2) set_data_dev(t1, /*lastRender*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(32:0) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let if_block = /*show*/ ctx[0] && create_if_block$2(ctx);

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
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*show*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
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
    			transition_in(if_block);
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(4, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RenderStatus", slots, []);
    	let show = false;
    	let render;

    	[...document.getElementsByTagName("meta")].forEach(elem => {
    		$$invalidate(2, render = elem.dataset.render || render);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RenderStatus> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		route,
    		show,
    		render,
    		moved,
    		$route,
    		lastRender
    	});

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("render" in $$props) $$invalidate(2, render = $$props.render);
    		if ("moved" in $$props) $$invalidate(3, moved = $$props.moved);
    		if ("lastRender" in $$props) $$invalidate(1, lastRender = $$props.lastRender);
    	};

    	let moved;
    	let lastRender;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$route*/ 16) {
    			 $$invalidate(3, moved = !!$route.prev);
    		}

    		if ($$self.$$.dirty & /*moved, render*/ 12) {
    			 $$invalidate(1, lastRender = moved ? "dynamic" : render || "spa");
    		}

    		if ($$self.$$.dirty & /*lastRender*/ 2) {
    			 lastRender && $$invalidate(0, show = true) && setTimeout(
    				() => {
    					$$invalidate(0, show = false);
    				},
    				3000
    			);
    		}
    	};

    	return [show, lastRender];
    }

    class RenderStatus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RenderStatus",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }
    RenderStatus.$compile = {"vars":[{"name":"fade","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"route","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"show","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"render","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"moved","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$route","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"lastRender","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/_reset.svelte generated by Svelte v3.29.0 */
    const file$7 = "src/pages/example/_reset.svelte";

    function create_fragment$9(ctx) {
    	let div2;
    	let div0;
    	let navlinks;
    	let t0;
    	let renderstatus;
    	let t1;
    	let div1;
    	let current;
    	navlinks = new NavLinks({ $$inline: true });
    	renderstatus = new RenderStatus({ $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(navlinks.$$.fragment);
    			t0 = space();
    			create_component(renderstatus.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "nav svelte-4qyoql");
    			add_location(div0, file$7, 37, 2, 903);
    			attr_dev(div1, "class", "main svelte-4qyoql");
    			add_location(div1, file$7, 41, 2, 970);
    			attr_dev(div2, "class", "example svelte-4qyoql");
    			add_location(div2, file$7, 36, 0, 879);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(navlinks, div0, null);
    			append_dev(div0, t0);
    			mount_component(renderstatus, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navlinks.$$.fragment, local);
    			transition_in(renderstatus.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navlinks.$$.fragment, local);
    			transition_out(renderstatus.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(navlinks);
    			destroy_component(renderstatus);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reset", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reset> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url, NavLinks, RenderStatus });
    	return [$$scope, slots];
    }

    class Reset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reset",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }
    Reset.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"NavLinks","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"RenderStatus","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    var _reset = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Reset
    });

    /* src/pages/example/aliasing/_layout.svelte generated by Svelte v3.29.0 */
    const file$8 = "src/pages/example/aliasing/_layout.svelte";

    function create_fragment$a(ctx) {
    	let div1;
    	let div0;
    	let a0;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let t3;
    	let a2;
    	let t4;
    	let a2_href_value;
    	let t5;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			t0 = text("Aliasing");
    			t1 = text(" |\n    ");
    			a1 = element("a");
    			t2 = text("V1");
    			t3 = text(" |\n    ");
    			a2 = element("a");
    			t4 = text("V1.1");
    			t5 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("./"));
    			add_location(a0, file$8, 6, 4, 134);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[0]("./v1"));
    			add_location(a1, file$8, 7, 4, 174);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[0]("./v1.1"));
    			add_location(a2, file$8, 8, 4, 210);
    			set_style(div0, "font-weight", "bold");
    			add_location(div0, file$8, 5, 2, 98);
    			set_style(div1, "text-align", "center");
    			add_location(div1, file$8, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, a1);
    			append_dev(a1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, a2);
    			append_dev(a2, t4);
    			append_dev(div1, t5);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("./"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a1_href_value !== (a1_href_value = /*$url*/ ctx[0]("./v1"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a2_href_value !== (a2_href_value = /*$url*/ ctx[0]("./v1.1"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
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
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url, $$scope, slots];
    }

    class Layout$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }
    Layout$1.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _layout$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$1
    });

    /* src/pages/example/aliasing/index.svelte generated by Svelte v3.29.0 */

    const file$9 = "src/pages/example/aliasing/index.svelte";

    function create_fragment$b(ctx) {
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "Pages can redirect to other pages while not changing the current URL.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "By using _fallback.svelte we can reference whole libraries and modules instead of having to duplicate them.";
    			add_location(p0, file$9, 1, 0, 1);
    			add_location(p1, file$9, 2, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Aliasing", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Aliasing> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Aliasing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aliasing",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }
    Aliasing.$compile = {"vars":[]};

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Aliasing
    });

    /* src/pages/example/aliasing/v1/_layout.svelte generated by Svelte v3.29.0 */
    const file$a = "src/pages/example/aliasing/v1/_layout.svelte";

    function create_fragment$c(ctx) {
    	let p;
    	let t1;
    	let a0;
    	let t2;
    	let a0_href_value;
    	let t3;
    	let a1;
    	let t4;
    	let a1_href_value;
    	let t5;
    	let a2;
    	let t6;
    	let a2_href_value;
    	let t7;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "V1 has three files, which can be seen in the links below";
    			t1 = space();
    			a0 = element("a");
    			t2 = text("Feature 1");
    			t3 = text(" | \n");
    			a1 = element("a");
    			t4 = text("Feature 2");
    			t5 = text(" |\n");
    			a2 = element("a");
    			t6 = text("Feature 3");
    			t7 = space();
    			if (default_slot) default_slot.c();
    			add_location(p, file$a, 4, 0, 64);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("./feature1"));
    			add_location(a0, file$a, 7, 0, 131);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[0]("./feature2"));
    			add_location(a1, file$a, 8, 0, 177);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[0]("./feature3"));
    			add_location(a2, file$a, 9, 0, 222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a0, anchor);
    			append_dev(a0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, a2, anchor);
    			append_dev(a2, t6);
    			insert_dev(target, t7, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("./feature1"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a1_href_value !== (a1_href_value = /*$url*/ ctx[0]("./feature2"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a2_href_value !== (a2_href_value = /*$url*/ ctx[0]("./feature3"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
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
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t7);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url, $$scope, slots];
    }

    class Layout$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }
    Layout$2.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _layout$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$2
    });

    /* src/pages/example/aliasing/v1/feature1.svelte generated by Svelte v3.29.0 */

    const file$b = "src/pages/example/aliasing/v1/feature1.svelte";

    function create_fragment$d(ctx) {
    	let h1;
    	let t1;
    	let b;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Feature 1";
    			t1 = space();
    			b = element("b");
    			b.textContent = "v1 feature";
    			add_location(h1, file$b, 0, 0, 0);
    			add_location(b, file$b, 2, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, b, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Feature1", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Feature1> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Feature1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Feature1",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }
    Feature1.$compile = {"vars":[]};

    var feature1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Feature1
    });

    /* src/pages/example/aliasing/v1/feature2.svelte generated by Svelte v3.29.0 */

    const file$c = "src/pages/example/aliasing/v1/feature2.svelte";

    function create_fragment$e(ctx) {
    	let h1;
    	let t1;
    	let b;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Feature 2";
    			t1 = space();
    			b = element("b");
    			b.textContent = "v1 feature";
    			add_location(h1, file$c, 0, 0, 0);
    			add_location(b, file$c, 2, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, b, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Feature2", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Feature2> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Feature2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Feature2",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }
    Feature2.$compile = {"vars":[]};

    var feature2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Feature2
    });

    /* src/pages/example/aliasing/v1/feature3.svelte generated by Svelte v3.29.0 */

    const file$d = "src/pages/example/aliasing/v1/feature3.svelte";

    function create_fragment$f(ctx) {
    	let h1;
    	let t1;
    	let b;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Feature 3";
    			t1 = space();
    			b = element("b");
    			b.textContent = "v1 feature";
    			add_location(h1, file$d, 0, 0, 0);
    			add_location(b, file$d, 2, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, b, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Feature3", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Feature3> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Feature3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Feature3",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }
    Feature3.$compile = {"vars":[]};

    var feature3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Feature3
    });

    /* src/pages/example/aliasing/v1/index.svelte generated by Svelte v3.29.0 */

    const file$e = "src/pages/example/aliasing/v1/index.svelte";

    function create_fragment$g(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Welcome to v1";
    			add_location(h1, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("V1", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<V1> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class V1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "V1",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }
    V1.$compile = {"vars":[]};

    var index$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': V1
    });

    /* src/pages/example/aliasing/v1.1/_fallback.svelte generated by Svelte v3.29.0 */

    function create_fragment$h(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $goto;
    	let $leftover;
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(0, $goto = $$value));
    	validate_store(leftover, "leftover");
    	component_subscribe($$self, leftover, $$value => $$invalidate(1, $leftover = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", slots, []);
    	$goto("../../v1/" + $leftover, null, true, true);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ goto, leftover, $goto, $leftover });
    	return [];
    }

    class Fallback$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }
    Fallback$2.$compile = {"vars":[{"name":"goto","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"leftover","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"$goto","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$leftover","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false}]};

    var _fallback$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Fallback$2
    });

    /* src/pages/example/aliasing/v1.1/_layout.svelte generated by Svelte v3.29.0 */
    const file$f = "src/pages/example/aliasing/v1.1/_layout.svelte";

    function create_fragment$i(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let code;
    	let pre;
    	let t7;
    	let a0;
    	let t8;
    	let a0_href_value;
    	let t9;
    	let a1;
    	let t10;
    	let a1_href_value;
    	let t11;
    	let a2;
    	let t12;
    	let a2_href_value;
    	let t13;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "V1.1 has only one file: feature2.svelte";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "The rest are handled with _fallback.svelte, which redirects to v1";
    			t3 = space();
    			code = element("code");
    			pre = element("pre");

    			pre.textContent = `/** _fallback.svelte **/
    import ${`{(goto, leftover)}`} from '@sveltech/routify'
    \$goto('../../v1/'+\$leftover, null, true, true)`;

    			t7 = space();
    			a0 = element("a");
    			t8 = text("Feature 1");
    			t9 = space();
    			a1 = element("a");
    			t10 = text("Feature 2");
    			t11 = space();
    			a2 = element("a");
    			t12 = text("Feature 3");
    			t13 = space();
    			if (default_slot) default_slot.c();
    			add_location(p0, file$f, 4, 0, 63);
    			add_location(p1, file$f, 5, 0, 110);
    			add_location(pre, file$f, 8, 2, 193);
    			add_location(code, file$f, 7, 0, 184);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("./feature1"));
    			add_location(a0, file$f, 15, 0, 356);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[0]("./feature2"));
    			add_location(a1, file$f, 16, 0, 399);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[0]("./feature3"));
    			add_location(a2, file$f, 17, 0, 442);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, code, anchor);
    			append_dev(code, pre);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, a0, anchor);
    			append_dev(a0, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, a2, anchor);
    			append_dev(a2, t12);
    			insert_dev(target, t13, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("./feature1"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a1_href_value !== (a1_href_value = /*$url*/ ctx[0]("./feature2"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a2_href_value !== (a2_href_value = /*$url*/ ctx[0]("./feature3"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
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
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(code);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t13);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url, $$scope, slots];
    }

    class Layout$3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }
    Layout$3.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _layout$3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$3
    });

    /* src/pages/example/aliasing/v1.1/feature2.svelte generated by Svelte v3.29.0 */

    const file$g = "src/pages/example/aliasing/v1.1/feature2.svelte";

    function create_fragment$j(ctx) {
    	let h1;
    	let t1;
    	let b;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Feature 2";
    			t1 = space();
    			b = element("b");
    			b.textContent = "v1.1 feature";
    			add_location(h1, file$g, 0, 0, 0);
    			add_location(b, file$g, 2, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, b, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Feature2", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Feature2> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Feature2$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Feature2",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }
    Feature2$1.$compile = {"vars":[]};

    var feature2$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Feature2$1
    });

    /* src/pages/example/aliasing/v1.1/index.svelte generated by Svelte v3.29.0 */

    const file$h = "src/pages/example/aliasing/v1.1/index.svelte";

    function create_fragment$k(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Welcome to v2";
    			add_location(h1, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("V1_1", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<V1_1> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class V1_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "V1_1",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }
    V1_1.$compile = {"vars":[]};

    var index$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': V1_1
    });

    /* src/pages/example/api/_layout.svelte generated by Svelte v3.29.0 */
    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ scoped: { movies: /*movies*/ ctx[0] } });

    function create_fragment$l(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], get_default_slot_context);

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
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_default_slot_changes, get_default_slot_context);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);

    	const movies = [
    		[32, "Fargo"],
    		[179, "The Wire"],
    		[318, "Community"],
    		[5, "True Detective"],
    		[532, "Scrubs"],
    		[30960, "Cobra Kai"],
    		[530, "Seinfeld"],
    		[347, "It's Always Sunny in Philadelphia"]
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ movies });
    	return [movies, $$scope, slots];
    }

    class Layout$4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }
    Layout$4.$compile = {"vars":[{"name":"movies","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    var _layout$4 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$4
    });

    /* src/pages/example/api/[showId].svelte generated by Svelte v3.29.0 */
    const file$i = "src/pages/example/api/[showId].svelte";

    // (22:2) {#if series.id}
    function create_if_block$3(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t1_value = /*series*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let t3_value = /*series*/ ctx[0].premiered.split("-")[0] + "";
    	let t3;
    	let t4;
    	let t5;
    	let p;
    	let raw_value = /*series*/ ctx[0].summary + "";
    	let t6;
    	let a;
    	let t7;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			p = element("p");
    			t6 = space();
    			a = element("a");
    			t7 = text("Read more on TVMaze");
    			if (img.src !== (img_src_value = /*series*/ ctx[0].image.medium.replace("http", "https"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "cover");
    			set_style(img, "height", "295px");
    			add_location(img, file$i, 22, 4, 469);
    			add_location(h1, file$i, 23, 4, 566);
    			add_location(p, file$i, 24, 4, 628);
    			attr_dev(a, "href", a_href_value = /*series*/ ctx[0].url);
    			add_location(a, file$i, 27, 4, 674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			append_dev(h1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    			insert_dev(target, t6, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*series*/ 1 && img.src !== (img_src_value = /*series*/ ctx[0].image.medium.replace("http", "https"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*series*/ 1 && t1_value !== (t1_value = /*series*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*series*/ 1 && t3_value !== (t3_value = /*series*/ ctx[0].premiered.split("-")[0] + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*series*/ 1 && raw_value !== (raw_value = /*series*/ ctx[0].summary + "")) p.innerHTML = raw_value;
    			if (dirty & /*series*/ 1 && a_href_value !== (a_href_value = /*series*/ ctx[0].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(22:2) {#if series.id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div;
    	let h4;
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let if_block = /*series*/ ctx[0].id && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			a = element("a");
    			t0 = text("Go back");
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[1]("../.."));
    			add_location(a, file$i, 18, 4, 402);
    			add_location(h4, file$i, 17, 2, 393);
    			set_style(div, "text-align", "center");
    			set_style(div, "max-width", "540px");
    			set_style(div, "margin", "auto");
    			add_location(div, file$i, 16, 0, 326);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 2 && a_href_value !== (a_href_value = /*$url*/ ctx[1]("../.."))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (/*series*/ ctx[0].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $params;
    	let $ready;
    	let $url;
    	validate_store(params, "params");
    	component_subscribe($$self, params, $$value => $$invalidate(2, $params = $$value));
    	validate_store(ready, "ready");
    	component_subscribe($$self, ready, $$value => $$invalidate(3, $ready = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("U5BshowIdu5D", slots, []);
    	let series = {};

    	function updateShow(id) {
    		fetch(`https://api.tvmaze.com/shows/${id}`).then(response => response.json()).then(json => {
    			$$invalidate(0, series = json);
    			$ready();
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<U5BshowIdu5D> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ready,
    		url,
    		params,
    		series,
    		updateShow,
    		$params,
    		$ready,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("series" in $$props) $$invalidate(0, series = $$props.series);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$params*/ 4) {
    			 updateShow($params.showId);
    		}
    	};

    	return [series, $url];
    }

    class U5BshowIdu5D extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "U5BshowIdu5D",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }
    U5BshowIdu5D.$compile = {"vars":[{"name":"ready","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"params","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"series","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"updateShow","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"$params","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$ready","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _showId_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': U5BshowIdu5D
    });

    /* src/pages/example/api/index.svelte generated by Svelte v3.29.0 */
    const file$j = "src/pages/example/api/index.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    // (13:2) {#each movies as [showId, title]}
    function create_each_block$3(ctx) {
    	let h3;
    	let a;
    	let t0_value = /*title*/ ctx[5] + "";
    	let t0;
    	let a_href_value;
    	let prefetch_action;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../:showId", { showId: /*showId*/ ctx[4] }));
    			add_location(a, file$j, 14, 6, 382);
    			add_location(h3, file$j, 13, 4, 371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, a);
    			append_dev(a, t0);
    			append_dev(h3, t1);

    			if (!mounted) {
    				dispose = action_destroyer(prefetch_action = prefetch$1.call(null, a, /*options*/ ctx[1]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../:showId", { showId: /*showId*/ ctx[4] }))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(13:2) {#each movies as [showId, title]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div;
    	let each_value = /*movies*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(div, "text-align", "center");
    			add_location(div, file$j, 11, 0, 298);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url, movies, options*/ 7) {
    				each_value = /*movies*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Api", slots, []);
    	let { scoped } = $$props;

    	const options = {
    		validFor: 3600 * 24 * 31, // don't refresh assets on the page for a month
    		writeHeaders: true, // useful for debugging
    		
    	};

    	const { movies } = scoped;
    	const writable_props = ["scoped"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Api> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("scoped" in $$props) $$invalidate(3, scoped = $$props.scoped);
    	};

    	$$self.$capture_state = () => ({
    		url,
    		prefetch: prefetch$1,
    		scoped,
    		options,
    		movies,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("scoped" in $$props) $$invalidate(3, scoped = $$props.scoped);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$url, options, movies, scoped];
    }

    class Api extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { scoped: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Api",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*scoped*/ ctx[3] === undefined && !("scoped" in props)) {
    			console.warn("<Api> was created without expected prop 'scoped'");
    		}
    	}

    	get scoped() {
    		throw new Error("<Api>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Api>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Api.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"prefetch","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"scoped","export_name":"scoped","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"options","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"movies","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var index$3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Api
    });

    /* src/pages/example/app/_fallback.svelte generated by Svelte v3.29.0 */
    const file$k = "src/pages/example/app/_fallback.svelte";

    function create_fragment$o(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let a;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "404";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Page not found. \n  \n  ");
    			a = element("a");
    			t3 = text("Go back");
    			attr_dev(div0, "class", "huge svelte-ht28pc");
    			add_location(div0, file$k, 18, 2, 321);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../"));
    			add_location(a, file$k, 21, 2, 444);
    			attr_dev(div1, "class", "big");
    			add_location(div1, file$k, 19, 2, 351);
    			attr_dev(div2, "class", "e404 svelte-ht28pc");
    			add_location(div2, file$k, 17, 0, 300);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Fallback$3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }
    Fallback$3.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _fallback$3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Fallback$3
    });

    const user = writable(false);

    /* src/pages/example/app/_reset.svelte generated by Svelte v3.29.0 */
    const file$l = "src/pages/example/app/_reset.svelte";

    // (16:0) {#if $user}
    function create_if_block$4(ctx) {
    	let a0;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let t3;
    	let a2;
    	let t4;
    	let a2_href_value;
    	let t5;
    	let button;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			t0 = text("Back to examples");
    			t1 = space();
    			a1 = element("a");
    			t2 = text("Home");
    			t3 = space();
    			a2 = element("a");
    			t4 = text("About");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Logout";
    			t7 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[1]("example-app"));
    			add_location(a0, file$l, 16, 2, 435);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[1]("./"));
    			add_location(a1, file$l, 17, 2, 488);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[1]("./about"));
    			add_location(a2, file$l, 18, 2, 520);
    			set_style(button, "position", "absolute");
    			set_style(button, "right", "24px");
    			add_location(button, file$l, 19, 2, 558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			append_dev(a0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, a2, anchor);
    			append_dev(a2, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t7, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*logout*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$url*/ 2 && a0_href_value !== (a0_href_value = /*$url*/ ctx[1]("example-app"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 2 && a1_href_value !== (a1_href_value = /*$url*/ ctx[1]("./"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 2 && a2_href_value !== (a2_href_value = /*$url*/ ctx[1]("./about"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
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
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t7);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(16:0) {#if $user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$user*/ ctx[0] && create_if_block$4(ctx);

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
    			if (/*$user*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$user*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
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
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let $user;
    	let $goto;
    	let $url;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(0, $user = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(5, $goto = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reset", slots, ['default']);

    	function logout() {
    		set_store_value(user, $user = false, $user);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reset> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		goto,
    		url,
    		user,
    		logout,
    		$user,
    		$goto,
    		$url
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$user, $goto*/ 33) {
    			/** We set the static parameter to true since we don't want to change the browser's URL
     *  Notice the $: prefix which makes the statement reactive. This way if the user logs
     *  out the $goto is called again.
     * **/
    			 if (!$user) $goto("./login", {}, true);
    		}
    	};

    	return [$user, $url, logout, $$scope, slots];
    }

    class Reset$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reset",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }
    Reset$1.$compile = {"vars":[{"name":"goto","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"user","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"logout","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$user","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$goto","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _reset$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Reset$1
    });

    /* src/pages/example/app/index.svelte generated by Svelte v3.29.0 */

    const file$m = "src/pages/example/app/index.svelte";

    function create_fragment$q(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Welcome logged in user";
    			add_location(h1, file$m, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class App$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }
    App$1.$compile = {"vars":[]};

    var index$4 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': App$1
    });

    /* src/pages/example/app/login/_reset.svelte generated by Svelte v3.29.0 */

    function create_fragment$r(ctx) {
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
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
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
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reset", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reset> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Reset$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reset",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }
    Reset$2.$compile = {"vars":[]};

    var _reset$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Reset$2
    });

    /* src/pages/example/app/login/index.svelte generated by Svelte v3.29.0 */
    const file$n = "src/pages/example/app/login/index.svelte";

    function create_fragment$s(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let input0;
    	let t2;
    	let br0;
    	let t3;
    	let input1;
    	let t4;
    	let br1;
    	let t5;
    	let button;
    	let t7;
    	let br2;
    	let t8;
    	let br3;
    	let t9;
    	let br4;
    	let t10;
    	let p0;
    	let t11;
    	let a;
    	let t12_value = /*$url*/ ctx[2]() + "";
    	let t12;
    	let a_href_value;
    	let t13;
    	let p1;
    	let t15;
    	let p2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Login";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			br3 = element("br");
    			t9 = space();
    			br4 = element("br");
    			t10 = space();
    			p0 = element("p");
    			t11 = text("This login page is actually located at\n    ");
    			a = element("a");
    			t12 = text(t12_value);
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "You are seeing it here, because we're using $goto with the static option\n    enabled. This renders the login page, without changing the URL in the\n    browser.";
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "On submit, we're \"redirected\" to the current URL in your browser.";
    			add_location(h1, file$n, 17, 2, 463);
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$n, 18, 2, 480);
    			add_location(br0, file$n, 19, 2, 526);
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$n, 20, 2, 535);
    			add_location(br1, file$n, 21, 2, 581);
    			add_location(button, file$n, 22, 2, 590);
    			add_location(br2, file$n, 24, 2, 634);
    			add_location(br3, file$n, 25, 2, 643);
    			add_location(br4, file$n, 26, 2, 652);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[2]());
    			add_location(a, file$n, 29, 4, 712);
    			add_location(p0, file$n, 27, 2, 661);
    			add_location(p1, file$n, 31, 2, 751);
    			add_location(p2, file$n, 36, 2, 928);
    			set_style(div, "width", "256px");
    			set_style(div, "margin", "128px auto");
    			set_style(div, "text-align", "center");
    			add_location(div, file$n, 16, 0, 394);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, input0);
    			set_input_value(input0, /*username*/ ctx[0]);
    			append_dev(div, t2);
    			append_dev(div, br0);
    			append_dev(div, t3);
    			append_dev(div, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(div, t4);
    			append_dev(div, br1);
    			append_dev(div, t5);
    			append_dev(div, button);
    			append_dev(div, t7);
    			append_dev(div, br2);
    			append_dev(div, t8);
    			append_dev(div, br3);
    			append_dev(div, t9);
    			append_dev(div, br4);
    			append_dev(div, t10);
    			append_dev(div, p0);
    			append_dev(p0, t11);
    			append_dev(p0, a);
    			append_dev(a, t12);
    			append_dev(div, t13);
    			append_dev(div, p1);
    			append_dev(div, t15);
    			append_dev(div, p2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*login*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}

    			if (dirty & /*$url*/ 4 && t12_value !== (t12_value = /*$url*/ ctx[2]() + "")) set_data_dev(t12, t12_value);

    			if (dirty & /*$url*/ 4 && a_href_value !== (a_href_value = /*$url*/ ctx[2]())) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let $user;
    	let $goto;
    	let $url;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(6, $user = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(7, $goto = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(2, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);
    	let username = "anything";
    	let password = "goes";

    	function login() {
    		set_store_value(user, $user = { username }, $user);

    		/** We want to $goto our current location.
     *  Since we're now logged in, we shouldn't be redirected to this login page again.
     * **/
    		$goto(window.location.href);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		user,
    		goto,
    		url,
    		username,
    		password,
    		login,
    		$user,
    		$goto,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [username, password, $url, login, input0_input_handler, input1_input_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }
    Login.$compile = {"vars":[{"name":"user","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"goto","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"username","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"password","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"login","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$user","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$goto","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var index$5 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Login
    });

    var base64Logo = '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';

    /* src/pages/example/index.svelte generated by Svelte v3.29.0 */
    const file$o = "src/pages/example/index.svelte";

    function create_fragment$t(ctx) {
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let b0;
    	let t2;
    	let br0;
    	let t3;
    	let a0;
    	let t5;
    	let br1;
    	let t6;
    	let div1;
    	let b1;
    	let t8;
    	let br2;
    	let t9;
    	let a1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			b0 = element("b");
    			b0.textContent = "Guide:";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			a0 = element("a");
    			a0.textContent = "https://routify.dev";
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			div1 = element("div");
    			b1 = element("b");
    			b1.textContent = "This template:";
    			t8 = space();
    			br2 = element("br");
    			t9 = space();
    			a1 = element("a");
    			a1.textContent = "https://github.com/sveltech/routify-starter";
    			if (img.src !== (img_src_value = "data:image/png;base64, " + base64Logo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			set_style(img, "max-width", "100%");
    			set_style(img, "padding-bottom", "128px");
    			add_location(img, file$o, 7, 2, 188);
    			add_location(b0, file$o, 9, 4, 308);
    			add_location(br0, file$o, 10, 4, 326);
    			attr_dev(a0, "href", "https://routify.dev");
    			add_location(a0, file$o, 11, 4, 337);
    			add_location(div0, file$o, 8, 2, 298);
    			add_location(br1, file$o, 14, 2, 403);
    			add_location(b1, file$o, 16, 4, 422);
    			add_location(br2, file$o, 17, 4, 448);
    			attr_dev(a1, "href", "https://github.com/sveltech/routify-starter");
    			add_location(a1, file$o, 18, 4, 459);
    			add_location(div1, file$o, 15, 2, 412);
    			set_style(div2, "width", "100%");
    			set_style(div2, "text-align", "center");
    			set_style(div2, "margin-top", "4rem");
    			add_location(div2, file$o, 6, 0, 121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, b0);
    			append_dev(div0, t2);
    			append_dev(div0, br0);
    			append_dev(div0, t3);
    			append_dev(div0, a0);
    			append_dev(div2, t5);
    			append_dev(div2, br1);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, b1);
    			append_dev(div1, t8);
    			append_dev(div1, br2);
    			append_dev(div1, t9);
    			append_dev(div1, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Example", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Example> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ base64Logo });
    	return [];
    }

    class Example extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }
    Example.$compile = {"vars":[{"name":"base64Logo","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    var index$6 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Example
    });

    /* src/pages/example/layouts/_layout.svelte generated by Svelte v3.29.0 */
    const file$p = "src/pages/example/layouts/_layout.svelte";

    function create_fragment$u(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			t0 = text("Child");
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("./child"));
    			attr_dev(a, "class", "svelte-1x7zm3p");
    			add_location(a, file$p, 22, 6, 506);
    			attr_dev(div0, "class", "card svelte-1x7zm3p");
    			add_location(div0, file$p, 21, 4, 481);
    			attr_dev(div1, "class", "layout-container svelte-1x7zm3p");
    			add_location(div1, file$p, 20, 2, 446);
    			attr_dev(div2, "class", "svelte-1x7zm3p");
    			add_location(div2, file$p, 19, 0, 437);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, t0);
    			append_dev(div0, t1);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("./child"))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
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
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url, $$scope, slots];
    }

    class Layout$5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }
    Layout$5.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _layout$5 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$5
    });

    /* src/pages/example/layouts/child/_layout.svelte generated by Svelte v3.29.0 */
    const file$q = "src/pages/example/layouts/child/_layout.svelte";

    function create_fragment$v(ctx) {
    	let div1;
    	let div0;
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			t0 = text("Grandchild");
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("./grandchild"));
    			add_location(a, file$q, 8, 4, 121);
    			attr_dev(div0, "class", "card");
    			add_location(div0, file$q, 7, 2, 98);
    			attr_dev(div1, "class", "layout-container");
    			add_location(div1, file$q, 6, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, t0);
    			append_dev(div0, t1);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("./grandchild"))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
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
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url, $$scope, slots];
    }

    class Layout$6 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }
    Layout$6.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _layout$6 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$6
    });

    /* src/pages/example/layouts/child/grandchild/_layout.svelte generated by Svelte v3.29.0 */
    const file$r = "src/pages/example/layouts/child/grandchild/_layout.svelte";

    function create_fragment$w(ctx) {
    	let div1;
    	let div0;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "card");
    			add_location(div0, file$r, 7, 2, 98);
    			attr_dev(div1, "class", "layout-container");
    			add_location(div1, file$r, 6, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
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
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url });
    	return [$$scope, slots];
    }

    class Layout$7 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }
    Layout$7.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false}]};

    var _layout$7 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$7
    });

    /* src/pages/example/layouts/child/grandchild/index.svelte generated by Svelte v3.29.0 */

    const file$s = "src/pages/example/layouts/child/grandchild/index.svelte";

    function create_fragment$x(ctx) {
    	let div;
    	let h4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "I'm src/pages/example/nesting/child/grandchild/index.svelte";
    			add_location(h4, file$s, 1, 2, 35);
    			set_style(div, "text-align", "center");
    			add_location(div, file$s, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grandchild", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grandchild> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Grandchild extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grandchild",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }
    Grandchild.$compile = {"vars":[]};

    var index$7 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Grandchild
    });

    /* src/pages/example/layouts/child/index.svelte generated by Svelte v3.29.0 */

    const file$t = "src/pages/example/layouts/child/index.svelte";

    function create_fragment$y(ctx) {
    	let div;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "I'm src/pages/example/nesting/child/index.svelte";
    			add_location(h1, file$t, 1, 2, 35);
    			set_style(div, "text-align", "center");
    			add_location(div, file$t, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Child", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Child> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Child extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Child",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }
    Child.$compile = {"vars":[]};

    var index$8 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Child
    });

    /* src/pages/example/layouts/index.svelte generated by Svelte v3.29.0 */

    const file$u = "src/pages/example/layouts/index.svelte";

    function create_fragment$z(ctx) {
    	let div;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "I'm src/pages/example/nesting/index.svelte";
    			add_location(h1, file$u, 1, 2, 35);
    			set_style(div, "text-align", "center");
    			add_location(div, file$u, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layouts", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layouts> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Layouts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layouts",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }
    Layouts.$compile = {"vars":[]};

    var index$9 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layouts
    });

    /* src/pages/example/modal/_layout.svelte generated by Svelte v3.29.0 */
    const file$v = "src/pages/example/modal/_layout.svelte";

    function create_fragment$A(ctx) {
    	let div1;
    	let div0;
    	let a0;
    	let t0;
    	let a0_href_value;
    	let a0_class_value;
    	let t1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let a1_class_value;
    	let t3;
    	let br;
    	let t4;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			t0 = text("Basic");
    			t1 = space();
    			a1 = element("a");
    			t2 = text("Animated");
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[1]("./basic"));
    			attr_dev(a0, "class", a0_class_value = "" + (null_to_empty(/*active*/ ctx[0] === "basic" ? "active" : "") + " svelte-am280t"));
    			add_location(a0, file$v, 65, 4, 1229);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[1]("./animated"));
    			attr_dev(a1, "class", a1_class_value = "" + (null_to_empty(/*active*/ ctx[0] === "animated" ? "active" : "") + " svelte-am280t"));
    			add_location(a1, file$v, 68, 4, 1324);
    			attr_dev(div0, "class", "center svelte-am280t");
    			add_location(div0, file$v, 64, 2, 1204);
    			attr_dev(br, "class", "svelte-am280t");
    			add_location(br, file$v, 73, 2, 1436);
    			attr_dev(div1, "data-routify", "scroll-lock");
    			attr_dev(div1, "class", "svelte-am280t");
    			add_location(div1, file$v, 62, 0, 1168);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, a1);
    			append_dev(a1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, br);
    			append_dev(div1, t4);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 2 && a0_href_value !== (a0_href_value = /*$url*/ ctx[1]("./basic"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*active*/ 1 && a0_class_value !== (a0_class_value = "" + (null_to_empty(/*active*/ ctx[0] === "basic" ? "active" : "") + " svelte-am280t"))) {
    				attr_dev(a0, "class", a0_class_value);
    			}

    			if (!current || dirty & /*$url*/ 2 && a1_href_value !== (a1_href_value = /*$url*/ ctx[1]("./animated"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*active*/ 1 && a1_class_value !== (a1_class_value = "" + (null_to_empty(/*active*/ ctx[0] === "animated" ? "active" : "") + " svelte-am280t"))) {
    				attr_dev(a1, "class", a1_class_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
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
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let $route;
    	let $url;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(5, $route = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url, route, match, $route, active, $url });

    	$$self.$inject_state = $$props => {
    		if ("match" in $$props) $$invalidate(4, match = $$props.match);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	let match;
    	let active;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$route*/ 32) {
    			 $$invalidate(4, match = $route.path.match(/\/modal\/([^\/]+)\//));
    		}

    		if ($$self.$$.dirty & /*match*/ 16) {
    			 $$invalidate(0, active = match && match[1]);
    		}
    	};

    	return [active, $url, $$scope, slots];
    }

    class Layout$8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }
    Layout$8.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"route","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"match","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$route","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"active","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _layout$8 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$8
    });

    /* src/pages/example/modal/animated/_target.svelte generated by Svelte v3.29.0 */

    const file$w = "src/pages/example/modal/animated/_target.svelte";

    // (15:0) {#if !hide}
    function create_if_block$5(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "canvas svelte-14z8ks3");
    			add_location(div, file$w, 15, 2, 184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (div_outro) div_outro.end(1);
    					if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[1], { key: "modal" });
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();

    			if (local) {
    				div_outro = create_out_transition(div, /*send*/ ctx[0], { key: "modal" });
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(15:0) {#if !hide}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$B(ctx) {
    	let if_block_anchor;
    	let if_block = !/*hide*/ ctx[2] && create_if_block$5(ctx);

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
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*hide*/ ctx[2]) {
    				if (if_block) {
    					if (dirty & /*hide*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
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
    			transition_in(if_block);
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Target", slots, []);
    	let { send } = $$props, { receive } = $$props, { hide } = $$props;
    	const writable_props = ["send", "receive", "hide"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Target> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("send" in $$props) $$invalidate(0, send = $$props.send);
    		if ("receive" in $$props) $$invalidate(1, receive = $$props.receive);
    		if ("hide" in $$props) $$invalidate(2, hide = $$props.hide);
    	};

    	$$self.$capture_state = () => ({ send, receive, hide });

    	$$self.$inject_state = $$props => {
    		if ("send" in $$props) $$invalidate(0, send = $$props.send);
    		if ("receive" in $$props) $$invalidate(1, receive = $$props.receive);
    		if ("hide" in $$props) $$invalidate(2, hide = $$props.hide);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [send, receive, hide];
    }

    class Target extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, { send: 0, receive: 1, hide: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Target",
    			options,
    			id: create_fragment$B.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*send*/ ctx[0] === undefined && !("send" in props)) {
    			console.warn("<Target> was created without expected prop 'send'");
    		}

    		if (/*receive*/ ctx[1] === undefined && !("receive" in props)) {
    			console.warn("<Target> was created without expected prop 'receive'");
    		}

    		if (/*hide*/ ctx[2] === undefined && !("hide" in props)) {
    			console.warn("<Target> was created without expected prop 'hide'");
    		}
    	}

    	get send() {
    		throw new Error("<Target>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set send(value) {
    		throw new Error("<Target>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get receive() {
    		throw new Error("<Target>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set receive(value) {
    		throw new Error("<Target>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hide() {
    		throw new Error("<Target>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hide(value) {
    		throw new Error("<Target>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Target.$compile = {"vars":[{"name":"send","export_name":"send","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"receive","export_name":"receive","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"hide","export_name":"hide","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/modal/animated/_layout.svelte generated by Svelte v3.29.0 */
    const file$x = "src/pages/example/modal/animated/_layout.svelte";
    const get_default_slot_changes$1 = dirty => ({ scoped: dirty & /*_key*/ 1 });

    const get_default_slot_context$1 = ctx => ({
    	scoped: {
    		send: /*send*/ ctx[2],
    		receive: /*receive*/ ctx[3],
    		fade,
    		key: /*_key*/ ctx[0]
    	}
    });

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (11:2) {#each Array(12) as item, key}
    function create_each_block$4(ctx) {
    	let a;
    	let target;
    	let t0;
    	let div;
    	let t1;
    	let t2;
    	let a_href_value;
    	let current;

    	target = new Target({
    			props: {
    				receive: /*receive*/ ctx[3],
    				send: /*send*/ ctx[2],
    				hide: /*key*/ ctx[9] == /*_key*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(target.$$.fragment);
    			t0 = space();
    			div = element("div");
    			t1 = text(/*key*/ ctx[9]);
    			t2 = space();
    			attr_dev(div, "class", "content");
    			set_style(div, "color", "white");
    			add_location(div, file$x, 16, 6, 680);
    			attr_dev(a, "class", "card");
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[1]("./:key", { key: /*key*/ ctx[9] }));
    			set_style(a, "background", "#333");
    			add_location(a, file$x, 11, 4, 338);
    		},
    		m: function mount(target$1, anchor) {
    			insert_dev(target$1, a, anchor);
    			mount_component(target, a, null);
    			append_dev(a, t0);
    			append_dev(a, div);
    			append_dev(div, t1);
    			append_dev(a, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const target_changes = {};
    			if (dirty & /*_key*/ 1) target_changes.hide = /*key*/ ctx[9] == /*_key*/ ctx[0];
    			target.$set(target_changes);

    			if (!current || dirty & /*$url*/ 2 && a_href_value !== (a_href_value = /*$url*/ ctx[1]("./:key", { key: /*key*/ ctx[9] }))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(target.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(target.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(target);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(11:2) {#each Array(12) as item, key}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$C(ctx) {
    	let div;
    	let t;
    	let current;
    	let each_value = Array(12);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "cards");
    			add_location(div, file$x, 9, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url, receive, send, _key*/ 15) {
    				each_value = Array(12);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, _key*/ 17) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_default_slot_changes$1, get_default_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
    	let $context;
    	let $url;
    	validate_store(context, "context");
    	component_subscribe($$self, context, $$value => $$invalidate(6, $context = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const [send, receive] = crossfade({});
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		url,
    		context,
    		afterPageLoad,
    		crossfade,
    		fade,
    		Target,
    		send,
    		receive,
    		_key,
    		$context,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("_key" in $$props) $$invalidate(0, _key = $$props._key);
    	};

    	let _key;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$context*/ 64) {
    			 $$invalidate(0, _key = $context.child && $context.child.params.key);
    		}
    	};

    	return [_key, $url, send, receive, $$scope, slots];
    }

    class Layout$9 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }
    Layout$9.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"context","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"afterPageLoad","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"crossfade","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"fade","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Target","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"send","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"receive","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"_key","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$context","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _layout$9 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$9
    });

    /* src/pages/example/modal/animated/[key].svelte generated by Svelte v3.29.0 */
    const file$y = "src/pages/example/modal/animated/[key].svelte";

    function create_fragment$D(ctx) {
    	let div1;
    	let div0;
    	let t_value = /*scoped*/ ctx[0].key + "";
    	let t;
    	let div0_intro;
    	let div0_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(t_value);
    			attr_dev(div0, "class", "modal");
    			add_location(div0, file$y, 7, 2, 210);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$y, 6, 0, 153);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*scoped*/ 1) && t_value !== (t_value = /*scoped*/ ctx[0].key + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (div0_outro) div0_outro.end(1);
    					if (!div0_intro) div0_intro = create_in_transition(div0, /*receive*/ ctx[3], { key: "modal" });
    					div0_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (div0_intro) div0_intro.invalidate();

    			if (local) {
    				div0_outro = create_out_transition(div0, /*send*/ ctx[2], { key: "modal" });
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div0_outro) div0_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
    	let $goto;
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(1, $goto = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("U5Bkeyu5D", slots, []);
    	let { scoped } = $$props;
    	const { send, receive, activeKey, key } = scoped;
    	const writable_props = ["scoped"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<U5Bkeyu5D> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $goto("../");

    	$$self.$$set = $$props => {
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    	};

    	$$self.$capture_state = () => ({
    		goto,
    		params,
    		context,
    		scoped,
    		send,
    		receive,
    		activeKey,
    		key,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scoped, $goto, send, receive, click_handler];
    }

    class U5Bkeyu5D extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, { scoped: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "U5Bkeyu5D",
    			options,
    			id: create_fragment$D.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*scoped*/ ctx[0] === undefined && !("scoped" in props)) {
    			console.warn("<U5Bkeyu5D> was created without expected prop 'scoped'");
    		}
    	}

    	get scoped() {
    		throw new Error("<U5Bkeyu5D>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<U5Bkeyu5D>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    U5Bkeyu5D.$compile = {"vars":[{"name":"goto","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"params","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"context","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"scoped","export_name":"scoped","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"send","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"receive","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"activeKey","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"key","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"$goto","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _key_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': U5Bkeyu5D
    });

    /* src/pages/example/modal/animated/index.svelte generated by Svelte v3.29.0 */

    function create_fragment$E(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Animated", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Animated> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Animated extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Animated",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }
    Animated.$compile = {"vars":[]};

    var index$a = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Animated
    });

    /* src/pages/example/modal/basic/_layout.svelte generated by Svelte v3.29.0 */
    const file$z = "src/pages/example/modal/basic/_layout.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (8:2) {#each Array(12) as item, key}
    function create_each_block$5(ctx) {
    	let a;
    	let div;
    	let t0;
    	let t1;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			t0 = text(/*key*/ ctx[5]);
    			t1 = space();
    			attr_dev(div, "class", "content");
    			add_location(div, file$z, 9, 8, 230);
    			attr_dev(a, "class", "card");
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("./:key", { key: /*key*/ ctx[5] }));
    			add_location(a, file$z, 8, 6, 174);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, t0);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("./:key", { key: /*key*/ ctx[5] }))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(8:2) {#each Array(12) as item, key}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$F(ctx) {
    	let div;
    	let t;
    	let current;
    	let each_value = Array(12);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "cards");
    			add_location(div, file$z, 6, 0, 111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1) {
    				each_value = Array(12);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ url, params, getContext, $url });
    	return [$url, $$scope, slots];
    }

    class Layout$a extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }
    Layout$a.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"params","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"getContext","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _layout$a = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Layout$a
    });

    /* src/pages/example/modal/basic/[key].svelte generated by Svelte v3.29.0 */
    const file$A = "src/pages/example/modal/basic/[key].svelte";

    function create_fragment$G(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*key*/ ctx[0]);
    			attr_dev(div0, "class", "modal");
    			add_location(div0, file$A, 7, 2, 144);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$A, 6, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*key*/ 1) set_data_dev(t, /*key*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
    	let $goto;
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(1, $goto = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("U5Bkeyu5D", slots, []);
    	let { key } = $$props;
    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<U5Bkeyu5D> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $goto("../");

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({ goto, url, key, $goto });

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [key, $goto, click_handler];
    }

    class U5Bkeyu5D$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, { key: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "U5Bkeyu5D",
    			options,
    			id: create_fragment$G.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<U5Bkeyu5D> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<U5Bkeyu5D>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<U5Bkeyu5D>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    U5Bkeyu5D$1.$compile = {"vars":[{"name":"goto","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"key","export_name":"key","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$goto","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _key_$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': U5Bkeyu5D$1
    });

    /* src/pages/example/modal/basic/index.svelte generated by Svelte v3.29.0 */

    function create_fragment$H(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$H.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$H($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Basic", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Basic> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Basic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Basic",
    			options,
    			id: create_fragment$H.name
    		});
    	}
    }
    Basic.$compile = {"vars":[]};

    var index$b = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Basic
    });

    /* src/pages/example/modal/index.svelte generated by Svelte v3.29.0 */

    function create_fragment$I(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$I.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$I($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$I.name
    		});
    	}
    }
    Modal.$compile = {"vars":[]};

    var index$c = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Modal
    });

    /* src/pages/example/reset/_fallback.svelte generated by Svelte v3.29.0 */
    const file$B = "src/pages/example/reset/_fallback.svelte";

    function create_fragment$J(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let a;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "404";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Page not found. \n  \n  ");
    			a = element("a");
    			t3 = text("Go back");
    			attr_dev(div0, "class", "huge svelte-ht28pc");
    			add_location(div0, file$B, 18, 2, 321);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../"));
    			add_location(a, file$B, 21, 2, 444);
    			attr_dev(div1, "class", "big");
    			add_location(div1, file$B, 19, 2, 351);
    			attr_dev(div2, "class", "e404 svelte-ht28pc");
    			add_location(div2, file$B, 17, 0, 300);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$J.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$J($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Fallback$4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$J.name
    		});
    	}
    }
    Fallback$4.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var _fallback$4 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Fallback$4
    });

    /* src/pages/example/reset/_reset.svelte generated by Svelte v3.29.0 */

    function create_fragment$K(ctx) {
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
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
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
    		id: create_fragment$K.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$K($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reset", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reset> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Reset$3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$K, create_fragment$K, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reset",
    			options,
    			id: create_fragment$K.name
    		});
    	}
    }
    Reset$3.$compile = {"vars":[]};

    var _reset$3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Reset$3
    });


    /* src/pages/example/reset/index.svelte generated by Svelte v3.29.0 */
    const file$C = "src/pages/example/reset/index.svelte";

    function create_fragment$L(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let a;
    	let t1;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			a = element("a");
    			t1 = text("Go back");
    			if (img.src !== (img_src_value = "data:image/png;base64, " + base64Kevin)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "KEVIN!");
    			attr_dev(img, "class", "center svelte-1twh820");
    			add_location(img, file$C, 17, 0, 328);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../../"));
    			add_location(a, file$C, 19, 0, 408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$L.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$L($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reset", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reset> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url, base64Kevin, $url });
    	return [$url];
    }

    class Reset$4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$L, create_fragment$L, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reset",
    			options,
    			id: create_fragment$L.name
    		});
    	}
    }
    Reset$4.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"base64Kevin","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var index$d = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Reset$4
    });

    /* src/pages/example/Splash.svelte generated by Svelte v3.29.0 */
    const file$D = "src/pages/example/Splash.svelte";

    // (69:8) {#if show}
    function create_if_block_1$1(ctx) {
    	let path0;
    	let path0_transition;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let path1;
    	let path1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", " M 564.251 625.251 L 659 720 L 700 675 L 781 994 L 457 921 L 506\n            873 L 249 626 L 249 626 L 542.5 626 C 549.812 626 557.065 625.748\n            564.251 625.251 Z ");
    			attr_dev(path0, "fill", "url(#_lgradient_2)");
    			attr_dev(path0, "class", "svelte-19oi5i");
    			add_location(path0, file$D, 69, 10, 1833);
    			attr_dev(stop0, "offset", "2.1739130434782608%");
    			attr_dev(stop0, "stop-opacity", "1");
    			set_style(stop0, "stop-color", "rgb(241,93,232)");
    			add_location(stop0, file$D, 83, 12, 2434);
    			attr_dev(stop1, "offset", "100%");
    			attr_dev(stop1, "stop-opacity", "1");
    			set_style(stop1, "stop-color", "rgb(184,58,177)");
    			add_location(stop1, file$D, 87, 12, 2578);
    			attr_dev(linearGradient, "id", "_lgradient_3");
    			attr_dev(linearGradient, "x1", "0.13056277056277052");
    			attr_dev(linearGradient, "y1", "0.05232744783306609");
    			attr_dev(linearGradient, "x2", "0.9350649350649348");
    			attr_dev(linearGradient, "y2", "0.7710005350454795");
    			attr_dev(linearGradient, "gradientTransform", "matrix(770,0,0,623,84,3)");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$D, 75, 10, 2129);
    			attr_dev(path1, "d", " M 542.5 215.388 L 84 215.388 L 203 3 L 542.5 3 L 542.5 3 C\n            714.422 3 854 142.578 854 314.5 C 854 486.422 714.422 626 542.5 626\n            L 249 626 L 364 413.612 L 542.5 413.612 L 542.5 413.612 C 597.201\n            413.612 641.612 369.201 641.612 314.5 C 641.612 259.799 597.201\n            215.388 542.5 215.388 L 542.5 215.388 L 542.5 215.388 Z ");
    			attr_dev(path1, "fill", "url(#_lgradient_3)");
    			attr_dev(path1, "class", "svelte-19oi5i");
    			add_location(path1, file$D, 92, 10, 2733);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, linearGradient, anchor);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			insert_dev(target, path1, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!path0_transition) path0_transition = create_bidirectional_transition(path0, draw, { duration: /*duration*/ ctx[3] }, true);
    					path0_transition.run(1);
    				});
    			}

    			if (local) {
    				add_render_callback(() => {
    					if (!path1_transition) path1_transition = create_bidirectional_transition(path1, draw, { duration: /*duration*/ ctx[3] }, true);
    					path1_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!path0_transition) path0_transition = create_bidirectional_transition(path0, draw, { duration: /*duration*/ ctx[3] }, false);
    				path0_transition.run(0);
    			}

    			if (local) {
    				if (!path1_transition) path1_transition = create_bidirectional_transition(path1, draw, { duration: /*duration*/ ctx[3] }, false);
    				path1_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching && path0_transition) path0_transition.end();
    			if (detaching) detach_dev(linearGradient);
    			if (detaching) detach_dev(path1);
    			if (detaching && path1_transition) path1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(69:8) {#if show}",
    		ctx
    	});

    	return block;
    }

    // (107:4) {#if error}
    function create_if_block$6(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Your app should probably have loaded by now";
    			add_location(h3, file$D, 107, 6, 3338);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(107:4) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$M(ctx) {
    	let div2;
    	let div0;
    	let svg;
    	let defs;
    	let clipPath;
    	let rect;
    	let g;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let t0;
    	let h1;
    	let t2;
    	let div1;
    	let if_block0 = /*show*/ ctx[1] && create_if_block_1$1(ctx);
    	let if_block1 = /*error*/ ctx[2] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect = svg_element("rect");
    			g = svg_element("g");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Generating routes...";
    			t2 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(rect, "width", "1000");
    			attr_dev(rect, "height", "1000");
    			add_location(rect, file$D, 47, 10, 1076);
    			attr_dev(clipPath, "id", "_clipPath_40vHZL606H8eXCPAFONHYpjfq1ISybTL");
    			add_location(clipPath, file$D, 46, 8, 1007);
    			add_location(defs, file$D, 45, 6, 992);
    			attr_dev(stop0, "offset", "1.7391304347826086%");
    			attr_dev(stop0, "stop-opacity", "1");
    			set_style(stop0, "stop-color", "rgb(255,124,247)");
    			add_location(stop0, file$D, 59, 10, 1529);
    			attr_dev(stop1, "offset", "100%");
    			attr_dev(stop1, "stop-opacity", "1");
    			set_style(stop1, "stop-color", "rgb(255,203,252)");
    			add_location(stop1, file$D, 63, 10, 1666);
    			attr_dev(linearGradient, "id", "_lgradient_2");
    			attr_dev(linearGradient, "x1", "-0.011142038971568513");
    			attr_dev(linearGradient, "y1", "-0.011791871475954507");
    			attr_dev(linearGradient, "x2", "0.9938039543302696");
    			attr_dev(linearGradient, "y2", "0.9909604299907665");
    			attr_dev(linearGradient, "gradientTransform", "matrix(532,0,0,368.749,249,625.251)");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$D, 51, 8, 1225);
    			attr_dev(g, "clip-path", "url(#_clipPath_40vHZL606H8eXCPAFONHYpjfq1ISybTL)");
    			add_location(g, file$D, 50, 6, 1152);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			set_style(svg, "isolation", "isolate");
    			attr_dev(svg, "viewBox", "0 0 1000 1000");
    			add_location(svg, file$D, 40, 4, 828);
    			attr_dev(div0, "class", "svg svelte-19oi5i");
    			toggle_class(div0, "drawing", /*drawing*/ ctx[0]);
    			add_location(div0, file$D, 39, 2, 792);
    			add_location(h1, file$D, 104, 2, 3255);
    			attr_dev(div1, "class", "error svelte-19oi5i");
    			add_location(div1, file$D, 105, 2, 3296);
    			attr_dev(div2, "class", "container svelte-19oi5i");
    			add_location(div2, file$D, 38, 0, 766);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, svg);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect);
    			append_dev(svg, g);
    			append_dev(g, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(div2, t0);
    			append_dev(div2, h1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*show*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(g, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*drawing*/ 1) {
    				toggle_class(div0, "drawing", /*drawing*/ ctx[0]);
    			}

    			if (/*error*/ ctx[2]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block0);
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$M.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$M($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Splash", slots, []);
    	let duration = 2000;
    	let drawing = true;
    	let show = false;
    	let error = false;
    	setTimeout(() => $$invalidate(1, show = true));
    	setTimeout(() => $$invalidate(0, drawing = false), 1800);
    	setTimeout(() => $$invalidate(2, error = true), 5000);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Splash> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ draw, duration, drawing, show, error });

    	$$self.$inject_state = $$props => {
    		if ("duration" in $$props) $$invalidate(3, duration = $$props.duration);
    		if ("drawing" in $$props) $$invalidate(0, drawing = $$props.drawing);
    		if ("show" in $$props) $$invalidate(1, show = $$props.show);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [drawing, show, error, duration];
    }

    class Splash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$M, create_fragment$M, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splash",
    			options,
    			id: create_fragment$M.name
    		});
    	}
    }
    Splash.$compile = {"vars":[{"name":"draw","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"duration","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"drawing","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"show","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"error","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true}]};

    var Splash$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Splash
    });

    /* node_modules/@sveltech/routify/runtime/decorators/BaseTransition.svelte generated by Svelte v3.29.0 */
    const file$E = "node_modules/@sveltech/routify/runtime/decorators/BaseTransition.svelte";

    function create_fragment$N(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "transition svelte-1i1inzt");
    			add_location(div, file$E, 67, 0, 1961);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "introstart", removeAbsolute, false, false, false),
    					listen_dev(div, "outrostart", setAbsolute, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (div_outro) div_outro.end(1);
    					if (!div_intro) div_intro = create_in_transition(div, /*transition*/ ctx[0], /*inParams*/ ctx[1]);
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();

    			if (local) {
    				div_outro = create_out_transition(div, /*transition*/ ctx[0], /*outParams*/ ctx[2]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$N.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function setAbsolute({ target }) {
    	const rect = target.getBoundingClientRect();
    	target.style.width = `${rect.width}px`;
    	target.style.height = `${rect.height}px`;
    	target.style.top = `${rect.top}px`;
    	target.style.left = `${rect.left}px`;

    	// target.style.transform = 'translate(-50%, -50%)'
    	target.style.position = "fixed";
    }

    function removeAbsolute({ target }) {
    	target.style.position = "";
    	target.style.width = "";
    	target.style.height = "";
    	target.style.transform = "";
    }

    function instance$N($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(8, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BaseTransition", slots, ['default']);
    	let { configs = [] } = $$props;
    	let { config = false } = $$props;

    	const defaultConfig = {
    		transition: fade,
    		inParams: {},
    		outParams: {}
    	};

    	function isAncestor(descendant, ancestor) {
    		if (descendant.parent === ancestor.parent) return false;
    		const { shortPath } = descendant.parent;
    		const { shortPath: shortPath2 } = ancestor.parent;
    		return ancestor.isIndex && shortPath !== shortPath2 && shortPath.startsWith(shortPath2);
    	}

    	const writable_props = ["configs", "config"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BaseTransition> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("configs" in $$props) $$invalidate(3, configs = $$props.configs);
    		if ("config" in $$props) $$invalidate(4, config = $$props.config);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getConcestor,
    		fade,
    		route,
    		configs,
    		config,
    		defaultConfig,
    		isAncestor,
    		setAbsolute,
    		removeAbsolute,
    		oldRoute,
    		$route,
    		concestor,
    		ancestor,
    		oldAncestor,
    		toAncestor,
    		toDescendant,
    		toHigherIndex,
    		toLowerIndex,
    		meta,
    		_config,
    		normalizedConfig,
    		transition,
    		inParams,
    		outParams
    	});

    	$$self.$inject_state = $$props => {
    		if ("configs" in $$props) $$invalidate(3, configs = $$props.configs);
    		if ("config" in $$props) $$invalidate(4, config = $$props.config);
    		if ("oldRoute" in $$props) $$invalidate(7, oldRoute = $$props.oldRoute);
    		if ("concestor" in $$props) concestor = $$props.concestor;
    		if ("ancestor" in $$props) $$invalidate(10, ancestor = $$props.ancestor);
    		if ("oldAncestor" in $$props) $$invalidate(11, oldAncestor = $$props.oldAncestor);
    		if ("toAncestor" in $$props) $$invalidate(12, toAncestor = $$props.toAncestor);
    		if ("toDescendant" in $$props) $$invalidate(13, toDescendant = $$props.toDescendant);
    		if ("toHigherIndex" in $$props) $$invalidate(14, toHigherIndex = $$props.toHigherIndex);
    		if ("toLowerIndex" in $$props) $$invalidate(15, toLowerIndex = $$props.toLowerIndex);
    		if ("meta" in $$props) $$invalidate(16, meta = $$props.meta);
    		if ("_config" in $$props) $$invalidate(17, _config = $$props._config);
    		if ("normalizedConfig" in $$props) $$invalidate(18, normalizedConfig = $$props.normalizedConfig);
    		if ("transition" in $$props) $$invalidate(0, transition = $$props.transition);
    		if ("inParams" in $$props) $$invalidate(1, inParams = $$props.inParams);
    		if ("outParams" in $$props) $$invalidate(2, outParams = $$props.outParams);
    	};

    	let oldRoute;
    	let concestor;
    	let ancestor;
    	let oldAncestor;
    	let toAncestor;
    	let toDescendant;
    	let toHigherIndex;
    	let toLowerIndex;
    	let meta;
    	let _config;
    	let normalizedConfig;
    	let transition;
    	let inParams;
    	let outParams;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$route*/ 256) {
    			 $$invalidate(7, oldRoute = $route.last || $route);
    		}

    		if ($$self.$$.dirty & /*$route, oldRoute*/ 384) {
    			 $$invalidate(10, [concestor, ancestor, oldAncestor] = getConcestor($route.api, oldRoute.api), ancestor, (($$invalidate(11, oldAncestor), $$invalidate(8, $route)), $$invalidate(7, oldRoute)));
    		}

    		if ($$self.$$.dirty & /*oldRoute, $route*/ 384) {
    			 $$invalidate(12, toAncestor = isAncestor(oldRoute, $route));
    		}

    		if ($$self.$$.dirty & /*$route, oldRoute*/ 384) {
    			 $$invalidate(13, toDescendant = isAncestor($route, oldRoute));
    		}

    		if ($$self.$$.dirty & /*ancestor, oldAncestor*/ 3072) {
    			 $$invalidate(14, toHigherIndex = ancestor && ancestor.meta.index > oldAncestor.meta.index);
    		}

    		if ($$self.$$.dirty & /*ancestor, oldAncestor*/ 3072) {
    			 $$invalidate(15, toLowerIndex = ancestor && ancestor.meta.index < oldAncestor.meta.index);
    		}

    		if ($$self.$$.dirty & /*toAncestor, toDescendant, toHigherIndex, toLowerIndex, $route, oldRoute, ancestor, oldAncestor*/ 64896) {
    			 $$invalidate(16, meta = {
    				toAncestor,
    				toDescendant,
    				toHigherIndex,
    				toLowerIndex,
    				routes: [$route, oldRoute],
    				pages: [$route.api, oldRoute.api],
    				ancestors: [ancestor, oldAncestor]
    			});
    		}

    		if ($$self.$$.dirty & /*configs, meta, config*/ 65560) {
    			 $$invalidate(17, _config = configs.find(({ condition }) => condition(meta)) || config || defaultConfig);
    		}

    		if ($$self.$$.dirty & /*_config*/ 131072) {
    			 $$invalidate(18, normalizedConfig = { ...defaultConfig, ..._config });
    		}

    		if ($$self.$$.dirty & /*normalizedConfig*/ 262144) {
    			 $$invalidate(0, { transition, inParams, outParams } = normalizedConfig, transition, ((((((((((((($$invalidate(1, inParams), $$invalidate(18, normalizedConfig)), $$invalidate(17, _config)), $$invalidate(3, configs)), $$invalidate(16, meta)), $$invalidate(4, config)), $$invalidate(12, toAncestor)), $$invalidate(13, toDescendant)), $$invalidate(14, toHigherIndex)), $$invalidate(15, toLowerIndex)), $$invalidate(8, $route)), $$invalidate(7, oldRoute)), $$invalidate(10, ancestor)), $$invalidate(11, oldAncestor)), ((((((((((((($$invalidate(2, outParams), $$invalidate(18, normalizedConfig)), $$invalidate(17, _config)), $$invalidate(3, configs)), $$invalidate(16, meta)), $$invalidate(4, config)), $$invalidate(12, toAncestor)), $$invalidate(13, toDescendant)), $$invalidate(14, toHigherIndex)), $$invalidate(15, toLowerIndex)), $$invalidate(8, $route)), $$invalidate(7, oldRoute)), $$invalidate(10, ancestor)), $$invalidate(11, oldAncestor)));
    		}
    	};

    	return [transition, inParams, outParams, configs, config, $$scope, slots];
    }

    class BaseTransition extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$N, create_fragment$N, safe_not_equal, { configs: 3, config: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BaseTransition",
    			options,
    			id: create_fragment$N.name
    		});
    	}

    	get configs() {
    		throw new Error("<BaseTransition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set configs(value) {
    		throw new Error("<BaseTransition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<BaseTransition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<BaseTransition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    BaseTransition.$compile = {"vars":[{"name":"getConcestor","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"fade","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"route","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"configs","export_name":"configs","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"config","export_name":"config","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"defaultConfig","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"isAncestor","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"setAbsolute","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"removeAbsolute","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"oldRoute","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$route","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"concestor","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"ancestor","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"oldAncestor","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"toAncestor","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"toDescendant","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"toHigherIndex","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"toLowerIndex","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"meta","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"_config","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"normalizedConfig","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"transition","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"inParams","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"outParams","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* node_modules/@sveltech/routify/runtime/decorators/TabsTransition.svelte generated by Svelte v3.29.0 */

    // (46:0) <BaseTransition {configs}>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(46:0) <BaseTransition {configs}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$O(ctx) {
    	let basetransition;
    	let current;

    	basetransition = new BaseTransition({
    			props: {
    				configs: /*configs*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(basetransition.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(basetransition, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const basetransition_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				basetransition_changes.$$scope = { dirty, ctx };
    			}

    			basetransition.$set(basetransition_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(basetransition.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(basetransition.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(basetransition, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$O.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$O($$self, $$props, $$invalidate) {
    	let $width;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabsTransition", slots, ['default']);
    	let { scoped } = $$props;
    	const { width } = scoped;
    	validate_store(width, "width");
    	component_subscribe($$self, width, value => $$invalidate(5, $width = value));

    	const configs = [
    		{
    			// New and old route are identical, do nothing
    			condition: ({ routes }) => routes[0] === routes[1],
    			transition: () => {
    				
    			}
    		},
    		{
    			condition: c => c.toAncestor,
    			transition: scale,
    			inParams: { start: 1.2 },
    			outParams: { start: 0.8 }
    		},
    		{
    			condition: c => c.toDescendant,
    			transition: scale,
    			inParams: { start: 0.8 },
    			outParams: { start: 1.2 }
    		},
    		{
    			condition: c => c.toHigherIndex,
    			transition: fly,
    			inParams: { x: $width, duration: 500 },
    			outParams: { x: -$width, duration: 500 }
    		},
    		{
    			condition: c => c.toLowerIndex,
    			transition: fly,
    			inParams: { x: -$width, duration: 500 },
    			outParams: { x: $width, duration: 500 }
    		},
    		{
    			// No matching config. We don't want a transition
    			condition: () => true,
    			transition: () => {
    				
    			}
    		}
    	];

    	const writable_props = ["scoped"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabsTransition> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("scoped" in $$props) $$invalidate(2, scoped = $$props.scoped);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		fly,
    		BaseTransition,
    		scoped,
    		width,
    		configs,
    		$width
    	});

    	$$self.$inject_state = $$props => {
    		if ("scoped" in $$props) $$invalidate(2, scoped = $$props.scoped);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, configs, scoped, slots, $$scope];
    }

    class TabsTransition extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$O, create_fragment$O, safe_not_equal, { scoped: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabsTransition",
    			options,
    			id: create_fragment$O.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*scoped*/ ctx[2] === undefined && !("scoped" in props)) {
    			console.warn("<TabsTransition> was created without expected prop 'scoped'");
    		}
    	}

    	get scoped() {
    		throw new Error("<TabsTransition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<TabsTransition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    TabsTransition.$compile = {"vars":[{"name":"scale","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"fly","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"BaseTransition","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"scoped","export_name":"scoped","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"width","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"configs","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$width","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/transitions/tabs/_components/BottomNav.svelte generated by Svelte v3.29.0 */
    const file$F = "src/pages/example/transitions/tabs/_components/BottomNav.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i].name;
    	child_ctx[12] = list[i].path;
    	child_ctx[13] = list[i].active;
    	child_ctx[14] = list[i].href;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (74:2) {#each urls as { name, path, active, href }
    function create_each_block$6(ctx) {
    	let a;
    	let t_value = /*name*/ ctx[11] + "";
    	let t;
    	let a_href_value;
    	let saveElement_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			set_style(a, "line-height", /*height*/ ctx[1]);
    			attr_dev(a, "href", a_href_value = /*href*/ ctx[14]);
    			attr_dev(a, "class", "svelte-10yk5iz");
    			toggle_class(a, "active", /*active*/ ctx[13]);
    			add_location(a, file$F, 74, 4, 1992);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = action_destroyer(saveElement_action = /*saveElement*/ ctx[5].call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*urls*/ 1 && t_value !== (t_value = /*name*/ ctx[11] + "")) set_data_dev(t, t_value);

    			if (dirty & /*height*/ 2) {
    				set_style(a, "line-height", /*height*/ ctx[1]);
    			}

    			if (dirty & /*urls*/ 1 && a_href_value !== (a_href_value = /*href*/ ctx[14])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*urls*/ 1) {
    				toggle_class(a, "active", /*active*/ ctx[13]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(74:2) {#each urls as { name, path, active, href }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$P(ctx) {
    	let nav;
    	let t;
    	let div;
    	let nav_resize_listener;
    	let each_value = /*urls*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "overlay svelte-10yk5iz");
    			set_style(div, "background-color", /*color*/ ctx[4]);
    			add_location(div, file$F, 82, 2, 2120);
    			attr_dev(nav, "class", "svelte-10yk5iz");
    			add_render_callback(() => /*nav_elementresize_handler*/ ctx[7].call(nav));
    			add_location(nav, file$F, 72, 0, 1915);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			append_dev(nav, t);
    			append_dev(nav, div);
    			/*div_binding*/ ctx[6](div);
    			nav_resize_listener = add_resize_listener(nav, /*nav_elementresize_handler*/ ctx[7].bind(nav));
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*height, urls*/ 3) {
    				each_value = /*urls*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*color*/ 16) {
    				set_style(div, "background-color", /*color*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[6](null);
    			nav_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$P.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function copyDimensions(source, target) {
    	target.style.left = source.offsetLeft + "px";
    	target.style.top = source.offsetTop + "px";
    	target.style.width = source.clientWidth + "px";
    	target.style.height = source.clientHeight + "px";
    }

    function instance$P($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BottomNav", slots, []);
    	let { urls } = $$props, { height } = $$props;
    	let linkElems = [];
    	let overlay;
    	let clientWidth;
    	const saveElement = el => $$invalidate(8, linkElems = [...linkElems, el]);
    	const writable_props = ["urls", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BottomNav> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			overlay = $$value;
    			$$invalidate(2, overlay);
    		});
    	}

    	function nav_elementresize_handler() {
    		clientWidth = this.clientWidth;
    		$$invalidate(3, clientWidth);
    	}

    	$$self.$$set = $$props => {
    		if ("urls" in $$props) $$invalidate(0, urls = $$props.urls);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({
    		url,
    		isActive,
    		urls,
    		height,
    		linkElems,
    		overlay,
    		clientWidth,
    		copyDimensions,
    		saveElement,
    		urlsWithElem,
    		activeUrl,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ("urls" in $$props) $$invalidate(0, urls = $$props.urls);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("linkElems" in $$props) $$invalidate(8, linkElems = $$props.linkElems);
    		if ("overlay" in $$props) $$invalidate(2, overlay = $$props.overlay);
    		if ("clientWidth" in $$props) $$invalidate(3, clientWidth = $$props.clientWidth);
    		if ("urlsWithElem" in $$props) $$invalidate(9, urlsWithElem = $$props.urlsWithElem);
    		if ("activeUrl" in $$props) $$invalidate(10, activeUrl = $$props.activeUrl);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	let urlsWithElem;
    	let activeUrl;
    	let color;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*linkElems, urls*/ 257) {
    			 $$invalidate(9, urlsWithElem = linkElems.map((elem, i) => ({ ...urls[i], elem })));
    		}

    		if ($$self.$$.dirty & /*urlsWithElem*/ 512) {
    			 $$invalidate(10, activeUrl = urlsWithElem.find(({ active }) => active));
    		}

    		if ($$self.$$.dirty & /*overlay, clientWidth, activeUrl*/ 1036) {
    			 if (overlay && clientWidth && activeUrl) copyDimensions(activeUrl.elem, overlay);
    		}

    		if ($$self.$$.dirty & /*activeUrl*/ 1024) {
    			 $$invalidate(4, color = activeUrl && activeUrl.color);
    		}
    	};

    	return [
    		urls,
    		height,
    		overlay,
    		clientWidth,
    		color,
    		saveElement,
    		div_binding,
    		nav_elementresize_handler
    	];
    }

    class BottomNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$P, create_fragment$P, safe_not_equal, { urls: 0, height: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BottomNav",
    			options,
    			id: create_fragment$P.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*urls*/ ctx[0] === undefined && !("urls" in props)) {
    			console.warn("<BottomNav> was created without expected prop 'urls'");
    		}

    		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
    			console.warn("<BottomNav> was created without expected prop 'height'");
    		}
    	}

    	get urls() {
    		throw new Error("<BottomNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set urls(value) {
    		throw new Error("<BottomNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<BottomNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<BottomNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    BottomNav.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"isActive","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"urls","export_name":"urls","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"height","export_name":"height","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"linkElems","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"overlay","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"clientWidth","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"copyDimensions","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"saveElement","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"urlsWithElem","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"activeUrl","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"color","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/transitions/tabs/_reset.svelte generated by Svelte v3.29.0 */
    const file$G = "src/pages/example/transitions/tabs/_reset.svelte";
    const get_default_slot_changes$2 = dirty => ({ scoped: dirty & /*urlOrder*/ 4 });

    const get_default_slot_context$2 = ctx => ({
    	decorator: TabsTransition,
    	scoped: {
    		width: /*width*/ ctx[4],
    		urls: /*urlOrder*/ ctx[2]
    	}
    });

    function create_fragment$Q(ctx) {
    	let div;
    	let main;
    	let main_resize_listener;
    	let t0;
    	let bottomnav;
    	let t1;
    	let a;
    	let t2;
    	let a_href_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context$2);

    	bottomnav = new BottomNav({
    			props: { urls: /*urls*/ ctx[0], height: "64px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			main = element("main");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			create_component(bottomnav.$$.fragment);
    			t1 = space();
    			a = element("a");
    			t2 = text("Back to examples");
    			attr_dev(main, "class", "inset svelte-172xrga");
    			add_render_callback(() => /*main_elementresize_handler*/ ctx[7].call(main));
    			add_location(main, file$G, 53, 2, 1061);
    			set_style(div, "height", "100%");
    			attr_dev(div, "class", "svelte-172xrga");
    			add_location(div, file$G, 51, 0, 1031);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[1]("../../"));
    			attr_dev(a, "class", "svelte-172xrga");
    			add_location(a, file$G, 59, 0, 1238);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, main);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			main_resize_listener = add_resize_listener(main, /*main_elementresize_handler*/ ctx[7].bind(main));
    			append_dev(div, t0);
    			mount_component(bottomnav, div, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, urlOrder*/ 36) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_default_slot_changes$2, get_default_slot_context$2);
    				}
    			}

    			const bottomnav_changes = {};
    			if (dirty & /*urls*/ 1) bottomnav_changes.urls = /*urls*/ ctx[0];
    			bottomnav.$set(bottomnav_changes);

    			if (!current || dirty & /*$url*/ 2 && a_href_value !== (a_href_value = /*$url*/ ctx[1]("../../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(bottomnav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(bottomnav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			main_resize_listener();
    			destroy_component(bottomnav);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$Q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Q($$self, $$props, $$invalidate) {
    	let $url;
    	let $isActive;
    	let $width;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(8, $isActive = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reset", slots, ['default']);
    	const width = writable();
    	validate_store(width, "width");
    	component_subscribe($$self, width, value => $$invalidate(3, $width = value));
    	const color = writable();

    	const _urls = [
    		["./home", "Home", "#7fc5bb"],
    		["./feed", "Feed", "#0bf5cc"],
    		["./updates", "Updates", "#88f0d0"],
    		["./settings", "Settings", "#a1fac3"]
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reset> was created with unknown prop '${key}'`);
    	});

    	function main_elementresize_handler() {
    		$width = this.offsetWidth;
    		width.set($width);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TabsTransition,
    		writable,
    		BottomNav,
    		url,
    		isActive,
    		width,
    		color,
    		_urls,
    		urls,
    		$url,
    		$isActive,
    		urlOrder,
    		$width
    	});

    	$$self.$inject_state = $$props => {
    		if ("urls" in $$props) $$invalidate(0, urls = $$props.urls);
    		if ("urlOrder" in $$props) $$invalidate(2, urlOrder = $$props.urlOrder);
    	};

    	let urls;
    	let urlOrder;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$url, $isActive*/ 258) {
    			 $$invalidate(0, urls = _urls.map(([path, name, color]) => ({
    				name,
    				href: $url(path),
    				color,
    				active: !!$isActive(path)
    			})));
    		}

    		if ($$self.$$.dirty & /*urls*/ 1) {
    			 $$invalidate(2, urlOrder = urls.map(({ href }) => href));
    		}
    	};

    	return [
    		urls,
    		$url,
    		urlOrder,
    		$width,
    		width,
    		$$scope,
    		slots,
    		main_elementresize_handler
    	];
    }

    class Reset$5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reset",
    			options,
    			id: create_fragment$Q.name
    		});
    	}
    }
    Reset$5.$compile = {"vars":[{"name":"TabsTransition","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"writable","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"BottomNav","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"isActive","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"width","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"color","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"_urls","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"urls","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$isActive","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"urlOrder","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$width","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/transitions/tabs/home.svelte generated by Svelte v3.29.0 */

    const file$H = "src/pages/example/transitions/tabs/home.svelte";

    function create_fragment$R(ctx) {
    	let main;
    	let br;
    	let t0;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			br = element("br");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Home";
    			add_location(br, file$H, 9, 2, 135);
    			add_location(h1, file$H, 10, 2, 144);
    			attr_dev(main, "class", "svelte-cyhrr7");
    			add_location(main, file$H, 8, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br);
    			append_dev(main, t0);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$R.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$R($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$R, create_fragment$R, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$R.name
    		});
    	}
    }
    Home.$compile = {"vars":[]};

    /* src/pages/example/transitions/tabs/index.svelte generated by Svelte v3.29.0 */

    function create_fragment$S(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$S.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$S($$self, $$props, $$invalidate) {
    	let $redirect;
    	validate_store(redirect, "redirect");
    	component_subscribe($$self, redirect, $$value => $$invalidate(0, $redirect = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, []);
    	$redirect("../home");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ redirect, $redirect });
    	return [];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$S, create_fragment$S, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$S.name
    		});
    	}
    }
    Tabs.$compile = {"vars":[{"name":"redirect","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"$redirect","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/transitions/tabs/feed/_layout.svelte generated by Svelte v3.29.0 */

    const file$I = "src/pages/example/transitions/tabs/feed/_layout.svelte";

    function create_fragment$T(ctx) {
    	let main;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (default_slot) default_slot.c();
    			attr_dev(main, "class", "svelte-lfhy25");
    			add_location(main, file$I, 17, 0, 374);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
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
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$T.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$T($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Layout$b extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$T, create_fragment$T, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$T.name
    		});
    	}
    }
    Layout$b.$compile = {"vars":[]};

    /* src/pages/example/transitions/tabs/feed/[id]/index.svelte generated by Svelte v3.29.0 */
    const file$J = "src/pages/example/transitions/tabs/feed/[id]/index.svelte";

    function create_fragment$U(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let a0;
    	let t3;
    	let a0_href_value;
    	let t4;
    	let a1;
    	let t5;
    	let a1_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(/*id*/ ctx[0]);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			a0 = element("a");
    			t3 = text("Go home");
    			t4 = space();
    			a1 = element("a");
    			t5 = text("Go back");
    			add_location(h1, file$J, 12, 2, 196);
    			attr_dev(div, "class", "card");
    			set_style(div, "width", "512px");
    			add_location(div, file$J, 11, 0, 153);
    			add_location(br, file$J, 15, 0, 218);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[1]("../../../home"));
    			attr_dev(a0, "class", "svelte-1ia3qx");
    			add_location(a0, file$J, 17, 0, 226);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[1]("../../"));
    			attr_dev(a1, "class", "svelte-1ia3qx");
    			add_location(a1, file$J, 18, 0, 270);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a0, anchor);
    			append_dev(a0, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 1) set_data_dev(t0, /*id*/ ctx[0]);

    			if (dirty & /*$url*/ 2 && a0_href_value !== (a0_href_value = /*$url*/ ctx[1]("../../../home"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*$url*/ 2 && a1_href_value !== (a1_href_value = /*$url*/ ctx[1]("../../"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(a1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$U.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$U($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("U5Bidu5D", slots, []);
    	let { id } = $$props;
    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<U5Bidu5D> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ id, url, $url });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, $url];
    }

    class U5Bidu5D extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$U, create_fragment$U, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "U5Bidu5D",
    			options,
    			id: create_fragment$U.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<U5Bidu5D> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<U5Bidu5D>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<U5Bidu5D>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    U5Bidu5D.$compile = {"vars":[{"name":"id","export_name":"id","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/transitions/tabs/feed/index.svelte generated by Svelte v3.29.0 */
    const file$K = "src/pages/example/transitions/tabs/feed/index.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (9:0) {#each new Array(10) as item, id}
    function create_each_block$7(ctx) {
    	let a;
    	let h3;
    	let t0;
    	let t1;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(/*id*/ ctx[3]);
    			t1 = space();
    			attr_dev(h3, "class", "item");
    			add_location(h3, file$K, 10, 4, 206);
    			attr_dev(a, "class", "card");
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../:id", { id: /*id*/ ctx[3] }));
    			add_location(a, file$K, 9, 2, 155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../:id", { id: /*id*/ ctx[3] }))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(9:0) {#each new Array(10) as item, id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$V(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let each_1_anchor;
    	let each_value = new Array(10);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Feed";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h1, file$K, 5, 2, 97);
    			set_style(div, "padding-top", "20px");
    			add_location(div, file$K, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1) {
    				each_value = new Array(10);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$V.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$V($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Feed", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Feed> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Feed extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$V, create_fragment$V, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Feed",
    			options,
    			id: create_fragment$V.name
    		});
    	}
    }
    Feed.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/transitions/tabs/updates.svelte generated by Svelte v3.29.0 */

    const file$L = "src/pages/example/transitions/tabs/updates.svelte";

    function create_fragment$W(ctx) {
    	let main;
    	let br;
    	let t0;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			br = element("br");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Updates";
    			add_location(br, file$L, 10, 2, 117);
    			add_location(h1, file$L, 11, 2, 126);
    			attr_dev(main, "class", "svelte-1766e54");
    			add_location(main, file$L, 9, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br);
    			append_dev(main, t0);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$W.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$W($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Updates", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Updates> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Updates extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$W, create_fragment$W, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Updates",
    			options,
    			id: create_fragment$W.name
    		});
    	}
    }
    Updates.$compile = {"vars":[]};

    /* src/pages/example/transitions/tabs/settings.svelte generated by Svelte v3.29.0 */

    const file$M = "src/pages/example/transitions/tabs/settings.svelte";

    function create_fragment$X(ctx) {
    	let main;
    	let br;
    	let t0;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			br = element("br");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Settings";
    			add_location(br, file$M, 8, 0, 113);
    			add_location(h1, file$M, 9, 2, 120);
    			attr_dev(main, "class", "svelte-610moh");
    			add_location(main, file$M, 7, 0, 106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br);
    			append_dev(main, t0);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$X.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$X($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Settings", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$X, create_fragment$X, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$X.name
    		});
    	}
    }
    Settings.$compile = {"vars":[]};

    var _example_transitions_tabs = /*#__PURE__*/Object.freeze({
        __proto__: null,
        _example_transitions_tabs__reset: Reset$5,
        _example_transitions_tabs_home: Home,
        _example_transitions_tabs_index: Tabs,
        _example_transitions_tabs_feed__layout: Layout$b,
        _example_transitions_tabs_feed__id_index: U5Bidu5D,
        _example_transitions_tabs_feed_index: Feed,
        _example_transitions_tabs_updates: Updates,
        _example_transitions_tabs_settings: Settings
    });

    /* src/pages/example/_components/CrudWidget/_list.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1$2 } = globals;
    const file$N = "src/pages/example/_components/CrudWidget/_list.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i][0];
    	child_ctx[6] = list[i][1];
    	return child_ctx;
    }

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (16:6) {#each Object.entries(item).slice(0, 3) as [name, value]}
    function create_each_block_1$1(ctx) {
    	let div;
    	let b;
    	let t0_value = /*name*/ ctx[5] + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*value*/ ctx[6] + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			b = element("b");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			t3 = text(t3_value);
    			add_location(b, file$N, 17, 10, 366);
    			add_location(div, file$N, 16, 8, 350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, b);
    			append_dev(b, t0);
    			append_dev(b, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*name*/ ctx[5] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 1 && t3_value !== (t3_value = /*value*/ ctx[6] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(16:6) {#each Object.entries(item).slice(0, 3) as [name, value]}",
    		ctx
    	});

    	return block;
    }

    // (14:2) {#each data as item}
    function create_each_block$8(ctx) {
    	let a;
    	let t;
    	let a_href_value;
    	let each_value_1 = Object.entries(/*item*/ ctx[2]).slice(0, 3);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			a = element("a");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[1]("../:id", { id: /*item*/ ctx[2].id }));
    			attr_dev(a, "class", "item svelte-l3gjkc");
    			add_location(a, file$N, 14, 4, 222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(a, null);
    			}

    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, data*/ 1) {
    				each_value_1 = Object.entries(/*item*/ ctx[2]).slice(0, 3);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(a, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*$url, data*/ 3 && a_href_value !== (a_href_value = /*$url*/ ctx[1]("../:id", { id: /*item*/ ctx[2].id }))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(14:2) {#each data as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$Y(ctx) {
    	let div;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "items");
    			add_location(div, file$N, 12, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url, data, Object*/ 3) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$Y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Y($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, []);
    	let { data } = $$props;
    	const writable_props = ["data"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ url, data, $url });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, $url];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$Y, create_fragment$Y, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$Y.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<List> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    List.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"data","export_name":"data","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/_components/CrudWidget/_update.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1$3 } = globals;
    const file$O = "src/pages/example/_components/CrudWidget/_update.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    // (9:4) {#each Object.entries(item) as [name, value]}
    function create_each_block$9(ctx) {
    	let div;
    	let b;
    	let t0_value = /*name*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let t2;
    	let input;
    	let input_value_value;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			b = element("b");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			add_location(b, file$O, 10, 8, 223);
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = /*value*/ ctx[5];
    			add_location(input, file$O, 11, 8, 246);
    			add_location(div, file$O, 9, 6, 209);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, b);
    			append_dev(b, t0);
    			append_dev(b, t1);
    			append_dev(div, t2);
    			append_dev(div, input);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 2 && t0_value !== (t0_value = /*name*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*item*/ 2 && input_value_value !== (input_value_value = /*value*/ ctx[5]) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(9:4) {#each Object.entries(item) as [name, value]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$Z(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let br;
    	let t1;
    	let a;
    	let t2;
    	let a_href_value;
    	let each_value = Object.entries(/*item*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			br = element("br");
    			t1 = space();
    			a = element("a");
    			t2 = text("Back");
    			add_location(div0, file$O, 7, 2, 146);
    			add_location(br, file$O, 15, 2, 310);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[2]("../:id", { id: /*id*/ ctx[0] }));
    			add_location(a, file$O, 16, 2, 317);
    			add_location(div1, file$O, 6, 0, 137);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, br);
    			append_dev(div1, t1);
    			append_dev(div1, a);
    			append_dev(a, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, item*/ 2) {
    				each_value = Object.entries(/*item*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$url, id*/ 5 && a_href_value !== (a_href_value = /*$url*/ ctx[2]("../:id", { id: /*id*/ ctx[0] }))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$Z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Z($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(2, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Update", slots, []);
    	let { data } = $$props, { id } = $$props;
    	const writable_props = ["data", "id"];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Update> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ url, data, id, item, $url });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	let item;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, id*/ 9) {
    			 $$invalidate(1, item = data.filter(item => item.id == id)[0]);
    		}
    	};

    	return [id, item, $url, data];
    }

    class Update extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$Z, create_fragment$Z, safe_not_equal, { data: 3, id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Update",
    			options,
    			id: create_fragment$Z.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[3] === undefined && !("data" in props)) {
    			console.warn("<Update> was created without expected prop 'data'");
    		}

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Update> was created without expected prop 'id'");
    		}
    	}

    	get data() {
    		throw new Error("<Update>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Update>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Update>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Update>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Update.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"data","export_name":"data","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"id","export_name":"id","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"item","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/_components/CrudWidget/_view.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1$4 } = globals;
    const file$P = "src/pages/example/_components/CrudWidget/_view.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    // (8:0) {#if item}
    function create_if_block$7(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let br;
    	let t1;
    	let a0;
    	let t2;
    	let a0_href_value;
    	let t3;
    	let a1;
    	let t4;
    	let a1_href_value;
    	let each_value = Object.entries(/*item*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			br = element("br");
    			t1 = space();
    			a0 = element("a");
    			t2 = text("[Back]");
    			t3 = space();
    			a1 = element("a");
    			t4 = text("[Update]");
    			add_location(div0, file$P, 9, 4, 169);
    			add_location(br, file$P, 17, 4, 328);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[2]("../", { id: /*id*/ ctx[0] }));
    			add_location(a0, file$P, 18, 4, 339);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[2]("../:id/update", { id: /*id*/ ctx[0] }));
    			add_location(a1, file$P, 19, 4, 384);
    			add_location(div1, file$P, 8, 2, 159);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, br);
    			append_dev(div1, t1);
    			append_dev(div1, a0);
    			append_dev(a0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, a1);
    			append_dev(a1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, item*/ 2) {
    				each_value = Object.entries(/*item*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$url, id*/ 5 && a0_href_value !== (a0_href_value = /*$url*/ ctx[2]("../", { id: /*id*/ ctx[0] }))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*$url, id*/ 5 && a1_href_value !== (a1_href_value = /*$url*/ ctx[2]("../:id/update", { id: /*id*/ ctx[0] }))) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(8:0) {#if item}",
    		ctx
    	});

    	return block;
    }

    // (11:6) {#each Object.entries(item) as [name, value]}
    function create_each_block$a(ctx) {
    	let div;
    	let b;
    	let t0_value = /*name*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*value*/ ctx[5] + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			b = element("b");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			add_location(b, file$P, 12, 10, 251);
    			add_location(div, file$P, 11, 8, 235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, b);
    			append_dev(b, t0);
    			append_dev(b, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 2 && t0_value !== (t0_value = /*name*/ ctx[4] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*item*/ 2 && t3_value !== (t3_value = /*value*/ ctx[5] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(11:6) {#each Object.entries(item) as [name, value]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$_(ctx) {
    	let if_block_anchor;
    	let if_block = /*item*/ ctx[1] && create_if_block$7(ctx);

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
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*item*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$_.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$_($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(2, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("View", slots, []);
    	let { data = [] } = $$props, { id } = $$props;
    	const writable_props = ["data", "id"];

    	Object_1$4.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<View> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ url, data, id, item, $url });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	let item;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, id*/ 9) {
    			 $$invalidate(1, item = data.filter(item => item.id == id)[0]);
    		}
    	};

    	return [id, item, $url, data];
    }

    class View extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$_, create_fragment$_, safe_not_equal, { data: 3, id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "View",
    			options,
    			id: create_fragment$_.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<View> was created without expected prop 'id'");
    		}
    	}

    	get data() {
    		throw new Error("<View>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<View>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<View>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<View>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    View.$compile = {"vars":[{"name":"url","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"data","export_name":"data","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"id","export_name":"id","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"item","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$url","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/pages/example/_components/CrudWidget/Index.svelte generated by Svelte v3.29.0 */
    const file$Q = "src/pages/example/_components/CrudWidget/Index.svelte";

    function create_fragment$$(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let switch_instance;
    	let current;
    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: { data: /*data*/ ctx[0], id: /*id*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "CrudWidget";
    			t1 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			set_style(h1, "text-align", "center");
    			set_style(h1, "margin-top", "-8px");
    			add_location(h1, file$Q, 14, 4, 426);
    			set_style(div0, "width", "512px");
    			set_style(div0, "margin", "auto");
    			attr_dev(div0, "class", "card shadow");
    			add_location(div0, file$Q, 13, 2, 360);
    			add_location(div1, file$Q, 12, 0, 352);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*data*/ 1) switch_instance_changes.data = /*data*/ ctx[0];
    			if (dirty & /*id*/ 2) switch_instance_changes.id = /*id*/ ctx[1];

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$$.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$$($$self, $$props, $$invalidate) {
    	let $leftover;
    	validate_store(leftover, "leftover");
    	component_subscribe($$self, leftover, $$value => $$invalidate(4, $leftover = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, []);
    	let { data } = $$props;
    	const components = { list: List, update: Update, view: View };
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		leftover,
    		list: List,
    		update: Update,
    		view: View,
    		data,
    		components,
    		id,
    		action,
    		$leftover,
    		component
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("action" in $$props) $$invalidate(3, action = $$props.action);
    		if ("component" in $$props) $$invalidate(2, component = $$props.component);
    	};

    	let id;
    	let action;
    	let component;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$leftover*/ 16) {
    			 $$invalidate(1, [id, action = "view"] = $leftover.split("/"), id, ($$invalidate(3, action), $$invalidate(4, $leftover)));
    		}

    		if ($$self.$$.dirty & /*id, action*/ 10) {
    			 $$invalidate(2, component = id && components[action] || List);
    		}
    	};

    	return [data, id, component];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$$, create_fragment$$, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$$.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Index> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Index.$compile = {"vars":[{"name":"leftover","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"list","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"update","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"view","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"data","export_name":"data","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"components","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"id","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"action","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$leftover","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"component","export_name":null,"injected":true,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    const users = [
        {
          "id": 1,
          "name": "Leanne Graham",
          "username": "Bret",
          "email": "Sincere@april.biz",
          "address": {
            "street": "Kulas Light",
            "suite": "Apt. 556",
            "city": "Gwenborough",
            "zipcode": "92998-3874",
            "geo": {
              "lat": "-37.3159",
              "lng": "81.1496"
            }
          },
          "phone": "1-770-736-8031 x56442",
          "website": "hildegard.org",
          "company": {
            "name": "Romaguera-Crona",
            "catchPhrase": "Multi-layered client-server neural-net",
            "bs": "harness real-time e-markets"
          }
        },
        {
          "id": 2,
          "name": "Ervin Howell",
          "username": "Antonette",
          "email": "Shanna@melissa.tv",
          "address": {
            "street": "Victor Plains",
            "suite": "Suite 879",
            "city": "Wisokyburgh",
            "zipcode": "90566-7771",
            "geo": {
              "lat": "-43.9509",
              "lng": "-34.4618"
            }
          },
          "phone": "010-692-6593 x09125",
          "website": "anastasia.net",
          "company": {
            "name": "Deckow-Crist",
            "catchPhrase": "Proactive didactic contingency",
            "bs": "synergize scalable supply-chains"
          }
        },
        {
          "id": 3,
          "name": "Clementine Bauch",
          "username": "Samantha",
          "email": "Nathan@yesenia.net",
          "address": {
            "street": "Douglas Extension",
            "suite": "Suite 847",
            "city": "McKenziehaven",
            "zipcode": "59590-4157",
            "geo": {
              "lat": "-68.6102",
              "lng": "-47.0653"
            }
          },
          "phone": "1-463-123-4447",
          "website": "ramiro.info",
          "company": {
            "name": "Romaguera-Jacobson",
            "catchPhrase": "Face to face bifurcated interface",
            "bs": "e-enable strategic applications"
          }
        },
        {
          "id": 4,
          "name": "Patricia Lebsack",
          "username": "Karianne",
          "email": "Julianne.OConner@kory.org",
          "address": {
            "street": "Hoeger Mall",
            "suite": "Apt. 692",
            "city": "South Elvis",
            "zipcode": "53919-4257",
            "geo": {
              "lat": "29.4572",
              "lng": "-164.2990"
            }
          },
          "phone": "493-170-9623 x156",
          "website": "kale.biz",
          "company": {
            "name": "Robel-Corkery",
            "catchPhrase": "Multi-tiered zero tolerance productivity",
            "bs": "transition cutting-edge web services"
          }
        },
        {
          "id": 5,
          "name": "Chelsey Dietrich",
          "username": "Kamren",
          "email": "Lucio_Hettinger@annie.ca",
          "address": {
            "street": "Skiles Walks",
            "suite": "Suite 351",
            "city": "Roscoeview",
            "zipcode": "33263",
            "geo": {
              "lat": "-31.8129",
              "lng": "62.5342"
            }
          },
          "phone": "(254)954-1289",
          "website": "demarco.info",
          "company": {
            "name": "Keebler LLC",
            "catchPhrase": "User-centric fault-tolerant solution",
            "bs": "revolutionize end-to-end systems"
          }
        },
        {
          "id": 6,
          "name": "Mrs. Dennis Schulist",
          "username": "Leopoldo_Corkery",
          "email": "Karley_Dach@jasper.info",
          "address": {
            "street": "Norberto Crossing",
            "suite": "Apt. 950",
            "city": "South Christy",
            "zipcode": "23505-1337",
            "geo": {
              "lat": "-71.4197",
              "lng": "71.7478"
            }
          },
          "phone": "1-477-935-8478 x6430",
          "website": "ola.org",
          "company": {
            "name": "Considine-Lockman",
            "catchPhrase": "Synchronised bottom-line interface",
            "bs": "e-enable innovative applications"
          }
        },
        {
          "id": 7,
          "name": "Kurtis Weissnat",
          "username": "Elwyn.Skiles",
          "email": "Telly.Hoeger@billy.biz",
          "address": {
            "street": "Rex Trail",
            "suite": "Suite 280",
            "city": "Howemouth",
            "zipcode": "58804-1099",
            "geo": {
              "lat": "24.8918",
              "lng": "21.8984"
            }
          },
          "phone": "210.067.6132",
          "website": "elvis.io",
          "company": {
            "name": "Johns Group",
            "catchPhrase": "Configurable multimedia task-force",
            "bs": "generate enterprise e-tailers"
          }
        },
        {
          "id": 8,
          "name": "Nicholas Runolfsdottir V",
          "username": "Maxime_Nienow",
          "email": "Sherwood@rosamond.me",
          "address": {
            "street": "Ellsworth Summit",
            "suite": "Suite 729",
            "city": "Aliyaview",
            "zipcode": "45169",
            "geo": {
              "lat": "-14.3990",
              "lng": "-120.7677"
            }
          },
          "phone": "586.493.6943 x140",
          "website": "jacynthe.com",
          "company": {
            "name": "Abernathy Group",
            "catchPhrase": "Implemented secondary concept",
            "bs": "e-enable extensible e-tailers"
          }
        },
        {
          "id": 9,
          "name": "Glenna Reichert",
          "username": "Delphine",
          "email": "Chaim_McDermott@dana.io",
          "address": {
            "street": "Dayna Park",
            "suite": "Suite 449",
            "city": "Bartholomebury",
            "zipcode": "76495-3109",
            "geo": {
              "lat": "24.6463",
              "lng": "-168.8889"
            }
          },
          "phone": "(775)976-6794 x41206",
          "website": "conrad.com",
          "company": {
            "name": "Yost and Sons",
            "catchPhrase": "Switchable contextually-based project",
            "bs": "aggregate real-time technologies"
          }
        },
        {
          "id": 10,
          "name": "Clementina DuBuque",
          "username": "Moriah.Stanton",
          "email": "Rey.Padberg@karina.biz",
          "address": {
            "street": "Kattie Turnpike",
            "suite": "Suite 198",
            "city": "Lebsackbury",
            "zipcode": "31428-2261",
            "geo": {
              "lat": "-38.2386",
              "lng": "57.2232"
            }
          },
          "phone": "024-648-3804",
          "website": "ambrose.net",
          "company": {
            "name": "Hoeger LLC",
            "catchPhrase": "Centralized empowering task-force",
            "bs": "target end-to-end models"
          }
        }
      ];

    /* src/pages/example/widget/_fallback.svelte generated by Svelte v3.29.0 */
    const file$R = "src/pages/example/widget/_fallback.svelte";

    function create_fragment$10(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let crudwidget;
    	let current;
    	crudwidget = new Index({ props: { data: users }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "By using a _fallback.svelte in example/widget, we can grab the leftover URL\n    and pass it to an embedded widget.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Alternatively, the widget can grab the leftover URL itself.";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "This allows for reusable navigable components.";
    			t5 = space();
    			create_component(crudwidget.$$.fragment);
    			add_location(p0, file$R, 6, 2, 158);
    			add_location(p1, file$R, 11, 2, 291);
    			add_location(p2, file$R, 12, 2, 360);
    			set_style(div, "text-align", "center");
    			add_location(div, file$R, 5, 0, 123);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(div, t3);
    			append_dev(div, p2);
    			insert_dev(target, t5, anchor);
    			mount_component(crudwidget, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crudwidget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crudwidget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t5);
    			destroy_component(crudwidget, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$10.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$10($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CrudWidget: Index, users });
    	return [];
    }

    class Fallback$5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$10, create_fragment$10, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$10.name
    		});
    	}
    }
    Fallback$5.$compile = {"vars":[{"name":"CrudWidget","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"users","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    var _fallback$5 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Fallback$5
    });

    /* src/pages/example/_components/RoutifyIntro.svelte generated by Svelte v3.29.0 */

    const file$S = "src/pages/example/_components/RoutifyIntro.svelte";

    function create_fragment$11(ctx) {
    	let h1;
    	let t1;
    	let a;
    	let t3;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Routify Starter";
    			t1 = text("\n\nTo see an example app, go to \n");
    			a = element("a");
    			a.textContent = "/example";
    			t3 = space();
    			p = element("p");
    			p.textContent = "To delete the example app, simply delete the ./src/pages/example folder.";
    			add_location(h1, file$S, 0, 0, 0);
    			attr_dev(a, "href", "/example");
    			add_location(a, file$S, 3, 0, 56);
    			add_location(p, file$S, 5, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$11.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$11($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RoutifyIntro", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RoutifyIntro> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class RoutifyIntro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$11, create_fragment$11, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoutifyIntro",
    			options,
    			id: create_fragment$11.name
    		});
    	}
    }
    RoutifyIntro.$compile = {"vars":[]};

    /* src/pages/index.svelte generated by Svelte v3.29.0 */

    function create_fragment$12(ctx) {
    	let routifyintro;
    	let current;
    	routifyintro = new RoutifyIntro({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(routifyintro.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(routifyintro, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(routifyintro.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(routifyintro.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(routifyintro, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$12.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$12($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pages", slots, []);
    	metatags.title = "My Routify app";
    	metatags.description = "Description coming soon...";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ RoutifyIntro, metatags });
    	return [];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$12, create_fragment$12, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$12.name
    		});
    	}
    }
    Pages.$compile = {"vars":[{"name":"RoutifyIntro","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"metatags","export_name":null,"injected":false,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true}]};

    var index$e = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Pages
    });

}());
//# sourceMappingURL=bundle.js.map