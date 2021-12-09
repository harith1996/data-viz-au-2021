import * as d3 from "d3";
export default function addYearlyBarChart(
	data,
	svg,
	translateX = 0,
	translateY = 0,
	barHoverHandler
) {
	const margin = { top: 10, right: 30, bottom: 30, left: 50 },
		width = 590 - margin.left - margin.right,
		height = 435 - margin.top - margin.bottom,
		data_attr_name = "year";

	// const data = [
	// 	{ Total_Flights: 1288326, year: 1987 },	{ Total_Flights: 5137497, year: 1988 },	{ Total_Flights: 4952196, year: 1989 },	{ Total_Flights: 5202481, year: 1990 },	{ Total_Flights: 5020835, year: 1991 },	{ Total_Flights: 5027937, year: 1992 },	{ Total_Flights: 5000323, year: 1993 },	{ Total_Flights: 5101202, year: 1994 },	{ Total_Flights: 5225038, year: 1995 },	{ Total_Flights: 5209326, year: 1996 },	{ Total_Flights: 5301999, year: 1997 },	{ Total_Flights: 5227051, year: 1998 },	{ Total_Flights: 5360018, year: 1999 },	{ Total_Flights: 5481303, year: 2000 },	{ Total_Flights: 5723673, year: 2001 },	{ Total_Flights: 5197860, year: 2002 },	{ Total_Flights: 6375690, year: 2003 },	{ Total_Flights: 6987729, year: 2004 },	{ Total_Flights: 6992838, year: 2005 },	{ Total_Flights: 7003802, year: 2006 },	{ Total_Flights: 7275288, year: 2007 },	{ Total_Flights: 6858079, year: 2008 },];
	var avg = parseInt(
		d3.mean(data, function (d) {
			return d.Total_Flights;
		})
	);
	console.log(avg);
	var max = d3.max(data, function (d) {
		return d.Total_Flights - avg;
	});
	var min = d3.min(data, function (d) {
		return d.Total_Flights - avg;
	});

	var x0 = Math.max(-min, max);

	var x = d3.scaleLinear().domain([-x0, x0]).range([0, width]).nice();

	console.log(x);

	var y = d3
		.scaleBand()
		.domain(data.map((d) => d.year))
		.range([0, height])
		.padding(0.2);

	/*const xAxis = d3.axisBottom()
        .scale(x);

svg.append('g')
.attr('class', 'axis')
.attr('transform', 'translate(0,' + (y(0)) + ')')
.call(xAxis);*/

	const chart = svg.append("g");

	chart.attr(
		"transform",
		(data, idx) => `translate(${translateX + margin.left}, ${translateY})`
	);

	chart.append("text")
		.text(`Yearly Avg: ${avg.toLocaleString()} flights`)
		.attr("transform", `translate(${100}, ${
		100 + 10
		})`);

	const yAxis = d3.axisLeft(y).tickSize(0).tickFormat("");

	const xAxis = d3.axisBottom().scale(x).ticks(10);

	chart
		.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (height - margin.bottom + 30) + ")")
		.call(xAxis);

	chart.append("g").attr("class", "axis").call(yAxis);

	// const xAxisGrid = d3
	// 	.axisBottom(x)
	// 	.tickSize(-height)
	// 	.tickFormat("")
	// 	.ticks(20);
	// chart.append("g")
	// 	.attr("class", "x axis-grid")
	// 	.attr("transform", "translate(0," + (height - margin.bottom + 30) + ")")
	// 	.call(xAxisGrid);
	// const yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(10);

	// Bars
	chart
		.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => x(Math.min(0, d.Total_Flights - avg)))
		.attr("y", (d) => y(d.year))
		.attr("width", (d) => Math.abs(x(d.Total_Flights - avg) - x(0)))
		.attr("height", y.bandwidth())
		.on("mouseover", function (event, data) {
			const bar = event.currentTarget;
			showBarTooltip(bar, data, event);
			highlightBar(bar, data);
			barHoverHandler(data[data_attr_name]);
		})
		.on("mouseleave", function (event, data) {
			hideBarTooltip();
			unHighlightBar(event.currentTarget, data);
			barHoverHandler(data[data_attr_name]);
		});

	let barTooltip = d3
		.select("body")
		.append("div")
		.attr("class", "bar-tooltip tooltip")
		.style("opacity", 0)
		.on("mouseover", (event, data) => {
			barTooltip.style("opacity", 0).style("top", 0).style("left", 0);
		});

	function showBarTooltip(bar, data, event) {
		barTooltip
			.html(
				"Year " +
					data["year"] +
					"<br/>" +
					data["Total_Flights"].toLocaleString() +
					" flights" +
					"<br/>" +
					"Deviation from avg : " + parseFloat((data["Total_Flights"] - avg).toFixed(2)).toLocaleString()
			)
			.style("left", event.pageX + 10 + "px")
			.style("top", event.pageY + 10 + "px")
			.style("opacity", 0.9);
	}

	function hideBarTooltip() {
		barTooltip
			.style("left", 0 + "px")
			.style("top", 0 + "px")
			.style("opacity", 0.0);
	}

	function highlightBar(bar, data) {
		d3.select(bar).attr("fill", "orange");
	}

	function unHighlightBar(bar, data) {
		d3.select(bar).attr("fill", "black");
	}

	return chart;
}
