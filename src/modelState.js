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

    // Delete an object's property.
    delObjProp: function(id) {
        delete this.currentState[id];
    },

    // Modify the state. (Create/update/delete an object)
    modifyState: function(id, type, action, prop) {
        // TODO: modify diffState.
    }
};

