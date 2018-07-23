import createStore from '../..';
import {
	install,
	connect
} from '../../src/integrations/vue';

describe('Vue Bindings', () => {
	let Vue;
	beforeEach(() => {
		Vue = require('vue');
		jest.resetModules();
	});

	test('should pass a smoke test on fire.', () => {
		const app = new Vue({
			el: document.createElement('div'),
			render(h) {
				return h('h2', 'hey');
			}
		});
		expect(app.$el).toMatchSnapshot();
	});
	describe('Install', () => {
		test('should add $store on creates when a ', () => {
			install(Vue);
			const expected = 'expected';
			const store  = createStore({ expected });
			const app = new Vue({ store });

			expect(app).toHaveProperty('$store', store);
			expect(app.$store).toMatchSnapshot();
		});

		test('test should throw error if installed already', () => {
			expect(() => {
				install(Vue);
				install(Vue);
			}).toThrowError('already installed');
		});
	});

	describe('Connect',  () => {
		let store;
		let state;
		let Child;
		let actions;
		let app;

		beforeEach(() => {
			install(Vue);
			state = { expected: true };
			store = createStore(state);
			actions = store => ({
				toggleExpected: (state) => {
					store.setState({ expected: !state.expected });
				}
			});
			Child = connect(
				state => state,
				actions,
			)({
				props: {
					expected: Boolean,
					toggleExpected: Function
				},
				render(h) {
					return h('div', {}, [
						h('h1', this.expected),
						h('button', {
							on: {
								click: this.toggleExpected
							}
						})
					]);
				}
			});
			app = new Child({
				store,
				el: document.createElement('div'),
				render(h) {
					return h(Child);
				}
			});
		});
		test('should map state to props', async () => {

			expect(app.$el).toMatchSnapshot();
			store.setState({
				expected: false
			});
			await Promise.resolve();
			expect(app.$el).toMatchSnapshot();
		});

		test('should map actions to props', async () => {
			app.$el.querySelector('button').dispatchEvent(new Event('click'));
			await new Promise((r) => setTimeout(r, 100));
			expect(app.$el).toMatchSnapshot();
		});
	});
});
