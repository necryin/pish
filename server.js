var http = require("http") ,
    config = require("./config") ,
    logger = require("./logger") ,
    Player = require("./player") ,
    Queue = require("./queue") ,
    vk = require("./vkontakte-api") ,
    mongoose = require('mongoose') ,
    qs = require('querystring');

//     Первичное наполнение базы

//var names = ["Vasia", "Petya", "Olya", "Cat"];
//for(var i=0; i<4000; ++i) {
//    var newb = new Player({
//        vk_id: i,
//        first_name: names[Math.floor(Math.random() * names.length)]
//    });
//
//    newb.save(function(err) {
//        if (err) return logger.log(err);
//    });
//}

// Connect mongoose
mongoose.connect(config.mongo_db_url + config.mongo_db_name, function (err, res) {
    if (err) {
        logger.log('ERROR connecting to: ' + config.mongo_db_name + '. ' + err);
    } else {
        logger.log('Success connect to: ' + config.mongo_db_name);
    }
});

// в идеале этим должен заниматься отдельный инстантс (лучше всего rabbitmq, beanstalk)
setInterval(function () {
    Queue.findOne({}, {}, { sort: { 'created_at' : 1 } }, function(err, job) {
        if (err) logger.log('queue findOne error: ' + err);
        if (job) {
            logger.log("job");
             vk.sendNotification(job.ids, job.text, function (err) {
                if (err) logger.log('fail to send notifications: ' + err);
                logger.flog("SENDED: " + job.ids + "   -   " + job.text);
                job.remove();
            });
        }
    });
}, config.api_delay);

http.createServer(function (request, response) {
    if (request.url === "/send" && request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
            if (body.length > 131072) //128kb
                request.connection.destroy();
        });
        request.on('end', function () {
            var post = qs.parse(body);
            if (!post.template) {
                response.writeHead(400, {"Content-Type": "text/plain"});
                return;
            }
            var chunk = [], tpl = '', q = {};
            Player.aggregate({ $match: {} }, { $group: {
                _id: "$first_name",
                ids: { $push: "$vk_id" }
            }}, function (err, res) {
                res.forEach(function (unit) {
                    while (unit.ids.length) {
                        tpl = post.template.replace("%name%", unit._id);
                        chunk = unit.ids.splice(0, config.max_ids);
                        q = new Queue({ ids : chunk.join(","), text: tpl });
                        q.save(function(err) {
                            if (err) return logger.log(err);
                        });
                    }
                })
            });
        });
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
    }
    response.end();
}).listen(8000);
