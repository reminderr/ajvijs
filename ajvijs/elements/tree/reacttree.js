import React, {Component} from "./../../../react"
import {ajvi} from "./../../abstract.js"

class TreeView extends Component {
  
  	constructor(props) {

  		super(props)

  		this.ajvi = new ajvi

  	}

	componentDidMount() {

		if(this.props.store && this.props.fillsource) {
	    	this.ajvi[this.props.store] = this.setStore.bind(this);
	    }

	    this.ajvi.TreeView(this.props, this.props.events);
	    this.ajvi[this.props.name].view.At(this.div);

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