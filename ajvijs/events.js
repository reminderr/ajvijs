import {store} from './store.js'
import {setOwner} from './utils/utils.js'
/*
 * @desc AjviJS library - Event manager class
 */
export class events {

	/*
	 * @desc Class constructor
	 * @return void
	 */
	constructor() {
		this.evtList = [
			'beforefocus', 'focus', 'afterfocus',
			'beforeblur', 'blur', 'afterblur',
			'beforeclick', 'click', 'afterclick',
			'beforedblclick', 'dblclick', 'afterdblclick',
			'beforechange', 'change', 'afterchange',
			'beforeselect', 'select', 'afterselect',
			'beforemousemove', 'mousemove', 'aftermousemove',
			'beforemouseover', 'mouseover', 'aftermouseover',
			'beforemouseout', 'mouseout', 'aftermouseout', 
			'beforemousedown', 'mousedown', 'aftermousedown',
			'beforemouseup', 'mouseup', 'aftermouseup',
			'beforekeyup', 'keyup', 'afterkeyup',
			'beforekeydown', 'keydown', 'afterkeydown',			
			'beforedragstart', 'dragstart', 'afterdragstart',
			'beforedragover', 'dragover', 'afterdragover',	
			'beforedragend', 'dragend', 'afterdragend',	
			'beforedrop', 'drop', 'afterdrop',		
			'beforeadd', 'add', 'afteradd', 
			'beforeremove', 'remove', 'afterremove',
			'beforeshow', 'show', 'aftershow',
			'beforehide', 'hide', 'afterhide'
		]	

		this.observer = new MutationObserver(mutations => mutations.forEach(mutation => this.observableEventQueue(mutation, this.observable[mutation.target.Own()])))

 		this.observerConfig = { 
 			childList: true, 
 			attributes: true,
 			attributeOldValue: true
 		}

 		this.collectEventsOrig = []
 		this.collectEvents = []	

 		this.collectEventsAttr = []
 		this.collectOwns = []

 		this.observable = []
 		this.store = []
	}

	/*
	 * @desc Get event list per owner
	 * @param (object) htmlcollection - DOM elements
	 * @return void
	 */
	applyEvents(htmlcollection) {
		let evts, collect = [], own, o, elevts
		for(let el of htmlcollection) {
			if(typeof el.getAttribute('store') == 'string') {
				!el.Own() && el.Own(setOwner(el))
				let _store = new store(el, this)
				this.store[el.Own()] = _store
				_store.applyStoreToDOM() 
			}
			if(typeof el.getAttribute('events') == 'string' || typeof el.Own() == 'string') {
				elevts = el.getAttribute('events')
				!el.Own() && el.Own(setOwner(el))
				own = el.Own()
				if(!Array.isArray(this.collectEventsOrig[own])) {
					this.collectEventsOrig[own] = []
				}
				if(elevts) {
					try {
						evts = this.parseEvents(elevts)
					} catch(error) {
						throw 'Events format not corrent.'
						return
					}
					this.collectEventsAttr[own] = evts
				} else {
					evts = this.collectEventsAttr[own]
					if(evts == undefined) {
						continue
					}
				}
				Object.keys(evts).forEach(ev => {
					if(this.evtList.indexOf(ev.toLowerCase()) == -1) {
						throw 'Event '+ev.toUpperCase()+' does not exist.'
						return
					}
					let fn = new Function('scope', 'o', 'e', 'data', 'scope.'+evts[ev]+'(o, e, data);')	
					let evt = ev.toLowerCase()
					this.collectEventsOrig[own][evt] = { el: el, fn: fn, scope: this }		
					switch(evt) {
						case (evt.match(/add/) || {}).input:
						case (evt.match(/remove/) || {}).input:
						case (evt.match(/show/) || {}).input:
						case (evt.match(/hide/) || {}).input:
							this.collectEventsOrig[own][evt].execute = false
						break
					}
				})
				el.removeAttribute('events')
			}			
		}			
		this.dispatchEvents()	
		return true		
	}

	/*
	 * @desc Parse events from events tag
	 * @param (string) events - Events to parse
	 * @return void
	 */
	parseEvents(events) {
		let collect = {}, evt = events.split(','), e
		evt.forEach(ev => {
			e = ev.split(':')
			collect[e[0].trim()] = e[1].trim()
		})
		return collect
	}

	/*
	 * @desc Dispatch registered events
	 * @param (boolean) overwrite - Overwrite events
	 * @return void
	 */
	dispatchEvents(overwrite) {
		let o = this.collectEventsOrig
		Object.keys(o).forEach(own => {
			Object.keys(o[own]).forEach(e => {
				if(o[own][e] == undefined) {
					return
				}
				this.setEvent(o[own][e].el, e, null, overwrite)
			})
		})
	}

