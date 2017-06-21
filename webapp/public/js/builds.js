var BuildsPage = (function (config) {
    var data = {};

    var initPage = function(){

        // Initialize search
        $.getJSON('/api/builds/criterias', displayBuildCriterias)
            .error(handleError)
            .fail(handleFailure);

        // Display project list
        displayList();

        createClipboard();
    };

    var displayList = function(){
        var queryParams = getUrlParams();
        var query = '/api/builds';
        for(var i = 0; i < queryParams.length; i++){
            if(i == 0){
                query += '?';
            }else{
                query += '&';
            }
            query += queryParams[i]+'='+queryParams[queryParams[i]];
        }
        $.getJSON(query, displayBuildList)
            .error(handleError)
            .fail(handleFailure);
    };

    var createClipboard = function(){
        var client = new ZeroClipboard($("#copy-clipboard"));
        $('#copy-clipboard').tooltip();
        client.on('ready', function(event) {
            client.on('copy', function(event) {
                var query = '?lifecycle_status='+$('#lifecycle_status').is(':checked');

                for(var i = 0; i < data.criteriasIds.length; i++){
                    if($('#'+data.criteriasIds[i]).val() != null && $('#'+data.criteriasIds[i]).val() != ''){
                        query += '&'+data.criteriasIds[i]+'='+replaceAll(" ", "_", $('#'+data.criteriasIds[i]).val().toLowerCase());
                    }
                }
                var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
                event.clipboardData.setData('text/plain', full+query);
            });
            client.on('aftercopy', function(event) {
                $('.tooltip .tooltip-inner').text('Search URL Copied!');
            });
        });
    };

    var displayBuildCriterias = function(response){
        //If There are no criterias, we remove the form entirely
        var queryParams = getUrlParams();
        if('true' == queryParams['lifecycle_status']){
            $('#lifecycle_status').attr("checked", true);
        }else{
            $('#lifecycle_status').attr("checked", false)
        }
        var criteriasForm = '';
        for(var i = 0; i < response.criterias.length; i++){
            data.criteriasIds[i] = replaceAll(" ", "_", response.criterias[i].name.toLowerCase());
            if(i % 2 == 0){
                criteriasForm += '<div class="form-group">' +
                '  <div class="row">' +
                '    <label for="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" class="col-sm-2 control-label">'+response.criterias[i].name+'</label>' +
                '    <div class="col-sm-3">' +
                '      <select class="form-control" id="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" name="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'">';
                criteriasForm += '        <option value="">Any</option>';
                for(var j = 0; j < response.criterias[i].values.length; j++){
                    if(replaceAll(" ", "_", response.criterias[i].values[j].toLowerCase()) == queryParams[replaceAll(" ", "_", response.criterias[i].name.toLowerCase())]){
                        criteriasForm += '        <option value="'+response.criterias[i].values[j]+'" selected>'+response.criterias[i].values[j]+'</option>';
                    }else{
                        criteriasForm += '        <option value="'+response.criterias[i].values[j]+'">'+response.criterias[i].values[j]+'</option>';
                    }
                }
                criteriasForm += '      </select>' +
                '    </div>';
                if(i + 1 >= response.criterias.length){
                    criteriasForm += '    <div class="col-sm-3">' +
                    '     </div>'
                    '  </div>' +
                    '</div>';
                }
            }else{
                criteriasForm += '    <label for="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" class="col-sm-2 control-label">'+response.criterias[i].name+'</label>' +
                '    <div class="col-sm-3">' +
                '      <select class="form-control" id="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'" name="'+replaceAll(" ", "_", response.criterias[i].name.toLowerCase())+'">';
                criteriasForm += '        <option value="">Any</option>';
                for(var j = 0; j < response.criterias[i].values.length; j++){
                    if(replaceAll(" ", "_", response.criterias[i].values[j].toLowerCase()) == queryParams[replaceAll(" ", "_", response.criterias[i].name.toLowerCase())]){
                        criteriasForm += '        <option value="'+response.criterias[i].values[j]+'" selected>'+response.criterias[i].values[j]+'</option>';
                    }else{
                        criteriasForm += '        <option value="'+response.criterias[i].values[j]+'">'+response.criterias[i].values[j]+'</option>';
                    }
                }
                criteriasForm += '      </select>' +
                '    </div>' +
                '  </div>' +
                '</div>';
            }
        }
        $('#builds_search_criterias').before(criteriasForm);
        //Add action to submit button
        $('#builds_search').click(handleSearchClick);

    };

    var handleSearchClick = function(){
        var query = '?lifecycle_status='+$('#lifecycle_status').is(':checked');

        for(var i = 0; i < data.criteriasIds.length; i++){
            if($('#'+data.criteriasIds[i]).val() != null && $('#'+data.criteriasIds[i]).val() != ''){
                query += '&'+data.criteriasIds[i]+'='+replaceAll(" ", "_", $('#'+data.criteriasIds[i]).val().toLowerCase());
            }
        }

        $.getJSON('/api/builds'+query, displayBuildList)
            .error(handleError)
            .fail(handleFailure);
    };

    var createRestLink = function(){
        var query = '?lifecycle_status='+$('#lifecycle_status').is(':checked');

        for(var i = 0; i < data.criteriasIds.length; i++){
            if($('#'+data.criteriasIds[i]).val() != null && $('#'+data.criteriasIds[i]).val() != ''){
                query += '&'+data.criteriasIds[i]+'='+replaceAll(" ", "_", $('#'+data.criteriasIds[i]).val().toLowerCase());
            }
        }

        $('#build_list_link').attr('href', '/api/builds'+query);
    };

    // Function display build list
    var displayBuildList = function(response){
        $('#builds_count').html(response.builds.length);
        //If There are no criterias, we remove the form entirely
        if(response.builds.length == 0){
            //TODO diplay no build available. Redirect to documentation.
            return;
        }

        var buildList = '';
        for(var i = 0; i < response.builds.length; i++){
            if(response.builds[i].lifecycle_status == 'pending'){
                buildList += '<a href="/'+response.builds[i].id+'" class="list-group-item list-group-item-warning">';
            }else{
                buildList += '<a href="/'+response.builds[i].id+'" class="list-group-item">';
            }
            buildList += '  <div class="row" style="margin-bottom:10px">' +
                '    <div class="col-md-12">' +
                '      <h4>'+response.builds[i].name+'</h4>' +
                '    </div>' +
                '    <div class="col-sm-2 col-sm-offset-4">';
            if(response.builds[i].tests == undefined){
                buildList += '		<strong> Tests <span class="label label-info">0</span></strong>';
            }else{
                buildList += '		<strong> Tests '+response.builds[i].tests.value;
                if(response.builds[i].tests.trend == 1){
                    buildList +=	'						<span class="glyphicon glyphicon-chevron-up"></span>';
                }else if(response.builds[i].tests.trend == -1){
                    buildList +=	'						<span class="glyphicon glyphicon-chevron-down"></span>';
                }
                buildList +=	'					</span></strong>';
            }
            buildList += '    </div>' +
                '    <div class="col-sm-2">';
            if(response.builds[i].passes == undefined){
                buildList += '		<strong> Pass <span class="label label-info">0</span></strong>';
            }else{
                if(response.builds[i].tests.trend == 1){
                    buildList += '		<strong> Pass <span class="label label-success">'+response.builds[i].passes.value+' <span class="glyphicon glyphicon-chevron-up"></span></span></strong>';
                }else if(response.builds[i].tests.trend == -1){
                    buildList +=	'		<strong> Pass <span class="label label-warning">'+response.builds[i].passes.value+' <span class="glyphicon glyphicon-chevron-down"></span></span></strong>';
                }else{
                    buildList += '		<strong> Pass '+response.builds[i].passes.value+'</strong>';
                }
            }
            buildList += '    </div>' +
                '    <div class="col-sm-2">';
            if(response.builds[i].failures == undefined){
                buildList += '		<strong> Failures <span class="label label-info">0</span></strong>';
            }else{
                buildList += '		<strong> Failures '+formatWithLabel(response.builds[i].failures.value, response.builds[i].failures.trend, 0, false)+'</strong>';
            }
            buildList += '    </div>' +
                '    <div class="col-sm-2">';
            if(response.builds[i].errors == undefined){
                buildList += '		<strong> Errors <span class="label label-info">0</span></strong>';
            }else{
                buildList += '		<strong> Errors '+formatWithLabel(response.builds[i].errors.value, response.builds[i].errors.trend, 0, false)+'</strong>';
            }
            var description = response.builds[i].description == undefined ? '&nbsp;' : response.builds[i].description;
            var updateTime = response.builds[i].end_date == undefined ? data.notAvailable : moment(response.builds[i].end_date).fromNow();
            buildList += '    </div>' +
                '    </div>' +
            '    <div class="list-group-item-text">'+description+'<div class="pull-right">Last update : '+updateTime+'</div></div></a>';
        }

        $('#builds_list').empty();
        $('#builds_list').html(buildList);

        createRestLink();
    };

    return {
        init: function () {
            data = {
                notAvailable: ' ',
                criteriasIds: []
            };

            initPage();
        }
    }

})(ServerConfig);
