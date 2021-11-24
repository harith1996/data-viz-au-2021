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
const COLOR_SPLIT = 8;

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}
export default function CalendarBuilder(
	data,
	{
		weekOfYear = ([weekOfYear]) => weekOfYear, // given d in data, returns the week value
		year = ([year]) => year,
		quant = ([quant]) => quant, // given d in data, returns the quantitative (y)-value
		title, // given d in data, returns the title text
		width = 1280, // width of the chart, in pixels
		cellSize = 21, // width and height of an individual day, in pixels
		formatMonth = "%b", // format specifier string for months (above the chart)
		yFormat, // format specifier string for values (in the title)
		colors = d3.schemeBrBG[5],
	} = {}
) {
	// Compute values.
	const WEEKS = d3.map(data, (d) => year(d) * 54 + weekOfYear(d));
	const YEARS = d3.map(data, year).filter(onlyUnique);
	const QUANT = d3.map(data, quant);
	const I = d3.range(WEEKS.length);

	const getYear = (week) => Math.floor(week / 54);
	const heightOfYear = cellSize + 2;

	// Compute a color scale. This assumes a discrete color scheme where the starting
	// is minimum quanitity in the data, with COLOR_SPLIT colors upto maximum
	const max = d3.quantile(QUANT, 0.9985, Math.abs);
	const min = d3.quantile(QUANT, 0.0015, Math.abs);
	const colorComputer = d3
		.scaleQuantile()
		.domain([min, +max])
		.range(colors);
	const color = colorComputer.unknown("none");

	// Group the index by year, in reverse input order. (Assuming that the input is
	// chronological, this will show years in reverse chronological order.)
	const GROUPED_YEARS = d3.groups(I, (i) => getYear(WEEKS[i]));

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

		
	svg.append("g")
	.selectAll("text")
	.data(d3.range(0, 12))
	.join("text")
	.attr("x", (d, i) => d * 4 * cellSize + cellSize * 3 + i*6)
	.attr("y", -cellSize  * 1.5 )
	.text((d) => MONTH[d]);

	//Week Axis
	svg.append("g")
		.selectAll("text")
		.data(d3.range(1, 54))
		.join("text")
		.attr("x", (d, i) => (i + 1) * cellSize + cellSize / 3)
		.attr("y", -cellSize * 1.4)
		.text((d, i) => d);


	const yearSvg = svg
		.selectAll("g")
		.data(GROUPED_YEARS)
		.join("g")
		.attr(
			"transform",
			(d, i) =>
				`translate(${cellSize * 4}, ${heightOfYear * i + cellSize * 3 + 2 })`
		);

	//Year Axis
	yearSvg
		.append("text")
		.attr("x", -5)
		.attr("y", cellSize / 2)
		.attr("dy", "0.31em")
		.text((d, i) => d[0]);

	let tooltip = d3
		.select("body")
		.append("div")
		.attr("class", "cell-tooltip")
		.style("opacity", 0)
		.on("mouseover", (event, data) => {
			tooltip.style("opacity", 0).style("top", 0).style("left", 0);
		});

	//cell
	yearSvg
		.append("g")
		.selectAll("rect")
		.data((d, i) => d[1])
		.join("rect")
		.attr("width", cellSize - 1)
		.attr("height", cellSize - 1)
		.attr(
			"x",
			(d, i) => (WEEKS[d] % (getYear(WEEKS[d]) * 54)) * cellSize + 0.5
		)
		.attr("fill", (d) => color(QUANT[d]))
		.on("mouseover", handleCellMouseOver)
		.on("mouseout", handleCellMouseOut)
		.on("mousedown", handleCellMouseDown)
		.on("click", handleCellClick);

	const colorLegend = Legend(colorComputer, {
		title: "No. of flights",
		tickFormat: ".0f",
	});

	let selectedCells = [];

	svg.append(() => colorLegend)
		.attr("x", 5 * cellSize)
		.attr("y", (YEARS.length + 5) * cellSize);

	function handleCellMouseOver(event, d) {
		let cell = event.currentTarget;
		tooltip
			.style("opacity", 0.9)
			.html(
				"Week " +
					(WEEKS[d] % (getYear(WEEKS[d]) * 54)) +
					", " +
					getYear(WEEKS[d]) +
					"<br/>" +
					QUANT[d] +
					" flights"
			)
			.style("left", event.pageX + cellSize + "px")
			.style("top", event.pageY - 28 - cellSize + "px");
		cell.style.stroke = "#f72585";
		cell.style.strokeWidth = "2";
		if(window.event.ctrlKey) {
			handleCellMouseDown(event, d);
		}
	}

	function handleCellMouseOut(event, d) {
		let cell = event.currentTarget;
		tooltip.style("opacity", 0).style("left", 0).style("top", 0);
		cell.style.stroke = "none";
		cell.style.strokeWidth = "0";
	}

	function handleCellMouseDown(event, d) {
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

	function handleCellClick(event, d) {
		let cell = event.currentTarget;
		if (window.event.ctrlKey) {
			selectedCells.splice(selectedCells.indexOf(cell), 1);
			d3.select(cell).on("mouseout", handleCellMouseOut);
			handleCellMouseOut(event, d);
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
