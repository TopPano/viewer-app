TOPPANO.ModelState = function() {
    /**
     * Describe the model state sice last modified.
     * It's a list of key-value pairs which key is an object's html id,
     * value is the object's properties represented by JSON.
     */
    this.currentState = {};

    /**
     * Describe the difference between current and modified state.
     * It's a list of key-value pairs which key is an object's html id,
     * value is formatted as: {
     *     'meta': { 'isNew': boolean, 'type': 'object type', 'action': ACTION_TYPE },
     *     'prop': // object's properties represented by JSON
     * }
     */
    this.diffState = {};

    /* Action type for modifying an object. */
    this.Action = {
        CREATE: 0,
        UPDATE: 1,
        DELETE: 2
    };
};

TOPPANO.ModelState.prototype = {
    constructor: TOPPANO.ModelState,

    // Add an object to current state.
    addObjProp: function(id, prop) {
        this.currentState[id] = prop;
    },

    // Get an object's property.
    getObjProp: function(id) {
        return this.currentState[id];
    },

    // Get an list of object properties whose ids have common pattern.
    getObjPropList: function(pattern) {
        var list = {};

        $.each(this.currentState, function(id, prop) {
            if(id.indexOf(pattern) > -1) {
                list[id] = prop;
            }
        });
        return list;
    },

    // Delete an object's property.
    delObjProp: function(id) {
        delete this.currentState[id];
    },

    // Modify the state. (Create/update/delete an object)
    modifyState: function(id, type, action, prop) {
        var diffState = this.diffState;

        if(type === 'summary' && action === this.Action.UPDATE) {
            if(!(id in diffState)) {
                diffState[id] = {
                    'meta': {'isNew': false, 'type': type, 'action': action },
                    'prop': {}
                };
            }
            $.each(prop, function(key, value) {
                diffState[id]['prop'][key] = value;
            });
        }

        if($('#toolbar-main-save').is(':disabled')) {
            $('#toolbar-main-save').prop('disabled', false);
        }
    },

    // Upload the state difference to server and merge into current state.
    commit: function() {
        var baseUrl = TOPPANO.gv.apiUrl;
        var modelId = TOPPANO.gv.modelID;

        $.each(this.diffState, function(id, value) {
            if(value['meta']['type'] === 'summary') {
                $.ajax({
                    url: baseUrl + '/modelmeta/' + modelId,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(value['prop']),
                    success: function(response) {
                        $('#toolbar-main-save').prop('disabled', true);
                    }
                });
            }
        });

    }
};

