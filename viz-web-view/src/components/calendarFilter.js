import React from "react";

export default class CalendarComponent extends React.Component {
    constructor(props) {
		super(props);
		this.d3node = CalendarBuilder(props.data, {
			weekOfYear: (d) => d.Week,
			year: (d) => d.Year,
			quant: (d) => d.Flights
		});
		this.state = { d3: "" };
	}

	componentDidMount() {
		this.setState({ d3: this.d3node });
	}

	render() {
		return (
			<div>
				<RD3Component data={this.state.d3} />
			</div>
		);
	}
}
