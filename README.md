# Inno Save LAN tracker

This repository contains Save LAN tracker plugin and backend for it. Plugin sends data of each visiting client to the backend for data processing and storing. We store data to the SQL database after we have analyzed and processed it.

## Save LAN tracker Plugin

Save LAN tracker Plugin is plugin for wordpress it tracks which sites clients visits and sends data to the backend for processing it.

### Installation to wordpress

Installing the plugin to your wordpress copy `inno-savelan-tracker` folder to your `..\wp-content\plugins` folder.

Figurative folder structure:

```
|-- wp-content
    |-- plugins
        |-- inno-savelan-tracker
            |-- include
            |-- index.php
            |-- inno-savelan-tracker.php
```

then head to your wordpress plugin page and activate the `Inno Save LAN Tracker`. After that you have to configurate backend address to your current backend.

## Save LAN tracker Backend

Backend is responsible to save and show data to/from database. Plugin sends data to backend and backend filters and processes it.

### Routes

Backend has multiple endpoints, here is all the possible endpoints and parameters.

| Request method | Route                          | Body required | Parameters (?page=2)                                                                           |
| -------------- | ------------------------------ | ------------- | ---------------------------------------------------------------------------------------------- |
| `GET`          | `/api/v1/data`                 | `False`       | `page, pageSize, fromDate, toDate, companyName, companyId, url, id, currentURLId, sourceURLId` |
| `POST`         | `/api/v1/data`                 | `True`        |                                                                                                |
| `GET`          | `/api/v1/company`              | `False`       | `id`                                                                                           |
| `GET`          | `/api/v1/company/autocomplete` | `False`       | `name`                                                                                         |
| `GET`          | `/api/v1/url`                  | `False`       | `id`                                                                                           |
| `GET`          | `/api/v1/urls`                 | `False`       | `page, pageSize`                                                                               |
| `GET`          | `/api/v1/url/autocomplete`     | `False`       | `address`                                                                                      |
| `GET`          | `/api/v1/botData`              | `False`       |                                                                                                |
| `POST`         | `/api/v1/botData`              | `True`        |                                                                                                |
| `delete`       | `/api/v1/botData`              | `True`        |                                                                                                |

`POST` `/api/v1/data` Body content example:

```JSON
{
  "ip" : "177.146.244.143",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 OPR/103.0.0.04",
  "timestamp": "2023-12-01 16:58:36",
  "url": "http://savelan.fi/blogi2",
  "referrer": "https://savelan.fi/testpage"
}
```

`POST` `/api/v1/botData` Body content example:

```JSON
{
  "newBot" : "googlebot"
}
```

`DELETE` `/api/v1/botData` Body content example:

```JSON
{
  "toBeDeleted" : "googlebot"
}
```

### Development Installation and start

Download project and then open terminal inside `.../WP-plugin/backend/` folder. Then run command `npm install`.
This installs all the backend dependencies.

Powershell example with path:

```powershell
PS C:\Projects\WP-plugari\backend> npm install
```

Aftrer dependencies installation check `.env` file inside `.../WP-plugin/backend/` folder has your own correct SQL database settings.

Then run command `npm run dev` inside `.../WP-plugin/backend/` folder and the backend should start in port 3000. This port also can be changed inside `.env` if needed.

```powershell
PS C:\Projects\WP-plugari\backend> npm run dev

> inno-savelan-backend@1.0.0 dev
> nodemon src/index.ts

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node src/index.ts`
[14.12.2023 12.28.32][info] : Listening: http://localhost:3000
[14.12.2023 12.28.33][info] : Data source has been initialized
```

## Save LAN tracker Frontend

Frontend is responsible to show data from backend. It is made with React and Javascript.

### Development Installation and start

Download project and then open terminal inside `.../WP-plugin/frontend/` folder. Then run command `npm install`.
This installs all the frontend dependencies.

Powershell example with path:

```powershell
PS C:\Projects\WP-plugari\frontend> npm install
```

Then run command `npm run start` inside `.../WP-plugin/frontend` folder and the frontend trys to open in port 3000, but our backend is in that port so React asks:

```powershell
? Something is already running on port 3000.

Would you like to run the app on another port instead? » (Y/n)
```

Say Y, then our frontend starts in Port 3001.
