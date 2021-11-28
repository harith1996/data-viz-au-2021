// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/calendar-view
import * as d3 from "d3";
import "d3-color";
import "d3-interpolate";
import "d3-scale-chromatic";
import Legend from "../d3/colorLegend";

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
//how many colors should be used to represent quant
const COLOR_SPLIT = 11;

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}
/**
 * Takes data aggregated by weeks and returns an <svg> HTML element representing a calendar view
 * @param {Array<any>} data 
 * @param {Object} options 
 * @returns {HTMLElement}
 */
export default function CalendarBuilder(
	data,
	{
		weekOfYear = ([weekOfYear]) => weekOfYear, // given d in data, returns the week value
		year = ([year]) => year,
		quant = ([quant]) => quant, // given d in data, returns the quantitative (y)-value
		width = 1280, // width of the chart, in pixels
		cellSize = 21, // width and height of an individual day, in pixels
		colors = d3.interpolateRdYlBu, //color scale specifier. check https://github.com/d3/d3-scale-chromatic
		normalized = false
	} = {}
) {
	// Compute weeks. Ex: 1987 week 25 = 1987 * 54 + 25.
	const WEEKS = d3.map(data, (d) => year(d) * 54 + weekOfYear(d));

	//Get all unique years in the data set
	const YEARS = d3.map(data, year).filter(onlyUnique);

	//Get all quantities (no_of_flights). 
	const QUANT = d3.map(data, quant);
	
	//Get index of all weeks
	const I = d3.range(WEEKS.length);

	//Input week number (for ex, week 404004)
	const getYear = (week) => Math.floor(week / 54);
	const heightOfYear = cellSize + 2;

	// Compute a sequential color scale

	//Get 0.975-quantile of QUANT as the maximum of the color scale
	const max = d3.quantile(QUANT, 0.975, Math.abs);

	//Get 0.025-quantile of QUANT as the minimum of the color scale
	const min = d3.quantile(QUANT, 0.025, Math.abs);

	//compute the color scale
	const colorComputer = d3.scaleSequential([min, max], colors);
	const color = colorComputer.unknown("none");

	// Group the index I by year, in the order of the input
	const GROUPED_YEARS = d3.groups(I, (i) => getYear(WEEKS[i]));

	//Create root <svg> element
	const svg = d3
		.create("svg")
		.attr("width", "90%")
		.attr("height", "50%")
		.attr("viewBox", [
			0,
			0,
			width,
			heightOfYear * (YEARS.length + 12) + cellSize,
		])
		.attr("style", "max-width: 100%; height: auto; height: intrinsic;")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10);

	//Month axis
	svg.append("g")
	.selectAll("text")
	.data(d3.range(0, 12))
	.join("text")
	.attr("x", (data, idx) => data * 4 * cellSize + cellSize * 3 + idx*6)
	.attr("y", -cellSize  * 1.5 )
	.text((d) => MONTH[d]);

	//Week Axis
	svg.append("g")
		.selectAll("text")
		.data(d3.range(1, 54))
		.join("text")
		.attr("x", (data, idx) => (idx + 1) * cellSize + cellSize / 3)
		.attr("y", -cellSize * 1.4)
		.text((d, i) => d);

	//make a <g> for each YEAR in GROUPED_YEARS
	const yearSvg = svg
		.selectAll("g")
		.data(GROUPED_YEARS)
		.join("g")
		.attr(
			"transform",
			(data, idx) =>
				`translate(${cellSize * 4}, ${heightOfYear * idx + cellSize * 3 + 2 })`
		);

	//Mame of the year
	yearSvg
		.append("text")
		.attr("x", -5)
		.attr("y", cellSize / 2)
		.attr("dy", "0.31em")
		.text((data, idx) => data[0]);

	//tooltip when hovering over cell
	let tooltip = d3
		.select("body")
		.append("div")
		.attr("class", "cell-tooltip")
		.style("opacity", 0)
		.on("mouseover", (event, data) => {
			tooltip.style("opacity", 0).style("top", 0).style("left", 0);
		});

	//Cell. Represent {Week, Year}
	yearSvg
		.append("g")
		.selectAll("rect")
		.data((data, idx) => data[1])
		.join("rect")
		.attr("width", cellSize - 1)
		.attr("height", cellSize - 1)
		.attr(
			"x",
			(data, idx) => (WEEKS[data] % (getYear(WEEKS[data]) * 54)) * cellSize + 0.5
		)
		.attr("fill", (d) => color(QUANT[d]))
		.on("mouseover", handleCellMouseOver)
		.on("mouseout", handleCellMouseOut)
		.on("mousedown", handleCellMouseDown)
		.on("click", handleCellClick)
		.style("stroke", "lightgray")
		.style("stroke-width", 1);

	//Color legend. Depends on normalization
	const colorLegend = Legend(colorComputer, {
		title: normalized? "% of flights" : "No. of flights",
		tickFormat: normalized? ".02f" : "0.0f",
	});

	let selectedCells = [];

	svg.append(() => colorLegend)
		.attr("x", 5 * cellSize)
		.attr("y", (YEARS.length + 5) * cellSize);

	function handleCellMouseOver(event, data) {
		let cell = event.currentTarget;
		let year = getYear(WEEKS[data]);

		//Construct and display tooltip
		tooltip
			.html(
				"Week " +
					(WEEKS[data] % (year * 54)) +
					", " +
					year +
					"<br/>" +
					(normalized? QUANT[data].toFixed(2) : QUANT[data]) +
					(normalized ? "% of all ": " of ") + year + " flights"
			)
			.style("left", event.pageX + cellSize + "px")
			.style("top", event.pageY - 28 - cellSize + "px")
			.style("opacity", 0.9);

		//Highlight cell with pink border
		cell.style.stroke = "#f72585";
		cell.style.strokeWidth = "2";

		//If CTRL is held down, remove mouse down listener
		if(window.event.ctrlKey) {
			handleCellMouseDown(event, data);
		}
	}

	function handleCellMouseOut(event, d) {
		let cell = event.currentTarget;
		//Hide tooltip
		tooltip.style("opacity", 0).style("left", 0).style("top", 0);

		//remove cell hightlight
		cell.style.stroke = "lightgray";
		cell.style.strokeWidth = "1";
	}

	function handleCellMouseDown(event, data) {
		let cell = event.currentTarget;
		if (window.event.ctrlKey) {
			selectedCells.push(cell);
			d3.select(cell).on("mouseout", null);
			console.log('asfsa');
		}
		else {
			selectedCells.forEach(cell => d3.select(cell).on("mouseout", handleCellMouseOut));
			selectedCells = [];
		}
	}

	function handleCellClick(event, data) {
		let cell = event.currentTarget;
		if (window.event.ctrlKey) {
			selectedCells.splice(selectedCells.indexOf(cell), 1);
			d3.select(cell).on("mouseout", handleCellMouseOut);
			handleCellMouseOut(event, data);
		}
	}

	return Object.assign(svg.node(), {
		scales: { color },
		colorLegend: colorLegend,
	});
}

