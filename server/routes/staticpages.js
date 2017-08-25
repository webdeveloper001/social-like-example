var fs = require('fs');

function createPageRank(req, res, next) {
var fileName = 'public/rank' + req.body.id + '.html';
var stream = fs.createWriteStream(fileName);

stream.once('open', function(fd) {
  var html = buildHtml(req);
  stream.end(html);
});
}

function buildHtml(req) {

  return '<!doctype html>'+
'<html>'+
'<head>'+
    '<base href="/">'+
    '<meta charset="utf-8">'+
    '<meta property="og:url" content="http://server.rank-x.com/rank'+ req.body.id +'.html" />'+
    '<meta property="og:type" content="article" />'+
    '<meta property="og:title" content="'+ req.body.title +'" />'+
    '<meta property="og:description" content="'+req.body.introtext+'" />'+
    '<meta property="og:image" content="'+req.body.fimage+'" />'+
    '<meta property="fb:app_id" content="1102409523140826" />'+
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />'+
    
    '<meta http-equiv="refresh" content="1; url=https://rank-x.com/rankSummary/'+req.body.slug+'">'+
        '<script type="text/javascript">'+
            'window.location.href = "https://rank-x.com/rankSummary/'+req.body.slug+'"'+
        '</script>'+
'</head>'+
'<body>'+
'If you are not redirected automatically, follow this <a href="https://rank-x.com/rankSummary/'+req.body.slug+'">link</a>.'+
'</body>'+
'</html>';

};

function createPageAnswer(req, res, next) {
var fileName = 'public/answer' + req.body.id + '.html';
var stream = fs.createWriteStream(fileName);

stream.once('open', function(fd) {
  var html = buildHtml2(req);
  stream.end(html);
});
}

function buildHtml2(req) {

  return '<!doctype html>'+
'<html>'+
'<head>'+
    '<base href="/">'+
    '<meta charset="utf-8">'+
    '<meta property="og:url" content="http://server.rank-x.com/answer'+ req.body.id +'.html" />'+
    '<meta property="og:type" content="article" />'+
    '<meta property="og:title" content="'+ req.body.name +'" />'+
    '<meta property="og:description" content="'+req.body.addinfo+'" />'+
    '<meta property="og:image" content="'+req.body.imageurl+'" />'+
    '<meta property="fb:app_id" content="1102409523140826" />'+
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />'+
    
    '<meta http-equiv="refresh" content="1; url=https://rank-x.com/answerDetail/'+req.body.slug+'">'+
        '<script type="text/javascript">'+
            'window.location.href = "https://rank-x.com/answerDetail/'+req.body.slug+'"'+
        '</script>'+
'</head>'+
'<body>'+
'If you are not redirected automatically, follow this <a href="https://rank-x.com/answerDetail/'+req.body.slug+'">link</a>.'+
'</body>'+
'</html>';

};

function getFileList(req, res, next) {
const targetFolder = './public/';
var files = [];

fs.readdirSync(targetFolder).forEach(file => {
  files.push(file);
});
res.send(200,files);
}

function removeFile(req, res, next) {
    try {
        fs.unlinkSync('./public/' + req.body.filename);
    } catch (ex) {
        //console.log(ex)
        res.send(500,ex)
    }
    res.send(200,'successfully deleted ' + req.body.filename);
}

module.exports= {
    createPageRank: createPageRank,
    createPageAnswer: createPageAnswer,
    getFileList: getFileList,
    removeFile: removeFile
}