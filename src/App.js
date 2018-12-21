import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
  withRouter
} from "react-router-dom";
import { Kinvey } from "kinvey-html5-sdk";
import logo from "./logo-1.png";
////////////////////////////////////////////////////////////
// 1. Click the public page
// 2. Click the protected page
// 3. Log in
// 4. Click the back button, note the URL each time

class App extends React.Component {
  componentWillMount() {
    console.log("here");
    Kinvey.init({
      appKey: "kid_BJPyqs9xE",
      appSecret: "a1977f080bca483ab83103d0d950c536"
    });
  }
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/" component={Protected} />
          </Switch>
        </div>
      </Router>
    );
  }
}

const fakeAuth = {
  authenticate(cb) {
    this.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    this.isAuthenticated = false;
    setTimeout(cb, 100);
  }
};

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        Kinvey.User.getActiveUser() != null ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}

function Public() {
  return (
    <Redirect
      to={{
        pathname: "/home"
        //state: { from: props.location }
      }}
    />
  );
}

const Protected = withRouter(({ history }) => {
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <Link className="navbar-brand" to="/home">
            Home
          </Link>

          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav mr-auto" />
            <button
              onClick={() => {
                console.log(history);
                Kinvey.User.logout()
                  .then(() => {
                    history.push("/login");
                  })
                  .catch();
              }}
            >
              Sign out
            </button>
          </div>
        </nav>
        <div className="container">
          <Route path="/" component={Products} />
        </div>
      </div>
    </Router>
  );
});

class Products extends React.Component {
  addItem() {
    var that = this;
    var promise = that.trialsStore
      .save({
        name: "Cannabis",
        amount: 100000
      })
      .then(function onSuccess(entity) {
        alert("saved");
      })
      .catch(function onError(error) {
        console.log(error);
      });
  }
  componentWillMount() {
    console.log("here");
    this.addItem = this.addItem.bind(this);

    var obs = this.trialsStore.find().subscribe(data => {
      console.log(data);
      this.setState({ products: data });
    });
  }
  constructor(props) {
    super(props);
    this.state = { products: [{ _id: 1 }] };
    this.trialsStore = Kinvey.DataStore.collection("trials");
  }
  render() {
    return (
      <div>
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={this.addItem}>
          Add
        </button>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {this.state.products.map((prop, key) => {
              return (
                <tr key={key} scope="row">
                  <td style={{ width: 220 }}>{prop._id}</td>
                  <td style={{ width: 400 }}>{prop.name}</td>
                  <td>{prop.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

class Login extends React.Component {
  state = { redirectToReferrer: false, title: "Kinvey" };

  login = () => {
    console.log(Kinvey);
    Kinvey.User.login("ignacio", "ignacio")
      .then(() => {
        console.log("in!");
        this.setState({ redirectToReferrer: true });
      })
      .catch(ee => {
        console.log(ee);
      });
  };

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/home" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer) return <Redirect to={from} />;

    return (
      <div className="my-form container-fluid px-0">
        <div className="row no-gutters">
          <div className="col-md-12 text-center d-flex-column align-items-center justify-content-center">
            <div className="form-signin">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 class="h3 mb-5 font-weight-normal">{this.state.title}</h1>

              <h1 className="h3 mb-5 font-weight-normal" />
              <label for="inputEmail" className="sr-only">
                Email address
              </label>
              <input
                name="username"
                type="string"
                id="inputEmail"
                className="form-control"
                placeholder="User"
                required
                autofocus
              />
              <label for="inputPassword" className="sr-only">
                Password
              </label>
              <input
                name="password"
                type="password"
                id="inputPassword"
                className="form-control"
                placeholder="Password"
                required
              />
              <button
                onClick={this.login}
                className="my-button btn btn-lg btn-block"
                type="submit"
              >
                Kinvey Mobile ID
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
