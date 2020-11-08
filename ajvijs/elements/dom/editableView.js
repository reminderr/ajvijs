import {dateToISO} from './../../utils/utils.js'
import {formatDate} from './../../utils/utils.js'
import tail from 'tail.datetime/js/tail.datetime.js'

export class editableView {
	
	constructor(data, scope, container, el, row, rules, rowindex, cellindex, item, view) {
		this.data = data				
		this.scope = scope
		this.container = container
		this.store = this.scope.getStoreByDOM(this.container)
		this.row = row
		this.element = el
		this.column = rules
		this.rowindex = rowindex
		this.cellindexeditable = 0
		if(container.hasAttribute('linenumber')) {
			this.cellindexeditable = 1
		}
		this.cellindex = cellindex
		this.item = item
		this.view = view	
		if(!Array.isArray(this.scope.dataOrig)) {
			this.scope.dataOrig = []
		}
		if(!this.scope.dataOrig[this.container.getAttribute('own')]) {
			this.scope.dataOrig[this.container.getAttribute('own')] = [].concat(this.store.data.fill)	
		}
		let chk = this.element.querySelector('input[type="checkbox"]')
		if(chk) {
			!this.scope.hasEvent(chk, 'click') && this.scope.setEvent(chk, 'click', (s, o, e) => {
				this.completeCell(chk)
			})
		} else {
			!this.scope.hasEvent(this.element.firstElementChild, 'dblclick') && this.scope.setEvent(this.element.firstElementChild, 'dblclick', (s, o, e) => {
				e.preventDefault()
				e.stopPropagation()
				this.closeOpenCells()
				this.enterCell()	
			})	
		}
		this.newitems = []
		this.updateditems = []
	}

	enterCell() {
		let span = this.element.querySelector('[cell=""]')
		this.type = Object.values(this.column.rules)[this.cellindex].type.toLowerCase()
		switch(this.type) {
				case 'number':
					this.setNumberInput(span)
				break
				case 'text':
					this.setTextInput(span)
				break
				case 'list':
					this.setListInput(span)
				break
				case 'date':
				case 'time':
				case 'datetime':
					this.setDateTimeInput(span)
				break
				case 'checkbox':
					this.setCheckboxInput(span)
				break
				case 'progressbar':
					this.setProgressbarInput(span)
				break
			}
	}

	setNumberInput(span) {
		let numinput = document.createElement('input'), rule = Object.values(this.column.rules)[this.cellindex]
		numinput.setAttribute('type', 'number')
		numinput.setAttribute('value', span.innerHTML)
		rule.classList && numinput.classList.add(...rule.classList)
		rule.min && numinput.setAttribute('min', rule.min)
		rule.max && numinput.setAttribute('max', rule.max)
		this.setInputEvents(numinput, rule)
		span.innerHTML = ''
		span.appendChild(numinput)
		numinput.focus()
	}

	setProgressbarInput(span) {
		let progressbarinput = document.createElement('input'), rule = Object.values(this.column.rules)[this.cellindex]
		progressbarinput.setAttribute('type', 'number')
		progressbarinput.setAttribute('value', span.firstElementChild ? parseInt(span.firstElementChild.firstElementChild.style.width) : '')
		rule.classList && progressbarinput.classList.add(...rule.classList)
		rule.min && numinput.setAttribute('min', 0)
		rule.max && numinput.setAttribute('max', 100)
		this.setInputEvents(progressbarinput, rule)
		span.innerHTML = ''
		span.appendChild(progressbarinput)
		progressbarinput.focus()
	}

	setTextInput(span) {
		let txtinput = document.createElement('input'), rule = Object.values(this.column.rules)[this.cellindex]
		txtinput.setAttribute('type', 'text')
		txtinput.setAttribute('value', span.innerHTML)
		rule.classList && txtinput.classList.add(...rule.classList)
		rule.minlength && txtinput.setAttribute('minlength', rule.minlength)
		rule.maxlength && txtinput.setAttribute('maxlength', rule.maxlength)
		rule.pattern && txtinput.setAttribute('pattern', rule.pattern)
		this.setInputEvents(txtinput, rule)
		span.innerHTML = ''
		span.appendChild(txtinput)
		txtinput.focus()
	}

