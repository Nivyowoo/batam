/**
 * PAGE path /
 */
exports.showAll = function (req, res, next){
    res.render('projects', {});
}

/**
 * PAGE path /:project_id
 */
exports.show = function (req, res, next){
   res.render('branches', {
       project_id: req.params.project_id
   });
}
