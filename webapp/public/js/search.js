var SearchPage = (function (config) {
    var data = {};

    var initPage = function(){
        // Initialize search
        $.getJSON('/api/tests/criterias?build_id='+data.build_id, displaySearch)
            .error(handleError)
            .fail(handleFailure);

        createClipboard();
    };

    var createClipboard = function(){
        var client = new ZeroClipboard($("#copy-clipboard"));
        $('#copy-clipboard').tooltip();
        client.on('ready', function(event) {
            client.on('copy', function(event) {
                var query = '?';
                var criteriasIndex = 0;
                for(var j = 0; j < data.criteriasIds.length; j++){
                    if(data.criteriasIds[j] == 'Tags'){
                        var checkedTags = $("#search_tags input:checkbox:checked").map(function(){
                          return $(this).val();
                        }).get();
                        if(checkedTags != null && checkedTags.length != 0){
                            if(criteriasIndex != 0){
                                query += '&';
                            }
                            query += "tags="+checkedTags;
                            criteriasIndex++;
                        }
                        continue;
                    }
                    if($('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != null && $('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val() != ''){
                        if(criteriasIndex != 0){
                            query += '&';
                        }
                        query += ''+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())+'='+$('#'+replaceAll(" ", "_", data.criteriasIds[j].toLowerCase())).val();
                        criteriasIndex++;
                    }
                }
                var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')+"/"+data.build_id+"/search";
                event.clipboardData.setData('text/plain', full+query);
            });
            client.on('aftercopy', function(event) {
                $('.tooltip .tooltip-inner').text('Search URL Copied!');
            });
        });
    };

    var displaySearch = function(response){
        var queryParams = getUrlParams();

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

        //Display Tests
        displayTable(data);
    };

    var handleSearchClick = function(){
        //Display tests
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
                for(var i = 4; i < data.criteriasIds.length; i++){
                    //i starts at 4 since we always want to display default columns Status, Regression and Time.
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
        build_id : config.build_id,
        init: function () {
            data = {
        		build_id: this.build_id,
                criteriasIds: [],
                table: null,
                visibleColumns: [true,true,true]
            }

    		initPage();

        }
    }

})(ServerConfig);
