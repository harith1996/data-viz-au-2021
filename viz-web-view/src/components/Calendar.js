import React from "react";
import * as d3 from "d3";
import Filters from "../components/Filters";
import CalendarBuilder from "../d3/calendarBuilder";
let filterMetadata = require("../json/filters.json");
const DATASETS = {
	"American Airlines_SEA_DFW" : require("../json/SummarisedWeekly_Filter_American Airlines_SEA_DFW.json"),
	"United Airlines_LAX_SFO" : require("../json/SummarisedWeekly_Filter_United Airlines_LAX_SFO.json"),
	"__": require("../json/Data_Output_Harith.json")
}
const WEEK_START = 0;
const WEEK_LIMIT = 53;
const FILTERED_DATASET_PREFIX = '../json/SummarisedWeekly_Filter_';
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
		return data.reduce(function (acc, item) {
			if (item.Year !== 1987 && item.Year !== 2008) {
				if (item.week_number === week_no) {
					acc["week_number"] = week_no;
					acc["Total_Flights"] = (acc["Total_Flights"] || 0) + item.Total_Flights;
				}
			}
			return acc;
		}, {});
	});
}


function getYearlyOverAllWeeks(data) {
	//for years, instead of range(1,53) make a range from 1987,2008
	return d3.range(1987, 2009).map(function (year) {
		return data.reduce(function (acc, item) {
				if (item.Year === year) {
					acc["year"] = year;
					acc["Total_Flights"] = (acc["Total_Flights"] || 0) + item.Total_Flights;
				}
			return acc;
		}, {});
	});
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
				let copiedItem = JSON.parse(JSON.stringify(item));
				copiedItem.Total_Flights /=
					flightsPerYear["" + item.Year]["flights"] / 100;
				return copiedItem;
		  })
		: data;
}

export default class CalendarComponent extends React.Component {
	constructor(props) {
		super(props);
		// data = prunedData(data, START_DAY );

		this.normalize = true;
		this.data = props.data;
		this.originalData = JSON.parse(JSON.stringify(props.data));
		this.remove_53 = false;
		this.state = { d3: "", normalize: this.normalize, remove_53: this.remove_53 };
	}

	computeWeeklyAndYearly() {
		this.weekly = getWeeklyOverAllYears([...this.data]);
		this.yearly = getYearlyOverAllWeeks([...this.data]);
	}
	
	buildCalendar() {
		CalendarBuilder(processData(this.data, this.normalize), {
			weekOfYear: (d) => d.week_number,
			year: (d) => d.Year,
			quant: (d) => d.Total_Flights - 1.88,
			title: (d) => "Week :" + d.Week + "\nYear:" + d.Year,
			normalized: this.normalize,
			weekStart: WEEK_START,
			weeklyAggData: this.weekly,
			yearlyAggData: this.yearly,
			svg: d3.select('#my-svg'),
			weekRange: this.weekRange
		});
	}

	setDataset() {

	}

	componentDidMount() {
		this.computeWeeklyAndYearly();
		this.buildCalendar();
		this.setState({ d3: this.d3node });
	}

	componentDidUpdate(prevProps, prevState) {
		console.log(prevState);
	}

	handleWeek53Toggle(event) {
		const hideWeek53 = event.target.checked;
		if(hideWeek53) {
			this.remove53()
		}
		else {
			this.show53()
		}
		this.computeWeeklyAndYearly();
		this.buildCalendar();
	}

	show53() {
		this.data = this.originalData;
	}

	remove53() {
		this.data = this.data.filter((item) => item.week_number!=53);
	}

	onFilterSubmit(filterParams) {
		console.log(filterParams);
		this.modifyData(this.extractFilteredDataset(filterParams));
		this.buildCalendar();
	}

	extractFilteredDataset(filterParams){
		const filterSummary = (filterParams.reduce((acc, attribute) => {
			acc.push(attribute.filters.reduce((acc, filter) => {
				if(filter.isSelected) {
					acc.push(filter.value);
				}
				return acc
			}, []).join(''));
			return acc;
		}, [])).join('_');
		return DATASETS[filterSummary];
	}

	modifyData(newData) {
		this.data = newData;
		this.computeWeeklyAndYearly();
		this.buildCalendar();
	}

	render() {
		return (
			<div>
				<Filters
					metadata={filterMetadata}
					onSubmit={this.onFilterSubmit.bind(this)}
				/>
				<div>
					<div id="week-53-flag" style={{marginLeft: 1400}}>
						<input
							type="checkbox"
							name="show_53"
							onChange={this.handleWeek53Toggle.bind(this)}
							value = {this.show_53}
						></input>
						<label for="show_53">Remove week 53</label>
					</div>
					<svg id='my-svg'></svg>
				</div>
			</div>
		);
	}
}
