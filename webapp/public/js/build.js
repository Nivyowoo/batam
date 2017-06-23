var BuildPage = (function (config) {
    var data = {};

    var initPage = function(){

        var build_url = '/api/projects/'+data.project_id+'/branches/'+data.branch_id+'/builds/'+data.build_id;
        if(data.commit_id != ""){
            build_url += '/commits/'+data.commit_id;
        }
        $('#build_rest_link').attr('href', build_url);
        $.getJSON(build_url, displayBuild)
            .error(handleError)
            .fail(handleFailure);
    };

    var displayBuild = function(response){
        var build = response.build;
        var buildHeader = '';
        if(build.prev_commit_id != null){
            buildHeader += '<a href="/'+build.project_id+'/'+build.branch_id+'/'+build.build_id+'/'+build.prev_commit_id+'"><span class="glyphicon glyphicon-chevron-left"></span> Previous </a>';
        }
        buildHeader += '<span style="padding-left:50px"><a data-toggle="collapse" data-parent="#accordion" href="#collapseOne">'+build.project_name+'/'+build.branch_name+'/'+build.commit_id+' | '+build.build_name+'</a></span>';
        if(build.next_commit_id != null){
            buildHeader += '<span class="pull-right"><a href="/'+build.project_id+'/'+build.branch_id+'/'+build.build_id+'/'+build.next_commit_id+'"> Next <span class="glyphicon glyphicon-chevron-right"></span></a></span>';
        }else{
            buildHeader += ' <span class="label label-success">latest</span>';
        }
        $('#build_header').html(buildHeader);

        $('#project_name').html('<a href="/'+build.project_id+'">'+build.project_name+'</a>');
        $('#branch_name').html('<a href="/'+build.project_id+'/'+build.branch_id+'">'+build.branch_name+'</a>');
        $('#build_name').html('<a href="/'+build.project_id+'/'+build.branch_id+'/'+build.build_id+'">'+build.build_name+'</a>');
        $('#commit_id').html(build.commit_id);

        var description = build.description == undefined? data.notAvailable : build.description;
        $('#build_description').html(description);
        var start_date = build.start_date == undefined ? data.notAvailable : moment(build.start_date).format('MMM Do YYYY, h:mm:ss a');
        $('#build_start_date').html(start_date);
        var end_date = build.end_date == undefined ? data.notAvailable : moment(build.end_date).format('MMM Do YYYY, h:mm:ss a');
        $('#build_end_date').html(end_date);
        if(build.status != undefined){
            if(build.processing_status == 'pending'){
                $('#build_status').html('<span class="label label-warning right">Pending</span>');
            }else{
                if(build.status == 'completed'){
                    $('#build_status').html('<span class="label label-success">'+build.status+'</span>');
                }else{
                    $('#build_status').html('<span class="label label-danger">'+build.status+'</span>');
                }
            }
        }else{
            if(build.processing_status == 'pending'){
                $('#build_status').html('<span class="label label-warning right">Pending</span>');
            }
        }
        // Duration
        if(build.duration != undefined){
            $('#build_duration').html(formatWithLabel(build.duration.value, build.duration.trend, 600000, true));
        }
        // Test Summary
        if(build.tests == null){
            $('#build_tests_all').html('<span class="label label-info">0</span>');
        }else{
            if(build.tests.trend == 1){
                $('#build_tests_all').html(build.tests.value+' <span class="glyphicon glyphicon-chevron-up"></span>');
            }else if(build.tests.trend == -1){
                $('#build_tests_all').html(build.tests.value+' <span class="glyphicon glyphicon-chevron-down"></span>');
            }else{
                $('#build_tests_all').html(build.tests.value);
            }
        }

        if(build.passes == null){
            $('#build_tests_pass').html('<span class="label label-info">0</span>');
        }else{
            if(build.passes.trend == 1){
                $('#build_tests_pass').html('<span class="label label-success">'+build.passes.value+' <span class="glyphicon glyphicon-chevron-up"></span></span>');
            }else if(build.passes.trend == -1){
                $('#build_tests_pass').html('<span class="label label-warning">'+build.passes.value+' <span class="glyphicon glyphicon-chevron-down"></span></span>');
            }else{
                $('#build_tests_pass').html(build.passes.value);
            }
        }

        if(build.failures == null || build.failures.value == null){
            $('#build_tests_fail').html('<span class="label label-info">0</span>');
        }else{
            $('#build_tests_fail').html(formatWithLabel(build.failures.value, build.failures.trend, 0, false));
        }

        if(build.errors == null || build.errors.value == null){
            $('#build_tests_error').html('<span class="label label-info">0</span>');
        }else{
            $('#build_tests_error').html(formatWithLabel(build.errors.value, build.errors.trend, 0, false));
        }

        if(build.new_regressions == null || build.new_regressions.value == null){
            $('#build_tests_new').html('<span class="label label-info">0</span>');
        }else{
            $('#build_tests_new').html(formatWithLabel(build.new_regressions.value, build.new_regressions.trend, 0, false));
        }

        if(build.fixed_regressions == null){
            $('#build_tests_fix').html('<span class="label label-info">0</span>');
        }else{
            if(build.fixed_regressions.trend == 1){
                $('#build_tests_fix').html('<span class="label label-success">'+build.fixed_regressions.value+' <span class="glyphicon glyphicon-chevron-up"></span></span>');
            }else if(build.fixed_regressions.trend == -1){
                $('#build_tests_fix').html('<span class="label label-warning">'+build.fixed_regressions.value+' <span class="glyphicon glyphicon-chevron-down"></span></span>');
            }else{
                $('#build_tests_fix').html(build.fixed_regressions.value);
            }
        }

        if(build.flaky == null || build.flaky.value == null){
            $('#build_tests_flaky').html('<span class="label label-info">0</span>');
        }else{
            $('#build_tests_flaky').html(formatWithLabel(build.flaky.value, build.flaky.trend, 0, false));
        }

        var show_detail_panel = false;
        if(build.infos != null && build.infos.length != 0){
            var buildInfos = '';
            for(var i = 0; i < build.infos.length; i++){
                buildInfos += '<dt>'+build.infos[i].name+'</dt>'+
                '<dd>'+build.infos[i].value+'</dd>';
            }
            $('#build_info').html(buildInfos);
            show_detail_panel = true;
        }else{
            $('#build_info').remove();
            $('#build_info_title').remove();
        }
        if(build.reports != null && build.reports.length != 0){
            var buildReports = '';
            for(var i = 0; i < build.reports.length; i++){
                buildReports += '<dt>'+build.reports[i].name+'</dt>'+
                '<dd>'+build.reports[i].value+'</dd>';
            }
            $('#build_reports').html(buildReports);
            show_detail_panel = true;
        }else{
            $('#build_reports').remove();
            $('#build_reports_title').remove();
        }
        var distinct_row = new Map();
        if(build.build_timeline.rows.length != 0){
            for(var i = 0; i < build.build_timeline.rows.length; i++){
                distinct_row.set(build.build_timeline.rows[i].c[0].v, 1);
                build.build_timeline.rows[i].c[2].v = new Date(build.build_timeline.rows[i].c[2].v);
                build.build_timeline.rows[i].c[3].v = new Date(build.build_timeline.rows[i].c[3].v);
            }
            // set a padding value to cover the height of title and axis values
            var paddingHeight = 40;
            // set the height to be covered by the rows
            var rowHeight = distinct_row.size * 45;
            // set the total chart height
            var chartHeight = rowHeight + paddingHeight;

            var container = document.getElementById('build_timeline');
            var chart = new google.visualization.Timeline(container);
            var dataTable = new google.visualization.DataTable(build.build_timeline);

            var options = {height: chartHeight};

            chart.draw(dataTable, options);
        }else{
            $('#build_timeline_section').remove();
        }

        if(show_detail_panel == false){
            $('#detail_panel').remove();
        }

        var report_url = '/api/projects/'+data.project_id+'/branches/'+data.branch_id+'/builds/'+data.build_id+'/commits/'+build.commit_id+'/reports';
        $.getJSON(report_url, displayReports)
            .error(handleError)
            .fail(handleFailure);
    };

    var displayReports = function(response){
        var listHtml = '';
        //TODO If no results, display No Available message
        for(var i = 0; i < response.reports.length; i++){
            var report = response.reports[i];

            listHtml += '<a href="/'+data.project_id+'/'+data.branch_id+'/'+data.build_id+'/'+report.commit_id+'/'+report.report_id+'" class="list-group-item">'+
            '		<div class="row" style="margin-bottom:10px">' +
            '			<div class="col-sm-12">' +
            '				<strong>'+report.report_name +'</strong>'+
            '			</div>' +
            '			<div class="col-sm-2 col-sm-offset-2">';
            if(report.tests == null || report.tests.count == undefined){
                listHtml += '		<strong> Tests <span class="label label-info">0</span></strong>';
            }else{
                if(report.tests.count.trend == 1){
                    listHtml += '		<strong> Tests <span>'+report.tests.count.value+' <span class="glyphicon glyphicon-chevron-up"></span></span></strong>';
                }else if(report.tests.count.trend == -1){
                    listHtml +=	'		<strong> Tests <span>'+report.tests.count.value+' <span class="glyphicon glyphicon-chevron-down"></span></span></strong>';
                }else{
                    listHtml += '		<strong> Tests <span>'+report.tests.count.value+'</span></strong>';
                }
            }
            listHtml += '			</div>' +
            '			<div class="col-sm-2">';
            if(report.tests == null || report.tests.passes == undefined){
                listHtml += '		<strong> Pass <span class="label label-info">0</span></strong>';
            }else{
                if(report.tests.passes.trend == 1){
                    listHtml += '		<strong> Pass <span class="label label-success">'+report.tests.passes.value+' <span class="glyphicon glyphicon-chevron-up"></span></span></strong>';
                }else if(report.tests.passes.trend == -1){
                    listHtml +=	'		<strong> Pass <span class="label label-warning">'+report.tests.passes.value+' <span class="glyphicon glyphicon-chevron-down"></span></span></strong>';
                }else{
                    listHtml += '		<strong> Pass <span>'+report.tests.passes.value+'</span></strong>';
                }
            }
            listHtml += '			</div>' +
            '			<div class="col-sm-2">';
            if(report.tests == null || report.tests == null || report.tests.flaky == null || report.tests.flaky.value == null){
                listHtml += '				<strong> Flaky <span class="label label-info">0</span></strong>';
            }else{
                listHtml += '				<strong> Flaky '+formatWithLabel(report.tests.flaky.value, report.tests.flaky.trend, 0, false)+'</strong>';
            }
            listHtml += '			</div>' +
            '			<div class="col-sm-2">';
            if(report.tests == null || report.tests.failures == null || report.tests.failures.value == null){
                listHtml += '				<strong> Failures <span class="label label-info">0</span></strong>';
            }else{
                listHtml += '				<strong> Failures '+formatWithLabel(report.tests.failures.value, report.tests.failures.trend, 0, false)+'</strong>';
            }
            listHtml += '			</div>' +
            '			<div class="col-sm-2">';
            if(report.tests == null || report.tests.errors == null || report.tests.errors.value == null){
                listHtml += '				<strong> Errors <span class="label label-info">0</span></strong>';
            }else{
                listHtml += '				<strong> Errors '+formatWithLabel(report.tests.errors.value, report.tests.errors.trend, 0, false)+'</strong>';
            }
            listHtml +=	'			</div>' +
            '		</div>' +
            '		<div class="list-group-item-text">';
            var description = report.description == undefined ? '&nbsp;' : report.description;
            listHtml +=	'  			'+description+'<div class="pull-right"> ';
            if(report.status == undefined){
                listHtml +=	'			<span class="label label-info">Status not available</span>';
            }else if(report.status == "completed"){
                listHtml +=	'			<span class="label label-success">'+report.status+'</span>';
            }else{
                listHtml +=	'			<span class="label label-danger">'+report.status+'</span>';
            }
            listHtml +=	'  			</div>' +
            '		</div>' +
            '</a>';
        }

        $('#reports_list').html(listHtml);

    };

    return {
        project_id: config.project_id,
        branch_id: config.branch_id,
        build_id: config.build_id,
        commit_id: config.commit_id,
        init: function () {
            data = {
        		project_id: this.project_id,
        		branch_id: this.branch_id,
        		build_id: this.build_id,
        		commit_id: this.commit_id,
        		notAvailable: '',
                criteriasIds: [],
                graph: ''
            };

    		initPage();

        }
    }

})(ServerConfig);
