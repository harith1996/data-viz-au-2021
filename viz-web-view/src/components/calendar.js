import React from "react";
import rd3 from "react-d3-library";
import CalendarBuilder from "../d3/calendarBuilder";
const RD3Component = rd3.Component;
export default class CalendarComponent extends React.Component {
	constructor(props) {
		super(props);
		this.d3node = CalendarBuilder(props.data, {
			x: (d) => new Date(d.Date),
			y: (d) => d.Volume,
			weekday: 'Monday'
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