// const countDay = weekday === "sunday" ? (i) => i : (i) => (i + 6) % 7;
// const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
// const weekDays = weekday === "weekday" ? 5 : 7;
// // Construct formats.
// formatMonth = d3.utcFormat(formatMonth);

// // Compute titles.
// if (title === undefined) {
// 	const formatDate = d3.utcFormat("%B %-d, %Y");
// 	const formatValue = color.tickFormat(100, yFormat);
// 	title = (i) => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
// } else if (title !== null) {
// 	const T = d3.map(data, title);
// 	title = (i) => T[i];
// }

// function pathMonth(t) {
// 	const d = Math.max(0, Math.min(weekDays, countDay(t.getUTCDay())));
// 	const w = timeWeek.count(d3.utcYear(t), t);
// 	return `${
// 		d === 0
// 			? `M${w * cellSize},0`
// 			: d === weekDays
// 			? `M${(w + 1) * cellSize},0`
// 			: `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`
// 	}V${weekDays * cellSize}`;
// }

// if (title) cell.append("title").text(title);

// const month = year1
// 	.append("g")
// 	.selectAll("g")
// 	.data(([, I]) => d3.utcMonths(d3.utcMonth(X[I[0]]), X[I[I.length - 1]]))
// 	.join("g");

// month
// 	.filter((d, i) => i)
// 	.append("path")
// 	.attr("fill", "none")
// 	.attr("stroke", "#fff")
// 	.attr("stroke-width", 3)
// 	.attr("d", pathMonth);

// month
// 	.append("text")
// 	.attr(
// 		"x",
// 		(d) =>
// 			timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2
// 	)
// 	.attr("y", -5)
// 	.text(formatMonth);
