var fs = require("fs");

var logger = {
    logfile: "player_log.txt",

    log: function (msg) {
        var d = new Date();
        console.log(d.getDate() + "." + d.getMonth() + "." + d.getFullYear() +
            " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " " + msg);
    },

    flog: function (msg) {
        var d = new Date();
        var send = d.getDate() + "." + d.getMonth() + "." + d.getFullYear() +
            " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " " + msg + "\r\n";
        fs.appendFile(this.logfile, send, function(err) {
            if (err) this.log("flog error:", err);
        });
    }
};

module.exports = logger;
