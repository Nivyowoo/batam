var ReportPage = (function (config) {
    var data = {};

    var initPage = function(){
        // Initial fetch
        $.getJSON('/api/projects/'+data.project_id+'/branches/'+data.branch_id+'/builds/'+data.build_id+'/commits/'+data.commit_id+'/reports/'+data.report_id, displayReport)
            .error(handleError)
            .fail(handleFailure);
    };

    var displayReport = function(response){
        var report = response.report;
        var reportHeader = '';
//        if(report.previous_id != null){
//            reportHeader += '<a href="/'+report.build_previous_id+'/report/'+report.previous_id+'"><span class="glyphicon glyphicon-chevron-left"></span> Previous </a> ';
//        }
        reportHeader += '<span style="padding-left:50px"><a data-toggle="collapse" data-parent="#accordion" href="#collapseOne"><strong>'+report.report_name+'</strong></a></span> ';
//        if(report.next_id != null){
//            reportHeader += '<span class="pull-right"><a href="/'+report.build_next_id+'/report/'+report.next_id+'"> Next <span class="glyphicon glyphicon-chevron-right"></span></a></span> ';
//        }
        $('#report_header').html(reportHeader);
//        if(report.lifecycle_status == 'pending'){
//            $('#main_panel').addClass('panel-warning')
//        }else{
            $('#main_panel').addClass('panel-default')
//        }
        $('#report_name').html(report.report_name);
        var description = report.description == undefined ? data.notAvailable : report.description;
        $('#report_description').html(description);
        var start_date = report.start_date == undefined ? data.notAvailable : moment(report.start_date).format('MMM Do YYYY, h:mm:ss a');
        $('#report_date').html(start_date);
        var end_date = report.end_date == undefined ? data.notAvailable : moment(report.end_date).format('MMM Do YYYY, h:mm:ss a');
        $('#report_end_date').html(end_date);
        if(report.status != null){
            if(report.status == 'completed'){
                $('#report_status').html('<span class="label label-success">'+report.status+'</span>');
            }else{
                $('#report_status').html('<span class="label label-danger">'+report.status+'</span>');
            }
        }
        if(report.duration != null){
            $('#report_duration').html(formatWithLabel(report.duration.value, report.duration.trend, 600000, true));
        }

        if(report.logs != null){
            var logs = '';
            for(var i = 0; i < report.logs.length; i++){
                if(i != 0){
                    logs += ', ';
                }
                logs += report.logs[i];
            }
            $('#report_logs').html(logs);
        }

        if(report.tests != null && report.tests.flaky != null){
            $('#report_regressions').html(formatWithLabel(report.tests.flaky.value, report.tests.flaky.trend, 0, false));
        }

        if(report.tests != null && report.tests.new_regressions != null){
            $('#report_new_regressions').html(formatWithLabel(report.tests.new_regressions.value, report.tests.new_regressions.trend, 0, false));
        }

        if(report.tests != null && report.tests.passes != null){
            if(report.tests.passes.value == 0){
                $('#report_passes').html('<span class="label label-info">0</span>');
            }else{
                if(report.tests.passes.trend == -1){
                    $('#report_passes').html('<span class="label label-warning">'+report.tests.passes.value+' <span class="glyphicon glyphicon-chevron-down"></span></span>');
                }else if(report.tests.passes.trend == 1){
                    $('#report_passes').html('<span class="label label-success">'+report.tests.passes.value+' <span class="glyphicon glyphicon-chevron-up"></span></span>');
                }else{
                    $('#report_passes').html(report.tests.passes.value);
                }
            }
        }

        if(report.tests != null && report.tests.failures != null){
            $('#report_failures').html(formatWithLabel(report.tests.failures.value, report.tests.failures.trend, 0, false));
        }

        if(report.tests != null && report.tests.errors != null){
            $('#report_errors').html(formatWithLabel(report.tests.errors.value, report.tests.errors.trend, 0, false));
        }

        if(report.tests != null && report.tests.fixed_regressions != null){
            if(report.tests.fixed_regressions.value == 0){
                $('#report_fixed_regressions').html('<span class="label label-info">0</span>');
            }else{
                if(report.tests.fixed_regressions.trend == -1){
                    $('#report_fixed_regressions').html('<span class="label label-warning">'+report.tests.fixed_regressions.value+' <span class="glyphicon glyphicon-chevron-down"></span></span>');
                }else if(report.tests.fixed_regressions.trend == 1){
                    $('#report_fixed_regressions').html('<span class="label label-success">'+report.tests.fixed_regressions.value+' <span class="glyphicon glyphicon-chevron-up"></span></span>');
                }else{
                    $('#report_fixed_regressions').html(report.tests.fixed_regressions.value);
                }
            }
        }

        if(report.tests != null && report.tests.all != null){
            if(report.tests.all.trend == -1){
                $('#report_tests').html(report.tests.all.value+' <span class="glyphicon glyphicon-chevron-down"></span>');
            }else if(report.tests.all.trend == 1){
                $('#report_tests').html(report.tests.all.value+' <span class="glyphicon glyphicon-chevron-up"></span>');
            }else{
                $('#report_tests').html(report.tests.all.value);
            }
        }

    };

    var displayTests = function(data){
        // load tests
        var columns = [];
        // Add mandatory default column Name
        columns[0] = {title: "Name"};
        for(var i = 0; i < data.criteriasIds.length; i++){
            columns[i+1] = {};
            if(data.visibleColumns[i] == undefined || data.visibleColumns[i] == false){
                columns[i+1].title = data.criteriasIds[i];
                columns[i+1].visible = false;
            }else{
                columns[i+1].title = data.criteriasIds[i];
                columns[i+1].visible = true;
            }
        }

        for(var i = 0; i < data.criteriasIds.length; i++){
            if(data.criteriasIds[i] == 'Tags'){
                var checkedTags = $("#search_tags input:checkbox:checked").map(function(){
                  return $(this).val();
                }).get();
                if(checkedTags != null && checkedTags.length != 0){
                    data['tags'] = ""+checkedTags;
                }
                continue;
            }
            var currentValue = $('#'+replaceAll(" ", "_", data.criteriasIds[i].toLowerCase())).val();
            if(currentValue != undefined && currentValue != null && currentValue != ""){
                data[replaceAll(" ","_", data.criteriasIds[i].toLowerCase())] = $('#'+replaceAll(" ", "_", data.criteriasIds[i].toLowerCase())).val();
            }
        }

        $('#tests').DataTable( {
            destroy: true,
            serverSide: true,
            searching: false,
            ajax: {
                url: "/api/tests",
                "data": data,
                type: 'GET',
                timeout: 15000,
                error: function handleDataTableError( xhr, textStatus, error ) {
                    if ( textStatus === 'timeout' ) {
                        alert( 'The server took too long to send the data.' );
                    }
                    else {
                        alert( 'An error occurred on the server. Please try again in a minute.' );
                    }
                },
                dataSrc: function ( json ) {
                    var result = [];
                    result.draw = json.draw;
                    result.recordsFiltered = json.recordsFiltered;
                    result.recordsTotal = result.recordsTotal;
                    for ( var i = 0 ; i < json.data.length ; i++ ) {
                        result[i] = [];
                        result[i][0] = '<a href="/'+json.data[i][0]+'/report/'+json.data[i][1]+'/test/'+json.data[i][2]+'">'+json.data[i][3]+'</a>';
                        result[i][1] = formatStatus(json.data[i][5]);
                        result[i][2] = formatRegression(json.data[i][5], json.data[i][6]);
                        result[i][3] = formatTime(json.data[i][7]);
                        result[i][4] = ''+json.data[i][8];
                        for(var j = 9; j < json.data[i].length; j++){
                            result[i][j-4] = json.data[i][j];
                        }
                    }
                    return result;
                }
            },
            columns: columns,
            drawCallback: function(settings) {
                data.table = $('#tests').DataTable();
                for(var i = 5; i < data.criteriasIds.length; i++){
                    //i starts at 5 since we always want to display default columns Status, Regression, Time and Tags.
                    //i+1 is needed since the 0 column is the mandatory name column not listed in the criteriasIds list.
                    if(data.visibleColumns[i] == undefined || data.visibleColumns[i] == false){
                        data.table.column(i+1).visible(false);
                    }else{
                        data.table.column(i+1).visible(true);
                    }
                }
            }
        });
    };

    return {
        project_id: config.project_id,
        branch_id: config.branch_id,
        build_id: config.build_id,
        commit_id: config.commit_id,
        report_id: config.report_id,
        init: function () {
            data = {
                project_id: this.project_id,
        		branch_id: this.branch_id,
        		build_id: this.build_id,
        		commit_id: this.commit_id,
        		report_id: this.report_id,
        		notAvailable: '',
                criteriasIds: [],
                table: null,
                graph: '',
                visibleColumns: [true, true, true]
            };

    		initPage();

        }
    }

})(ServerConfig);
