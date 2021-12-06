import * as d3 from "d3";
export default function getWeeklyBarChart(svg) {
    const margin = {top: 10, right: 30, bottom: 30, left: 70},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
		  
const data = [{"Total_Flights":2216995,"week_number":1},{"Total_Flights":2237785,"week_number":2},{"Total_Flights":2230091,"week_number":3},{"Total_Flights":2255855,"week_number":4},{"Total_Flights":2252480,"week_number":5},{"Total_Flights":2243553,"week_number":6},{"Total_Flights":2265640,"week_number":7},{"Total_Flights":2283486,"week_number":8},{"Total_Flights":2294355,"week_number":9},{"Total_Flights":2284503,"week_number":10},{"Total_Flights":2312598,"week_number":11},{"Total_Flights":2315159,"week_number":12},{"Total_Flights":2320758,"week_number":13},{"Total_Flights":2319629,"week_number":14},{"Total_Flights":2315601,"week_number":15},{"Total_Flights":2322442,"week_number":16},{"Total_Flights":2322311,"week_number":17},{"Total_Flights":2237880,"week_number":18},{"Total_Flights":2174118,"week_number":19},{"Total_Flights":2172789,"week_number":20},{"Total_Flights":2140519,"week_number":21},{"Total_Flights":2166782,"week_number":22},{"Total_Flights":2192245,"week_number":23},{"Total_Flights":2204467,"week_number":24},{"Total_Flights":2210002,"week_number":25},{"Total_Flights":2193048,"week_number":26},{"Total_Flights":2163042,"week_number":27},{"Total_Flights":2223487,"week_number":28},{"Total_Flights":2219827,"week_number":29},{"Total_Flights":2220032,"week_number":30},{"Total_Flights":2226067,"week_number":31},{"Total_Flights":2231346,"week_number":32},{"Total_Flights":2226784,"week_number":33},{"Total_Flights":2226266,"week_number":34},{"Total_Flights":2166131,"week_number":35},{"Total_Flights":2172546,"week_number":36},{"Total_Flights":2092542,"week_number":37},{"Total_Flights":2145067,"week_number":38},{"Total_Flights":2164320,"week_number":39},{"Total_Flights":2230195,"week_number":40},{"Total_Flights":2267730,"week_number":41},{"Total_Flights":2272609,"week_number":42},{"Total_Flights":2267451,"week_number":43},{"Total_Flights":2263400,"week_number":44},{"Total_Flights":2265359,"week_number":45},{"Total_Flights":2258822,"week_number":46},{"Total_Flights":2180872,"week_number":47},{"Total_Flights":2192843,"week_number":48},{"Total_Flights":2234826,"week_number":49},{"Total_Flights":2221164,"week_number":50},{"Total_Flights":2228951,"week_number":51},{"Total_Flights":2155793,"week_number":52}];
var avg = parseInt(d3.mean(data, function(d) { return d.Total_Flights;}));
console.log(avg);
var max = d3.max(data, function(d) { return d.Total_Flights - avg;});
var min = d3.min(data, function(d) {return d.Total_Flights - avg;});

var y0 = Math.max(-min, max);

var y = d3.scaleLinear()
    .domain([-y0, y0])
    .range([height, 0])
    .nice();
	
var x = d3.scaleBand()
    .domain(data.map(d => d.week_number))
    .range([0, width])
	.padding(.2);
	
const xAxis = d3.axisBottom()
        .scale(x);

svg.append('g')
.attr('class', 'axis')
.attr('transform', 'translate(0,' + (y(0)) + ')')
.call(xAxis);
  
 svg.append("g")
  .call(d3.axisLeft(y));
  
const yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(20);
svg.append('g')
  .attr('class', 'y axis-grid')
  .call(yAxisGrid);

// Bars
svg.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("y", d=>y(Math.max(0, d.Total_Flights-avg)))
    .attr("x", d =>x(d.week_number))
    .attr("height", d=>Math.abs(y(0) - y(d.Total_Flights-avg)))
    .attr("width", x.bandwidth());

return svg.node();
}