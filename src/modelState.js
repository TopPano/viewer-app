TOPPANO.ModelState = function() {
    var _this = this;

    /**
     * Describe the model state sice last modified.
     * It's a list of key-value pairs which key is an object's html id,
     * value is the object's properties represented by JSON.
     */
    var currentState = {};

    /**
     * Describe the difference between current and modified state.
     * It's a list of key-value pairs which key is an object's html id,
     * value is formatted as: {
     *     'meta': { 'isNew': boolean, 'type': 'object type', 'action': ACTION_TYPE },
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
            case 'summary' + _this.Action.UPDATE:
            case 'node' + _this.Action.UPDATE:
                if(!(id in diffState)) {
                    diffState[id] = {
                        'meta': {'isNew': false, 'type': type, 'action': action },
                        'prop': {}
                    };
                }
                $.each(prop, function(key, value) {
                    diffState[id]['prop'][key] = value;
                });
                break;
            case 'node' + _this.Action.DELETE:
                diffState[id] = {
                    'meta': {'isNew': false, 'type': type, 'action': action }
                };
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
                    synchronize(id, action, baseUrl + '/modelmeta/' + modelId, value['prop']);
                    break;
                case 'node' + _this.Action.UPDATE:
                    var nodeId = id.replace('node-', '');
                    synchronize(id, action, baseUrl + '/modelmeta/' + modelId + '/nodes/' + nodeId, value['prop']);
                    break;
                case 'node' + _this.Action.DELETE:
                    var nodeId = id.replace('node-', '');
                    synchronize(id, action, baseUrl + '/modelmeta/' + modelId + '/nodes/' + nodeId);
                    break;
                default:
                    break;
            }
        });
    };

/* Private methods */

    // API server call and merge diffState into currentState.
    var synchronize = function(id, action, url, data) {
        if(action === _this.Action.UPDATE) {
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
        } else if(action === _this.Action.DELETE) {
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
        }
    };

    // Enable/Disable the save and cancel button.
    var switchButtons = function() {
        if($.isEmptyObject(diffState)) {
            $('#toolbar-main-save').prop('disabled', true);
        } else {
            $('#toolbar-main-save').prop('disabled', false);
        }
    };
};