	/*
	 * @desc Get event list per owner
	 * @param (object) el - DOM elements
	 * @return void
	 */
	restoreEvents(el) {
		let own, htmlcollect = el ? [el] : this.getTag('*', this.getTemplate().body)
		for(let el of htmlcollect) {
			own = el.Own()
			if(this.collectEvents[own] == undefined) {
				continue
			}
			Object.keys(this.collectEvents[own]).forEach(ev => {
				this.collectEvents[own][ev].el.removeEventListener(ev, this.collectEvents[own][ev].fn)
				if(this.collectEvents[own].length == 0) {
					delete this.collectEvents[own]
				}
				delete this.collectOwns[own]
				delete this.collectEventsOrig[own]
			})
		}
		this.applyEvents(htmlcollect)
	}

	/*
	 * @desc Has event for element
	 * @param (object) el - Element
	 * @param (string) ev - Event name
	 * @return boolean
	 */
	hasEvent(el, ev) {
		if(this.evtList.indexOf(ev.toLowerCase()) == -1) {
			throw 'Event '+ev.toUpperCase()+' does not exist.'
			return
		}
		let own = el.Own()
		if(!own) {
			return false
		}
		if(!this.collectEventsOrig[own]) {
			return
		}
		let collect = []
		Object.keys(this.collectEventsOrig[own]).forEach(e => {
			collect.push(e)
		})
		if(collect.indexOf(ev.toLowerCase()) != -1) {
			return true
		} else {
			return false
		}
	}

	/*
	 * @desc Get event list per owner
	 * @param (string) own - Owner
	 * @return void
	 */
	getEventList(own) {
		let collect = []
		Object.keys(this.collectEventsOrig[own]).forEach(e => {
			collect.push(e)
		})
		return collect
	}

	/*
	 * @desc Trigger
	 * @param (object) el - Element
	 * @param (string) ev - Event name
	 * @return void
	 */
	triggerEvent(obj, ev) {
		let own = el.Own()
		own && this.collectEventsOrig[own][ev].fn()
	}

	/*
	 * @desc Subscribe events
	 * @param (object) el - Element
	 * @param (string) ev - Event name
	 * @param (function) fn - Function to trigger
	 * @param (boolean) overwrite - Event overwriting
	 * @return void
	 */
	setEvent(el, ev, fn, overwrite) {
		if(this.evtList.indexOf(ev.toLowerCase()) == -1) {
			throw 'Event '+ev+' does not exist.'
			return
		}
		!el.Own() && el.Own(setOwner(el))
		let evt = ev.toLowerCase(), own = el.Own()
		switch(evt) {
			case (evt.match(/focus/) || {}).input:
			case (evt.match(/blur/) || {}).input:
			case (evt.match(/click/) || {}).input:
			case (evt.match(/dblclick/) || {}).input:
			case (evt.match(/mousemove/) || {}).input:
			case (evt.match(/mouseover/) || {}).input:
			case (evt.match(/mouseout/) || {}).input:
			case (evt.match(/mousedown/) || {}).input:
			case (evt.match(/mouseup/) || {}).input:
			case (evt.match(/keyup/) || {}).input:
			case (evt.match(/keydown/) || {}).input:
			case (evt.match(/change/) || {}).input:
			case (evt.match(/select/) || {}).input:			
			case (evt.match(/dragstart/) || {}).input:	
			case (evt.match(/dragover/) || {}).input:	
			case (evt.match(/dragend/) || {}).input:
			case (evt.match(/drop/) || {}).input:			
				if(this.evtList.indexOf(ev.toLowerCase()) == -1) {
					throw 'Event '+ev.toUpperCase()+' does not exist.'
					return
				}						
				if(!Array.isArray(this.collectEventsOrig[own])) {
					this.collectEventsOrig[own] = []
				}
				if(this.collectEventsOrig[own][evt] != undefined && fn != null) {
					throw 'Event '+evt+' already exists in element '+el.tagName+' '+own+'. Perform event overwriting instead.'
					return
				} 
				if(this.collectEventsOrig[own][evt] == undefined && fn != null) {
					this.collectEventsOrig[own][evt] = { el: el, fn: fn, scope: this}				
				}
				this.setEventQueue(el, evt, own, overwrite)	
			break
			case (evt.match(/add/) || {}).input:	
			case (evt.match(/remove/) || {}).input:	
			case (evt.match(/show/) || {}).input:	
			case (evt.match(/hide/) || {}).input:
				if(this.evtList.indexOf(ev.toLowerCase()) == -1) {
					throw 'Event '+ev.toUpperCase()+' does not exist.'
					return
				}	
				if(!Array.isArray(this.collectEventsOrig[own])) {
					this.collectEventsOrig[own] = []
				}
				if(this.collectEventsOrig[own][evt] == undefined && fn != null) {
					this.collectEventsOrig[own][evt] = { el: el, fn: fn, scope: this}				
				}
				this.observable[own] = el
				this.observer.observe(el, this.observerConfig)	
			break
		}
	}

