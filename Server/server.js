const http = require("http");
const fs = require("fs");
const Datastore = require('nedb');
var formidable = require("formidable");
const dbJS = require(__dirname + "/dbJS.js")

var mainBase = new Datastore({
    filename: 'db/playlist.db',
    autoload: true
});

var extToContent = {
    css: "text/css",
    html: "text/html",
    js: "application/json",
    ico: "image/x-icon",
    jpg: "image/jpeg",
    gif: "image/gif",
    png: "image/png",
    mp3: "audio/mpeg"
}

var server = http.createServer(function (req, res) {
    switch (req.method) {
        case "GET": {
            if (req.url == "/admin") {
                fs.readFile('./pages/admin.html', function (error, data) {
                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    res.write(data);
                    res.end();
                })
            } else {
                let name = req.url.substr(1);
                let dotPosition = name.lastIndexOf(".");
                let extension = name.substr(dotPosition + 1);

                // if(name.indexOf("controls") == -1){
                //     name = "mp3/" + name;
                // }

                fs.readFile(`./static/${decodeURIComponent(name)}`, function (error, data) {
                    if (!error) {
                        if (extension == "mp3") {
                            var range = req.headers.range.replace("bytes=", "").split('-');
                            var stats = fs.statSync(`./static/${decodeURIComponent(name)}`);
                            var fileSizeInBytes = stats["size"];

                            var bytes_start = range[0] ? parseInt(range[0], 10) : 0;
                            var bytes_end = range[1] ? parseInt(range[1], 10) : fileSizeInBytes;

                            var chunk_size = bytes_end - bytes_start;

                            if (chunk_size == fileSizeInBytes) {
                                res.writeHead(200, {
                                    "Accept-Ranges": "bytes",
                                    'Content-Type': 'audio/mpeg',
                                    'Content-Length': fileSizeInBytes
                                });
                                res.end(data)
                            } else {
                                res.writeHead(206, {
                                    "Content-Range": "bytes " + bytes_start + "-" + (bytes_end - 1) + "/" + fileSizeInBytes,
                                    "Accept-Ranges": "bytes",
                                    'Content-Type': 'audio/mpeg',
                                    'Content-Length': chunk_size
                                });
                                res.end(data.slice(bytes_start, bytes_end));
                            }
                        } else {
                            res.writeHead(200, { "Content-Type": `${extToContent[extension]}` });
                            res.write(data);
                            res.end();
                        }
                    } else {
                        if (req.url.includes("okladka")) {
                            fs.readFile(`./static/default/okladka.jpg`, function (error, data) {
                                res.writeHead(200, { "Content-Type": 'image/jpeg' });
                                res.write(data);
                                res.end();
                            })
                        } else {
                            res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
                            res.write(JSON.stringify(error));
                            res.end();
                        }
                    }
                })
            }
            break;
        }
        case "POST": {
            if (req.url == "/upload") {
                let filesNamesList = [];
                let form = new formidable.IncomingForm();
                form.keepExtensions = true;
                form.multiples = true;
                form.uploadDir = "./static/upload/";
                form.on("file", function (field, files) {
                    let extension = files.originalFilename.substr(files.originalFilename.lastIndexOf(".") + 1);
                    if (extension == "png" || extension == "jpg") {
                        filesNamesList.push(`${files.originalFilename} -> okladka.jpg`)
                    } else {
                        filesNamesList.push(files.originalFilename)
                    }
                })
                form.parse(req, function (err, fields, files) {
                    let dir = `${form.uploadDir}/${fields.album.replace(/[^A-Za-z0-9 ]/g, "")}`
                    if (fs.existsSync(dir) == false) {
                        fs.mkdirSync(dir);
                    }

                    if (files.file instanceof Array) {
                        files.file.forEach(e => {
                            let extension = e.originalFilename.substr(e.originalFilename.lastIndexOf(".") + 1);
                            if (extension == "png" || extension == "jpg") {
                                fs.renameSync(e.filepath, `${dir}/okladka.jpg`)
                                console.log(form.uploadDir + e.filepath.substr(e.filepath.lastIndexOf("upload")), `${dir}/okladka.jpg`);
                            } else {
                                fs.renameSync(e.filepath, `${dir}/${e.originalFilename}`)
                            }
                        })
                        res.writeHead(200, { "content-type": "application/json;charset=utf-8" });
                        res.end(JSON.stringify(filesNamesList))
                    } else {
                        let extension = files.file.originalFilename.substr(files.file.originalFilename.lastIndexOf(".") + 1);
                        if (extension == "png" || extension == "jpg") {
                            fs.rename(files.file.filepath, `${dir}/okladka.jpg`, (err) => {
                                res.writeHead(200, { "content-type": "application/json;charset=utf-8" });
                                res.end(JSON.stringify(filesNamesList))
                            })
                        } else {
                            fs.rename(files.file.filepath, `${dir}/${files.file.originalFilename}`, (err) => {
                                res.writeHead(200, { "content-type": "application/json;charset=utf-8" });
                                res.end(JSON.stringify(filesNamesList))
                            })
                        }
                    }
                })
                break;
            } else {
                servResponse(req, res);
            }
            break;
        }
    }
})

