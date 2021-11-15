import "./App.css";
import CalendarComponent from "./components/calendar";

let jsonData = require("./generated_data_1987_2008.json");

function App() {
	return (
		<div className="App">
			<CalendarComponent data = {jsonData}/>
		</div>
	);
}

export default App;
