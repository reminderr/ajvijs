import {dateToISO} from './../../utils/utils.js'
import {dateToInt} from './../../utils/utils.js'
import {dateTimeToInt} from './../../utils/utils.js'
import {timeToInt} from './../../utils/utils.js'

export class viewfilter {
	
	constructor(scope, element, rules, thead, e) {		
		this.element = element
		this.cellindexln = this.element.hasAttribute('linenumber') ? 1 : 0
		this.column = rules
		this.scope = scope	
		this.keys = this.scope.keys[this.element.getAttribute('own')]
		this.data = [].concat(this.scope.getStoreByDOM(this.element).data.fill)	
		this.store = this.scope.getStoreByDOM(this.element)
		if(!Array.isArray(this.filter)) {
			this.filter = []
		}
		if(!Array.isArray(this.filterValues)) {
			this.filterValues = []
		}
		setTimeout(() => {
			this.applyFilter(thead, e)
		}, 100)
		this.passthrough = 0
	}

	applyFilter(thead, e) {
		this.cellindex = parseInt(thead.getAttribute('data-index'))
		this.datakey = thead.getAttribute('data-key')
		this.event = e
		document.querySelector('.viewfilter') && document.querySelector('.viewfilter').remove()
		this.container = document.createElement('div')
		this.container.classList.add('viewfilter')
		this.container.style.position = 'absolute'
		this.container.style.zIndex = 9999
		this.container.style.border = '1px solid #cccccc'
		this.container.style.borderRadius = '3px'
		this.container.style.backgroundColor = 'white'
		this.container.style.padding= '15px'
		this.container.style.top = this.event.pageY+'px'
		this.container.style.left = this.event.pageX+'px'	
		let span = document.createElement('span')
		span.style.float = 'right'
		span.style.marginTop = '3px'
		span.style.marginRight = '3px'
		span.style.cursor = 'pointer'
		span.style.display = 'block'
		span.style.fontSize = '14px'
		span.style.fontWeight = 'bold'
		span.innerHTML = '&#x274C;'
		span.title = 'Close'
		!this.scope.hasEvent(span, 'click') && this.scope.setEvent(span, 'click', (s, o, e) => {
			document.querySelector('.viewfilter').remove()
		})
		this.container.appendChild(span)
		let type = this.column.rules[this.datakey].type.toLowerCase()
		this.orderAscDesc(type)
		switch(type) {
			case 'text':				
				this.filterText()
			break
			case 'number':
			case 'progressbar':
				this.filterNumber()
			break
			case 'date':
			case 'datetime':
			case 'time':
				this.filterDateTime(type)
			break
			case 'checkbox':
				this.filterCheckbox()
			break
			case 'list':
				this.filterList()
			break
		}
		document.body.appendChild(this.container)
	}

	orderAscDesc(type) {
		let oa = document.createElement('button')
		oa.style.margin = '5px'
		oa.classList.add('btn', 'btn-outline-success', 'btn-sm')
		oa.innerHTML = '&#x25B2;'
		oa.title = 'Order ascending'
		!this.scope.hasEvent(oa, 'click') && this.scope.setEvent(oa, 'click', (s, o, e) => {
			e.stopPropagation()
			this.sortData('asc', type)
		})
		this.container.appendChild(oa)
		let od = document.createElement('button')
		od.style.margin = '5px'
		od.classList.add('btn', 'btn-outline-success', 'btn-sm')
		od.innerHTML = '&#x25BC;'
		od.title = 'Order descending'
		!this.scope.hasEvent(od, 'click') && this.scope.setEvent(od, 'click', (s, o, e) => {
			e.stopPropagation()
			this.sortData('desc', type)
		})
		this.container.appendChild(od)
	}

