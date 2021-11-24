import CalendarComponent from "./components/Calendar";
import Filters from './components/Filters'

let data = require('./json/Data_Output_Harith.json');
let filterMetadata = require('./json/filters.json');
data.sort((a,b) => a.Year - b.Year);
function App() {
	return (
		<div className="App">
			<Filters metadata = {filterMetadata} />
			<CalendarComponent data = {data}/>
		</div>
	);
	
	
}

export default App;
