import React, {Component} from "./../../../react"
import {ajvi} from "./../../abstract.js"

class DataView extends Component {
  
  	constructor(props) {

  		super(props)

  		this.view = new ajvi()

  		this.settings = {
			output: this.props.output, 
			store: this.props.store, 
			targetstore: this.props.targetstore,
			datakey: this.props.datakeys,
			autoload: this.props.autoload, 
			paginate: this.props.paginate,
			editable: this.props.editable, 
			linenumber: this.props.linenumber, 
			classList: this.props.classlist,
			header: this.props.header,
			footer: this.props.footer,
			actions: this.props.actions		
		}

  	}

	componentDidMount() {

		this.settings.container = this.div

		if(this.props.store) {
			this.view[this.props.store] = this.store.bind(this)
		}

		if(this.props.rules) {
			this.view[this.props.store+'ColumnRules'] = hub => hub(this.props.rules)
		}

		this.view = this.view.createView(this.settings)

		Object.keys(this.props.viewmethod).forEach(fn => this.view[fn] = this.props.viewmethod[fn].bind(this.view))

	}

	store(store, element) {
		store.fill = {
			url: this.props.fillsource,
			response: 'json'
		}
		if(this.props.savesource) {
			store.save = {
				url: this.props.savesource,
				response: 'json'
			}
		}
		if(this.props.deletesource) {
			store.delete = {
				url: this.props.deletesource,
				response: 'json',
				approved: this.deleteCheck
			}
		}
	}

	deleteCheck(element, event) {
		return confirm('Do ou really want delete this row?')
	}

	render() {
		return React.createElement('div', {ref: el => this.div = el, className: 'dataviewcontainer' }, '')
	}

}

export default DataView