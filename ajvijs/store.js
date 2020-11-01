
import {domhub} from './elements/dom/domhub.js'
import paginate from './utils/utils.js'
import {setOwner} from './utils/utils.js'

export class store {
	
	constructor(target, scope) {		
		this.store = []
		this.data = []
		this.paginateData = []
		this.dataOrig = []
		this.added = []
		this.updated = []
		this.targetstores = []
		this.scope = scope
		this.page = 1
		this.filterActive = false
		if(target instanceof Element) {
			this.storeName = target.getAttribute('store')
			this.element = target
			if(!target.getAttribute('own')) {
				setOwner(target)
			}
			this.scope.store[target.getAttribute('own')] = this
			this.domhub = new domhub(this.element, this.scope)
			this.paginate = this.element.hasAttribute('paginate') ? this.element.getAttribute('paginate') : null
		} else {
			this.variable = Object.keys({target})[0]
			this.scope.store[this.variable] = this
		}		
		return this
	}

	applyStoreToDOM() {	 						
		let stores		
		if(typeof this.element.getAttribute('targetstore') == 'string') {
			let store = this.element.getAttribute('targetstore')
			if(store.match(/\,/)) {
				store.split(',').forEach(s => {
					if(s.match('/\./')) {
						let tstoreName = s.pop()
						this.targetstores.push({
							target: new Function('scope', 'if(typeof scope.'+s+'.getStoreByName("'+tstoreName+'") == "object") { return scope.'+s+'.getStoreByName("'+tstoreName+'") } else { throw "Component store not initialized." }'),
							scope: this.scope,
							store: this.storeName
						})
					} else {
						this.targetstores.push({
							target: new Function('scope', 'return scope.getStoreByName("'+s+'")'),
							scope: this.scope,
							store: this.storeName
						})
					}
				})
			} else {
				this.targetstores.push({
					target: new Function('scope', 'return scope.getStoreByName("'+store+'")'),
					scope: this.scope,
					store: this.storeName
				})
			}
		}	
		typeof this.scope[this.storeName] == 'function' && this.scope[this.storeName](this, this.element)	
		if(this.element.hasAttribute('autoload')) {
			this.Fill()
		} else {
			this.setStoreActions()
		}
	}

	setStoreActions(el) {		
		let storeEvents = el ? el.querySelectorAll('['+this.storeName+']') : this.element.querySelectorAll('['+this.storeName+']')
		let i = 0
		for(let ctrl of storeEvents) {	
			let storeAttr = ctrl.getAttribute(this.storeName), fn, keyup = false	
			switch(storeAttr) {
				case 'fill':
					fn = this.Fill.bind(this)					
				break
				case 'save':
					fn = this.Save.bind(this)
				break
				case 'delete':
					fn = this.Delete.bind(this)
				break
				case 'add':
					fn = this.Add.bind(this)
				break
				case 'first':
					fn = this.paginateFirst.bind(this)
				break
				case 'prev':
					fn = this.paginatePrev.bind(this)
				break
				case 'page':
					fn = this.paginatePage.bind(this)
					keyup = true
					ctrl.value = 1
					this.pageCtrl = ctrl
				break
				case 'next':
					fn = this.paginateNext.bind(this)
				break
				case 'last':
					fn = this.paginateLast.bind(this)
				break
			}		
			!this.scope.hasEvent(storeEvents[i], keyup ? 'keyup' : 'click') && this.scope.setEvent(storeEvents[i], keyup ? 'keyup' : 'click', (s, o, e) => {
				e.stopPropagation()
				return fn(e)
			})	
			++i			
		}
	}

	setStoreDelete(el, storeName) {
		let storeEvents = el.querySelectorAll('['+storeName+'="delete"]'), i = 0
		for(let ctrl of storeEvents) {
			!this.scope.hasEvent(storeEvents[i], 'click') && this.scope.setEvent(storeEvents[i], 'click', (s, o, e) => {
				e.stopPropagation()
				this.Delete(e)
			})	
			++i
		}
	}

