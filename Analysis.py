import csv
import datetime
import pandas as pd
import numpy as np
import random
import sys
from scipy.stats import skew, mode
import warnings
from pathlib import Path
#from datetime import datetime




# #code to randomly sample down a dataset
# p = 0.01
# df_sampled_down = pd.read_csv(input_path+file,
#                               header=0, 
#                               skiprows=lambda i: i>0 and random.random() > p)


# df_sampled_down.to_csv("1987_sampled_down.csv")
# sys.exit("Sampled Down DataFrame Saved. No Other Processes Carried Out")


# #write some sample data to easily observe
# sorted_data = data.sort_values(by=['ActualElapsedTime'], ascending=True).head(30)
# sorted_data.to_csv("1987_sorted_data_ActualElapsedTime.csv")
# sys.exit("Dataframe Header Saved. No Other Processes Carried Out")


def get_week_number(year, month, day):
    week_number = int(datetime.date(year, month, day).strftime("%V"))
    return (int(week_number))

def get_day_of_year(year, month, day):
    datetime_object = datetime.date(year, month, day)
    day_of_year = datetime_object.timetuple().tm_yday
    return int((day_of_year))
    
def concat_values(a,b):
    return str(a+"_"+b)

def mean_with_default_value(input):
    if np.all(input!=input) or len(input) == 0:
        dummy_series = pd.Series([-10000]*len(input))
        return(dummy_series.mean)
    mean =  pd.Series(input).mean()
    if type(mean) != int and type(mean) != float:
        mean = -10000
    return mean

def mode_with_default_value(input):
    if np.all(input!=input) or len(input) == 0:
        dummy_series = pd.Series([-10000]*len(input))
        return(dummy_series.mode)
    input  = tuple(input)
    mode =  pd.Series(input).mode()
    if type(mode) != int and type(mode) != float:
        mode = -10000
    return mode 
    #print(mean)

def median_with_default_value(input):
    if np.all(input!=input) or len(input) == 0:
        dummy_series = pd.Series([-10000]*len(input))
        return(dummy_series.median)
    median =  pd.Series(input).median()
    if type(median) != int and type(median) != int:
        median = -10000
    return median 
    #print(mean)

def GroupByData(input_data, groupby):
    print("In GroupBy function.")
    #ADD THIS BACK: "week_number", 
    grouped_dataset = input_data[["Year","week_number", "day_of_year", "DepTime", "ActualElapsedTime", "FlightNum", "UniqueCarrier", "ArrDelay",
                                "DepDelay", "Distance", "Cancelled", "CarrierDelay", "WeatherDelay", "NASDelay", "SecurityDelay", 
                                "LateAircraftDelay", "Origin", "Dest"]].groupby(groupby).agg(
                                Total_Flights =  ("ActualElapsedTime", "count")
                                # Total_Duration_of_Flights = ("ActualElapsedTime", "sum"), 
                                # Max_Duration_of_Flights = ("ActualElapsedTime", "max"),
                                # Min_Duration_of_Flights = ("ActualElapsedTime", "min"),
                                # Median_Duration_of_Flights = ("ActualElapsedTime", median_with_default_value),
                                # Mean_Duration_of_Flights = ("ActualElapsedTime", mean_with_default_value),
                                # Mean_Duration_of_Flights_pd = ("ActualElapsedTime", mean_with_default_value),
                                
                                # Highest_Traffic_Origin_Airport = ("Origin", mode),   #error with pd.Series.mean
                                # Highest_Traffic_Destination_Airport = ("Dest", mode),  #error!!
                                # Most_Common_Flight_Path = ("origin_destination", mode),   #error!!!
                                
                                # Unique_Flight_Paths = ("FlightNum",pd.Series.nunique),
                                # Unique_Carriers = ("UniqueCarrier", pd.Series.nunique), 
                                # Count_of_Arrival_Delays = ("ArrDelay", "count"),  #there are negative values here
                                # Mean_Arrival_Delays = ("ArrDelay", mean_with_default_value),  #there are negative values here
                                # Count_of_Departure_Delay = ("DepDelay", "count"), #uc
                                # Mean_Departure_Delay = ("DepDelay", mean_with_default_value),
                                # Total_Distance = ("Distance","sum"), 
                                # Mean_Distance = ("Distance", mean_with_default_value), 
                                # Total_Cancelled_Flights = ("Cancelled","sum"), #this is a flag variable. 0 for not cancelled and 1 for cancelled, so I use sum and not count 
                                # Count_Carrier_Delay = ("CarrierDelay", "count"), 
                                # Mean_Carrier_Delay = ("CarrierDelay", mean_with_default_value),
                                # Count_Weather_Delay = ("WeatherDelay", "count"),
                                # Mean_Weather_Delay = ("WeatherDelay", mean_with_default_value),
                                # Count_NAS_Delay = ("NASDelay","count"), 
                                # Mean_NAS_Delay = ("NASDelay", mean_with_default_value), 
                                # Count_Security_Delay = ("SecurityDelay","count"), 
                                # Mean_Security_Delay = ("SecurityDelay", mean_with_default_value),
                                # Count_Late_Aircraft_Delay = ("LateAircraftDelay","count"),
                                # Mean_Late_Aircraft_Delay = ("LateAircraftDelay", mean_with_default_value)
                                )
    return (grouped_dataset)


