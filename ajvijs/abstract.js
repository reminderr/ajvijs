import {events} from './events.js'
import {store} from './store.js'
import {view} from './elements/view/view.js'
import {list} from './elements/list/list.js'
import {tree} from './elements/tree/tree.js'
import {layout} from './elements/layout/layout.js'

export class ajvi extends events {

	constructor(obj) {
		super()		
		if(obj && obj.template) {
			this.setTemplate(obj.template)
		}
		if(obj && obj.scope) {
			this[obj.scope.constructor.name] = obj.scope
		}
		this.setProto()
	}

	setProto() {
		HTMLElement.prototype.Scope = this 
		HTMLElement.prototype.At = this.appendTo
		HTMLElement.prototype.AtFirst = this.appendFirst
		HTMLElement.prototype.AtLast = this.appendLast
		HTMLElement.prototype.AtBeforeStart = this.appendBefore
		HTMLElement.prototype.AtAfterEnd = this.appendAfter
		HTMLElement.prototype.Before = this.before
		HTMLElement.prototype.Replace = this.replace
		HTMLElement.prototype.Id = this.setId
		HTMLElement.prototype.Html = this.setHtml
		HTMLElement.prototype.Style = this.setStyle
		HTMLElement.prototype.Css = this.setCss
		HTMLElement.prototype.CssRemove = this.removeCss
		HTMLElement.prototype.CssContain = this.containsCss
		HTMLElement.prototype.Toggle = this.toggleCss
		HTMLElement.prototype.Attr = this.setAttributes
		HTMLElement.prototype.Store = this.setElementStore
		HTMLElement.prototype.HasEvent = this.getElementEvent
		HTMLElement.prototype.SetEvent = this.setElementEvent
		HTMLElement.prototype.UnsetEvent = this.unsetElementEvent
		HTMLElement.prototype.OverwriteEvent = this.overwriteElementEvent
		HTMLElement.prototype.State = this.setState
		HTMLElement.prototype.Wrap = this.setContainer
		HTMLElement.prototype.Parent = this.getParent
		HTMLElement.prototype.Childrens = this.getChildrens
		HTMLElement.prototype.Prev = this.getPrevSibling
		HTMLElement.prototype.Next = this.getNextSibling
		HTMLElement.prototype.Select = this.getSelector
		HTMLElement.prototype.SelectAll = this.getSelectorAll
		HTMLElement.prototype.Own = this.setOwner
		HTMLElement.prototype.Index = this.getElementIndex
	}

	init() {
		let dom = this.getTag('*', document.body)
		window.addEventListener('load', e => {					
			let root = this.getTag('body')
			root[0].innerHTML = this.getTemplate().body.innerHTML
			this.applyEvents(dom)
		})
	}

	getTag(tag, el) {
		return el ? el.getElementsByTagName(tag) : document.getElementsByTagName(tag)
	}

	getId(id) { 
		return document.getElementById(id)
	}

	setTemplate(tpl) {
		let parser = new DOMParser()
		let doc = parser.parseFromString(tpl, 'text/html')
		this.template = doc	 
	}

	getTemplate() {
		return this.template
	}

	getStoreByName(store) {
		let elstore = document.querySelector('[store="'+store+'"]')
		if(!store) {
			throw 'This component has no store object '+store+'.'
			return
		}
		let own = elstore.Own()
		if(!own) {
			throw 'This element has no store object.'
			return
		}
		return this.store[own]
	}

	getStoreByDOM(el) {
		let own = el.Own()
		if(!own) {
			throw 'This element has no store object.'
			return
		}
		return this.store[own]
	}

	getStoreByVar(variable) {
		return this.store[variable]
	}

	getDataObject(el, type) {
		return this.getStoreByDOM(el).getResponse(type)
	}

