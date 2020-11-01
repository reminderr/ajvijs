import {formatDate} from './../../utils/utils.js'
import {view} from './../view/view.js'
import {list} from './../list/list.js'
import {tree} from './../tree/tree.js'

export class domhub {
	
	constructor(element, scope) {
		this.element = element
		this.scope = scope
		this.keys = []
	}

	createFromStore(tag, data, store) {
		if(!Array.isArray(this.scope.keys)) {
			this.scope.keys = []
		}		
		this.data = data
		return new Promise((res, rej) => {
			let datatype
			if(this.element.dataset && this.element.dataset.type) {
				datatype = this.element.dataset.type
			} else {
				datatype = tag.toLowerCase()
			}
			switch(datatype) {
				case 'select':
				case 'ul':
				case 'ol':
					if(!this.list) {
						this.list = new list(this.scope, store, data, this.element)
						if(this.element.hasAttribute('id')) {
							this.scope[this.element.getAttribute('id')] = this.list
						}
					} else {
						this.list.data = data
					}
					res(this.list.createListFromStore(tag))						
				break
				case 'table':
				case 'div':
					if(!this.view) {
						this.view = new view(this.scope, store, data, this.element)
						if(this.element.hasAttribute('id')) {
							this.scope[this.element.getAttribute('id')] = this.view
						}
					} else {
						this.view.data = data
					}
					res(this.view.createViewFromStore(tag))				
				break	
				case 'form':
					res(this.fillFormFromStore(store))
				break
				case 'tree':
					if(!this.tree) {
						this.tree = new tree(this.scope, store, data, this.element)
						if(this.element.hasAttribute('id')) {
							this.scope[this.element.getAttribute('id')] = this.tree
						}
					} else {
						this.tree.data = data
					}
					res(this.tree.createTreeFromStore())
				break
			}
		})
	}

	fillFormFromStore(scope) {
		Object.keys(this.data).forEach(item => {
			let inpt = scope.element.querySelector('#'+item)
			if(!inpt) {
				if(item == 'storeType') {
					return
				}
				let newinpt = document.createElement('input')
				newinpt.setAttribute('type', 'hidden')
				newinpt.setAttribute('id', item)
				newinpt.value = this.data[item]
				this.element.insertAdjacentElement('afterbegin', newinpt)
			} else {
				switch(inpt.tagName.toLowerCase()) {
					case 'input':
					case 'textarea':
						scope.element.querySelector('#'+item).value = this.data[item]
					break
					case 'select':
						[...scope.element.querySelector('#'+item).options].forEach(option => {
							let reo = new RegExp(this.data[item])
							if(option.innerHTML.match(reo)) {
								option.selected = true
							}
						})
					break
				}
			}			
		})	
	}

}