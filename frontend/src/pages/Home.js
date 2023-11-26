import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import {fetchDataPage} from '../utils/DataFetch'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Viikon kävijä määrät',
    },
  },
};

const Home = () => {

    const [page, setPage] = useState(1);
    const [pagesize, setPagesize] = useState(5);
    const [dataset, setDataset] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDataPage(page, 500).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    countEntriesForPastWeek(json.clientData);
                });
            }
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    const countEntriesForPastWeek = (data) => {
        const today = new Date();
        const entriesCountByDay = {};
        for (let i = 7; i >= 0; i--) {
          const targetDay = new Date(today);
          targetDay.setDate(today.getDate() - i);
      
          const formattedTargetDay = targetDay.toLocaleDateString();
          const entriesForDay = data.filter(entry => {
            const entryDate = new Date(entry.TimeStamp);
            const entryDay = entryDate.toLocaleDateString();
            entryDate.toLocaleDateString();
            return entryDay === formattedTargetDay;
          });
      
          entriesCountByDay[formattedTargetDay] = entriesForDay.length;
        }
        console.log(entriesCountByDay);
        const keysArray = Object.keys(entriesCountByDay).map(key => key.toString());
        console.log(keysArray);
        setData({
            keysArray,
            datasets: [
                {
                    label: 'Tallennetut kävijä määrät',
                    data: entriesCountByDay,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }
            ],
        });
    }
      

    return (
        <div>
            <h1>Home</h1>
            { data ?
                <Line options={options} data={data} /> : null
            }
        </div>
    )
}

export default Home