	fillData(data) {
		this.data.fill = data
		this.dataOrig.fill = data
		this.domhub.createFromStore(this.element.tagName, this.paginate ? this.data.fill.paginate(this.page, this.paginate).data : data, this).then(() => {
			this.setStoreActions()
		})
	}

	set fill(o) {
		this.xhrFill = new XMLHttpRequest
		this._fill = o
		Object.assign(this._fill, { type: 'fill' })
		this.setEvents('fill', this._fill.events)		
		return this
	}

	Fill() {		
		if(this._fill == undefined) {
			return
		}
		let frmData = new FormData
		if(this._fill.params) {
			Object.keys(this._fill.params).forEach(param => {
				frmData.append(param, this._fill.params[param])
			})
		}
		this._fill.params = frmData
		this.request(this.xhrFill, this._fill).then(data => {
			if(this._fill.passthrough) {
				return
			}
			if(this.element instanceof Element) {
				this.domhub.createFromStore(this.element.tagName.toLowerCase(), this.paginate ? this.data.fill.paginate(this.page, this.paginate).data : this.data.fill, this).then(() => {
					this.setStoreActions()
				})										
			}
		})
	}

	set save(o) {		
		this.xhrSave = new XMLHttpRequest
		this._save = o
		Object.assign(this._save, { type: 'save' })
		if(this._save.events) {
			Object.keys(this._save.events).forEach(e => {
				if(e == 'load' || e == 'error') {
					return
				}
				this.xhrSave.addEventListener(e, this._save.events[e])
			})
		}
		return this
	}

	Save() {
		if(this._save == undefined) {
			return
		}
		if(this._save.approved && typeof this._save.approved == 'function') {
			if(!this._save.approved(this.element ? this.element : this.variable, event)) {
				return
			}
		} 
		let frmData = new FormData
		if(this.element instanceof Element) {
		    switch(this.element.tagName.toLowerCase()) {
		    	case 'form':
					let required = []
					let regex = []
					let ext = []			
					let inputs = Array.prototype.slice.call(this.element.querySelectorAll('input'), 0)
					let selects = Array.prototype.slice.call(this.element.querySelectorAll('select'), 0)
					let textareas = Array.prototype.slice.call(this.element.querySelectorAll('textarea'), 0)
					let collection = inputs.concat(selects).concat(textareas)
					collection.forEach(el => {
						let elid = el.getAttribute('id'), value
						if(elid) {
							switch(el.tagName.toLowerCase()) {
								case 'input':
									switch(el.getAttribute('type')) {
										case 'text':
										case 'hidden':
											value = el.value
										break
										case 'file':
											value = el.file[0] 
										case 'radio':
										case 'checkbox':
											value = el.checked 
										break
									}
								break
								case 'select':
									value = el.options[el.selctedIndex].value
								break
								case 'textarea':
									value = el.value
								break
							}
							frmData.append(elid, value)
						}
					})		
				break
				case 'table':
				case 'div':
					frmData.append('data', JSON.stringify({ view: this.dataOrig.fill, updated: this.updated, added: this.added }))
				break
			}
			this._save.params = frmData
		}
		this.request(this.xhrSave, this._save).then(data => {
			if(this.targetstores.length) {
				this.targetstores.forEach(storeObj => {
					this.targetAction(storeObj, Object.assign(data, {storeType: 'save'}))
				})
			}
		})
	}

	set delete(o) {
		this.xhrDelete = new XMLHttpRequest
		this._delete = o
		Object.assign(this._delete, { type: 'delete' })
		if(this._delete.events) {
			Object.keys(this._delete.events).forEach(e => {
				if(e == 'load' || e == 'error') {
					return
				}
				this.xhrDelete.addEventListener(e, this._delete.events[e])
			})
		}
		return this
	}

	Delete() {
		if(this._delete == undefined) {
			return
		}
		if(this.element instanceof Element) {
			if(this._delete.approved && typeof this._delete.approved == 'function') {
				if(this._delete.approved(this.element, event)) {
					this.domhub.view.deleteViewRow(this.element, event)
				} else {
					return
				}
			} else {
				this.domhub.view.deleteViewRow(this.element, event)
			}
		}
		let frmData = new FormData
		if(this._delete.params) {
			Object.keys(this._delete.params).forEach(param => {
				frmData.append(param, this._delete.params[param])
			})
		}
		this._delete.params = frmData
		this.request(this.xhrDelete, this._delete).then(data => {
			if(this.targetstores.length) {
				this.targetstores.forEach(storeObj => {
					this.targetAction(storeObj, Object.assign(data, {storeType: 'delete'}))
				})
			}
		})
	}

	Add() {
		if(this.filterActive) {
			alert('Cannot add view rows when active filter are present!')
			return false
		}
		this.domhub.view.addViewRow(this)
	}

	delegateOnTarget(element, event, type, data) {
		this.scope.setEvent(element, event, (s, o, e) => {
			e.stopPropagation()
			this.targetstores.forEach(storeObj => scope.targetAction(storeObj, Object.assign(data, {storeType: type})))
		})
	}

	targetAction(storeObj, data) {
		let targetstore = typeof storeObj.target == 'function' ? storeObj.target(storeObj.scope) : storeObj.target
		return new Promise((resolve, reject) => {
			if(typeof storeObj.scope[storeObj.store+'OnTarget'] == 'function') {
				resolve(storeObj.scope[storeObj.store+'OnTarget'](targetstore, data))
			} else {
				resolve(true)
			}
		}).then(proceed => {
			proceed && targetstore.Fill()
		})
	}

	setUri(storeType, url) {
		this['_'+storeType].url = url
	}

	getUri(storeType) {
		return this['_'+storeType].url
	}

	setResponseType(storeType, responseType) {
		this['_'+storeType].response = responseType 
	}

	getResponseType(storeType) {
		return this['_'+storeType].response
	}

	setParams(storeType, params) {
		this['_'+storeType].params = params
	}

	getParams(storeType) {
		return [...this['_'+storeType].params.entries()]
	}

	addParam(storeType, param) {
		Object.assign(this['_'+storeType].params, param)
	}

	removeParam(storeType, param) {
		delete(this['_'+storeType].params[param])
	}

	setEvents(storeType, events) {
		let type
		switch(storeType.toLowerCase()) {
			case 'fill':
				type = 'xhrFill'
			break
			case 'save':
				type = 'xhrSave'
			break
			case 'delete':
				type = 'xhrDelete'
			break
		}
		if(events) {
			Object.keys(events).forEach(e => {
				if(e == 'load' || e == 'error') {
					return
				}
				this[type].addEventListener(e, events[e])
			})
		}
	}

	getEvents(storeType) {
		return this['_'+storeType].events
	}

	addEvent(storeType, event) {
		if(event == 'load' || event == 'error') {
			throw `"load" or "error" events cannot be overwrited for "${storeType}" store`
			return
		}
		Object.assign(this['_'+storeType].events, event)
		this.xhrFill.addEventListener(Object.keys(event)[0], Object.values(event)[0])
	}

	removeEvent(storeType, event) {
		if(event == 'load' || event == 'error') {
			throw `"load" or "error" events cannot be removed for "${storeType}" store`
			return
		}
		this.removeEvent('save', event, this['_'+storeType].events[event])
	}

	getResponse(type) {
		return this.data[type]
	}

	reload(el) {
		this.Fill()
	}

