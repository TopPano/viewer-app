TOPPANO.ModelState = function() {
    var _this = this;

    /**
     * Describe the model state since last saving.
     * It's a list of key-value pairs which key is an object's html id,
     * value is the object's properties represented by JSON.
     */
    var currentState = {};

    /**
     * Describe the difference between current and modified state.
     * It's a list of key-value pairs which key is an object's html id,
     * value is formatted as: {
     *     'meta': { 'type': 'object type', 'action': ACTION_TYPE },
     *     'prop': // object's properties represented by JSON
     * }
     */
    var diffState = {};

    /* Action type for modifying an object. */
    TOPPANO.ModelState.prototype.Action = {
        CREATE: 'POST',
        UPDATE: 'PUT',
        DELETE: 'DELETE'
    };

/* Public methods */

    // Add an object to current state.
    TOPPANO.ModelState.prototype.addObjProp = function(id, prop) {
        currentState[id] = prop;
    };

    // Get an object's property.
    TOPPANO.ModelState.prototype.getObjProp = function(id) {
        return currentState[id];
    };

    // Get an list of object properties whose ids have common pattern.
    TOPPANO.ModelState.prototype.getObjPropList = function(pattern) {
        var list = {};

        $.each(currentState, function(id, prop) {
            if(id.indexOf(pattern) > -1) {
                list[id] = prop;
            }
        });
        return list;
    };

    // Delete an object's property.
    TOPPANO.ModelState.prototype.delObjProp = function(id) {
        delete currentState[id];
    };

    // Modify the state. (Create/update/delete an object)
    TOPPANO.ModelState.prototype.modifyState = function(id, type, action, prop) {
        switch(type + action) {
            case 'snapshot' + _this.Action.CREATE:
                diffState[id] = {
                    'meta': { 'type': type, 'action': action},
                    'prop': prop
                };
                break;
            case 'summary' + _this.Action.UPDATE:
            case 'node' + _this.Action.UPDATE:
            case 'snapshot' + _this.Action.UPDATE:
                if(!(id in diffState)) {
                    // Copy properties in currentState of the modified object.
                    diffState[id] = {
                        'meta': { 'type': type, 'action': action },
                        'prop': $.extend(true, {}, currentState[id])
                    };
                }
                $.each(prop, function(key, value) {
                    diffState[id]['prop'][key] = value;
                });
                break;
            case 'node' + _this.Action.DELETE:
                diffState[id] = {
                    'meta': { 'type': type, 'action': action }
                };
                break;
            case 'snapshot' + _this.Action.DELETE:
                if((id in diffState) && (diffState[id]['meta']['action'] === _this.Action.CREATE)) {
                    // Delete a newly created object, just remove it from diffState.
                    delete diffState[id];
                } else {
                    diffState[id] = {
                        'meta': { 'type': type, 'action': action }
                    };
                }
                break;
            default:
                break;
        }

        switchButtons();
    };

    // Upload the state difference to server and merge into current state.
    TOPPANO.ModelState.prototype.commit = function() {
        var baseUrl = TOPPANO.gv.apiUrl;
        var modelId = TOPPANO.gv.modelID;

        $.each(diffState, function(id, value) {
            var type = value['meta']['type'];
            var action = value['meta']['action'];

            switch(type + action) {
                case 'summary' + _this.Action.UPDATE:
                    synchronize(id, type, action, baseUrl + '/modelmeta/' + modelId, value['prop']);
                    break;
                case 'node' + _this.Action.UPDATE:
                    var nodeId = id.replace('node-', '');
                    synchronize(id, type, action, baseUrl + '/modelmeta/' + modelId + '/nodes/' + nodeId, value['prop']);
                    break;
                case 'node' + _this.Action.DELETE:
                    var nodeId = id.replace('node-', '');
                    synchronize(id, type, action, baseUrl + '/modelmeta/' + modelId + '/nodes/' + nodeId);
                    break;
                case 'snapshot' + _this.Action.CREATE:
                    var data = new FormData();
                    var prop = value['prop'];
                    var image = base64toBlob(prop['url']);

                    delete prop['url'];
                    data.append('image', image);
                    $.each(prop, function(key, value) {
                        data.append(key, value);
                    });
                    synchronize(id, type, action, baseUrl + '/modelmeta/' + modelId + '/snapshots', data);
                    break;
                case 'snapshot' + _this.Action.UPDATE:
                    var snapshotId = id.replace('snapshot-', '');
                    synchronize(id, type, action, baseUrl + '/modelmeta/' + modelId + '/snapshots/' + snapshotId, value['prop']);
                    break;
                case 'snapshot' + _this.Action.DELETE:
                    var snapshotId = id.replace('snapshot-', '');
                    synchronize(id, type, action, baseUrl + '/modelmeta/' + modelId + '/snapshots/' + snapshotId);
                    break;
                default:
                    break;
            }
        });
    };

    // Canceling the modification since last saving.
    TOPPANO.ModelState.prototype.cancel = function() {
        $.each(diffState, function(id, value) {
            var type = value['meta']['type'];
            var action = value['meta']['action'];

            switch(type + action) {
                case 'summary' + _this.Action.UPDATE:
                    TOPPANO.fillSummaryContent(id, currentState[id]);
                    break;
                case 'node' + _this.Action.UPDATE:
                    TOPPANO.fillNodeContent(id, currentState[id]);
                    break;
                case 'node' + _this.Action.DELETE:
                    // TODO: It should fall back to the original position before it is deleted.
                    TOPPANO.createNode(id, currentState[id]);
                    break;
                case 'snapshot' + _this.Action.CREATE:
                    TOPPANO.removeSnapshot(id);
                    break;
                case 'snapshot' + _this.Action.UPDATE:
                    TOPPANO.fillSnapshotContent(id, currentState[id]);
                    break;
                case 'snapshot' + _this.Action.DELETE:
                    // TODO: It should fall back to the original position before it is deleted.
                    TOPPANO.createSnapshot(id, currentState[id]);
                    break;
                default:
                    break;
            }
            delete diffState[id];
        });

        switchButtons();
    }
/* Private methods */

    // API server call and merge diffState into currentState.
    var synchronize = function(id, type, action, url, data) {
        switch(action) {
            case _this.Action.CREATE:
                // Use multipart/form-data for POST.
                $.ajax({
                    url: url,
                    type: action,
                    contentType: false,
                    processData: false,
                    data: data
                }).done(function(response) {
                    var newId = type + '-' + response['sid'];

                    delete diffState[id];
                    currentState[newId] = response;
                    TOPPANO.resetSnapshotId(id, newId, response);
                    switchButtons();
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    // TODO: Error handling.
                });
                break;
            case _this.Action.UPDATE:
                $.ajax({
                    url: url,
                    type: action,
                    contentType: 'application/json',
                    data: JSON.stringify(data)
                }).done(function(response, textStatus, jqXHR) {
                    $.each(data, function(key, value) {
                        currentState[id][key] = value;
                    });
                    delete diffState[id];
                    switchButtons();
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    // TODO: Error handling.
                });
                break;
            case _this.Action.DELETE:
                $.ajax({
                    url: url,
                    type: action
                }).done(function(response, textStatus, jqXHR) {
                    delete currentState[id];
                    delete diffState[id];
                    switchButtons();
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    // TODO: Error handling.
                });
                break;
            default:
                break;
        }
    };

    // Enable/Disable the save and cancel button.
    var switchButtons = function() {
        if($.isEmptyObject(diffState)) {
            $('#toolbar-main-cancel').prop('disabled', true);
            $('#toolbar-main-save').prop('disabled', true);
        } else {
            $('#toolbar-main-cancel').prop('disabled', false);
            $('#toolbar-main-save').prop('disabled', false);
        }
    };

    // Convert a base64-encoded image to a Blob.
    var base64toBlob = function(dataUrl) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataUrl.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataUrl.split(',')[1]);
        } else {
            byteString = unescape(dataUrl.split(',')[1]);
        }

        // separate out the mime component
        var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    };
};

