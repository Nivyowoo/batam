//Load require libraries
var express = require('express'),
  	consolidate = require('consolidate'),
  	routes = require('./routes'),
  	http = require('http'),
  	path =  require('path'),
  	config = require('./config.js'),
  	_ = require('underscore');

var mongoskin = require('mongoskin'),
  	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
  	db = mongoskin.db(dbUrl, {safe:true}),
  	collections = {
    	builds: db.collection('builds'),
    	reports: db.collection('reports'),
    	testcriterias: db.collection('testcriterias'),
    	tests: db.collection('tests')
  	};

var logger = require('morgan'),
	errorHandler = require('errorhandler'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override');

//Configure settings
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', consolidate.handlebars);
app.set('view engine', 'html');

//Define middleware
app.use(function(req, res, next){
	if(!collections.builds || !collections.reports || !collections.tests) return next(new Error('No collections.'))
	req.collections = collections;
	return next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

if('development' == app.get('env')){
	app.use(errorHandler());
}


//REST API ROUTES
app.get('/api/projects', routes.apis.builds.project_list);
app.get('/api/projects/:project_id', routes.apis.builds.branch_list);
app.get('/api/projects/:project_id/branches/:branch_id', routes.apis.builds.build_list);
app.get('/api/projects/:project_id/branches/:branch_id/builds/:build_id', routes.apis.builds.latest_build);
app.get('/api/projects/:project_id/branches/:branch_id/builds/:build_id/commits/:commit_id', routes.apis.builds.build);
app.get('/api/projects/:project_id/branches/:branch_id/builds/:build_id/commits/:commit_id/reports', routes.apis.reports.list);
app.get('/api/projects/:project_id/branches/:branch_id/builds/:build_id/commits/:commit_id/reports/:report_id', routes.apis.reports.show);
app.get('/api/projects/:project_id/branches/:branch_id/builds/:build_id/commits/:commit_id/reports/:report_id/tests', routes.apis.tests.list);

//Define Routes and views
app.get('/', routes.pages.projects.showAll);
app.get('/:project_id', routes.pages.projects.show);
app.get('/:project_id/:branch_id', routes.pages.builds.showAll);
app.get('/:project_id/:branch_id/:build_id', routes.pages.builds.show);
app.get('/:project_id/:branch_id/:build_id/:commit_id', routes.pages.builds.show);
app.get('/:project_id/:branch_id/:build_id/:commit_id/:report_id', routes.pages.reports.show);

//app.get('/:build_id/report/:report_id', routes.pages.report.show);
//app.get('/:build_id/report/:report_id/test/:test_id', routes.pages.test.show);

//app.get('/api/reports', routes.apis.report.list);
//app.get('/api/reports/:report_id', routes.apis.report.view);

//app.get('/api/tests', routes.apis.test.list);
//app.get('/api/tests/criterias', routes.apis.test.criterias);
//app.get('/api/tests/stat', routes.apis.test.stat);
//app.get('/api/tests/:test_id', routes.apis.test.view);
//app.get('/api/tests/:test_id/history', routes.apis.test.history);

app.all('*', function(req, res){
  res.status(404).end();
});

//Start the server
var server = http.createServer(app);
var boot = function(){
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}

var shutdown = function(){
  server.close();
}

if(require.main === module){
  boot();
}else{
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}

//Prototype changes
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