	/*
	 * @desc Overwrite events
	 * @param (object) el - Element
	 * @param (string) ev - Event name
	 * @param (function) fn - Function to trigger
	 * @return void
	 */
	overwriteEvent(el, ev, fn) {
		let evt = ev.toLowerCase(), e = ev.replace(/(before|after)/, ''), own = el.Own()
		switch(evt) {
			case (evt.match(/focus/) || {}).input:
			case (evt.match(/blur/) || {}).input:
			case (evt.match(/click/) || {}).input:
			case (evt.match(/dblclick/) || {}).input:
			case (evt.match(/mousemove/) || {}).input:
			case (evt.match(/mouseover/) || {}).input:
			case (evt.match(/mouseout/) || {}).input:
			case (evt.match(/mousedown/) || {}).input:
			case (evt.match(/mouseup/) || {}).input:
			case (evt.match(/keyup/) || {}).input:
			case (evt.match(/keydown/) || {}).input:
			case (evt.match(/change/) || {}).input:
			case (evt.match(/select/) || {}).input:
			case (evt.match(/dragstart/) || {}).input:	
			case (evt.match(/dragover/) || {}).input:
			case (evt.match(/dragend/) || {}).input:	
			case (evt.match(/drop/) || {}).input:	
				if(this.collectEventsOrig[own][evt] == undefined) {
					throw 'Event '+ev+' does not exists in element '+el.tagName+' '+own
					return
				}
				this.collectEventsOrig[own][evt].fn = fn
				el.removeEventListener(e, this.collectEvents[own][e].fn)
				if(this.collectOwns[own].indexOf(e) != -1) {
					this.collectOwns[own].splice(this.collectOwns[own].indexOf(e), 1)
					if(Object.keys(this.collectOwns[own]).length == 0) {
						delete this.collectOwns[own]
					}
				}
				this.dispatchEvents(true)
			break
			case (evt.match(/add/) || {}).input:	
			case (evt.match(/remove/) || {}).input:	
			case (evt.match(/show/) || {}).input:	
			case (evt.match(/hide/) || {}).input:
				if(this.collectEventsOrig[own][evt] == undefined) {
					throw 'Event '+ev+' does not exists in element '+el.tagName+' '+own
					return
				}
				this.collectEventsOrig[own][evt].fn = fn
			break
		}
	}

	/*
	 * @desc Unsubscribe events
	 * @param (object) el - Event hosted element
	 * @param (string) e - Event name
	 * @return void
	 */
	unsetEvent(el, ev) {
		if(this.evtList.indexOf(ev.toLowerCase()) == -1) {
			throw 'Event '+ev+' does not exist.'
			return
		}
		let evt = ev.toLowerCase(), e = ev.replace(/(before|after)/, ''), own = el.Own()
		switch(evt) {
			case (evt.match(/focus/) || {}).input:
			case (evt.match(/blur/) || {}).input:
			case (evt.match(/click/) || {}).input:
			case (evt.match(/dblclick/) || {}).input:
			case (evt.match(/mousemove/) || {}).input:
			case (evt.match(/mouseover/) || {}).input:
			case (evt.match(/mouseout/) || {}).input:
			case (evt.match(/mousedown/) || {}).input:
			case (evt.match(/mouseup/) || {}).input:
			case (evt.match(/keyup/) || {}).input:
			case (evt.match(/keydown/) || {}).input:
			case (evt.match(/change/) || {}).input:
			case (evt.match(/select/) || {}).input:
			case (evt.match(/dragstart/) || {}).input:	
			case (evt.match(/dragover/) || {}).input:	
			case (evt.match(/dragend/) || {}).input:
			case (evt.match(/drop/) || {}).input:	
				if(this.collectEventsOrig[own][evt] == undefined) {
					throw 'Unset event: Event '+ev+' does not exists in element '+el.tagName+' '+own
					return
				}
				delete this.collectEventsOrig[own][evt]			
				el.removeEventListener(e, this.collectEvents[own][e].fn)
				if(this.collectOwns[own].indexOf(e)) {
					this.collectOwns[own].splice(this.collectOwns[own].indexOf(e), 1) 
				}
				if(Object.keys(this.collectOwns[own]).length == 0) {
					delete this.collectOwns[own]
				}
				this.dispatchEvents()
			break
			case (evt.match(/add/) || {}).input:	
			case (evt.match(/remove/) || {}).input:	
			case (evt.match(/show/) || {}).input:	
			case (evt.match(/hide/) || {}).input:
				if(this.collectEventsOrig[own][evt] == undefined) {
					throw 'Unset event: Event '+ev+' does not exists in element '+el.tagName+' '+own
					return
				}
				delete this.collectEventsOrig[own][evt]	
				if(Object.keys(this.collectEventsOrig[own]).length == 0) {
					delete this.collectEventsOrig[own]
				}
			break
		}
	}

