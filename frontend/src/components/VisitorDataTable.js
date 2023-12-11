import {fetchDataPage} from '../utils/DataFetch'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react'

const VisitorDataTable = () => {
    const [page, setPage] = useState(1);
    const [pagesize, setPagesize] = useState(50);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDataPage(page, pagesize).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    setData(json);
                    console.log(page);
                    if (json.totalPages < page) {
                        console.log(json.totalPages < page);
                        console.log(json.totapages);
                        console.log(page);
                        setPage(json.totalPages);
                    }
                });
            }
        }).catch((error) => {
            console.log(error);
        });
    }, [page, pagesize]);
    
    const handleSelect=(e)=>{
        console.log(e);
        setPagesize(e);
    }
    return (
        <>
            <div>
                page: {page}/{data ? data.totalPages : 1}
                <Button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                <Button onClick={() => setPage(page + 1)} disabled={data && page >= data.totalPages}>Next</Button>
                <DropdownButton as={ButtonGroup} title={pagesize} id="bg-nested-dropdown" onSelect={handleSelect}>
                    <Dropdown.Item eventKey="20">20</Dropdown.Item>
                    <Dropdown.Item eventKey="50">50</Dropdown.Item>
                    <Dropdown.Item eventKey="100">100</Dropdown.Item>
                    <Dropdown.Item eventKey="200">200</Dropdown.Item>
                    <Dropdown.Item eventKey="500">500</Dropdown.Item>
                </DropdownButton>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Data id</th>
                        <th>Company id</th>
                        <th>IP address</th>
                        <th>Company nimi</th>
                        <th>Visited site id</th>
                        <th>Visited site</th>
                        <th>Referrer site id</th>
                        <th>Referrer site</th>
                        <th>TimeStamp</th>
                        <th>User-Agent</th>
                    </tr>
                </thead>
                <tbody id="body">
                    {data ? data.clientData.map((item) => {
                        return (
                            <tr key={item.ID} onClick={() => console.log(item.ID)}>
                                <td>{item.ID}</td>
                                <td>{item.Company.ID}</td>
                                <td>{item.Company.IP}</td>
                                <td> <Link to={`/company/${item.Company.ID}`}>
                                    {item.Company.Name}
                                </Link> </td>
                                <td>{item.CurrentPage.ID}</td>
                                <td> <Link to={`/site/${item.CurrentPage.ID}`}> {item.CurrentPage.Address}</Link></td>
                                <td>{item.SourcePage.ID}</td>
                                <td>{item.SourcePage.Address}</td>
                                <td>{new Date(item.TimeStamp).toLocaleString()}</td>
                                <td>{item.UserAgent}</td>
                            </tr>
                        );
                    }) : <p>Loading...</p>}
                </tbody>
            </Table>
            <div>
                <Button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                <Button onClick={() => setPage(page + 1)} disabled={data && page >= data.totalPages}>Next</Button>
                <DropdownButton as={ButtonGroup} title={pagesize} id="bg-nested-dropdown" onSelect={handleSelect}>
                    <Dropdown.Item eventKey="20">20</Dropdown.Item>
                    <Dropdown.Item eventKey="50">50</Dropdown.Item>
                    <Dropdown.Item eventKey="100">100</Dropdown.Item>
                    <Dropdown.Item eventKey="200">200</Dropdown.Item>
                    <Dropdown.Item eventKey="500">500</Dropdown.Item>
                </DropdownButton>
            </div>
        </>
    )
}

export default VisitorDataTable