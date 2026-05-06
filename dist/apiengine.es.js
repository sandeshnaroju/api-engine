//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, a) => (a = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule ? t(a, "default", {
	value: n,
	enumerable: !0
}) : a, n)), l = (e, t = {}) => {
	let n = e, r = [], i = /* @__PURE__ */ new Set();
	return n = n.replace(/:(\w+)/g, (e, n) => t[n] === void 0 ? e : (i.add(n), encodeURIComponent(String(t[n])))), Object.keys(t).forEach((e) => {
		if (!i.has(e) && t[e] !== void 0) {
			let n = t[e];
			Array.isArray(n) ? n.forEach((t) => r.push(`${encodeURIComponent(e)}=${encodeURIComponent(String(t))}`)) : r.push(`${encodeURIComponent(e)}=${encodeURIComponent(String(n))}`);
		}
	}), r.length > 0 ? `${n}?${r.join("&")}` : n;
}, u = (e) => async (t, n = {}) => {
	if (t.protocol !== "REST") throw Error(`REST adapter cannot handle ${t.protocol} protocol`);
	let r = ["GET", "DELETE"].includes(t.method), i = `${e}${l(t.path, n.params)}`, a = {
		"Content-Type": "application/json",
		...t.headers,
		...n.headers
	}, o = new AbortController(), s = setTimeout(() => o.abort(), t.timeout);
	try {
		let e = await fetch(i, {
			method: t.method,
			headers: a,
			body: !r && n.params ? JSON.stringify(n.params) : void 0,
			signal: o.signal,
			...t.options,
			...n.fetchOptions
		});
		if (!e.ok) throw Error(`API Error ${e.status}`);
		return await e.json();
	} finally {
		clearTimeout(s);
	}
}, d = /* @__PURE__ */ c((/* @__PURE__ */ o(((e, t) => {
	t.exports = function() {
		throw Error("ws does not work in the browser. Browser clients must use the native WebSocket object");
	};
})))()), f = typeof WebSocket < "u" ? WebSocket : d.default, p = class {
	constructor(e, t) {
		this.endpoint = e, this.url = t, this.socket = null, this.subscribers = /* @__PURE__ */ new Set(), this.retryCount = 0;
	}
	connect() {
		this.socket?.readyState !== f.OPEN && (this.socket = new (typeof WebSocket < "u" ? WebSocket : d.default)(this.url), this.socket.onopen = () => {
			this.retryCount = 0, this.startHeartbeat(), console.log(`Connected: ${this.url}`);
		}, this.socket.onmessage = (e) => {
			try {
				let t = typeof e.data == "string" ? JSON.parse(e.data) : e.data;
				this.subscribers.forEach((e) => e(t));
			} catch {
				this.subscribers.forEach((t) => t(e.data));
			}
		}, this.socket.onclose = (e) => {
			this.stopHeartbeat(), this.endpoint.autoReconnect && e.code !== 1e3 && this.reconnect();
		});
	}
	reconnect() {
		let e = this.endpoint.maxRetries || 5;
		if (this.retryCount >= e) return;
		let t = Math.min(1e3 * 2 ** this.retryCount, 3e4);
		this.retryCount++, this.reconnectTimer = setTimeout(() => this.connect(), t);
	}
	startHeartbeat() {
		this.heartbeatTimer = setInterval(() => {
			this.socket?.readyState === f.OPEN && this.socket.send(JSON.stringify({ type: "ping" }));
		}, this.endpoint.pingInterval || 3e4);
	}
	stopHeartbeat() {
		clearInterval(this.heartbeatTimer), clearTimeout(this.reconnectTimer);
	}
	subscribe(e) {
		return this.subscribers.add(e), this.socket?.readyState !== f.OPEN && this.connect(), () => {
			this.subscribers.delete(e), this.subscribers.size === 0 && this.close();
		};
	}
	send(e) {
		this.socket?.readyState === f.OPEN && this.socket.send(typeof e == "string" ? e : JSON.stringify(e));
	}
	close() {
		this.stopHeartbeat(), this.socket?.close(1e3), this.socket = null;
	}
}, m;
/* @__NO_SIDE_EFFECTS__ */
function h(e) {
	return {
		lang: e?.lang ?? m?.lang,
		message: e?.message,
		abortEarly: e?.abortEarly ?? m?.abortEarly,
		abortPipeEarly: e?.abortPipeEarly ?? m?.abortPipeEarly
	};
}
var g;
/* @__NO_SIDE_EFFECTS__ */
function _(e) {
	return g?.get(e);
}
var v;
/* @__NO_SIDE_EFFECTS__ */
function y(e) {
	return v?.get(e);
}
var b;
/* @__NO_SIDE_EFFECTS__ */
function x(e, t) {
	return b?.get(e)?.get(t);
}
/* @__NO_SIDE_EFFECTS__ */
function S(e) {
	let t = typeof e;
	return t === "string" ? `"${e}"` : t === "number" || t === "bigint" || t === "boolean" ? `${e}` : t === "object" || t === "function" ? (e && Object.getPrototypeOf(e)?.constructor?.name) ?? "null" : t;
}
function C(e, t, n, r, i) {
	let a = i && "input" in i ? i.input : n.value, o = i?.expected ?? e.expects ?? null, s = i?.received ?? /* @__PURE__ */ S(a), c = {
		kind: e.kind,
		type: e.type,
		input: a,
		expected: o,
		received: s,
		message: `Invalid ${t}: ${o ? `Expected ${o} but r` : "R"}eceived ${s}`,
		requirement: e.requirement,
		path: i?.path,
		issues: i?.issues,
		lang: r.lang,
		abortEarly: r.abortEarly,
		abortPipeEarly: r.abortPipeEarly
	}, l = e.kind === "schema", u = i?.message ?? e.message ?? /* @__PURE__ */ x(e.reference, c.lang) ?? (l ? /* @__PURE__ */ y(c.lang) : null) ?? r.message ?? /* @__PURE__ */ _(c.lang);
	u !== void 0 && (c.message = typeof u == "function" ? u(c) : u), l && (n.typed = !1), n.issues ? n.issues.push(c) : n.issues = [c];
}
/* @__NO_SIDE_EFFECTS__ */
function w(e) {
	return {
		version: 1,
		vendor: "valibot",
		validate(t) {
			return e["~run"]({ value: t }, /* @__PURE__ */ h());
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function T(e, t) {
	return Object.hasOwn(e, t) && t !== "__proto__" && t !== "prototype" && t !== "constructor";
}
/* @__NO_SIDE_EFFECTS__ */
function E(e, t) {
	let n = [...new Set(e)];
	return n.length > 1 ? `(${n.join(` ${t} `)})` : n[0] ?? "never";
}
var D = class extends Error {
	constructor(e) {
		super(e[0].message), this.name = "ValiError", this.issues = e;
	}
};
/* @__NO_SIDE_EFFECTS__ */
function O(e, t, n) {
	return typeof e.fallback == "function" ? e.fallback(t, n) : e.fallback;
}
/* @__NO_SIDE_EFFECTS__ */
function k(e, t, n) {
	return typeof e.default == "function" ? e.default(t, n) : e.default;
}
/* @__NO_SIDE_EFFECTS__ */
function A(e) {
	return {
		kind: "schema",
		type: "boolean",
		reference: A,
		expects: "boolean",
		async: !1,
		message: e,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			return typeof e.value == "boolean" ? e.typed = !0 : C(this, "type", e, t), e;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function j(e, t) {
	return {
		kind: "schema",
		type: "literal",
		reference: j,
		expects: /* @__PURE__ */ S(e),
		async: !1,
		literal: e,
		message: t,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			return e.value === this.literal ? e.typed = !0 : C(this, "type", e, t), e;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function M(e) {
	return {
		kind: "schema",
		type: "number",
		reference: M,
		expects: "number",
		async: !1,
		message: e,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			return typeof e.value == "number" && !isNaN(e.value) ? e.typed = !0 : C(this, "type", e, t), e;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function N(e, t) {
	return {
		kind: "schema",
		type: "object",
		reference: N,
		expects: "Object",
		async: !1,
		entries: e,
		message: t,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			let n = e.value;
			if (n && typeof n == "object") {
				e.typed = !0, e.value = {};
				for (let r in this.entries) {
					let i = this.entries[r];
					if (r in n || (i.type === "exact_optional" || i.type === "optional" || i.type === "nullish") && i.default !== void 0) {
						let a = r in n ? n[r] : /* @__PURE__ */ k(i), o = i["~run"]({ value: a }, t);
						if (o.issues) {
							let i = {
								type: "object",
								origin: "value",
								input: n,
								key: r,
								value: a
							};
							for (let t of o.issues) t.path ? t.path.unshift(i) : t.path = [i], e.issues?.push(t);
							if (e.issues ||= o.issues, t.abortEarly) {
								e.typed = !1;
								break;
							}
						}
						o.typed || (e.typed = !1), e.value[r] = o.value;
					} else if (i.fallback !== void 0) e.value[r] = /* @__PURE__ */ O(i);
					else if (i.type !== "exact_optional" && i.type !== "optional" && i.type !== "nullish" && (C(this, "key", e, t, {
						input: void 0,
						expected: `"${r}"`,
						path: [{
							type: "object",
							origin: "key",
							input: n,
							key: r,
							value: n[r]
						}]
					}), t.abortEarly)) break;
				}
			} else C(this, "type", e, t);
			return e;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function P(e, t) {
	return {
		kind: "schema",
		type: "optional",
		reference: P,
		expects: `(${e.expects} | undefined)`,
		async: !1,
		wrapped: e,
		default: t,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			return e.value === void 0 && (this.default !== void 0 && (e.value = /* @__PURE__ */ k(this, e, t)), e.value === void 0) ? (e.typed = !0, e) : this.wrapped["~run"](e, t);
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function F(e, t) {
	return {
		kind: "schema",
		type: "picklist",
		reference: F,
		expects: /* @__PURE__ */ E(e.map(S), "|"),
		async: !1,
		options: e,
		message: t,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			return this.options.includes(e.value) ? e.typed = !0 : C(this, "type", e, t), e;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function I(e, t, n) {
	return {
		kind: "schema",
		type: "record",
		reference: I,
		expects: "Object",
		async: !1,
		key: e,
		value: t,
		message: n,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			let n = e.value;
			if (n && typeof n == "object") {
				e.typed = !0, e.value = {};
				for (let r in n) if (/* @__PURE__ */ T(n, r)) {
					let i = n[r], a = this.key["~run"]({ value: r }, t);
					if (a.issues) {
						let o = {
							type: "object",
							origin: "key",
							input: n,
							key: r,
							value: i
						};
						for (let t of a.issues) t.path = [o], e.issues?.push(t);
						if (e.issues ||= a.issues, t.abortEarly) {
							e.typed = !1;
							break;
						}
					}
					let o = this.value["~run"]({ value: i }, t);
					if (o.issues) {
						let a = {
							type: "object",
							origin: "value",
							input: n,
							key: r,
							value: i
						};
						for (let t of o.issues) t.path ? t.path.unshift(a) : t.path = [a], e.issues?.push(t);
						if (e.issues ||= o.issues, t.abortEarly) {
							e.typed = !1;
							break;
						}
					}
					(!a.typed || !o.typed) && (e.typed = !1), a.typed && (e.value[a.value] = o.value);
				}
			} else C(this, "type", e, t);
			return e;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function L(e) {
	return {
		kind: "schema",
		type: "string",
		reference: L,
		expects: "string",
		async: !1,
		message: e,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			return typeof e.value == "string" ? e.typed = !0 : C(this, "type", e, t), e;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function R(e, t, n) {
	return {
		kind: "schema",
		type: "variant",
		reference: R,
		expects: "Object",
		async: !1,
		key: e,
		options: t,
		message: n,
		get "~standard"() {
			return /* @__PURE__ */ w(this);
		},
		"~run"(e, t) {
			let n = e.value;
			if (n && typeof n == "object") {
				let r, i = 0, a = this.key, o = [], s = (e, c) => {
					for (let l of e.options) {
						if (l.type === "variant") s(l, new Set(c).add(l.key));
						else {
							let e = !0, s = 0;
							for (let t of c) {
								let r = l.entries[t];
								if (t in n ? r["~run"]({
									typed: !1,
									value: n[t]
								}, { abortEarly: !0 }).issues : r.type !== "exact_optional" && r.type !== "optional" && r.type !== "nullish") {
									e = !1, a !== t && (i < s || i === s && t in n && !(a in n)) && (i = s, a = t, o = []), a === t && o.push(l.entries[t].expects);
									break;
								}
								s++;
							}
							if (e) {
								let e = l["~run"]({ value: n }, t);
								(!r || !r.typed && e.typed) && (r = e);
							}
						}
						if (r && !r.issues) break;
					}
				};
				if (s(this, new Set([this.key])), r) return r;
				C(this, "type", e, t, {
					input: n[a],
					expected: /* @__PURE__ */ E(o, "|"),
					path: [{
						type: "object",
						origin: "value",
						input: n,
						key: a,
						value: n[a]
					}]
				});
			} else C(this, "type", e, t);
			return e;
		}
	};
}
function z(e, t, n) {
	let r = e["~run"]({ value: t }, /* @__PURE__ */ h(n));
	if (r.issues) throw new D(r.issues);
	return r.value;
}
var B = /* @__PURE__ */ N({
	version: /* @__PURE__ */ L(),
	baseUrl: /* @__PURE__ */ L(),
	endpoints: /* @__PURE__ */ I(/* @__PURE__ */ L(), /* @__PURE__ */ R("protocol", [
		/* @__PURE__ */ N({
			protocol: /* @__PURE__ */ j("REST"),
			path: /* @__PURE__ */ L(),
			method: /* @__PURE__ */ F([
				"GET",
				"POST",
				"PUT",
				"DELETE"
			]),
			headers: /* @__PURE__ */ P(/* @__PURE__ */ I(/* @__PURE__ */ L(), /* @__PURE__ */ L()), {}),
			options: /* @__PURE__ */ P(/* @__PURE__ */ N({
				cache: /* @__PURE__ */ P(/* @__PURE__ */ F([
					"default",
					"no-store",
					"reload",
					"force-cache"
				])),
				credentials: /* @__PURE__ */ P(/* @__PURE__ */ F([
					"include",
					"same-origin",
					"omit"
				]))
			}), {}),
			timeout: /* @__PURE__ */ P(/* @__PURE__ */ M(), 5e3)
		}),
		/* @__PURE__ */ N({
			protocol: /* @__PURE__ */ j("WS"),
			path: /* @__PURE__ */ L(),
			autoReconnect: /* @__PURE__ */ P(/* @__PURE__ */ A(), !0),
			maxRetries: /* @__PURE__ */ P(/* @__PURE__ */ M(), 5),
			pingInterval: /* @__PURE__ */ P(/* @__PURE__ */ M(), 3e4)
		}),
		/* @__PURE__ */ N({
			protocol: /* @__PURE__ */ j("SSE"),
			path: /* @__PURE__ */ L(),
			eventType: /* @__PURE__ */ P(/* @__PURE__ */ L(), "message")
		})
	]))
}), V = (e) => {
	let t = /* @__PURE__ */ new Map();
	return (n) => {
		if (n.protocol !== "SSE") throw Error("Invalid Protocol");
		let r = n.path.startsWith("http") ? n.path : `${e}${n.path}`;
		t.has(r) || t.set(r, new EventSource(r));
		let i = t.get(r), a = /* @__PURE__ */ new Set(), o = n.eventType || "message", s = (e) => {
			try {
				let t = typeof e.data == "string" ? JSON.parse(e.data) : e.data;
				a.forEach((e) => e(t));
			} catch {
				a.forEach((t) => t(e.data));
			}
		};
		return i.addEventListener(o, s), {
			subscribe: (e) => (a.add(e), () => {
				a.delete(e), a.size === 0 && (i.removeEventListener(o, s), i.close(), t.delete(r));
			}),
			close: () => {
				i.removeEventListener(o, s), i.close(), t.delete(r);
			}
		};
	};
}, H = class {
	constructor(e) {
		this.socketManagers = /* @__PURE__ */ new Map(), this.manifest = z(B, e), this.baseUrl = this.manifest.baseUrl;
	}
	async call(e, t) {
		let n = this.manifest.endpoints[e];
		if (n.protocol !== "REST") throw Error("Use .watch() for streams");
		return u(this.baseUrl)(n, t);
	}
	watch(e) {
		let t = this.manifest.endpoints[e];
		if (!t) throw Error(`Endpoint ${e} not found.`);
		switch (t.protocol) {
			case "WS":
				let n = `${this.baseUrl.replace("http", "ws")}${t.path}`;
				return this.socketManagers.has(e) || this.socketManagers.set(e, new p(t, n)), this.socketManagers.get(e);
			case "SSE": return V(this.baseUrl)(t);
			default: throw Error(`Protocol ${t.protocol} is not streamable.`);
		}
	}
};
//#endregion
export { H as APIEngine };
