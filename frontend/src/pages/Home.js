import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchDataPage, fetchData } from '../utils/DataFetch';
import Table from 'react-bootstrap/Table';
import classes from './Home.module.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';




const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Visitors Count for the Month', // Päivitetty otsikko kuukaudelle
    },
  },
};

const Home = () => {
  const [data, setData] = useState(null);
  const [topFive, setTopFive] = useState([]);
  const [totalVisitsInMonth, setTotalVisitsInMonth] = useState(0); // Päivitetty tila kuukaudelle
  
 
    const [visualData, setVisualData] = useState(null);
    const [todatePicker, setToDatePicker] = useState(new Date().toISOString().split('T')[0]);
    let date = new Date();
    date.setDate(date.getDate() - 30);
    const [fromdatePicker, setFromDatePicker] = useState(date.toISOString().split('T')[0]);
  
  useEffect(() => {
   
    fetchDataPage(1, 500)
      .then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            countEntriesForPastMonth(json.clientData); // Muutettu viikon sijaan kuukauden ajalle
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
  
            countEntriesForPastMonth(filteredData);
  
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
  

 
  const countEntriesForPastMonth = (data) => {
    const today = new Date();
    const entriesCountByDay = {};
    let totalVisits = 0;

    for (let i = 30; i >= 0; i--) { // Muutettu 30 päivän aikaväliksi
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

    setTotalVisitsInMonth(totalVisits); // Päivitetty kuukausitietojen tila

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
        <p>{`Total visitors in the past month: ${totalVisitsInMonth}`}</p> {/* Päivitetty näyttämään kuukauden kävijämäärä */}
        <div className={classes.content}>
          <div className={classes.graphes}>
            {data ? <Line className={classes.graphbox} options={options} data={data} /> : null}
          </div>
          <div className={classes.card}>
                        <h2>Data</h2>
                        <div className={classes.controls}>
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
                           
                        </div>
                       

          <div className={classes.tableContainer}>
            <div className={classes.table}>
              <p><b>Top 5 visited companies last week</b></p>
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
