import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CreatePoll from "@/pages/CreatePoll";
import VoteDetail from "@/pages/VoteDetail";
import MyPolls from "@/pages/MyPolls";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/vote/:id" element={<VoteDetail />} />
        <Route path="/my-polls" element={<MyPolls />} />
      </Routes>
    </Router>
  );
}
