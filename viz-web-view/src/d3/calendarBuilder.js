// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/calendar-view
import * as d3 from "d3";
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
		cellSize = 20, // width and height of an individual day, in pixels
		formatMonth = "%b", // format specifier string for months (above the chart)
		yFormat, // format specifier string for values (in the title)
		colors = d3.interpolatePiYG,
	} = {}
) {
	// Compute values.
	const WEEKS = d3.map(data, (d) => year(d) * 53 + weekOfYear(d));
	const YEARS = d3.map(data, year).filter(onlyUnique);
	const STARTING_YEAR = Math.min(...YEARS);
	const QUANT = d3.map(data, quant);
	const I = d3.range(WEEKS.length);

	const getYear = week => Math.floor(week/53);
	const getYearOffset = year => year - STARTING_YEAR;
	const getIndexesByYear = year => d3.range((year - STARTING_YEAR)*53, year*53); 
	const heightOfYear = cellSize + 2;

	// Compute a color scale. This assumes a diverging color scheme where the pivot
	// is zero, and we want symmetric difference around zero.
	const max = d3.quantile(QUANT, 0.9975, Math.abs);
	const color = d3.scaleSequential([-max, +max], colors).unknown("none");

	// Group the index by year, in reverse input order. (Assuming that the input is
	// chronological, this will show years in reverse chronological order.)
	const GROUPED_YEARS = d3.groups(I, (i) => getYear(WEEKS[i])).reverse();

	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", heightOfYear * YEARS.length + cellSize)
		.attr("viewBox", [0, 0, width, heightOfYear * YEARS.length + cellSize])
		.attr("style", "max-width: 100%; height: auto; height: intrinsic;")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10);

	const weekAnchor = svg
		.append("g")
		.selectAll("text")
		.data(d3.range(1,53))
		.join("text")
		.attr("x", (d,i) => (i+1)*cellSize + cellSize/3)
		.attr("y", -cellSize/3)
		.text((d,i) => d);

	const yearSvg = svg
		.selectAll("g")
		.data(GROUPED_YEARS)
		.join("g")
		.attr(
			"transform",
			(d, i) => `translate(40.5, ${heightOfYear * i + cellSize + 2})`
		)

	yearSvg.append("text")
		.attr("x", -5)
		.attr("y", cellSize/2)
		.attr("dy", "0.31em")
		.text((d, i) => d[0]);
	
	const cell = yearSvg
		.append("g")
		.selectAll("rect")
		.data((d , i) => d[1])
		.join("rect")
		.attr("width", cellSize - 1)
		.attr("height", cellSize - 1)
		.attr(
			"x",
			(d, i) => (WEEKS[d] % (getYear(WEEKS[d]) * 53)) * cellSize + 0.5
		)
		.attr("fill", (i) => color(QUANT[i]));


	return Object.assign(svg.node(), { scales: { color } });
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