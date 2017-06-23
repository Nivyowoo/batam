var BuildsPage = (function (config) {
    var data = {};

    var initPage = function(){
        displayList();
    };

    var displayList = function(){
        var query = '/api/projects';
        if(data.project_id != null){
            query += '/'+data.project_id;
        }
        if(data.branch_id != null){
            query += '/branches/'+data.branch_id;
        }

        $.getJSON(query, displayElements)
            .error(handleError)
            .fail(handleFailure);
    };

    // Function display element list
    var displayElements = function(response){
        var identifier_prefix = "projects";
        if(data.project_id != null){
            identifier_prefix = "branches";
        }
        if(data.branch_id != null){
            identifier_prefix = "builds";
        }

        $('#'+identifier_prefix+'_count').html(response.builds.length);

        if(identifier_prefix == 'projects'){
            displayProjects(response.builds);
            $('#project_list_link').attr('href', '/api/projects');
        }else if(identifier_prefix == 'branches'){
            displayBranches(response.builds);
            $('#branch_list_link').attr('href', '/api/projects/'+data.project_id);
        }else{
            displayBuilds(response.builds);
            $('#build_list_link').attr('href', '/api/projects/'+data.project_id+'/branches/'+data.branch_id);
        }
    };

    var displayProjects = function(projects){
        if(projects.length == 0){
            return;
        }

        var html = '';
        for(var i = 0; i < projects.length; i++){
            var url = '/'+projects[i].project_id;
            var project_name = projects[i].project_name;

            html += '<a href="'+url+'" class="list-group-item">' +
                '   <div class="row" style="margin-bottom:10px">' +
                '       <div class="col-md-12">' +
                '           <span style="font-size:16px">'+project_name+'</span>' +
                '       </div>' +
                '   </div>' +
                '</a>';
        }

        $('#project_list').empty();
        $('#project_list').html(html);
    };

    var displayBranches = function(branches){
        if(branches.length == 0){
            return;
        }

        var html = '';
        for(var i = 0; i < branches.length; i++){
            var url = '/'+branches[i].project_id+'/'+branches[i].branch_id;
            var project_name = branches[i].project_name;
            var branch_name = branches[i].branch_name;

            html += '<a href="'+url+'" class="list-group-item">' +
                '   <div class="row" style="margin-bottom:10px">' +
                '       <div class="col-md-12">' +
                '           <span style="font-size:16px">'+project_name+' / '+branch_name+'</span>' +
                '       </div>' +
                '   </div>' +
                '</a>';
        }

        $('#branch_list').empty();
        $('#branch_list').html(html);
    };

    var displayBuilds = function(builds){
        if(builds.length == 0){
            //TODO: display no build available. Redirect to documentation.
            return;
        }

        var html = '';
        for(var i = 0; i < builds.length; i++){
            var url = '/'+builds[i].project_id+'/'+builds[i].branch_id+'/'+builds[i].build_id;
            var project_name = builds[i].project_name;
            var branch_name = builds[i].branch_name;
            var build_name = builds[i].build_name;

            html += '<a href="'+url+'" class="list-group-item">' +
                '   <div class="row" style="margin-bottom:10px">' +
                '       <div class="col-md-12">' +
                '           <span style="font-size:16px">'+build_name+'</span>' +
                '       </div>' +
                '   <div class="col-sm-2 col-sm-offset-4">';
            if(builds[i].tests == undefined){
                html += '		<strong> Tests <span class="label label-info">0</span></strong>';
            }else{
                html += '		<strong> Tests '+builds[i].tests.value;
                if(builds[i].tests.trend == 1){
                    html +=	'						<span class="glyphicon glyphicon-chevron-up"></span>';
                }else if(builds[i].tests.trend == -1){
                    html +=	'						<span class="glyphicon glyphicon-chevron-down"></span>';
                }
                html +=	'					</span></strong>';
            }
            html += '    </div><div class="col-sm-2">';
            if(builds[i].passes == undefined){
                html += '		<strong> Pass <span class="label label-info">0</span></strong>';
            }else{
                if(builds[i].tests.trend == 1){
                    html += '		<strong> Pass <span class="label label-success">'+builds[i].passes.value+' <span class="glyphicon glyphicon-chevron-up"></span></span></strong>';
                }else if(builds[i].tests.trend == -1){
                    html +=	'		<strong> Pass <span class="label label-warning">'+builds[i].passes.value+' <span class="glyphicon glyphicon-chevron-down"></span></span></strong>';
                }else{
                    html += '		<strong> Pass '+builds[i].passes.value+'</strong>';
                }
            }
            html += '    </div><div class="col-sm-2">';
            if(builds[i].failures == undefined){
                html += '		<strong> Failures <span class="label label-info">0</span></strong>';
            }else{
                html += '		<strong> Failures '+formatWithLabel(builds[i].failures.value, builds[i].failures.trend, 0, false)+'</strong>';
            }
            html += '    </div><div class="col-sm-2">';
            if(builds[i].errors == undefined){
                html += '		<strong> Errors <span class="label label-info">0</span></strong>';
            }else{
                html += '		<strong> Errors '+formatWithLabel(builds[i].errors.value, builds[i].errors.trend, 0, false)+'</strong>';
            }
            var description = builds[i].description == undefined ? '&nbsp;' : builds[i].description;
            var updateTime = builds[i].end_date == undefined ? data.notAvailable : moment(builds[i].end_date).fromNow();
            html += '    </div></div><div class="list-group-item-text">'+description+'<div class="pull-right">Last update : '+updateTime+'</div></div></a>';
        }

        $('#builds_list').empty();
        $('#builds_list').html(html);
    };

    return {
        project_id: config.project_id,
        branch_id: config.branch_id,
        init: function () {
            data = {
                project_id: this.project_id,
                branch_id: this.branch_id,
                notAvailable: ' '
            };

            initPage();
        }
    }

})(ServerConfig);
