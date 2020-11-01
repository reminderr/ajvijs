import {events} from './events.js'
import {store} from './store.js'
import {view} from './elements/view/view.js'
import {list} from './elements/list/list.js'
import {tree} from './elements/tree/tree.js'

export class ajvi extends events {

	constructor(obj) {
		super()		
		if(obj && obj.template) {
			this.setTemplate(obj.template)
		}
		if(obj && obj.scope) {
			this[obj.scope.constructor.name] = obj.scope
		}
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
		let own = elstore.getAttribute('own')
		if(!own) {
			throw 'This element has no store object.'
			return
		}
		return this.store[own]
	}

	getStoreByDOM(el) {
		let own = el.getAttribute('own')
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

	setStore(target) {
		 return new store(target, this)
	}

	createView(settings, protos) {
		protos && Object.keys(protos).forEach(proto => view.prototype[proto] = protos[proto])
		return new view(this, 0, 0, 0, settings)
	}

	createList(settings, protos) {
		protos && Object.keys(protos).forEach(proto => list.prototype[proto] = protos[proto])
		return new list(this, 0, 0, 0, settings)
	}

	createTree(settings, protos) {
		protos && Object.keys(protos).forEach(proto => tree.prototype[proto] = protos[proto])
		return new tree(this, 0, 0, 0, settings)
	}

	createLayout(settings) {

	}

	createAccordion(settings) {

	}

	createTab(settings) {

	}

	createpanel(settings) {
		
	}
	
}