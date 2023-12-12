import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchDataPage, fetchData } from '../utils/DataFetch';
import Table from 'react-bootstrap/Table';
import classes from './Home.module.css';
import Form from 'react-bootstrap/Form';

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Visitors Count',
    },
  },
};

const Home = () => {
  const [data, setData] = useState(null);
  const [topFive, setTopFive] = useState([]);
  const [totalVisits, settotalVisits] = useState(0);
  const [todatePicker, setToDatePicker] = useState(new Date().toISOString().split('T')[0]);
  let date = new Date();
  date.setDate(date.getDate() - 30);
  const [fromdatePicker, setFromDatePicker] = useState(date.toISOString().split('T')[0]);

  useEffect(() => {

    fetchDataPage(1, 500)
      .then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            countEntriesForInterval(json.clientData); 
            json.clientData.map((item) => item.Company);

            const lastMonthData = json.clientData.filter((entry) => {
              const entryDate = new Date(entry.TimeStamp);
              const today = new Date();
              const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

            return entryDate >= monthAgo && entryDate <= today;
            });

            const countNames = lastMonthData.reduce((acc, obj) => {
              if (acc[obj.Company.Name]) {
                acc[obj.Company.Name]++;
              } else {
                acc[obj.Company.Name] = 1;
              }
              return acc;
            }, {});

            const countedNamesArray = Object.keys(countNames).map((name) => ({
              name,
              count: countNames[name],
            }));

            const topFiveNamesSorted = countedNamesArray.sort((a, b) => b.count - a.count);

            const topFive = topFiveNamesSorted.slice(0, 5);
            setTopFive(topFive);
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const fromDate = new Date(fromdatePicker);
    const toDate = new Date(todatePicker);
    toDate.setHours(23, 59, 59, 999);

    fetchData(toDate.toISOString(), fromDate.toISOString())
      .then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            const filteredData = json.clientData.filter((entry) => {
              const entryDate = new Date(entry.TimeStamp);
              return entryDate >= fromDate && entryDate <= toDate;
            });

            countEntriesForInterval(filteredData, fromDate, toDate);

            const countNames = filteredData.reduce((acc, obj) => {
              if (acc[obj.Company.Name]) {
                acc[obj.Company.Name]++;
              } else {
                acc[obj.Company.Name] = 1;
              }
              return acc;
            }, {});

            const countedNamesArray = Object.keys(countNames).map((name) => ({
              name,
              count: countNames[name],
            }));

            const topFiveNamesSorted = countedNamesArray.sort((a, b) => b.count - a.count);

            const topFive = topFiveNamesSorted.slice(0, 5);
            setTopFive(topFive);
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [todatePicker, fromdatePicker]);



  const countEntriesForInterval = (data, fromDate, toDate) => {
    const diffInDays = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1; // Päivien lukumäärä valitulla aikavälillä
    const entriesCountByDay = {};
    let totalVisits = 0;

    for (let i = 0; i < diffInDays; i++) {
      const targetDay = new Date(fromDate);
      targetDay.setDate(fromDate.getDate() + i);

      const formattedTargetDay = targetDay.toLocaleDateString();
      const entriesForDay = data.filter((entry) => {
        const entryDate = new Date(entry.TimeStamp);
        const entryDay = entryDate.toLocaleDateString();
        return entryDay === formattedTargetDay;
      });

      const dailyVisits = entriesForDay.length;
      entriesCountByDay[formattedTargetDay] = dailyVisits;
      totalVisits += dailyVisits;
    }

    settotalVisits(totalVisits);

    setData({
      labels: Object.keys(entriesCountByDay),
      datasets: [
        {
          label: 'Visitors Count',
          data: Object.values(entriesCountByDay),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    });
  };

  return (
    <div>
      <div className={classes.home}>
        <h1>Home</h1>
        <p>{`Total visitors: ${totalVisits}`}</p>
        <div className={classes.datepickers}>
          <Form.Control
            type="date"
            name="fromdatepic"
            placeholder="DateRange"
            max={todatePicker}
            value={fromdatePicker}
            onChange={(e) => setFromDatePicker(e.target.value)}
          />
          -
          <Form.Control
            type="date"
            name="todatepic"
            placeholder="DateRange"
            value={todatePicker}
            onChange={(e) => setToDatePicker(e.target.value)}
          />
        </div>
        <div className={classes.content}>
          <div className={classes.graphes}>
            {data ? <Line className={classes.graphbox} options={options} data={data} /> : null}
          </div>
          <div className={classes.card}>
            <div className={classes.tableContainer}>
              <div className={classes.table}>
                <p><b>Top 5 visited companies</b></p>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFive.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  );
};

export default Home;
