/**
 * Writes to `../dji.json`, a JSON array of the form: 
 * `[{Year: , Week: , Flights: }, ... ]`. With `Year` starting from `startYear`,
 * spanning `lengthYears` years, with value of dataItem.Flights < `maxFlights`.
 * @param {Number} startYear - Starting year of flights
 * @param {Number} lengthYears - no. of years after startYear
 * @param {Number} maxFlights - max no. of flights per week
 */
function generateWeeklyFlights(startYear, lengthYears, maxFlights) {
	let maxWeeks = lengthYears * 52;
	let currYear = startYear;
	let data = Array(maxWeeks).fill(0).map( (_, index) => {
        let currWeek = index;
        currYear = startYear + Math.floor (currWeek / 52);
        return {
			Year: currYear,
			Week: (currWeek % 52) + 1,
			Flights: Math.floor(Math.random() * maxFlights),
		};
    });
    let writeReadyData = JSON.stringify(data);
	console.log(writeReadyData);
}

export default generateWeeklyFlights;
