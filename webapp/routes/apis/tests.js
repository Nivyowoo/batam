var _ = require('underscore');
var util = require('util');
var mongoskin = require('mongoskin');
var batam_util = config = require('../../util/util.js');

/**
 * API path /api/projects/:project_id/branches/:branch_id/builds/:build_id/commits/:commit_id/reports/:report_id/tests
 */
exports.list = fetchReports;

function fetchReports(req, res, next){
	// Validate inputs
	if(!req.params.project_id) {
		return next(new Error('No project_id query param.'));
	}
	if(!req.params.branch_id) {
        return next(new Error('No branch_id query param.'));
    }
    if(!req.params.build_id) {
        return next(new Error('No build_id query param.'));
    }
    if(!req.params.commit_id) {
        return next(new Error('No commit_id query param.'));
    }
    if(!req.params.report_id) {
        return next(new Error('No report_id query param.'));
    }
	if(_.isNull(req.params.project_id)){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(_.isNull(req.params.branch_id)){
        return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    if(_.isNull(req.params.build_id)){
        return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    if(_.isNull(req.params.commit_id)){
        return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    if(_.isNull(req.params.report_id)){
        return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }

	req.collections.tests.find({
	    project_id: req.params.project_id,
	    branch_id: req.params.branch_id,
	    build_id: req.params.build_id,
	    commit_id: req.params.commit_id,
	    report_id: req.params.report_id}, {})
    .toArray(
        function (error, tests){
            //Handle Error.
            if(error) {
                return next(error);
            }

            res.send({tests: tests});
        }
    );

}
	
///**
// * API path /api/tests/stat
// */
//exports.stat = findStat;
//
//function findStat(req, res, next){
//	var findTestCriterias = function (error, criterias){
//		var aggregateTestStat = function (error, stat){
//			//Handle Error.
//			if(error){
//				return next(error);
//			}
//
//			//Set name
//			result.name = statName;
//
//			//Set Values
//			var values = [];
//			for(var j = 0; j < stat.length; j++){
//				values[j] = {name: stat[j][req.query.graph] == null? "Others": stat[j][req.query.graph] , value : stat[j].count};
//			}
//			result.values = values;
//
//			//Send result.
//			res.send({stat: result});
//		};
//
//		//Handle Error.
//		if(error) {
//			return next(error);
//		}
//
//		//Fetch the graph name that need to be returned.
//		var statName;
//		if(req.query.graph == 'status'){
//			statName = "Status"
//		}else if(req.query.graph == 'regression'){
//			statName = "Regression"
//		}else if(req.query.graph == 'time'){
//			statName = "Time"
//		}else{
//			for(var i = 0; i < criterias.length; i++){
//				var currentCriterias = batam_util.replaceAll(" ", "_", criterias[i].name.toLowerCase());
//				if(currentCriterias == req.query.graph){
//					statName = criterias[i].name;
//				}
//			}
//		}
//
//		//Create searchCriteria object.
//		var searchCriterias = batam_util.createSearchObject(req, criterias);
//
//		//Fetch stats based on search criterias.
//		req.collections.tests.group([req.query.graph],
//			searchCriterias,
//			{count: 0},
//			"function(curr, prev){prev.count++;}",
//			aggregateTestStat);
//	};
//
//	//Validate inputs.
//	if(!req.query.build_id || !req.query.graph) {
//		return next(new Error('No build_id or graph query params.'));
//	}
//	if(_.isNull(req.query.build_id) /*|| !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')*/){
//		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
//	}
//	if(_.isNull(req.query.report_id) /*&& !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')*/){
//		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
//	}
//	if(_.isNull(req.query.graph) /*|| !validator.matches(req.query.graph, '[0-9a-zA-Z_-]+')*/){
//		return next(new Error('graph param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
//	}
//
//	//Create response object.
//	var result = {};
//
//	//Fetch all test criterias.
//	req.collections.testcriterias.find().toArray(findTestCriterias);
//}
//
//
//
///**
// * API path /api/tests/:test_id
// */
//exports.view = findTest;
//
//function findTest(req, res, next){
//	var fetchTest = function (error, test){
//	    //Handle Error.
//		if(error) {
//			return next(error);
//		}
//		//Send response.
//	    res.send({test: test});
//	};
//
//	//Validate inputs.
//	if(!req.params.test_id) {
//		return next(new Error('No test_id param in url.'));
//	}
////	if(_.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
////		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
////	}
//
//	//Fetch test requested.
//	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id)}, fetchTest);
//}

///**
// * API path /api/tests/history
// */
//exports.history = findTestHistory;
//
//function findTestHistory(req, res, next){
//	var findTest = function (error, test){
//		var findTests = function (error, tests){
//			var countTest = function (error, count){
//				//Validate query result.
//				if(error){
//					return next(error);
//				}
//				if(_.isNull(count)){
//					count = 0;
//				}
//
//				result.recordsTotal = count;
//				result.recordsFiltered = count;
//				result.data = data;
//				//Send result.
//				res.send(result);
//			};
//
//			//Handle Error.
//			if(error){
//				return next(error);
//			}
//
//			//Populate the data array with tests found.
//			for(var index in tests){
//				data[index] = [
//	               tests[index].build_id,
//	               tests[index].report_id,
//				   tests[index]._id,
//	               tests[index].start_date,
//	               tests[index].time,
//	               tests[index].status];
//			}
//
//			//Count number of retuned tests and send response.
//			req.collections.tests.count({name: test_name, build_name: build_name, start_date : { $lte : test.start_date }}, countTest);
//		}
//
//		if(error){
//			return next(error);
//		}
//
//		//fetch build name
//		var test_name = test.name;
//		var build_name = test.build_name;
//
//		//Fetch all test criterias.
//		req.collections.tests.find({name: test_name, build_name: build_name, start_date : { $lte : test.start_date }})
//			.sort({start_date: -1})
//			.skip(parseInt(req.query.start)).limit(parseInt(req.query.length))
//			.toArray(findTests);
//	}
//
//	//Validate inputs.
//	if(!req.query.draw || !req.query.length || !req.query.start){
//		return next(new Error('No draw, length, start query params.'));
//	}
//	if(_.isNull(req.params.test_id) /*|| !validator.matches(req.params.test_id, '[0-9a-zA-Z_-]+')*/){
//		return next(new Error('build_name param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
//	}
//	if(_.isNull(req.query.draw) || isNaN(req.query.draw)){
//		return next(new Error('draw param should not be null and should be a number.'));
//	}
//	if(_.isNull(req.query.length) || isNaN(req.query.length)){
//		return next(new Error('length param should not be null and should be a number.'));
//	}
//	if(_.isNull(req.query.start) || isNaN(req.query.start)){
//		return next(new Error('start param should not be null and should be a number.'));
//	}
//
//	//Create response object.
//	var result = {};
//	//Set draw value.
//	result.draw = req.query.draw;
//	//Create data obejct array.
//	var data = [];
//
//	//Fetch all test criterias.
//	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id)}, findTest)
//}