	/*
	 * @desc Default event placeholder
	 * @param (object) el - Assigned element
	 * @param (string) evt - Event
	 * @param (string) own - Owner
	 * @param (boolean) overwrite - Overwrite event
	 * @return void
	 */
	setEventQueue(el, evt, own, overwrite) {
		let ev, eva, evtlist = this.getEventList(own), o = this.collectEventsOrig[own], regfn, scope = o[evt].scope, event, beforefn, currentfn, afterfn, collectevent = evt.replace(/(before|after)/gi, '')
		if(this.collectOwns[own] && this.collectOwns[own].indexOf(collectevent) != -1) {
			return
		}
		if(!Array.isArray(this.collectOwns[own])) {
			this.collectOwns[own] = []
		}
		this.collectOwns[own].push(collectevent)
		if(evt.match(/before/)) {
			ev = evt.replace('before', '')
			event = ev
			if(evtlist.indexOf(ev) != -1) {
				beforefn = overwrite ? e => { return o[evt].fn(e) } : e => { return o[evt].fn(scope, el, e) }
				currentfn = overwrite ? (e, data) => { return o[ev].fn(e, data) } : (e, data) => { return o[ev].fn(o[ev].scope, el, e, data) }
				if(evtlist.indexOf('after'+ev) != -1) {
					eva = 'after'+ev				
					afterfn = overwrite ? (e, data) => { return o[eva].fn(e, data) } : (e, data) => { return o[eva].fn(o[eva].scope, el, e, data) }
					regfn = e => { 
						return new Promise((resolve, reject) => resolve(beforefn(e))).then(before => {
							if(before === false) {
								return
							}
							return new Promise((res, rej) => res(currentfn(e, before))).then(current => {
								if(current === false) {
									return
								}
								afterfn(e, current)
							})
						})
					}
					el.addEventListener(ev, regfn, false)
				} else {
					regfn = e => { 
						return new Promise((res, rej) => res(beforefn(e))).then(before => {
							if(before === false) {
								return
							}
							currentfn(e, before)
						})
					}
					el.addEventListener(ev, regfn, false)
				}
			} else {
				if(evtlist.indexOf('after'+ev) != -1) {
					eva = evt.replace('after', '')
					if(evtlist.indexOf(eva) != -1) {
						currentfn = overwrite ? e => { return o[eva].fn(e) } : e => { return o[eva].fn(o[eva].scope, el, e) }
						afterfn = overwrite ? (e, data) => { return o[evt].fn(e, data) } : (e, data) => { return o[evt].fn(scope, el, e, data) }
						regfn = e => { 
							return new Promise((res, rej) => res(currentfn(e))).then(current => {
								if(current === false) {
									return
								}
								afterfn(e, current)
							})
						}
						el.addEventListener(eva, regfn, false)
					} else {
						regfn = overwrite ? e => { o[evt].fn(e) } : e => { o[evt].fn(scope, el, e) }
						el.addEventListener(eva, regfn, false)
					}
				} else {
					regfn = overwrite ? e => { o[evt].fn(e) } : e => { o[evt].fn(scope, el, e) }
					el.addEventListener(evt, regfn, false)
				}				
			}			
		} else {
			if(evt.match(/after/)) {
				eva = evt.replace('after', '')
				event = eva
				if(evtlist.indexOf(eva) != -1) {
					currentfn = overwrite ? e => { o[eva].fn(e) } : e => { o[eva].fn(o[eva].scope, el, e) }
					afterfn = overwrite ? (e, data) => { o[evt].fn(e, data) } : (e, data) => { o[evt].fn(scope, el, e, data) }
					regfn = e => { 
						return new Promise((res, rej) => res(currentfn(e))).then(current => {
							if(current === false) {
								return
							}
							afterfn(e, current)
						})
					}
					el.addEventListener(eva, regfn, false)
				} else {
					regfn = overwrite ? e => { o[evt].fn(e) } : e => { o[evt].fn(scope, el, e) }
					el.addEventListener(eva, regfn, false)
				}
			} else {
				event = evt
				regfn = overwrite ? e => { o[evt].fn(e) } : e => { o[evt].fn(scope, el, e) }
				el.addEventListener(evt, regfn, false)
			}
		}
		if(!Array.isArray(this.collectEvents[own])) {
			this.collectEvents[own] = []
		}
		this.collectEvents[own][event] = { el: el, fn: regfn, scope: scope }	
	}

