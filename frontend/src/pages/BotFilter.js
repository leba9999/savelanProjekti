import Button from "react-bootstrap/esm/Button";
import { addBot, deleteBot, getBotList } from "../utils/DataFetch";
import React, { useEffect, useState } from 'react'
import { useRef } from "react";

const BotFilter = () => {
    const [data, setData] = useState(null);
    const botnameRef = useRef();

    useEffect(() => {
        getBotList().then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    setData(json.botList);
                    console.log(json.botList);
                });
            }
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    const handleDelete=(name)=>{
        console.log(name);
        deleteBot(name).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    console.log(json);
                });
                setData(data.filter((item)=>item!==name));
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    const handleAdd=()=>{
        console.log(botnameRef.current.value);
        const newBot = botnameRef.current.value;
        addBot(newBot).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    console.log(json);
                });
                setData([...data, newBot]);
            }
        }).catch((error) => {
            console.log(error);
        });
        botnameRef.current.value="";
    }

    return (
        <div>
            <h1>Bot Filter</h1>
            <table>
                <thead id="head">
                    <th>Name</th>
                </thead>
                <tbody id="body">
                    {data ? data.map((item) => {
                        return (
                            <tr key={item}>
                                <td>{item}</td>
                                <td><Button size="sm" variant="danger" onClick={()=>handleDelete(item)}>Delete</Button></td>
                            </tr>
                        )
                    }) : <tr><td>No data</td></tr>}
                </tbody>
            </table>
            <input type="text" id="newBot" placeholder="Add bot..." ref={botnameRef}></input> <Button onClick={handleAdd}>Add</Button>
        </div>
    )
}

export default BotFilter
