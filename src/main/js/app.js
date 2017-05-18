'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const when = require('when');
const client = require('./client.js');

const follow = require('./follow');

const root = './api';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {workers: [], attributes: [], pageSize: 5, links: {}};
        this.updatePageSize = this.updatePageSize.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
    }

    loadFromServer(pageSize) {
        follow(client, root, [
            {rel: 'workers', params: {size: pageSize}}
        ]).then(workerCollection => {
            return client({
                method: 'GET',
                path: workerCollection.entity._links.profile.href,
                headers: {'Accept': 'application/schema+json'}
            }).then(schema => {
                this.schema = schema.entity;
                this.links = workerCollection.entity._links;
                return workerCollection;
            });
        }).then(workerCollection => {
            return workerCollection.entity._embedded.workers.map(worker =>
                client({
                    method: 'GET',
                    path: worker._links.self.href
                })
            );
        }).then(workerPromises => {
            return when.all(workerPromises);
        }).done(workers => {
            this.setState({
                workers: workers,
                attributes: Object.keys(this.schema.properties),
                pageSize: pageSize,
                links: this.links
            });
        });
    }

    onCreate(newWorker) {
        follow(client, root, ['workers']).then(workerCollection => {
            return client({
                method: 'POST',
                path: workerCollection.entity._links.self.href,
                entity: newWorker,
                headers: {'Content-Type': 'applictaion/json'}
            })
        }).then(response => {
            return follow(client, root, [
                {rel: 'workers', params: {'size': this.state.pageSize}}
            ]);
        }).done(response => {
            self.onNavigate(response.entity._links.last.href);
        });
    }

    onUpdate(worker, updatedWorker){
        client({
            method: 'PUT',
            path: worker.entity._links.self.href,
            entity: updatedWorker,
            headers: {
                'Content-Type': 'application/json',
                'If-Match': worker.headers.Etag
            }
        }).done(response => {
            this.loadFromServer(this.state.pageSize);
        }, response => {
            if(response.status.code === 412) {
                alert ('DENIED: Unable to update ' + worker.entity._links.self.href + '. Your copy is stale.');
            }
        });
    }

    onDelete(worker) {
        client({method: 'DELETE', path: worker.entity._links.self.href}).done(resonse => {
            this.loadFromServer(this.state.pageSize);
        });
    }

    onNavigate(navUri) {
        client({
            method: 'GET',
            path: navUri
        }).then(workerCollection => {
            this.links = workerCollection.entity._links;

            return workerCollection.entity._embedded.workers.map(worker =>
                client({
                    method: 'GET',
                    path: worker._links.self.href
                })
            );
        }).then(workerPromises => {
            return when.all(workerPromises);
        }).done(workers => {
            this.setState({
                workers: workers,
                attributes: Object.keys(this.schema.properties),
                pageSize: this.state.pageSize,
                links: this.links
            });
        });
    }

    updatePageSize(pageSize) {
        if (pageSize !== this.state.pageSize) {
            this.loadFromServer(pageSize);
        }
    }

    componentDidMount() {
        this.loadFromServer(this.state.pageSize);
    }

    render() {
        return (
            <div>
                <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
                <WorkerList workers={this.state.workers}
                            links={this.state.links}
                            pageSize={this.state.pageSize}
                            attributes={this.state.attributes}
                            onNavigate={this.onNavigate}
                            onUpdate={this.onUpdate}
                            onDelete={this.onDelete}
                            updatePageSize={this.updatePageSize}/>
            </div>
        )
    }
}

class CreateDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var newWorker = {};
        this.props.attributes.forEach(attribute => {
            newWorker[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onCreate(newWorker);

        //clear dialog inputs
        this.props.attributes.forEach(attribute => {
            ReactDOM.findDOMNode(this.refs[attribute]).value = '';
        });

        //navigate away from dialog to hid it
        window.location = '#';
    }

    render() {
        var inputs = this.props.attributes.map(attribute =>
            <p key={attribute}>
                <input type="text" placeholder={attribute} ref={attribute} className="field"/>
            </p>
        );

        return (
            <div>
                <a href="#createWorker">Create Worker</a>

                <div id="createWorker" className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>

                        <h2>Create new Worker</h2>

                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Create</button>
                        </form>
                    </div>
                </div>
            </div>

        )
    }
}

class UpdateDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var updatedWorker = {};
        this.props.attributes.forEach(attribute => {
            updatedWorker[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onUpdate(this.props.worker, updatedWorker);
        window.location = '#';
    }

    render() {
        var inputs = this.props.attributes.map(attribute =>
            <p key={this.props.worker.entity[attribute]}>
                <input type="text" placeholder={attribute}
                       defaultValue={this.props.worker.entity[attribute]}
                       ref={attribute} className="field"/>
            </p>
        );

        var dialogId = "updateWorker-" + this.props.worker.entity._links.self.href;

        return (
            <div key={this.props.worker.entity._links.self.href}>
                <a href={"#" + dialogId}>Update</a>
                <div id={dialogId} className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>

                        <h2>Update a Worker</h2>

                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Update</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}
;

class WorkerList extends React.Component {
    constructor(props) {
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
        e.preventDefault();
        var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
        if (/^[0-9]+$/.test(pageSize)) {
            this.props.updatePageSize(pageSize);
        } else {
            ReactDOM.findDOMNode(this.refs.pageSize).value =
                pageSize.substring(0, pageSize.length - 1);
        }
    }

    handleNavFirst(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.last.href);
    }

    render() {
        var workers = this.props.workers.map(worker =>
            <Worker key={worker.entity._links.self.href} worker={worker}
                    attributes={this.props.attributes} onUpdate={this.props.onUpdate}
                    onDelete={this.props.onDelete}/>
        );

        var navLinks = [];
        if ("first" in this.props.links) {
            navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
        }
        if ("prev" in this.props.links) {
            navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
        }
        if ("next" in this.props.links) {
            navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
        }
        if ("last" in this.props.links) {
            navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
        }

        return (
            <div>
                <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
                <table>
                    <tbody>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Role</th>
                        <th></th>
                        <th></th>
                    </tr>
                    {workers}
                    </tbody>
                </table>
                <div>
                    {navLinks}
                </div>
            </div>
        )
    }
}

class Worker extends React.Component {
    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.onDelete(this.props.worker);
    }

    render() {
        return (
            <tr>
                <td>{this.props.worker.entity.firstName}</td>
                <td>{this.props.worker.entity.lastName}</td>
                <td>{this.props.worker.entity.role}</td>
                <td>
                    <UpdateDialog worker={this.props.worker} attributes={this.props.attributes}
                                  onUpdate={this.props.onUpdate}/>
                </td>
                <td>
                    <button onClick={this.handleDelete}>Delete</button>
                </td>
            </tr>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
)