	setListInput(span) {
		let selinput = document.createElement('select'), rule = Object.values(this.column.rules)[this.cellindex]		
		rule.classList && selinput.classList.add(...rule.classList)		
		let i = 0	
		Object.keys(rule.items).forEach(item => {
			let option = document.createElement('option')
			option.setAttribute('value', item)
			item == Object.values(this.data[this.rowindex])[this.cellindex + this.cellindexeditable] && option.setAttribute('selected', 'true')
			option.innerHTML = Object.values(rule.items)[i]
			selinput.appendChild(option)
			++i
		})
		!this.scope.hasEvent(selinput, 'keydown') && this.scope.setEvent(selinput, 'keydown', (s, o, e) => {
			e.stopPropagation()
			e.preventDefault()
		})
		this.setInputEvents(selinput, rule)
		span.innerHTML = ''
		span.appendChild(selinput)
		selinput.focus()
	}

	setDateTimeInput(span) {
		let datetimeinput = document.createElement('input'), rule = Object.values(this.column.rules)[this.cellindex]
		datetimeinput.setAttribute('type', 'text')
		datetimeinput.setAttribute('value', span.innerHTML)
		rule.classList && datetimeinput.classList.add(...rule.classList)
		this.setInputEvents(datetimeinput, rule)                                               
		span.innerHTML = ''
		span.appendChild(datetimeinput)
		datetimeinput.focus()		
		span.SetEvent('remove', (s, o, e) => {
			if(this.tail) {
				this.tail.remove()
				delete this.tail
			}
			span.UnsetEvent('remove')
		})
		setTimeout(() => {
			this.tail = new tail(datetimeinput, { 
				position: 'bottom',
				startOpen: true,
				dateFormat: rule.type == 'time' ? false : rule.format,
				timeFormat: rule.type == 'date' ? false : 'HH:ii:ss',
				dateStart: rule.min ? this.getLimitDateTime(rule.min, 'string') : false,
				dateEnd: rule.max ? this.getLimitDateTime(rule.max, 'string') : false
			})
		}, 200)
	}

	setCheckboxInput(span) {		
		span.firstElementChild.focus()
		let rule = Object.values(this.column.rules)[this.cellindex]
		this.setInputEvents(span.firstElementChild, rule)
	}