	/*
	 * @desc Mutation events placeholder
	 * @param (object) mutation - Mutation object
	 * @param (object) el - Assigned element
	 * @return void
	 */
	observableEventQueue(mutation, el) {
	    let own = el.Own(), ev = this.observableEventType(mutation, own), evts = this.collectEventsOrig[own], execfn	
	    if(!this.collectEventsOrig[own]) {
	    	return
	    }
	    if(!this.collectEventsOrig[own][ev ? ev.toLowerCase() : ev]) {
	    	return
	    }
	    if(ev != 'add' && ev != 'remove' && ev != 'show' && ev != 'hide') {
	    	return
	    }
	    if(evts.indexOf('before'+ev) != -1) {
	    	if(evts.indexOf(ev) != -1) {
	    		if(evts.indexOf('after'+ev) != -1) {
	    			execfn = e => { 
						return new Promise((resolve, reject) => resolve(evts['before'+ev].fn(evts['before'+ev].scope, el, e))).then(before=> {
							if(before === false) {
								return
							}
							return new Promise((res, rej) => res(evts[ev].fn(evts[ev].scope, el, e, before))).then(current => {
								if(current === false) {
									return
								}
								evts['after'+ev].fn(evts['after'+ev].scope, el, e, current)
							})
						})
					}
	    		} else {
	    			execfn = e => { 
						return new Promise((res, rej) => res(evts['before'+ev].fn(evts['before'+ev].scope, el, e))).then(current => {
							if(current === false) {
								return
							}
							evts[ev].fn(evts[ev].scope, el, e, current)
						})
					}
	    		}
	    	} else {
	    		if(evts.indexOf('after'+ev) != -1) {
	    			if(evts.indexOf(e) != -1) {
	    				execfn = e => { 
							return new Promise((res, rej) => res(evts[ev].fn(evts[ev].scope, el, e))).then(current => {
								if(current === false) {
									return
								}
								evts['after'+ev].fn(evts['after'+ev].scope, el, e, current)
							})
						}
	    			} else {
	    				execfn = e => { evts[ev].fn(evts[ev].scope, el, e) }
	    			}
	    		} else {
	    			execfn = e => { evts[ev].fn(evts[ev].scope, el, e) }
	    		}
	    	}
	    } else {
	    	if(evts.indexOf('after'+ev) != -1) {
	    		if(evts.indexOf(ev) != -1) {
	    			execfn = e => { 
						return new Promise((res, rej) => res(evts[ev].fn(evts[ev].scope, el, e))).then(current => {
							if(current === false) {
								return
							}
							evts['after'+ev].fn(evts['after'+ev].scope, el, e, current)
						})
					}
	    		} else {
	    			execfn = e => { evts[ev].fn(evts[ev].scope, el, e) }
	    		}
	    	} else {
	    		execfn = e => { evts[ev].fn(evts[ev].scope, el, e) }
	    	}
	    }
		execfn(mutation)
	}

	/*
	 * @desc Detect mutation event name and prevent double mutation observer triggering
	 * @param (object) mutation - Mutation object
	 * @param (string) own - Owner
	 * @return string
	 */
	observableEventType(mutation, own) {	
		switch(mutation.type) {
			case 'childList':
				if(mutation.addedNodes.length > 0 && mutation.addedNodes[mutation.addedNodes.length - 1].nodeType == 1) {
					return 'add'
				}
				if(mutation.removedNodes.length > 0 && mutation.removedNodes[mutation.removedNodes.length - 1].nodeType == 1) {
					return 'remove'
				}
			break
			case 'attributes':
				if(mutation.attributeName == 'style') {
					switch(getComputedStyle(mutation.target).getPropertyValue('display')) {
						case 'block':
							return 'show'
						break
						case 'none':
							return 'hide'
						break
					}
					switch(getComputedStyle(mutation.target).getPropertyValue('visibility')) {
						case 'visible':
							return 'show'
						break
						case 'hidden':
							return 'hide'
						break
					}
				}
			break
		}
	}

}
