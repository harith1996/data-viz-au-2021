import plotly.graph_objects as go
import pandas as pd
import numpy as np
import plotly
import json
from dash import Dash, dcc, html, Input, Output, no_update

df_airports = pd.read_csv('airport_coords.csv')
df_airports.head()

df_flight_paths = pd.read_csv('path1987.csv')
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
			#lon = lons,
			#lat = lats,
            mode = 'lines',
            line = dict(width = 1,color = 'red'),
            #opacity = float(df_flight_paths['Total'][i]) / float(df_flight_paths['Total'].max()),
			opacity = 0.5,
			showlegend = False,
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
        color = 'rgb(255, 0, 0)',
        line = dict(
            width = 3,
            color = 'rgba(68, 68, 68, 0)'
        )
    ))
#)
fig.add_trace(airports)

fig.update_traces(hoverinfo="none", hovertemplate=None)

fig.update_layout(
    title_text = '1987 Flights <br>(Hover for airport names)',
    showlegend = False,
    geo = dict(
        scope = 'north america',
        projection_type = 'azimuthal equal area',
        showland = True,
        landcolor = 'rgb(243, 243, 243)',
        countrycolor = 'rgb(204, 204, 204)',
    ),
)

def update_point(trace, points, selector):
	print("clicked")
	c = list(airports.marker.color)
	s = list(airports.marker.size)
	for i in points.point_inds:
		c[i] = '#bae2be'
		s[i] = 20
		with f.batch_update():
			airports.marker.color = 'rgb(0,0,255)'
			airports.marker.size = 5

#airports.on_click(fig.update_traces(marker=dict(color='RoyalBlue')))
#fig.show()
#plotly.offline.plot(fig, "map.html")

app = Dash(__name__)
app.layout = html.Div([dcc.Graph(id='my-graph', figure=fig, clear_on_unhover=True), dcc.Tooltip(id='graph-tooltip')])

@app.callback(
    Output('my-graph', 'figure'),
    #Output("graph-tooltip", "bbox"),
 #   Output("graph-tooltip", "children"),
    Input('my-graph', 'hoverData'),
)

def display_hover(hoverData):
	if hoverData is None:
		return fig
	pt = hoverData['points'][0]
	num = pt['pointNumber']
	print(num, list(df_airports.iloc[num]), df_airports.iloc[num][0])
	df_conn = df_flight_paths[df_flight_paths['Origin'] == df_airports.iloc[num][0]]
	print(df_conn.head())
	lon2 = []
	lat2 = []
	#for i in range(len(df_conn)):
	#	lon2 
	#	fig.add_trace(go.Scattergeo(locationmode = 'USA-states',
    #        lon = [df_conn['start_lon'][i], df_conn['end_lon'][i]],
    #        lat = [df_conn['start_lat'][i], df_conn['end_lat'][i]],
	#		mode = 'lines',
    #        line = dict(width = 1,color = 'black'),
    #        opacity = float(df_conn['Total'][i]) / float(df_conn['Total'].max()),
	#		showlegend = False,
    #    ))
	fig.update_traces(line=dict(color='black'), selector=dict(mode='lines'))
	#fig.update_layout(
    #title_text = 'Hovered',
    #showlegend = False,
    #geo = dict(
    #    scope = 'north america',
    #    projection_type = 'azimuthal equal area',
    #    showland = True,
    #    landcolor = 'rgb(243, 243, 243)',
    #    countrycolor = 'rgb(204, 204, 204)',
    #),
	#)
	return fig

app.run_server(debug=True, use_reloader=False)  # Turn off reloader if inside Jupyter