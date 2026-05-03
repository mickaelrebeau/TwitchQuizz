import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { existsSync } from "fs";
import { env } from "./config/env";
import * as gameSession from "./game/gameSession";
import * as twitchClient from "./twitch/twitchClient";
import * as commands from "./twitch/commands";
import * as socketHandlers from "./socket/socketHandlers";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/twitch/status", (_req, res) => {
  res.json({
    channel: twitchClient.getChannel() ?? null,
    connected: twitchClient.isConfigured() && twitchClient.isConnected(),
  });
});

app.get("/api/game/setup", (_req, res) => {
  const setup = gameSession.getSetup();
  res.json({
    questionDurationMs: setup.questionDurationMs,
    numberOfQuestions: setup.numberOfQuestions,
  });
});

app.post("/api/game/setup", (req, res) => {
  const body = req.body as { questionDurationMs?: number; numberOfQuestions?: number };
  const questionDurationMs = typeof body?.questionDurationMs === "number" ? body.questionDurationMs : undefined;
  const numberOfQuestions = typeof body?.numberOfQuestions === "number" ? body.numberOfQuestions : undefined;
  if (questionDurationMs !== undefined || numberOfQuestions !== undefined) {
    gameSession.setSetup({ questionDurationMs, numberOfQuestions });
  }
  const setup = gameSession.getSetup();
  res.json({
    questionDurationMs: setup.questionDurationMs,
    numberOfQuestions: setup.numberOfQuestions,
  });
});

app.get("/api/game/state", (_req, res) => {
  const gameState = gameSession.getGameState();
  const hackState = gameSession.getHackState();
  res.json({
    gameState,
    currentQuestionIndex: gameSession.getCurrentQuestionIndex(),
    questionOpenedAt: hackState.puzzleOpenedAt,
    questionText: hackState.currentPuzzle?.prompt ?? null,
    totalQuestions: gameSession.getSessionNumberOfQuestions(),
    questionDurationMs:
      gameState === "playing"
        ? gameSession.getSessionQuestionDurationMs()
        : gameSession.getSetup().questionDurationMs,
    hackState,
  });
});

app.post("/api/game/start", (_req, res) => {
  gameSession.startSession();
  res.json({ ok: true, gameState: "playing" });
});

app.post("/api/game/next", (_req, res) => {
  gameSession.forceNextPuzzle();
  res.json({ ok: true });
});

app.post("/api/game/end", (_req, res) => {
  gameSession.endSession();
  res.json({ ok: true, gameState: "ended" });
});

const clientDistPath = env.CLIENT_DIST_PATH
  ? path.resolve(process.cwd(), env.CLIENT_DIST_PATH)
  : path.join(__dirname, "..", "..", "client", "dist");

if (existsSync(clientDistPath)) {
  console.log(`Serving client from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get("/", (_req, res) => {
    res.json({ ok: true, message: "Twitch Game Server" });
  });
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.CLIENT_ORIGIN },
});

socketHandlers.init(io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.on("error", (err: NodeJS.ErrnoException) => {
  console.error("Server error:", err.message);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use.`);
  }
  process.exit(1);
});

twitchClient.onMessage(commands.handleMessage);
twitchClient.onConnectionLost(() =>
  socketHandlers.emitConnectionDegraded("twitch_disconnected")
);

httpServer.listen(env.PORT, () => {
  const address = httpServer.address();
  const port = typeof address === "object" && address ? address.port : env.PORT;
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`CORS allowed origin: ${env.CLIENT_ORIGIN}`);
  console.log("Game: call POST /api/game/start to launch a session");

  if (twitchClient.isConfigured()) {
    twitchClient
      .connect()
      .then(() => {})
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        const lower = msg.toLowerCase();
        if (lower.includes("oauth") || lower.includes("token") || lower.includes("password") || lower.includes("login")) {
          console.error("Twitch connection error: authentication failed");
        } else {
          console.error("Twitch connection error:", msg);
        }
      });
  } else {
    console.warn(
      "Twitch: TWITCH_CHANNEL or TWITCH_OAUTH not set, skipping Twitch connection"
    );
  }
});
