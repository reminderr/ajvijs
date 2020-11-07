
export class layout {

	constructor(options, scope) {
		this.options = options
		this.container = scope.Tag('div').Css('layout_container')
		if(options.top) {
			this.top = scope.Tag('div').Css('layout_top').At(this.container)
		}
		this.centercontainer = scope.Tag('div').Css('center_container').At(this.container)
		if(options.left) {
			this.left = scope.Tag('div').Css('layout_left').At(this.centercontainer)
		}
		this.centerwrap = scope.Tag('div').Css('center_wrap').At(this.centercontainer)
		this.center = scope.Tag('div').Css('layout_center').At(this.centerwrap)
		if(options.bottom) {
			this.bottom = scope.Tag('div').Css('layout_bottom').At(this.centerwrap)
		}
		if(options.right) {
			this.right = scope.Tag('div').Css('layout_right').At(this.centercontainer)
		}	
		this.setClasses()
		setTimeout(() => {
			this.setDimensions()
		}, 300)
		return this
	}

	setDimensions() {		
		let left, right, bottom, width = 0, height = 0
		if(this.options.left) {
			left = window.getComputedStyle(this.left)
			width += parseInt(left.getPropertyValue('width'))
		}
		if(this.options.right) {
			right = window.getComputedStyle(this.right)
			width += parseInt(right.getPropertyValue('width'))
		}
		this.centerwrap.style.setProperty('--width', (width).toString()+'px')
		if(this.options.bottom) {
			bottom = window.getComputedStyle(this.bottom)
			height += parseInt(bottom.getPropertyValue('height'))
		}
		this.center.style.setProperty('--height', (height).toString()+'px')
		this.container.style.setProperty('--height', parseInt(document.body.clientHeight - 4).toString()+'px')
	}

	setClasses() {
		this.options.topClassList && this.top.classList.add([...this.options.topClassList]) 
		this.options.leftClassList && this.left.classList.add([...this.options.leftClassList]) 
		this.options.centerClassList && this.center.classList.add([...this.options.centerClassList]) 
		this.options.rightClassList && this.right.classList.add([...this.options.rightClassList]) 
		this.options.bottomClassList && this.bottom.classList.add([...this.options.bottomClassList]) 
	}

}