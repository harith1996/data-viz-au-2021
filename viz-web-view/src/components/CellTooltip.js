import React from "react";

export default class CellTooltip extends React.Component {
	constructor(props) {
		super(props);
		this.state = { };
		this.week = props.week || {};
		this.year = props.year;
        this.flights = props.flights;
	}

	render() {
		return (
			<div className='cell-tooltip'>
                <h3>{["Week", this.week].join(': ')}</h3>
                <h3>{["Year", this.year].join(': ')}</h3>
                <h3>{["Flights", this.flights].join(': ')}</h3>
			</div>
		);
	}
}
