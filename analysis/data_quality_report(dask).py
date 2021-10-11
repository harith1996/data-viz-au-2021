from dask import dataframe as dd
import dask

if __name__ == '__main__':
    # client = Client(threads_per_worker=4, n_workers=1)
    # print(client)
    # specify path to CSVs directory
    CSV_PATH = r'../CSVs'

    # blocksize for processing of dataset. Should be smaller than memory capacity
    BLOCK_SIZE = "10MB"

    # DATA_TYPE for dealing with dask type inference errors
    DATA_TYPES = {'TailNum': 'object',
                'CancellationCode': 'object'}

    dask_df = dd.read_csv(CSV_PATH + '/*.csv', assume_missing=True,
                        blocksize=BLOCK_SIZE, dtype=DATA_TYPES, encoding='latin-1')

    
    def count_total_instances(df: dd) -> dd:
        """
        computes total instances in a dask dataframe
        """
        return df.index.size.compute(num_workers = 6)


    def prune_flights_without_delay(df: dd) -> dd:
        """
        removes flights without delay from airline dataframe
        """
        return df.drop(df[(df['ArrDelay']) == 0 or df['DepDelay'] == 0], inplace=True).compute(num_workers = 6)


    def count_missing_values(df: dd) -> dd:
        """
        counts missing value for each column
        """
        return df.isnull().sum().compute(num_workers = 6)

    analysis_tasks = [count_total_instances,
                    prune_flights_without_delay, count_missing_values]
    lazy_results = []
    for task in analysis_tasks:
        print(task(dask_df))
        # lazy_results.append(dask.delayed(task)(dask_df))

    # client.shutdown()
    # client.close()
    