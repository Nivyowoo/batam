var _ = require('underscore');
var util = require('util');


var findLatestBuildsGroupBy = function (error, builds, groupby){
    var latest_build = {};

    //Handle Error.
    if(error) {
        return next(error);
    }

    // Fetch latest build for each distinct projects
    for(var i = 0; i < builds.length; i++){
        // Define grouping key
        var key = null;
        if(groupby == 'project'){
            key = builds[i].project_id;
        }else if(groupby == 'branch'){
            key = builds[i].project_id+"_"+builds[i].branch_id;
        }else if(groupby == 'build'){
            key = builds[i].project_id+"_"+builds[i].branch_id+"_"+builds[i].build_id;
        }else{
            return next("Programming error");
        }

        if(_.isUndefined(latest_build[key])){
            latest_build[key] = builds[i];
        }else{
            latest_build[key] = latest_build[key].start_date < builds[i].start_date ? builds[i] : latest_build[key];
        }
    }

    var result = new Array();
    for (var key in latest_build) {
        result.push(latest_build[key]);
    }

    //Order build per end date
    result.sort(function(a, b) {
        var aed = a.end_date == null ? new Date() : new Date(a.end_date);
        var bed = b.end_date == null ? new Date() : new Date(b.end_date);
        return aed > bed ? -1 : aed < bed ? 1 : 0;
    });

    return result;
}
/**
 * API path /api/projects
 */
exports.project_list = fetchProjects;

function fetchProjects(req, res, next){

	var findLatestBuilds = function (error, builds){
	    //Handle Error.
        if(error) {
            return next(error);
        }
	    var result = findLatestBuildsGroupBy(error, builds, 'project');

		res.send({builds: result});
	};

    //Fetch all builds for processing_status completed and then we filter down in the callback.
    //NOTE: for performance reasons we may want to query the db with filters.
    req.collections.builds.find({processing_status: 'completed'},
        {})
        .toArray(findLatestBuilds);
}

/**
 * API path /api/projects/:project_id
 */
exports.branch_list = fetchBranches;

function fetchBranches(req, res, next){

	var findLatestBuilds = function (error, builds){
	    var result = findLatestBuildsGroupBy(error, builds, 'branch');

		res.send({builds: result});
	};

    //Validate inputs
    if(!req.params.project_id) {
        return next(new Error('No project_id param in url.'));
    }
    if(_.isNull(req.params.project_id)){
        return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }

    //Fetch all builds for processing_status completed and then we filter down in the callback.
    //NOTE: for performance reasons we may want to query the db with filters.
    req.collections.builds.find({processing_status: 'completed', project_id: req.params.project_id},
        {})
        .toArray(findLatestBuilds);
}

/**
 * API path /api/projects/:project_id/branches/:branch_id
 */
exports.build_list = fetchBuilds;

function fetchBuilds(req, res, next){

	var findLatestBuilds = function (error, builds){
	    var result = findLatestBuildsGroupBy(error, builds, 'build');

		res.send({builds: result});
	};

    //Validate inputs
    if(!req.params.project_id) {
        return next(new Error('No project_id param in url.'));
    }
    if(!req.params.branch_id) {
        return next(new Error('No branch_id param in url.'));
    }
    if(_.isNull(req.params.project_id)){
        return next(new Error('project_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    if(_.isNull(req.params.branch_id)){
        return next(new Error('branch_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }

    //Fetch all builds for processing_status completed and then we filter down in the callback.
    //NOTE: for performance reasons we may want to query the db with filters.
    req.collections.builds.find({processing_status: 'completed', project_id: req.params.project_id, branch_id: req.params.branch_id}, {}).toArray(findLatestBuilds);
}


/**
 * API path /api/projects/:project_id/branches/:branch_id/builds/:build_id/
 */
exports.latest_build = findBuild;

/**
 * API path /api/projects/:project_id/branches/:branch_id/builds/:build_id/commits/:commit_id
 */
exports.build = findBuild;

function findBuild(req, res, next){
	var findCompletedBuild = function (error, build){
	    //Handle Error.
		if(error) {
	    	return next(error);
	    }

	    if(_.isNull(build)){
	    	res.send({build: null});
		}else{
			res.send({build: build});
		}

	};

	//Validate inputs
	if(!req.params.project_id) {
        return next(new Error('No project_id param in url.'));
    }
    if(!req.params.branch_id) {
        return next(new Error('No branch_id param in url.'));
    }
    if(!req.params.build_id) {
        return next(new Error('No build_id param in url.'));
    }
    if(_.isNull(req.params.project_id)){
        return next(new Error('project_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    if(_.isNull(req.params.branch_id)){
        return next(new Error('branch_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    if(_.isNull(req.params.build_id)){
        return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
	var criterias = {
	    project_id: req.params.project_id,
        branch_id: req.params.branch_id,
        build_id: req.params.build_id
    };
    if(req.params.commit_id && !_.isNull(req.params.commit_id)) {
        criterias['commit_id'] = req.params.commit_id
    }
	req.collections.builds.findOne(criterias, findCompletedBuild);
}
