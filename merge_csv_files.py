import pandas as pd
import glob

path  = "DataOutput/SummarisedWeekly_Filter_AA_SEA_DFW/"

all_files = glob.glob(path + "/*.csv")

li = []

for filename in all_files:
    df = pd.read_csv(filename, index_col=None, header=0)
    li.append(df)

frame = pd.concat(li, axis=0, ignore_index=True)

print(frame.shape[0])
output_path = "DataOutput/"

frame.to_csv(output_path + "SummarisedWeekly_Filter_AA_SEA_DFW" + ".csv")