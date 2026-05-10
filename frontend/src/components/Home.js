import React, { useEffect, useMemo, useState } from 'react';
import AxiosInstance from './Axios';
import { MaterialReactTable } from 'material-react-table';

const Home = () => {

  const [myData, setMydata] = useState([]); // ✅ must be array
  const [loading, setloading] = useState(true)

  const GetData = () => {
    AxiosInstance.get('project/')
      .then((res) => {
        console.log(res.data);
        setMydata(res.data); // or res.data.results if paginated
        setloading(false)
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    GetData();
  }, []);

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'comments', header: 'Comments' },
    { accessorKey: 'start_date', header: 'Start date' },
    { accessorKey: 'end_date', header: 'End date' },
  ], []);

  return (
    <div>
      {
        loading ? <p>Loading data...</p>:
        <MaterialReactTable
        columns={columns}
        data={myData}
      />
      }
    </div>
  );
};

export default Home;
