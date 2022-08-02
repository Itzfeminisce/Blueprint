class Blueprint {
  #attributes = {};
  #_id = null;

  /** Applicable middleware cache*/
  #hidden = [];
  #dependencies = [];

  /** Modifiable class methods */
  #_dependenciesMethods = ["read", "readAll", "create", "update", "delete"];

  constructor() {
    /** Useful for getting callee name. also used for database operations */
    Object.defineProperty(this, "name", {
      value: this.constructor.name.toLowerCase() + "s",
    });

    /** Registers all middleware methods */
    this.#registerHiddenFields();
    this.#registerDependencies();
    this.#populateDependenciesMethods();
  }

  #registerHiddenFields() {
    if ("hidden" in this && typeof this.hidden === "function") {
      console.log(this.hidden())
      if (["string", "array"].includes(ClassHelper.type()(this.hidden()))) {
        this.#hidden.concat(this.hidden());
      } else {
        throw (
          "Invalid return type detected. Expected string or array, received " +
          ClassHelper.type()(this.hidden())
        );
      }
    }
  }

  #registerDependencies() {
    if ("dependencies" in this && typeof this.dependencies === "function") {
      if (
        ["string", "array"].includes(ClassHelper.type()(this.dependencies()))
      ) {
        this.#dependencies.concat(this.dependencies());
      } else {
        throw (
          "Invalid return type detected. Expected string or array, received " +
          ClassHelper.type()(this.dependencies())
        );
      }
    }
  }

  createDependencies() {
    if (this.#dependencies && this.#dependencies.length > 0) {
      this.#dependencies.forEach((dependency) => {
        const Dependency = require("./" + dependency);
        this[dependency.toLowerCase()] = new Dependency();
        //  console.log(Dependency)
      });
    }
  }

  #applyGetterAttributes(applicables) {
    return new Promise((resolve, reject) => {
      if (!ClassHelper.returnsPromise(applicables)) {
        applicables.then((results) => {
          resolve(this.#getterAttrFn.call(this, results));
        });
      } else {
        //Todo: create a promise Handler for getAttribute[,Name] functions
        console.warn("Promise handler was not found");
        return applicables;
      }
    });
  }

  #applySetterAttributes(applicables) {
    return this.#setterAttrFn(applicables);
  }

  #filtrates(attrs) {
    if (ClassHelper.type()(attrs) === "array") {
      return attrs.filter((attr) => {
        return this.#hidden.filter((filter) => {
          let e = Object.keys(attr).includes(filter);
          if (e) delete attr[filter];
          return true;
        });
      });
    }

    this.#hidden.forEach((filter) => {
      let e = Object.keys(attrs).includes(filter);
      if (e) delete attrs[filter];
    });
    return attrs;
  }

  #getterAttrFn(attrs) {
    attrs = this.#filtrates(attrs);
    if (ClassHelper.type()(attrs) === "array") {
      return attrs.map((_attr) => {
        for (const key in _attr) {
          let value = _attr[key];
          const getAttrFn = this["getAttribute" + ClassHelper.ucfirst(key)];
          this.attributes[key] = value;
          if (typeof getAttrFn === "function") {
            _attr[key] = getAttrFn.call(this);
          } else {
            _attr[key] = value;
          }
        }
        return _attr;
      });
    } else {
      return applyAttrFn.call(this, attrs);
    }

    function applyAttrFn(attr) {
      for (const key in attr) {
        let value = attr[key];
        const getAttrFn = this["getAttribute" + ClassHelper.ucfirst(key)];
        if (typeof getAttrFn === "function") {
          this.attributes[key] = value;
          this.attributes[key] = getAttrFn.call(this);
        } else {
          this.attributes[key] = value;
        }
      }
      return this.attributes;
    }
  }

  #setterAttrFn(attributes) {
    for (const attribute in attributes) {
      if (Object.hasOwnProperty.call(attributes, attribute)) {
        const value = attributes[attribute];
        const setAttrFn = this["setAttribute" + ClassHelper.ucfirst(attribute)];
        if (typeof setAttrFn === "function") {
          this.attributes[attribute] = value;
          this.attributes[attribute] = setAttrFn.call(this);
        } else {
          this.attributes[attribute] = value;
        }
      }
    }
    return this.attributes;
  }

  get attributes() {
    return this.#attributes;
  }

  #getAllMethodNames(obj, depth = Infinity) {
    const methods = new Set();
    while (depth-- && obj) {
      for (const key of Reflect.ownKeys(obj)) {
        methods.add(key);
      }
      obj = Reflect.getPrototypeOf(obj);
    }
    return [...methods];
  }

  set id(val) {
    this.#_id = val;
  }

  get id() {
    return this.#_id;
  }

  withId(id) {
    // console.log(this.read);
    this.id = id ?? this.id ?? null;
    // console.log()
    console.log("Reading ID: " + id, " from ", this.name);
    return this;
  }

  get #dependenciesMethods() {
    return this.#_dependenciesMethods;
  }

  #populateDependenciesMethods() {
    let applicable;
    const methods = this.#dependenciesMethods;
    methods.forEach((method) => {
      if (typeof this[method] === "function") {
        let fn = this[method];

        this[method] = function () {
          if (arguments.length > 0) {
            let [arg1, ...args] = Array.from(arguments);
            switch (ClassHelper.type()(arg1)) {
              /** in cases of read{id, ...args}, update(id, ...args), delete(id, ...args) */
              case "number":
              case "string":
                this.id = arg1;
                args = this.#applySetterAttributes(args.at(0));
                applicable = fn.apply(this, [arg1, args]);
            //    console.log(applicable)
                // code
                break;

              /** in cases of create({}) */
              case "object":
                //               this.id = this.id ?? null;
                arg1 = this.#applySetterAttributes(arg1);
              //  args = this.#applySetterAttributes(args);
                args = this.#applySetterAttributes(args);

                applicable = fn.apply(this, [arg1, args]);
                break;

              default:
                console.error(
                  "Argument 1 is of invalid type. Expected Number, detected " +
                    ClassHelper.type()(arg1)
                );
            }
          } else {
            applicable = fn.apply(this, [this.id, Array.from(arguments)]);
          }

      //    console.log("applicable", applicable)
          switch (method) {
            case "delete":
//              return applicable;
    //          break;

            case "create":
            case "update":
              return applicable;
              break;

            default:
              return this.#applyGetterAttributes(applicable);
          }
        };
      }
    });
  }
}

class ClassHelper {
  static getMethodBody(fn) {
    const entire = fn.toString();
    return entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
  }

  static #isPromise(fn) {
    return typeof fn === "object" && typeof fn.then === "function"
      ? true
      : false;
  }
  static returnsPromise(fn) {
    return fn.constructor.name === "AsyncFunction" ||
      (typeof fn === "function" && ClassHelper.#isPromise(fn))
      ? true
      : false;
  }
  static ucfirst(str) {
    if (ClassHelper.type()(str) == "string") {
      return str.charAt(0).toUpperCase() + str.substring(1, str.length);
    }
  }
  static type(obj) {
    return (function (global) {
      var cache = {};
      return function (obj) {
        var key;
        return obj === null
          ? "null" // null
          : obj === global
          ? "global" // window in browser or global in nodejs
          : (key = typeof obj) !== "object"
          ? key // basic: string, boolean, number, undefined, function
          : obj.nodeType
          ? "object" // DOM element
          : cache[(key = {}.toString.call(obj))] || // cached. date, regexp, error, object, array, math
            (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
      };
    })(this);
  }
}

module.exports = Blueprint;
