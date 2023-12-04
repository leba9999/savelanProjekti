import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import classes from './Data.module.css';

import React, { useState } from 'react';

import VisitorDataTable from '../components/VisitorDataTable';
import CompaniesDataTable from '../components/CompaniesDataTable';
import SitesDataTable from '../components/SitesDataTable';

const Data = () => {

    const [showVisitData, setShowVisitData] = useState(false);

    const handleSelection=(e)=>{
        console.log(e);
        if(e==="client_data"){
            setShowVisitData(true); 
        } else {
            setShowVisitData(false); 
        }
    }

    return (
        <div className={showVisitData ? classes.bigsite : classes.site }>
            <div className={classes.card}>
                <h1>Data</h1>
                <Tabs
                defaultActiveKey="sites"
                id="uncontrolled-tab-example"
                className="mb-3"
                onSelect={handleSelection}
                >
                    <Tab eventKey="sites" title="Sites">
                        <p>
                            Select page to view data.
                        </p>
                        <SitesDataTable/>
                    </Tab>
                    <Tab eventKey="companies" title="Companies">
                        <p>
                            Select company to view related data.
                        </p>
                        <CompaniesDataTable/>
                    </Tab>
                    <Tab eventKey="client_data" title="Visit Data">
                        <p>
                            All the data from the database.
                        </p>
                        <VisitorDataTable/>
                    </Tab>
                </Tabs>
                
            </div>
        </div>
    )
}

export default Data
