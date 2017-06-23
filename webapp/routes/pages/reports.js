var _ = require('underscore');
var util = require('util');
var batam_util = require('../../util/util.js');
var config = require('../../config.js');


/**
 * PAGE path /:project_id/:branch_id/:build_id/:commit_id/:report_id
 */
exports.show = function (req, res, next){
    res.render('report', {
        project_id: req.params.project_id,
        branch_id: req.params.branch_id,
        build_id: req.params.build_id,
        commit_id: req.params.commit_id,
        report_id: req.params.report_id
    });
}
