var BuildPage = (function (config) {
    var data = {};

    var initPage = function(){

        // Initial fetch
        $.getJSON('/api/builds/'+data.build_id, displayBuild)
            .error(handleError)
            .fail(handleFailure);

        $.getJSON('/api/reports?build_id='+data.build_id, displayReports)
            .error(handleError)
            .fail(handleFailure);

        $.getJSON('/api/tests/criterias?build_id='+data.build_id, initGraph)
            .error(handleError)
            .fail(handleFailure);
    };

    var displayBuild = function(response){
        var buildHeader = '';
        if(response.build.previous_id != null){
            buildHeader += '<a href="/'+response.build.previous_id+'"><span class="glyphicon glyphicon-chevron-left"></span> Previous </a> ';
        }
        buildHeader += '<span style="padding-left:50px"><a data-toggle="collapse" data-parent="#accordion" href="#collapseOne"><strong>'+response.build.name+'</strong></a></span> ';
        if(response.build.next_id != null){
            buildHeader += '<span class="pull-right"><a href="/'+response.build.next_id+'"> Next <span class="glyphicon glyphicon-chevron-right"></span></a></span> ';
        }
        if(response.build.lifecycle_status == 'pending'){
            $('#main_panel').addClass('panel-warning')
        }else{
            $('#main_panel').addClass('panel-default')
        }
        $('#build_header').html(buildHeader);
        $('#build_name').html(response.build.name);
        var description = response.build.description == undefined? data.notAvailable : response.build.description;
        $('#build_description').html(description);
        var date = response.build.date == undefined ? data.notAvailable : moment(response.build.date).format('MMM Do YYYY, h:mm:ss a');
        $('#build_date').html(date);
        var end_date = response.build.end_date == undefined ? data.notAvailable : moment(response.build.end_date).format('MMM Do YYYY, h:mm:ss a');
        $('#build_end_date').html(end_date);
        if(response.build.status != undefined){
            if(response.build.lifecycle_status == 'pending'){
                $('#build_status').html('<span class="label label-warning right">Pending</span>');
            }else{
                if(response.build.status == 'completed'){
                    $('#build_status').html('<span class="label label-success">'+response.build.status+'</span>');
                }else{
                    $('#build_status').html('<span class="label label-danger">'+response.build.status+'</span>');
                }
            }
        }else{
            if(response.build.lifecycle_status == 'pending'){
                $('#build_status').html('<span class="label label-warning right">Pending</span>');
            }
        }
        if(response.build.duration != undefined){
            $('#build_duration').html(formatWithLabel(response.build.duration.value, response.build.duration.trend, 600000, true));
        }

        if(response.build.tests == null){
            $('#build_tests_all').html('<span class="label label-info">0</span>');
        }else{
            if(response.build.tests.trend == 1){
                $('#build_tests_all').html(response.build.tests.value+' <span class="glyphicon glyphicon-chevron-up"></span>');
            }else if(response.build.tests.trend == -1){
                $('#build_tests_all').html(response.build.tests.value+' <span class="glyphicon glyphicon-chevron-down"></span>');
            }else{
                $('#build_tests_all').html(response.build.tests.value);
            }
        }

        if(response.build.passes == null){
            $('#build_tests_pass').html('<span class="label label-info">0</span>');
        }else{
            if(response.build.passes.trend == 1){
                $('#build_tests_pass').html('<span class="label label-success">'+response.build.passes.value+' <span class="glyphicon glyphicon-chevron-up"></span></span>');
            }else if(response.build.passes.trend == -1){
                $('#build_tests_pass').html('<span class="label label-warning">'+response.build.passes.value+' <span class="glyphicon glyphicon-chevron-down"></span></span>');
            }else{
                $('#build_tests_pass').html(response.build.passes.value);
            }
        }

        if(response.build.regressions == null || response.build.regressions.value == null){
            $('#build_regressions').html('<span class="label label-info">0</span>');
        }else{
            $('#build_regressions').html(formatWithLabel(response.build.regressions.value, response.build.regressions.trend, 0, false));
        }

        if(response.build.failures == null || response.build.failures.value == null){
            $('#build_tests_fail').html('<span class="label label-info">0</span>');
        }else{
            $('#build_tests_fail').html(formatWithLabel(response.build.failures.value, response.build.failures.trend, 0, false));
        }

        if(response.build.errors == null || response.build.errors.value == null){
            $('#build_tests_error').html('<span class="label label-info">0</span>');
        }else{
            $('#build_tests_error').html(formatWithLabel(response.build.errors.value, response.build.errors.trend, 0, false));
        }

        if(response.build.new_regressions == null || response.build.new_regressions.value == null){
            $('#build_tests_new').html('<span class="label label-info">0</span>');
        }else{
            $('#build_tests_new').html(formatWithLabel(response.build.new_regressions.value, response.build.new_regressions.trend, 0, false));
        }

        if(response.build.fixed_regressions == null){
            $('#build_tests_fix').html('<span class="label label-info">0</span>');
        }else{
            if(response.build.fixed_regressions.trend == 1){
                $('#build_tests_fix').html('<span class="label label-success">'+response.build.fixed_regressions.value+' <span class="glyphicon glyphicon-chevron-up"></span></span>');
            }else if(response.build.fixed_regressions.trend == -1){
                $('#build_tests_fix').html('<span class="label label-warning">'+response.build.fixed_regressions.value+' <span class="glyphicon glyphicon-chevron-down"></span></span>');
            }else{
                $('#build_tests_fix').html(response.build.fixed_regressions.value);
            }
        }

        if(response.build.criterias != null && response.build.criterias.length != 0){
            var buildCriterias = '';
            for(var i = 0; i < response.build.criterias.length; i++){
                buildCriterias += '<dt><i>'+response.build.criterias[i].name+'</i></dt>'+
                '<dd>'+response.build.criterias[i].value+'</dd>';
            }
            $('#build_criterias').html(buildCriterias);
        }else{
            $('#build_criterias').remove();
        }
        var show_detail_panel = false;
        if(response.build.infos != null && response.build.infos.length != 0){
            var buildInfos = '';
            for(var i = 0; i < response.build.infos.length; i++){
                buildInfos += '<dt>'+response.build.infos[i].name+'</dt>'+
                '<dd>'+response.build.infos[i].value+'</dd>';
            }
            $('#build_info').html(buildInfos);
            show_detail_panel = true;
        }else{
            $('#build_info').remove();
            $('#build_info_title').remove();
        }
        if(response.build.reports != null && response.build.reports.length != 0){
            var buildReports = '';
            for(var i = 0; i < response.build.reports.length; i++){
                buildReports += '<dt>'+response.build.reports[i].name+'</dt>'+
                '<dd>'+response.build.reports[i].value+'</dd>';
            }
            $('#build_reports').html(buildReports);
            show_detail_panel = true;
        }else{
            $('#build_reports').remove();
            $('#build_reports_title').remove();
        }
        if(response.build.build_timeline.rows.length != 0){
            for(var i = 0; i < response.build.build_timeline.rows.length; i++){
                response.build.build_timeline.rows[i].c[2].v = new Date(response.build.build_timeline.rows[i].c[2].v);
                response.build.build_timeline.rows[i].c[3].v = new Date(response.build.build_timeline.rows[i].c[3].v);
            }

            var container = document.getElementById('build_timeline');
            var chart = new google.visualization.Timeline(container);
            var dataTable = new google.visualization.DataTable(response.build.build_timeline);

            var options = {};

            chart.draw(dataTable, options);
        }else{
            $('#build_timeline_section').remove();
        }

        //If there are no commits we don't display the commit table.
        if(response.build.commits != 0){
            // load commits
            $('#commits').dataTable( {
                serverSide: true,
                searching: false,
                ajax: {
                    url: "/api/commits",
                    data: {build_id : data.build_id},
                    type: 'GET',
                    timeout: 15000,
                    error: function handleDataTableError( xhr, textStatus, error ) {
                        if ( textStatus === 'timeout' ) {
                            alert( 'The server took too long to send the data.' );
                        }
                        else {
                            alert( 'An error occurred on the server. Please try again in a minute.' );
                        }
                    }
                },
                columnDefs: [{
                        targets: 0,
                        type: "html",
                        render: function(value, type, row, meta){
                            if(value != null){
                                return '<a href="'+value+'">'+row[1]+'</a>';
                            }else{
                                return row[1];
                            }

                        }
                    },{
                        targets: 1,
                        render: function(value, type, row, meta){
                            return row[2];
                        }
                    },{
                        targets: 2,
                        render: function(value, type, row, meta){
                            return row[3];
                        }
                    },{
                        targets: 3,
                        visible: false
                    }
                ]
            });
            show_detail_panel = true;
        }else{
            $('#thumbnails').remove();
            $('#commits').remove();
        }

        if(show_detail_panel == false){
            $('#detail_panel').remove();
        }
    };

    var displayReports = function(response){
        var listHtml = '';
        //TODO If no results, display No Available message
        for(var i = 0; i < response.reports.length; i++){
            if(response.reports[i].lifecycle_status == 'pending'){
                listHtml += '<a href="/'+data.build_id+'/report/'+response.reports[i].id+'" class="list-group-item list-group-item-warning">';
            }else{
                listHtml += '<a href="/'+data.build_id+'/report/'+response.reports[i].id+'" class="list-group-item">';
            }
            listHtml += '		<div class="row" style="margin-bottom:10px">' +
            '			<div class="col-sm-12">' +
            '				<strong>'+response.reports[i].name +'</strong>'+
            '			</div>' +
            '			<div class="col-sm-2 col-sm-offset-2">';
            if(response.reports[i].tests == null || response.reports[i].tests.all == undefined){
                listHtml += '		<strong> Tests <span class="label label-info">0</span></strong>';
            }else{
                if(response.reports[i].tests.all.trend == 1){
                    listHtml += '		<strong> Tests <span>'+response.reports[i].tests.all.value+' <span class="glyphicon glyphicon-chevron-up"></span></span></strong>';
                }else if(response.reports[i].tests.all.trend == -1){
                    listHtml +=	'		<strong> Tests <span>'+response.reports[i].tests.all.value+' <span class="glyphicon glyphicon-chevron-down"></span></span></strong>';
                }else{
                    listHtml += '		<strong> Tests <span>'+response.reports[i].tests.all.value+'</span></strong>';
                }
            }
            listHtml += '			</div>' +
            '			<div class="col-sm-2">';
            if(response.reports[i].tests == null || response.reports[i].tests.passes == undefined){
                listHtml += '		<strong> Pass <span class="label label-info">0</span></strong>';
            }else{
                if(response.reports[i].tests.passes.trend == 1){
                    listHtml += '		<strong> Pass <span class="label label-success">'+response.reports[i].tests.passes.value+' <span class="glyphicon glyphicon-chevron-up"></span></span></strong>';
                }else if(response.reports[i].tests.passes.trend == -1){
                    listHtml +=	'		<strong> Pass <span class="label label-warning">'+response.reports[i].tests.passes.value+' <span class="glyphicon glyphicon-chevron-down"></span></span></strong>';
                }else{
                    listHtml += '		<strong> Pass <span>'+response.reports[i].tests.passes.value+'</span></strong>';
                }
            }
            listHtml += '			</div>' +
            '			<div class="col-sm-2">';
            if(response.reports[i].tests == null || response.reports[i].tests == null || response.reports[i].tests.all_regressions == null || response.reports[i].tests.rall_egressions.value == null){
                listHtml += '				<strong> Regressions <span class="label label-info">0</span></strong>';
            }else{
                listHtml += '				<strong> Regressions '+formatWithLabel(response.reports[i].tests.all_regressions.value, response.reports[i].tests.all_regressions.trend, 0, false)+'</strong>';
            }
            listHtml += '			</div>' +
            '			<div class="col-sm-2">';
            if(response.reports[i].tests == null || response.reports[i].tests.failures == null || response.reports[i].tests.failures.value == null){
                listHtml += '				<strong> Failures <span class="label label-info">0</span></strong>';
            }else{
                listHtml += '				<strong> Failures '+formatWithLabel(response.reports[i].tests.failures.value, response.reports[i].tests.failures.trend, 0, false)+'</strong>';
            }
            listHtml += '			</div>' +
            '			<div class="col-sm-2">';
            if(response.reports[i].tests == null || response.reports[i].tests.errors == null || response.reports[i].tests.errors.value == null){
                listHtml += '				<strong> Errors <span class="label label-info">0</span></strong>';
            }else{
                listHtml += '				<strong> Errors '+formatWithLabel(response.reports[i].tests.errors.value, response.reports[i].tests.errors.trend, 0, false)+'</strong>';
            }
            listHtml +=	'			</div>' +
            '		</div>' +
            '		<div class="list-group-item-text">';
            var description = response.reports[i].description == undefined ? '&nbsp;' : response.reports[i].description;
            listHtml +=	'  			'+description+'<div class="pull-right"> ';
            if(response.reports[i].status == undefined){
                listHtml +=	'			<span class="label label-info">Status not available</span>';
            }else if(response.reports[i].status == "completed"){
                listHtml +=	'			<span class="label label-success">'+response.reports[i].status+'</span>';
            }else{
                listHtml +=	'			<span class="label label-danger">'+response.reports[i].status+'</span>';
            }
            var updateTime = response.reports[i].end_date == undefined ? data.notAvailable : moment(response.reports[i].end_date).fromNow();
            listHtml +=	'  			'+updateTime+'</div>' +
            '		</div>' +
            '</a>';
        }

        $('#reports_list').html(listHtml);

    };

    var initGraph = function(response){
        // Add Show graphs
        var graphLink = '<option value="">None</option>';//'<ul class="nav nav-tabs" role="tablist">';
        for(var i = 0; i < response.criterias.length; i++){
            if(response.criterias[i].name == 'Tags'){
            //We don't display graphs based on tags values
                continue;
            }
            if(data.graph != null && replaceAll(" ", "_", response.criterias[i].name.toLowerCase()) == data.graph){
                graphLink += '<option id="graph_link_'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" value="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" selected="selected">'+response.criterias[i].name+'</li>';
            }else{
                graphLink += '<option id="graph_link_'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" value="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'">'+response.criterias[i].name+'</li>';
            }
        }
        //graphLink += '</ul>';
        $('#graphs_link').html(graphLink);

        //Display default status graph
        if(data.graph != null && data.graph != ''){
            var query = '?build_id='+data.build_id+'&graph='+data.graph;
            for(var j = 0; j < data.criteriasIds.length; j++){
                if($('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != null && $('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != ''){
                    query += "&"+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())+'='+$('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val();
                }
            }

            //Display Graphs
            $.getJSON('/api/tests/stat'+query, displayGraph)
                .error(handleError)
                .fail(handleFailure);
        }

        //Add event click to show graph
        $('#graphs_link').change(handleGraphClick);
    };

    var handleGraphClick = function(){

        data.graph = $('#graphs_link').val();
        if(data.graph == null || data.graph == ''){
            $('#graph-panel').html('');
            return;
        }
        var query = '?build_id='+data.build_id+'&graph='+data.graph;
        for(var j = 0; j < data.criteriasIds.length; j++){
            if($('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != null && $('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != ''){
                query += "&"+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())+'='+$('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val();
            }
        }
        //Display Graphs
        $.getJSON('/api/tests/stat'+query, displayGraph)
            .error(handleError)
            .fail(handleFailure);
    };

    var displayGraph = function(response){
        $('#graph-panel').html('<div class="col-md-6" id="graph" style="height: 300px"></div><div class="col-md-6" id="trend"></div>');
        var dataSource = [];
        dataSource[0] = [response.stat.name, "Count"]
        for(var j = 0; j < response.stat.values.length; j++){
            dataSource[j+1] = [response.stat.values[j].name, response.stat.values[j].value];
        }

        var data = google.visualization.arrayToDataTable(dataSource);
        var chartTitle = "Tests executed Per " + response.stat.name;
        var options = {
            title: chartTitle,
        };

        var chart = new google.visualization.PieChart(document.getElementById("graph"));
        chart.draw(data, options);

        displayTrend(response);
    };

    var displayTrend = function(response){

            var trendHtml = '<dl style="margin-top:20px" class="dl-horizontal">';
            for(var j = 0; j < response.stat.values.length; j++){
                trendHtml += '<dt>'+response.stat.values[j].name+'</dt>';
                trendHtml += '<dd>'+response.stat.values[j].value+'</dd>';
            }
            trendHtml += '</dl>';
            $('#trend').html(trendHtml);
        };

    return {
        build_id : config.build_id,
        init: function () {
            data = {
        		build_id: this.build_id,
        		notAvailable: '',
                criteriasIds: [],
                graph: ''
            };

    		initPage();

        }
    }

})(ServerConfig);
