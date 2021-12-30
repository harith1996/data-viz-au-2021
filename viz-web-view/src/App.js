import CalendarComponent from "./components/Calendar";
import * as d3 from 'd3';

let data = require("./json/Data_Output_Harith.json");

function App() {
	return (
		<div className="App">
			<CalendarComponent data={data}/>
		</div>
	);
}

export default App;
