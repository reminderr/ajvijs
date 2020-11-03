import React, {Component} from "./../../../react"
import {ajvi} from "./../../abstract.js"

class TreeView extends Component {
  
  	constructor(props) {

  		super(props)

  		this.tree = new ajvi()

  		this.settings = {}

		if(this.props.store) {
			this.settings.store = this.props.store
		}
		if(this.props.autoload) {
			this.settings.autoload = this.props.autoload
		}
		if(this.props.checkboxes) {
			this.settings.checkboxes = this.props.checkboxes
		}
		if(this.props.editable) {
			this.settings.editable = this.props.editable
		}
		if(this.props.draggable) {
			this.settings.draggable = this.props.draggable
		}
		if(this.props.cross) {
			this.settings.cross = this.props.cross
		}
		if(this.props.arrows) {
			this.settings.arrows = this.props.arrows
		}
		if(this.props.lines) {
			this.settings.lines = this.props.lines
		}
		if(this.props.classList) {
			this.settings.classList = this.props.classList
		}
		if(this.props.expanded) {
			this.settings.expanded = this.props.expanded
		}
		if(this.props.imgpath) {
			this.settings.imgpath = this.props.imgpath
		}
		if(this.props.imgstatic) {
			this.settings.imgstatic = this.props.imgstatic
		}

  	}

	componentDidMount() {

		this.settings.container = this.div

		if(this.props.store && this.props.fillsource) {
			this.tree[this.props.store] = this.store.bind(this)
		}

		this.tree = this.tree.createTree(this.settings, this.props.events)

	}

	store(store, element) {
		store.fill = {
			url: this.props.fillsource,
			response: 'json'
		}
	}

	render() {
		return React.createElement('div', {ref: el => this.div = el, className: 'treecontainer' }, '')
	}

}

export default TreeView