	getDataRow(el, target, type) {
		let row, _el, num = 0, index, store = this.getStoreByDOM(el)
		switch(el.tagName.toLowerCase()) {
			case 'div':
				row = target.closest('.tablerow')
				if(el.querySelector('.tablebody')) {
					_el = el.querySelector('.tablebody')				
				}
			break
			case 'table':
				row = target.closest('tr')
				if(el.querySelector('tbody')) {
					_el = el.querySelector('tbody')
				}
			break
			case 'ul':
			case 'ol':				
				row = target.closest('li')
				if(el.hasAttribute('placeholder')) {
					num = 1
				}
			break
		}
		if(el.hasAttribute('paginate') && !isNaN(el.getAttribute('paginate'))) {
			let paginate = parseInt(el.getAttribute('paginate'))
			index = store.page * paginate - paginate + Array.from(_el.children).indexOf(row)
		} else {
			index = Array.from(_el.children).indexOf(row) - num
		}
		return this.getStoreByDOM(el).getResponse(type)[index]
	}

	getIndexRow(el, target) { 
		let row, _el, num = 0, index, store = this.getStoreByDOM(el)
		switch(el.tagName.toLowerCase()) {
			case 'div':
				row = target.closest('.tablerow')
				if(el.querySelector('.tablebody')) {
					_el = el.querySelector('.tablebody')	
				}		
			break
			case 'table':
				row = target.closest('tr')
				if(el.querySelector('tbody')) {
					_el = el.querySelector('tbody')
				}
			break
			case 'ul':
			case 'ol':				
				row = target.closest('li')
				if(el.hasAttribute('placeholder')) {
					num = 1
				}
			break
		}
		if(el.hasAttribute('paginate') && !isNaN(el.getAttribute('paginate'))) {
			let paginate = parseInt(el.getAttribute('paginate'))
			index = store.page * paginate - paginate + Array.from(_el.children).indexOf(row)
		} else {
			index = Array.from(_el.children).indexOf(row) - num
		}
		return index
	}

	render(cont) {
		if(!cont.tagName) {
			throw 'Specify component container.'
			return
		}
		return new Promise((resolve, reject) => {
			let dom = this.getTag('*', cont)
			cont.innerHTML = ''
			cont.innerHTML = this.getTemplate().body.innerHTML
			resolve(this.applyEvents(dom))
		})
	}

	appendTo(el) {
		if(document.readyState != 'complete') {
			window.addEventListener('load', e => {	
				if(el instanceof Element) {
					el.appendChild(this)
					return this
				}
				if(document.getElementById(el)) {
					document.getElementById(el).appendChild(this)
					return this
				}
				if(document.querySelector(el)) {
					document.querySelector(el).appendChild(this)
				}
			})
		} else {
			if(el instanceof Element) {
				el.appendChild(this)
				return this
			}
			if(document.getElementById(el)) {
				document.getElementById(el).appendChild(this)
				return this
			}
			if(document.querySelector(el)) {
				document.querySelector(el).appendChild(this)
			}
		}
		return this
	}

	appendBefore(el) {
		if(document.readyState != 'complete') {
			window.addEventListener('load', e => {	
				if(el instanceof Element) {
					el.insertAdjacentElement('beforebegin', this)
					return this
				}
				if(document.getElementById(el)) {
					document.getElementById(el).insertAdjacentElement('beforebegin', this)
					return this
				}
				if(document.querySelector(el)) {
					document.querySelector(el).insertAdjacentElement('beforebegin', this)
				}
			})
		} else {
			if(el instanceof Element) {
				el.insertAdjacentElement('beforebegin', this)
				return this
			}
			if(document.getElementById(el)) {
				document.getElementById(el).insertAdjacentElement('beforebegin', this)
				return this
			}
			if(document.querySelector(el)) {
				document.querySelector(el).insertAdjacentElement('beforebegin', this)
			}
		}
		return this		
	}

