import React, { useState, useRef } from "react";
import Peer from "peerjs";

const CardGame = () => {
  const [section, setSection] = useState("menu"); // "menu", "create", "join", "game"
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const peerRef = useRef(null);
  const connRef = useRef(null);

  const createRoom = () => {
    if (roomId.trim()) {
      setIsHost(true);
      peerRef.current = new Peer(roomId, {
        host: "0.peerjs.com",
        port: 443,
        path: "/",
        secure: true,
      });

      peerRef.current.on("open", (id) => {
        setRoomId(id);
      });

      peerRef.current.on("connection", (conn) => {
        connRef.current = conn;
        setConnected(true);
        setSection("game");
        conn.on("data", (data) => {
          setMessages((prev) => [...prev, data]);
        });
      });

      setSection("game");
    }
  };

  const joinRoom = () => {
    if (!roomId) return;
    peerRef.current = new Peer({
      host: "0.peerjs.com",
      port: 443,
      path: "/",
      secure: true,
    });

    peerRef.current.on("open", () => {
      const conn = peerRef.current.connect(roomId);
      connRef.current = conn;
      conn.on("open", () => {
        setConnected(true);
        setSection("game");
      });
      conn.on("data", (data) => {
        setMessages((prev) => [...prev, data]);
      });
    });
  };

  const sendMessage = () => {
    if (connRef.current && message.trim()) {
      connRef.current.send(message);
      setMessages((prev) => [...prev, `Tú: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      {section === "menu" && (
        <div className="flex flex-col gap-4">
          <button onClick={() => setSection("create")} className="px-4 py-2 bg-blue-600 rounded">Crear Sala</button>
          <button onClick={() => setSection("join")} className="px-4 py-2 bg-green-600 rounded">Unirse a Sala</button>
        </div>
      )}

      {section === "create" && (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Ingresa una ID para la sala"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="px-2 py-1 text-black"
          />
          <button onClick={createRoom} className="px-4 py-2 bg-blue-600 rounded">Iniciar</button>
        </div>
      )}

      {section === "join" && (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="ID de Sala"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="px-2 py-1 text-black"
          />
          <button onClick={joinRoom} className="px-4 py-2 bg-green-600 rounded">Unirse</button>
        </div>
      )}

      {section === "game" && (
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="border border-gray-700 p-4 h-64 overflow-y-auto">
            {messages.map((msg, index) => (
              <p key={index} className="text-sm">{msg}</p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-2 py-1 text-black"
            />
            <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 rounded">Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardGame;