/**
 * PAGE path /:project_id/:branch_id
 */
exports.showAll = function (req, res, next){
    res.render('builds', {
        project_id: req.params.project_id,
        branch_id: req.params.branch_id
    });
}

/**
 * PAGE path /:project_id/:branch_id/:build_id
 */
exports.show = function (req, res, next){
   res.render('build', {
       project_id: req.params.project_id,
       branch_id: req.params.branch_id,
       build_id: req.params.build_id
   });
}

/**
 * PAGE path /:project_id/:branch_id/:build_id/:commit_id
 */
exports.show = function (req, res, next){
    res.render('build', {
        project_id: req.params.project_id,
        branch_id: req.params.branch_id,
        build_id: req.params.build_id,
        commit_id: req.params.commit_id
    });
}
