import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import MarkAttendance from './components/MarkAttendance';
import MarkLeave from './components/MarkLeave';
import ViewAttendance from './components/ViewAttendance';
import EditProfile from './components/EditProfile';
import AdminDashboard from './components/AdminDashboard';
import ManageAttendance from './components/ManageAttendance';
import Reports from './components/Reports';
import LeaveApproval from './components/LeaveApproval';
import GradingSystem from './components/GradingSystem';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/register" component={RegisterPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/mark-attendance" component={MarkAttendance} />
        <Route path="/mark-leave" component={MarkLeave} />
        <Route path="/view-attendance" component={ViewAttendance} />
        <Route path="/edit-profile" component={EditProfile} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/manage-attendance" component={ManageAttendance} />
        <Route path="/reports" component={Reports} />
        <Route path="/leave-approval" component={LeaveApproval} />
        <Route path="/grading-system" component={GradingSystem} />
      </Switch>
    </Router>
  );
}

export default App;
