
import {editableView} from './../dom/editableView.js'
import {viewfilter} from './viewfilter.js'
import {setOwner} from './../../utils/utils.js'
import {formatDate} from './../../utils/utils.js'

export class view {

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
		this.keys = []
		if(!options) {
			return
		}
		this.options = options
		this.footer = false
		this.paginate = false		
		if(!this.options.store) {
			throw 'Store not set for the element'
			return
		}
		if(options.output && options.output.toLowerCase() == 'div') {
			this.tag = 'div'
			this.view = document.createElement('div')
			this.view.classList.add('table')
		} else {
			this.tag = 'table'
			this.view = document.createElement('table')
		}
		if(typeof store != 'object') {			
			this.options.store && this.view.setAttribute('store', this.options.store)
			this.options.targetstore && this.view.setAttribute('targetstore', this.options.targetstore)
			this.options.autoload && this.view.setAttribute('autoload', '')
			this.options.paginate && this.view.setAttribute('paginate', this.options.paginate)
			this.options.editable && this.view.setAttribute('editable', '')
			this.options.linenumber && this.view.setAttribute('linenumber', '')
			this.options.classList && this.view.classList.add(...this.options.classList)
			setTimeout(() => {
				this.createView()
				this.applyStore()
			}, 100)
		}
		return this
	}

	createView() {
		this.thead = document.createElement(this.tag == 'div' ? 'div' : 'thead')
		this.tag == 'div' && thead.classList.add('tablehead')
		this.tbody = document.createElement(this.tag == 'div' ? 'div' : 'tbody')
		this.tag == 'div' && tbody.classList.add('tablebody')
		this.tfoot = document.createElement(this.tag == 'div' ? 'div' : 'tfoot')
		this.tag == 'div' && tfoot.classList.add('tablefoot')
		this.trow = document.createElement(this.tag == 'div' ? 'div' : 'tr')
		this.tag == 'div' && trow.classList.add('tablerow')
		this.th = document.createElement('th')
		this.tcell = document.createElement(this.tag == 'div' ? 'div' : 'td')	
		this.tag == 'div' && tcell.classList.add('tablecell')	

		this.options.header && this.options.header.length && this.setHeader()
		this.options.datakey && this.options.datakey.length && this.setDataKey()
		this.options.footer && this.options.footer.length && this.setFooter()
		this.options.paginate && !isNaN(this.options.paginate) && this.setPaginate()

		this.setActions()
	}

	setHeader() {
		let trow = this.trow.cloneNode()
		this.options.header.forEach(head => {
			let th = this.tag == 'div' ? this.tcell.cloneNode() : this.th.cloneNode()
			th.innerHTML = head
			trow.appendChild(th)
		})
		this.thead.appendChild(trow)
		this.view.appendChild(this.thead)
	}

	setDataKey() {
		let trow = this.trow.cloneNode()
		this.options.datakey.forEach(key => {
			let td = this.tcell.cloneNode()
			td.innerHTML = '{{'+key+'}}'
			trow.appendChild(td)
		})
		this.tbody.appendChild(trow)
		this.view.appendChild(this.tbody)
	}

	setFooter() {
		let trow = this.trow.cloneNode()
		this.options.footer.forEach(foot => {
			let th = this.tag == 'div' ? this.tcell.cloneNode() : this.th.cloneNode()
			th.innerHTML = foot
			trow.appendChild(th)
		})
		this.tfoot.appendChild(trow)
		this.view.appendChild(this.tfoot)
		this.footer = true
	}

	setPaginate() {
		let trow = this.trow.cloneNode()
		let th = this.tag == 'div' ? this.tcell.cloneNode() : this.th.cloneNode()
		let btn = document.createElement('button')
		let _btn = btn.cloneNode()
		_btn.appendChild(document.createTextNode('<<'))
		_btn.setAttribute(this.options.store, 'first')
		th.appendChild(_btn)

		_btn = btn.cloneNode()
		_btn.appendChild(document.createTextNode('<'))
		_btn.setAttribute(this.options.store, 'prev')
		th.appendChild(_btn)

		let inp = document.createElement('input')
		inp.type = 'text'
		inp.style.width = '50px'
		inp.value = 1
		inp.setAttribute(this.options.store, 'page')
		th.appendChild(inp)

		_btn = btn.cloneNode()
		_btn.appendChild(document.createTextNode('>'))
		_btn.setAttribute(this.options.store, 'next')
		th.appendChild(_btn)

		_btn = btn.cloneNode()
		_btn.appendChild(document.createTextNode('>>'))
		_btn.setAttribute(this.options.store, 'last')
		th.appendChild(_btn)

		this.tag == 'table' && th.setAttribute('colspan', this.options.datakey.length)
		trow.appendChild(th)
		this.tfoot.appendChild(trow)
		!this.footer && this.view.appendChild(this.tfoot) 
		this.paginate = true
	}

	setActions() {
		let actions = this.options.actions.filter(item => item.toLowerCase()), btn = document.createElement('button'), _btn
		if(actions.indexOf('add') != -1) {
			_btn = btn.cloneNode()
			_btn.appendChild(document.createTextNode('Add'))
			_btn.setAttribute(this.options.store, 'add')
			_btn.setAttribute('style', 'float: right')
			this.tfoot.lastElementChild.firstElementChild.appendChild(_btn)
		}
		if(actions.indexOf('save') != -1) {
			_btn = btn.cloneNode()
			_btn.appendChild(document.createTextNode('Save'))
			_btn.setAttribute(this.options.store, 'save')
			_btn.setAttribute('style', 'float: right')
			this.tfoot.lastElementChild.firstElementChild.appendChild(_btn)
		}
		if(actions.indexOf('delete') != -1) {
			this.thead.firstElementChild.appendChild(this.tag == 'div' ? this.tcell.cloneNode() : this.th.cloneNode())
			if(this.footer) {
				this.tfoot.firstElementChild.appendChild(this.tag == 'div' ? this.tcell.cloneNode() : this.th.cloneNode())
			}
			this.tbody.firstElementChild.appendChild(this.tcell.cloneNode())
			_btn = btn.cloneNode()
			_btn.appendChild(document.createTextNode('Delete'))
			_btn.setAttribute(this.options.store, 'delete')
			this.tbody.firstElementChild.lastElementChild.appendChild(_btn)
			if(this.paginate) {
				this.tfoot.lastElementChild.firstElementChild.setAttribute('colspan', this.options.datakey.length + 1)
			}
		}
	}

	applyStore() {
		this.store = this.scope.setStore(this.view, this.scope)
		this.store.applyStoreToDOM() 
		this.store.paginateData.fill = this.store.data.fill
	}

	createViewFromStore(tag) {
		let editablefn = this.scope[this.element.getAttribute('store')+'ColumnRules'], data
		typeof editablefn == 'function' && editablefn(this.setColumnsRules.bind(this))
		let tbody = this.element.querySelector('tbody, .tablebody'), row, rowparent, clonedrow = [], countrows = 0, firstHeadCell = true, firstFootCell = true, targetstore = this.element.getAttribute('targetstore'), checkfirstload = true
		if(tbody) {
			row = this.baseRow ? this.baseRow : tbody.firstElementChild
		} else {
			row = this.baseRow ? this.baseRow : this.element.firstElementChild
		}
		if(this.placeholderTableDiv) {
			tbody.innerHTML = ''
			checkfirstload = false
		}
		if(this.placeholderTableDiv == undefined) {
			this.placeholderTableDiv = tbody.firstElementChild
		}		
		if(!checkfirstload) {
			row = this.placeholderTableDiv
			rowparent = tbody
		} else {
			rowparent = row.parentNode		
		}	
		if(this.columnRules) {			
			let theadchildrens = [...this.element.querySelector('thead tr, .tablehead .tablerow').children], thindex = 0
			Object.keys(this.columnRules.rules).forEach(thitem => {
				if(theadchildrens[thindex].querySelector('['+this.element.getAttribute('store')+']')) {
					return
				}
				if(theadchildrens[thindex].innerHTML.length == 0) {
					return
				}
				if(!this.columnRules.rules[thitem].filter || this.columnRules.rules[thitem].filter.toLowerCase() != 'true') {
					return
				}
				if(!this.scope.hasEvent(theadchildrens[thindex], 'click')) {
					theadchildrens[thindex].style.cursor = 'pointer'
					theadchildrens[thindex].setAttribute('data-index', thindex)
					theadchildrens[thindex].setAttribute('data-key', thitem)
					this.keys.push(thitem)
					theadchildrens[thindex].innerHTML = theadchildrens[thindex].innerHTML+' <svg id="filter_'+thindex+'" height="10" width="10" viewBox="0 0 80 90" focusable=false><path d="m 0,0 30,45 0,30 10,15 0,-45 30,-45 Z"></path></svg>'
					this.scope.setEvent(theadchildrens[thindex], 'click', (s, o, e) => {
						e.stopPropagation()
						this.editableView && this.editableView.closeOpenCells()
						if(this.viewfilter instanceof viewfilter) {
							this.viewfilter.applyFilter(e.target, e)
						} else {
							this.viewfilter = new viewfilter(this.scope, this.element, this.columnRules, e.target, e)
						}
					})
					theadchildrens[thindex].querySelector('#filter_'+thindex).addEventListener('click', e => {
						e.stopPropagation()
						this.editableView && this.editableView.closeOpenCells()
						if(this.viewfilter instanceof viewfilter) {
							this.viewfilter.applyFilter(e.target.parentNode, e)
						} else {
							this.viewfilter = new viewfilter(this.scope, this.element, this.columnRules, e.target.parentNode, e)
						}
					})
					theadchildrens[thindex].querySelector('#filter_'+thindex).children[0].addEventListener('click', e => {
						e.stopPropagation()
						this.editableView && this.editableView.closeOpenCells()
						if(this.viewfilter instanceof viewfilter) {
							this.viewfilter.applyFilter(e.target.parentNode.parentNode, e)
						} else {
							this.viewfilter = new viewfilter(this.scope, this.element, this.columnRules, e.target.parentNode.parentNode, e)
						}
					})
				}
				++thindex
			})		
		}			
		let ic = parseInt(this.element.getAttribute('paginate')) 
		this.data.forEach(obj => {
			this.scope.keys[this.element.Own()] = []
			let i = 0, firstCell = true, fields = {}
			clonedrow = row.cloneNode(true)		
			if(!this.baseRow) {
				this.baseRow = row
			}	
			Object.values(obj).forEach(item => {
				if(i == 0 && firstCell) {
					--ic
					this.addRow = clonedrow
					firstCell = false				
					if(this.element.hasAttribute('linenumber')) {
						let linenumber = this.element.tagName.toLowerCase() == 'table' ? document.createElement('td') : document.createElement('div')
						linenumber.innerHTML = this.element.hasAttribute('paginate') ? this.store.page * parseInt(this.element.getAttribute('paginate')) - ic : countrows + 1
						let attrs = [...row.children[0].attributes]
						attrs.forEach(attr => linenumber.setAttribute(attr.nodeName, attr.nodeValue))
						linenumber.classList.add('linenumber')
						clonedrow.insertBefore(linenumber, clonedrow.children[0])
						if(rowparent.previousElementSibling && firstHeadCell) {
							if(!rowparent.previousElementSibling.children[0].children[0].classList.contains('linenumber')) {
								firstHeadCell = false
								let theadlinenumber = rowparent.previousElementSibling.children[0].children[0].cloneNode()
								theadlinenumber.classList.add('linenumber')
								rowparent.previousElementSibling.children[0].insertBefore(theadlinenumber, rowparent.previousElementSibling.children[0].children[0])
							}
						}	
						if(rowparent.nextElementSibling && firstFootCell) {
							if(!rowparent.nextElementSibling.children[0].children[0].classList.contains('linenumber')) {
								firstFootCell = false
								let tfootlinenumber = rowparent.nextElementSibling.children[0].children[0].cloneNode()
								tfootlinenumber.classList.add('linenumber')
								tfootlinenumber.hasAttribute('colspan') && tfootlinenumber.removeAttribute('colspan')
								rowparent.nextElementSibling.children[0].insertBefore(tfootlinenumber, rowparent.nextElementSibling.children[0].children[0])
							}
						}	
					}
				} 
				let re = new RegExp('{{'+Object.keys(obj)[i]+'}}'), cellindex = 0
				this.scope.keys[this.element.Own()].push(Object.keys(obj)[i])
				fields[Object.keys(obj)[i]] = item					
				Object.keys(clonedrow.children).forEach(cell => {
					this.replacePlaceholder(clonedrow.children[cell], obj, re, item, countrows, cellindex)	
					++cellindex			
				})
				++i
			})	
			if(this.scope.targetstores && this.scope.targetstores.length) {		
				clonedrow.style.cursor = 'pointer'		
				!this.scope.hasEvent(clonedrow, 'click') && this.scope.setEvent(clonedrow, 'click', (s, o, e) => {
					e.stopPropagation()
					this.state = fields
					this.scope.targetstores.forEach(storeObj => this.scope.targetAction(storeObj, Object.assign(fields, {storeType: 'fill'})))
				})
			}			
			tbody.appendChild(clonedrow)
			++countrows
		})	
		if(checkfirstload) {
			tbody.firstElementChild.remove()
		}
		this.store.setStoreDelete(this.element.querySelector('tbody, .tablebody'), this.store.storeName)
	}

	setColumnsRules(rules) {
		this.columnRules = rules
		if(!this.columnRules.unique) {
			throw 'No unique row identifier defined for editable view.'
		}
	}

	replacePlaceholder(el, row, re, item, rowindex, cellindex) {		
		if(el.innerHTML.match(re)) {
			let cell = document.createElement('span')			
			cell.setAttribute('cell', '')
			cell.style.display = 'block'
			cell.style.whiteSpace = 'nowrap'
			cell.style.width = '100%'
			cell.style.minHeight = '20px'
			if(this.element.hasAttribute('editable')) {
				cell.style.cursor = 'pointer'
			}
			el.innerHTML = el.innerHTML.replace(re, cell.outerHTML)
			let ruleindex = this.element.hasAttribute('linenumber') ? cellindex - 1 : cellindex 
			if(this.columnRules) {				
				let rules = Object.values(this.columnRules.rules)[ruleindex]
				if(rules.type.toLowerCase() == 'list') {
					Object.keys(rules.items).forEach(_item => {
						if(_item == item) {
							el.firstElementChild.innerHTML = rules.items[_item]
						}
					})
				} else if(rules.type.toLowerCase() == 'date' && rules.format) {
					el.firstElementChild.innerHTML = formatDate(rules.format, item)
				} else if(rules.type.toLowerCase() == 'datetime' && rules.format) {
					let date = item.split(' ')
					let inpdate = date[0]
					el.firstElementChild.innerHTML = formatDate(rules.format, inpdate)+' '+date[1]
				} else if(rules.type.toLowerCase() == 'checkbox') {
					let checkbox = document.createElement('input')
					checkbox.type = 'checkbox'
					cell.appendChild(checkbox)
					el.innerHTML = cell.outerHTML
					el.querySelector('input[type="checkbox"]').checked = item == 'true' ? true : false
				} else if(rules.type.toLowerCase() == 'progressbar') {
					if(item.length) {
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
						percent.style.width = item+'%'
						percent.style.backgroundColor = percentbgcolor
						percent.style.color = rules.textcolor ? rules.textcolor : 'white'
						if(rules.text && rules.text.toLowerCase() == 'true') {
							percent.innerHTML = item+'%'
						}
						pdiv.appendChild(percent)
						el.firstElementChild.innerHTML = pdiv.outerHTML
					} else {
						el.firstElementChild.innerHTML = item
					}
				} else {
					el.firstElementChild.innerHTML = item									
				}
			} else {
				el.firstElementChild.innerHTML = item
			}
			if(this.element.hasAttribute('editable')) {
				this.editableView = new editableView(this.data, this.scope, this.element, el, row, this.columnRules, rowindex, this.element.hasAttribute('linenumber') ? cellindex - 1 : cellindex, item, this)
			}
		}	
	}

	addViewRow(store) {
		if(!this.element.hasAttribute('editable')) {
			throw 'Element does not have editable property'
			return
		}
		let root = this.element.querySelector('tbody, .tablebody')
		let lastDataRow = Object.assign({}, this.data[this.data.length - 1]), baseChildrens = [...this.baseRow.children], count = 0, currdate = new Date()
		Object.keys(lastDataRow).forEach(datakey => {
			if(datakey == this.columnRules.unique) {
				lastDataRow[datakey] = 'item_'+new Date().getTime()
			} else {
				lastDataRow[datakey] = ''
			}
		})
		baseChildrens.forEach(rowitem => {
			let key = rowitem.innerHTML.replace(/\{\{/, '').replace(/\}\}/, '')
			if(!this.columnRules.rules[key]) {
				return
			}
			if(this.columnRules.rules[key].type.toLowerCase() == 'date') {
				lastDataRow[key] = currdate.getFullYear()+'-'+((currdate.getMonth() + 1).toString().length == 1 ? '0'+(currdate.getMonth() + 1) : (currdate.getMonth() + 1))+'-'+(currdate.getDate().toString().length == 1 ? '0'+currdate.getDate() : currdate.getDate())
			}
			if(this.columnRules.rules[key].type.toLowerCase() == 'datetime') {
				lastDataRow[key] = currdate.getFullYear()+'-'+((currdate.getMonth() + 1).toString().length == 1 ? '0'+(currdate.getMonth() + 1) : (currdate.getMonth() + 1))+'-'+(currdate.getDate().toString().length == 1 ? '0'+currdate.getDate() : currdate.getDate())+' 00:00:00'
			}
			if(this.columnRules.rules[key].type.toLowerCase() == 'list') {
				lastDataRow[key] = 1
			}
			if(this.columnRules.rules[key].type.toLowerCase() == 'checkbox') {
				lastDataRow[key] = 'false'
			}
			++count
		})
		store.dataOrig.fill.push(lastDataRow)
		if(this.element.hasAttribute('paginate') && !isNaN(this.element.getAttribute('paginate'))) {				
			if(root.children.length == parseInt(this.element.getAttribute('paginate'))) {
				store.paginateLast()
			} else {
				root.appendChild(this.addClonedRow(store, root))
			}
		} else {
			root.appendChild(this.addClonedRow(store, root))
		}
	}

	addClonedRow(store, root) {
		let cloned = this.addRow.cloneNode(true), childrens = [...cloned.children], linenumber = false, i = 0, paginate = parseInt(this.element.getAttribute('paginate')), currdate = new Date(), count = 0
		childrens.forEach(item => {
			if(i == 0 && cloned.children[i].classList.contains('linenumber')) {
				cloned.children[i].innerHTML = this.element.hasAttribute('paginate') ? store.page * paginate - (paginate - root.children.length - 1) : root.children.length + 1
				linenumber = true
				++i
				return
			}
			if(cloned.children[i].querySelector('['+this.element.getAttribute('store')+']')) {
				store.setStoreActions(cloned.children[i])
				return
			}
			cloned.children[i].firstElementChild.Own() && cloned.children[i].firstElementChild.Own(' ')
			let rules = Object.values(this.columnRules.rules)[count]
			if(rules.type && rules.type.toLowerCase() == 'list') {						
				cloned.children[i].firstElementChild.innerHTML = Object.values(rules.items)[0]
			} else if(rules.type && rules.type.toLowerCase() == 'date') {
				cloned.children[i].firstElementChild.innerHTML = formatDate(rules.format, currdate.getFullYear()+'-'+((currdate.getMonth() + 1).toString().length == 1 ? '0'+(currdate.getMonth() + 1) : (currdate.getMonth() + 1))+'-'+(currdate.getDate().toString().length == 1 ? '0'+currdate.getDate() : currdate.getDate()))
			} else if(rules.type && rules.type.toLowerCase() == 'datetime') {
				cloned.children[i].firstElementChild.innerHTML = formatDate(rules.format, currdate.getFullYear()+'-'+((currdate.getMonth() + 1).toString().length == 1 ? '0'+(currdate.getMonth() + 1) : (currdate.getMonth() + 1))+'-'+(currdate.getDate().toString().length == 1 ? '0'+currdate.getDate() : currdate.getDate())+' 00:00:00')
			} else if(rules.type && rules.type.toLowerCase() != 'checkbox') {
				cloned.children[i].firstElementChild.innerHTML = '     '
			} else if(rules.type && rules.type.toLowerCase() == 'checkbox') {
				cloned.children[i].querySelector('input[type="checkbox"]').checked = false
			}		
			this.editableView = new editableView(this.data, this.scope, this.element, cloned.children[i], cloned.children[i].parentNode, this.columnRules, this.data.length - 1, linenumber ? i - 1 : i, '', this)
			++i
			++count
		})
		if(cloned.querySelector('['+store.storeName+']') && cloned.querySelector('['+store.storeName+']').getAttribute(store.storeName).toLowerCase() == 'delete') {
			let el = cloned.querySelector('['+store.storeName+']')
			el.Own(' ')
			!this.scope.hasEvent(el, 'click') && this.scope.setEvent(el, 'click', (s, o, e) => {
				e.stopPropagation()
				return store.Delete(e)
			})
		}
		return cloned
	}

	deleteViewRow(element, event) {
		let target = event.target, 
			datarow = this.scope.getDataRow(element, target, 'fill'), 
			tbody = element.querySelector('tbody, .tablebody')
		
		if(!datarow) {
			target.closest('tr, .tablerow').remove()
			return
		}

		let uniquekey = this.columnRules.unique
		let params = {
			[uniquekey]: datarow[uniquekey]
		}
		this.store.setParams('delete', params)

		!this.scope.hasEvent(tbody, 'remove') && this.scope.setEvent(tbody, 'remove', (s, o, e) => {
			this.scope.unsetEvent(tbody, 'remove')
			this.store.paginateData.fill = this.store.dataOrig.fill
			tbody.children.length == 0 ? this.store.paginatePrev() : this.store.paginatePage()
		})		

		this.store.dataOrig.fill.splice(this.scope.getIndexRow(element, target), 1)				
		target.closest('tr, .tablerow').remove()	
	}

	load() {
		this.store.Fill()
	}

	getXHRData() {
		return this.store.data.fill
	}

	getData() {
		return this.store.dataOrig.fill
	}

	getPaginateData() {
		return this.store.paginateData.fill
	}
	
} 