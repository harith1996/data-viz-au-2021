import CalendarComponent from "./components/Calendar";
import Filters from "./components/Filters";

let filterMetadata = require("./json/filters.json");
let data = require("./json/Data_Output_Harith.json");

function App() {
	return (
		<div className="App">
			<Filters metadata={filterMetadata} />
			<CalendarComponent data={data} />
		</div>
	);
}

export default App;
