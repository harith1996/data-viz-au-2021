import CalendarComponent from "./components/Calendar";
import * as d3 from 'd3';

let data = require("./json/Data_Output_Harith.json");

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


let weeklyAgg = getWeeklyOverAllYears([...data]);
let yearlyAgg = getYearlyOverAllWeeks([...data]);

console.log(weeklyAgg);
console.log(yearlyAgg);
function App() {
	return (
		<div className="App">
			<CalendarComponent data={data} weekly={weeklyAgg} yearly={yearlyAgg} />
		</div>
	);
}

export default App;
