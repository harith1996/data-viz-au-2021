import CalendarComponent from "./components/calendar";
import Filters from './components/filters'

let data = require('./json/generated_data_1987_2008.json');
let filterMetadata = require('./json/filters.json')
function App() {
	return (
		<div className="App">
			<Filters metadata = {filterMetadata} />
			<CalendarComponent data = {data}/>
		</div>
	);
	
	
}

export default App;
