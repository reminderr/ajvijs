import React, {Component} from "./../../../react"
import {ajvi} from "./../../abstract.js"

class TreeView extends Component {
  
  	constructor(props) {

  		super(props)

  		this.tree = new ajvi()

  		this.settings = {}

		Object.keys(this.props).forEach(prop => {
			this.settings[prop] = this.props[prop]
		})

  	}

	componentDidMount() {

		if(this.props.store && this.props.fillsource) {
	    	this.ajvi[this.settings.store] = this.setStore.bind(this);
	    }

	    this.ajvi.TreeView(this.settings, this.props.events);
	    this.ajvi[this.settings.name].view.At(this.div);

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