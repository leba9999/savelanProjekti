import { useEffect } from "react";
import {useParams} from "react-router-dom";
import { getListOfCompanies } from "../utils/DataFetch";
import { useState, useRef } from "react";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import { Link } from 'react-router-dom';
import { autocompleteCompanies } from "../utils/DataFetch";
import { Form } from "react-bootstrap";
import { AsyncTypeahead } from 'react-bootstrap-typeahead';



const CompaniesDataTable = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const [singleSelections, setSingleSelections] = useState([]);
    
    const [page, setPage] = useState(1);
    const [pagesize, setPagesize] = useState(50);
    const [data, setData] = useState(null);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        getListOfCompanies(page, pagesize).then((response) => {
        if (response.ok) {
            response.json().then((json) => {
                setData(json);
                console.log(page);
                setCompanies(json.companies);
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
    
  const handleSearch = (query) => {
    setIsLoading(true);
    console.log("handleSearch");
    autocompleteCompanies(query)
      .then((response)=> {
        if (response.ok) {
            response.json().then((json) => {
            setOptions(json);
            console.log(json);
            setIsLoading(false);
            });
        }
      });
  };
  const filterBy = () => true;
  const handleSelect=(e)=>{
      console.log(e);
      setPagesize(e);
  }
  const handleSelection=(e)=>{
    console.log(e);
    console.log(data);
      setSingleSelections(e);
      setCompanies(e);
  }
    console.log(singleSelections);
    return (
    <>
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
                options={options}
                placeholder="Search for a company..."
                selected={singleSelections}
                renderMenuItemChildren={(option) => (
                    <span>{option.Name}</span>
                )}
            />
        </Form.Group>
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
                    <th>Company</th>
                </tr>
            </thead>
            <tbody id="body">
                {data ? companies.map((item) => {
                return (
                    <tr key={item.ID} onClick={ () => console.log(item.ID)}>
                        <td>
                            <Link to={`/company/${item.ID}`}>{item.Name}</Link>
                        </td>
                    </tr>
                )
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

export default CompaniesDataTable
