var _ = require('underscore');
var util = require('util');
var batam_util = require('../../util/util.js');
var config = require('../../config.js');

/**
 * PAGE path /:build_id/report/:report_id
 */
exports.show = showReport;

function showReport(req, res, next){
	var findBuild = function (error, build){
		var findReport = function (error, report){
			//Handle Error.
			if(error) {
				return next(error);
			}

		    if(!_.isNull(report)){
		    	res.render('report', {build_id: build.id, build_name: build.name, report_id: report.id});
		    }else{
		    	return next('Report '+req.params.report_id+' for build '+req.params.build_id+' not found.');
		   	}
		};

		//Handle Error.
		if(error) {
			return next(error);
		}

		if(_.isNull(build)){
			return next('Build '+req.params.build_id+' not found.');
		}

		req.collections.reports.findOne({id: req.params.report_id}, findReport);
	};

	//Validate inputs.
	if(!req.params.build_id || !req.params.report_id) {
		return next(new Error('No build_id or report_id params in url.'));
	}
	//if(_.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(_.isNull(req.params.build_id) /*|| !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')*/){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(v_.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
	if(_.isNull(req.params.report_id) /*|| !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')*/){
		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}

    //Check if the report exist
	req.collections.builds.findOne({id: req.params.build_id}, findBuild);
}
