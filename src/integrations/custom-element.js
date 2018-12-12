
/**
 * store: 
 */
export default store => class extends HTMLElement {
    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
    }
    

    connectedCallback() {
        console.log('connected called');
        this._slot = document.createElement('slot');
        this._slot.addEventListener('slotchange', () => {
            this.map();
        });
        this._root.appendChild(this._slot);
        this._unsubscribe = store.subscribe(state => {
            console.log(state);
            this.map(state);
        });
        this.map();
        if (this.actions) {
            debugger;
            this._slot.assignedElements().forEach(el => {
                Object.assign(el, this.actions);
            });
        }
    }

    map(state = store.getState()) {
        if (this.mapStateToProps) {
            const elements = this._slot.assignedElements();
            const props = this.mapStateToProps(state);
            elements.forEach(el => {
                Object.assign(el, props);
            });
        }

    }

    disconnectedCallback() {
        this._unsubscribe();
    }
}

/**
<up-unistore-provider [store={Unistore}]>
    <unistore-consumer [mapSateToProps] [mapActionsToProps] [props] [tag]></unistore-consumer>
</up-unistore-provider> 
*/