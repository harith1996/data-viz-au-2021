import React from "react";
import rd3 from "react-d3-library";
import * as d3 from "d3";
import Filters from "../components/Filters";
import CalendarBuilder from "../d3/calendarBuilder";
let filterMetadata = require("../json/filters.json");

const RD3Component = rd3.Component;
const WEEK_START = 0;
const WEEK_LIMIT = 53;
function prunedData(data, startDay) {
	return data.reduce(function (acc, item) {
		if (item.day_of_year > startDay) {
			acc.push(item);
		}
		return acc;
	}, []);
}

function processData(data, normalize = false) {
	let flightsPerYear = {};
	data.sort((a, b) => a.Year - b.Year);
	if (normalize) {
		//aggregate flights by year
		data.forEach((d1) => {
			flightsPerYear["" + d1.Year] = flightsPerYear["" + d1.Year] || {
				flights: 0,
				weeks: 0,
			};
			let item = flightsPerYear["" + d1.Year];
			item["flights"] += d1.Total_Flights;
			item["weeks"] += 1;
		});

		//interpolate flights for partial years (1987 and 2008)
		for (let year in flightsPerYear) {
			let item = flightsPerYear[year];
			let interp = 53 - item["weeks"];
			let avgFlights = item["flights"] / item["weeks"];
			item["flights"] += interp * avgFlights;
			item["weeks"] = 53;
		}
	}

	return normalize
		? data.map((item) => {
				item.Total_Flights /=
					flightsPerYear["" + item.Year]["flights"] / 100;
				return item;
		  })
		: data;
}

export default class CalendarComponent extends React.Component {
	constructor(props) {
		super(props);
		const data = props.data;
		const weeklyAggData = props.weekly;
		const yearlyAggData = props.yearly;
		// data = prunedData(data, START_DAY );

		//<svg> element returned by d3
		this.normalize = true;
		this.data = data;
		this.weekly = weeklyAggData;
		this.yearly = yearlyAggData;
		this.d3node = CalendarBuilder(processData(data, this.normalize), {
			weekOfYear: (d) => d.week_number,
			year: (d) => d.Year,
			quant: (d) => d.Total_Flights,
			title: (d) => "Week :" + d.Week + "\nYear:" + d.Year,
			normalized: this.normalize,
			weekStart: WEEK_START,
			weeklyAggData: weeklyAggData,
			yearlyAggData: yearlyAggData,
		});
		this.state = { d3: "", normalize: this.normalize, show_53: true };
	}

	componentDidMount() {
		this.setState({ d3: this.d3node });
	}

	componentDidUpdate(prevProps, prevState) {
		console.log(prevState);
	}

	handleWeek53Toggle(val) {
		this.state.show_53 = val.target.checked;
	}

	onFilterSubmit(event) {
		console.log(event);
		this.d3node = CalendarBuilder(processData(this.data, false), {
			weekOfYear: (d) => d.week_number,
			year: (d) => d.Year,
			quant: (d) => d.Total_Flights,
			title: (d) => "Week :" + d.Week + "\nYear:" + d.Year,
			normalized: this.normalize,
			weekStart: WEEK_START,
			weeklyAggData: this.weekly,
			yearlyAggData: this.yearly,
		});
		this.setState({
			d3: this.d3node,
			normalize: this.normalize,
			show_53: true,
		});
	}

	render() {
		return (
			<div>
				<Filters
					metadata={filterMetadata}
					onSubmit={this.onFilterSubmit.bind(this)}
				/>
				<div>
					<div id="week-53-flag">
						<input
							type="checkbox"
							name="show_53"
							onChange={this.handleWeek53Toggle.bind(this)}
						></input>
						<label for="show_53">Show week 53</label>
					</div>
					<RD3Component data={this.state.d3} />
				</div>
			</div>
		);
	}
}
