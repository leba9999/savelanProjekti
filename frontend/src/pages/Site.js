import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getURLData, getURL } from '../utils/DataFetch';
import { daysBetweenDates } from '../utils/Helpers';
import classes from './Site.module.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Typeahead } from 'react-bootstrap-typeahead';
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
        text: '',
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
    const [multiSelections, setMultiSelections] = useState([]);
    const [visualData, setVisualData] = useState(null);
    
    const [numberofVisitorsData, setNumberofVisitorsData] = useState({
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
                    
                    let companies = [];
                    json.clientData.forEach((item) => {
                        // add if not already in array based on company.id
                        if (!companies.some((company) => company.ID === item.Company.ID)) {
                            companies.push(item.Company);
                        }
                    });
                    setSearchOptions(companies);
                });
            }
        }).catch((error) => {
            console.log(error);
        });
        getURL(id).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    setURL(json);
                });
            }
        }).catch((error) => {
            console.log(error);
        }
        );

    }, [todatePicker, fromdatePicker]);

    useEffect(() => {
        if (multiSelections.length > 0) {
            const filteredData = data.clientData.filter((item) => {
                return multiSelections.some((company) => company.ID === item.Company.ID);
            });
            setVisualData({ clientData: filteredData });
            countEntries(filteredData);
            countCompaniesEntries(filteredData);
        } else if (data) {
            setVisualData(data);
            countEntries(data?.clientData);
            countCompaniesEntries(data?.clientData);
        }
    }, [multiSelections, data]);


    const handleSelection=(e)=>{
        setMultiSelections(e);
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
        const keysArray = Object.keys(entriesCountByDay).map(key => key.toString());
        setNumberofVisitorsData({
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
        const totalVisitsByCompany = {};
        const visualDataCount = {};
        data.forEach((item) => {
            if (totalVisitsByCompany[item.Company.Name]) {
                totalVisitsByCompany[item.Company.Name].count++;
                visualDataCount[item.Company.Name]++;
            } else {
                visualDataCount[item.Company.Name] = 1;
                totalVisitsByCompany[item.Company.Name] = {};
                totalVisitsByCompany[item.Company.Name].count = 1;
                totalVisitsByCompany[item.Company.Name].id = item.Company.ID;
            }
        });

        // Now you can transform the data for charting (if needed)
        setCompaniesTotalVisits(totalVisitsByCompany);
        const keysArray = Object.keys(totalVisitsByCompany).map(key => key.toString());
        const datasets =[{
            label: `Total number of Visits by Company`,
            data: visualDataCount,
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
            <h1>Site: {url[0]?.Address || id}</h1>
            <div className={classes.content}>
                <div className={classes.graphes}>
                    { numberofVisitorsData ?
                        <Line className={classes.graphbox} options={options} data={numberofVisitorsData} /> : <Line className={classes.graphbox} options={options} />
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
                                            <td><Link to={`/company/${companiesTotalVisits[key].id}`}>{key}</Link></td>
                                            <td>{companiesTotalVisits[key].count}</td>
                                        </tr>
                                    )
                                }) : <p>Loading...</p>}
                            </tbody>
                        </Table>
                    </div>
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
                        <div className={classes.buttons}>
                            <Button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                            <Button onClick={() => setPage(page + 1)} disabled={visualData?.clientData.length <= page * pagesize}>Next</Button>
                        </div>
                    </div>
                        <Form.Group className={classes.filter}>
                            <Form.Label>Filter:</Form.Label>
                                <Typeahead className={classes.filter}
                                id="basic-typeahead-multiple"
                                name="filter"
                                multiple
                                labelKey="Name"
                                minLength={1}
                                onChange={handleSelection}
                                options={searchOptions}
                                placeholder="Filter by a company"
                                selected={multiSelections}
                                renderMenuItemChildren={(option) => (
                                    <span>{option.Name}</span>
                                )}
                            />
                        </Form.Group>
                    <p className={classes.pages}>
                        pages {page}/{visualData ? Math.ceil(visualData?.clientData.length / pagesize) : 1}
                    </p>
                    <Table striped bordered hover>
                        <thead id="head">
                            <th>#</th>
                            <th>Company</th>
                            <th>TimeStamp</th>
                        </thead>
                        <tbody id="body">
                            {visualData ? visualData?.clientData.map((item, index) => {
                                if (index >= (page - 1) * pagesize && index < page * pagesize)
                                return (
                                    <tr key={item.ID}>
                                        <td>{index + 1}</td>
                                        <td> <Link to={`/company/${item.Company.ID}`}>{item.Company.Name}</Link> </td>
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
