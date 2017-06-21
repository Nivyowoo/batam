var ReportPage = (function (config) {
    var data = {};

    var initPage = function(){
        // Initial fetch
        $.getJSON('/api/reports/'+data.report_id, displayReport)
            .error(handleError)
            .fail(handleFailure);
    };

    var createClipboard = function(){
        var client = new ZeroClipboard($("#copy-clipboard"));
        $('#copy-clipboard').tooltip();
        client.on('ready', function(event) {
            client.on('copy', function(event) {
                var query = '?graph='+data.graph;
                for(var j = 0; j < data.criteriasIds.length; j++){
                    if(data.criteriasIds[j] == 'Tags'){
                        var checkedTags = $("#search_tags input:checkbox:checked").map(function(){
                          return $(this).val();
                        }).get();
                        if(checkedTags != null && checkedTags.length != 0){
                            query += "&tags="+checkedTags;
                        }
                        continue;
                    }
                    if($('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != null && $('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != ''){
                        query += '&'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())+'='+$('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val();
                    }
                }
                var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')+"/"+data.build_id+"/report/"+data.report_id;
                event.clipboardData.setData('text/plain', full+query);
            });
            client.on('aftercopy', function(event) {
                $('.tooltip .tooltip-inner').text('Search URL Copied!');
            });
        });
    };

    var displayReport = function(response){
        var reportHeader = '';
        if(response.report.previous_id != null){
            reportHeader += '<a href="/'+response.report.build_previous_id+'/report/'+response.report.previous_id+'"><span class="glyphicon glyphicon-chevron-left"></span> Previous </a> ';
        }
        reportHeader += '<span style="padding-left:50px"><a data-toggle="collapse" data-parent="#accordion" href="#collapseOne"><strong>'+response.report.name+'</strong></a></span> ';
        if(response.report.next_id != null){
            reportHeader += '<span class="pull-right"><a href="/'+response.report.build_next_id+'/report/'+response.report.next_id+'"> Next <span class="glyphicon glyphicon-chevron-right"></span></a></span> ';
        }
        $('#report_header').html(reportHeader);
        if(response.report.lifecycle_status == 'pending'){
            $('#main_panel').addClass('panel-warning')
        }else{
            $('#main_panel').addClass('panel-default')
        }
        $('#report_name').html(response.report.name);
        var description = response.report.description == undefined ? data.notAvailable : response.report.description;
        $('#report_description').html(description);
        var date = response.report.date == undefined ? data.notAvailable : moment(response.report.date).format('MMM Do YYYY, h:mm:ss a');
        $('#report_date').html(date);
        var end_date = response.report.end_date == undefined ? data.notAvailable : moment(response.report.end_date).format('MMM Do YYYY, h:mm:ss a');
        $('#report_end_date').html(end_date);
        if(response.report.status != null){
            if(response.report.status == 'completed'){
                $('#report_status').html('<span class="label label-success">'+response.report.status+'</span>');
            }else{
                $('#report_status').html('<span class="label label-danger">'+response.report.status+'</span>');
            }
        }
        if(response.report.duration != null){
            $('#report_duration').html(formatWithLabel(response.report.duration.value, response.report.duration.trend, 600000, true));
        }

        if(response.report.logs != null){
            var logs = '';
            for(var i = 0; i < response.report.logs.length; i++){
                if(i != 0){
                    logs += ', ';
                }
                logs += response.report.logs[i];
            }
            $('#report_logs').html(logs);
        }

        if(response.report.tests != null && response.report.tests.regressions != null){
            $('#report_regressions').html(formatWithLabel(response.report.tests.regressions.value, response.report.tests.regressions.trend, 0, false));
        }

        if(response.report.tests != null && response.report.tests.new_regressions != null){
            $('#report_new_regressions').html(formatWithLabel(response.report.tests.new_regressions.value, response.report.tests.new_regressions.trend, 0, false));
        }

        if(response.report.tests != null && response.report.tests.passes != null){
            if(response.report.tests.passes.value == 0){
                $('#report_passes').html('<span class="label label-info">0</span>');
            }else{
                if(response.report.tests.passes.trend == -1){
                    $('#report_passes').html('<span class="label label-warning">'+response.report.tests.passes.value+' <span class="glyphicon glyphicon-chevron-down"></span></span>');
                }else if(response.report.tests.passes.trend == 1){
                    $('#report_passes').html('<span class="label label-success">'+response.report.tests.passes.value+' <span class="glyphicon glyphicon-chevron-up"></span></span>');
                }else{
                    $('#report_passes').html(response.report.tests.passes.value);
                }
            }
        }

        if(response.report.tests != null && response.report.tests.failures != null){
            $('#report_failures').html(formatWithLabel(response.report.tests.failures.value, response.report.tests.failures.trend, 0, false));
        }

        if(response.report.tests != null && response.report.tests.errors != null){
            $('#report_errors').html(formatWithLabel(response.report.tests.errors.value, response.report.tests.errors.trend, 0, false));
        }

        if(response.report.tests != null && response.report.tests.fixed_regressions != null){
            if(response.report.tests.fixed_regressions.value == 0){
                $('#report_fixed_regressions').html('<span class="label label-info">0</span>');
            }else{
                if(response.report.tests.fixed_regressions.trend == -1){
                    $('#report_fixed_regressions').html('<span class="label label-warning">'+response.report.tests.fixed_regressions.value+' <span class="glyphicon glyphicon-chevron-down"></span></span>');
                }else if(response.report.tests.fixed_regressions.trend == 1){
                    $('#report_fixed_regressions').html('<span class="label label-success">'+response.report.tests.fixed_regressions.value+' <span class="glyphicon glyphicon-chevron-up"></span></span>');
                }else{
                    $('#report_fixed_regressions').html(response.report.tests.fixed_regressions.value);
                }
            }
        }

        if(response.report.tests != null && response.report.tests.all != null){
            if(response.report.tests.all.trend == -1){
                $('#report_tests').html(response.report.tests.all.value+' <span class="glyphicon glyphicon-chevron-down"></span>');
            }else if(response.report.tests.all.trend == 1){
                $('#report_tests').html(response.report.tests.all.value+' <span class="glyphicon glyphicon-chevron-up"></span>');
            }else{
                $('#report_tests').html(response.report.tests.all.value);
            }
        }

        // Initialize search
        $.getJSON('/api/tests/criterias?report_id='+data.report_id+'&build_id='+data.build_id, displaySearch)
            .error(handleError)
            .fail(handleFailure);
    };

    var displaySearch = function(response){
        var queryParams = getUrlParams();
        if(queryParams['graph'] != null && queryParams['graph'] != ''){
            data.graph = queryParams['graph'];
        }

        var criteriasForm = '';
        var criteriasFormIndex = 0;
        for(var i = 0; i < response.criterias.length; i++){
            //Populate criteriasIds global variable
            data.criteriasIds[i] = response.criterias[i].name;

            if(response.criterias[i].name == 'Tags'){
                continue;
            }
            if(criteriasFormIndex % 2 == 0){
                criteriasForm += '<div class="form-group">' +
                '  <div class="row">' +
                '    <label for="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" class="col-sm-2 control-label">'+response.criterias[i].name+'</label>' +
                '    <div class="col-sm-3">' +
                '      <select class="form-control" id="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" name="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'">';
                criteriasForm += '        <option value="">Any</option>';
                for(var j = 0; j < response.criterias[i].values.length; j++){
                    if(response.criterias[i].values[j] == queryParams[replaceAll(" ", "_", response.criterias[i].name.toLowerCase())]){
                        criteriasForm += '        <option value="'+response.criterias[i].values[j]+'" selected>'+response.criterias[i].values[j]+'</option>';
                    }else{
                        criteriasForm += '        <option value="'+response.criterias[i].values[j]+'" >'+response.criterias[i].values[j]+'</option>';
                    }
                }
                criteriasForm += '      </select>' +
                '    </div>';
                if(criteriasFormIndex + 1 >= response.criterias.length - 1){
                    criteriasForm += '    <div class="col-sm-3">' +
                    '     </div>' +
                    '  </div>' +
                    '</div>';
                }
            }else{
                criteriasForm += '    <label for="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" class="col-sm-2 control-label">'+response.criterias[i].name+'</label>' +
                '    <div class="col-sm-3">' +
                '      <select class="form-control" id="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" name="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'">';
                criteriasForm += '        <option value="">Any</option>';
                for(var j = 0; j < response.criterias[i].values.length; j++){
                    if(response.criterias[i].values[j] == queryParams[replaceAll(" ", "_", response.criterias[i].name.toLowerCase())]){
                        criteriasForm += '        <option value="'+response.criterias[i].values[j]+'" selected>'+response.criterias[i].values[j]+'</option>';
                    }else{
                        criteriasForm += '        <option value="'+response.criterias[i].values[j]+'" >'+response.criterias[i].values[j]+'</option>';
                    }
                }
                criteriasForm += '      </select>' +
                '    </div>' +
                '  </div>' +
                '</div>';
            }
            criteriasFormIndex++;
        }
        //Add tags to search form
        for(var i = 0; i < response.criterias.length; i++){
            if(response.criterias[i].name != 'Tags'){
                continue;
            }
            criteriasForm += '<div class="form-group">' +
            '  <div class="row">' +
            '    <label for="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" class="col-sm-2 control-label">'+response.criterias[i].name+'</label>' +
            '    <div id="search_tags" class="col-sm-6">';
            for(var j = 0; j < response.criterias[i].values.length; j++){
                if(queryParams['tags'] != null && queryParams['tags'].indexOf( response.criterias[i].values[j]) != -1){
                    criteriasForm += '        <input type="checkbox" name="tags" value="'+response.criterias[i].values[j]+'" checked> '+response.criterias[i].values[j]+' ';
                }else{
                    criteriasForm += '        <input type="checkbox" name="tags" value="'+response.criterias[i].values[j]+'"> '+response.criterias[i].values[j]+' ';
                }
            }
            '    </div>' +
            '  </div>' +
            '</div>';
        }

        $('#tests_search_criterias').before(criteriasForm);

        //create Clipboard
        createClipboard();

        //Submit search button
        $('#tests_search').click(handleSearchClick);

        //Add show hide bar
        var showHideLinks = '';
        for(var i = 0; i < data.criteriasIds.length; i++){
            if(i != 0){
                showHideLinks += ' - ';
            }
            showHideLinks += '<a class="toggle-vis" onclick="event.preventDefault(); clickme('+(i+1)+', event)" data-column="'+(i+1)+'">'+data.criteriasIds[i]+'</a> ';
        }
        $('#show_hide_columns').after(showHideLinks);

        // Add Show graphs
        var graphLink = '<option value="">None</option>';
        for(var i = 0; i < data.criteriasIds.length; i++){
            if(data.criteriasIds[i] == 'Tags'){
                //We don't display graphs based on tags values
                continue;
            }
            if(data.graph != null && replaceAll(" ", "_", data.criteriasIds[i].toLowerCase()) == data.graph){
                graphLink += '<option id="graph_link_'+replaceAll(" ", "_", data.criteriasIds[i].toLowerCase())+'" value="'+replaceAll(" ", "_", data.criteriasIds[i].toLowerCase())+'" selected="selected">'+data.criteriasIds[i]+'</li>';
            }else{
                graphLink += '<option id="graph_link_'+replaceAll(" ", "_", data.criteriasIds[i].toLowerCase())+'" value="'+replaceAll(" ", "_", data.criteriasIds[i].toLowerCase())+'">'+data.criteriasIds[i]+'</li>';
            }
        }
        //graphLink += '</ul>';
        $('#graphs_link').html(graphLink);

        //Display default status graph
        if(data.graph != null && data.graph != ''){
            var query = '?build_id='+data.build_id+'&report_id='+data.report_id+'&graph='+data.graph;
            for(var j = 0; j < data.criteriasIds.length; j++){
                if(data.criteriasIds[j] == 'Tags'){
                    var checkedTags = $("#search_tags input:checkbox:checked").map(function(){
                      return $(this).val();
                    }).get();
                    if(checkedTags != null && checkedTags.length != 0){
                        query += "&tags="+checkedTags;
                    }
                    continue;
                }
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

        //Display Tests
        displayTable(data);
    };

    var handleGraphClick = function(){

        data.graph = $('#graphs_link').val();
        if(data.graph == null || data.graph == ''){
            $('#graph-panel').html('');
            return;
        }
        var query = '?build_id='+data.build_id+'&report_id='+data.report_id+'&graph='+data.graph;
        for(var j = 0; j < data.criteriasIds.length; j++){
            if(data.criteriasIds[j] == 'Tags'){
                var checkedTags = $("#search_tags input:checkbox:checked").map(function(){
                  return $(this).val();
                }).get();
                if(checkedTags != null && checkedTags.length != 0){
                    query += "&tags="+checkedTags;
                }
                continue;
            }
            if($('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != null && $('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != ''){
                query += "&"+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())+'='+$('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val();
            }
        }
        //Display Graphs
        $.getJSON('/api/tests/stat'+query, displayGraph)
            .error(handleError)
            .fail(handleFailure);
    };

    var handleSearchClick = function(){
        //Display graph
        if(data.graph != null && data.graph != ''){
            var query = '?build_id='+data.build_id+'&report_id='+data.report_id+'&graph='+data.graph;
            for(var j = 0; j < data.criteriasIds.length; j++){
                if(data.criteriasIds[j] == 'Tags'){
                    var checkedTags = $("#search_tags input:checkbox:checked").map(function(){
                      return $(this).val();
                    }).get();
                    if(checkedTags != null && checkedTags.length != 0){
                        query += "&tags="+checkedTags;
                    }
                    continue;
                }
                if($('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != null && $('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != ''){
                    query += "&"+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())+'='+$('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val();
                }
            }
            //Display Graphs
            $.getJSON('/api/tests/stat'+query, displayGraph)
                .error(handleError)
                .fail(handleFailure);
        }

        //Display tests
        //table.destroy();
        displayTable(data);
    };

    var displayTable = function(data){
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

    var clickme = function(dataColumn, e) {
        e.preventDefault();
        data.table = $('#tests').DataTable();
        //Fetch column.
        var column = data.table.column( dataColumn );
        //Set global visibility variable.
        data.visibleColumns[dataColumn - 1] = ! column.visible();
        // Toggle the visibility
        column.visible( ! column.visible() );
    };

    return {
        build_id: config.build_id,
        report_id: config.report_id,
        init: function () {
            data = {
        		build_id: this.build_id,
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
