import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getURLData, getURL, autocompleteCompanies } from '../utils/DataFetch';
import { daysBetweenDates } from '../utils/Helpers';
import classes from './Site.module.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
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
        display: false,
        text: 'Viikon kävijä määrät',
      },
    },
  };
  

const Site = () => {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagesize, setPagesize] = useState(15);
    const [data, setData] = useState(null);
    const [companiesTotalVisits, setCompaniesTotalVisits] = useState(null);
    const [todatePicker, setToDatePicker] = useState(new Date().toISOString().split('T')[0]);
    let date = new Date();
    date.setDate(date.getDate() - 30);
    const [fromdatePicker, setFromDatePicker] = useState(date.toISOString().split('T')[0]);
    
    const [url, setURL] = useState([]);
    
    const [searchOptions, setSearchOptions] = useState([]);
    const [singleSelections, setSingleSelections] = useState([]);

    const [visualData, setVisualData] = useState({
        datasets: [
            {
                label: 'Number of visitors',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ],
    });
    const [visualCompanyData, setVisualCompanyData] = useState({
        datasets: [
            {
                label: 'Company 1',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ],
    });

    useEffect(() => {
        const fromDate = new Date(fromdatePicker);
        const toDate = new Date(todatePicker);
        toDate.setHours(23, 59, 59, 999);
        getURLData(id, toDate.toISOString(), fromDate.toISOString()).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    setData(json);
                    countEntries(json.clientData);
                    countCompaniesEntries(json.clientData);
                    console.log(json);
                });
            }
        }).catch((error) => {
            console.log(error);
        });
        getURL(id).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    setURL(json);
                    console.log(json);
                });
            }
        }).catch((error) => {
            console.log(error);
        }
        );

    }, [todatePicker, fromdatePicker]);

    
    const handleSearch = (query) => {
        setIsLoading(true);
        console.log("handleSearch");
        autocompleteCompanies(query)
        .then((response)=> {
            if (response.ok) {
                response.json().then((json) => {
                setSearchOptions(json);
                console.log(json);
                setIsLoading(false);
                });
            }
        });
    };
    const filterBy = () => true;

    const handleSelection=(e)=>{
        console.log(e);
        console.log(data);
    }
    
    const countEntries= (data) => {
        const fromDate = new Date(fromdatePicker);
        const toDate = new Date(todatePicker);
        toDate.setHours(23, 59, 59, 999);
        const entriesCountByDay = {};
        for (let i = daysBetweenDates(toDate, fromDate); i >= 0; i--) {
          const targetDay = new Date(toDate);
          targetDay.setDate(toDate.getDate() - i);
      
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
        setVisualData({
            keysArray,
            datasets: [
                {
                    label: 'Number of visitors',
                    data: entriesCountByDay,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }
            ],
        });
    }
    const countCompaniesEntries = (data) => {
        const fromDate = new Date(fromdatePicker);
        const toDate = new Date(todatePicker);
        toDate.setHours(23, 59, 59, 999);
        const companyVisitsByDay = {};
        const totalVisitsByCompany = {};
      
        for (let i = daysBetweenDates(toDate, fromDate); i >= 0; i--) {
          const targetDay = new Date(toDate);
          targetDay.setDate(toDate.getDate() - i);
      
          const formattedTargetDay = targetDay.toLocaleDateString();
          const visitsForDay = {};
          data.forEach(entry => {
            const entryDate = new Date(entry.TimeStamp);
            const entryDay = entryDate.toLocaleDateString();
            // Check if the entry is on the target day
            if (entryDay === formattedTargetDay) {
              const companyName = entry.Company.Name; // Assuming your company data is nested under "Company"
      
              // Increment the count for the company on this day
              visitsForDay[companyName] = (visitsForDay[companyName] || 0) + 1;
              totalVisitsByCompany[companyName] = (totalVisitsByCompany[companyName] || 0) + 1;
            }
          });
      
          companyVisitsByDay[formattedTargetDay] = visitsForDay;
        }
        // Now you can transform the data for charting (if needed)
        console.log(totalVisitsByCompany);
        setCompaniesTotalVisits(totalVisitsByCompany);
        const keysArray = Object.keys(totalVisitsByCompany).map(key => key.toString());
        const datasets =[{
            label: `Total number of Visits by Company`,
            data: totalVisitsByCompany,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }];
      
        setVisualCompanyData({
          keysArray,
          datasets,
        });
      };
    return (
        <div>
        <div className={classes.site}>
            <h1>Site: {url[0]?.Adress || id}</h1>
            <div className={classes.content}>
                <div className={classes.graphes}>
                    { visualData ?
                        <Line className={classes.graphbox} options={options} data={visualData} /> : <Line className={classes.graphbox} options={options} />
                    }
                    { visualCompanyData ?
                        <Bar className={classes.graphbox} options={options} data={visualCompanyData} /> : <Bar className={classes.graphbox} options={options} />
                    }
                    <div className={classes.table} >
                        <h2>Companies Total visits</h2>
                        <Table striped bordered hover>
                            <thead id="head">
                                <th>Company</th>
                                <th>Count</th>
                            </thead>
                            <tbody id="body">
                                {companiesTotalVisits ? Object.keys(companiesTotalVisits).map(key => {
                                    return (
                                        <tr key={key}>
                                            <td>{key}</td>
                                            <td>{companiesTotalVisits[key]}</td>
                                        </tr>
                                    )
                                }) : <p>Loading...</p>}
                            </tbody>
                        </Table>
                    </div>
                </div>
                <div className={classes.card}>
                    <h2>Data used to calculate visits</h2>
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
                        <div className={classes.buttons}>
                            <Button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                            <Button onClick={() => setPage(page + 1)} disabled={data?.clientData.length <= page * pagesize}>Next</Button>
                        </div>
                    </div>
                        <Form.Group>
                            <Form.Label>Search</Form.Label>
                                <AsyncTypeahead
                                filterBy={filterBy}
                                id="async-example"
                                isLoading={isLoading}
                                labelKey="Name"
                                minLength={1}
                                onSearch={handleSearch}
                                onChange={handleSelection}
                                options={searchOptions}
                                placeholder="Search for a company..."
                                selected={singleSelections}
                                renderMenuItemChildren={(option) => (
                                    <span>{option.Name}</span>
                                )}
                            />
                        </Form.Group>
                    <p className={classes.pages}>
                        pages {page}/{data ? Math.ceil(data?.clientData.length / pagesize) : 1}
                    </p>
                    <Table striped bordered hover>
                        <thead id="head">
                            <th>#</th>
                            <th>Company</th>
                            <th>TimeStamp</th>
                        </thead>
                        <tbody id="body">
                            {data ? data?.clientData.map((item, index) => {
                                if (index >= (page - 1) * pagesize && index < page * pagesize)
                                return (
                                    <tr key={item.ID}>
                                        <td>{index + 1}</td>
                                        <td>{item.Company.Name}</td>
                                        <td>{new Date(item.TimeStamp).toLocaleString()}</td>
                                    </tr>
                                )
                            }) : <p>Loading...</p>}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Site