	setInputEvents(el, rule) {
		!this.scope.hasEvent(el, 'click') && this.scope.setEvent(el, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		!this.scope.hasEvent(el, 'dblclick') && this.scope.setEvent(el, 'dblclick', (s, o, e) => {
			e.stopPropagation()
		})
		if(rule.inject && typeof this.scope[rule.inject] == 'function') {
			!this.scope.hasEvent(el, 'focus') && this.scope.setEvent(el, 'focus', (s, o, e) => {
				this.scope[rule.inject](e, this, Object.values(this.column.rules)[this.cellindex])
			})
		}		
		if(rule.change && typeof this.scope[rule.change] == 'function') {
			!this.scope.hasEvent(el, 'change') && this.scope.setEvent(el, 'change', (s, o, e) => {
				this.scope[rule.change](e, this, Object.values(this.column.rules)[this.cellindex])
			}) 
		}
		!this.scope.hasEvent(el, 'keyup') && this.scope.setEvent(el, 'keyup', (s, o, e) => {
			e.stopPropagation()
			setTimeout(() => {
				this.eventKeyHandler(e)
			}, 200)
		})
	}

	eventKeyHandler(e) {
		switch(e.keyCode) {
            case 37: 
            	this.navigateLeft(e.target)
            break
            case 38: 
            	this.navigateUp(e.target)
            break
            case 39: 
            	this.navigateRight(e.target) 
            break
            case 40: 
            	this.navigateDown(e.target)
            break
            case 13: 
            	this.completeCell(e.target)
            break
            case 27: 
            	this.exitCell(e.target)
            break
       }
	}	

	navigateUp(target) {
		if(this.element.parentNode.previousElementSibling) {
			this.completeCell(target)
			this.rowindex = this.rowindex - 1
			this.element = this.element.parentNode.previousElementSibling.children[this.cellindex + this.cellindexeditable]
			if(!this.element.querySelector('input[type="checkbox"]') && !this.element.querySelector('select') && Object.values(this.column.rules)[this.cellindex].type.toLowerCase() != 'progressbar') {
				this.item = this.element.querySelector('[cell=""]').innerHTML
			}
			if(Object.values(this.column.rules)[this.cellindex].type.toLowerCase() == 'progressbar') {
				this.item = this.data[this.rowindex][Object.keys(this.data[this.rowindex])[this.cellindex + this.cellindexeditable]]
			}
			this.enterCell()
		}
	}

	navigateRight(target) {
		if(this.element.nextElementSibling) {
			if(this.element.nextElementSibling.querySelector('['+this.container.getAttribute('store')+']')) {
				return
			}
			this.completeCell(target)
			this.element = this.element.nextElementSibling			
			this.cellindex = this.cellindex + 1	
			if(!this.element.querySelector('input[type="checkbox"]') && !this.element.querySelector('select') && Object.values(this.column.rules)[this.cellindex].type.toLowerCase() != 'progressbar') {
				this.item = this.element.querySelector('[cell=""]').innerHTML
			}
			if(Object.values(this.column.rules)[this.cellindex].type.toLowerCase() == 'progressbar') {
				this.item = this.data[this.rowindex][Object.keys(this.data[this.rowindex])[this.cellindex + this.cellindexeditable]]
			}
			this.enterCell()
		}
	}

	navigateDown(target) {
		if(this.element.parentNode.nextElementSibling) {
			this.completeCell(target)
			this.rowindex = this.rowindex + 1
			this.element = this.element.parentNode.nextElementSibling.children[this.cellindex + this.cellindexeditable]
			if(!this.element.querySelector('input[type="checkbox"]') && !this.element.querySelector('select') && Object.values(this.column.rules)[this.cellindex].type.toLowerCase() != 'progressbar') {
				this.item = this.element.querySelector('[cell=""]').innerHTML	
			}
			if(Object.values(this.column.rules)[this.cellindex].type.toLowerCase() == 'progressbar') {
				this.item = this.data[this.rowindex][Object.keys(this.data[this.rowindex])[this.cellindex + this.cellindexeditable]]
			}
			this.enterCell()
		}
	}

	navigateLeft(target) {
		if(this.element.previousElementSibling) {
			if(this.element.previousElementSibling.classList.contains('linenumber')) {
				return
			}
			if(this.element.classList.contains('linenumber')) {
				return
			}	
			this.completeCell(target)
			this.element = this.element.previousElementSibling				
			this.cellindex = this.cellindex - 1		
			if(!this.element.querySelector('input[type="checkbox"]') && !this.element.querySelector('select') && Object.values(this.column.rules)[this.cellindex].type.toLowerCase() != 'progressbar') {
				this.item = this.element.querySelector('[cell=""]').innerHTML
			}
			if(Object.values(this.column.rules)[this.cellindex].type.toLowerCase() == 'progressbar') {
				this.item = this.data[this.rowindex][Object.keys(this.data[this.rowindex])[this.cellindex + this.cellindexeditable]]
			}
			this.enterCell()
		}
	}

	closeOpenCells() {
		if(!this.element.parentNode.parentNode) {
			return
		}
		[...this.element.parentNode.parentNode.querySelectorAll('[cell=""]')].forEach(item => {
			let input = item.firstElementChild
			if(input && input.type && input.type.toLowerCase() == 'checkbox') {
				return
			}
			if(input && input.tagName && (input.tagName.toLowerCase() == 'input' || input.tagName.toLowerCase() == 'select')) {
				this.completeCell(input, input.parentNode.parentNode.Index())
			}
		})	
	}

	completeCell(target, index) {
		let rindex = !isNaN(this.container.hasAttribute('paginate')) ? parseInt(this.container.getAttribute('paginate')) * this.store.page - parseInt(this.container.getAttribute('paginate')) + this.rowindex : this.rowindex
		let rules = Object.values(this.column.rules)[index ? index : this.cellindex]
		let own = this.container.getAttribute('own'), unique = this.store.dataOrig.fill[this.scope.getIndexRow(this.container, target)][this.column.unique], i = 0, val
		switch(rules.type.toLowerCase()) {
			case 'text':
			case 'number':
			case 'time':								
				val = target.value
				target.parentNode.innerHTML = target.value
				this.item = target.value
			break
			case 'list':
				val = target.options[target.selectedIndex].value
				target.parentNode.innerHTML = rules.items[target.options[target.selectedIndex].value]
				this.item = target.options[target.selectedIndex].value
			break
			case 'checkbox':
				val = target.checked
				this.item = target.checked
			break
			case 'date':
				val = dateToISO(target.value, rules.format)
				target.parentNode.innerHTML = target.value.match(/\-/) ? formatDate(rules.format, target.value) : target.value
				this.item = dateToISO(target.value, rules.format)
			break
			case 'datetime':
				let dt = target.value.split(' ')
				val = dateToISO(dt[0], rules.format)+' '+dt[1]
				target.parentNode.innerHTML = target.value.match(/\-/) ? formatDate(rules.format, dt[0])+' '+dt[1] : target.value
				this.item = dateToISO(dt[0], rules.format)+' '+dt[1]
			break
			case 'progressbar':
				val = target.value
				let pdiv = document.createElement('div')
				pdiv.style.minWidth = '100px'
				if(rules.width) {
					pdiv.style.width = rules.width
				}
				pdiv.style.height = '25px'
				let bgcolor = rules.bgcolor ? rules.bgcolor : 'lightgrey'
				let percentbgcolor = rules.percentbgcolor ? rules.percentbgcolor : 'navy'
				pdiv.style.backgroundColor = bgcolor
				pdiv.style.border = rules.border.toLowerCase() == 'true' ? '1px solid '+percentbgcolor : '0px'
				let percent = document.createElement('div')
				percent.setAttribute('percent', '')
				percent.style.textAlign = 'center'
				percent.style.fontSize = '12px'
				percent.style.lineHeight = '24px'
				percent.style.height = '24px'
				percent.style.width = target.value+'%'
				percent.style.backgroundColor = percentbgcolor
				percent.style.color = rules.textcolor ? rules.textcolor : 'white'
				if(rules.text && rules.text.toLowerCase() == 'true') {
					percent.innerHTML = target.value+'%'
				}
				pdiv.appendChild(percent)
				target.parentNode.innerHTML = pdiv.outerHTML
				this.item = target.value
			break
		}		
		this.store.dataOrig.fill.forEach(item => {
			if(item[this.column.unique] == unique) {
				this.store.dataOrig.fill[i][this.view.keys[this.cellindex]] = val
				if(item[this.column.unique].match(/item/)) {
					this.store.added.push(this.store.dataOrig.fill[i])
				} else {
					this.store.updated.push({
						[this.column.unique]: unique,
						datakey: this.view.keys[this.cellindex],
						value: val
					})
				}
			}
			++i
		})
	}

	exitCell(target) {
		let rules = Object.values(this.column.rules)[this.cellindex]
		if(rules.type.toLowerCase() == 'list') {
			let ltype = rules.items[target.options[target.selectedIndex].value]
			target.parentNode.innerHTML = ltype.match(/icon\:/) ? ltype.replace('icon:', '') : ltype
			return
		}
		if(rules.type.toLowerCase() == 'checkbox') {
			return
		}
		if(rules.type.toLowerCase() == 'progressbar') {
			let pdiv = document.createElement('div')
			pdiv.style.minWidth = '100px'
			if(rules.width) {
				pdiv.style.width = rules.width
			}
			pdiv.style.height = '25px'
			let bgcolor = rules.bgcolor ? rules.bgcolor : 'lightgrey'
			let percentbgcolor = rules.percentbgcolor ? rules.percentbgcolor : 'navy'
			pdiv.style.backgroundColor = bgcolor
			pdiv.style.border = rules.border.toLowerCase() == 'true' ? '1px solid '+percentbgcolor : '0px'
			let percent = document.createElement('div')
			percent.style.textAlign = 'center'
			percent.style.fontSize = '12px'
			percent.style.lineHeight = '24px'
			percent.style.height = '24px'
			percent.style.width = target.getAttribute('value')+'%'
			percent.style.backgroundColor = percentbgcolor
			percent.style.color = rules.textcolor ? rules.textcolor : 'white'
			if(rules.text && rules.text.toLowerCase() == 'true') {
				percent.innerHTML = target.getAttribute('value')+'%'
			}
			pdiv.appendChild(percent)
			target.parentNode.innerHTML = pdiv.outerHTML
			return
		}
		target.parentNode.innerHTML = target.getAttribute('value')
	}

	getRules() {
		return this.column
	}

	hasLinenumber() {
		return this.cellindexeditable
	}

	getLimitDateTime(val, type) {
		let toparse, date
		if(isNaN(Date.parse(val))) {
			toparse = this.data[this.rowindex][val]
		} else {
			toparse = val
		}
		switch(type.toLowerCase()) {
			case 'object':
				date = new Date(toparse)
			break
			case 'integer':
				date = new Date(toparse).getTime()
			break
			case 'string':
				date = toparse
			break
		}
		return date
	}

}