def Summarise_and_save_data(input_data, year, week_summarised_output_path, week_origin_summarised_output_path, custom_output_path = False):
    data = input_data 
    data["week_number"] = data.apply(lambda row: get_week_number(row["Year"],row["Month"],row["DayofMonth"]),axis=1)
    print("Calculated Week Number")
    data["day_of_year"] = data.apply(lambda row: get_day_of_year(row["Year"],row["Month"],row["DayofMonth"]),axis=1)
    print("Calculated Day of Year")
    #data["origin_destination"] = data.apply(lambda row: concat_values(row["Origin"],row["Dest"]),axis=1)
    #print("Created origin_destination column") 
    
    #summarised_dataset["Average_Flight_Duration"] = summarised_dataset.apply(lambda row: row.Total_Duration_of_Flights/row.Total_Flights, axis = 1)
    #summarised_dataset["Average_Arrival_Delay"] = summarised_dataset.apply(lambda row: row.Sum_of_Arrival_Delays/row.Total_Flights, axis = 1)
    #summarised_dataset["Average_Departure_Delay"] = summarised_dataset.apply(lambda row: row.Sum_of_Departure_Delay/row.Total_Flights, axis = 1)
    if custom_output_path == False:
        data_groupby_week_number = GroupByData(data, ["Year", "week_number"])
        print("Grouped By Week Number. Row Count: ", data_groupby_week_number.shape[0])
        # data_groupby_week_number_origin_airport = GroupByData(data, ["Year", "week_number", "Origin", "Dest"])
        # print("Grouped By Week Number and Origin. Row Count: ", data_groupby_week_number_origin_airport.shape[0])
        data_groupby_week_number.to_csv(week_summarised_output_path + str(year) + "_summarised_data_groupby_week_number.csv")
        # data_groupby_week_number_origin_airport.to_csv(week_origin_summarised_output_path + str(year) + "_summarised_data_groupby_week_number_and_origin.csv")
    else:
        data_groupby_custom = GroupByData(data, ["Year", "day_of_year"])
        data_groupby_custom.to_csv(custom_output_path + str(year) + "grouped_by_day_of_year.csv")

input_path = "SourceData/dataverse_files/"
week_summarised_output_path = "DataOutput/SummarisedWeekly_Filter_AA_SEA_DFW/"
Path(str(week_summarised_output_path)).mkdir(parents = True, exist_ok = True)
week_origin_summarised_output_path = "DataOutput/SummarisedWeekly_Filter_AA_SEA_DFW/"
# Path("DataOutput/" + str(week_origin_summarised_output_path)).mkdir(parents = True, exist_ok = True)
custom_output_folder = "DailyAgg1988_1994/"
Path("DataOutput/" + str(custom_output_folder)).mkdir(parents = True, exist_ok = True)
custom_output_path = "DataOutput/" + str(custom_output_folder)

for year in range(1987, 2009):
    print("starting to process year: ", year)
    filename = str(year)+".csv"
    if year in (2001,2002):
        data = pd.read_csv(input_path+filename, encoding = "ISO-8859-1")   #some weird encoding problem here
    else:
        data = pd.read_csv(input_path+filename) 

    data = data.loc[(data['Origin'] == "SEA") & (data['Dest'] == "DFW") & (data['UniqueCarrier'] == "AA")]
    print("Data Read")
    print("Original Row Count: ", data.shape[0])
    Summarise_and_save_data(data, year, week_summarised_output_path, week_origin_summarised_output_path, custom_output_path = False)





