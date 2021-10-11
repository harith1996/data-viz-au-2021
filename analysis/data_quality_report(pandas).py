import pandas as pd
import glob

path = r'../CSVs' # use your path
all_files = glob.glob(path + "/*.csv")

li = []

for filename in all_files:
    print("Reading "+ filename + "....\n")
    pandas_df = pd.read_csv(filename, encoding = 'latin-1')
    li.append(pandas_df)

pandas_df = pd.concat(li, axis=0, ignore_index=True)

total_count = (len(pandas_df.index))
print("total data entries = " + str(total_count))
missing_data = pd.DataFrame(
    100*(pandas_df.isnull().sum()/total_count),
    # str(missing_count) + " (" + str(100*(missing_count/total_count)) + "%)" ,
    columns=['Missing Values (%)']
)

dq_report = missing_data
print(dq_report)