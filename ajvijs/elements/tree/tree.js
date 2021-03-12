
class jstree {
	
	constructor(data, options) {
		this.data = data
		this.container = document.createElement('div')	
		this.container.style.width = options.width ? options.width : '100%'
		this.container.style.height = options.height ? options.height :  '100%'
		this.container.style.overflow = 'auto'
		this.container.setAttribute('data-type', 'tree')	
		this.checked = []
		this.options = options
		this.options.id && this.container.setAttribute('id', this.options.id)
		this.imgpath = this.options.imgpath
		this.insertTree()
		return this		
	}

	insertTree() {
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

	createTree() {
		let create = new Promise((res, rej) => {
			res(this.setTree(this.container, this.data, 0))
		})
		create.then(() => {
			setTimeout(() => {
				this.calculateDashed(this.container.firstElementChild, this.data)
			}, 1000)
			typeof this.treeOnInit == 'function' && this.treeOnInit()
		}).finally(() => {
			typeof this.treeOnLoad == 'function' && this.treeOnLoad()
		})
	}

	cloneTree(obj) {
		let cloned = obj.container.cloneNode(true)
		let li = cloned.querySelectorAll('li:not([lis="true"])')
		this.cloned = cloned.querySelector('[leaf="true"]')
		li.forEach(item => {
			let itemchilds = [...item.children], chk, img, i = 0
			itemchilds.forEach(ic => {
				if(ic.classList.contains('lichecked') || ic.classList.contains('liunchecked')) {
					chk = i
				}
				if(ic.classList.contains('treeicon') || ic.classList.contains('foldericon')) {
					img = i
					return
				}
				++i
			})
			if(this.options.checkboxes && !chk) {
				if(img) {
					item.children[img].style.left = parseInt(parseInt(item.children[img].style.left) + 15)+'px'
				}
				let span = document.createElement('span')
				span.classList.add(item.checked == 'true' ? 'lichecked' : 'liunchecked')
				span.addEventListener('click', this.itemCheck.bind(this))
				item.insertBefore(span, item.children[img])				
				item.lastElementChild.style.left = parseInt(parseInt(item.lastElementChild.style.left) + 15)+'px'
			} 
			if(!this.options.checkboxes && chk) {
				item.children[chk].remove()
				if(img) {
					item.children[img].style.left = parseInt(parseInt(item.children[img].style.left) - 15)+'px'
				}
				item.lastElementChild.style.left = parseInt(parseInt(item.lastElementChild.style.left) - 15)+'px'
			}
			if(this.options.checkboxes && chk) {
				item.children[chk].addEventListener('click', this.itemCheck.bind(this))
			}
			if(item.hasAttribute('group')) {
				item.firstChild.addEventListener('click', this.closableClick.bind(this))
				if(this.options.draggable) {
					this.options.draggable && item.addEventListener('drop', this.itemDrop.bind(this))
					this.options.draggable && item.addEventListener('dragover', this.itemDragOver.bind(this))
				}
			} else {
				item.lastChild.addEventListener('click', this.itemClick.bind(this))
				this.options.draggable && item.addEventListener('dragstart', this.itemDragStart.bind(this))
			}
			this.options.context && item.addEventListener('contextmenu', this.itemContext.bind(this))
		})
		let nodes = [...cloned.children]
		nodes.forEach(node => this.container.appendChild(node))
		if(this.options.leafCheckboxes == false) {
			setTimeout(() => {
				let leafs = this.container.querySelectorAll('[leaf="true"]')
				leafs.forEach(n => {
					n.children[1].style.display = 'none'
					n.children[2].style.left = (parseInt(n.children[2].style.left ) - 15)+'px'
					if(n.children[3]) {
						n.children[3].style.left = (parseInt(n.children[3].style.left ) - 15)+'px'
					}
				})
			}, 500)
		}
		this.setAllUnchecked()
		this.collapseAll()
		this.calculateDashed(this.container.firstElementChild, this.data)
	}

	setTree(node, data, rec) {
		return new Promise((res, rej) => {
			let ul = document.createElement('ul'), cloned = false
			ul.setAttribute('tree', '')
			ul.style.width = '100%'
			if(rec == 0) {
				ul.style.marginLeft = '10px'
			}
			data.forEach(item => {
				let li = document.createElement('li')
				li.style.height = '25px'
				li.style.padding = '3px 3px 3px 0px'
				li.style.cursor = 'pointer'
				li.style.width = '100%'
				li.id = item.id
				if(item.items) {
					let span = document.createElement('span')
					span.classList.add(item.expanded == 'true' ? 'liexpanded' : 'licollapsed')
					span.addEventListener('click', this.closableClick.bind(this))
					li.appendChild(span) 
				}
				let span = document.createElement('span')
				span.position = 'absolute'
				span.style.display = 'block'
				span.style.minWidth = '10px'
				span.style.maxWidth = '10px'
				span.style.height = '1px'
				span.style.borderTop = '1px dotted #cccccc'
				span.style.margin = '10px 1px 0px 1px'
				li.appendChild(span) 
				li.setAttribute(item.items ? 'group' : 'leaf', true)
				if(this.options.checkboxes && (this.options.leafCheckboxes == undefined || this.options.leafCheckboxes)) {
					let span = document.createElement('span')
					span.classList.add(item.checked == 'true' ? 'lichecked' : 'liunchecked')
					if(item.checked == 'true') {
						this.checked.push(item.id)
					}
					span.addEventListener('click', this.itemCheck.bind(this))
					li.appendChild(span) 
				}
				let iconpresent = false
				if(item.items) {
					let img = document.createElement('img')
					img.classList.add('foldericon')
					img.style.position = 'absolute'
					img.style.width = '20px'
					img.style.height = '20px'
					img.style.top = '3px'
					img.style.left = this.options.checkboxes ? '35px' : '15px'
					img.src = item.expanded ? this.imgpath+'fo.gif' : this.imgpath+'fc.gif'
					if(this.options.draggable) {
						li.addEventListener('drop', this.itemDrop.bind(this))
						li.addEventListener('dragover', this.itemDragOver.bind(this))
					}
					li.appendChild(img)
					iconpresent = true
				} else {
					if(item.icon && item.icon.length) {
						let img = document.createElement('img')
						img.classList.add('treeicon')
						img.style.width = '16px'
						img.style.height = '16px'
						img.style.position = 'absolute'
						img.style.top = '5px'
						img.style.left = this.options.checkboxes ? '35px' : '15px'
						img.style.cursor = 'default'
						img.style.display = 'block'
						img.src = this.imgpath+item.icon
						li.appendChild(img)
						iconpresent = true
					}
					if(!item.icon && this.options.noicon && this.options.noicon.length) {
						let img = document.createElement('img')
						img.classList.add('treeicon')
						img.style.width = '16px'
						img.style.height = '16px'
						img.style.position = 'absolute'
						img.style.top = '5px'
						img.style.left = this.options.checkboxes ? '35px' : '15px'
						img.style.cursor = 'default'
						img.style.display = 'block'
						img.src = this.imgpath+this.options.noicon
						li.appendChild(img)
						iconpresent = true
					}
					if(this.options.draggable) {
						li.setAttribute('draggable', true)
						li.addEventListener('dragstart', this.itemDragStart.bind(this))
					}	
				}
				span = document.createElement('span')				
				span.style.position = 'absolute'
				span.style.top = '3px'
				span.style.left = this.options.checkboxes ? (iconpresent ? '55px' : '35px') : (iconpresent ? '35px' : '15px')
				span.style.display = 'block'
				span.style.padding = '0px 5px 0px 5px'			
				span.innerHTML = item.text
				item.css && span.classList.add(item.css)
				span.addEventListener('click', this.itemClick.bind(this)) 
				li.appendChild(span)
				if(item.style && item.style.length) {
					span.style.cssText = span.style.cssText+item.style
				}
				if(typeof this.options.context == 'function') {
					li.addEventListener('contextmenu', this.itemContext.bind(this))
				}
				if(this.options.hideLeafs && !item.items || this.options.hideLeafs && item.items.length == 0) {
					li.style.display = 'none'
				}
				Object.keys(item).forEach(k => {
					if(k == 'text' || k == 'items') {
						return
					}
					li.setAttribute(k, item[k])
				})
				if(!item.items && !cloned) {
					cloned = true
					this.cloned = li.cloneNode(true)
				}
				ul.appendChild(li)
				if(item.items && Array.isArray(item.items) && item.items.length) {
					let lis = document.createElement('li')
					lis.setAttribute('lis', true)
					lis.style.display = item.expanded ? 'block' : 'none'
					this.setTree(lis, item.items, ++rec)
					ul.appendChild(lis)
				}
			})
			node.appendChild(ul)	
			res(true)
		})
	}

	closableClick(e) {
		e.stopPropagation()
		if(e.target.parentNode.nextElementSibling && e.target.parentNode.nextElementSibling.style.display == 'none') {
			e.target.classList.remove('licollapsed')
			e.target.classList.add('liexpanded')
			if(this.options.checkboxes) {
				e.target.nextElementSibling.nextElementSibling.nextElementSibling.src = this.imgpath+'fo.gif'
			} else {
				e.target.nextElementSibling.nextElementSibling.src = this.imgpath+'fo.gif'
			}
			this.expandItem(e.target.parentNode)						
		} else {
			e.target.classList.remove('liexpanded')
			e.target.classList.add('licollapsed')
			if(this.options.checkboxes) {
				e.target.nextElementSibling.nextElementSibling.nextElementSibling.src = this.imgpath+'fc.gif'
			} else {
				e.target.nextElementSibling.nextElementSibling.src = this.imgpath+'fc.gif'
			}
			this.collapseItem(e.target.parentNode)
		}
	}

	itemCheck(e) {				
		e.stopPropagation()		
		let checked
		if(!Array.isArray(this.defaultChecked)) {
			this.defaultChecked = []
		}		
		if(e.target.classList.contains('lichecked')) {
			e.target.classList.remove('lichecked')
			e.target.classList.add('liunchecked')
			this.setItemsChecked(e.target.parentNode.id, false)
			checked = false
		} else {
			e.target.classList.remove('liunchecked')
			e.target.classList.add('lichecked')
			this.setItemsChecked(e.target.parentNode.id, true)
			checked = true
		}
		if(this.options.subCheck && e.target.parentNode.hasAttribute('group') && e.target.parentNode.nextElementSibling && e.target.parentNode.nextElementSibling.firstElementChild.tagName.toLowerCase() == 'ul') {
			e.target.parentNode.nextElementSibling.querySelectorAll('.lichecked, .liunchecked').forEach(chk => {														
				this.defaultChecked['dc'+e.target.parentNode.id] && chk.classList.contains('lichecked') && chk.parentNode.querySelector('.selectedTreeItem') && this.removeSelection()		
				chk.classList.remove(e.target.classList.contains('lichecked') ? 'liunchecked' : 'lichecked')						
				chk.classList.add(e.target.classList.contains('lichecked') ? 'lichecked' : 'liunchecked')
				this.setItemsChecked(chk.parentNode.id, e.target.classList.contains('lichecked') ? true : false)
				!chk.classList.contains('lichecked') && chk.parentNode.querySelector('.selectedTreeItem') && this.removeSelection()								
			})
		} else {
			!e.target.classList.contains('lichecked') && e.target.parentNode.querySelector('.selectedTreeItem') && this.removeSelection()
		}
		typeof this.itemOnCheck == 'function' && this.itemOnCheck(e.target.parentNode.id, checked, this.getDataAttribute(e.target.parentNode.id, 'items'), this.store)		
		this.defaultChecked['dc'+e.target.parentNode.id] = e.target.classList.contains('lichecked') ? true : false
	}

	itemDragStart(e) {
		this.dragStartParent = e.target.parentNode
		e.dataTransfer.setData('text', e.target.id)
		typeof this.itemOnDragStart == 'function' && this.itemOnDragStart(e.target.id)
	}

	itemDragOver(e) {
		e.preventDefault()
	}

	itemDrop(e) {
		e.preventDefault()
		let ddata = e.dataTransfer.getData('text')
		if(e.target.parentNode.nextElementSibling && e.target.parentNode.nextElementSibling.querySelector('ul')) {
			e.target.parentNode.nextElementSibling.querySelector('ul').appendChild(document.getElementById(ddata))
		} else {
			let sli = document.createElement('li')
			e.target.parentNode.parentNode.appendChild(sli)
			let sul = document.createElement('ul')
			sli.appendChild(sul)
			sul.setAttribute('tree', '')
			sul.style.marginLeft = '20px'
			sul.style.listStyleType = 'none'
			sul.style.padding = '0px'
			sul.appendChild(document.getElementById(ddata))	
			e.target.parentNode.querySelector('img').src = this.imgpath+'fo.gif'
			e.target.parentNode.querySelector('span:first-child').classList.remove('licollapsed')
			e.target.parentNode.querySelector('span:first-child').classList.add('liexpanded')
			this.setDataAttribute(e.target.parentNode.id, 'expanded', 'true')						  						
		}
		typeof this.itemOnDragEnd == 'function' && this.itemOnDragEnd(ddata, e.target.parentNode.id)
		let eldata = this.getDataElement(ddata, this.data)
		this.deleteItemRec(ddata, this.data)
		this.setItemPosition(eldata, e.target.parentNode.id, this.data)	
		if(this.dragStartParent.children.length == 0) {
			let dparent = this.dragStartParent.parentNode.previousElementSibling 
			dparent.querySelector('img').src = this.imgpath+'fc.gif'
			dparent.querySelector('span:first-child').classList.remove('liexpanded')
			dparent.querySelector('span:first-child').classList.add('licollapsed')
			dparent.nextElementSibling.remove()
		}
		setTimeout(() => {
			this.calculateDashed(this.container.firstElementChild, this.data)
		}, 100)
	}

	itemClick(e) {
		e.stopPropagation()
		e.preventDefault()
		let parent = e.target.parentNode
		typeof this.itemOnClick == 'function' && this.itemOnClick(parent.id)
		if(parent.hasAttribute('leaf') && !parent.querySelector('span:last-child').classList.contains('selectedTreeItem')) {
			setTimeout(() => {
				typeof this.itemOnSelect == 'function' && this.itemOnSelect(parent.id)
			}, 100)
			this.setItemSelected(parent.id)
			if(parent && this.options.checkboxes) {
				let chk = parent.querySelector('.liunchecked')
				chk && chk.classList.remove('liunchecked')
				chk && chk.classList.add('lichecked')
				this.setItemsChecked(parent.id, true)
			}			
		} 
		if(parent.hasAttribute('group')) {
			if(this.options.allowSelectParent) {
				setTimeout(() => {
					typeof this.itemOnSelect == 'function' && this.itemOnSelect(parent.id)
				}, 100)
				this.setItemSelected(parent.id)
				if(parent && this.options.checkboxes) {
					let chk = parent.querySelector('.liunchecked')
					chk && chk.classList.remove('liunchecked')
					chk && chk.classList.add('lichecked')
					this.setItemsChecked(parent.id, true)
				}
				
			}
			let expcol
			if(parent.nextElementSibling && parent.nextElementSibling.style.display == 'none') {
				e.target.previousElementSibling.src = this.imgpath+'fo.gif'								
				if(this.options.checkboxes) {
					expcol = e.target.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
				} else {
					expcol = e.target.previousElementSibling.previousElementSibling.previousElementSibling
				}	
				expcol.classList.remove('licollapsed')
				expcol.classList.add('liexpanded')
				this.expandItem(parent)	
			} else {
				e.target.previousElementSibling.src = this.imgpath+'fc.gif'
				if(this.options.checkboxes) {
					expcol = e.target.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
				} else {
					expcol = e.target.previousElementSibling.previousElementSibling.previousElementSibling					
				}
				expcol.classList.remove('liexpanded')
				expcol.classList.add('licollapsed')
				this.collapseItem(parent)
			}
		}				
	}

	itemContext(e) {
		e.preventDefault()
		typeof this.options.context == 'function' && this.options.context(e.target.parentNode.id, e)
	}

	countChildrens(items) {
		let n = 0
		items.forEach(item => {
			if(item.expanded && item.expanded == "false") {
				++n
				return
			}
			if(item.items && Array.isArray(item.items) && item.items.length) {
				n += this.countChildrens(item.items)
			}
			++n
		})
		return n
	}

	calculateDashed(node, data) {
		let ul = node, countli = [], i = 0, cnum = 0
		data.forEach(item => {
			if(!countli[i]) {
				countli[i] = 0
			}
			if(item.items && Array.isArray(item.items) && item.items.length) {
				if(item.expanded && item.expanded == 'true') {
					this.calculateDashed(this.container.querySelector('#'+CSS.escape(item.id)).nextElementSibling.firstElementChild, item.items)
					countli[i] = this.countChildrens(item.items) + 1
				} else {
					countli[i] += 1
				}		
			} else {
				countli[i] += 1
			}
			++i
		})
		countli.pop()
		countli.forEach(_i => cnum += _i)
		node.style.setProperty('--height', parseInt(cnum * 25 + 15)+'px')
	}

	setItemsChecked(id, state) {
		if(this.checked.indexOf(id) != -1) {
			if(!state) {
				this.checked.splice(this.checked.indexOf(id), 1)
			}
		} else {
			if(state) {
				this.checked.push(id)
			}
		}
	}
	setItemText(id, txt) {
		this.container.querySelector('#'+CSS.escape(id)).querySelector('span:last-child').innerHTML = txt
		this.setDataAttribute(id, 'text', txt)
	}

	getItemText(id) {
		return this.container.querySelector('#'+CSS.escape(id)).querySelector('span:last-child').innerHTML
	}

	setItemStyle(id, style) {
		let el = this.container.querySelector('#'+CSS.escape(id)).querySelector('span:last-child') 
		el.style.cssText = el.style.cssText+style
		this.setDataAttribute(id, 'style', style)
	}

	getItemStyle(id) {
		return this.container.querySelector('#'+CSS.escape(id)).querySelector('span:last-child').style
	}

	getItemAttribute(id, attr) {
		return this.container.querySelector('#'+CSS.escape(id)).getAttribute(attr)
	}

	setItemAttribute(id, attr, val) {
		switch(attr.toLowerCase()) {
			case 'id':
			case 'text':
			case 'items':
			case 'icon':
			case 'expanded':
			case 'checked':
			case 'style':
				return
			break
		}
		this.container.querySelector('#'+CSS.escape(id)).setAttribute(attr, val)
		this.setDataAttribute(id, attr, val)
	}

	setItemIcon(id, icon) {
		let li = this.container.querySelector('#'+CSS.escape(id))
		if(li.querySelector('.treeicon')) {
			li.querySelector('.treeicon').src = this.imgpath+icon
		} else {
			let img = document.createElement('img')
			img.classList.add('treeicon')
			img.style.width = '16px'
			img.style.height = '16px'
			img.style.marginTop = '3px'
			img.style.cursor = 'default'
			img.src = this.imgpath+icon
			li.insertBefore(img, li.querySelector('span:last-child'))
		}		
		this.setDataAttribute(id, 'icon', icon)
	}

	getSelectedId() {
		if(this.container.querySelector('.selectedTreeItem')) {
			return this.container.querySelector('.selectedTreeItem').parentNode.id
		} else {
			return ''
		}
	}

	setItemSelected(id, trigger) {
		this.removeSelection()
		this.container.querySelector('#'+CSS.escape(id)).querySelector('span:last-child').classList.add('selectedTreeItem')
		trigger && this.container.querySelector('#'+CSS.escape(id)).querySelector('span:last-child').click()
	}

	removeSelection() {
		this.container.querySelector('.selectedTreeItem') && this.container.querySelector('.selectedTreeItem').classList.remove('selectedTreeItem')
	}

	deleteItem(id) {
		this.container.querySelector('#'+CSS.escape(id)).remove()
		this.calculateDashed(this.container.firstElementChild, this.data)
		this.deleteItemRec(id, this.data)
	}

	deleteItemRec(id, data) {
		let i = 0
		data.forEach(item => {
			if(item.id == id) {
				data.splice(i, 1)
				return
			}
			item.items && Array.isArray(item.items) && this.deleteItemRec(id, item.items)
			++i
		})
	}

	getParentId(id) {
		let parent = this.container.querySelector('#'+CSS.escape(id)).parentNode.parentNode.previousElementSibling
		if(parent) {
			return parent.id
		}
	}

	isChecked(id) {
		return this.container.querySelector('#'+CSS.escape(id)).querySelector('.lichecked')
	}

	isOpen(id) {
		return this.getDataAttribute(id, 'expanded') == 'true' ? true : false
	}

	getAllChecked() {
		return this.checked
	}

	setItemChecked(id, state) {
		if(!this.options.checkbodex) {
			return
		}
		let el = this.container.querySelector('#'+CSS.escape(id)).querySelector('.lichecked, .liunchecked')
		if(state) {
			if(!el.classList.contains('lichecked') && el.classList.contains('liunchecked')) {
				el.classList.remove('liunchecked')
				el.classList.add('lichecked')
			}
		} else {
			if(el.classList.contains('lichecked') && !el.classList.contains('liunchecked')) {
				el.classList.remove('lichecked')
				el.classList.add('liunchecked')
			}
		}
		this.setDataAttribute(id, 'checked', state)
	}

	expandItem(_el) {
		let el
		if(typeof _el == 'string')  {
			el = document.getElementById(_el)
		} else {
			el = _el
		}
		if(!el.nextElementSibling) {
			return
		}
		el.querySelector('img').src = this.imgpath+'fo.gif'
		el.firstElementChild.classList.remove('licollapsed')
		el.firstElementChild.classList.add('liexpanded')
		if(el.nextElementSibling.firstElementChild.tagName && el.nextElementSibling.firstElementChild.tagName.toLowerCase() == 'ul') {
			el.nextElementSibling.style.display = 'block'
			this.setDataAttribute(el.id, 'expanded', 'true')
			this.calculateDashed(this.container.firstElementChild, this.data)		
			typeof this.itemOnOpen == 'function' && this.itemOnOpen(el.id)
		}
	}

	collapseItem(_el) {
		let el
		if(typeof _el == 'string')  {
			el = document.getElementById(_el)
		} else {
			el = _el
		}
		if(!el.nextElementSibling) {
			return
		}
		el.querySelector('img').src = this.imgpath+'fc.gif'
		el.firstElementChild.classList.remove('liexpanded')
		el.firstElementChild.classList.add('licollapsed')
		if(el.nextElementSibling.firstElementChild.tagName && el.nextElementSibling.firstElementChild.tagName.toLowerCase() == 'ul') {
			el.nextElementSibling.style.display = 'none'
			this.setDataAttribute(el.id, 'expanded', 'false')
			this.calculateDashed(this.container.firstElementChild, this.data)		
			typeof this.itemOnClose == 'function' && this.itemOnClose(el.id)
		}
	}

	expandAll() {
		this.container.querySelectorAll('.licollapsed').forEach(item => {
			item.classList.remove('licollapsed')
			item.classList.add('liexpanded')
			if(!item.parentNode.nextElementSibling) {
				return
			}
			item.parentNode.nextElementSibling.style.display = 'block'
			item.parentNode.querySelector('img').src = this.imgpath+'fo.gif'
			this.setDataAttribute(item.parentNode.id, 'expanded', 'true')
		})
		this.calculateDashed(this.container.firstElementChild, this.data)
	}

	collapseAll() {
		this.container.querySelectorAll('.liexpanded').forEach(item => {
			item.classList.remove('liexpanded')
			item.classList.add('licollapsed')
			if(!item.parentNode.nextElementSibling) {
				return
			}
			item.parentNode.nextElementSibling.style.display = 'none'
			item.parentNode.querySelector('img').src = this.imgpath+'fc.gif'
			this.setDataAttribute(item.parentNode.id, 'expanded', 'false')
		})
		this.calculateDashed(this.container.firstElementChild, this.data)
	}

	setAllChecked() {
		this.container.querySelectorAll('.liunchecked').forEach(item => {
			this.setItemsChecked(item.parentNode.id, true)
			item.classList.remove('liunchecked')
			item.classList.add('lichecked')
		})
	}

	setAllUnchecked() {
		this.container.querySelectorAll('.lichecked').forEach(item => {
			this.setItemsChecked(item.parentNode.id, false)
			item.classList.remove('lichecked')
			item.classList.add('liunchecked')
		})
	}

	setDataAttribute(id, attr, val) {
		this.setDataAttributeRec(id, attr, val, this.data)
	}

	setDataAttributeRec(id, attr, val, data) {
		data.forEach(item => {
			if(item.id == id) {
				item[attr] = val
				return
			}
			item.items && Array.isArray(item.items) && this.setDataAttributeRec(id, attr, val, item.items)
		})
	}

	getDataAttribute(id, attr) {
		return this.getDataAttributeRec(id, attr, this.data)
	}

	getDataAttributeRec(id, attr, data) {
		let attrval
		data.forEach(item => {
			if(item.id == id) {
				attrval = item[attr]
			}
			if(item.items && Array.isArray(item.items)) {
				let subul = this.getDataAttributeRec(id, attr, item.items)
				if(subul != undefined) {
					attrval = subul
					return
				}
			}
		})
		return attrval
	}

	setItemPosition(el, container, data) {
		data.forEach(item => {
			if(item.id == container) {
				if(!Array.isArray(item.items)) {
					item.items = []
				}
				item.items.push(el)
				return
			}
			item.items && Array.isArray(item.items) && this.setItemPosition(el, container, item.items)
		})
	}

	getDataElement(id, data) {
		let datael
		data.forEach(item => {
			if(item.id == id) {
				datael = item
				return
			} else if(item.items && Array.isArray(item.items)) {
				let subul = this.getDataElement(id, item.items)
				if(subul != undefined) {
					datael = subul
					return
				}
			}
		})
		return datael
	}

	getLeafs() {
		return this.getLeafsRec(this.data)
	}

	getLeafsRec(data) {
		let leafs = []
		data.forEach(item => {
			!item.items && leafs.push(item.id)
			if(Array.isArray(item.items) && item.items.length) {
				leafs = leafs.concat(this.getLeafsRec(item.items))
			}
		})
		return leafs
	}

	getParents() {
		return this.getParentsRec(this.data)
	}

	getParentsRec(data) {
		let parents = []
		data.forEach(item => {
			Array.isArray(item.items) && item.items.length && parents.push(item.id)
			if(Array.isArray(item.items) && item.items.length) {
				parents = parents.concat(this.getParentsRec(item.items))
			}
		})
		return parents
	}

	getChildrens(id) {
		let childrens = []
		this.data.forEach(item => {
			if(id) {
				if(item.id == id) {
					childrens = childrens.concat(this.getChildrensRec(item.items))
				}
			} else {
				childrens = childrens.concat(this.getChildrensRec(item.items))
			}
		})
		return childrens
	}

	getChildrensRec(data) {
		let childrens = []
		data.forEach(item => {
			childrens.push(item.id)
			if(Array.isArray(item.items) && item.items.length) {
				childrens = childrens.concat(this.getChildrensRec(item.items))
			}
		})
		return childrens
	}

	getParentLeafs() {
		return this.getParentLeafsRec(this.data)
	}

	getParentLeafsRec(data) {
		let parents = []
		data.forEach(item => {
			Array.isArray(item.items) && item.items.length == 0 && parents.push(item.id)
			if(Array.isArray(item.items) && item.items.length) {
				parents = parents.concat(this.getParentLeafsRec(item.items))
			}
		})
		return parents
	}

	setFocus(id) { 
		if(this.container.clientHeight > this.container.firstElementChild.clientHeight) {
			return
		}
		this.container.querySelector('#'+CSS.escape(id)).scrollIntoView(true)
		this.container.scrollLeft = 0
	}

	insertChild(parent, child, txt, icon) {
		let el = parent == 'root' ? this.container : this.container.querySelector('#'+CSS.escape(parent)), node = this.cloned
		node.id = child
		node.children[node.children.length - 1].innerHTML = txt
		this.setClonedEvents()
		if(parent == 'root') {			
			this.container.appendChild(this.cloned)
		} else {
			if(el.nextElementSibling.firstElementChild.tagName.toLowerCase() == 'ul') {
				el.nextElementSibling.firstElementChild.appendChild(node)
			} else {
				let span = document.createElement('span')
				span.innerHTML = '&#x229F;'
				span.classList.add('closable')
				span.addEventListener('click', this.closableClick.bind(this))
				el.insertAdjacentElement('afterbegin', span)
				let index = Array.from(el.parentNode.children).indexOf(el)
				let sli = document.createElement('li')
				if(el.parentNode.children[index + 1]) {
					el.parentNode.insertBefore(sli, el.parentNode.children[index + 1])
				} else {
					el.parentNode.insertAdjacentElement('beforeend', sli)
				}
				let sul = document.createElement('ul')
				sli.appendChild(sul)
				sul.setAttribute('tree', '')
				sul.style.marginLeft = '20px'
				sul.style.listStyleType = 'none'
				sul.style.padding = '0px'
				sul.appendChild(node)	
				this.expandItem(el)
			}
		}
		if(icon) {
			let imgiterate = [...node.children]
			imgiterate.forEach(img => {

				if(img.tagName.toLowerCase() == 'img') {
					img.src = this.imgpath+icon
				}
			})			
		}
		this.cloned = node.cloneNode(true)
		this.insertChildInData(parent, child, txt, icon, this.data)
		this.calculateDashed(this.container.firstElementChild, this.data)
	}

	insertChildInData(parent, child, txt, icon, data) {
		if(parent == 'root') {
			this.data.push({
				id: child,
				text: txt,
				icon: icon
			})
			return
		}
		let i = 0
		data.forEach(item => {
			if(item.id == parent) {
				if(!item.items || (item.items && !Array.isArray(item.items))) {
					item.items = []
				}
				item.items.push({
					id: child,
					text: txt,
					icon: icon
				})
				return
			}
			item.items && Array.isArray(item.items) && this.insertChildInData(parent, child, txt, icon, item.items)
		})
	}

	setClonedEvents() {
		this.options.checkboxes && this.cloned.children[1].addEventListener('click', this.itemCheck.bind(this))
		this.cloned.lastChild.addEventListener('click', this.itemClick.bind(this))
		this.options.draggable && this.cloned.addEventListener('dragstart', this.itemDragStart.bind(this))
		this.options.context && this.cloned.addEventListener('contextmenu', this.itemContext.bind(this))
	}

	nodeExists(id) {
		return this.container.querySelector('#'+CSS.escape(id)) ? true : false
	}

	hideLeafs()  {
		this.container.querySelector('[leaf="true"]').style.display = 'none'
	}

	sortTree(id, dir) {
		if(id == 'root') {
			this.data.sort((a, b) => {
				let na = a.text.toUpperCase()
				let nb = b.text.toUpperCase()
				if(na < nb) {
					return -1
				}
				if(na > nb) {
					return 1
				}
				return 0
			})
			if(!dir || dir.toLowerCase == 'desc') {
				this.data.reverse()
			}
		} else {
			this.getChildrens(id).sort((a, b) => {
				let na = a.text.toUpperCase()
				let nb = b.text.toUpperCase()
				if(na < nb) {
					return -1
				}
				if(na > nb) {
					return 1
				}
				return 0
			})
			if(!dir || dir.toLowerCase == 'desc') {
				this.getChildrens(id).reverse()
			}
		}
		this.container.innerHTML = ''	
		this.setTree(this.container, this.data, 0)
		this.calculateDashed(this.container.firstElementChild, this.data)
	}

	getXHRData() {
		return this.data
	}

}