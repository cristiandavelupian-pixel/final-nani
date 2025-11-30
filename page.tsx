"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './component/Header';
import Inputs from './component/Inputs';
import Buttons from './component/Buttons';
import UserList from './component/List';

const API_URL = "http://localhost:3001/users";

type User = {
    id: number;
    name: string;
    highScore?: number;
};

export default function Home() {
  const [name, setName] = useState('');
  const [highScore, setHighScore] = useState('');
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setUserList(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error fetching data";
      setError(message);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (name.trim() === '') {
      setError("Please enter a name.");
      return;
    }

    const parsedScore = parseInt(highScore as string, 10);
    const sanitizedScore = Number.isFinite(parsedScore) ? parsedScore : 0;

    const newUser = {
      name: name.trim(),
      highScore: sanitizedScore,
    };

    try {
      await axios.post(API_URL, newUser);
      await fetchUsers(); 
      setName('');
      setHighScore('');
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save.";
      setError(message);
      console.error(error);
    }
  };

  const handleDelete = async (index: number) => {
    const idToDelete = userList[index].id;
    try {
      await axios.delete(`${API_URL}/${idToDelete}`);
      await fetchUsers();
    } catch (error) {
      alert("Failed to delete.");
    }
  };
    const handleEdit = async (index: number) => {
        const currentUser = userList[index];
        const idToEdit = currentUser.id; 
        
        const newName = prompt("Edit Name:", currentUser.name);
        const newHighScore = prompt("Edit HighScore:", currentUser.highScore?.toString() || "0");

        if (newName !== null && newHighScore !== null) {
          const parsed = parseInt(newHighScore, 10);
          const safeScore = Number.isFinite(parsed) ? parsed : 0;
          const updatedUser = { name: newName, highScore: safeScore };
            try {
                await axios.put(`${API_URL}/${idToEdit}`, updatedUser);
                fetchUsers();
            } catch (error) {
                alert("Failed to update.");
            }
        }
    }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl">
        <Header title="GameBoi!!" />

        <div className="gameboy-grid mt-6 mb-6">
          <div className="gameboy">
            <div className="gameboy-screen">
              <h3 className="drop-shadow-neon text-sm mb-3">Name</h3>
              <div className="screen-content">
                {loading ? (
                  <p className="text-center">Loading...</p>
                ) : userList.length === 0 ? (
                  <p className="text-center">No Players yet. Add one to get started!</p>
                ) : (
                  <UserList users={userList} onDelete={handleDelete} onEdit={handleEdit} displayType="name" />
                )}
              </div>
            </div>
            <div className="gameboy-controls">A</div>
          </div>

          <div className="gameboy">
            <div className="gameboy-screen">
              <h3 className="drop-shadow-neon text-sm mb-3">HighScore</h3>
              <div className="screen-content">
                {loading ? (
                  <p className="text-center">Loading...</p>
                ) : userList.length === 0 ? (
                  <p className="text-center">No Scores yet!</p>
                ) : (
                  <UserList users={userList} onDelete={handleDelete} onEdit={handleEdit} displayType="score" />
                )}
              </div>
            </div>
            <div className="gameboy-controls">B</div>
          </div>
        </div>

        <div className="gameboy gameboy-bottom">
          <div className="gameboy-screen">
            <h2 className="drop-shadow-neon text-sm mb-3">Add New Player</h2>
            <div className="screen-content">
              <Inputs name={name} highScore={highScore} setName={setName} setHighScore={setHighScore} />
              <div className="mt-4">
                <Buttons name="Submit" onClick={handleSubmit} />
              </div>
              {error && <p className="text-red-300 mt-3 text-center font-semibold">{error}</p>}
            </div>
          </div>
          <div className="gameboy-controls">START</div>
        </div>
      </div>
    </main>
  );
}