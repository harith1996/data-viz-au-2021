import React from "react";
import rd3 from "react-d3-library";
import * as d3 from "d3";
import CalendarBuilder from "../d3/calendarBuilder";

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

function getWeeklyOverAllYears(data) {
	//for years, instead of range(1,53) make a range from 1987,2008
	return d3.range(1, 54).map(function (week_no) {
		return data.reduce(
			function (acc, item) {
				// if (item.Year !== 1987 && item.Year!== 2008) {
				if (item.week_number === week_no) {
					acc["week_number"] = week_no;
					acc["Total_Flights"] += item.Total_Flights;
				}
				// }
				return acc;
			},
			{
				Total_Flights: 0,
			}
		);
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
		this.normalize = true;
		// data = prunedData(data, START_DAY );
		// let x = getWeeklyOverAllYears(data);

		//<svg> element returned by d3
		this.d3node = CalendarBuilder(processData(data, this.normalize), {
			weekOfYear: (d) => d.week_number,
			year: (d) => d.Year,
			quant: (d) => d.Total_Flights,
			title: (d) => "Week :" + d.Week + "\nYear:" + d.Year,
			normalized: this.normalize,
			weekStart: WEEK_START,
		});
		this.state = { d3: "", normalize: this.normalize };
	}

	componentDidMount() {
		this.setState({ d3: this.d3node });
	}

	componentDidUpdate(prevProps, prevState) {
		console.log(prevState);
	}

	render() {
		return (
			<div>
				<div>
					<RD3Component data={this.state.d3} />
				</div>
			</div>
		);
	}
}
