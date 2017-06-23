var _ = require('underscore');
var util = require('util');

/**
 * API path /api/projects/:project_id/branches/:branch_id/builds/:build_id/commits/:commit_id/reports/:report_id
 */
exports.show = findReport;

function findReport(req, res, next){
    var fetchReport = function (error, report){
        //Handle Error.
        if(error) {
            return next(error);
        }

        res.send({report: report});
    };
	
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
	
	req.collections.reports.findOne({
	    project_id: req.params.project_id,
	    branch_id: req.params.branch_id,
	    build_id: req.params.build_id,
	    commit_id: req.params.commit_id,
	    report_id: req.params.report_id
	}, {}, fetchReport);
}

/**
 * API path /api/projects/:project_id/branches/:branch_id/builds/:build_id/commits/:commit_id/reports
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
	
	req.collections.reports.find({project_id: req.params.project_id, branch_id: req.params.branch_id, build_id: req.params.build_id, commit_id: req.params.commit_id}, {})
    .toArray(
        function (error, reports){
            //Handle Error.
            if(error) {
                return next(error);
            }

            res.send({reports: reports});
        }
    );
    
}



