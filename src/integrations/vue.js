let Vue;
import { mapActions } from '../util';

export function install(_Vue) {
	if (Vue === _Vue) {
		throw Error('[unistore] already installed.');
	}
	Vue = _Vue;
	Vue.mixin({
		beforeCreate() {
			const options = this.$options;
			// store injection
			if (options.store) {
				this.$store = typeof options.store === 'function'
				  ? options.store()
				  : options.store;
			  }
			else if (options.parent && options.parent.$store) {
				this.$store = options.parent.$store;
			  }
		}
	});
}

function getAttrs(component) {
	return component._self.$options._parentVnode.data.attrs;
}

function getStates(component, mapStateToProps) {
	const store = component.$store;
	const attrs = {};

	return mapStateToProps(store.getState(), attrs) || {};
}


function getProps(component) {
	let props = {};
	const attrs = getAttrs(component);
	const stateNames = component.stateNames || [];
	const actionNames = component.actionNames || [];

	for (let ii = 0; ii < stateNames.length; ii++) {
	  props[stateNames[ii]] = component[stateNames[ii]];
	}

	for (let ii = 0; ii < actionNames.length; ii++) {
	  props[actionNames[ii]] = component[actionNames[ii]];
	}

	return {
	  ...props,
	  ...attrs
	};
}

export function connect(mapStateToProps, actions) {
	return children => Vue.extend({
		name: `connected-${children.name || 'children'}`,
		data() {
			const store = this.$store;
			const state = getStates(this, mapStateToProps);
			const stateNames = Object.keys(state);
			const boundActions = actions ? mapActions(actions, store) : { store };

			const actionNames = Object.keys(boundActions);

			return {
				...state,
				...boundActions,
				stateNames,
				actionNames
			};
		},
		created() {
			this.unistoreUnsubscribe = this.$store.subscribe(() => {
				const state = getStates(this, mapStateToProps);
				const stateNames = Object.keys(state);
				this.stateNames = stateNames;
				for (let ii = 0; ii < stateNames.length; ii++) {
					this[stateNames[ii]] = state[stateNames[ii]];
				}
			});
		},
		render(h) {
			const props = getProps(this);
			return h(children, { props });
		},
		beforeDestroy() {
			this.unistoreUnsubscribe();
		}
	});
}
