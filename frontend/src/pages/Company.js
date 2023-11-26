import { useEffect } from "react";
import {useParams} from "react-router-dom";
import { getCompanyData } from "../utils/DataFetch";

const Company = () => {
    const { id } = useParams()
    console.log(id);
    useEffect(() => {
        getCompanyData(id).then((response) => 
        {
            if (response.ok) {
                response.json().then((json) => {
                    console.log(json);
                });
            }
        }).catch((error) => {
            console.log(error);
        });
    }, []);
    return (
        <div>
            <h1>Company</h1>
        </div>
    )
}

export default Company
