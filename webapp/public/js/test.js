var TestPage = (function (config) {
    var data = {};

    var initPage = function(){

        // Initial fetch
        $.getJSON('/api/tests/'+data.test_id, displayTest)
            .error(handleError)
            .fail(handleFailure);

        //Display tests history
        $('#history').DataTable({
            "serverSide": true,
            "ajax": {
                "url": "/api/tests/"+data.test_id+"/history"
            },
            "columnDefs": [{
                "targets": 0,
                "visible": false
            },
            {
                "targets": 1,
                "visible": false
            },
            {
                "targets": 2,
                "visible": false
            },
            {
                "targets": 3,
                "name": "Execution Date",
                "title": "Execution Date",
                "type": "html",
                "render": function ( data, type, full, meta ) {
                    return '<a href="/'+full[0]+'/report/'+full[1]+'/test/'+full[2]+'">'+moment(data).format('MMM Do YYYY, h:mm:ss a')+'</a>';
                }
            },
            {
                "targets": 4,
                "name": "Duration",
                "title": "Duration",
                "render": function ( data, type, full, meta ) {
                    return formatTime(data);
                }
            },
            {
                "targets": 5,
                "name": "Status",
                "title": "Status",
                "render": function ( data, type, full, meta ) {
                    return formatStatus(data);
                }
            },],
            "searching": false,
            "ordering": false,
            "lengthChange": false,
            "pageLength": 25
        });
    };

    var displayTest = function(response){
        if(isNullOrUndefined(response.test)){
            response.test = {};
        }
        $('#header_name').html(response.test.name);
        $('#test_name').html(response.test.name);
        $('#test_description').html(response.test.description);
        var start_date = response.test.start_date == undefined ? data.notAvailable : moment(response.test.start_date).format('MMM Do YYYY, h:mm:ss a');
        $('#test_start_date').html(start_date);
        var end_date = response.test.end_date == undefined ? data.notAvailable : moment(response.test.end_date).format('MMM Do YYYY, h:mm:ss a');
        $('#test_end_date').html(end_date);
        if(response.test.status != null){
            $('#test_status').html(formatStatus(response.test.status));
        }
        var time = response.test.time == undefined ? data.notAvailable : formatTime(response.test.time);
        $('#test_time').html(time);
        var regression = response.test.regression == undefined ? data.notAvailable : formatRegression(response.test.status, response.test.regression);
        $('#test_regression').html(regression);
        var tags = response.test.tags == undefined ? data.notAvailable : response.test.tags;
        $('#test_tags').html("<strong>Tags:</strong> "+tags);

        var dynamicFields = '';
        for(var field in response.test){
            console.log(field);
            if(field != '_id' &&
                    field != 'description' &&
                    field != 'report_id' &&
                    field != 'name' &&
                    field != 'start_date' &&
                    field != 'end_date' &&
                    field != 'status' &&
                    field != 'time' &&
                    field != 'regression' &&
                    field != 'log'&&
                    field != 'steps' &&
                    field != 'tags'){
                if(field == 'duration'){
                    var formattedDuration = formatWithLabel(response.test[field].value, response.test[field].trend, 1000, true);
                    dynamicFields += '<dt>'+field+'</dt>'+
                    '<dd>'+(formattedDuration == null ? data.notAvailable : formattedDuration)+'</dd>';
                }else if(field == 'previous_id' || field == 'next_id' || field == 'build_id'){
                    //Do nothing. Don't display those.
                }else{
                    dynamicFields += '<dt>'+field+'</dt>'+
                    '<dd>'+response.test[field]+'</dd>';
                }
            }
        }
        $('#dynamic_fields').html(dynamicFields);
        if(response.test.log == null){
            $('#test_log').html("Not logs available.");
        }else{
            $('#test_log').html(response.test.log);
        }

        if(response.test.steps == null || response.test.steps.length == 0){
            $('#steps').remove();
        }else{
            var stepsTable = '';
            var errorModals = '';
            for(var i = 0; i < response.test.steps.length; i++){
                if(response.test.steps[i].status != null && response.test.steps[i].status.toLowerCase() == 'pass'){
                    stepsTable += '<tr class="success">';
                }else if(response.test.steps[i].status != null && (response.test.steps[i].status.toLowerCase() == 'fail' || response.test.steps[i].status.toLowerCase() == 'error')){
                    stepsTable += '<tr class="danger">';
                }else{
                    stepsTable += '<tr">';
                }
                stepsTable += '<td>'+(response.test.steps[i].order == null ? '' : response.test.steps[i].order)+'</td>';
                stepsTable += '<td>'+(response.test.steps[i].name == null ? '' : response.test.steps[i].name)+'</td>';
                stepsTable += '<td>'+formatStepsVariables(response.test.steps[i].input == null ? '' : response.test.steps[i].input)+'</td>';
                stepsTable += '<td>'+formatStepsVariables(response.test.steps[i].expected == null ? '' : response.test.steps[i].expected)+'</td>';
                stepsTable += '<td>'+formatStepsVariables(response.test.steps[i].output == null ? '' : response.test.steps[i].output)+'</td>';
                stepsTable += '<td>'+(response.test.steps[i].status == null ? '' : response.test.steps[i].status)+'</td>';
                if(response.test.steps[i].start_date != null && response.test.steps[i].end_date != null &&
                        _.isNumber(parseInt(response.test.steps[i].start_date)) && _.isNumber(parseInt(response.test.steps[i].end_date)) &&
                        _.isDate(new Date(parseInt(response.test.steps[i].start_date))) && _.isDate(new Date(response.test.steps[i].end_date)) &&
                        response.test.steps[i].start_date <= response.test.steps[i].end_date){
                    stepsTable += '<td>'+durationToStr(response.test.steps[i].end_date - response.test.steps[i].start_date)+'</td>';
                }else{
                    stepsTable += '<td></td>';
                }
                if(response.test.steps[i].error != null){
                    var errorModalButton = '<a href="#"data-toggle="modal" data-target="#error_modal_'+response.test.steps[i].order+'">Details</a>'
                    errorModals +=
                    '<div id="error_modal_'+response.test.steps[i].order+'" class="modal fade" role="dialog">'+
                    '  <div class="modal-dialog">'+
                    '    <div class="modal-content">'+
                    '      <div class="modal-header">'+
                    '        <button type="button" class="close" data-dismiss="modal">&times;</button>'+
                    '        <h4 class="modal-title">Error details</h4>'+
                    '      </div>'+
                    '      <div class="modal-body">'+
                    '        <p>'+response.test.steps[i].error+'</p>'+
                    '      </div>'+
                    '      <div class="modal-footer">'+
                    '        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                    '     </div>'+
                    '    </div>'+
                    '  </div>'+
                    '</div>';
                    stepsTable += '<td>'+errorModalButton+'</td>';
                }else{
                    stepsTable += '<td></td>';
                }
                stepsTable += '</tr>';
            }
            $('#steps_table').html(stepsTable);
            $('#steps_modals').html(errorModals);
        }
    };

    var formatStepObject = function(value, result) {
        $.each(value, function(vKey, vValue) {
            if ($.type(vValue) === "object") {
                result += '<label style="text-decoration:underline;font-size:14px;"><b>' + vKey + '</b></label>';
                result += '<br/>';
                result = formatStepObject(vValue, result);
                result += '<br/>';
            } else {
                result += '<label style="font-size:12px;"><b>' + vKey + '</b></label>';
                result += ' : ' + vValue + '<br/>';
            }
        });
        return result;
    };

    var formatStepsVariables = function(input) {
        try {
            var obj = JSON.parse(input);

            var result = '';
            if (_.isNull(obj) || _.isUndefined(obj)) {
                result = 'Data is not valid. Please correct the data string.';
                return result;
            }

            var i = 0;
            $.each(obj, function (index, value) {
                if ($.type(value) === "object") {
                    result = formatStepObject(value, result);
                    if(i++ != 0) {
                        result += '<br/><br/>';
                    }
                } else if($.type(value) === "string" || $.type(value) === "number") {
                    result += '<label style="font-size:14px;"><b>' + index + '</b></label>';
                    result += ' : ' + value + '<br/>';
                }
            });
        } catch(exception) {
            result = input;
        }
        return result;
    };

    return {
        test_id : config.test_id,
        init: function () {
            data = {
        		test_id: this.test_id,
        		notAvailable: ''
            }

    		initPage();

        }
    }

})(ServerConfig);
