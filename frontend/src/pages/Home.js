import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchDataPage } from '../utils/DataFetch';
import Table from 'react-bootstrap/Table';
import classes from './Home.module.css';

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Visitors Count for the Week',
    },
  },
};

const Home = () => {
  const [data, setData] = useState(null);
  const [viisiSuurinta, setViisiSuurinta] = useState([]);
  const [totalVisitsInWeek, setTotalVisitsInWeek] = useState(0);

  useEffect(() => {
    fetchDataPage(1, 500)
      .then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            countEntriesForPastWeek(json.clientData);
            const companies = json.clientData.map((item) => item.Company);

            const lastWeekData = json.clientData.filter((entry) => {
              const entryDate = new Date(entry.TimeStamp);
              const today = new Date();
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              return entryDate >= weekAgo && entryDate <= today;
            });

            const countNames = lastWeekData.reduce((acc, obj) => {
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

            const suurimmatNimet = countedNamesArray.sort((a, b) => b.count - a.count);

            const viisiSuurinta = suurimmatNimet.slice(0, 5);
            setViisiSuurinta(viisiSuurinta);
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const countEntriesForPastWeek = (data) => {
    const today = new Date();
    const entriesCountByDay = {};
    let totalVisits = 0;

    for (let i = 7; i >= 0; i--) {
      const targetDay = new Date(today);
      targetDay.setDate(today.getDate() - i);

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

    setTotalVisitsInWeek(totalVisits);

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
        <p>{`Total visitors in the past week: ${totalVisitsInWeek}`}</p>
        <div className={classes.content}>
          <div className={classes.graphes}>
            {data ? <Line className={classes.graphbox} options={options} data={data} /> : null}
          </div>
          <div className={classes.tableContainer}>
            <div className={classes.table}>
              <p>Top 5 visited companies last week</p>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {viisiSuurinta.map((item, index) => (
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
  );
};

export default Home;

