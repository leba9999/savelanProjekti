
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import VisitorDataTable from '../components/VisitorDataTable';
import CompaniesDataTable from '../components/CompaniesDataTable';
import SitesDataTable from '../components/SitesDataTable';

const Data = () => {

    return (
        <div>
            <h1>Data</h1>
            <Tabs
            defaultActiveKey="sites"
            id="uncontrolled-tab-example"
            className="mb-3"
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
    )
}

export default Data
