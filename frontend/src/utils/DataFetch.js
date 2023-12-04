
const fetchDataPage = async (page, size) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/data?page=${page}&pagesize=${size}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
// #region Company data
const getCompany = async (id) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/company?id=${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
const getCompanyData = async (id, toDate, fromDate) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/data?companyid=${id}&fromDate=${fromDate}&toDate=${toDate}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
const getListOfCompanies = async (page, size) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/companies?page=${page}&pagesize=${size}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
const autocompleteCompanies = async (name) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/company/autocomplete?name=${name}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
// #region bot filter
const getBotList = async () => {
    return await fetch(`http://127.0.0.1:3000/api/v1/botData`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
const deleteBot = async (name) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/botData`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({toBeDeleted:name})
    })
}
const addBot = async (name) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/botData`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({newBot:name})
    })
}
// #region ulr
const getListOfURLs = async (page, size) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/urls?page=${page}&pagesize=${size}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
const getURL = async (id) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/url?id=${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
const getURLData = async (id, toDate, fromDate) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/data?currenturlid=${id}&fromDate=${fromDate}&toDate=${toDate}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}
const autocompleteURLs = async (adress) => {
    return await fetch(`http://127.0.0.1:3000/api/v1/url/autocomplete?adress=${adress}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
}

export {fetchDataPage, getBotList, deleteBot, addBot, getCompany, getCompanyData, getListOfCompanies, autocompleteCompanies, getListOfURLs, getURL, getURLData, autocompleteURLs}
