import {BrowserRouter, Route, Routes} from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Company from "../pages/Company";
import Data from "../pages/Data";
import BotFilter from "../pages/BotFilter";
import Url from "../pages/Site";


const Router = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}>
                    <Route index element={<Home/>}/>
                    <Route path={"/company/:id"} element={<Company/>}/>
                    <Route path={"/site/:id"} element={<Url/>}/>
                    <Route path={"/data"} element={<Data/>}/>
                    <Route path={"/botfilter"} element={<BotFilter/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default Router
