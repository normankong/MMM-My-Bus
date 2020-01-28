# MMM-My-Bus
Magic Mirror Module for My Bus

`Inspired by https://github.com/winstonma/MMM-HK-KMB`

### To use the module

- Download from this repo into MagicMirror/modules

```git clone https://github.com/normankong/MMM-My-Bus.git```

- Install the npm dependencies

```npm install```

- Update the config.js
```js
	{
        module: 'MMM-My-Bus',
        disabled : false,
        position: 'top_left',
        config: {
            stops: [
                {
                    time : ["07:45", "08:30"],
                    bsiCode: 'CA07-S-2900-0',	
                    busRoutes : ["67X"],  
                    busBound: "1",
                    reloadInterval: 180000,
                },
                {
                    time : ["07:45", "08:30"],
                    bsiCode: 'TU02-S-1000-0',	
                    busRoutes : ["260X", "63X"],  
                    busBound: "1",
                    reloadInterval: 180000,
                }
            ]
        }
    }
```

- Create .env in root directory
```
ETA_URL=https://your_api.url
ETA_IDENTIFY=Token identifier
ETA_JWT=JWT Token
ETA_API_KEY=API Key
```

### Disclaimer
- You need to implement the bus estimated time arrival API by yourself.
- I have decoupled the setting into .env that was not in this repo.