	appendFirst(el) {
		if(document.readyState != 'complete') {
			window.addEventListener('load', e => {	
				if(el instanceof Element) {
					el.insertAdjacentElement('afterbegin', this)
					return this
				}
				if(document.getElementById(el)) {
					document.getElementById(el).insertAdjacentElement('afterbegin', this)
					return this
				}
				if(document.querySelector(el)) {
					document.querySelector(el).insertAdjacentElement('afterbegin', this)
				}
			})
		} else {
			if(el instanceof Element) {
				el.insertAdjacentElement('afterbegin', this)
				return this
			}
			if(document.getElementById(el)) {
				document.getElementById(el).insertAdjacentElement('afterbegin', this)
				return this
			}
			if(document.querySelector(el)) {
				document.querySelector(el).insertAdjacentElement('afterbegin', this)
			}
		}
		return this	
	}

	appendLast(el) {
		if(document.readyState != 'complete') {
			window.addEventListener('load', e => {	
				if(el instanceof Element) {
					el.insertAdjacentElement('beforeend', this)
					return this
				}
				if(document.getElementById(el)) {
					document.getElementById(el).insertAdjacentElement('beforeend', this)
					return this
				}
				if(document.querySelector(el)) {
					document.querySelector(el).insertAdjacentElement('beforeend', this)
				}
			})
		} else {
			if(el instanceof Element) {
				el.insertAdjacentElement('beforeend', this)
				return this
			}
			if(document.getElementById(el)) {
				document.getElementById(el).insertAdjacentElement('beforeend', this)
				return this
			}
			if(document.querySelector(el)) {
				document.querySelector(el).insertAdjacentElement('beforeend', this)
			}
		}
		return this	
	}

	appendAfter(el) {
		if(document.readyState != 'complete') {
			window.addEventListener('load', e => {	
				if(el instanceof Element) {
					el.insertAdjacentElement('afterend', this)
					return this
				}
				if(document.getElementById(el)) {
					document.getElementById(el).insertAdjacentElement('afterend', this)
					return this
				}
				if(document.querySelector(el)) {
					document.querySelector(el).insertAdjacentElement('afterend', this)
				}
			})
		} else {
			if(el instanceof Element) {
				el.insertAdjacentElement('afterend', this)
				return this
			}
			if(document.getElementById(el)) {
				document.getElementById(el).insertAdjacentElement('afterend', this)
				return this
			}
			if(document.querySelector(el)) {
				document.querySelector(el).insertAdjacentElement('afterend', this)
			}
		}
		return this	
	}

	before(el) {
		if(document.readyState != 'complete') {
			window.addEventListener('load', e => {	
				if(el instanceof Element) {
					el.parentNode.insertBefore(this, el)
					return this
				}
				if(document.getElementById(el)) {
					document.getElementById(el).parentNode.insertBefore(this, document.getElementById(el))
					return this
				}
				if(document.querySelector(el)) {
					document.querySelector(el).parentNode.insertBefore(this, document.querySelector(el))
				}
			})
		} else {
			if(el instanceof Element) {
				el.parentNode.insertBefore(this, el)
				return this
			}
			if(document.getElementById(el)) {
				document.getElementById(el).parentNode.insertBefore(this, document.getElementById(el))
				return this
			}
			if(document.querySelector(el)) {
				document.querySelector(el).parentNode.insertBefore(this, document.querySelector(el))
			}
		}
		return this
	}

	replace(el) {
		if(document.readyState != 'complete') {
			window.addEventListener('load', e => {	
				if(el instanceof Element) {
					el.parentNode.replaceChild(this, el)
					return this
				}
				if(document.getElementById(el)) {
					document.getElementById(el).parentNode.replaceChild(this, document.getElementById(el))
					return this
				}
				if(document.querySelector(el)) {
					document.querySelector(el).parentNode.replaceChild(this, document.querySelector(el))
				}
			})
		} else {
			if(el instanceof Element) {
				el.parentNode.replaceChild(this, el)
				return this
			}
			if(document.getElementById(el)) {
				document.getElementById(el).parentNode.replaceChild(this, document.getElementById(el))
				return this
			}
			if(document.querySelector(el)) {
				document.querySelector(el).parentNode.replaceChild(this, document.querySelector(el))
			}
		}
		return this
	}

