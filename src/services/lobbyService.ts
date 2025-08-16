// src/services/lobbyService.ts
import type { GameRoom } from '../screens/lobbyPage/types/lobby.types';

const STORAGE_KEY = 'bc_lobby_rooms_v1';

// a tiny random id
const rid = () => Math.random().toString(36).slice(2, 10);

// seed with a few rooms if none exist
function seedIfEmpty() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return;

  const now = Date.now();
  const initial: GameRoom[] = [
    {
      id: rid(),
      host: 'Cem',
      mode: 'blind', // adjust to your union type if different
      entryFee: 50,
      players: 1,
      maxPlayers: 2,
      createdAt: now,
    } as unknown as GameRoom,
    {
      id: rid(),
      host: 'Aylin',
      mode: 'robochaos',
      entryFee: 100,
      players: 2,
      maxPlayers: 2,
      createdAt: now,
    } as unknown as GameRoom,
    {
      id: rid(),
      host: 'Kaan',
      mode: 'blind',
      entryFee: 25,
      players: 1,
      maxPlayers: 2,
      createdAt: now,
    } as unknown as GameRoom,
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
}

function loadRoomsFromStorage(): GameRoom[] {
  seedIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    const arr = (raw ? JSON.parse(raw) : []) as GameRoom[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveRooms(rooms: GameRoom[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

async function getRooms(): Promise<GameRoom[]> {
  // simulate slight “activity” so the lobby feels alive
  const rooms = loadRoomsFromStorage().map((r) => {
    // randomly toggle a player join/leave (but respect bounds)
    if (Math.random() < 0.2) {
      const delta = Math.random() < 0.5 ? -1 : 1;
      const next = Math.min(
        Math.max((r.players ?? 0) + delta, 0),
        r.maxPlayers ?? 2
      );
      return { ...r, players: next } as GameRoom;
    }
    return r;
  });

  saveRooms(rooms);

  // mimic network
  await new Promise((res) => setTimeout(res, 150));
  return rooms;
}

type CreateRoomConfig = Partial<GameRoom> & {
  host?: string;
  mode?: string; // tighten according to your type
  entryFee?: number;
  maxPlayers?: number;
};

async function createRoom(config: CreateRoomConfig): Promise<string> {
  const rooms = loadRoomsFromStorage();
  const id = rid();

  const room: GameRoom = {
    id,
    host: config.host ?? 'You',
    mode: (config.mode ?? 'blind') as any,
    entryFee: config.entryFee ?? 0,
    players: 1,
    maxPlayers: config.maxPlayers ?? 2,
    createdAt: Date.now(),
    // spread any extra fields your GameRoom type expects
    ...(config as any),
  };

  rooms.unshift(room);
  saveRooms(rooms);

  await new Promise((res) => setTimeout(res, 120));
  return id;
}

async function joinRoom(roomId: string): Promise<void> {
  const rooms = loadRoomsFromStorage();
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx === -1) throw new Error('Room not found');

  const room = rooms[idx];
  if ((room.players ?? 0) >= (room.maxPlayers ?? 2)) {
    throw new Error('Room is full');
  }

  rooms[idx] = { ...room, players: (room.players ?? 0) + 1 } as GameRoom;
  saveRooms(rooms);

  await new Promise((res) => setTimeout(res, 120));
}

export const lobbyService = {
  getRooms,
  createRoom,
  joinRoom,
};
