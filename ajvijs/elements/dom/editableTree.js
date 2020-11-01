
export class editableTree {
	
	constructor(scope, store, container, element, item, tree) {
		this.scope = scope
		this.store = store
		this.container = container
		this.element = element
		this.item = item
		this.tree = tree
		!this.scope.hasEvent(this.element, 'dblclick') && this.scope.setEvent(this.element, 'dblclick', (s, o, e) => {
			e.preventDefault()
			e.stopPropagation()
			this.closeOpenCells()
			this.setTextInput()	
		})	
	}

	setTextInput() {
		let txtinput = document.createElement('input')
		txtinput.setAttribute('type', 'text')
		txtinput.setAttribute('value', this.item)
		this.setInputEvents(txtinput)
		this.element.innerHTML = ''
		this.element.appendChild(txtinput)
		txtinput.focus()
	}

	setInputEvents(el) {
		!this.scope.hasEvent(el, 'click') && this.scope.setEvent(el, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		!this.scope.hasEvent(el, 'dblclick') && this.scope.setEvent(el, 'dblclick', (s, o, e) => {
			e.stopPropagation()
		})
		!this.scope.hasEvent(el, 'keyup') && this.scope.setEvent(el, 'keyup', (s, o, e) => {
			e.stopPropagation()
			this.eventKeyHandler(e)
		})
	}

	eventKeyHandler(e) {
		switch(e.keyCode) {
            case 38: 
            	this.navigateUp(e.target)
            break
            case 40: 
            	this.navigateDown(e.target)
            break
            case 13: 
            	let parent = e.target.parentNode.parentNode
            	this.completeCell(e.target)
            	this.tree.itemOnChange(parent.id, this.store)
            break
            case 27: 
            	this.exitCell(e.target)
            break
       }
	}	

	navigateUp(target) {
		let parent = target.parentNode
		let spans = this.container.querySelectorAll('li>span:last-child')
		let index = Array.from(spans).indexOf(parent)
		if(index > 0 && index != -1) {
			this.completeCell(target)
			this.element = spans[index - 1]
			this.item = this.element.innerHTML
			this.setTextInput()
		}
	}

	navigateDown(target) {
		let parent = target.parentNode
		let spans = this.container.querySelectorAll('li>span:last-child')
		let index = Array.from(spans).indexOf(parent)
		if(index < spans.length - 1 && index != -1) {
			this.completeCell(target)
			this.element = spans[index + 1]
			this.item = this.element.innerHTML
			this.setTextInput()
		}
	}

	closeOpenCells() {
		let input = this.container.querySelector('input[type="text"]')
		input && this.completeCell(input)
	}

	completeCell(target) {								
		let val = target.value, id = target.parentNode.parentNode.id
		target.parentNode.innerHTML = target.value
		this.item = target.value
		this.tree.setDataAttribute(id, 'text', target.value, this.store.dataOrig.fill)
	}

	exitCell(target) {
		target.parentNode.innerHTML = target.getAttribute('value')
	}

}