	setId(id) {
		if(!id) {
			return this.id
		}
		this.id = id
		return this
	}

	setHtml(html) {
		if(html == undefined) {
			return this.innerHTML
		}
		this.innerHTML = html
		return this
	}

	setStyle(style) {
		if(style == undefined) {
			return this.style
		}
		Object.keys(style).forEach(prop => this.style[prop] = style[prop])
		return this
	}

	setCss(css) {
		if(css == undefined) {
			return this.classList
		}
		this.classList.add(css)
		return this
	}

	removeCss(css) {
		if(this.classList.contains(css)) {
			this.classList.remove(css)
		}
		return this
	}

	containsCss(css) {
		return this.classList.contains(css)
	}

	toggleCss(cls) {
		this.classList.toggle(cls)
		return this
	}

	setAttributes(attr, val) {
		if(!val) {
			return this.getAttribute(attr)
		}
		this.setAttribute(attr, val)
		return this
	}

	setElementStore(store) {
		if(store == undefined) {
			return this.StoreModel
		}
		this.StoreModel = store
		return this
	}

	setElementEvent(event, handler) {
		this.Scope.setEvent(this, event, handler)
		return this
	}

	getElementEvent(event) {
		return this.Scope.hasEvent(this, event)
	}

	unsetElementEvent(event) {
		this.Scope.unsetEvent(this, event)
		return this
	}

	overwriteElementEvent(event, handler) {
		this.Scope.overwriteEvent(this, event, handler)
		return this
	}

	setState(state) {
		if(state == undefined) {
			return this.ElementState
		}
		this.ElementState = state
		return this
	}

	setContainer(el) {
		if(el == undefined) {
			return this.parentNode
		}
		let container = el		
		this.parentNode.replaceChild(container, this)
		container.appendChild(this)
		return this
	}

	getParent() {
		return this.parentElement
	}

	getChildrens() {
		return [...this.children]
	}

	getPrevSibling() {
		return this.previousElementSibling
	}

	getNextSibling() {
		return this.nextElementSibling
	}

	getSelector(selector) {
		return this.querySelector(selector)
	}

	getSelectorAll(selector) {
		return this.querySelectorAll(selector)
	}

	getElementIndex() {
		let parent = this.parentNode
		return Array.from(parent.children).indexOf(this)
	}

	setOwner(own) {
		if(own == undefined) {
			return this.Owner
		}
		this.Owner = own
	}

	Tag(node) {
		return document.createElement(node)
	}

	View(el, settings) {		
		this[settings['name']] = el		
		if(settings['store']) {
			let store = this.setStore(settings['store'])
			store.applyStore().then(() => {
				this[settings['name']].Store(store)
				typeof this[settings['then']] == 'function' && this[settings['then']]()	
			})		
		}
	}

	setStore(target) {
		 return new store(target, this)
	}

	DataView(settings, protos) {
		protos && Object.keys(protos).forEach(proto => view.prototype[proto] = protos[proto])
		this[settings['name']] = new view(this, 0, 0, 0, settings)
	}

	createList(settings, protos) {
		protos && Object.keys(protos).forEach(proto => list.prototype[proto] = protos[proto])
		return new list(this, 0, 0, 0, settings)
	}

	TreeView(settings, protos) {
		protos && Object.keys(protos).forEach(proto => tree.prototype[proto] = protos[proto])
		this[settings['name']] = new tree(this, 0, 0, 0, settings)
	}

	Layout(settings) {
		this[settings['name']] = new layout(settings, this)
	}
	/*
	createAccordion(settings) {
		//todo for version 1.0.2
	}

	createTab(settings) {
		//todo for version 1.0.2
	}

	createpanel(settings) {
		//todo for version 1.0.2
	}*/
	
}