	request(xhr, req) {
		return new Promise((resolve, reject) => {
  		    xhr.open(req.method ? req.method : 'POST', req.url+(req.method == 'GET' ? '?' + new URLSearchParams(req.params).toString() : ''))
  		    req.headers && Object.keys(req.headers).forEach(key => xhr.setRequestHeader(key, req.headers[key]))
  		    xhr.onload = e => xhr.status >= 200 && xhr.status < 300 ? resolve(this.responseType(xhr.response, req)) : reject(xhr.statusText)
  		    xhr.onerror = e => reject(xhr.statusText)
  		    xhr.send(req.params)
  	    })
	}

	responseType(response, req) {
		if(!req.response) {
			return response
		}		
		switch(req.response.toLowerCase()) {
			case 'json':
				this.data[req.type] = JSON.parse(response)
				this.dataOrig[req.type] = this.data[req.type]
				this.paginateData[req.type] = this.data[req.type]
				return JSON.parse(response)
			break
			case 'xml':
				let parser = new DOMParser()
				let xml = parser.parseFromString(response, 'text/xml')
				this.data[req.type] = xml
				this.dataOrig[req.type] = xml
				return xml
			break
			default:
				this.data[req.type] = response
				this.dataOrig[req.type] = response
			break
		}
	}

	paginateFirst(e) {
		if(!this.paginate || this.page == 1) {
			return
		}
		this.page = 1
		if(this.pageCtrl) {
			this.pageCtrl.value = this.page
		}
		let rows = [...this.element.querySelector('tbody, .tablebody').children]
		rows.forEach(item => item.remove())
		let data = this.paginateData.fill.paginate(this.page, this.paginate).data
		this.domhub.createFromStore(this.element.tagName, data, this)
	}

	paginatePrev(e) {
		if(!this.paginate || this.page == 1) {
			return
		}
		this.page = parseInt(this.page) - 1
		if(this.pageCtrl) {
			this.pageCtrl.value = this.page
		}
		let rows = [...this.element.querySelector('tbody, .tablebody').children]
		rows.forEach(item => item.remove())
		let data = this.paginateData.fill.paginate(this.page, this.paginate).data
		this.domhub.createFromStore(this.element.tagName, data, this)
	}

	paginatePage(e) {
		if(!this.paginate) {
			return
		}
		if(e != undefined) { 
			if(isNaN(e.target.value) || e.target.value.length == 0) {
				e.target.value = this.page
			}
			if(e.target.value > Math.ceil(this.paginateData.fill.length / this.paginate)) {
				e.target.value = Math.ceil(this.paginateData.fill.length / this.paginate)
			}
			this.page = parseInt(e.target.value)
		}
		let rows = [...this.element.querySelector('tbody, .tablebody').children]
		rows.forEach(item => item.remove())
		let data = this.paginateData.fill.paginate(this.page, this.paginate).data
		this.domhub.createFromStore(this.element.tagName, data, this)
	}

	paginateNext(e) {
		if(!this.paginate || this.page == Math.ceil(this.paginateData.fill.length / this.paginate)) {
			return
		}
		this.page = parseInt(this.page) + 1
		if(this.pageCtrl) {
			this.pageCtrl.value = this.page
		}
		let rows = [...this.element.querySelector('tbody, .tablebody').children]
		rows.forEach(item => item.remove())
		let data = this.paginateData.fill.paginate(this.page, this.paginate).data
		this.domhub.createFromStore(this.element.tagName, data, this, data.length)
	}

	paginateLast(e) {
		if(!this.paginate || this.page == Math.ceil(this.paginateData.fill.length / this.paginate)) {
			return
		}
		this.page = Math.ceil(this.data.fill.length / this.paginate)
		if(this.pageCtrl) {
			this.pageCtrl.value = this.page
		}
		let rows = [...this.element.querySelector('tbody, .tablebody').children]
		rows.forEach(item => item.remove())
		let data = this.paginateData.fill.paginate(this.page, this.paginate).data
		this.domhub.createFromStore(this.element.tagName, data, this)
	}

}