server.listen(3000, function () {
    console.log("Start serwera na porcie 3000")
})

function servResponse(req, res) {
    var allData = ""

    req.on("data", function (data) {
        allData += data
    })

    req.on("end", function (data) {
        let obj = JSON.parse(allData);
        let answerObj = {}
        if (req.url == "/getData" || req.url == "/getUploadData") {
            let albumsDirname;
            if (req.url == "/getData") {
                albumsDirname = __dirname + "/static/mp3";
            } else {
                albumsDirname = __dirname + "/static/upload";
            }

            fs.readdir(albumsDirname, function (err, files) {

                if (err) {
                    return console.log(err);
                }

                let albumDirname;
                if (obj.action != "Playlist") {
                    if (obj.action == "First") {
                        answerObj.dirs = [];
                        files.forEach(function (fileName) {
                            answerObj.dirs.push(fileName)
                        });
                        if (answerObj.dirs.length == 0) {
                            albumDirname = null;
                        } else {
                            albumDirname = albumsDirname + `/${files[0]}`
                        }
                    } else if (obj.action == "NEXT") {
                        albumDirname = albumsDirname + `/${obj.name}`
                    }
                    if (albumDirname != null) {
                        fs.readdir(albumDirname, function (err, files) {
                            if (err) {
                                return console.log(err)
                            }
                            answerObj.files = [];
                            files.forEach(function (file) {
                                var stats = fs.statSync(albumDirname + "/" + file);
                                if (file.substr(file.lastIndexOf(".") + 1) == "mp3") {
                                    answerObj.files.push({ name: file, size: stats.size })
                                }
                            })
                            res.writeHead(200, { 'content-type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": "*" });
                            res.end(JSON.stringify(answerObj))
                        })
                    } else {
                        answerObj.files = [];
                        res.writeHead(200, { 'content-type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": "*" });
                        res.end(JSON.stringify(answerObj))
                    }
                } else {
                    async function playlistFun() {
                        answerObj.files = await dbJS.getPlaylist(mainBase);
                        res.writeHead(200, { 'content-type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": "*" });
                        res.end(JSON.stringify(answerObj))
                    }
                    playlistFun();
                }
            });
        } else if (req.url == "/addToPlaylist") {
            async function asyncAdd() {
                let addPermission = await dbJS.canAdd(mainBase, obj);
                if (addPermission == false) {
                    answerObj = {
                        status: false
                    }
                } else {
                    dbJS.addToBase(mainBase, obj);
                    answerObj = {
                        status: true
                    }
                }
                res.writeHead(200, { 'content-type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": "*" });
                res.end(JSON.stringify(answerObj))
            }
            asyncAdd();
        } else if (req.url == "/delFromPlaylist") {
            async function asyncDel() {
                let removeStatus = await dbJS.delFromBase(mainBase, obj);
                res.writeHead(200, { 'content-type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": "*" });
                res.end(JSON.stringify({ status: true }))
            }
            asyncDel();
        }
    })
}