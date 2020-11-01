
import {setOwner} from './../../utils/utils.js'

export class list {
	
	constructor(scope, store, data, element, options) {
		if(scope) {
			this.scope = scope
		}
		if(store) {
			this.store = store
		}
		if(data) {
			this.data = data
		}
		if(element) {
			this.element = element
		}
		if(!options) {
			return
		}
		this.options = options
		switch(this.options.output && this.options.output.toLowerCase()) {
			case 'ol':
				this.container = document.createElement('ol')
			break
			case 'ul':
				this.container = document.createElement('ul')
			break
			case 'select':
				this.container = document.createElement('select')
			break
		}
		this.tag = this.options.output.toLowerCase()
		this.options.store && this.container.setAttribute('store', this.options.store)
		this.options.targetstore && this.container.setAttribute('targetstore', this.options.targetstore)
		this.options.autoload && this.container.setAttribute('autoload', '')		
		this.options.placeholder && this.container.setAttribute('placeholder', this.options.placeholder)
		this.options.placeholderclasses && this.container.setAttribute('placeholderclasses', this.options.placeholderclasses)
		this.options.activeclasses && this.container.setAttribute('activeclasses', this.options.activeclasses)		
		this.options.classList && this.container.classList.add(...this.options.classList)
		this.createList()
		this.insertList()
		this.applyStore()
		return this
	}

	createList() {
		var item = document.createElement(this.tag == 'select' ? 'option' : 'li')
		item.innerHTML = '{{'+this.options.datakey+'}}'
		this.options.itemclasses && item.classList.add(...this.options.itemclasses)
		this.container.appendChild(item)
	}

	insertList() {
		let el
		if(!document.querySelector('['+this.options.container+'=""]')) {
			if(this.options.container instanceof Element) {
				el = this.options.container
			} else {
				el = document.getElementById(this.options.container)
			}
		} else {
			el = document.querySelector('['+this.options.container+'=""]')			
		}
		el.appendChild(this.container)
	}

	applyStore() {
		this.store = this.scope.setStore(this.container, this.scope)
		this.store.applyStoreToDOM()
	}

	createListFromStore(scope, tag) {
		let row, rowparent, clonedrow = [], checkfirstload = true, collect = [], placeholder = false
		if(this.placeholderListSelect) {
			this.element.innerHTML = ''
			checkfirstload = false
		}
		if(this.placeholderListSelect == undefined) {
			this.placeholderListSelect = this.element.firstElementChild
		}
		row = this.element.firstElementChild		
		if(!checkfirstload) {
			row = this.placeholderListSelect
			rowparent = this.element	
		} else {
			rowparent = row.parentNode		
		}
		if(this.element.hasAttribute('placeholder')) {
			switch(this.element.tagName.toLowerCase()) {
				case 'ul':
				case 'ol':
					let li = document.createElement('li')
					li.innerHTML = this.element.getAttribute('placeholder')
					let attrs = [...row.attributes]
					attrs.forEach(attr => li.setAttribute(attr.nodeName, attr.nodeValue))
					if(this.element.hasAttribute('placeholderclasses')) {						
						this.element.getAttribute('placeholderclasses').split(',').forEach(cls => {
							li.classList.add(cls.trim())
						})
					}
					this.element.appendChild(li)
				break
				case 'select':
					let option = document.createElement('option')
					option.innerHTML = this.element.getAttribute('placeholder')
					if(this.element.hasAttribute('placeholderclasses')) {
						this.element.getAttribute('placeholderclasses').split(',').forEach(cls => {
							option.classList.add(cls.trim())
						})
					}
					this.element.appendChild(option)					
				break
			}
			placeholder = true
		}		
		let activeclasses = this.element.getAttribute('activeclasses')
		this.scope.keys[this.element.getAttribute('own')] = []
		this.data.forEach(obj => {
			let i = 0, fields = {}
			clonedrow = row.cloneNode(true)	
			Object.values(obj).forEach(item => {		
				if(i == 0) {
					this.addRow = clonedrow
				}		
				let re = new RegExp('{{'+Object.keys(obj)[i]+'}}')	
				this.scope.keys[this.element.getAttribute('own')].push(Object.keys(obj)[i])		
				fields[Object.keys(obj)[i]] = item	
				this.replacePlaceholder(clonedrow, obj, re, item)
				++i
			})	
			if(this.store.targetstores && this.store.targetstores.length && (this.element.tagName.toLowerCase() == 'ul' || this.element.tagName.toLowerCase() == 'ol')) {	
				clonedrow.style.cursor = 'pointer'		
				let el = this.element	
				!this.scope.hasEvent(clonedrow, 'click') && this.scope.setEvent(clonedrow, 'click', (s, o, e) => {
					e.stopPropagation()
					this.state == fields
					if(activeclasses) {
						activeclasses.split(',').forEach(cls => {
							[...el.children].forEach(item => {
								item.classList.remove(cls)
							})
							if(e.target.tagName.toLowerCase() == 'span') {
								e.target.parentNode.classList.add(cls)
							} else {
								e.target.classList.add(cls)
							}
						})
					}				
					this.store.targetstores.forEach(storeObj => {
						this.store.targetAction(storeObj, fields)
					})
				})
			}
			rowparent.appendChild(clonedrow)
			collect.push(fields)
		})	
		if(this.store.targetstores && this.store.targetstores.length && this.element.tagName.toLowerCase() == 'select') {
			this.element.addEventListener('change', function(e) {
				this.state = collect[placeholder ? this.selectedIndex - 1 : this.selectedIndex]
				if(placeholder && this.selectedIndex == 0) {
					return
				}
				this.store.targetstores.forEach(storeObj => this.store.targetAction(storeObj, collect[placeholder ? this.selectedIndex - 1 : this.selectedIndex]))
			})
		}
		if(checkfirstload) {
			this.element.firstElementChild.remove()
		}
	}


	replacePlaceholder(el, row, re, item) {		
		if(el.innerHTML.match(re)) {
			let cell = document.createElement('span')			
			cell.setAttribute('cell', '')
			cell.style.display = 'block'
			cell.style.whiteSpace = 'nowrap'
			cell.style.width = '100%'
			cell.style.minHeight = '20px'
			el.innerHTML = el.innerHTML.replace(re, cell.outerHTML)
			el.firstElementChild.innerHTML = item
		}	
	}

	load() {
		this.store.Fill()
	}

}