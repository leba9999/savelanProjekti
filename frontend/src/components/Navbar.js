import { Link } from "react-router-dom";
import classes from "./Navbar.module.css";

const Navbar=()=> {

  return (
      <nav id={classes.navigation}>
          <Link className={classes.Link} to="/">
              Save LAN tracker
          </Link>
          <ul className={classes.list}>
              <li className={classes.item}>
                  <Link className={classes.Link} to="/">
                      Home
                  </Link>
              </li>
              <li className={classes.item}>
                  <Link  className={classes.Link} to="/data">
                      Data
                  </Link>
              </li>
              <li className={classes.item}>
                  <Link  className={classes.Link} to="/botfilter">
                      Bot BotFilter
                  </Link>
              </li>
        </ul>
      </nav>
  )
}

export default Navbar;
