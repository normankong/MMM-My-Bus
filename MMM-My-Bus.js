// const moment = require("moment");

/* Magic Mirror
 * Module: MMM-My-Bus
 *
 * By Norman Kong
 * MIT Licensed.
 * 
 * v1.0.0
 */

Module.register("MMM-My-Bus", {

    defaults: {
        stops: [{
            time: ["07:45", "08:10"],
            bsiCode: 'CA07-S-2900-0',
            busRoutes: ["67X"],
            busBound: "1",
        }]
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            "zh-tw": "translations/zh.json"
        };
    },

    getStyles: function () {
        return ["MMM-My-Bus.css"];
    },

    start: function () {
        var self = this;
        Log.info("Starting module: " + this.name);

        // Collect the stop info (including the routes that the stop)
        this.etaItems = [];
        this.activeItem = 0;

        this.sendSocketNotification("ADD_STOPS", {
            config: this.config.stops
        });
    },

    notificationReceived: function (notification, payload, sender) {
        if (notification === "CLOCK_MINUTE") {
            this.updateDom();
        }
    },

    socketNotificationReceived: function (notification, payload) {
        console.log(`Receive `, payload);
        if (notification === "ETA_ITEMS") {

            // The feed itself contains all the ETAs
            this.etaItems = payload.etaItems.sort(function (a, b) {
                if (a.data.route.Route > b.data.route.Route)
                    return -1;
                if (a.data.route.Route < b.data.route.Route)
                    return 1;
                return 1;
            });
            this.updateDom();
        }
    },

    /* subscribedToFeed(feedUrl)
     * Check if this module is configured to show this feed.
     *
     * attribute feedUrl string - Url of the feed to check.
     *
     * returns bool
     */
    subscribedToFeed: function (feedUrl) {
        for (var f in this.config.ETAs) {
            var feed = this.config.ETAs[f];
            if (feed.url === feedUrl) {
                return true;
            }
        }
        return false;
    },

    /* subscribedToFeed(feedUrl)
     * Returns title for a specific feed Url.
     *
     * attribute feedUrl string - Url of the feed to check.
     *
     * returns string
     */
    titleForFeed: function (feedUrl) {
        for (var f in this.config.ETAs) {
            var feed = this.config.ETAs[f];
            if (feed.url === feedUrl) {
                return feed.title || "";
            }
        }
        return "";
    },

    getDom: function () {

        var wrapper = document.createElement("div");

        if (this.activeItem >= this.etaItems.length) {
            this.activeItem = 0;
        }

        // Actually it is a new redraw
        if (this.etaItems === null) {
            wrapper.innerHTML = this.translate("LOADING");
            wrapper.className = "small dimmed";
            return wrapper;
        }

        var header = document.createElement("header");
        header.innerHTML = this.translate("BUS_INFO");
        wrapper.appendChild(header);

        // Start creating connections table
        var table = document.createElement("table");
        table.classList.add("small", "table");
        table.border = '0';

        table.appendChild(this.createLabelRow());

        table.appendChild(this.createSpacerRow());

        var row = 0;
        for (t in this.etaItems) {
            var etaObj = this.etaItems[t];
            if (etaObj.type == "DUMMY") continue;
            data = this.createDataRow(etaObj);
            if (!data)
                continue;
            table.appendChild(data);
            row++
        }

        if (row == 0) {
            wrapper.innerHTML = ""
            wrapper.className = "small dimmed";
            return wrapper;
        }

        wrapper.appendChild(table);

        return wrapper;
    },

    createLabelRow: function () {
        var labelRow = document.createElement("tr");
        labelRow.className = "headRow";

        var lineLabel = document.createElement("th");
        lineLabel.className = "line";
        lineLabel.innerHTML = this.translate("LINE");
        labelRow.appendChild(lineLabel);

        var destinationLabel = document.createElement("th");
        destinationLabel.className = "destination";
        destinationLabel.innerHTML = this.translate("DESTINATION");
        labelRow.appendChild(destinationLabel);

        var departureLabel = document.createElement("th");
        departureLabel.className = "departure";
        departureLabel.innerHTML = this.translate("DEPARTURE");
        labelRow.appendChild(departureLabel);

        return labelRow;
    },

    createSpacerRow: function () {
        var spacerRow = document.createElement("tr");

        var spacerHeader = document.createElement("th");
        spacerHeader.className = "spacerRow";
        spacerHeader.setAttribute("colSpan", "3");
        spacerHeader.innerHTML = "";
        spacerRow.appendChild(spacerHeader);

        return spacerRow;
    },

    createDataRow: function (routeObj) {
        if (!routeObj || routeObj.length == 0)
            return null;

        var row = document.createElement("tr");
        row.className = "dataRow";

        var line = document.createElement("td");
        line.className = "line";
        line.innerHTML = routeObj.data.route.Route;
        row.appendChild(line);

        var destination = document.createElement("td");
        destination.className = "destination";
        destination.innerHTML = routeObj.data.basicInfo.DestCName;
        row.appendChild(destination);

        if (routeObj.data.raw.data.response == null) {
            var departure = document.createElement("td");
            departure.className = "departure";
            departure.innerHTML = this.translate("LAST_BUS_DEPART");
            row.appendChild(departure);
            return row;
        }

        let now = moment();
        etaInfo = routeObj.data.raw.data.response;
        if (etaInfo.length > 0) {
            var departure = document.createElement("td");
            departure.className = "departure";
            etaArray = [];
            for (r in etaInfo) {
                var etaStr = etaInfo[r].t.split('　')[0];;
                let etaTime = moment(etaStr, "hh:mm:ss");
                let text = moment.duration(now.diff(etaTime)).humanize().replace(" ", "");
                etaArray.push(text);

                if (r == 1) break;
            }
            departure.innerHTML = etaArray.toString();
            row.appendChild(departure);
        }

        return row;
    }

});