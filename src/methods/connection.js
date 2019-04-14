/**
* Specifies the way two [Groups](Group) are connected.
*
* Connections can be made between groups using these built-in connection methods and within a group itself by calling the [Group](Group) connection method with itself as a target.
*
* To learn more about the formed connections between [Nodes](Node), [Groups](Group), and [Layers](Layer) please see [Connection](Connection_)
*
* @namespace connection
* @alias connection_method
*
* @example <caption>Connection between two Groups</caption>
* let A = new Group(4);
* let B = new Group(5);
*
* A.connect(B, methods.connection.ALL_TO_ALL); // specifying a method is optional
*
* @example <caption>Group connection with itself</caption>
* let A = new Group(4);
*
* A.connect(A, methods.connection.ALL_TO_ALL);
*/
var connection = {
  /**
   * @constant
   * @type {object}
   * @description Connects all nodes from <code>GroupX</code> to all nodes from <code>GroupY</code>
   * @description The default connection method when connecting nodes inside of a group
   * @default
   *
   * @example <caption>Connection between two Groups</caption>
   * let A = new Group(4);
   * let B = new Group(5);
   *
   * A.connect(B, methods.connection.ALL_TO_ALL); // specifying a method is optional
   */
  ALL_TO_ALL: {
    name: 'OUTPUT'
  },
  /**
   * @constant
   * @type {object}
   * @description Connects each node in <code>GroupX</code> to all nodes in the same group except itself
   * @default
   *
   * @example <caption>Connection between two Groups</caption>
   * let A = new Group(4);
   * let B = new Group(5);
   *
   * A.connect(B, methods.connection.ALL_TO_ELSE); // specifying a method is optional
   */
  ALL_TO_ELSE: {
    name: 'INPUT'
  },
  /**
   * @constant
   * @type {object}
   * @description Connects each node from <code>GroupX</code> to one node from <code>GroupY</code>
   * @description The default connection method between Groups
   * @default
   *
   * @example <caption>Connection between two Groups</caption>
   * let A = new Group(4);
   * let B = new Group(5);
   *
   * A.connect(B, methods.connection.ONE_TO_ONE); // specifying a method is optional
   */
  ONE_TO_ONE: {
    name: 'SELF'
  }
};

module.exports = connection;
