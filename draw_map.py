import plotly.graph_objects as go
import pandas as pd
import numpy as np
import plotly
import json
from dash import Dash, dcc, html, Input, Output, no_update

df_airports = pd.read_csv('airport_coords.csv')
df_airports.head()
#df_airports = df_airports.sort_values(by='airport')[:10]

df_flight_paths = pd.read_csv('path1987.csv')
#df_flight_paths = df_flight_paths.iloc[:50]
df_flight_paths.head()

fig = go.Figure()

lons = []
lats = []
lons = np.empty(3 * len(df_flight_paths))
lons[::3] = df_flight_paths['start_lon']
lons[1::3] = df_flight_paths['end_lon']
lons[2::3] = None
lats = np.empty(3 * len(df_flight_paths))
lats[::3] = df_flight_paths['start_lat']
lats[1::3] = df_flight_paths['end_lat']
lats[2::3] = None

flight_paths = []
for i in range(len(df_flight_paths)):
	fig.add_trace(go.Scattergeo(
#flight_paths = go.Scattergeo(
            locationmode = 'USA-states',
            lon = [df_flight_paths['start_lon'][i], df_flight_paths['end_lon'][i]],
            lat = [df_flight_paths['start_lat'][i], df_flight_paths['end_lat'][i]],
			hoverinfo = 'text',
			text = str(df_flight_paths['Total'][i]),
			#lon = lons,
			#lat = lats,
            mode = 'markers+lines',
            line = dict(width = 1,color = 'black'),
			name = df_flight_paths['Origin'][i],
            opacity = float(df_flight_paths['Total'][i]) / float(df_flight_paths['Total'].max()),
			#opacity = 0.05,
			#showlegend = False,
        )
   )
#fig.add_trace(flight_paths)

airports = []

#fig.add_trace(go.Scattergeo(
airports = go.Scattergeo(
    locationmode = 'USA-states',
    lon = df_airports['lon'],
    lat = df_airports['lat'],
    hoverinfo = 'text',
    text = df_airports['airport'],
    mode = 'markers',
    marker = dict(
        size = 5,
        color = 'black',
        line = dict(
            width = 3,
            color = 'rgba(68, 68, 68, 0)'
        )
    )
	)
#)
fig.add_trace(airports)

#fig.update_traces(hoverinfo="none", hovertemplate=None)

fig.update_layout(
    title_text = '1987 Flights <br>(Hover for airport names)',
    showlegend = False,
	width = 1280,
	height = 1280,
    geo = dict(
        scope = 'north america',
        projection_type = 'azimuthal equal area',
        showland = True,
        landcolor = 'rgb(243, 243, 243)',
        countrycolor = 'rgb(204, 204, 204)',
    ),
	hovermode='closest',
)


app = Dash(__name__)
app.layout = html.Div([dcc.Graph(id='my-graph', figure=fig, clear_on_unhover=True), dcc.Tooltip(id='graph-tooltip')])

@app.callback(
    Output('my-graph', 'figure'),
    #Output("graph-tooltip", "bbox"),
 #   Output("graph-tooltip", "children"),
    Input('my-graph', 'clickData'),
)

def display_click(clickData):
	if clickData is None:
		return fig
	pt = clickData['points'][0]
	num = pt['pointNumber']
	curr = df_airports.iloc[num][0]
	print(num, list(df_airports.iloc[num]), curr)
	df_conn = df_flight_paths[df_flight_paths['Origin'] == curr]
	print(df_conn.head())
	lon2 = []
	lat2 = []
	fig.for_each_trace(
		lambda trace: trace.update(line=dict(color='red'), opacity=0.5) if trace.name == curr else (),
	)
	return fig

app.run_server(debug=True, use_reloader=False)  # Turn off reloader if inside Jupyter