	filterText() {
		let search = document.createElement('input')
		search.type = 'text'
		search.id = 'search_'+this.cellindex
		search.classList.add('form-control')
		search.style.margin = '5px'
		search.placeholder = 'Search string or RegExp'
		if(this.filterValues[this.datakey] && this.filterValues[this.datakey].value) {
			search.value = this.filterValues[this.datakey].value
		}
		!this.scope.hasEvent(search, 'click') && this.scope.setEvent(search, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		this.container.appendChild(search)
		this.resetBtn()
		this.searchBtn({
			value: 'search_'+this.cellindex,
			type: 'text',
			index: this.cellindex
		})		
	}

	filterNumber() {
		let searchFrom = document.createElement('input')
		searchFrom.type = 'number'
		searchFrom.id = 'searchfrom_'+this.cellindex
		searchFrom.classList.add('form-control')
		searchFrom.style.margin = '5px'
		searchFrom.placeholder = '>='
		if(this.filterValues[this.datakey] && this.filterValues[this.datakey].searchfrom) {
			searchFrom.value = this.filterValues[this.datakey].searchfrom
		}
		!this.scope.hasEvent(searchFrom, 'click') && this.scope.setEvent(searchFrom, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		this.container.appendChild(searchFrom)
		let searchTo = document.createElement('input')
		searchTo.type = 'number'
		searchTo.id = 'searchto_'+this.cellindex
		searchTo.classList.add('form-control')
		searchTo.style.margin = '5px'
		searchTo.placeholder = '<='
		if(this.filterValues[this.datakey] && this.filterValues[this.datakey].searchto) {
			searchTo.value = this.filterValues[this.datakey].searchto
		}
		!this.scope.hasEvent(searchTo, 'click') && this.scope.setEvent(searchTo, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		this.container.appendChild(searchTo)
		this.resetBtn()
		this.searchBtn({
			from: 'searchfrom_'+this.cellindex,
			to: 'searchto_'+this.cellindex,
			type: 'number',
			index: this.cellindex
		})	
	}

	filterDateTime(type) {
		let searchFrom = document.createElement('input')
		searchFrom.type = 'text'
		searchFrom.id = 'searchfrom_'+this.cellindex
		searchFrom.classList.add('form-control')
		searchFrom.style.margin = '5px'
		searchFrom.placeholder = '>='
		if(this.filterValues[this.datakey] && this.filterValues[this.datakey].searchfrom) {
			searchFrom.value = this.filterValues[this.datakey].searchfrom
		}
		!this.scope.hasEvent(searchFrom, 'click') && this.scope.setEvent(searchFrom, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		!this.scope.hasEvent(searchFrom, 'keydown') && this.scope.setEvent(searchFrom, 'keydown', (s, o, e) => {
			e.stopPropagation()
			e.preventDefault()
		})
		!this.scope.hasEvent(searchFrom, 'focus') && this.scope.setEvent(searchFrom, 'focus', (s, o, e) => {
			typeof this.scope[this.element.getAttribute('store')+'DateTimeFilter'] == 'function' &&
				this.scope[this.element.getAttribute('store')+'DateTimeFilter'](searchFrom, this.column.rules[this.datakey])
		})
		this.container.appendChild(searchFrom)
		let searchTo = document.createElement('input')
		searchTo.type = 'text'
		searchTo.id = 'searchto_'+this.cellindex
		searchTo.classList.add('form-control')
		searchTo.style.margin = '5px'
		searchTo.placeholder = '<='
		if(this.filterValues[this.datakey] && this.filterValues[this.datakey].searchto) {
			searchTo.value = this.filterValues[this.datakey].searchto
		}
		!this.scope.hasEvent(searchTo, 'click') && this.scope.setEvent(searchTo, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		!this.scope.hasEvent(searchTo, 'keydown') && this.scope.setEvent(searchTo, 'keydown', (s, o, e) => {
			e.stopPropagation()
			e.preventDefault()
		})
		!this.scope.hasEvent(searchTo, 'focus') && this.scope.setEvent(searchTo, 'focus', (s, o, e) => {
			typeof this.scope[this.element.getAttribute('store')+'DateTimeFilter'] == 'function' &&
				this.scope[this.element.getAttribute('store')+'DateTimeFilter'](searchTo, this.column.rules[this.datakey])
		})
		this.container.appendChild(searchTo)
		this.resetBtn()
		this.searchBtn({
			from: 'searchfrom_'+this.cellindex,
			to: 'searchto_'+this.cellindex,
			type: type,
			index: this.cellindex
		})	
	}

	filterCheckbox() {
		let div = document.createElement('div')
		let txt = document.createTextNode('State ')
		div.appendChild(txt)
		div.style.margin = '5px'
		let check = document.createElement('input')
		check.type = 'checkbox'
		check.id = 'search_'+this.cellindex
		check.style.margin = '5px'
		if(this.filterValues[this.datakey] && this.filterValues[this.datakey].value) {
			check.setAttribute('checked', this.filterValues[this.datakey].value)
		}
		!this.scope.hasEvent(check, 'click') && this.scope.setEvent(check, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		div.appendChild(check)
		this.container.appendChild(div)
		this.resetBtn()
		this.searchBtn({
			value: 'search_'+this.cellindex,
			type: 'checkbox',
			index: this.cellindex
		})	
	}

	filterList() {
		let rule = Object.values(this.column.rules)[this.cellindex]
		let div = document.createElement('div')
		div.style.margin = '5px'
		let selinput = document.createElement('select')		
		selinput.id = 'search_'+this.cellindex
		selinput.classList.add('custom-select')
		let i = 0	
		Object.keys(rule.items).forEach(item => {
			let option = document.createElement('option')
			option.setAttribute('value', item)
			option.innerHTML = Object.values(rule.items)[i]
			if(this.filterValues[this.datakey] && this.filterValues[this.datakey].value) {
				item == this.filterValues[this.datakey].value &&
					option.setAttribute('selected', true)
			}
			selinput.appendChild(option)
			++i
		})
		!this.scope.hasEvent(selinput, 'click') && this.scope.setEvent(selinput, 'click', (s, o, e) => {
			e.stopPropagation()
		})
		div.appendChild(selinput)
		this.container.appendChild(div)
		this.resetBtn()
		this.searchBtn({
			value: 'search_'+this.cellindex,
			type: 'list',
			index: this.cellindex
		})
	}

	sortData(direction, type) {
		let rows, cell = this.element.tagName.toLowerCase() == 'table' ? 'td' : 'div', switching = true, i, x, y, shouldSwitch
		while(switching) {
			switching = false
			rows = this.element.querySelectorAll('tbody tr, .tablebody .tablerow')
			for(i = 0; i < (rows.length - 1); ++i) {
				shouldSwitch = false
			  	x = rows[i].getElementsByTagName(cell)[this.cellindex + this.cellindexln].firstElementChild
			  	y = rows[i + 1].getElementsByTagName(cell)[this.cellindex + this.cellindexln].firstElementChild
			  	switch(type) {
			  		case 'text':
			  		case 'list':
			  			x = x.innerHTML.toLowerCase()
			  			y = y.innerHTML.toLowerCase()
			  		break
			  		case 'number':
			  			x = parseInt(x.innerHTML)
			  			y = parseInt(y.innerHTML)
			  		break
			  		case 'date':
			  			x = dateToInt(x.innerHTML, this.column.rules[this.datakey].format)
			  			y = dateToInt(y.innerHTML, this.column.rules[this.datakey].format)
			  		break
			  		case 'datetime':
			  			x = dateTimeToInt(x.innerHTML, this.column.rules[this.datakey].format)
			  			y = dateTimeToInt(y.innerHTML, this.column.rules[this.datakey].format)
			  		break
			  		case 'time':
			  			x = timeToInt(x.innerHTML)
			  			y = timeToInt(y.innerHTML)
			  		break
			  		case 'checkbox':
			  			x = x.firstElementChild.checked
			  			y = y.firstElementChild.checked
			  		break
			  		case 'progressbar':
			  			x = parseInt(x.querySelector('[percent=""]').innerHTML.replace(/\%/, ''))
			  			y = parseInt(y.querySelector('[percent=""]').innerHTML.replace(/\%/, ''))
			  		break
			  	}
			  	if(direction == 'asc') {
				  	if(x > y) {
				    	shouldSwitch = true
				    	break
				  	}
				} else {
			  		if(x < y) {
				    	shouldSwitch = true
				    	break
				  	}
				}
			}	
			if(shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
			  	switching = true
			}
		}
	}

	searchColumn(datakey, data, newsearch) {	
		let output = []
		if(this.filter[datakey]) {
			switch(this.filter[datakey].type) {
				case 'text':
					if(!this.filterValues[datakey] || newsearch) {
						this.filterValues[datakey] = {
							value: this.scope.getId('search_'+this.cellindex).value
						}
					}
					let regexp = new RegExp(this.filterValues[datakey].value, 'gi')
					data.forEach(item => {
						if(item[datakey].match(regexp)) {
							output.push(item)
						}
					})
					this.store.paginateData.fill = output
					this.store.paginatePage()
					++this.passthrough
				break
				case 'number':
				case 'progressbar':
					if(!this.filterValues[datakey] || newsearch) {
						this.filterValues[datakey] = {
							searchfrom: this.scope.getId('searchfrom_'+this.cellindex).value,
							searchto: this.scope.getId('searchto_'+this.cellindex).value
						}
					}
					data.forEach(item => {
						if(parseInt(item[datakey]) >= parseInt(this.filterValues[datakey].searchfrom) && parseInt(item[datakey]) <= parseInt(this.filterValues[datakey].searchto)) {
							output.push(item)
						}
					})
					this.store.paginateData.fill = output
					this.store.paginatePage()
					++this.passthrough
				break
				case 'date':
					if(!this.filterValues[datakey] || newsearch) {
						this.filterValues[datakey] = {
							searchfrom: this.scope.getId('searchfrom_'+this.cellindex).value,
							searchto: this.scope.getId('searchto_'+this.cellindex).value
						}
					}
					data.forEach(item => {
						if(dateToInt(item[datakey]) >= dateToInt(this.filterValues[datakey].searchfrom, this.column.rules[datakey].format) && dateToInt(item[datakey]) <= dateToInt(this.filterValues[datakey].searchto, this.column.rules[datakey].format)) {
							output.push(item)
						}
					})
					this.store.paginateData.fill = output
					this.store.paginatePage()
					++this.passthrough
				break
				case 'datetime':
					if(!this.filterValues[datakey] || newsearch) {
						this.filterValues[datakey] = {
							searchfrom: this.scope.getId('searchfrom_'+this.cellindex).value,
							searchto: this.scope.getId('searchto_'+this.cellindex).value
						}
					}
					data.forEach(item => {
						if(dateTimeToInt(item[datakey]) >= dateTimeToInt(this.filterValues[datakey].searchfrom, this.column.rules[datakey].format) && dateTimeToInt(item[datakey]) <= dateTimeToInt(this.filterValues[datakey].searchto, this.column.rules[datakey].format)) {
							output.push(item)
						}
					})
					this.store.paginateData.fill = output
					this.store.paginatePage()
					++this.passthrough
				break
				case 'time':
					if(!this.filterValues[datakey] || newsearch) {
						this.filterValues[datakey] = {
							searchfrom: this.scope.getId('searchfrom_'+this.cellindex).value,
							searchto: this.scope.getId('searchto_'+this.cellindex).value
						}
					}
					data.forEach(item => {
						if(timeToInt(item[datakey]) >= timeToInt(this.filterValues[datakey].searchfrom) && timeToInt(item[datakey]) <= timeToInt(this.filterValues[datakey].searchto)) {
							output.push(item)
						}
					})
					this.store.paginateData.fill = output
					this.store.paginatePage()
					++this.passthrough
				break
				case 'list':
					if(!this.filterValues[datakey] || newsearch) {
						this.filterValues[datakey] = {
							value: this.scope.getId('search_'+this.cellindex).options[this.scope.getId('search_'+this.cellindex).selectedIndex].value
						}
					}
					data.forEach(item => {
						if(item[datakey] == this.filterValues[datakey].value) {
							output.push(item)
						}
					})
					this.store.paginateData.fill = output
					this.store.paginatePage()
					++this.passthrough
				break
				case 'checkbox':
					if(!this.filterValues[datakey] || newsearch) {
						this.filterValues[datakey] = {
							value: this.scope.getId('search_'+this.cellindex).checked
						}
					}
					data.forEach(item => {
						if(item[datakey] == this.filterValues[datakey].value.toString()) {
							output.push(item)
						}
					})
					this.store.paginateData.fill = output
					this.store.paginatePage()
					++this.passthrough
				break		
			}
			this.processeddata = output	
		} else {
			this.processeddata = data	
		}
		document.querySelector('.viewfilter') && document.querySelector('.viewfilter').remove()
			
	}

	resetColumn() {
		this.passthrough = 0
		if(this.processeddata) {
			delete this.processeddata
		}
		document.querySelector('.viewfilter') && document.querySelector('.viewfilter').remove()
		Object.keys(this.filter).forEach(datakey => {
			let data = this.processeddata ? this.processeddata : this.store.dataOrig.fill
			this.searchColumn(datakey, data)
		})		
		if(this.passthrough == 0) {
			this.passthrough = 0
			delete this.processeddata
			this.store.paginateData.fill = this.store.dataOrig.fill
			this.store.paginatePage()
			this.store.filterActive = false
		}
	}

	resetBtn() {		
		let reset = document.createElement('button')
		reset.innerHTML = 'Reset filter'
		reset.classList.add('btn', 'btn-primary', 'btn-sm')
		reset.style.margin = '5px'
		reset.style.float = 'right'
		!this.scope.hasEvent(reset, 'click') && this.scope.setEvent(reset, 'click', (s, o, e) => {
			e.stopPropagation()
			this.element.querySelector('#filter_'+this.cellindex).querySelector('path').removeAttribute('style')
			if(this.filter[this.datakey]) {
				delete this.filter[this.datakey]
			}			
			if(this.filterValues[this.datakey]) {
				delete this.filterValues[this.datakey]
			}
			this.resetColumn()
		})
		this.container.appendChild(reset)
	}

	searchBtn(defs) {
		let btn = document.createElement('button')
		btn.innerHTML = 'Search'
		btn.classList.add('btn', 'btn-primary', 'btn-sm')
		btn.style.margin = '5px'
		btn.style.float = 'right'
		!this.scope.hasEvent(btn, 'click') && this.scope.setEvent(btn, 'click', (s, o, e) => {
			e.stopPropagation()
			delete this.processeddata
			this.filter[this.datakey] = defs
			this.element.querySelector('#filter_'+this.cellindex).querySelector('path').setAttribute('style', 'fill: blue')
			let data = this.processeddata ? this.processeddata : this.store.dataOrig.fill
			this.searchColumn(this.datakey, data, true)
			this.store.filterActive = true
		})
		this.container.appendChild(btn)
	}

}