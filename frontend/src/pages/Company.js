import React, { useState, useEffect } from 'react';
import {Link, useParams} from "react-router-dom";
import { getCompanyData, getCompany } from "../utils/DataFetch";
import classes from './Company.module.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Typeahead } from 'react-bootstrap-typeahead';
import { daysBetweenDates } from '../utils/Helpers';

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

const Company = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [company, setCompany] = useState(null);
    const [siteTotalVisits, setSiteTotalVisits] = useState(null);

    const [page, setPage] = useState(1);
    const [pagesize, setPagesize] = useState(15);
    const [todatePicker, setToDatePicker] = useState(new Date().toISOString().split('T')[0]);
    let date = new Date();
    date.setDate(date.getDate() - 30);
    const [fromdatePicker, setFromDatePicker] = useState(date.toISOString().split('T')[0]);
    const [searchOptions, setSearchOptions] = useState([]);
    const [multiSelections, setMultiSelections] = useState([]);
    const [visualData, setVisualData] = useState(null);

    const [numberofSiteVisits, setNumberofSiteVisits] = useState({
        datasets: [
            {
                label: 'Total visits in sites',
                data: [],
                borderColor: 'rgb(0, 0, 132)',
                backgroundColor: 'rgba(0, 0, 132, 0.5)',
            }
        ],
    });
    const [eachDayVisit, setEachDayVisit] = useState({
        datasets: [
            {
                label: 'Number of site visits per day',
                data: [],
                borderColor: 'rgb(0, 0, 132)',
                backgroundColor: 'rgba(0, 0, 132, 0.5)',
            }
        ],
    });
    useEffect(() => {
        getCompany(id).then((response) => 
        {
            if (response.ok) {
                response.json().then((json) => {
                    setCompany(json);
                });
            }
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    useEffect(() => {
        const fromDate = new Date(fromdatePicker);
        const toDate = new Date(todatePicker);
        toDate.setHours(23, 59, 59, 999);
        getCompanyData(id, toDate.toISOString(), fromDate.toISOString()).then((response) => 
        {
            if (response.ok) {
                response.json().then((json) => {
                    console.log(json);
                    setData(json);
                    const options = [] 
                    json.clientData.map((item) => {
                        if (!options.some((option) => option.ID === item.CurrentPage.ID)) {
                            options.push(item.CurrentPage);
                        }
                    });
                    console.log(options);
                    setSearchOptions(options);
                });
            }
        }).catch((error) => {
            console.log(error);
        });
    }, [todatePicker, fromdatePicker]);

    useEffect(() => {
        if (multiSelections.length > 0) {
            const filteredData = data.clientData.filter((item) => {
                return multiSelections.some((CurrentPage) => CurrentPage.ID === item.CurrentPage.ID);
            });
            setVisualData({ clientData: filteredData });
            countAllSiteVisits(filteredData);
            countVisitsForEachDay(filteredData);
        } else if (data) {
            setVisualData(data);
            countAllSiteVisits(data?.clientData);
            countVisitsForEachDay(data?.clientData);
        }
    }, [multiSelections, data]);

    const countVisitsForEachDay = (data) => {
        const fromDate = new Date(fromdatePicker);
        const toDate = new Date(todatePicker);
        toDate.setHours(23, 59, 59, 999);
        const days = {};
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
          days[formattedTargetDay] = entriesForDay.length;
        }
        const keysArray = Object.keys(days).map(key => key.toString());
        setEachDayVisit({
            keysArray,
            datasets: [
                {
                    label: 'Number of site visits per day',
                    data: days,
                    borderColor: 'rgb(0, 0, 132)',
                    backgroundColor: 'rgba(0, 0, 132, 0.5)',
                }
            ],
        });
    };

    const countAllSiteVisits = (data) => {
        const sites = {};
        const visualDataCount = {};
        data.forEach((item) => {
            if (sites[item.CurrentPage.Adress]) {
                sites[item.CurrentPage.Adress].count++;
                visualDataCount[item.CurrentPage.Adress]++;
            } else {
                visualDataCount[item.CurrentPage.Adress] = 1;
                sites[item.CurrentPage.Adress] = {};
                sites[item.CurrentPage.Adress].count = 1;
                sites[item.CurrentPage.Adress].id = item.CurrentPage.ID;
            }
        });
        setSiteTotalVisits(sites);
        const keysArray = Object.keys(sites).map(key => key.toString());
        setNumberofSiteVisits({
            keysArray,
            datasets: [
                {
                    label: 'Total visits in sites',
                    data: visualDataCount,
                    borderColor: 'rgb(0, 0, 132)',
                    backgroundColor: 'rgba(0, 0, 132, 0.5)',
                }
            ],
        });
    };

    const handleSelection=(e)=>{
        setMultiSelections(e);
    }
    return ( 
        <div>
            <div className={classes.site}>
                <h1>{ company ? company?.Name : ''}</h1>
                <div className={classes.content}>
                    <div className={classes.graphes}>
                        { eachDayVisit ?
                            <Line className={classes.graphbox} options={options} data={eachDayVisit} /> : <Line className={classes.graphbox} options={options} />
                        }
                        { numberofSiteVisits ?
                            <Bar className={classes.graphbox} options={options} data={numberofSiteVisits} /> : <Bar className={classes.graphbox} options={options} />
                        }
                        <div className={classes.table} >
                            <h2>Total visits in sites:</h2>
                            <Table striped bordered hover>
                            <thead id="head">
                                <th>Site</th>
                                <th>Count</th>
                            </thead>
                            <tbody id="body">
                                {siteTotalVisits ? Object.keys(siteTotalVisits).map(key => {
                                    return (
                                        <tr key={key}>
                                            <td><Link to={`/site/${siteTotalVisits[key].id}`}>{key}</Link></td>
                                            <td>{siteTotalVisits[key].count}</td>
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
                                labelKey="Adress"
                                minLength={1}
                                onChange={handleSelection}
                                options={searchOptions}
                                placeholder="Filter by a site"
                                selected={multiSelections}
                                renderMenuItemChildren={(option) => (
                                    <span>{option.Adress}</span>
                                )}
                            />
                        </Form.Group>
                        <p className={classes.pages}>
                            pages {page}/{visualData ? Math.ceil(visualData?.clientData.length / pagesize) : 1}
                        </p>
                        <Table striped bordered hover>
                            <thead id="head">
                                <th>#</th>
                                <th>Site</th>
                                <th>TimeStamp</th>
                            </thead>
                            <tbody id="body">
                                {visualData ? visualData?.clientData.map((item, index) => {
                                    if (index >= (page - 1) * pagesize && index < page * pagesize)
                                    return (
                                        <tr key={item.ID}>
                                            <td>{index + 1}</td>
                                            <td><Link to={`/site/${item?.CurrentPage?.ID}`}>{item?.CurrentPage?.Adress}</Link> </td>
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

export default Company
